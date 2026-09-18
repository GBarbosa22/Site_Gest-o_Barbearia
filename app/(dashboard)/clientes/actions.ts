"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClientRecord, updateClient } from "@/services/clients.service";
import { clientSchema } from "@/lib/validations/client";

export interface ClientFormState {
  error: string | null;
}

function parseForm(formData: FormData) {
  return clientSchema.safeParse({
    full_name: formData.get("full_name"),
    phone: formData.get("phone"),
    whatsapp: formData.get("whatsapp"),
    birth_date: formData.get("birth_date"),
    notes: formData.get("notes"),
    preferred_barber_id: formData.get("preferred_barber_id"),
  });
}

export async function createClientAction(
  _prevState: ClientFormState,
  formData: FormData
): Promise<ClientFormState> {
  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const { error } = await createClientRecord(parsed.data);
  if (error) return { error };

  revalidatePath("/clientes");
  redirect("/clientes");
}

export async function updateClientAction(
  id: string,
  _prevState: ClientFormState,
  formData: FormData
): Promise<ClientFormState> {
  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const { error } = await updateClient(id, parsed.data);
  if (error) return { error };

  revalidatePath("/clientes");
  redirect(`/clientes/${id}`);
}
