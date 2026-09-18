// Tipos do banco (Fases 1-2). Nas próximas fases, gerar via
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
  commission_percent: number;
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
  commission_percent?: number;
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
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};
