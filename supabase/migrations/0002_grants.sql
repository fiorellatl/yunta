-- ============================================================
-- Yunta · permisos para la API
--
-- Las tablas se crearon bien, pero PostgREST solo expone aquellas
-- sobre las que los roles `anon` y `authenticated` tienen permisos:
-- sin esto, cada tabla responde 404 aunque exista.
--
-- Esto NO abre la base: RLS sigue activa en todas las tablas y es
-- la que decide qué filas ve cada quien. El GRANT solo permite que
-- la petición llegue hasta las políticas.
-- ============================================================

grant usage on schema public to anon, authenticated;

-- Lectura pública: las políticas ya limitan a campañas publicadas.
grant select on campaigns, prizes, campaign_numbers, draws, draw_results to anon, authenticated;

-- El organizador administra lo suyo; RLS restringe a sus campañas.
grant select, insert, update, delete on campaigns, prizes to authenticated;
grant select on orders, activity_log to authenticated;

-- Las órdenes y los números solo se tocan por funciones transaccionales
-- (reserve_numbers, approve_order, reject_order, execute_draw), que son
-- security definer. Nadie escribe esas tablas directamente.

grant execute on all functions in schema public to anon, authenticated;

-- Que PostgREST recargue su caché de esquema en vez de esperar.
notify pgrst, 'reload schema';
