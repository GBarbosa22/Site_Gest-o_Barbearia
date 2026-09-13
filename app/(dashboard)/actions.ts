"use server";

import { redirect } from "next/navigation";
import { signOut } from "@/services/auth.service";

export async function logoutAction() {
  await signOut();
  redirect("/login");
}
