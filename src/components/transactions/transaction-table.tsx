import { ArrowDownLeft, ArrowUpRight, Pencil, Trash2 } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { formatCurrency, formatDate } from "@/lib/finance";
import type { Transaction, Wallet } from "@/types/finance";

export function TransactionTable({
  onDelete,
  onEdit,
  transactions,
  wallets,
}: {
  onDelete: ((transaction: Transaction) => void) | null;
  onEdit: ((transaction: Transaction) => void) | null;
  transactions: Transaction[];
  wallets: Wallet[];
}): React.ReactNode {
  if (transactions.length === 0) {
    return (
      <EmptyState
        description="Tambahkan transaksi baru atau ubah filter yang sedang digunakan."
        icon={ArrowUpRight}
        title="Belum ada transaksi"
      />
    );
  }

  const walletNames = new Map(
    wallets.map((wallet) => [wallet.id, wallet.name]),
  );
  const hasActions = onDelete !== null || onEdit !== null;

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Transaksi</th>
            <th>Tanggal</th>
            <th>Tipe</th>
            <th>Kategori</th>
            <th>Wallet</th>
            <th>Nominal</th>
            {hasActions ? <th aria-label="Aksi" /> : null}
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => {
            const isIncome = transaction.type === "income";

            return (
              <tr key={transaction.id}>
                <td>
                  <div className="transaction-name">
                    <strong>{transaction.name}</strong>
                    <span>{transaction.note ?? "Tanpa catatan"}</span>
                  </div>
                </td>
                <td>{formatDate(transaction.date)}</td>
                <td>
                  <span
                    className={`badge ${
                      isIncome ? "badge-income" : "badge-expense"
                    }`}
                  >
                    {isIncome ? (
                      <ArrowDownLeft size={12} />
                    ) : (
                      <ArrowUpRight size={12} />
                    )}
                    {isIncome ? "Income" : "Expense"}
                  </span>
                </td>
                <td>{transaction.category}</td>
                <td>
                  <span className="badge badge-neutral">
                    {walletNames.get(transaction.walletId) ??
                      "Wallet tidak ditemukan"}
                  </span>
                </td>
                <td
                  className={`amount ${
                    isIncome ? "amount-income" : "amount-expense"
                  }`}
                >
                  {isIncome ? "+" : "-"}
                  {formatCurrency(transaction.amount)}
                </td>
                {hasActions ? (
                  <td>
                    <div className="row-actions">
                      {onEdit !== null ? (
                        <button
                          aria-label={`Edit ${transaction.name}`}
                          type="button"
                          onClick={() => onEdit(transaction)}
                        >
                          <Pencil size={15} />
                        </button>
                      ) : null}
                      {onDelete !== null ? (
                        <button
                          aria-label={`Hapus ${transaction.name}`}
                          className="danger"
                          type="button"
                          onClick={() => onDelete(transaction)}
                        >
                          <Trash2 size={15} />
                        </button>
                      ) : null}
                    </div>
                  </td>
                ) : null}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
