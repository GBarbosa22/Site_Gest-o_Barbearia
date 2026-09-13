"use server";

import { redirect } from "next/navigation";
import { signIn } from "@/services/auth.service";

export async function loginAction(_prevState: { error: string | null }, formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Informe e-mail e senha." };
  }

  const { error } = await signIn(email, password);
  if (error) {
    return { error: "E-mail ou senha inválidos." };
  }

  redirect("/dashboard");
}
