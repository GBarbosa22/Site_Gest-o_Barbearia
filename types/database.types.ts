// Tipos do banco (Fases 1-3). Nas próximas fases, gerar via
// `supabase gen types typescript` e substituir por esse arquivo completo.
//
// IMPORTANTE: use sempre `type` (nunca `interface`) para Row/Insert/Update.
// Interfaces não recebem a assinatura de índice implícita que o TypeScript
// dá a type aliases de objeto, então não satisfazem `Record<string, unknown>`
// exigido pelo `GenericTable` do @supabase/postgrest-js — isso silenciosamente
// quebra a inferência de tipos de `.insert()`/`.update()` (tudo vira `never`).

export type UserRole = "admin" | "barber";
export type AppointmentStatus =
  | "scheduled"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "no_show";
export type PaymentMethod = "pix" | "dinheiro" | "credito" | "debito";
export type SubscriptionStatus = "active" | "completed" | "expired" | "cancelled";
export type CashRegisterStatus = "open" | "closed";
export type CashMovementType = "entrada" | "saida";
export type CashMovementCategory =
  | "corte"
  | "plano"
  | "despesa"
  | "compra"
  | "sangria"
  | "ajuste"
  | "outro";
export type StockMovementType = "compra" | "venda" | "consumo" | "ajuste" | "perda";

export type UserRow = {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type BarberRow = {
  id: string;
  user_id: string | null;
  full_name: string;
  phone: string | null;
  photo_url: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type ClientRow = {
  id: string;
  full_name: string;
  phone: string | null;
  whatsapp: string | null;
  birth_date: string | null;
  notes: string | null;
  preferred_barber_id: string | null;
  created_at: string;
  updated_at: string;
};

export type ServiceRow = {
  id: string;
  name: string;
  duration_minutes: number;
  price: number;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type AppointmentRow = {
  id: string;
  client_id: string;
  barber_id: string;
  service_id: string;
  starts_at: string;
  ends_at: string;
  status: AppointmentStatus;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type PaymentRow = {
  id: string;
  appointment_id: string;
  amount: number;
  discount: number;
  method: PaymentMethod | null;
  paid: boolean;
  /** Só relevante quando paid=false: data prevista para o dinheiro entrar. */
  due_date: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type SubscriptionRow = {
  id: string;
  client_id: string;
  barber_id: string | null;
  price: number;
  total_credits: number;
  purchased_at: string;
  status: SubscriptionStatus;
  payment_method: PaymentMethod | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type SubscriptionUseRow = {
  id: string;
  subscription_id: string;
  week_number: number;
  appointment_id: string | null;
  used_at: string;
  created_by: string | null;
};

export type CashRegisterRow = {
  id: string;
  opened_at: string;
  opened_by: string | null;
  opening_balance: number;
  status: CashRegisterStatus;
  closed_at: string | null;
  closed_by: string | null;
  expected_balance: number | null;
  informed_balance: number | null;
  difference: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type CashMovementRow = {
  id: string;
  cash_register_id: string;
  type: CashMovementType;
  category: CashMovementCategory;
  amount: number;
  description: string | null;
  payment_id: string | null;
  subscription_id: string | null;
  created_by: string | null;
  created_at: string;
};

export type ProductRow = {
  id: string;
  name: string;
  category: string | null;
  unit: string;
  cost: number;
  price: number;
  quantity_on_hand: number;
  min_quantity: number;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type ServiceProductRow = {
  id: string;
  service_id: string;
  product_id: string;
  quantity: number;
};

export type StockMovementRow = {
  id: string;
  product_id: string;
  type: StockMovementType;
  quantity: number;
  related_appointment_id: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
};

type UserInsert = {
  id: string;
  full_name: string;
  email: string;
  role?: UserRole;
  active?: boolean;
};

type BarberInsert = {
  id?: string;
  user_id?: string | null;
  full_name: string;
  phone?: string | null;
  photo_url?: string | null;
  active?: boolean;
};

type ClientInsert = {
  id?: string;
  full_name: string;
  phone?: string | null;
  whatsapp?: string | null;
  birth_date?: string | null;
  notes?: string | null;
  preferred_barber_id?: string | null;
};

type ServiceInsert = {
  id?: string;
  name: string;
  duration_minutes: number;
  price: number;
  active?: boolean;
};

type AppointmentInsert = {
  id?: string;
  client_id: string;
  barber_id: string;
  service_id: string;
  starts_at: string;
  ends_at: string;
  status?: AppointmentStatus;
  notes?: string | null;
  created_by?: string | null;
};

type PaymentInsert = {
  id?: string;
  appointment_id: string;
  amount: number;
  discount?: number;
  method?: PaymentMethod | null;
  paid?: boolean;
  due_date?: string | null;
  notes?: string | null;
  created_by?: string | null;
};

type SubscriptionInsert = {
  id?: string;
  client_id: string;
  barber_id?: string | null;
  price: number;
  total_credits?: number;
  purchased_at?: string;
  status?: SubscriptionStatus;
  payment_method?: PaymentMethod | null;
  created_by?: string | null;
};

type SubscriptionUseInsert = {
  id?: string;
  subscription_id: string;
  week_number: number;
  appointment_id?: string | null;
  used_at?: string;
  created_by?: string | null;
};

type CashRegisterInsert = {
  id?: string;
  opened_at?: string;
  opened_by?: string | null;
  opening_balance?: number;
  status?: CashRegisterStatus;
  closed_at?: string | null;
  closed_by?: string | null;
  expected_balance?: number | null;
  informed_balance?: number | null;
  difference?: number | null;
  notes?: string | null;
};

type CashMovementInsert = {
  id?: string;
  cash_register_id: string;
  type: CashMovementType;
  category: CashMovementCategory;
  amount: number;
  description?: string | null;
  payment_id?: string | null;
  subscription_id?: string | null;
  created_by?: string | null;
};

type ProductInsert = {
  id?: string;
  name: string;
  category?: string | null;
  unit?: string;
  cost?: number;
  price?: number;
  quantity_on_hand?: number;
  min_quantity?: number;
  active?: boolean;
};

type ServiceProductInsert = {
  id?: string;
  service_id: string;
  product_id: string;
  quantity: number;
};

type StockMovementInsert = {
  id?: string;
  product_id: string;
  type: StockMovementType;
  quantity: number;
  related_appointment_id?: string | null;
  notes?: string | null;
  created_by?: string | null;
};

export type Database = {
  public: {
    Tables: {
      users: {
        Row: UserRow;
        Insert: UserInsert;
        Update: Partial<UserInsert>;
        Relationships: [];
      };
      barbers: {
        Row: BarberRow;
        Insert: BarberInsert;
        Update: Partial<BarberInsert>;
        Relationships: [];
      };
      clients: {
        Row: ClientRow;
        Insert: ClientInsert;
        Update: Partial<ClientInsert>;
        Relationships: [];
      };
      services: {
        Row: ServiceRow;
        Insert: ServiceInsert;
        Update: Partial<ServiceInsert>;
        Relationships: [];
      };
      appointments: {
        Row: AppointmentRow;
        Insert: AppointmentInsert;
        Update: Partial<AppointmentInsert>;
        Relationships: [];
      };
      payments: {
        Row: PaymentRow;
        Insert: PaymentInsert;
        Update: Partial<PaymentInsert>;
        Relationships: [];
      };
      subscriptions: {
        Row: SubscriptionRow;
        Insert: SubscriptionInsert;
        Update: Partial<SubscriptionInsert>;
        Relationships: [];
      };
      subscription_uses: {
        Row: SubscriptionUseRow;
        Insert: SubscriptionUseInsert;
        Update: Partial<SubscriptionUseInsert>;
        Relationships: [];
      };
      cash_registers: {
        Row: CashRegisterRow;
        Insert: CashRegisterInsert;
        Update: Partial<CashRegisterInsert>;
        Relationships: [];
      };
      cash_movements: {
        Row: CashMovementRow;
        Insert: CashMovementInsert;
        Update: Partial<CashMovementInsert>;
        Relationships: [];
      };
      products: {
        Row: ProductRow;
        Insert: ProductInsert;
        Update: Partial<ProductInsert>;
        Relationships: [];
      };
      service_products: {
        Row: ServiceProductRow;
        Insert: ServiceProductInsert;
        Update: Partial<ServiceProductInsert>;
        Relationships: [];
      };
      stock_movements: {
        Row: StockMovementRow;
        Insert: StockMovementInsert;
        Update: Partial<StockMovementInsert>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_open_cash_register_id: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      consume_product_stock: {
        Args: {
          p_product_id: string;
          p_quantity: number;
          p_appointment_id: string;
        };
        Returns: void;
      };
    };
  };
};
