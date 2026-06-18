"use client";

import { AlertTriangle, Pencil, PiggyBank, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { BudgetForm } from "@/components/budget/budget-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Modal } from "@/components/ui/modal";
import { useFinance } from "@/context/finance-context";
import { useToast } from "@/context/toast-context";
import {
  calculateBudgetSpent,
  formatCurrency,
  formatMonth,
  getCurrentMonth,
} from "@/lib/finance";
import type { Budget } from "@/types/finance";

export default function BudgetPage(): React.ReactNode {
  const { budgets, deleteBudget, restoreBudget, transactions } = useFinance();
  const { showToast } = useToast();
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonth());
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [deletingBudget, setDeletingBudget] = useState<Budget | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const visibleBudgets = useMemo(
    () =>
      budgets
        .filter((budget) => budget.month === selectedMonth)
        .sort((first, second) =>
          first.category.localeCompare(second.category),
        ),
    [budgets, selectedMonth],
  );

  const totals = visibleBudgets.reduce(
    (summary, budget) => {
      const spent = calculateBudgetSpent(budget, transactions);
      return {
        limit: summary.limit + budget.limit,
        spent: summary.spent + spent,
      };
    },
    { limit: 0, spent: 0 },
  );

  const openCreateModal = (): void => {
    setEditingBudget(null);
    setIsModalOpen(true);
  };

  const openEditModal = (budget: Budget): void => {
    setEditingBudget(budget);
    setIsModalOpen(true);
  };

  const closeModal = (): void => {
    setEditingBudget(null);
    setIsModalOpen(false);
  };

  const removeBudget = (budget: Budget): void => {
    setDeletingBudget(budget);
  };

  const confirmDeleteBudget = async (): Promise<void> => {
    if (deletingBudget === null) {
      throw new Error("Budget yang akan dihapus tidak ditemukan.");
    }

    const deletedBudget = deletingBudget;
    await deleteBudget(deletedBudget.id);
    setDeletingBudget(null);
    showToast({
      message: `Budget ${deletedBudget.category} telah dihapus.`,
      actionLabel: "Batalkan",
      duration: 6000,
      onAction: async () => restoreBudget(deletedBudget),
    });
  };

  return (
    <>
      <header className="page-header">
        <div>
          <p className="eyebrow">Rencana pengeluaran</p>
          <h1>Budget</h1>
          <p>Atur batas pengeluaran bulanan agar tujuan tetap terjaga.</p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus size={17} />
          Tambah budget
        </Button>
      </header>

      <div className="budget-toolbar">
        <label>
          <span>Periode budget</span>
          <input
            className="input"
            type="month"
            value={selectedMonth}
            onChange={(event) => setSelectedMonth(event.target.value)}
          />
        </label>
      </div>

      <div className="budget-summary-grid">
        <Card>
          <span>Total limit</span>
          <strong>{formatCurrency(totals.limit)}</strong>
          <small>{visibleBudgets.length} kategori</small>
        </Card>
        <Card>
          <span>Sudah digunakan</span>
          <strong className="amount-expense">
            {formatCurrency(totals.spent)}
          </strong>
          <small>
            {totals.limit === 0
              ? 0
              : Math.round((totals.spent / totals.limit) * 100)}
            % dari limit
          </small>
        </Card>
        <Card>
          <span>Sisa budget</span>
          <strong
            className={
              totals.limit - totals.spent < 0 ? "amount-expense" : ""
            }
          >
            {formatCurrency(totals.limit - totals.spent)}
          </strong>
          <small>{formatMonth(selectedMonth)}</small>
        </Card>
      </div>

      {visibleBudgets.length === 0 ? (
        <Card>
          <EmptyState
            description={`Belum ada budget untuk ${formatMonth(selectedMonth)}.`}
            icon={PiggyBank}
            title="Budget belum dibuat"
          />
        </Card>
      ) : (
        <div className="budget-grid">
          {visibleBudgets.map((budget) => {
            const spent = calculateBudgetSpent(budget, transactions);
            const remaining = budget.limit - spent;
            const percentage = Math.round((spent / budget.limit) * 100);
            const status =
              percentage >= 100
                ? "Terlewati"
                : percentage >= 80
                  ? "Hampir habis"
                  : "Terkendali";

            return (
              <Card className="budget-card" key={budget.id}>
                <div className="budget-card-header">
                  <div className="budget-category-icon">
                    <PiggyBank size={19} />
                  </div>
                  <div>
                    <h2>{budget.category}</h2>
                    <span>{formatMonth(budget.month)}</span>
                  </div>
                  <div className="row-actions">
                    <button
                      aria-label={`Edit budget ${budget.category}`}
                      type="button"
                      onClick={() => openEditModal(budget)}
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      aria-label={`Hapus budget ${budget.category}`}
                      className="danger"
                      type="button"
                      onClick={() => removeBudget(budget)}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
                <div className="budget-numbers">
                  <div>
                    <span>Terpakai</span>
                    <strong>{formatCurrency(spent)}</strong>
                  </div>
                  <div>
                    <span>Sisa</span>
                    <strong className={remaining < 0 ? "amount-expense" : ""}>
                      {formatCurrency(remaining)}
                    </strong>
                  </div>
                </div>
                <div className="budget-progress-head">
                  <span>Limit {formatCurrency(budget.limit)}</span>
                  <b>{percentage}%</b>
                </div>
                <div className="progress-track progress-track-large">
                  <span
                    className={
                      percentage >= 100
                        ? "progress-danger"
                        : percentage >= 80
                          ? "progress-warning"
                          : ""
                    }
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
                <div
                  className={`budget-status ${
                    percentage >= 100
                      ? "status-danger"
                      : percentage >= 80
                        ? "status-warning"
                        : "status-safe"
                  }`}
                >
                  {percentage >= 80 ? <AlertTriangle size={14} /> : null}
                  {status}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        title={editingBudget === null ? "Tambah budget" : "Edit budget"}
        onClose={closeModal}
      >
        <BudgetForm
          key={editingBudget?.id ?? "new"}
          budget={editingBudget}
          onCancel={closeModal}
          onSuccess={closeModal}
        />
      </Modal>

      <ConfirmDialog
        confirmLabel="Hapus budget"
        description={
          deletingBudget === null
            ? ""
            : `Budget ${deletingBudget.category} untuk ${formatMonth(deletingBudget.month)} akan dihapus permanen. Transaksi yang sudah tercatat tidak ikut terhapus.`
        }
        isOpen={deletingBudget !== null}
        title="Hapus budget ini?"
        onCancel={() => setDeletingBudget(null)}
        onConfirm={confirmDeleteBudget}
      />
    </>
  );
}
