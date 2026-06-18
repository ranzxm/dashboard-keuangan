import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { budgets, transactions, wallets } from "@/db/schema";
import { ApiError } from "@/lib/api-response";
import { formatMoney, parseMoney } from "@/lib/finance";
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
const conflict = (message: string): ApiError => new ApiError(message, 409);

const toTransaction = (transaction: {
  id: string;
  date: string;
  name: string;
  type: Transaction["type"];
  category: string;
  amount: bigint;
  walletId: string;
  note: string | null;
}): Transaction => ({
  ...transaction,
  amount: formatMoney(transaction.amount),
});

const toWallet = (wallet: {
  id: string;
  name: string;
  type: Wallet["type"];
  initialBalance: bigint;
}): Wallet => ({
  ...wallet,
  initialBalance: formatMoney(wallet.initialBalance),
});

const toBudget = (budget: {
  id: string;
  month: string;
  category: string;
  limit: bigint;
}): Budget => ({
  ...budget,
  limit: formatMoney(budget.limit),
});

const toTransactionRow = (input: TransactionInput) => ({
  ...input,
  amount: parseMoney(input.amount),
});

const toWalletRow = (input: WalletInput) => ({
  ...input,
  initialBalance: parseMoney(input.initialBalance),
});

const toBudgetRow = (input: BudgetInput) => ({
  ...input,
  limit: parseMoney(input.limit),
});

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
    transactions: transactionRows.map(toTransaction),
    wallets: walletRows.map(toWallet),
    budgets: budgetRows.map(toBudget),
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
    .values({ id, userId, ...toTransactionRow(input) })
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

  return toTransaction(transaction);
};

export const updateTransaction = async (
  userId: string,
  id: string,
  input: TransactionInput,
): Promise<Transaction> => {
  await requireActiveWallet(userId, input.walletId);
  const [transaction] = await db
    .update(transactions)
    .set({ ...toTransactionRow(input), updatedAt: new Date() })
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

  return toTransaction(transaction);
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
    .select({
      walletId: transactions.walletId,
      deletedAt: transactions.deletedAt,
    })
    .from(transactions)
    .where(and(eq(transactions.id, id), eq(transactions.userId, userId)))
    .limit(1);

  if (transaction === undefined) {
    throw notFound(`Transaksi "${id}" tidak ditemukan.`);
  }

  if (transaction.deletedAt === null) {
    throw conflict(`Transaksi "${id}" sudah aktif.`);
  }

  await requireActiveWallet(userId, transaction.walletId);
  const restored = await db
    .update(transactions)
    .set({ deletedAt: null, updatedAt: new Date() })
    .where(
      and(
        eq(transactions.id, id),
        eq(transactions.userId, userId),
        eq(transactions.deletedAt, transaction.deletedAt),
      ),
    )
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
    .values({ id: crypto.randomUUID(), userId, ...toWalletRow(input) })
    .returning({
      id: wallets.id,
      name: wallets.name,
      type: wallets.type,
      initialBalance: wallets.initialBalance,
    });

  return toWallet(wallet);
};

export const updateWallet = async (
  userId: string,
  id: string,
  input: WalletInput,
): Promise<Wallet> => {
  const [wallet] = await db
    .update(wallets)
    .set({ ...toWalletRow(input), updatedAt: new Date() })
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

  return toWallet(wallet);
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
  const [wallet] = await db
    .select({ name: wallets.name, deletedAt: wallets.deletedAt })
    .from(wallets)
    .where(and(eq(wallets.id, id), eq(wallets.userId, userId)))
    .limit(1);

  if (wallet === undefined) {
    throw notFound(`Wallet "${id}" tidak ditemukan.`);
  }

  if (wallet.deletedAt === null) {
    throw conflict(`Wallet "${wallet.name}" sudah aktif.`);
  }

  const [activeWalletWithSameName] = await db
    .select({ id: wallets.id })
    .from(wallets)
    .where(
      and(
        eq(wallets.userId, userId),
        eq(wallets.name, wallet.name),
        isNull(wallets.deletedAt),
      ),
    )
    .limit(1);

  if (activeWalletWithSameName !== undefined) {
    throw conflict(
      `Wallet "${wallet.name}" tidak dapat dipulihkan karena nama yang sama sudah digunakan.`,
    );
  }

  const restored = await db
    .update(wallets)
    .set({ deletedAt: null, updatedAt: new Date() })
    .where(
      and(
        eq(wallets.id, id),
        eq(wallets.userId, userId),
        eq(wallets.deletedAt, wallet.deletedAt),
      ),
    )
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
    .values({ id: crypto.randomUUID(), userId, ...toBudgetRow(input) })
    .returning({
      id: budgets.id,
      month: budgets.month,
      category: budgets.category,
      limit: budgets.limit,
    });

  return toBudget(budget);
};

export const updateBudget = async (
  userId: string,
  id: string,
  input: BudgetInput,
): Promise<Budget> => {
  const [budget] = await db
    .update(budgets)
    .set({ ...toBudgetRow(input), updatedAt: new Date() })
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

  return toBudget(budget);
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
  const [budget] = await db
    .select({
      month: budgets.month,
      category: budgets.category,
      deletedAt: budgets.deletedAt,
    })
    .from(budgets)
    .where(and(eq(budgets.id, id), eq(budgets.userId, userId)))
    .limit(1);

  if (budget === undefined) {
    throw notFound(`Budget "${id}" tidak ditemukan.`);
  }

  if (budget.deletedAt === null) {
    throw conflict(
      `Budget ${budget.category} untuk ${budget.month} sudah aktif.`,
    );
  }

  const [activeBudgetWithSameKey] = await db
    .select({ id: budgets.id })
    .from(budgets)
    .where(
      and(
        eq(budgets.userId, userId),
        eq(budgets.month, budget.month),
        eq(budgets.category, budget.category),
        isNull(budgets.deletedAt),
      ),
    )
    .limit(1);

  if (activeBudgetWithSameKey !== undefined) {
    throw conflict(
      `Budget ${budget.category} untuk ${budget.month} tidak dapat dipulihkan karena sudah ada data aktif dengan kategori dan bulan yang sama.`,
    );
  }

  const restored = await db
    .update(budgets)
    .set({ deletedAt: null, updatedAt: new Date() })
    .where(
      and(
        eq(budgets.id, id),
        eq(budgets.userId, userId),
        eq(budgets.deletedAt, budget.deletedAt),
      ),
    )
    .returning({ id: budgets.id });

  if (restored.length === 0) {
    throw notFound(`Budget "${id}" tidak ditemukan.`);
  }
};
