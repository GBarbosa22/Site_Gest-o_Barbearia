import { createClient } from "@/lib/supabase/server";
import type { ServiceRow } from "@/types/database.types";
import type { ServiceInput } from "@/lib/validations/service";

/** CRUD do catálogo de serviços (tabela `services`: corte, barba, etc). */
export async function listServices(opts?: { onlyActive?: boolean }): Promise<ServiceRow[]> {
  const supabase = await createClient();
  let query = supabase.from("services").select("*").order("name", { ascending: true });

  if (opts?.onlyActive) {
    query = query.eq("active", true);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getService(id: string): Promise<ServiceRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("services").select("*").eq("id", id).single();
  if (error) return null;
  return data;
}

export async function createService(input: ServiceInput): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase.from("services").insert({
    name: input.name,
    duration_minutes: input.duration_minutes,
    price: input.price,
    active: input.active,
  });
  return { error: error?.message ?? null };
}

export async function updateService(
  id: string,
  input: ServiceInput
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("services")
    .update({
      name: input.name,
      duration_minutes: input.duration_minutes,
      price: input.price,
      active: input.active,
    })
    .eq("id", id);
  return { error: error?.message ?? null };
}

export async function deactivateService(id: string): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase.from("services").update({ active: false }).eq("id", id);
  return { error: error?.message ?? null };
}
