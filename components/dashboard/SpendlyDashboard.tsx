"use client";

import React, { useState } from "react";
import { DashboardData, TransactionItem, KpiCardData } from "@/types/dashboard";
import { initialDashboardData } from "@/data/mockData";
import { TopNavbar } from "./TopNavbar";
import { WelcomeHeader } from "./WelcomeHeader";
import { ProfileBudgetCard } from "./ProfileBudgetCard";
import { SpendingProgressCard } from "./SpendingProgressCard";
import { SidebarAccordionCard } from "./SidebarAccordionCard";
import { TransactionCalendarCard } from "./TransactionCalendarCard";
import { TransactionDetailModal } from "./TransactionDetailModal";
import { AddTransactionModal } from "./AddTransactionModal";
import { AllTransactionsDrawer } from "./AllTransactionsDrawer";

export interface SpendlyDashboardProps {
  initialData?: Partial<DashboardData>;
  onDataSync?: (data: DashboardData) => void;
}

export const SpendlyDashboard: React.FC<SpendlyDashboardProps> = ({
  initialData,
  onDataSync,
}) => {
  // Merge initialData with defaults so user can pass partial or full data from Google Sheets/API
  const [dashboardData, setDashboardData] = useState<DashboardData>(() => ({
    ...initialDashboardData,
    ...initialData,
    user: { ...initialDashboardData.user, ...(initialData?.user || {}) },
    inlineMetrics: initialData?.inlineMetrics || initialDashboardData.inlineMetrics,
    kpis: initialData?.kpis || initialDashboardData.kpis,
    spendingProgress: {
      ...initialDashboardData.spendingProgress,
      ...(initialData?.spendingProgress || {}),
    },
    cashFlow: { ...initialDashboardData.cashFlow, ...(initialData?.cashFlow || {}) },
    categories: { ...initialDashboardData.categories, ...(initialData?.categories || {}) },
    sidebarItems: initialData?.sidebarItems || initialDashboardData.sidebarItems,
    calendarWeek: {
      ...initialDashboardData.calendarWeek,
      ...(initialData?.calendarWeek || {}),
    },
  }));

  const [activeTab, setActiveTab] = useState<string>("Dashboard");
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isAllTxDrawerOpen, setIsAllTxDrawerOpen] = useState<boolean>(false);

  // Handle adding a new transaction dynamically
  const handleAddTransaction = (newTx: TransactionItem) => {
    setDashboardData((prev) => {
      const updatedTransactions = [newTx, ...prev.calendarWeek.transactions];
      const newTotalSpent =
        prev.kpis.find((k) => k.id === "total_spent")?.numericValue || 78340;
      const newTxnCount =
        prev.kpis.find((k) => k.id === "total_txns")?.numericValue || 203;

      const updatedKpis: KpiCardData[] = prev.kpis.map((kpi) => {
        if (kpi.id === "total_spent") {
          const updatedValue = newTotalSpent + newTx.amount;
          return {
            ...kpi,
            numericValue: updatedValue,
            value: `${Math.round(updatedValue / 1000)}`,
          };
        }
        if (kpi.id === "total_txns") {
          const updatedCount = newTxnCount + 1;
          return {
            ...kpi,
            numericValue: updatedCount,
            value: `${updatedCount}`,
          };
        }
        return kpi;
      });

      const updated = {
        ...prev,
        kpis: updatedKpis,
        calendarWeek: {
          ...prev.calendarWeek,
          transactions: updatedTransactions,
        },
      };

      if (onDataSync) onDataSync(updated);
      return updated;
    });
  };

  // CSV Export utility
  const handleExportCsv = () => {
    const txList = dashboardData.calendarWeek.transactions;
    const headers = "ID,Merchant,Category,Amount,Type,Date,Time,UPI ID,App,Status\n";
    const rows = txList
      .map(
        (t) =>
          `"${t.id}","${t.merchant}","${t.category}",${t.amount},"${t.type}","${t.date}","${t.time}","${t.upiId}","${t.upiApp}","${t.status}"`
      )
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Spendly_UPI_Transactions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === "Transactions") {
      setIsAllTxDrawerOpen(true);
    } else if (tab === "Budgets") {
      alert("Budgets View: ₹45,000 monthly target configured. 28% utilized.");
    } else if (tab === "Reports") {
      handleExportCsv();
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#F6F3EB] p-4 sm:p-6 lg:p-8 relative overflow-x-hidden flex flex-col">
      {/* Soft butter yellow ambient glows matching design aesthetic */}
      <div className="pointer-events-none absolute -top-28 -right-28 w-[500px] h-[500px] rounded-full bg-[#F5D547]/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-36 -left-36 w-[450px] h-[450px] rounded-full bg-[#F5D547]/10 blur-3xl" />

      {/* Top Floating Pill Navigation Bar */}
      <TopNavbar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onOpenAddModal={() => setIsAddModalOpen(true)}
      />

      {/* Welcome Section + Inline Metric Pills + Far Right KPIs */}
      <WelcomeHeader
        userName={dashboardData.user.name}
        inlineMetrics={dashboardData.inlineMetrics}
        kpis={dashboardData.kpis}
        onKpiClick={(id) => {
          if (id === "total_txns") setIsAllTxDrawerOpen(true);
        }}
      />

      {/* Main Content Grid: Full Screen Layout */}
      <main className="space-y-5 flex-1">
        {/* ROW 1: Profile & Budget Card + Wide Spending Progress */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* Left: Profile & Budget Card (4 cols) */}
          <div className="lg:col-span-4">
            <ProfileBudgetCard
              user={dashboardData.user}
              items={dashboardData.sidebarItems}
              onManageBudget={() =>
                alert(`Current Monthly UPI Budget is ${dashboardData.user.monthlyBudget}. Adjust in Budgets tab.`)
              }
            />
          </div>

          {/* Right: Spending Progress Card (8 cols) */}
          <div className="lg:col-span-8">
            <SpendingProgressCard
              totalSpend={dashboardData.spendingProgress.totalSpendThisWeek}
              subtitle={dashboardData.spendingProgress.subtitle}
              days={dashboardData.spendingProgress.days}
              onOpenDetails={() => setIsAllTxDrawerOpen(true)}
            />
          </div>
        </section>

        {/* ROW 2: Management Sidebar Card + Wide Recent Transactions Calendar */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* Left: Sidebar Accordion Management (4 cols) */}
          <div className="lg:col-span-4">
            <SidebarAccordionCard
              onExportData={handleExportCsv}
              onOpenBudgets={() => handleTabChange("Budgets")}
            />
          </div>

          {/* Right: Recent Transactions Calendar Strip (8 cols) */}
          <div className="lg:col-span-8">
            <TransactionCalendarCard
              monthYear={dashboardData.calendarWeek.monthYear}
              days={dashboardData.calendarWeek.days}
              transactions={dashboardData.calendarWeek.transactions}
              onSelectTransaction={(tx) => setSelectedTransaction(tx)}
              onOpenAllTransactions={() => setIsAllTxDrawerOpen(true)}
            />
          </div>
        </section>
      </main>

      {/* Transaction Detail Receipt Modal */}
      <TransactionDetailModal
        transaction={selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
      />

      {/* Quick Add UPI Transaction Modal */}
      <AddTransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddTransaction={handleAddTransaction}
      />

      {/* All Transactions Drawer / Ledger Modal */}
      <AllTransactionsDrawer
        isOpen={isAllTxDrawerOpen}
        onClose={() => setIsAllTxDrawerOpen(false)}
        transactions={dashboardData.calendarWeek.transactions}
        onSelectTransaction={(tx) => {
          setSelectedTransaction(tx);
        }}
        onExportCsv={handleExportCsv}
      />
    </div>
  );
};
