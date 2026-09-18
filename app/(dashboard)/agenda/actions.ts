"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createAppointment,
  updateAppointment,
  updateAppointmentStatus,
} from "@/services/appointments.service";
import { appointmentSchema, appointmentStatusSchema } from "@/lib/validations/appointment";

export interface AppointmentFormState {
  error: string | null;
}

function parseForm(formData: FormData) {
  return appointmentSchema.safeParse({
    client_id: formData.get("client_id"),
    barber_id: formData.get("barber_id"),
    service_id: formData.get("service_id"),
    date: formData.get("date"),
    time: formData.get("time"),
    notes: formData.get("notes"),
  });
}

export async function createAppointmentAction(
  _prevState: AppointmentFormState,
  formData: FormData
): Promise<AppointmentFormState> {
  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const { error } = await createAppointment(parsed.data);
  if (error) return { error };

  revalidatePath("/agenda");
  redirect(`/agenda?date=${parsed.data.date}`);
}

export async function updateAppointmentAction(
  id: string,
  _prevState: AppointmentFormState,
  formData: FormData
): Promise<AppointmentFormState> {
  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const { error } = await updateAppointment(id, parsed.data);
  if (error) return { error };

  revalidatePath("/agenda");
  redirect(`/agenda?date=${parsed.data.date}`);
}

export async function cancelAppointmentAction(id: string, date: string) {
  await updateAppointmentStatus(id, "cancelled");
  revalidatePath("/agenda");
  redirect(`/agenda?date=${date}`);
}

export async function markNoShowAction(id: string, date: string) {
  const parsed = appointmentStatusSchema.parse("no_show");
  await updateAppointmentStatus(id, parsed);
  revalidatePath("/agenda");
  redirect(`/agenda?date=${date}`);
}
