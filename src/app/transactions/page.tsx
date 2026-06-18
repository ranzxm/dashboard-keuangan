"use client";

import { Filter, Plus, SearchX } from "lucide-react";
import { useMemo, useState } from "react";
import { TransactionForm } from "@/components/transactions/transaction-form";
import { TransactionTable } from "@/components/transactions/transaction-table";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Modal } from "@/components/ui/modal";
import { useFinance } from "@/context/finance-context";
import { useToast } from "@/context/toast-context";
import { transactionCategories } from "@/data/initial-data";
import {
  filterTransactions,
  sortTransactionsNewest,
} from "@/lib/finance";
import type {
  Transaction,
  TransactionFilters,
  TransactionType,
} from "@/types/finance";

const emptyFilters: TransactionFilters = {
  startDate: "",
  endDate: "",
  type: "all",
  category: "all",
  walletId: "all",
};

export default function TransactionsPage(): React.ReactNode {
  const {
    deleteTransaction,
    restoreTransaction,
    transactions,
    wallets,
  } = useFinance();
  const { showToast } = useToast();
  const [filters, setFilters] = useState<TransactionFilters>(emptyFilters);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [deletingTransaction, setDeletingTransaction] =
    useState<Transaction | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const filteredTransactions = useMemo(
    () =>
      sortTransactionsNewest(filterTransactions(transactions, filters)),
    [filters, transactions],
  );

  const openCreateModal = (): void => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  const openEditModal = (transaction: Transaction): void => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  const closeModal = (): void => {
    setIsModalOpen(false);
    setEditingTransaction(null);
  };

  const removeTransaction = (transaction: Transaction): void => {
    setDeletingTransaction(transaction);
  };

  const confirmDeleteTransaction = (): void => {
    if (deletingTransaction === null) {
      throw new Error("Transaksi yang akan dihapus tidak ditemukan.");
    }

    const deletedTransaction = deletingTransaction;
    deleteTransaction(deletedTransaction.id);
    setDeletingTransaction(null);
    showToast({
      message: `Transaksi “${deletedTransaction.name}” telah dihapus.`,
      actionLabel: "Batalkan",
      duration: 6000,
      onAction: () => restoreTransaction(deletedTransaction),
    });
  };

  return (
    <>
      <header className="page-header">
        <div>
          <p className="eyebrow">Arus uang</p>
          <h1>Transactions</h1>
          <p>Catat dan telusuri setiap pemasukan maupun pengeluaran.</p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus size={17} />
          Tambah transaksi
        </Button>
      </header>

      <Card className="filters-card">
        <div className="filters-title">
          <Filter size={16} />
          <strong>Filter transaksi</strong>
          <span>{filteredTransactions.length} transaksi ditemukan</span>
        </div>
        <div className="filter-grid">
          <label>
            <span>Dari tanggal</span>
            <input
              className="input"
              type="date"
              value={filters.startDate}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  startDate: event.target.value,
                }))
              }
            />
          </label>
          <label>
            <span>Sampai tanggal</span>
            <input
              className="input"
              type="date"
              value={filters.endDate}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  endDate: event.target.value,
                }))
              }
            />
          </label>
          <label>
            <span>Tipe</span>
            <select
              className="input"
              value={filters.type}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  type: event.target.value as TransactionType | "all",
                }))
              }
            >
              <option value="all">Semua tipe</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </label>
          <label>
            <span>Kategori</span>
            <select
              className="input"
              value={filters.category}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  category: event.target.value,
                }))
              }
            >
              <option value="all">Semua kategori</option>
              {transactionCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Wallet</span>
            <select
              className="input"
              value={filters.walletId}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  walletId: event.target.value,
                }))
              }
            >
              <option value="all">Semua wallet</option>
              {wallets.map((wallet) => (
                <option key={wallet.id} value={wallet.id}>
                  {wallet.name}
                </option>
              ))}
            </select>
          </label>
          <Button
            className="reset-filter"
            variant="secondary"
            onClick={() => setFilters(emptyFilters)}
          >
            <SearchX size={15} />
            Reset
          </Button>
        </div>
      </Card>

      <Card className="transactions-card">
        <TransactionTable
          onDelete={removeTransaction}
          onEdit={openEditModal}
          transactions={filteredTransactions}
          wallets={wallets}
        />
      </Card>

      <Modal
        isOpen={isModalOpen}
        title={
          editingTransaction === null
            ? "Tambah transaksi"
            : "Edit transaksi"
        }
        onClose={closeModal}
      >
        <TransactionForm
          key={editingTransaction?.id ?? "new"}
          transaction={editingTransaction}
          onCancel={closeModal}
          onSuccess={closeModal}
        />
      </Modal>

      <ConfirmDialog
        confirmLabel="Hapus transaksi"
        description={
          deletingTransaction === null
            ? ""
            : `Transaksi “${deletingTransaction.name}” akan dihapus permanen dan saldo wallet terkait akan dihitung ulang.`
        }
        isOpen={deletingTransaction !== null}
        title="Hapus transaksi ini?"
        onCancel={() => setDeletingTransaction(null)}
        onConfirm={confirmDeleteTransaction}
      />
    </>
  );
}
