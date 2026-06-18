"use client";

import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  CircleDollarSign,
  PiggyBank,
  WalletCards,
} from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { TransactionTable } from "@/components/transactions/transaction-table";
import { useFinance } from "@/context/finance-context";
import {
  addMoney,
  calculateBudgetSpent,
  calculateMonthlySeries,
  calculateMonthlyTotal,
  calculateTotalBalance,
  divideMoney,
  formatCompactCurrency,
  formatCurrency,
  getCurrentMonth,
  isNegativeMoney,
  moneyToNumber,
  parseMoney,
  sortTransactionsNewest,
  subtractMoney,
} from "@/lib/finance";

const chartPoints = (
  values: bigint[],
  width: number,
  height: number,
  maximum: bigint,
): string => {
  const step = width / (values.length - 1);
  const maximumValue = moneyToNumber(maximum);

  return values
    .map((value, index) => {
      const x = index * step;
      const y = height - (moneyToNumber(value) / maximumValue) * (height - 12) - 6;
      return `${x},${y}`;
    })
    .join(" ");
};

export default function DashboardPage(): React.ReactNode {
  const { budgets, transactions, wallets } = useFinance();
  const month = getCurrentMonth();
  const income = calculateMonthlyTotal(transactions, month, "income");
  const expense = calculateMonthlyTotal(transactions, month, "expense");
  const totalBalance = calculateTotalBalance(wallets, transactions);
  const monthlyBudgets = budgets.filter((budget) => budget.month === month);
  const budgetLimit = monthlyBudgets.reduce(
    (total, budget) => addMoney(total, budget.limit),
    BigInt(0),
  );
  const budgetSpent = monthlyBudgets.reduce(
    (total, budget) =>
      addMoney(total, calculateBudgetSpent(budget, transactions)),
    BigInt(0),
  );
  const remainingBudget = subtractMoney(budgetLimit, budgetSpent);
  const recentTransactions = sortTransactionsNewest(transactions).slice(0, 5);
  const incomeChart = calculateMonthlySeries(transactions, month, "income");
  const expenseChart = calculateMonthlySeries(
    transactions,
    month,
    "expense",
  );
  const chartMaximum = [BigInt(1), ...incomeChart, ...expenseChart].reduce(
    (maximum, value) => (value > maximum ? value : maximum),
    BigInt(1),
  );
  const chartLabels = [1, 0.75, 0.5, 0.25, 0].map((ratio) =>
    formatCompactCurrency(BigInt(Math.round(moneyToNumber(chartMaximum) * ratio))),
  );

  const metrics = [
    {
      label: "Total saldo",
      value: formatCurrency(totalBalance),
      detail: `${wallets.length} wallet aktif`,
      icon: WalletCards,
      tone: "primary",
    },
    {
      label: "Pemasukan bulan ini",
      value: formatCurrency(income),
      detail: "Arus kas masuk",
      icon: ArrowDownLeft,
      tone: "income",
    },
    {
      label: "Pengeluaran bulan ini",
      value: formatCurrency(expense),
      detail: `${income === BigInt(0) ? 0 : Math.round(divideMoney(expense, income) * 100)}% dari pemasukan`,
      icon: ArrowUpRight,
      tone: "expense",
    },
    {
      label: "Sisa budget",
      value: formatCurrency(remainingBudget),
      detail: `${monthlyBudgets.length} kategori bulan ini`,
      icon: PiggyBank,
      tone: isNegativeMoney(remainingBudget) ? "expense" : "warning",
    },
  ];

  return (
    <>
      <header className="page-header">
        <div>
          <p className="eyebrow">Ringkasan keuangan</p>
          <h1>Selamat datang di Kuwang</h1>
          <p>Pantau arus uangmu dan ambil keputusan dengan lebih tenang.</p>
        </div>
        <Link className="button button-primary" href="/transactions">
          <CircleDollarSign size={17} />
          Catat transaksi
        </Link>
      </header>

      <div className="metric-grid">
        {metrics.map(({ detail, icon: Icon, label, tone, value }) => (
          <Card className="metric-card" key={label}>
            <div className={`metric-icon metric-${tone}`}>
              <Icon size={20} />
            </div>
            <p>{label}</p>
            <strong>{value}</strong>
            <span>{detail}</span>
          </Card>
        ))}
      </div>

      <div className="dashboard-grid">
        <Card className="chart-card">
          <div className="card-header">
            <div>
              <h2>Arus kas bulan ini</h2>
              <p>Perbandingan pemasukan dan pengeluaran</p>
            </div>
            <div className="chart-legend">
              <span><i className="income-dot" /> Pemasukan</span>
              <span><i className="expense-dot" /> Pengeluaran</span>
            </div>
          </div>
          <div className="chart-summary">
            <div>
              <span>Net cashflow</span>
              <strong>{formatCurrency(subtractMoney(income, expense))}</strong>
            </div>
            <span className="badge badge-income">Positif</span>
          </div>
          <div className="chart-area">
            <div className="chart-y-labels">
              {chartLabels.map((label) => (
                <span key={label}>{label}</span>
              ))}
            </div>
            <svg
              aria-label="Grafik pemasukan dan pengeluaran bulan ini"
              preserveAspectRatio="none"
              role="img"
              viewBox="0 0 640 220"
            >
              <defs>
                <linearGradient id="income-fill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="var(--income)" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="var(--income)" stopOpacity="0" />
                </linearGradient>
              </defs>
              {[0, 55, 110, 165, 220].map((y) => (
                <line
                  key={y}
                  stroke="var(--border)"
                  strokeDasharray="4 6"
                  x1="0"
                  x2="640"
                  y1={y}
                  y2={y}
                />
              ))}
              <polygon
                fill="url(#income-fill)"
                points={`0,220 ${chartPoints(incomeChart, 640, 220, chartMaximum)} 640,220`}
              />
              <polyline
                fill="none"
                points={chartPoints(incomeChart, 640, 220, chartMaximum)}
                stroke="var(--income)"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="3"
              />
              <polyline
                fill="none"
                points={chartPoints(expenseChart, 640, 220, chartMaximum)}
                stroke="var(--expense)"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="3"
              />
            </svg>
          </div>
          <div className="chart-x-labels">
            <span>1 Jun</span>
            <span>5 Jun</span>
            <span>10 Jun</span>
            <span>15 Jun</span>
            <span>20 Jun</span>
            <span>25 Jun</span>
            <span>30 Jun</span>
          </div>
        </Card>

        <Card className="budget-overview-card">
          <div className="card-header">
            <div>
              <h2>Budget bulan ini</h2>
              <p>Penggunaan per kategori</p>
            </div>
            <Link className="inline-link" href="/budget">
              Lihat semua <ArrowRight size={14} />
            </Link>
          </div>
          <div className="budget-overview-list">
            {monthlyBudgets.slice(0, 5).map((budget) => {
              const spent = calculateBudgetSpent(budget, transactions);
              const percentage = Math.round(
                divideMoney(spent, parseMoney(budget.limit)) * 100,
              );
              const remaining = subtractMoney(budget.limit, spent);

              return (
                <div className="mini-budget" key={budget.id}>
                  <div>
                    <strong>{budget.category}</strong>
                    <span>{formatCurrency(remaining)} tersisa</span>
                  </div>
                  <b>{percentage}%</b>
                  <div className="progress-track">
                    <span
                      className={
                        percentage >= 100
                          ? "progress-danger"
                          : percentage >= 80
                            ? "progress-warning"
                            : ""
                      }
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <Card className="recent-card">
        <div className="card-header">
          <div>
            <h2>Transaksi terbaru</h2>
            <p>Aktivitas keuangan paling baru</p>
          </div>
          <Link className="inline-link" href="/transactions">
            Lihat semua <ArrowRight size={14} />
          </Link>
        </div>
        <TransactionTable
          onDelete={null}
          onEdit={null}
          transactions={recentTransactions}
          wallets={wallets}
        />
      </Card>
    </>
  );
}
