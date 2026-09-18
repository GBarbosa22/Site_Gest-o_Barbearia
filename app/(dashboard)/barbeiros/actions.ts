"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/services/auth.service";
import { createBarber, updateBarber, deactivateBarber } from "@/services/barbers.service";
import { barberSchema } from "@/lib/validations/barber";

export interface BarberFormState {
  error: string | null;
}

function parseForm(formData: FormData) {
  return barberSchema.safeParse({
    full_name: formData.get("full_name"),
    phone: formData.get("phone"),
    commission_percent: formData.get("commission_percent") || 0,
    active: formData.get("active") === "on",
  });
}

export async function createBarberAction(
  _prevState: BarberFormState,
  formData: FormData
): Promise<BarberFormState> {
  await requireAdmin();

  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const { error } = await createBarber(parsed.data);
  if (error) return { error };

  revalidatePath("/barbeiros");
  redirect("/barbeiros");
}

export async function updateBarberAction(
  id: string,
  _prevState: BarberFormState,
  formData: FormData
): Promise<BarberFormState> {
  await requireAdmin();

  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const { error } = await updateBarber(id, parsed.data);
  if (error) return { error };

  revalidatePath("/barbeiros");
  redirect("/barbeiros");
}

export async function deactivateBarberAction(id: string) {
  await requireAdmin();
  await deactivateBarber(id);
  revalidatePath("/barbeiros");
}
