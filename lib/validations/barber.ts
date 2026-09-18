import { z } from "zod";

export const barberSchema = z.object({
  full_name: z.string().trim().min(2, "Informe o nome completo."),
  phone: z.string().trim().optional().or(z.literal("")),
  active: z.coerce.boolean().default(true),
});

export type BarberInput = z.infer<typeof barberSchema>;
