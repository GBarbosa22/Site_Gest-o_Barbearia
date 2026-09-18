import { z } from "zod";

export const serviceSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome do serviço."),
  duration_minutes: z.coerce.number().int().min(5, "Duração mínima de 5 minutos."),
  price: z.coerce.number().min(0, "Preço não pode ser negativo."),
  active: z.coerce.boolean().default(true),
});

export type ServiceInput = z.infer<typeof serviceSchema>;
