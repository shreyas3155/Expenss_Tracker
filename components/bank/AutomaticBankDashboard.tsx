"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { BankTransaction, FilterState, ExpenseSummary, TimeframeFilter } from "@/types/bankTransaction";
import { TopNavbar } from "../dashboard/TopNavbar";
import { GeminiSyncBadge } from "./GeminiSyncBadge";
import { BankKpiCards } from "./BankKpiCards";
import { BankFilterBar } from "./BankFilterBar";
import { BankTransactionsTable } from "./BankTransactionsTable";
import { BankSpendTrendChart } from "./BankSpendTrendChart";
import { TransactionInspectorModal } from "./TransactionInspectorModal";
import { GoogleAppsScriptModal } from "./GoogleAppsScriptModal";
import { AddTransactionModal } from "../dashboard/AddTransactionModal";
import { LoginPage } from "../auth/LoginPage";
import { TransactionItem } from "@/types/dashboard";

export const AutomaticBankDashboard: React.FC = () => {
  // Authentication gatekeeper for Shreyas Hathiwala
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string } | null>(null);

  // Real data state from Supabase (starts empty, NO fake data)
  const [transactions, setTransactions] = useState<BankTransaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>("Dashboard");
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isScriptModalOpen, setIsScriptModalOpen] = useState<boolean>(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [selectedTx, setSelectedTx] = useState<BankTransaction | null>(null);

  // Fetch real transactions from Supabase API
  const loadTransactions = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/transactions");
      if (res.ok) {
        const data = await res.json();
        setTransactions(Array.isArray(data.transactions) ? data.transactions : []);
      } else {
        setTransactions([]);
      }
    } catch (e) {
      console.error("Failed to load real transactions from Supabase:", e);
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check login session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const stored = localStorage.getItem("spendly_user");
        if (stored) {
          const user = JSON.parse(stored);
          setCurrentUser(user);
          setIsAuthenticated(true);
          return;
        }

        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated) {
            setCurrentUser(data.user);
            setIsAuthenticated(true);
          }
        }
      } catch (e) {
        // Continue to login page
      }
    };
    checkSession();
  }, []);

  // Fetch real transactions when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadTransactions();
    }
  }, [isAuthenticated, loadTransactions]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {}
    localStorage.removeItem("spendly_user");
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  // Filter state (Defaults to 'all' so any existing real transactions are visible immediately)
  const [filters, setFilters] = useState<FilterState>({
    timeframe: "all",
    type: "all",
    category: "all",
    source: "all",
    searchQuery: "",
  });

  // Extract unique categories and sources
  const categories = useMemo(() => {
    const set = new Set(transactions.map((t) => t.category));
    return Array.from(set).sort();
  }, [transactions]);

  const sources = useMemo(() => {
    const set = new Set(transactions.map((t) => t.source));
    return Array.from(set).sort();
  }, [transactions]);

  // Filter logic
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);

    // 7 days ago
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    // Month start
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    return transactions.filter((tx) => {
      // 1. Timeframe check
      const txDate = new Date(tx.date);
      const txDateStr = tx.date.slice(0, 10);

      if (filters.timeframe === "today") {
        if (txDateStr !== todayStr) return false;
      } else if (filters.timeframe === "week") {
        if (isNaN(txDate.getTime()) || txDate < weekAgo) return false;
      } else if (filters.timeframe === "month") {
        if (isNaN(txDate.getTime()) || txDate < monthStart) return false;
      } else if (filters.timeframe === "custom") {
        if (filters.customStartDate && txDateStr < filters.customStartDate) return false;
        if (filters.customEndDate && txDateStr > filters.customEndDate) return false;
      }
      // "all" timeframe passes through without date restriction

      // 2. Type check (Debit / Credit)
      if (filters.type === "debit" && tx.type !== "Debit") return false;
      if (filters.type === "credit" && tx.type !== "Credit") return false;

      // 3. Category check
      if (filters.category !== "all" && tx.category !== filters.category) return false;

      // 4. Source check
      if (filters.source !== "all" && tx.source !== filters.source) return false;

      // 5. Search query
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase();
        const matches =
          tx.payee.toLowerCase().includes(q) ||
          tx.referenceNo.toLowerCase().includes(q) ||
          tx.notes.toLowerCase().includes(q) ||
          tx.bankNotification.toLowerCase().includes(q) ||
          tx.messageId.toLowerCase().includes(q);
        if (!matches) return false;
      }

      return true;
    });
  }, [transactions, filters]);

  // Calculate dynamic KPI summary for the filtered transactions
  const summary: ExpenseSummary = useMemo(() => {
    let debits = 0;
    let credits = 0;
    let debitCount = 0;
    let creditCount = 0;
    let aiParsedCount = 0;

    filteredTransactions.forEach((tx) => {
      if (tx.type === "Debit") {
        debits += tx.amount;
        debitCount++;
      } else {
        credits += tx.amount;
        creditCount++;
      }
      if (tx.aiParsed) aiParsedCount++;
    });

    return {
      totalDebits: debits,
      totalCredits: credits,
      netCashFlow: credits - debits,
      transactionCount: filteredTransactions.length,
      debitCount,
      creditCount,
      aiParsedCount,
    };
  }, [filteredTransactions]);

  // Handle manual sync simulation / re-fetch real transactions from Supabase
  const handleSyncMail = async () => {
    setIsSyncing(true);
    try {
      await loadTransactions();
    } finally {
      setTimeout(() => {
        setIsSyncing(false);
      }, 600);
    }
  };

  // CSV Export matching the 10 columns
  const handleExportCsv = () => {
    const headers =
      "Date (Col 1),Payee / Description (Col 2),Amount (Col 3),Category (Col 4),Reference No. / UTR (Col 5),Notes (Col 6),Bank Notification / Details (Col 7),Message ID (Col 8),Type (Col 9),Source / Method (Col 10)\n";

    const rows = filteredTransactions
      .map(
        (t) =>
          `"${t.date}","${t.payee.replace(/"/g, '""')}",${t.amount},"${t.category}","${t.referenceNo}","${t.notes.replace(/"/g, '""')}","${t.bankNotification.replace(/"/g, '""')}","${t.messageId}","${t.type}","${t.source}"`
      )
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Bank_Expenses_${filters.timeframe}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Add new transaction (persists directly to Supabase PostgreSQL)
  const handleAddManual = async (newTxItem: TransactionItem) => {
    const newBankTx: BankTransaction = {
      id: `tx-${Date.now()}`,
      date: `${new Date().toISOString().slice(0, 10)} ${newTxItem.time}`,
      payee: newTxItem.merchant,
      amount: newTxItem.amount,
      category: newTxItem.category,
      referenceNo: newTxItem.upiId || `UPI/${Date.now().toString().slice(-8)}`,
      notes: newTxItem.notes || "Manually recorded via Spendly",
      bankNotification: `Alert: ₹${newTxItem.amount} debited via ${newTxItem.upiApp} to ${newTxItem.merchant}.`,
      messageId: `manual_${Date.now()}`,
      type: "Debit",
      source: `${newTxItem.upiApp} UPI`,
      aiParsed: true,
      aiModel: "Gemini 1.5 Flash",
    };

    // Optimistic UI update
    setTransactions((prev) => [newBankTx, ...prev]);

    try {
      await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBankTx),
      });
    } catch (e) {
      console.error("Error saving transaction to Supabase:", e);
    }
  };

  // If not authenticated, render Login Page gatekeeper first
  if (!isAuthenticated) {
    return (
      <LoginPage
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setIsAuthenticated(true);
        }}
      />
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#F6F3EB] p-3 sm:p-6 lg:p-8 pb-24 md:pb-8 relative overflow-x-hidden flex flex-col font-sans">
      {/* Soft warm ambient glows */}
      <div className="pointer-events-none absolute -top-32 -right-32 w-[350px] sm:w-[550px] h-[350px] sm:h-[550px] rounded-full bg-[#F5D547]/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 w-[300px] sm:w-[480px] h-[300px] sm:h-[480px] rounded-full bg-[#F5D547]/10 blur-3xl" />

      {/* Top Floating Pill Navigation Bar */}
      <TopNavbar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab === "Reports") handleExportCsv();
        }}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onLogout={handleLogout}
        userName={currentUser?.name || "Shreyas Hathiwala"}
      />

      {/* Gemini AI & Google Apps Script Live Sync Status Badge */}
      <div className="mb-5">
        <GeminiSyncBadge
          onSync={handleSyncMail}
          onOpenScriptModal={() => setIsScriptModalOpen(true)}
          isSyncing={isSyncing}
          totalParsedCount={transactions.length}
        />
      </div>

      {/* Dynamic KPI Cards: Spent, Received, Net Balance, AI Parsed */}
      <div className="mb-5">
        <BankKpiCards
          summary={summary}
          timeframe={filters.timeframe}
          customRangeLabel={
            filters.customStartDate && filters.customEndDate
              ? `${filters.customStartDate} to ${filters.customEndDate}`
              : undefined
          }
        />
      </div>

      {/* Interactive Filter Bar: Today / Week / Month / Custom Date / Debits / Credits / Search */}
      <div className="mb-5">
        <BankFilterBar
          filters={filters}
          onChange={(updated) => setFilters((prev) => ({ ...prev, ...updated }))}
          categories={categories}
          sources={sources}
          totalResults={filteredTransactions.length}
        />
      </div>

      {/* Main Content Grid: Trend Chart & 10-Column Transaction Ledger */}
      <main className="space-y-5 flex-1">
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* Left Column (4 cols): Cash Flow Trend Chart for the period */}
          <div className="lg:col-span-4">
            <BankSpendTrendChart
              transactions={filteredTransactions}
              timeframeLabel={
                filters.timeframe === "today"
                  ? "Today"
                  : filters.timeframe === "week"
                  ? "This Week"
                  : filters.timeframe === "month"
                  ? "This Month"
                  : "Custom Period"
              }
            />
          </div>

          {/* Right Column (8 cols): 10-Column Bank Email & Gemini AI Ledger Table */}
          <div className="lg:col-span-8">
            <BankTransactionsTable
              transactions={filteredTransactions}
              onSelectTransaction={(tx) => setSelectedTx(tx)}
              onExportCsv={handleExportCsv}
              isLoading={isLoading}
            />
          </div>
        </section>
      </main>

      {/* Raw Bank Email & AI Parser Inspection Modal */}
      <TransactionInspectorModal
        transaction={selectedTx}
        onClose={() => setSelectedTx(null)}
      />

      {/* Google Apps Script & Gemini Setup Guide Modal */}
      <GoogleAppsScriptModal
        isOpen={isScriptModalOpen}
        onClose={() => setIsScriptModalOpen(false)}
      />

      {/* Quick Add Manual Expense Modal */}
      <AddTransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddTransaction={handleAddManual}
      />
    </div>
  );
};
