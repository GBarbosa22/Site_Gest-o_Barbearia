"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSubscription, cancelSubscription } from "@/services/subscriptions.service";
import { subscriptionSchema } from "@/lib/validations/subscription";

export interface SubscriptionFormState {
  error: string | null;
}

export async function createSubscriptionAction(
  _prevState: SubscriptionFormState,
  formData: FormData
): Promise<SubscriptionFormState> {
  const parsed = subscriptionSchema.safeParse({
    client_id: formData.get("client_id"),
    barber_id: formData.get("barber_id"),
    price: formData.get("price"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const { error } = await createSubscription({
    clientId: parsed.data.client_id,
    barberId: parsed.data.barber_id || null,
    price: parsed.data.price,
  });
  if (error) return { error };

  revalidatePath("/planos");
  redirect("/planos");
}

export async function cancelSubscriptionAction(id: string) {
  await cancelSubscription(id);
  revalidatePath("/planos");
}
