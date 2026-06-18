"use client";

import {
  ArrowLeftRight,
  LayoutDashboard,
  Menu,
  PiggyBank,
  WalletCards,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useState } from "react";
import { ThemeSwitcher } from "@/components/theme-switcher";

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
            <span>Data tersimpan lokal</span>
            <small>Aman di perangkat ini</small>
          </div>
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
