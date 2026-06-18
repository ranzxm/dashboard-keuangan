import assert from "node:assert/strict";
import { describe, test } from "node:test";
import {
  calculateBudgetSpent,
  calculateMonthlyTotal,
  calculateWalletBalance,
  filterTransactions,
} from "@/lib/finance";
import type { Budget, Transaction, Wallet } from "@/types/finance";

const wallet: Wallet = {
  id: "wallet-1",
  name: "Bank",
  type: "bank",
  initialBalance: 1000000,
};

const transactions: Transaction[] = [
  {
    id: "transaction-1",
    date: "2026-06-01",
    name: "Income",
    type: "income",
    category: "Gaji",
    amount: 500000,
    walletId: wallet.id,
    note: null,
  },
  {
    id: "transaction-2",
    date: "2026-06-02",
    name: "Expense",
    type: "expense",
    category: "Makanan",
    amount: 125000,
    walletId: wallet.id,
    note: null,
  },
];

describe("finance calculations", () => {
  test("calculates wallet balance from related transactions", () => {
    assert.equal(calculateWalletBalance(wallet, transactions), 1375000);
  });

  test("calculates monthly totals by transaction type", () => {
    assert.equal(
      calculateMonthlyTotal(transactions, "2026-06", "income"),
      500000,
    );
    assert.equal(
      calculateMonthlyTotal(transactions, "2026-06", "expense"),
      125000,
    );
  });

  test("calculates category budget usage", () => {
    const budget: Budget = {
      id: "budget-1",
      month: "2026-06",
      category: "Makanan",
      limit: 300000,
    };

    assert.equal(calculateBudgetSpent(budget, transactions), 125000);
  });

  test("filters transactions using all supported criteria", () => {
    const result = filterTransactions(transactions, {
      startDate: "2026-06-02",
      endDate: "2026-06-30",
      type: "expense",
      category: "Makanan",
      walletId: wallet.id,
    });

    assert.deepEqual(result, [transactions[1]]);
  });
});
