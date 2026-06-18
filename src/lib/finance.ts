import type {
  Budget,
  Transaction,
  TransactionFilters,
  Wallet,
} from "@/types/finance";

export const formatCurrency = (value: number): string =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

export const formatDate = (value: string): string =>
  new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));

export const formatMonth = (value: string): string =>
  new Intl.DateTimeFormat("id-ID", {
    month: "long",
    year: "numeric",
  }).format(new Date(`${value}-01T00:00:00`));

export const getCurrentMonth = (): string =>
  `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;

export const calculateMonthlySeries = (
  transactions: Transaction[],
  month: string,
  type: "income" | "expense",
): number[] => {
  const finalDay = new Date(
    Number(month.slice(0, 4)),
    Number(month.slice(5, 7)),
    0,
  ).getDate();
  const checkpoints = [1, 5, 10, 15, 20, 25, finalDay];

  return checkpoints.map((checkpoint) =>
    transactions
      .filter(
        (transaction) =>
          transaction.type === type &&
          transaction.date.startsWith(month) &&
          Number(transaction.date.slice(8, 10)) <= checkpoint,
      )
      .reduce((total, transaction) => total + transaction.amount, 0),
  );
};

export const formatCompactCurrency = (value: number): string =>
  new Intl.NumberFormat("id-ID", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);

export const calculateWalletBalance = (
  wallet: Wallet,
  transactions: Transaction[],
): number =>
  transactions
    .filter((transaction) => transaction.walletId === wallet.id)
    .reduce(
      (balance, transaction) =>
        balance +
        (transaction.type === "income"
          ? transaction.amount
          : -transaction.amount),
      wallet.initialBalance,
    );

export const calculateTotalBalance = (
  wallets: Wallet[],
  transactions: Transaction[],
): number =>
  wallets.reduce(
    (total, wallet) =>
      total + calculateWalletBalance(wallet, transactions),
    0,
  );

export const calculateMonthlyTotal = (
  transactions: Transaction[],
  month: string,
  type: "income" | "expense",
): number =>
  transactions
    .filter(
      (transaction) =>
        transaction.date.startsWith(month) && transaction.type === type,
    )
    .reduce((total, transaction) => total + transaction.amount, 0);

export const calculateBudgetSpent = (
  budget: Budget,
  transactions: Transaction[],
): number =>
  transactions
    .filter(
      (transaction) =>
        transaction.type === "expense" &&
        transaction.date.startsWith(budget.month) &&
        transaction.category === budget.category,
    )
    .reduce((total, transaction) => total + transaction.amount, 0);

export const filterTransactions = (
  transactions: Transaction[],
  filters: TransactionFilters,
): Transaction[] =>
  transactions.filter((transaction) => {
    const isAfterStart =
      filters.startDate === "" || transaction.date >= filters.startDate;
    const isBeforeEnd =
      filters.endDate === "" || transaction.date <= filters.endDate;
    const hasType =
      filters.type === "all" || transaction.type === filters.type;
    const hasCategory =
      filters.category === "all" ||
      transaction.category === filters.category;
    const hasWallet =
      filters.walletId === "all" ||
      transaction.walletId === filters.walletId;

    return (
      isAfterStart &&
      isBeforeEnd &&
      hasType &&
      hasCategory &&
      hasWallet
    );
  });

export const sortTransactionsNewest = (
  transactions: Transaction[],
): Transaction[] =>
  [...transactions].sort((first, second) =>
    second.date.localeCompare(first.date),
  );
