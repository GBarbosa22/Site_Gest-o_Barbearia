import { z } from "zod";

export const appointmentSchema = z.object({
  client_id: z.string().uuid("Selecione um cliente."),
  barber_id: z.string().uuid("Selecione um barbeiro."),
  service_id: z.string().uuid("Selecione um serviço."),
  date: z.string().min(1, "Selecione a data."),
  time: z.string().min(1, "Selecione o horário."),
  notes: z.string().trim().optional().or(z.literal("")),
});

export type AppointmentInput = z.infer<typeof appointmentSchema>;

export const appointmentStatusSchema = z.enum([
  "scheduled",
  "in_progress",
  "completed",
  "cancelled",
  "no_show",
]);
