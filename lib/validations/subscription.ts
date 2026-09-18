import { z } from "zod";

export const subscriptionSchema = z.object({
  client_id: z.string().uuid("Selecione um cliente."),
  barber_id: z.string().uuid().optional().or(z.literal("")),
  price: z.coerce.number().min(0, "Valor não pode ser negativo."),
  payment_method: z.enum(["pix", "dinheiro", "credito", "debito"], {
    errorMap: () => ({ message: "Selecione a forma de pagamento." }),
  }),
});

export type SubscriptionInput = z.infer<typeof subscriptionSchema>;
