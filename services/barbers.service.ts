import { createClient } from "@/lib/supabase/server";
import type { BarberRow } from "@/types/database.types";
import type { BarberInput } from "@/lib/validations/barber";

export async function listBarbers(opts?: { onlyActive?: boolean }): Promise<BarberRow[]> {
  const supabase = await createClient();
  let query = supabase.from("barbers").select("*").order("full_name", { ascending: true });

  if (opts?.onlyActive) {
    query = query.eq("active", true);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}

/** Retorna o registro de barbeiro vinculado a um usuário logado (para travar a agenda dele). */
export async function getBarberByUserId(userId: string): Promise<BarberRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("barbers")
    .select("*")
    .eq("user_id", userId)
    .single();
  if (error) return null;
  return data;
}

export async function getBarber(id: string): Promise<BarberRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("barbers").select("*").eq("id", id).single();
  if (error) return null;
  return data;
}

export async function createBarber(input: BarberInput): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase.from("barbers").insert({
    full_name: input.full_name,
    phone: input.phone || null,
    commission_percent: input.commission_percent,
    active: input.active,
  });
  return { error: error?.message ?? null };
}

export async function updateBarber(
  id: string,
  input: BarberInput
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("barbers")
    .update({
      full_name: input.full_name,
      phone: input.phone || null,
      commission_percent: input.commission_percent,
      active: input.active,
    })
    .eq("id", id);
  return { error: error?.message ?? null };
}

/** "Remover" barbeiro = desativar. Nunca excluímos, pois há histórico vinculado (agenda, vendas). */
export async function deactivateBarber(id: string): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase.from("barbers").update({ active: false }).eq("id", id);
  return { error: error?.message ?? null };
}
