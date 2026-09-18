import { z } from "zod";

const paymentMethodOrPending = z.union([
  z.enum(["pix", "dinheiro", "credito", "debito"]),
  z.literal(""), // "" = vai pagar depois
]);

export const attendanceSchema = z
  .object({
    client_id: z.string().uuid("Selecione um cliente."),
    barber_id: z.string().uuid("Selecione um barbeiro."),
    service_id: z.string().uuid("Selecione um serviço."),
    amount: z.coerce.number().min(0, "Valor não pode ser negativo.").default(0),
    discount: z.coerce.number().min(0, "Desconto não pode ser negativo.").default(0),
    method: paymentMethodOrPending.optional().default(""),
    /** Obrigatório quando method === "" e não é uso de plano. */
    due_date: z.string().trim().optional().or(z.literal("")),
    notes: z.string().trim().optional().or(z.literal("")),
    /** Preenchido quando o atendimento consome um crédito do plano do cliente. */
    subscription_id: z.string().uuid().optional().or(z.literal("")),
  })
  .refine((data) => !!data.subscription_id || data.method !== "" || !!data.due_date, {
    message: "Informe a data prevista para o pagamento.",
    path: ["due_date"],
  });

export type AttendanceInput = z.infer<typeof attendanceSchema>;
