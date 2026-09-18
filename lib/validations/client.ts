import { z } from "zod";

export const clientSchema = z.object({
  full_name: z.string().trim().min(2, "Informe o nome completo."),
  phone: z.string().trim().optional().or(z.literal("")),
  whatsapp: z.string().trim().optional().or(z.literal("")),
  birth_date: z.string().trim().optional().or(z.literal("")),
  notes: z.string().trim().optional().or(z.literal("")),
  preferred_barber_id: z.string().uuid().optional().or(z.literal("")),
});

export type ClientInput = z.infer<typeof clientSchema>;
