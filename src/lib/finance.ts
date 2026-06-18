import type {
  Budget,
  Money,
  Transaction,
  TransactionFilters,
  Wallet,
} from "@/types/finance";

export const parseMoney = (value: Money): bigint => BigInt(value);

export const formatMoney = (value: bigint): Money => value.toString();

export const addMoney = (...values: Array<Money | bigint>): bigint =>
  values.reduce<bigint>(
    (total, value) =>
      total + (typeof value === "bigint" ? value : parseMoney(value)),
    BigInt(0),
  );

export const subtractMoney = (
  left: Money | bigint,
  right: Money | bigint,
): bigint =>
  (typeof left === "bigint" ? left : parseMoney(left)) -
  (typeof right === "bigint" ? right : parseMoney(right));

export const moneyToNumber = (value: Money | bigint): number =>
  Number(typeof value === "bigint" ? value : parseMoney(value));

export const divideMoney = (
  dividend: Money | bigint,
  divisor: Money | bigint,
): number => {
  const dividendValue = typeof dividend === "bigint" ? dividend : parseMoney(dividend);
  const divisorValue = typeof divisor === "bigint" ? divisor : parseMoney(divisor);

  if (divisorValue === BigInt(0)) {
    return 0;
  }

  return Number(dividendValue) / Number(divisorValue);
};

export const isNegativeMoney = (value: Money | bigint): boolean =>
  (typeof value === "bigint" ? value : parseMoney(value)) < BigInt(0);

export const formatCurrency = (value: Money | bigint): string =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(moneyToNumber(value));

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
): bigint[] => {
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
      .reduce(
        (total, transaction) => total + parseMoney(transaction.amount),
        BigInt(0),
      ),
  );
};

export const formatCompactCurrency = (value: Money | bigint): string =>
  new Intl.NumberFormat("id-ID", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(moneyToNumber(value));

export const calculateWalletBalance = (
  wallet: Wallet,
  transactions: Transaction[],
): bigint =>
  transactions
    .filter((transaction) => transaction.walletId === wallet.id)
    .reduce(
      (balance, transaction) =>
        balance +
        (transaction.type === "income"
          ? parseMoney(transaction.amount)
          : -parseMoney(transaction.amount)),
      parseMoney(wallet.initialBalance),
    );

export const calculateTotalBalance = (
  wallets: Wallet[],
  transactions: Transaction[],
): bigint =>
  wallets.reduce(
    (total, wallet) =>
      total + calculateWalletBalance(wallet, transactions),
    BigInt(0),
  );

export const calculateMonthlyTotal = (
  transactions: Transaction[],
  month: string,
  type: "income" | "expense",
): bigint =>
  transactions
    .filter(
      (transaction) =>
        transaction.date.startsWith(month) && transaction.type === type,
    )
    .reduce(
      (total, transaction) => total + parseMoney(transaction.amount),
      BigInt(0),
    );

export const calculateBudgetSpent = (
  budget: Budget,
  transactions: Transaction[],
): bigint =>
  transactions
    .filter(
      (transaction) =>
        transaction.type === "expense" &&
        transaction.date.startsWith(budget.month) &&
        transaction.category === budget.category,
    )
    .reduce(
      (total, transaction) => total + parseMoney(transaction.amount),
      BigInt(0),
    );

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
