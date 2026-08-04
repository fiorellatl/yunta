-- ============================================================
-- Yunta · esquema inicial
--
-- El objeto principal es la CAMPAÑA: una causa con una meta.
-- La rifa es su mecanismo, y los premios son el incentivo.
-- Toda invariante de dinero o unicidad vive acá, no en TypeScript.
-- ============================================================

create extension if not exists pgcrypto with schema extensions;

create type campaign_format as enum ('raffle', 'pollada', 'bingo', 'donation', 'presale');
create type campaign_status as enum ('draft', 'published', 'closed', 'drawn', 'cancelled');
create type cover_source    as enum ('typographic', 'photo', 'ai');
create type number_status   as enum ('available', 'reserved', 'sold');
create type order_status    as enum ('pending_payment', 'in_review', 'approved', 'rejected', 'expired', 'cancelled');
create type draw_method     as enum ('verifiable_random', 'manual');

-- ── Perfiles ────────────────────────────────────────────────
create table profiles (
  id          uuid primary key references auth.users on delete cascade,
  full_name   text,
  phone       text,
  avatar_url  text,
  is_verified boolean not null default false,
  created_at  timestamptz not null default now()
);

create function handle_new_user() returns trigger
language plpgsql security definer set search_path = public, extensions as $$
begin
  insert into profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ── Campañas ────────────────────────────────────────────────
create table campaigns (
  id                      uuid primary key default gen_random_uuid(),
  owner_id                uuid not null references profiles on delete cascade,
  slug                    text not null unique,
  format                  campaign_format not null default 'raffle',

  -- La causa: el corazón de la campaña
  goal_title              text not null,
  story                   text,
  goal_amount             numeric(12,2) check (goal_amount is null or goal_amount > 0),

  -- La portada. Sin foto se usa la tipográfica, que nunca falla.
  cover_source            cover_source not null default 'typographic',
  cover_url               text,
  cover_palette           smallint not null default 0,

  -- El mecanismo
  currency                text not null default 'PEN',
  price_per_number        numeric(10,2) not null check (price_per_number > 0),
  total_numbers           int not null check (total_numbers between 2 and 2000),
  number_start            int not null default 1,
  max_per_order           int not null default 20 check (max_per_order > 0),
  draw_date               timestamptz,

  status                  campaign_status not null default 'draft',

  -- Cobro directo del organizador
  yape_phone              text,
  plin_phone              text,
  account_holder_name     text,
  payment_qr_url          text,

  reservation_ttl_minutes int not null default 30,
  seed                    text,  -- se revela al sortear
  seed_hash               text,  -- se publica al publicar la campaña
  terms_accepted_at       timestamptz,
  published_at            timestamptz,
  drawn_at                timestamptz,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

create index campaigns_owner_idx on campaigns (owner_id, created_at desc);

-- ── Premios ─────────────────────────────────────────────────
-- Una campaña puede tener uno o muchos. La posición ordena el podio.
create table prizes (
  id          uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns on delete cascade,
  position    int not null check (position > 0),
  name        text not null,
  image_url   text,
  created_at  timestamptz not null default now(),
  unique (campaign_id, position)
);

create index prizes_campaign_idx on prizes (campaign_id, position);

-- ── Órdenes ─────────────────────────────────────────────────
create table orders (
  id                uuid primary key default gen_random_uuid(),
  campaign_id       uuid not null references campaigns on delete cascade,
  public_token      uuid not null unique default gen_random_uuid(),
  short_code        text not null,
  buyer_name        text not null,
  buyer_phone       text not null,
  buyer_email       text,
  quantity          int not null check (quantity > 0),
  unit_price        numeric(10,2) not null,
  total_amount      numeric(10,2) not null,
  status            order_status not null default 'pending_payment',
  payment_method    text,
  payment_reference text,
  proof_path        text,
  proof_uploaded_at timestamptz,
  reviewed_by       uuid references profiles,
  reviewed_at       timestamptz,
  rejection_reason  text,
  expires_at        timestamptz,
  created_at        timestamptz not null default now()
);

create index orders_campaign_idx on orders (campaign_id, status, created_at desc);
create unique index orders_short_code_idx on orders (campaign_id, short_code);

-- ── Números ─────────────────────────────────────────────────
create table campaign_numbers (
  id             uuid primary key default gen_random_uuid(),
  campaign_id    uuid not null references campaigns on delete cascade,
  number         int not null,
  status         number_status not null default 'available',
  order_id       uuid references orders on delete set null,
  reserved_until timestamptz,
  unique (campaign_id, number)
);

create index campaign_numbers_lookup_idx on campaign_numbers (campaign_id, status);
create index campaign_numbers_order_idx on campaign_numbers (order_id);

-- ── Sorteo ──────────────────────────────────────────────────
-- Un sorteo por campaña (semilla y sal compartidas)…
create table draws (
  id          uuid primary key default gen_random_uuid(),
  campaign_id uuid not null unique references campaigns on delete cascade,
  method      draw_method not null default 'verifiable_random',
  seed        text not null,
  public_salt text not null,
  proof       jsonb,
  executed_at timestamptz not null default now()
);

-- …y un resultado por premio.
create table draw_results (
  id               uuid primary key default gen_random_uuid(),
  draw_id          uuid not null references draws on delete cascade,
  campaign_id      uuid not null references campaigns on delete cascade,
  prize_id         uuid not null references prizes on delete cascade,
  position         int not null,
  winning_number   int not null,
  winning_order_id uuid references orders,
  unique (campaign_id, prize_id),
  unique (campaign_id, winning_number)
);

create index draw_results_campaign_idx on draw_results (campaign_id, position);

-- ── Bitácora ────────────────────────────────────────────────
create table activity_log (
  id          uuid primary key default gen_random_uuid(),
  campaign_id uuid references campaigns on delete cascade,
  actor_id    uuid references profiles,
  action      text not null,
  payload     jsonb,
  created_at  timestamptz not null default now()
);

-- ============================================================
-- Funciones de negocio
-- ============================================================

-- Publica la campaña: genera los números y sella la semilla del sorteo.
create function publish_campaign(p_campaign_id uuid) returns campaigns
language plpgsql security definer set search_path = public, extensions as $$
declare
  v_campaign campaigns;
  v_premios  int;
  v_seed     text := encode(gen_random_bytes(32), 'hex');
begin
  select * into v_campaign from campaigns
   where id = p_campaign_id and owner_id = auth.uid()
   for update;

  if not found then raise exception 'Campaña no encontrada' using errcode = 'P0002'; end if;
  if v_campaign.status <> 'draft' then raise exception 'La campaña ya fue publicada'; end if;
  if v_campaign.terms_accepted_at is null then raise exception 'Falta aceptar los términos'; end if;

  select count(*) into v_premios from prizes where campaign_id = p_campaign_id;
  if v_premios = 0 then raise exception 'Agrega al menos un premio'; end if;

  insert into campaign_numbers (campaign_id, number)
  select p_campaign_id, g
  from generate_series(
    v_campaign.number_start,
    v_campaign.number_start + v_campaign.total_numbers - 1
  ) as g;

  update campaigns set
    status = 'published',
    seed = v_seed,
    seed_hash = encode(digest(v_seed, 'sha256'), 'hex'),
    published_at = now(),
    updated_at = now()
  where id = p_campaign_id
  returning * into v_campaign;

  insert into activity_log (campaign_id, actor_id, action)
  values (p_campaign_id, auth.uid(), 'campaign.published');

  return v_campaign;
end;
$$;

-- Libera reservas vencidas. La llama pg_cron y también reserve_numbers.
create function expire_reservations(p_campaign_id uuid default null)
returns int language plpgsql security definer set search_path = public, extensions as $$
declare v_count int;
begin
  with vencidas as (
    select id from orders
     where status = 'pending_payment'
       and expires_at < now()
       and (p_campaign_id is null or campaign_id = p_campaign_id)
     for update skip locked
  )
  update orders set status = 'expired'
   where id in (select id from vencidas);

  get diagnostics v_count = row_count;

  update campaign_numbers cn set status = 'available', order_id = null, reserved_until = null
    from orders o
   where cn.order_id = o.id and o.status = 'expired' and cn.status = 'reserved';

  return v_count;
end;
$$;

-- Reserva números de forma atómica. Es el corazón del sistema.
create function reserve_numbers(
  p_campaign_id uuid,
  p_numbers     int[],
  p_buyer_name  text,
  p_buyer_phone text,
  p_buyer_email text default null
) returns orders
language plpgsql security definer set search_path = public, extensions as $$
declare
  v_campaign   campaigns;
  v_order      orders;
  v_bloqueados int;
  v_pedidos    int := array_length(p_numbers, 1);
  v_ocupados   int[];
begin
  if v_pedidos is null or v_pedidos = 0 then
    raise exception 'Elige al menos un número';
  end if;

  select * into v_campaign from campaigns where id = p_campaign_id;
  if not found or v_campaign.status <> 'published' then
    raise exception 'Esta campaña no está recibiendo compras';
  end if;
  if v_pedidos > v_campaign.max_per_order then
    raise exception 'Puedes llevar hasta % números por compra', v_campaign.max_per_order;
  end if;

  perform expire_reservations(p_campaign_id);

  -- Toma solo los que siguen libres; los ocupados quedan fuera del lock.
  select count(*) into v_bloqueados from (
    select id from campaign_numbers
     where campaign_id = p_campaign_id
       and number = any(p_numbers)
       and status = 'available'
     for update skip locked
  ) libres;

  if v_bloqueados <> v_pedidos then
    select array_agg(number order by number) into v_ocupados
      from campaign_numbers
     where campaign_id = p_campaign_id and number = any(p_numbers) and status <> 'available';
    raise exception 'Estos números ya no están libres: %', coalesce(v_ocupados, '{}')
      using errcode = 'P0001', hint = 'numeros_ocupados';
  end if;

  insert into orders (
    campaign_id, short_code, buyer_name, buyer_phone, buyer_email,
    quantity, unit_price, total_amount, expires_at
  ) values (
    p_campaign_id,
    upper(substr(encode(gen_random_bytes(4), 'hex'), 1, 5)),
    p_buyer_name, p_buyer_phone, p_buyer_email,
    v_pedidos, v_campaign.price_per_number,
    v_campaign.price_per_number * v_pedidos,
    now() + make_interval(mins => v_campaign.reservation_ttl_minutes)
  ) returning * into v_order;

  update campaign_numbers set
    status = 'reserved',
    order_id = v_order.id,
    reserved_until = v_order.expires_at
  where campaign_id = p_campaign_id and number = any(p_numbers) and status = 'available';

  return v_order;
end;
$$;

create function submit_proof(
  p_public_token uuid,
  p_proof_path   text,
  p_method       text,
  p_reference    text default null
) returns orders
language plpgsql security definer set search_path = public, extensions as $$
declare v_order orders;
begin
  update orders set
    proof_path = p_proof_path,
    proof_uploaded_at = now(),
    payment_method = p_method,
    payment_reference = p_reference,
    status = 'in_review'
  where public_token = p_public_token
    and status in ('pending_payment', 'in_review', 'rejected')
  returning * into v_order;

  if not found then raise exception 'Esta orden ya no acepta comprobantes'; end if;
  return v_order;
end;
$$;

create function approve_order(p_order_id uuid) returns orders
language plpgsql security definer set search_path = public, extensions as $$
declare v_order orders;
begin
  select o.* into v_order from orders o
    join campaigns c on c.id = o.campaign_id
   where o.id = p_order_id and c.owner_id = auth.uid()
   for update of o;

  if not found then raise exception 'Orden no encontrada'; end if;
  if v_order.status = 'approved' then return v_order; end if;
  if v_order.status not in ('in_review', 'pending_payment') then
    raise exception 'Esta orden no se puede aprobar';
  end if;

  update campaign_numbers set status = 'sold', reserved_until = null
   where order_id = p_order_id;

  update orders set status = 'approved', reviewed_by = auth.uid(), reviewed_at = now(),
                    rejection_reason = null
   where id = p_order_id returning * into v_order;

  insert into activity_log (campaign_id, actor_id, action, payload)
  values (v_order.campaign_id, auth.uid(), 'order.approved', jsonb_build_object('order_id', p_order_id));

  return v_order;
end;
$$;

create function reject_order(p_order_id uuid, p_reason text) returns orders
language plpgsql security definer set search_path = public, extensions as $$
declare v_order orders;
begin
  select o.* into v_order from orders o
    join campaigns c on c.id = o.campaign_id
   where o.id = p_order_id and c.owner_id = auth.uid()
   for update of o;

  if not found then raise exception 'Orden no encontrada'; end if;
  if v_order.status = 'approved' then raise exception 'La orden ya fue aprobada'; end if;

  update campaign_numbers set status = 'available', order_id = null, reserved_until = null
   where order_id = p_order_id;

  update orders set status = 'rejected', rejection_reason = p_reason,
                    reviewed_by = auth.uid(), reviewed_at = now()
   where id = p_order_id returning * into v_order;

  insert into activity_log (campaign_id, actor_id, action, payload)
  values (v_order.campaign_id, auth.uid(), 'order.rejected',
          jsonb_build_object('order_id', p_order_id, 'reason', p_reason));

  return v_order;
end;
$$;

-- Sorteo verificable con varios premios.
-- Se sortea posición por posición con la misma semilla sellada, sacando de la
-- bolsa al ganador anterior: nadie gana dos veces y todo se puede recalcular.
create function execute_draw(p_campaign_id uuid, p_salt text default null)
returns setof draw_results
language plpgsql security definer set search_path = public, extensions as $$
declare
  v_campaign campaigns;
  v_salt     text;
  v_bolsa    int[];
  v_draw     draws;
  v_premio   prizes;
  v_indice   int;
  v_numero   int;
  v_order_id uuid;
begin
  select * into v_campaign from campaigns
   where id = p_campaign_id and owner_id = auth.uid() for update;

  if not found then raise exception 'Campaña no encontrada'; end if;
  if v_campaign.status = 'drawn' then raise exception 'Esta campaña ya fue sorteada'; end if;
  if v_campaign.status not in ('published', 'closed') then
    raise exception 'La campaña no está lista para sortear';
  end if;

  select array_agg(number order by number) into v_bolsa
    from campaign_numbers
   where campaign_id = p_campaign_id and status = 'sold';

  if v_bolsa is null then raise exception 'Todavía no hay números vendidos'; end if;

  v_salt := coalesce(p_salt, to_char(now() at time zone 'America/Lima', 'YYYY-MM-DD"T"HH24:MI:SS'));

  insert into draws (campaign_id, seed, public_salt, proof)
  values (p_campaign_id, v_campaign.seed, v_salt,
          jsonb_build_object('total_sold', array_length(v_bolsa, 1), 'seed_hash', v_campaign.seed_hash))
  returning * into v_draw;

  for v_premio in
    select * from prizes where campaign_id = p_campaign_id order by position
  loop
    exit when array_length(v_bolsa, 1) is null;

    v_indice := ('x' || substr(
      encode(digest(v_campaign.seed || v_salt || v_premio.position::text, 'sha256'), 'hex'), 1, 8
    ))::bit(32)::bigint % array_length(v_bolsa, 1);

    v_numero := v_bolsa[v_indice + 1];
    v_bolsa  := array_remove(v_bolsa, v_numero);

    select order_id into v_order_id from campaign_numbers
     where campaign_id = p_campaign_id and number = v_numero;

    insert into draw_results (draw_id, campaign_id, prize_id, position, winning_number, winning_order_id)
    values (v_draw.id, p_campaign_id, v_premio.id, v_premio.position, v_numero, v_order_id);
  end loop;

  update campaigns set status = 'drawn', drawn_at = now(), updated_at = now()
   where id = p_campaign_id;

  insert into activity_log (campaign_id, actor_id, action, payload)
  values (p_campaign_id, auth.uid(), 'campaign.drawn', to_jsonb(v_draw));

  return query select * from draw_results where campaign_id = p_campaign_id order by position;
end;
$$;

-- Consulta pública de una orden por su token (sin sesión).
create function get_order_by_token(p_public_token uuid)
returns table (
  id uuid, short_code text, status order_status, buyer_name text,
  quantity int, total_amount numeric, expires_at timestamptz,
  rejection_reason text, numbers int[], campaign_slug text, goal_title text
) language sql security definer set search_path = public, extensions stable as $$
  select o.id, o.short_code, o.status, o.buyer_name, o.quantity, o.total_amount,
         o.expires_at, o.rejection_reason,
         (select array_agg(cn.number order by cn.number)
            from campaign_numbers cn where cn.order_id = o.id),
         c.slug, c.goal_title
    from orders o join campaigns c on c.id = o.campaign_id
   where o.public_token = p_public_token;
$$;

-- ============================================================
-- RLS
-- ============================================================
alter table profiles         enable row level security;
alter table campaigns        enable row level security;
alter table prizes           enable row level security;
alter table campaign_numbers enable row level security;
alter table orders           enable row level security;
alter table draws            enable row level security;
alter table draw_results     enable row level security;
alter table activity_log     enable row level security;

create policy "perfiles visibles" on profiles for select using (true);
create policy "edito mi perfil"   on profiles for update using (id = auth.uid());

create policy "campañas públicas visibles" on campaigns for select
  using (status in ('published', 'closed', 'drawn') or owner_id = auth.uid());
create policy "creo mis campañas"  on campaigns for insert with check (owner_id = auth.uid());
create policy "edito mis campañas" on campaigns for update using (owner_id = auth.uid());
create policy "borro mis borradores" on campaigns for delete
  using (owner_id = auth.uid() and status = 'draft');

create policy "premios visibles" on prizes for select
  using (exists (
    select 1 from campaigns c where c.id = campaign_id
      and (c.status in ('published', 'closed', 'drawn') or c.owner_id = auth.uid())
  ));
create policy "administro los premios de mis campañas" on prizes for all
  using (exists (select 1 from campaigns c where c.id = campaign_id and c.owner_id = auth.uid()))
  with check (exists (select 1 from campaigns c where c.id = campaign_id and c.owner_id = auth.uid()));

create policy "números visibles" on campaign_numbers for select
  using (exists (
    select 1 from campaigns c where c.id = campaign_id
      and (c.status in ('published', 'closed', 'drawn') or c.owner_id = auth.uid())
  ));

-- Las órdenes nunca se leen en público: solo el organizador, o vía get_order_by_token.
create policy "veo las órdenes de mis campañas" on orders for select
  using (exists (select 1 from campaigns c where c.id = campaign_id and c.owner_id = auth.uid()));

create policy "sorteos visibles"    on draws        for select using (true);
create policy "resultados visibles" on draw_results for select using (true);

create policy "veo la bitácora de mis campañas" on activity_log for select
  using (exists (select 1 from campaigns c where c.id = campaign_id and c.owner_id = auth.uid()));

-- ============================================================
-- Storage
-- ============================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('campaign-covers', 'campaign-covers', true,  5242880, array['image/jpeg','image/png','image/webp']),
  ('prize-images',    'prize-images',    true,  5242880, array['image/jpeg','image/png','image/webp']),
  ('payment-proofs',  'payment-proofs',  false, 5242880, array['image/jpeg','image/png','image/webp','application/pdf'])
on conflict (id) do nothing;

create policy "imágenes públicas visibles" on storage.objects for select
  using (bucket_id in ('campaign-covers', 'prize-images'));

create policy "subo imágenes de mis campañas" on storage.objects for insert to authenticated
  with check (
    bucket_id in ('campaign-covers', 'prize-images')
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Los comprobantes los sube cualquiera, pero nadie los lee sin la clave secreta.
create policy "subo mi comprobante" on storage.objects for insert
  with check (bucket_id = 'payment-proofs');
