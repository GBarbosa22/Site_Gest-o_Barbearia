import { z } from "zod";

const paymentMethodOrPending = z.union([
  z.enum(["pix", "dinheiro", "credito", "debito"]),
  z.literal(""), // "" = vai pagar depois
]);

export const attendanceSchema = z.object({
  client_id: z.string().uuid("Selecione um cliente."),
  barber_id: z.string().uuid("Selecione um barbeiro."),
  service_id: z.string().uuid("Selecione um serviço."),
  amount: z.coerce.number().min(0, "Valor não pode ser negativo."),
  discount: z.coerce.number().min(0, "Desconto não pode ser negativo.").default(0),
  method: paymentMethodOrPending,
  notes: z.string().trim().optional().or(z.literal("")),
});

export type AttendanceInput = z.infer<typeof attendanceSchema>;
