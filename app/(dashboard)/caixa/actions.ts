"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/services/auth.service";
import { openRegister, closeRegister, addManualMovement } from "@/services/cash-register.service";
import {
  openRegisterSchema,
  closeRegisterSchema,
  movementSchema,
} from "@/lib/validations/cash-register";

export interface CashFormState {
  error: string | null;
}

export async function openRegisterAction(
  _prevState: CashFormState,
  formData: FormData
): Promise<CashFormState> {
  await requireAdmin();

  const parsed = openRegisterSchema.safeParse({
    opening_balance: formData.get("opening_balance") || 0,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const { error } = await openRegister(parsed.data.opening_balance);
  if (error) return { error };

  revalidatePath("/caixa");
  redirect("/caixa");
}

export async function closeRegisterAction(
  id: string,
  _prevState: CashFormState,
  formData: FormData
): Promise<CashFormState> {
  await requireAdmin();

  const parsed = closeRegisterSchema.safeParse({
    informed_balance: formData.get("informed_balance") || 0,
    notes: formData.get("notes") ?? "",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const { error } = await closeRegister(id, parsed.data.informed_balance, parsed.data.notes);
  if (error) return { error };

  revalidatePath("/caixa");
  redirect(`/caixa/${id}`);
}

export async function addMovementAction(
  _prevState: CashFormState,
  formData: FormData
): Promise<CashFormState> {
  await requireAdmin();

  const parsed = movementSchema.safeParse({
    category: formData.get("category"),
    amount: formData.get("amount"),
    description: formData.get("description") ?? "",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const { error } = await addManualMovement({
    type: "saida",
    category: parsed.data.category,
    amount: parsed.data.amount,
    description: parsed.data.description,
  });
  if (error) return { error };

  revalidatePath("/caixa");
  redirect("/caixa");
}
