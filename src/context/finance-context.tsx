"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { usePathname } from "next/navigation";
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
  error: string | null;
  addTransaction: (input: TransactionInput) => Promise<void>;
  updateTransaction: (id: string, input: TransactionInput) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  restoreTransaction: (transaction: Transaction) => Promise<void>;
  addWallet: (input: WalletInput) => Promise<void>;
  updateWallet: (id: string, input: WalletInput) => Promise<void>;
  deleteWallet: (id: string) => Promise<void>;
  restoreWallet: (wallet: Wallet) => Promise<void>;
  addBudget: (input: BudgetInput) => Promise<void>;
  updateBudget: (id: string, input: BudgetInput) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  restoreBudget: (budget: Budget) => Promise<void>;
};

type ApiError = {
  error?: string;
};

const emptyState: FinanceState = {
  transactions: [],
  wallets: [],
  budgets: [],
};

const FinanceContext = createContext<FinanceContextValue | null>(null);

const request = async <ResponseBody,>(
  url: string,
  method: "GET" | "POST" | "PATCH" | "DELETE",
  body: object | null,
): Promise<ResponseBody> => {
  const response = await fetch(url, {
    method,
    headers: body === null ? undefined : { "Content-Type": "application/json" },
    body: body === null ? undefined : JSON.stringify(body),
  });

  if (response.status === 401) {
    window.location.assign("/sign-in");
    throw new Error("Sesi telah berakhir. Silakan masuk kembali.");
  }

  if (!response.ok) {
    const result = (await response.json()) as ApiError;
    throw new Error(
      result.error ??
        `Request ${method} ${url} gagal dengan status ${response.status}.`,
    );
  }

  if (response.status === 204) {
    return undefined as ResponseBody;
  }

  return (await response.json()) as ResponseBody;
};

export function FinanceProvider({
  children,
}: {
  children: ReactNode;
}): React.ReactNode {
  const [state, setState] = useState<FinanceState>(emptyState);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === "/sign-in" || pathname === "/sign-up") {
      return;
    }

    const controller = new AbortController();

    const load = async (): Promise<void> => {
      try {
        const response = await fetch("/api/finance", {
          signal: controller.signal,
        });

        if (response.status === 401) {
          window.location.assign("/sign-in");
          return;
        }

        if (!response.ok) {
          throw new Error(
            `Gagal memuat data keuangan dengan status ${response.status}.`,
          );
        }

        setState((await response.json()) as FinanceState);
        setError(null);
      } catch (caughtError) {
        if (caughtError instanceof DOMException && caughtError.name === "AbortError") {
          return;
        }

        if (caughtError instanceof Error) {
          setError(caughtError.message);
          return;
        }

        throw caughtError;
      } finally {
        if (!controller.signal.aborted) {
          setIsReady(true);
        }
      }
    };

    void load();
    return () => controller.abort();
  }, [pathname]);

  const addTransaction = async (input: TransactionInput): Promise<void> => {
    const transaction = await request<Transaction>(
      "/api/finance/transactions",
      "POST",
      input,
    );
    setState((current) => ({
      ...current,
      transactions: [transaction, ...current.transactions],
    }));
  };

  const updateTransaction = async (
    id: string,
    input: TransactionInput,
  ): Promise<void> => {
    const transaction = await request<Transaction>(
      `/api/finance/transactions/${id}`,
      "PATCH",
      input,
    );
    setState((current) => ({
      ...current,
      transactions: current.transactions.map((currentTransaction) =>
        currentTransaction.id === id ? transaction : currentTransaction,
      ),
    }));
  };

  const deleteTransaction = async (id: string): Promise<void> => {
    await request<void>(`/api/finance/transactions/${id}`, "DELETE", null);
    setState((current) => ({
      ...current,
      transactions: current.transactions.filter(
        (transaction) => transaction.id !== id,
      ),
    }));
  };

  const restoreTransaction = async (
    transaction: Transaction,
  ): Promise<void> => {
    await request<void>(
      `/api/finance/transactions/${transaction.id}/restore`,
      "POST",
      null,
    );
    setState((current) => ({
      ...current,
      transactions: [transaction, ...current.transactions],
    }));
  };

  const addWallet = async (input: WalletInput): Promise<void> => {
    const wallet = await request<Wallet>(
      "/api/finance/wallets",
      "POST",
      input,
    );
    setState((current) => ({
      ...current,
      wallets: [...current.wallets, wallet],
    }));
  };

  const updateWallet = async (
    id: string,
    input: WalletInput,
  ): Promise<void> => {
    const wallet = await request<Wallet>(
      `/api/finance/wallets/${id}`,
      "PATCH",
      input,
    );
    setState((current) => ({
      ...current,
      wallets: current.wallets.map((currentWallet) =>
        currentWallet.id === id ? wallet : currentWallet,
      ),
    }));
  };

  const deleteWallet = async (id: string): Promise<void> => {
    await request<void>(`/api/finance/wallets/${id}`, "DELETE", null);
    setState((current) => ({
      ...current,
      wallets: current.wallets.filter((wallet) => wallet.id !== id),
    }));
  };

  const restoreWallet = async (wallet: Wallet): Promise<void> => {
    await request<void>(
      `/api/finance/wallets/${wallet.id}/restore`,
      "POST",
      null,
    );
    setState((current) => ({
      ...current,
      wallets: [...current.wallets, wallet],
    }));
  };

  const addBudget = async (input: BudgetInput): Promise<void> => {
    const budget = await request<Budget>(
      "/api/finance/budgets",
      "POST",
      input,
    );
    setState((current) => ({
      ...current,
      budgets: [...current.budgets, budget],
    }));
  };

  const updateBudget = async (
    id: string,
    input: BudgetInput,
  ): Promise<void> => {
    const budget = await request<Budget>(
      `/api/finance/budgets/${id}`,
      "PATCH",
      input,
    );
    setState((current) => ({
      ...current,
      budgets: current.budgets.map((currentBudget) =>
        currentBudget.id === id ? budget : currentBudget,
      ),
    }));
  };

  const deleteBudget = async (id: string): Promise<void> => {
    await request<void>(`/api/finance/budgets/${id}`, "DELETE", null);
    setState((current) => ({
      ...current,
      budgets: current.budgets.filter((budget) => budget.id !== id),
    }));
  };

  const restoreBudget = async (budget: Budget): Promise<void> => {
    await request<void>(
      `/api/finance/budgets/${budget.id}/restore`,
      "POST",
      null,
    );
    setState((current) => ({
      ...current,
      budgets: [...current.budgets, budget],
    }));
  };

  return (
    <FinanceContext.Provider
      value={{
        ...state,
        isReady,
        error,
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
