import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { budgets, transactions, wallets } from "@/db/schema";
import { ApiError } from "@/lib/api-response";
import type {
  Budget,
  BudgetInput,
  FinanceState,
  Transaction,
  TransactionInput,
  Wallet,
  WalletInput,
} from "@/types/finance";

const notFound = (message: string): ApiError => new ApiError(message, 404);

export const getFinanceState = async (
  userId: string,
): Promise<FinanceState> => {
  const [transactionRows, walletRows, budgetRows] = await Promise.all([
    db
      .select({
        id: transactions.id,
        date: transactions.date,
        name: transactions.name,
        type: transactions.type,
        category: transactions.category,
        amount: transactions.amount,
        walletId: transactions.walletId,
        note: transactions.note,
      })
      .from(transactions)
      .where(
        and(eq(transactions.userId, userId), isNull(transactions.deletedAt)),
      ),
    db
      .select({
        id: wallets.id,
        name: wallets.name,
        type: wallets.type,
        initialBalance: wallets.initialBalance,
      })
      .from(wallets)
      .where(and(eq(wallets.userId, userId), isNull(wallets.deletedAt))),
    db
      .select({
        id: budgets.id,
        month: budgets.month,
        category: budgets.category,
        limit: budgets.limit,
      })
      .from(budgets)
      .where(and(eq(budgets.userId, userId), isNull(budgets.deletedAt))),
  ]);

  return {
    transactions: transactionRows,
    wallets: walletRows,
    budgets: budgetRows,
  };
};

const requireActiveWallet = async (
  userId: string,
  walletId: string,
): Promise<void> => {
  const [wallet] = await db
    .select({ id: wallets.id })
    .from(wallets)
    .where(
      and(
        eq(wallets.id, walletId),
        eq(wallets.userId, userId),
        isNull(wallets.deletedAt),
      ),
    )
    .limit(1);

  if (wallet === undefined) {
    throw notFound(`Wallet "${walletId}" tidak ditemukan.`);
  }
};

export const createTransaction = async (
  userId: string,
  input: TransactionInput,
): Promise<Transaction> => {
  await requireActiveWallet(userId, input.walletId);
  const id = crypto.randomUUID();
  const [transaction] = await db
    .insert(transactions)
    .values({ id, userId, ...input })
    .returning({
      id: transactions.id,
      date: transactions.date,
      name: transactions.name,
      type: transactions.type,
      category: transactions.category,
      amount: transactions.amount,
      walletId: transactions.walletId,
      note: transactions.note,
    });

  return transaction;
};

export const updateTransaction = async (
  userId: string,
  id: string,
  input: TransactionInput,
): Promise<Transaction> => {
  await requireActiveWallet(userId, input.walletId);
  const [transaction] = await db
    .update(transactions)
    .set({ ...input, updatedAt: new Date() })
    .where(
      and(
        eq(transactions.id, id),
        eq(transactions.userId, userId),
        isNull(transactions.deletedAt),
      ),
    )
    .returning({
      id: transactions.id,
      date: transactions.date,
      name: transactions.name,
      type: transactions.type,
      category: transactions.category,
      amount: transactions.amount,
      walletId: transactions.walletId,
      note: transactions.note,
    });

  if (transaction === undefined) {
    throw notFound(`Transaksi "${id}" tidak ditemukan.`);
  }

  return transaction;
};

export const deleteTransaction = async (
  userId: string,
  id: string,
): Promise<void> => {
  const deleted = await db
    .update(transactions)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(
      and(
        eq(transactions.id, id),
        eq(transactions.userId, userId),
        isNull(transactions.deletedAt),
      ),
    )
    .returning({ id: transactions.id });

  if (deleted.length === 0) {
    throw notFound(`Transaksi "${id}" tidak ditemukan.`);
  }
};

export const restoreTransaction = async (
  userId: string,
  id: string,
): Promise<void> => {
  const [transaction] = await db
    .select({ walletId: transactions.walletId })
    .from(transactions)
    .where(and(eq(transactions.id, id), eq(transactions.userId, userId)))
    .limit(1);

  if (transaction === undefined) {
    throw notFound(`Transaksi "${id}" tidak ditemukan.`);
  }

  await requireActiveWallet(userId, transaction.walletId);
  const restored = await db
    .update(transactions)
    .set({ deletedAt: null, updatedAt: new Date() })
    .where(and(eq(transactions.id, id), eq(transactions.userId, userId)))
    .returning({ id: transactions.id });

  if (restored.length === 0) {
    throw notFound(`Transaksi "${id}" tidak ditemukan.`);
  }
};

export const createWallet = async (
  userId: string,
  input: WalletInput,
): Promise<Wallet> => {
  const [wallet] = await db
    .insert(wallets)
    .values({ id: crypto.randomUUID(), userId, ...input })
    .returning({
      id: wallets.id,
      name: wallets.name,
      type: wallets.type,
      initialBalance: wallets.initialBalance,
    });

  return wallet;
};

export const updateWallet = async (
  userId: string,
  id: string,
  input: WalletInput,
): Promise<Wallet> => {
  const [wallet] = await db
    .update(wallets)
    .set({ ...input, updatedAt: new Date() })
    .where(
      and(
        eq(wallets.id, id),
        eq(wallets.userId, userId),
        isNull(wallets.deletedAt),
      ),
    )
    .returning({
      id: wallets.id,
      name: wallets.name,
      type: wallets.type,
      initialBalance: wallets.initialBalance,
    });

  if (wallet === undefined) {
    throw notFound(`Wallet "${id}" tidak ditemukan.`);
  }

  return wallet;
};

export const deleteWallet = async (
  userId: string,
  id: string,
): Promise<void> => {
  const related = await db
    .select({ id: transactions.id })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        eq(transactions.walletId, id),
        isNull(transactions.deletedAt),
      ),
    )
    .limit(1);

  if (related.length > 0) {
    throw new ApiError(
      "Wallet tidak dapat dihapus karena masih memiliki transaksi terkait.",
      409,
    );
  }

  const deleted = await db
    .update(wallets)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(
      and(
        eq(wallets.id, id),
        eq(wallets.userId, userId),
        isNull(wallets.deletedAt),
      ),
    )
    .returning({ id: wallets.id });

  if (deleted.length === 0) {
    throw notFound(`Wallet "${id}" tidak ditemukan.`);
  }
};

export const restoreWallet = async (
  userId: string,
  id: string,
): Promise<void> => {
  const restored = await db
    .update(wallets)
    .set({ deletedAt: null, updatedAt: new Date() })
    .where(and(eq(wallets.id, id), eq(wallets.userId, userId)))
    .returning({ id: wallets.id });

  if (restored.length === 0) {
    throw notFound(`Wallet "${id}" tidak ditemukan.`);
  }
};

export const createBudget = async (
  userId: string,
  input: BudgetInput,
): Promise<Budget> => {
  const [budget] = await db
    .insert(budgets)
    .values({ id: crypto.randomUUID(), userId, ...input })
    .returning({
      id: budgets.id,
      month: budgets.month,
      category: budgets.category,
      limit: budgets.limit,
    });

  return budget;
};

export const updateBudget = async (
  userId: string,
  id: string,
  input: BudgetInput,
): Promise<Budget> => {
  const [budget] = await db
    .update(budgets)
    .set({ ...input, updatedAt: new Date() })
    .where(
      and(
        eq(budgets.id, id),
        eq(budgets.userId, userId),
        isNull(budgets.deletedAt),
      ),
    )
    .returning({
      id: budgets.id,
      month: budgets.month,
      category: budgets.category,
      limit: budgets.limit,
    });

  if (budget === undefined) {
    throw notFound(`Budget "${id}" tidak ditemukan.`);
  }

  return budget;
};

export const deleteBudget = async (
  userId: string,
  id: string,
): Promise<void> => {
  const deleted = await db
    .update(budgets)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(
      and(
        eq(budgets.id, id),
        eq(budgets.userId, userId),
        isNull(budgets.deletedAt),
      ),
    )
    .returning({ id: budgets.id });

  if (deleted.length === 0) {
    throw notFound(`Budget "${id}" tidak ditemukan.`);
  }
};

export const restoreBudget = async (
  userId: string,
  id: string,
): Promise<void> => {
  const restored = await db
    .update(budgets)
    .set({ deletedAt: null, updatedAt: new Date() })
    .where(and(eq(budgets.id, id), eq(budgets.userId, userId)))
    .returning({ id: budgets.id });

  if (restored.length === 0) {
    throw notFound(`Budget "${id}" tidak ditemukan.`);
  }
};
