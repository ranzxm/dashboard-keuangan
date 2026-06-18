"use client";

import {
  Banknote,
  Building2,
  CreditCard,
  Pencil,
  Plus,
  Trash2,
  WalletCards,
} from "lucide-react";
import { useState } from "react";
import { WalletForm } from "@/components/wallets/wallet-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Modal } from "@/components/ui/modal";
import { useFinance } from "@/context/finance-context";
import { useToast } from "@/context/toast-context";
import {
  calculateTotalBalance,
  calculateWalletBalance,
  formatCurrency,
} from "@/lib/finance";
import type { Wallet, WalletType } from "@/types/finance";

const walletIcons = {
  cash: Banknote,
  bank: Building2,
  "e-wallet": CreditCard,
  other: WalletCards,
} satisfies Record<WalletType, typeof Banknote>;

const walletLabels: Record<WalletType, string> = {
  cash: "Cash",
  bank: "Bank",
  "e-wallet": "E-wallet",
  other: "Lainnya",
};

export default function WalletsPage(): React.ReactNode {
  const { deleteWallet, restoreWallet, transactions, wallets } = useFinance();
  const { showToast } = useToast();
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);
  const [deletingWallet, setDeletingWallet] = useState<Wallet | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const totalBalance = calculateTotalBalance(wallets, transactions);

  const openCreateModal = (): void => {
    setEditingWallet(null);
    setIsModalOpen(true);
  };

  const openEditModal = (wallet: Wallet): void => {
    setEditingWallet(wallet);
    setIsModalOpen(true);
  };

  const closeModal = (): void => {
    setIsModalOpen(false);
    setEditingWallet(null);
  };

  const removeWallet = (wallet: Wallet): void => {
    setDeletingWallet(wallet);
  };

  const confirmDeleteWallet = (): void => {
    if (deletingWallet === null) {
      throw new Error("Wallet yang akan dihapus tidak ditemukan.");
    }

    const deletedWallet = deletingWallet;

    try {
      deleteWallet(deletedWallet.id);
      setError(null);
      setDeletingWallet(null);
      showToast({
        message: `Wallet “${deletedWallet.name}” telah dihapus.`,
        actionLabel: "Batalkan",
        duration: 6000,
        onAction: () => restoreWallet(deletedWallet),
      });
    } catch (caughtError) {
      if (caughtError instanceof Error) {
        setError(caughtError.message);
        setDeletingWallet(null);
        return;
      }

      throw caughtError;
    }
  };

  return (
    <>
      <header className="page-header">
        <div>
          <p className="eyebrow">Sumber dana</p>
          <h1>Wallets</h1>
          <p>Kelola tempat uangmu disimpan dan pantau saldonya.</p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus size={17} />
          Tambah wallet
        </Button>
      </header>

      <Card className="wallet-total-card">
        <div className="wallet-total-icon">
          <WalletCards size={24} />
        </div>
        <div>
          <span>Total saldo seluruh wallet</span>
          <strong>{formatCurrency(totalBalance)}</strong>
          <p>{wallets.length} wallet terhubung</p>
        </div>
      </Card>

      {error !== null ? (
        <div className="page-error">
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)}>
            Tutup
          </button>
        </div>
      ) : null}

      {wallets.length === 0 ? (
        <Card>
          <EmptyState
            description="Buat wallet pertama untuk mulai mencatat transaksi."
            icon={WalletCards}
            title="Belum ada wallet"
          />
        </Card>
      ) : (
        <div className="wallet-grid">
          {wallets.map((wallet) => {
            const Icon = walletIcons[wallet.type];
            const currentBalance = calculateWalletBalance(wallet, transactions);
            const relatedTransactions = transactions.filter(
              (transaction) => transaction.walletId === wallet.id,
            ).length;

            return (
              <Card className="wallet-card" key={wallet.id}>
                <div className="wallet-card-top">
                  <div className={`wallet-type-icon wallet-${wallet.type}`}>
                    <Icon size={20} />
                  </div>
                  <div className="row-actions">
                    <button
                      aria-label={`Edit ${wallet.name}`}
                      type="button"
                      onClick={() => openEditModal(wallet)}
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      aria-label={`Hapus ${wallet.name}`}
                      className="danger"
                      type="button"
                      onClick={() => removeWallet(wallet)}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
                <div className="wallet-card-body">
                  <span className="badge badge-neutral">
                    {walletLabels[wallet.type]}
                  </span>
                  <h2>{wallet.name}</h2>
                  <p>Saldo saat ini</p>
                  <strong>{formatCurrency(currentBalance)}</strong>
                </div>
                <div className="wallet-card-footer">
                  <span>Saldo awal {formatCurrency(wallet.initialBalance)}</span>
                  <span>{relatedTransactions} transaksi</span>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        title={editingWallet === null ? "Tambah wallet" : "Edit wallet"}
        onClose={closeModal}
      >
        <WalletForm
          key={editingWallet?.id ?? "new"}
          wallet={editingWallet}
          onCancel={closeModal}
          onSuccess={closeModal}
        />
      </Modal>

      <ConfirmDialog
        confirmLabel="Hapus wallet"
        description={
          deletingWallet === null
            ? ""
            : `Wallet “${deletingWallet.name}” akan dihapus permanen. Wallet yang masih memiliki transaksi tidak dapat dihapus.`
        }
        isOpen={deletingWallet !== null}
        title="Hapus wallet ini?"
        onCancel={() => setDeletingWallet(null)}
        onConfirm={confirmDeleteWallet}
      />
    </>
  );
}
