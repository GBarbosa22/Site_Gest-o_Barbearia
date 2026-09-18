import { z } from "zod";

export const barberSchema = z.object({
  full_name: z.string().trim().min(2, "Informe o nome completo."),
  phone: z.string().trim().optional().or(z.literal("")),
  commission_percent: z.coerce.number().min(0).max(100).default(0),
  active: z.coerce.boolean().default(true),
});

export type BarberInput = z.infer<typeof barberSchema>;
