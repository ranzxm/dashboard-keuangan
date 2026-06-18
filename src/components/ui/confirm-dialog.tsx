"use client";

import { AlertTriangle, Trash2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

export function ConfirmDialog({
  confirmLabel,
  description,
  isOpen,
  onCancel,
  onConfirm,
  title,
}: {
  confirmLabel: string;
  description: string;
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
}): React.ReactNode {
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const closeOnEscape = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        onCancel();
      }
    };

    document.addEventListener("keydown", closeOnEscape);
    document.body.style.overflow = "hidden";
    cancelButtonRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onCancel]);

  if (!isOpen) {
    return null;
  }

  const confirm = async (): Promise<void> => {
    setError(null);
    setIsConfirming(true);

    try {
      await onConfirm();
    } catch (caughtError) {
      if (caughtError instanceof Error) {
        setError(caughtError.message);
        return;
      }

      throw caughtError;
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <div
      aria-describedby="confirm-dialog-description"
      aria-labelledby="confirm-dialog-title"
      aria-modal="true"
      className="modal-backdrop confirm-dialog-backdrop"
      role="alertdialog"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) {
          onCancel();
        }
      }}
    >
      <div className="modal-panel confirm-dialog">
        <button
          aria-label="Tutup konfirmasi"
          className="confirm-dialog-close"
          type="button"
          onClick={onCancel}
        >
          <X size={18} />
        </button>
        <div className="confirm-dialog-icon">
          <AlertTriangle size={23} />
        </div>
        <div className="confirm-dialog-content">
          <p className="eyebrow">Konfirmasi tindakan</p>
          <h2 id="confirm-dialog-title">{title}</h2>
          <p id="confirm-dialog-description">{description}</p>
        </div>
        {error !== null ? <p className="error-message">{error}</p> : null}
        <div className="confirm-dialog-actions">
          <Button
            disabled={isConfirming}
            ref={cancelButtonRef}
            variant="secondary"
            onClick={onCancel}
          >
            Batal
          </Button>
          <Button
            disabled={isConfirming}
            variant="danger"
            onClick={confirm}
          >
            <Trash2 size={16} />
            {isConfirming ? "Menghapus..." : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
