"use client";

import { CheckCircle2, RotateCcw, X } from "lucide-react";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";

type ToastInput = {
  message: string;
  actionLabel: string;
  onAction: () => void | Promise<void>;
  duration: number;
};

type ToastItem = ToastInput & {
  id: string;
};

type ToastContextValue = {
  showToast: (input: ToastInput) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

function Toast({
  toast,
  onDismiss,
}: {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}): React.ReactNode {
  const [actionError, setActionError] = useState<string | null>(null);
  const [isRunningAction, setIsRunningAction] = useState<boolean>(false);

  useEffect(() => {
    const timer = window.setTimeout(
      () => onDismiss(toast.id),
      toast.duration,
    );

    return () => window.clearTimeout(timer);
  }, [onDismiss, toast.duration, toast.id]);

  const runAction = async (): Promise<void> => {
    setActionError(null);
    setIsRunningAction(true);

    try {
      await toast.onAction();
      onDismiss(toast.id);
    } catch (caughtError) {
      if (caughtError instanceof Error) {
        setActionError(caughtError.message);
        return;
      }

      throw caughtError;
    } finally {
      setIsRunningAction(false);
    }
  };

  return (
    <div className="toast" role="status">
      <div className="toast-icon">
        <CheckCircle2 size={19} />
      </div>
      <div className="toast-message">
        <p>{toast.message}</p>
        {actionError !== null ? <small>{actionError}</small> : null}
      </div>
      <button
        className="toast-action"
        disabled={isRunningAction}
        type="button"
        onClick={runAction}
      >
        <RotateCcw size={14} />
        {isRunningAction ? "Memulihkan..." : toast.actionLabel}
      </button>
      <button
        aria-label="Tutup notifikasi"
        className="toast-close"
        type="button"
        onClick={() => onDismiss(toast.id)}
      >
        <X size={16} />
      </button>
      <span
        aria-hidden="true"
        className="toast-progress"
        style={{ animationDuration: `${toast.duration}ms` }}
      />
    </div>
  );
}

export function ToastProvider({
  children,
}: {
  children: ReactNode;
}): React.ReactNode {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextToastId = useRef<number>(0);
  const mounted = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );

  const dismissToast = useCallback((id: string): void => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((input: ToastInput): void => {
    nextToastId.current += 1;
    const id = `toast-${Date.now()}-${nextToastId.current}`;

    setToasts((current) => [
      ...current,
      { ...input, id },
    ]);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {mounted
        ? createPortal(
            <div
              aria-label="Notifikasi"
              aria-live="polite"
              className="toast-viewport"
            >
              {toasts.map((toast) => (
                <Toast
                  key={toast.id}
                  toast={toast}
                  onDismiss={dismissToast}
                />
              ))}
            </div>,
            document.body,
          )
        : null}
    </ToastContext.Provider>
  );
}

export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);

  if (context === null) {
    throw new Error("useToast harus digunakan di dalam ToastProvider.");
  }

  return context;
};
