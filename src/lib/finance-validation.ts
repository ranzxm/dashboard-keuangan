import { z } from "zod";

const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const monthPattern = /^\d{4}-\d{2}$/;
const positiveMoney = z.number().int().positive().max(Number.MAX_SAFE_INTEGER);
const nonNegativeMoney = z
  .number()
  .int()
  .nonnegative()
  .max(Number.MAX_SAFE_INTEGER);

export const transactionInputSchema = z.object({
  date: z.string().regex(datePattern, "Tanggal harus menggunakan format YYYY-MM-DD."),
  name: z.string().trim().min(1).max(120),
  type: z.enum(["income", "expense"]),
  category: z.string().trim().min(1).max(80),
  amount: positiveMoney,
  walletId: z.string().min(1).max(128),
  note: z.string().trim().max(500).nullable(),
});

export const walletInputSchema = z.object({
  name: z.string().trim().min(1).max(80),
  type: z.enum(["cash", "bank", "e-wallet", "other"]),
  initialBalance: nonNegativeMoney,
});

export const budgetInputSchema = z.object({
  month: z.string().regex(monthPattern, "Bulan harus menggunakan format YYYY-MM."),
  category: z.string().trim().min(1).max(80),
  limit: positiveMoney,
});
