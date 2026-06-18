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
  deleteWallet,
  getFinanceState,
  restoreBudget,
  restoreTransaction,
  restoreWallet,
} from "@/db/finance-repository";
import { ApiError } from "@/lib/api-response";
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
      initialBalance: "1000000",
    });
    const transaction = await createTransaction(testUserId, {
      date: "2026-06-18",
      name: "Integration Income",
      type: "income",
      category: "Gaji",
      amount: "500000",
      walletId: wallet.id,
      note: null,
    });
    const budget = await createBudget(testUserId, {
      month: "2026-06",
      category: "Makanan",
      limit: "750000",
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

  test("rejects restoring records that are already active", async () => {
    const wallet = await createWallet(testUserId, {
      name: `Active Wallet ${crypto.randomUUID()}`,
      type: "bank",
      initialBalance: "500000",
    });
    const budget = await createBudget(testUserId, {
      month: "2026-07",
      category: `Kategori ${crypto.randomUUID()}`,
      limit: "250000",
    });
    const transaction = await createTransaction(testUserId, {
      date: "2026-07-01",
      name: "Already Active",
      type: "expense",
      category: "Makanan",
      amount: "10000",
      walletId: wallet.id,
      note: null,
    });

    await assert.rejects(
      restoreWallet(testUserId, wallet.id),
      (error: unknown) =>
        error instanceof ApiError &&
        error.status === 409 &&
        error.message.includes("sudah aktif"),
    );
    await assert.rejects(
      restoreBudget(testUserId, budget.id),
      (error: unknown) =>
        error instanceof ApiError &&
        error.status === 409 &&
        error.message.includes("sudah aktif"),
    );
    await assert.rejects(
      restoreTransaction(testUserId, transaction.id),
      (error: unknown) =>
        error instanceof ApiError &&
        error.status === 409 &&
        error.message.includes("sudah aktif"),
    );
  });

  test("rejects restoring budget and wallet when active duplicates exist", async () => {
    const walletName = `Restore Conflict Wallet ${crypto.randomUUID()}`;
    const walletToRestore = await createWallet(testUserId, {
      name: walletName,
      type: "bank",
      initialBalance: "100000",
    });

    await deleteWallet(testUserId, walletToRestore.id);
    await createWallet(testUserId, {
      name: walletName,
      type: "cash",
      initialBalance: "200000",
    });

    await assert.rejects(
      restoreWallet(testUserId, walletToRestore.id),
      (error: unknown) =>
        error instanceof ApiError &&
        error.status === 409 &&
        error.message.includes("nama yang sama sudah digunakan"),
    );

    const budgetCategory = `Conflict ${crypto.randomUUID()}`;
    const budgetToRestore = await createBudget(testUserId, {
      month: "2026-08",
      category: budgetCategory,
      limit: "100000",
    });

    await deleteBudget(testUserId, budgetToRestore.id);
    await createBudget(testUserId, {
      month: "2026-08",
      category: budgetCategory,
      limit: "120000",
    });

    await assert.rejects(
      restoreBudget(testUserId, budgetToRestore.id),
      (error: unknown) =>
        error instanceof ApiError &&
        error.status === 409 &&
        error.message.includes("tidak dapat dipulihkan"),
    );
  });
});
