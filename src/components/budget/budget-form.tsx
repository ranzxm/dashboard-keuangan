"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { useFinance } from "@/context/finance-context";
import { expenseCategories } from "@/data/initial-data";
import { getCurrentMonth } from "@/lib/finance";
import type { Budget, BudgetInput } from "@/types/finance";

const createInitialValue = (budget: Budget | null): BudgetInput =>
  budget === null
    ? { month: getCurrentMonth(), category: "Makanan", limit: 0 }
    : {
        month: budget.month,
        category: budget.category,
        limit: budget.limit,
      };

export function BudgetForm({
  budget,
  onCancel,
  onSuccess,
}: {
  budget: Budget | null;
  onCancel: () => void;
  onSuccess: () => void;
}): React.ReactNode {
  const { addBudget, updateBudget } = useFinance();
  const [value, setValue] = useState<BudgetInput>(() =>
    createInitialValue(budget),
  );
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const submit = async (
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();
    setError(null);

    if (value.limit <= 0) {
      setError("Limit budget harus lebih besar dari nol.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (budget === null) {
        await addBudget(value);
      } else {
        await updateBudget(budget.id, value);
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
        <FormField label="Bulan">
          <input
            required={true}
            className="input"
            type="month"
            value={value.month}
            onChange={(event) =>
              setValue((current) => ({
                ...current,
                month: event.target.value,
              }))
            }
          />
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
            {expenseCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </FormField>
        <div className="form-field-full">
          <FormField label="Limit budget">
            <input
              required={true}
              className="input"
              min="1"
              placeholder="0"
              type="number"
              value={value.limit || ""}
              onChange={(event) =>
                setValue((current) => ({
                  ...current,
                  limit: Number(event.target.value),
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
            : budget === null
              ? "Simpan budget"
              : "Simpan perubahan"}
        </Button>
      </div>
    </form>
  );
}
