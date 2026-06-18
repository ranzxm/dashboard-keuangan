import assert from "node:assert/strict";
import { after, describe, test } from "node:test";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import {
  createBudget,
  createTransaction,
  createWallet,
  deleteBudget,
  deleteTransaction,
  getFinanceState,
  restoreBudget,
  restoreTransaction,
} from "@/db/finance-repository";
import { user } from "@/db/schema";

const testUserId = `integration-${crypto.randomUUID()}`;

describe("finance repository PostgreSQL integration", () => {
  after(async () => {
    await db.delete(user).where(eq(user.id, testUserId));
  });

  test("persists, isolates, soft deletes, and restores finance data", async () => {
    await db.insert(user).values({
      id: testUserId,
      name: "Integration Test",
      email: `${testUserId}@example.com`,
      emailVerified: true,
    });

    const wallet = await createWallet(testUserId, {
      name: "Integration Bank",
      type: "bank",
      initialBalance: 1000000,
    });
    const transaction = await createTransaction(testUserId, {
      date: "2026-06-18",
      name: "Integration Income",
      type: "income",
      category: "Gaji",
      amount: 500000,
      walletId: wallet.id,
      note: null,
    });
    const budget = await createBudget(testUserId, {
      month: "2026-06",
      category: "Makanan",
      limit: 750000,
    });

    const createdState = await getFinanceState(testUserId);
    assert.equal(createdState.wallets.length, 1);
    assert.equal(createdState.transactions.length, 1);
    assert.equal(createdState.budgets.length, 1);

    await deleteTransaction(testUserId, transaction.id);
    await deleteBudget(testUserId, budget.id);
    const deletedState = await getFinanceState(testUserId);
    assert.equal(deletedState.transactions.length, 0);
    assert.equal(deletedState.budgets.length, 0);

    await restoreTransaction(testUserId, transaction.id);
    await restoreBudget(testUserId, budget.id);
    const restoredState = await getFinanceState(testUserId);
    assert.equal(restoredState.transactions[0]?.id, transaction.id);
    assert.equal(restoredState.budgets[0]?.id, budget.id);

    const unrelatedState = await getFinanceState("unrelated-user");
    assert.deepEqual(unrelatedState, {
      transactions: [],
      wallets: [],
      budgets: [],
    });
  });
});
