export type TransactionType = "income" | "expense";

export type WalletType = "cash" | "bank" | "e-wallet" | "other";

export type Transaction = {
  id: string;
  date: string;
  name: string;
  type: TransactionType;
  category: string;
  amount: number;
  walletId: string;
  note: string | null;
};

export type Wallet = {
  id: string;
  name: string;
  type: WalletType;
  initialBalance: number;
};

export type Budget = {
  id: string;
  month: string;
  category: string;
  limit: number;
};

export type FinanceState = {
  transactions: Transaction[];
  wallets: Wallet[];
  budgets: Budget[];
};

export type TransactionInput = Omit<Transaction, "id">;
export type WalletInput = Omit<Wallet, "id">;
export type BudgetInput = Omit<Budget, "id">;

export type TransactionFilters = {
  startDate: string;
  endDate: string;
  type: TransactionType | "all";
  category: string;
  walletId: string;
};
