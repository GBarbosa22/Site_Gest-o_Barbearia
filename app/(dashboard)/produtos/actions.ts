"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/services/auth.service";
import {
  createProduct,
  updateProduct,
  deactivateProduct,
  setServiceProducts,
} from "@/services/products.service";
import { productSchema, serviceProductsSchema } from "@/lib/validations/product";

export interface ProductFormState {
  error: string | null;
}

function parseForm(formData: FormData) {
  return productSchema.safeParse({
    name: formData.get("name"),
    category: formData.get("category") ?? "",
    unit: formData.get("unit") || "un",
    cost: formData.get("cost") || 0,
    price: formData.get("price") || 0,
    quantity_on_hand: formData.get("quantity_on_hand") || 0,
    min_quantity: formData.get("min_quantity") || 0,
    active: formData.get("active") === "on",
  });
}

export async function createProductAction(
  _prevState: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  await requireAdmin();

  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const { error } = await createProduct(parsed.data);
  if (error) return { error };

  revalidatePath("/produtos");
  redirect("/produtos");
}

export async function updateProductAction(
  id: string,
  _prevState: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  await requireAdmin();

  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const { error } = await updateProduct(id, parsed.data);
  if (error) return { error };

  revalidatePath("/produtos");
  redirect("/produtos");
}

export async function deactivateProductAction(id: string) {
  await requireAdmin();
  await deactivateProduct(id);
  revalidatePath("/produtos");
}

export interface RecipeFormState {
  error: string | null;
}

export async function saveServiceRecipeAction(
  serviceId: string,
  _prevState: RecipeFormState,
  formData: FormData
): Promise<RecipeFormState> {
  await requireAdmin();

  const raw = formData.get("items");
  let items: unknown;
  try {
    items = JSON.parse(String(raw ?? "[]"));
  } catch {
    return { error: "Dados inválidos." };
  }

  const parsed = serviceProductsSchema.safeParse(items);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const { error } = await setServiceProducts(serviceId, parsed.data);
  if (error) return { error };

  revalidatePath(`/servicos/${serviceId}`);
  return { error: null };
}
