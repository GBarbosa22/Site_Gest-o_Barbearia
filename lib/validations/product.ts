import { z } from "zod";

export const productSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome do produto."),
  category: z.string().trim().optional().or(z.literal("")),
  unit: z.string().trim().min(1, "Informe a unidade (un, ml, g...).").default("un"),
  cost: z.coerce.number().min(0, "Custo não pode ser negativo.").default(0),
  price: z.coerce.number().min(0, "Preço não pode ser negativo.").default(0),
  quantity_on_hand: z.coerce.number().min(0, "Quantidade não pode ser negativa.").default(0),
  min_quantity: z.coerce.number().min(0, "Quantidade mínima não pode ser negativa.").default(0),
  active: z.coerce.boolean().default(true),
});

export type ProductInput = z.infer<typeof productSchema>;

export const serviceProductsSchema = z.array(
  z.object({
    product_id: z.string().uuid(),
    quantity: z.coerce.number().positive("Quantidade deve ser maior que zero."),
  })
);

export type ServiceProductsInput = z.infer<typeof serviceProductsSchema>;
