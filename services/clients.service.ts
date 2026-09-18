import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/services/audit.service";
import type { ClientRow } from "@/types/database.types";
import type { ClientInput } from "@/lib/validations/client";

export async function listClients(search?: string): Promise<ClientRow[]> {
  const supabase = await createClient();
  let query = supabase
    .from("clients")
    .select("*")
    .order("full_name", { ascending: true })
    .limit(50);

  if (search && search.trim()) {
    query = query.or(`full_name.ilike.%${search}%,phone.ilike.%${search}%`);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getClient(id: string): Promise<ClientRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("clients").select("*").eq("id", id).single();
  if (error) return null;
  return data;
}

export async function createClientRecord(
  input: ClientInput
): Promise<{ id: string | null; error: string | null }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clients")
    .insert({
      full_name: input.full_name,
      phone: input.phone || null,
      whatsapp: input.whatsapp || null,
      birth_date: input.birth_date || null,
      notes: input.notes || null,
      preferred_barber_id: input.preferred_barber_id || null,
    })
    .select("id")
    .single();

  if (data?.id) {
    await logAudit("cliente_criado", "client", data.id, { nome: input.full_name });
  }

  return { id: data?.id ?? null, error: error?.message ?? null };
}

export async function updateClient(
  id: string,
  input: ClientInput
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("clients")
    .update({
      full_name: input.full_name,
      phone: input.phone || null,
      whatsapp: input.whatsapp || null,
      birth_date: input.birth_date || null,
      notes: input.notes || null,
      preferred_barber_id: input.preferred_barber_id || null,
    })
    .eq("id", id);

  if (!error) {
    await logAudit("cliente_editado", "client", id, { nome: input.full_name });
  }

  return { error: error?.message ?? null };
}

export async function getBirthdaysToday(): Promise<ClientRow[]> {
  const supabase = await createClient();
  const today = new Date();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");

  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .not("birth_date", "is", null);

  if (error) return [];
  return (data ?? []).filter((client) => {
    if (!client.birth_date) return false;
    const [, month, day] = client.birth_date.split("-");
    return month === mm && day === dd;
  });
}
