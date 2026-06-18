import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import type { ReactNode } from "react";
import { AppShell } from "@/components/app-shell";
import { ThemeProvider } from "@/components/theme-provider";
import { FinanceProvider } from "@/context/finance-context";
import { ToastProvider } from "@/context/toast-context";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kuwang — Personal Finance",
  description: "Dashboard keuangan pribadi untuk hidup yang lebih terencana.",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}): React.ReactNode {
  return (
    <html lang="id" suppressHydrationWarning={true}>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ThemeProvider>
          <FinanceProvider>
            <ToastProvider>
              <AppShell>{children}</AppShell>
            </ToastProvider>
          </FinanceProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
