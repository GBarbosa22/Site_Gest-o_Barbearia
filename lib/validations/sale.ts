import { z } from "zod";

const paymentMethodOrPending = z.union([
  z.enum(["pix", "dinheiro", "credito", "debito"]),
  z.literal(""), // "" = vai pagar depois
]);

export const saleItemSchema = z.object({
  product_id: z.string().uuid(),
  quantity: z.coerce.number().positive("Quantidade deve ser maior que zero."),
  unit_price: z.coerce.number().min(0, "Preço não pode ser negativo."),
});

export const saleSchema = z
  .object({
    client_id: z.string().uuid().optional().or(z.literal("")),
    barber_id: z.string().uuid("Selecione o barbeiro."),
    discount: z.coerce.number().min(0, "Desconto não pode ser negativo.").default(0),
    method: paymentMethodOrPending,
    due_date: z.string().trim().optional().or(z.literal("")),
    notes: z.string().trim().optional().or(z.literal("")),
  })
  .refine((data) => data.method !== "" || !!data.due_date, {
    message: "Informe a data prevista para o pagamento.",
    path: ["due_date"],
  });

export type SaleInput = z.infer<typeof saleSchema>;

export const consumptionSchema = z.object({
  product_id: z.string().uuid("Selecione o produto."),
  quantity: z.coerce.number().positive("Quantidade deve ser maior que zero."),
  notes: z.string().trim().optional().or(z.literal("")),
});

export type ConsumptionInput = z.infer<typeof consumptionSchema>;
