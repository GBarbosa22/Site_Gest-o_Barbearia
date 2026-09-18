import { z } from "zod";

export const openRegisterSchema = z.object({
  opening_balance: z.coerce.number().min(0, "Saldo inicial não pode ser negativo."),
});

export const closeRegisterSchema = z.object({
  informed_balance: z.coerce.number().min(0, "Saldo informado não pode ser negativo."),
  notes: z.string().trim().optional().or(z.literal("")),
});

export const movementSchema = z.object({
  category: z.enum(["despesa", "compra", "sangria", "ajuste", "outro"]),
  amount: z.coerce.number().positive("Valor deve ser maior que zero."),
  description: z.string().trim().optional().or(z.literal("")),
});
