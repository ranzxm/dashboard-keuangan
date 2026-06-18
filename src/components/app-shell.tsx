"use client";

import {
  ArrowLeftRight,
  LayoutDashboard,
  Menu,
  PiggyBank,
  LogOut,
  WalletCards,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useState } from "react";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { authClient } from "@/lib/auth-client";
import { useFinance } from "@/context/finance-context";

const navigation = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/wallets", label: "Wallets", icon: WalletCards },
  { href: "/budget", label: "Budget", icon: PiggyBank },
] as const;

export function AppShell({
  children,
}: {
  children: ReactNode;
}): React.ReactNode {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const { error, isReady } = useFinance();

  if (pathname === "/sign-in" || pathname === "/sign-up") {
    return children;
  }

  if (!isReady) {
    return <div className="page-loading"><span /><span /><span /></div>;
  }

  if (error !== null) {
    return (
      <div className="fatal-error">
        <p className="eyebrow">Koneksi data gagal</p>
        <h2>Data keuangan tidak dapat dimuat</h2>
        <p>{error}</p>
        <button
          className="button button-primary"
          type="button"
          onClick={() => window.location.reload()}
        >
          Muat ulang
        </button>
      </div>
    );
  }

  const signOut = async (): Promise<void> => {
    await authClient.signOut();
    window.location.assign("/sign-in");
  };

  return (
    <div className="app-shell">
      <aside className={`sidebar ${isMenuOpen ? "sidebar-open" : ""}`}>
        <div className="brand-row">
          <Link className="brand" href="/" onClick={() => setIsMenuOpen(false)}>
            <span className="brand-mark">K</span>
            <span>
              <strong>Kuwang</strong>
              <small>Personal finance</small>
            </span>
          </Link>
          <button
            aria-label="Tutup navigasi"
            className="icon-button mobile-only"
            type="button"
            onClick={() => setIsMenuOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <p className="nav-label">Menu utama</p>
          {navigation.map(({ href, label, icon: Icon }) => {
            const isActive =
              href === "/" ? pathname === href : pathname.startsWith(href);

            return (
              <Link
                className={isActive ? "active" : ""}
                href={href}
                key={href}
                onClick={() => setIsMenuOpen(false)}
              >
                <Icon size={19} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <p className="nav-label">Tampilan</p>
          <ThemeSwitcher />
          <div className="sidebar-note">
            <span>Database PostgreSQL</span>
            <small>Tersinkron ke database</small>
          </div>
          <button className="sign-out-button" type="button" onClick={signOut}>
            <LogOut size={16} />
            Keluar
          </button>
        </div>
      </aside>

      {isMenuOpen ? (
        <button
          aria-label="Tutup navigasi"
          className="sidebar-overlay"
          type="button"
          onClick={() => setIsMenuOpen(false)}
        />
      ) : null}

      <main className="main-content">
        <header className="mobile-header">
          <button
            aria-label="Buka navigasi"
            className="icon-button"
            type="button"
            onClick={() => setIsMenuOpen(true)}
          >
            <Menu size={21} />
          </button>
          <Link className="mobile-brand" href="/">
            <span className="brand-mark">K</span>
            <strong>Kuwang</strong>
          </Link>
          <span className="mobile-header-spacer" />
        </header>
        <div className="page-container">{children}</div>
      </main>
    </div>
  );
}
