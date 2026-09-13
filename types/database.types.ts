// Tipos do banco (Fase 1). Nas próximas fases, gerar via
// `supabase gen types typescript` e substituir por esse arquivo completo.

export type UserRole = "admin" | "barber";
export type AppointmentStatus =
  | "scheduled"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "no_show";

export interface UserRow {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BarberRow {
  id: string;
  user_id: string | null;
  full_name: string;
  phone: string | null;
  photo_url: string | null;
  commission_percent: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClientRow {
  id: string;
  full_name: string;
  phone: string | null;
  whatsapp: string | null;
  birth_date: string | null;
  notes: string | null;
  preferred_barber_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ServiceRow {
  id: string;
  name: string;
  duration_minutes: number;
  price: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AppointmentRow {
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
}

export interface Database {
  public: {
    Tables: {
      users: { Row: UserRow; Insert: Partial<UserRow>; Update: Partial<UserRow> };
      barbers: { Row: BarberRow; Insert: Partial<BarberRow>; Update: Partial<BarberRow> };
      clients: { Row: ClientRow; Insert: Partial<ClientRow>; Update: Partial<ClientRow> };
      services: { Row: ServiceRow; Insert: Partial<ServiceRow>; Update: Partial<ServiceRow> };
      appointments: {
        Row: AppointmentRow;
        Insert: Partial<AppointmentRow>;
        Update: Partial<AppointmentRow>;
      };
    };
  };
}
