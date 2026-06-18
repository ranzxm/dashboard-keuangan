"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { initialFinanceState } from "@/data/initial-data";
import { loadFinanceState, saveFinanceState } from "@/lib/storage";
import type {
  Budget,
  BudgetInput,
  FinanceState,
  Transaction,
  TransactionInput,
  Wallet,
  WalletInput,
} from "@/types/finance";

type FinanceContextValue = FinanceState & {
  isReady: boolean;
  addTransaction: (input: TransactionInput) => void;
  updateTransaction: (id: string, input: TransactionInput) => void;
  deleteTransaction: (id: string) => void;
  restoreTransaction: (transaction: Transaction) => void;
  addWallet: (input: WalletInput) => void;
  updateWallet: (id: string, input: WalletInput) => void;
  deleteWallet: (id: string) => void;
  restoreWallet: (wallet: Wallet) => void;
  addBudget: (input: BudgetInput) => void;
  updateBudget: (id: string, input: BudgetInput) => void;
  deleteBudget: (id: string) => void;
  restoreBudget: (budget: Budget) => void;
};

const FinanceContext = createContext<FinanceContextValue | null>(null);

const createId = (): string => crypto.randomUUID();

export function FinanceProvider({
  children,
}: {
  children: ReactNode;
}): React.ReactNode {
  const [state, setState] = useState<FinanceState>(initialFinanceState);
  const [isReady, setIsReady] = useState<boolean>(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const storedState = loadFinanceState();
      setState(storedState ?? initialFinanceState);
      setIsReady(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isReady) {
      saveFinanceState(state);
    }
  }, [isReady, state]);

  const addTransaction = (input: TransactionInput): void => {
    const transaction: Transaction = { id: createId(), ...input };
    setState((current) => ({
      ...current,
      transactions: [transaction, ...current.transactions],
    }));
  };

  const updateTransaction = (
    id: string,
    input: TransactionInput,
  ): void => {
    setState((current) => ({
      ...current,
      transactions: current.transactions.map((transaction) =>
        transaction.id === id ? { id, ...input } : transaction,
      ),
    }));
  };

  const deleteTransaction = (id: string): void => {
    setState((current) => ({
      ...current,
      transactions: current.transactions.filter(
        (transaction) => transaction.id !== id,
      ),
    }));
  };

  const restoreTransaction = (transaction: Transaction): void => {
    setState((current) => ({
      ...current,
      transactions: current.transactions.some(
        (currentTransaction) => currentTransaction.id === transaction.id,
      )
        ? current.transactions
        : [transaction, ...current.transactions],
    }));
  };

  const addWallet = (input: WalletInput): void => {
    const wallet: Wallet = { id: createId(), ...input };
    setState((current) => ({
      ...current,
      wallets: [...current.wallets, wallet],
    }));
  };

  const updateWallet = (id: string, input: WalletInput): void => {
    setState((current) => ({
      ...current,
      wallets: current.wallets.map((wallet) =>
        wallet.id === id ? { id, ...input } : wallet,
      ),
    }));
  };

  const deleteWallet = (id: string): void => {
    const hasTransactions = state.transactions.some(
      (transaction) => transaction.walletId === id,
    );

    if (hasTransactions) {
      throw new Error(
        "Wallet tidak dapat dihapus karena masih memiliki transaksi terkait.",
      );
    }

    setState((current) => ({
      ...current,
      wallets: current.wallets.filter((wallet) => wallet.id !== id),
    }));
  };

  const restoreWallet = (wallet: Wallet): void => {
    setState((current) => ({
      ...current,
      wallets: current.wallets.some(
        (currentWallet) => currentWallet.id === wallet.id,
      )
        ? current.wallets
        : [...current.wallets, wallet],
    }));
  };

  const addBudget = (input: BudgetInput): void => {
    const alreadyExists = state.budgets.some(
      (budget) =>
        budget.month === input.month && budget.category === input.category,
    );

    if (alreadyExists) {
      throw new Error(
        `Budget ${input.category} untuk bulan ${input.month} sudah tersedia.`,
      );
    }

    const budget: Budget = { id: createId(), ...input };
    setState((current) => ({
      ...current,
      budgets: [...current.budgets, budget],
    }));
  };

  const updateBudget = (id: string, input: BudgetInput): void => {
    const alreadyExists = state.budgets.some(
      (budget) =>
        budget.id !== id &&
        budget.month === input.month &&
        budget.category === input.category,
    );

    if (alreadyExists) {
      throw new Error(
        `Budget ${input.category} untuk bulan ${input.month} sudah tersedia.`,
      );
    }

    setState((current) => ({
      ...current,
      budgets: current.budgets.map((budget) =>
        budget.id === id ? { id, ...input } : budget,
      ),
    }));
  };

  const deleteBudget = (id: string): void => {
    setState((current) => ({
      ...current,
      budgets: current.budgets.filter((budget) => budget.id !== id),
    }));
  };

  const restoreBudget = (budget: Budget): void => {
    setState((current) => ({
      ...current,
      budgets: current.budgets.some(
        (currentBudget) => currentBudget.id === budget.id,
      )
        ? current.budgets
        : [...current.budgets, budget],
    }));
  };

  return (
    <FinanceContext.Provider
      value={{
        ...state,
        isReady,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        restoreTransaction,
        addWallet,
        updateWallet,
        deleteWallet,
        restoreWallet,
        addBudget,
        updateBudget,
        deleteBudget,
        restoreBudget,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

export const useFinance = (): FinanceContextValue => {
  const context = useContext(FinanceContext);

  if (context === null) {
    throw new Error("useFinance harus digunakan di dalam FinanceProvider.");
  }

  return context;
};
