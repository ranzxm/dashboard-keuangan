"use client";

import { ArrowRight, LockKeyhole, Mail, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

type AuthMode = "sign-in" | "sign-up";

export function AuthForm({ mode }: { mode: AuthMode }): React.ReactNode {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const isSignIn = mode === "sign-in";

  const submit = async (
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const result = isSignIn
        ? await authClient.signIn.email({ email, password })
        : await authClient.signUp.email({ name, email, password });

      if (result.error !== null) {
        setError(result.error.message ?? "Autentikasi gagal.");
        return;
      }

      const callbackUrl = searchParams.get("callbackUrl") ?? "/";
      router.push(callbackUrl.startsWith("/") ? callbackUrl : "/");
      router.refresh();
    } catch (caughtError) {
      if (caughtError instanceof Error) {
        setError(`Autentikasi gagal: ${caughtError.message}`);
        return;
      }

      throw caughtError;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <Link className="auth-brand" href="/">
          <span className="brand-mark">K</span>
          <span>
            <strong>Kuwang</strong>
            <small>Personal finance</small>
          </span>
        </Link>
        <div className="auth-heading">
          <p className="eyebrow">{isSignIn ? "Selamat datang" : "Mulai sekarang"}</p>
          <h1>{isSignIn ? "Masuk ke akunmu" : "Buat akun Kuwang"}</h1>
          <p>
            {isSignIn
              ? "Kelola keuangan pribadi dengan aman dari satu dashboard."
              : "Data setiap pengguna disimpan terpisah dan terlindungi."}
          </p>
        </div>
        <form className="auth-form" onSubmit={submit}>
          {!isSignIn ? (
            <label>
              <span>Nama</span>
              <div className="auth-input">
                <UserRound size={17} />
                <input
                  required={true}
                  autoComplete="name"
                  maxLength={80}
                  placeholder="Nama lengkap"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </div>
            </label>
          ) : null}
          <label>
            <span>Email</span>
            <div className="auth-input">
              <Mail size={17} />
              <input
                required={true}
                autoComplete="email"
                placeholder="nama@email.com"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
          </label>
          <label>
            <span>Password</span>
            <div className="auth-input">
              <LockKeyhole size={17} />
              <input
                required={true}
                autoComplete={isSignIn ? "current-password" : "new-password"}
                minLength={10}
                placeholder="Minimal 10 karakter"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
          </label>
          {error !== null ? <p className="auth-error">{error}</p> : null}
          <Button disabled={isSubmitting} type="submit">
            {isSubmitting
              ? "Memproses..."
              : isSignIn
                ? "Masuk"
                : "Buat akun"}
            {!isSubmitting ? <ArrowRight size={16} /> : null}
          </Button>
        </form>
        <p className="auth-switch">
          {isSignIn ? "Belum memiliki akun?" : "Sudah memiliki akun?"}{" "}
          <Link href={isSignIn ? "/sign-up" : "/sign-in"}>
            {isSignIn ? "Daftar" : "Masuk"}
          </Link>
        </p>
      </section>
    </main>
  );
}
