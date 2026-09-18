"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { recordAdHocConsumption } from "@/services/products.service";
import { consumptionSchema } from "@/lib/validations/sale";

export interface ConsumptionFormState {
  error: string | null;
}

export async function recordConsumptionAction(
  _prevState: ConsumptionFormState,
  formData: FormData
): Promise<ConsumptionFormState> {
  const parsed = consumptionSchema.safeParse({
    product_id: formData.get("product_id") ?? "",
    quantity: formData.get("quantity"),
    notes: formData.get("notes") ?? "",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const { error } = await recordAdHocConsumption(parsed.data.product_id, parsed.data.quantity);
  if (error) return { error };

  revalidatePath("/produtos");
  revalidatePath("/consumo-interno");
  redirect("/consumo-interno?ok=1");
}
