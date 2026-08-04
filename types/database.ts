/**
 * Tipos del esquema de Yunta.
 *
 * Escritos a mano a partir de supabase/migrations/0001_init.sql.
 * Se pueden regenerar cuando la CLI esté conectada al proyecto:
 *   npx supabase gen types typescript --project-id xxedcfuoiaekbpsnvler > types/database.ts
 */

export type CampaignFormat = "raffle" | "pollada" | "bingo" | "donation" | "presale";
export type CampaignStatus = "draft" | "published" | "closed" | "drawn" | "cancelled";
export type CoverSource = "typographic" | "photo" | "ai";
export type NumberStatus = "available" | "reserved" | "sold";
export type OrderStatus =
  | "pending_payment"
  | "in_review"
  | "approved"
  | "rejected"
  | "expired"
  | "cancelled";
export type DrawMethod = "verifiable_random" | "manual";

export type Campaign = {
  id: string;
  owner_id: string;
  slug: string;
  format: CampaignFormat;
  goal_title: string;
  story: string | null;
  goal_amount: number | null;
  cover_source: CoverSource;
  cover_url: string | null;
  cover_palette: number;
  currency: string;
  price_per_number: number;
  total_numbers: number;
  number_start: number;
  max_per_order: number;
  draw_date: string | null;
  status: CampaignStatus;
  yape_phone: string | null;
  plin_phone: string | null;
  account_holder_name: string | null;
  payment_qr_url: string | null;
  reservation_ttl_minutes: number;
  seed: string | null;
  seed_hash: string | null;
  terms_accepted_at: string | null;
  published_at: string | null;
  drawn_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Prize = {
  id: string;
  campaign_id: string;
  position: number;
  name: string;
  image_url: string | null;
  created_at: string;
};

export type CampaignNumber = {
  id: string;
  campaign_id: string;
  number: number;
  status: NumberStatus;
  order_id: string | null;
  reserved_until: string | null;
};

export type Order = {
  id: string;
  campaign_id: string;
  public_token: string;
  short_code: string;
  buyer_name: string;
  buyer_phone: string;
  buyer_email: string | null;
  quantity: number;
  unit_price: number;
  total_amount: number;
  status: OrderStatus;
  payment_method: string | null;
  payment_reference: string | null;
  proof_path: string | null;
  proof_uploaded_at: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  expires_at: string | null;
  created_at: string;
};

export type Draw = {
  id: string;
  campaign_id: string;
  method: DrawMethod;
  seed: string;
  public_salt: string;
  proof: Record<string, unknown> | null;
  executed_at: string;
};

export type DrawResult = {
  id: string;
  draw_id: string;
  campaign_id: string;
  prize_id: string;
  position: number;
  winning_number: number;
  winning_order_id: string | null;
};

export type Profile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  is_verified: boolean;
  created_at: string;
};

// supabase-js exige la clave Relationships en cada tabla; sin ella la
// inferencia colapsa a `never` y todas las consultas fallan al tipar.
type Tabla<Row, Insert = Partial<Row>, Update = Partial<Row>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      profiles: Tabla<Profile>;
      // En Insert solo son obligatorias las columnas NOT NULL sin default.
      campaigns: Tabla<
        Campaign,
        Partial<Campaign> &
          Pick<
            Campaign,
            "owner_id" | "slug" | "goal_title" | "price_per_number" | "total_numbers"
          >
      >;
      prizes: Tabla<
        Prize,
        Partial<Prize> & Pick<Prize, "campaign_id" | "position" | "name">
      >;
      campaign_numbers: Tabla<CampaignNumber>;
      orders: Tabla<Order>;
      draws: Tabla<Draw>;
      draw_results: Tabla<DrawResult>;
    };
    Views: Record<string, never>;
    Functions: {
      publish_campaign: { Args: { p_campaign_id: string }; Returns: Campaign };
      reserve_numbers: {
        Args: {
          p_campaign_id: string;
          p_numbers: number[];
          p_buyer_name: string;
          p_buyer_phone: string;
          p_buyer_email?: string | null;
        };
        Returns: Order;
      };
      submit_proof: {
        Args: {
          p_public_token: string;
          p_proof_path: string;
          p_method: string;
          p_reference?: string | null;
        };
        Returns: Order;
      };
      approve_order: { Args: { p_order_id: string }; Returns: Order };
      reject_order: { Args: { p_order_id: string; p_reason: string }; Returns: Order };
      execute_draw: {
        Args: { p_campaign_id: string; p_salt?: string | null };
        Returns: DrawResult[];
      };
      expire_reservations: { Args: { p_campaign_id?: string | null }; Returns: number };
      get_order_by_token: {
        Args: { p_public_token: string };
        Returns: {
          id: string;
          short_code: string;
          status: OrderStatus;
          buyer_name: string;
          quantity: number;
          total_amount: number;
          expires_at: string | null;
          rejection_reason: string | null;
          numbers: number[] | null;
          campaign_slug: string;
          goal_title: string;
        }[];
      };
    };
    Enums: {
      campaign_format: CampaignFormat;
      campaign_status: CampaignStatus;
      cover_source: CoverSource;
      number_status: NumberStatus;
      order_status: OrderStatus;
      draw_method: DrawMethod;
    };
    CompositeTypes: Record<string, never>;
  };
};
