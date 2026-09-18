import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/services/audit.service";
import type { UserRow } from "@/types/database.types";

export interface AuthResult {
  error: string | null;
}

/** Autentica com e-mail/senha. Usado pela Server Action da tela de login. */
export async function signIn(email: string, password: string): Promise<AuthResult> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (!error) {
    await logAudit("login", "user");
  }
  return { error: error?.message ?? null };
}

export async function signOut(): Promise<void> {
  await logAudit("logout", "user");
  const supabase = await createClient();
  await supabase.auth.signOut();
}

/** Retorna o perfil (public.users) do usuário logado, ou null se não autenticado. */
export async function getCurrentUserProfile(): Promise<UserRow | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase.from("users").select("*").eq("id", user.id).single();
  return data ?? null;
}

export async function requireAdmin(): Promise<UserRow> {
  const profile = await getCurrentUserProfile();
  if (!profile || profile.role !== "admin") {
    throw new Error("Acesso restrito ao administrador.");
  }
  return profile;
}
