"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { transactionCategories } from "@/data/initial-data";
import { useFinance } from "@/context/finance-context";
import type {
  Transaction,
  TransactionInput,
  TransactionType,
} from "@/types/finance";

const today = (): string => new Date().toISOString().slice(0, 10);

const createInitialValue = (
  transaction: Transaction | null,
): TransactionInput => {
  if (transaction !== null) {
    return {
      date: transaction.date,
      name: transaction.name,
      type: transaction.type,
      category: transaction.category,
      amount: transaction.amount,
      walletId: transaction.walletId,
      note: transaction.note,
    };
  }

  return {
    date: today(),
    name: "",
    type: "expense",
    category: "Makanan",
    amount: 0,
    walletId: "",
    note: null,
  };
};

export function TransactionForm({
  onCancel,
  onSuccess,
  transaction,
}: {
  onCancel: () => void;
  onSuccess: () => void;
  transaction: Transaction | null;
}): React.ReactNode {
  const { wallets, addTransaction, updateTransaction } = useFinance();
  const [value, setValue] = useState<TransactionInput>(() => {
    const initialValue = createInitialValue(transaction);

    return {
      ...initialValue,
      walletId: initialValue.walletId || wallets[0]?.id || "",
    };
  });
  const [error, setError] = useState<string | null>(null);

  const submit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    setError(null);

    if (value.name.trim() === "") {
      setError("Nama transaksi wajib diisi.");
      return;
    }

    if (value.amount <= 0) {
      setError("Nominal transaksi harus lebih besar dari nol.");
      return;
    }

    if (value.walletId === "") {
      setError("Pilih wallet untuk transaksi ini.");
      return;
    }

    const input: TransactionInput = {
      ...value,
      name: value.name.trim(),
      note: value.note?.trim() || null,
    };

    if (transaction === null) {
      addTransaction(input);
    } else {
      updateTransaction(transaction.id, input);
    }

    onSuccess();
  };

  return (
    <form onSubmit={submit}>
      <div className="form-grid">
        <FormField label="Tanggal">
          <input
            required={true}
            className="input"
            type="date"
            value={value.date}
            onChange={(event) =>
              setValue((current) => ({
                ...current,
                date: event.target.value,
              }))
            }
          />
        </FormField>
        <FormField label="Nama transaksi">
          <input
            required={true}
            className="input"
            placeholder="Contoh: Belanja mingguan"
            value={value.name}
            onChange={(event) =>
              setValue((current) => ({
                ...current,
                name: event.target.value,
              }))
            }
          />
        </FormField>
        <FormField label="Tipe transaksi">
          <select
            className="input"
            value={value.type}
            onChange={(event) =>
              setValue((current) => ({
                ...current,
                type: event.target.value as TransactionType,
              }))
            }
          >
            <option value="expense">Pengeluaran</option>
            <option value="income">Pemasukan</option>
          </select>
        </FormField>
        <FormField label="Kategori">
          <select
            className="input"
            value={value.category}
            onChange={(event) =>
              setValue((current) => ({
                ...current,
                category: event.target.value,
              }))
            }
          >
            {transactionCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Nominal">
          <input
            required={true}
            className="input"
            min="1"
            placeholder="0"
            type="number"
            value={value.amount || ""}
            onChange={(event) =>
              setValue((current) => ({
                ...current,
                amount: Number(event.target.value),
              }))
            }
          />
        </FormField>
        <FormField label="Wallet">
          <select
            required={true}
            className="input"
            value={value.walletId}
            onChange={(event) =>
              setValue((current) => ({
                ...current,
                walletId: event.target.value,
              }))
            }
          >
            <option disabled={true} value="">
              Pilih wallet
            </option>
            {wallets.map((wallet) => (
              <option key={wallet.id} value={wallet.id}>
                {wallet.name}
              </option>
            ))}
          </select>
        </FormField>
        <div className="form-field-full">
          <FormField label="Catatan (opsional)">
            <textarea
              className="input"
              placeholder="Tambahkan detail transaksi"
              value={value.note ?? ""}
              onChange={(event) =>
                setValue((current) => ({
                  ...current,
                  note: event.target.value,
                }))
              }
            />
          </FormField>
        </div>
      </div>
      {error !== null ? <p className="error-message">{error}</p> : null}
      <div className="form-actions">
        <Button variant="secondary" onClick={onCancel}>
          Batal
        </Button>
        <Button type="submit">
          {transaction === null ? "Simpan transaksi" : "Simpan perubahan"}
        </Button>
      </div>
    </form>
  );
}
