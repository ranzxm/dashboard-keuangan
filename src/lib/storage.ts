import type { FinanceState } from "@/types/finance";

const storageKey = "kuwang-finance-state";

const isFinanceState = (value: object): value is FinanceState => {
  const candidate = value as Partial<FinanceState>;

  return (
    Array.isArray(candidate.transactions) &&
    Array.isArray(candidate.wallets) &&
    Array.isArray(candidate.budgets)
  );
};

export const loadFinanceState = (): FinanceState | null => {
  const rawState = window.localStorage.getItem(storageKey);

  if (rawState === null) {
    return null;
  }

  const parsedState: object = JSON.parse(rawState) as object;

  if (!isFinanceState(parsedState)) {
    throw new TypeError(
      `Data keuangan tersimpan tidak valid untuk key "${storageKey}".`,
    );
  }

  return parsedState;
};

export const saveFinanceState = (state: FinanceState): void => {
  window.localStorage.setItem(storageKey, JSON.stringify(state));
};
