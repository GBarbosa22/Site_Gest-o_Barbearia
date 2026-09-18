"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createAttendance,
  updateAttendance,
  updateAppointmentStatus,
} from "@/services/appointments.service";
import { markPaymentPaid } from "@/services/payments.service";
import { attendanceSchema } from "@/lib/validations/appointment";
import type { PaymentMethod } from "@/types/database.types";
import { toISODateString } from "@/lib/utils";

export interface AttendanceFormState {
  error: string | null;
}

function parseForm(formData: FormData) {
  return attendanceSchema.safeParse({
    client_id: formData.get("client_id"),
    barber_id: formData.get("barber_id"),
    service_id: formData.get("service_id"),
    amount: formData.get("amount") || 0,
    discount: formData.get("discount") || 0,
    method: formData.get("method"),
    due_date: formData.get("due_date"),
    notes: formData.get("notes"),
    subscription_id: formData.get("subscription_id"),
  });
}

export async function createAttendanceAction(
  _prevState: AttendanceFormState,
  formData: FormData
): Promise<AttendanceFormState> {
  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const { error } = await createAttendance(parsed.data);
  if (error) return { error };

  revalidatePath("/atendimentos");
  redirect(`/atendimentos?date=${toISODateString(new Date())}`);
}

export async function updateAttendanceAction(
  id: string,
  date: string,
  _prevState: AttendanceFormState,
  formData: FormData
): Promise<AttendanceFormState> {
  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const { error } = await updateAttendance(id, parsed.data);
  if (error) return { error };

  revalidatePath("/atendimentos");
  redirect(`/atendimentos?date=${date}`);
}

export async function cancelAttendanceAction(id: string, date: string) {
  await updateAppointmentStatus(id, "cancelled");
  revalidatePath("/atendimentos");
  redirect(`/atendimentos?date=${date}`);
}

export async function markPaidAction(id: string, method: PaymentMethod, date: string) {
  await markPaymentPaid(id, method);
  revalidatePath("/atendimentos");
  redirect(`/atendimentos?date=${date}`);
}
