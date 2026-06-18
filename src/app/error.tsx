"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): React.ReactNode {
  useEffect(() => {
    console.error("Application render failed", {
      errorName: error.name,
      errorMessage: error.message,
      digest: error.digest,
    });
  }, [error]);

  return (
    <div className="fatal-error">
      <AlertTriangle size={28} />
      <h2>Halaman gagal dimuat</h2>
      <p>Coba muat ulang. Jika masalah berlanjut, periksa koneksi server.</p>
      <Button onClick={reset}>
        <RefreshCw size={16} />
        Coba lagi
      </Button>
    </div>
  );
}
