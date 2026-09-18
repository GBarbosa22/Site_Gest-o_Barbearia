"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/services/auth.service";
import { createService, updateService, deactivateService } from "@/services/catalog.service";
import { serviceSchema } from "@/lib/validations/service";

export interface ServiceFormState {
  error: string | null;
}

function parseForm(formData: FormData) {
  return serviceSchema.safeParse({
    name: formData.get("name"),
    duration_minutes: formData.get("duration_minutes"),
    price: formData.get("price"),
    active: formData.get("active") === "on",
  });
}

export async function createServiceAction(
  _prevState: ServiceFormState,
  formData: FormData
): Promise<ServiceFormState> {
  await requireAdmin();

  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const { error } = await createService(parsed.data);
  if (error) return { error };

  revalidatePath("/servicos");
  redirect("/servicos");
}

export async function updateServiceAction(
  id: string,
  _prevState: ServiceFormState,
  formData: FormData
): Promise<ServiceFormState> {
  await requireAdmin();

  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const { error } = await updateService(id, parsed.data);
  if (error) return { error };

  revalidatePath("/servicos");
  redirect("/servicos");
}

export async function deactivateServiceAction(id: string) {
  await requireAdmin();
  await deactivateService(id);
  revalidatePath("/servicos");
}
