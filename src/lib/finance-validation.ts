import { z } from "zod";

const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const monthPattern = /^\d{4}-\d{2}$/;
const moneyPattern = /^\d+$/;
const positiveMoney = z
  .string()
  .regex(moneyPattern, "Nominal harus berupa angka bulat tanpa desimal.")
  .refine(
    (value) => BigInt(value) > BigInt(0),
    "Nominal harus lebih besar dari nol.",
  );
const nonNegativeMoney = z
  .string()
  .regex(moneyPattern, "Nominal harus berupa angka bulat tanpa desimal.")
  .refine(
    (value) => BigInt(value) >= BigInt(0),
    "Nominal tidak boleh kurang dari nol.",
  );

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
