"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { useFinance } from "@/context/finance-context";
import type { Money } from "@/types/finance";
import type { Wallet, WalletInput, WalletType } from "@/types/finance";

const createInitialValue = (wallet: Wallet | null): WalletInput =>
  wallet === null
    ? { name: "", type: "bank", initialBalance: "0" }
    : {
        name: wallet.name,
        type: wallet.type,
        initialBalance: wallet.initialBalance,
      };

export function WalletForm({
  onCancel,
  onSuccess,
  wallet,
}: {
  onCancel: () => void;
  onSuccess: () => void;
  wallet: Wallet | null;
}): React.ReactNode {
  const { addWallet, updateWallet } = useFinance();
  const [value, setValue] = useState<WalletInput>(() =>
    createInitialValue(wallet),
  );
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const submit = async (
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();
    setError(null);

    if (value.name.trim() === "") {
      setError("Nama wallet wajib diisi.");
      return;
    }

    if (!/^\d+$/.test(value.initialBalance)) {
      setError("Saldo awal harus berupa angka bulat tanpa desimal.");
      return;
    }

    const input: WalletInput = {
      ...value,
      name: value.name.trim(),
    };

    setIsSubmitting(true);

    try {
      if (wallet === null) {
        await addWallet(input);
      } else {
        await updateWallet(wallet.id, input);
      }
      onSuccess();
    } catch (caughtError) {
      if (caughtError instanceof Error) {
        setError(caughtError.message);
        return;
      }

      throw caughtError;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit}>
      <div className="form-grid">
        <FormField label="Nama wallet">
          <input
            required={true}
            className="input"
            placeholder="Contoh: BCA Utama"
            value={value.name}
            onChange={(event) =>
              setValue((current) => ({
                ...current,
                name: event.target.value,
              }))
            }
          />
        </FormField>
        <FormField label="Jenis wallet">
          <select
            className="input"
            value={value.type}
            onChange={(event) =>
              setValue((current) => ({
                ...current,
                type: event.target.value as WalletType,
              }))
            }
          >
            <option value="cash">Cash</option>
            <option value="bank">Bank</option>
            <option value="e-wallet">E-wallet</option>
            <option value="other">Lainnya</option>
          </select>
        </FormField>
        <div className="form-field-full">
          <FormField label="Saldo awal">
            <input
              required={true}
              className="input"
              min="0"
              placeholder="0"
              type="number"
              inputMode="numeric"
              step="1"
              value={value.initialBalance === "0" ? "" : value.initialBalance}
              onChange={(event) =>
                setValue((current) => ({
                  ...current,
                  initialBalance: sanitizeMoneyInput(event.target.value),
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
        <Button disabled={isSubmitting} type="submit">
          {isSubmitting
            ? "Menyimpan..."
            : wallet === null
              ? "Simpan wallet"
              : "Simpan perubahan"}
        </Button>
      </div>
    </form>
  );
}

const sanitizeMoneyInput = (value: string): Money => {
  const digits = value.replace(/\D/g, "");

  return digits === "" ? "0" : digits;
};
