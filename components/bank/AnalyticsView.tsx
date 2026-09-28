"use client";

import React, { useState, useEffect, useCallback } from "react";
import { BankTransaction } from "@/types/bankTransaction";
import { TopNavbar } from "../dashboard/TopNavbar";
import { CategorySpendingAnalytics } from "./CategorySpendingAnalytics";
import { TransactionInspectorModal } from "./TransactionInspectorModal";
import { AddTransactionModal } from "../dashboard/AddTransactionModal";
import { LoginPage } from "../auth/LoginPage";
import { TransactionItem } from "@/types/dashboard";

export const AnalyticsView: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<{
    name: string;
    email: string;
  } | null>(null);
  const [transactions, setTransactions] = useState<BankTransaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>("Categories");
  const [selectedTx, setSelectedTx] = useState<BankTransaction | null>(null);
  const [inspectorMode, setInspectorMode] = useState<"view" | "edit">("view");
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  // Check session
  useEffect(() => {
    const checkSession = async () => {
      try {
        const stored = localStorage.getItem("spendly_user");
        if (stored) {
          setCurrentUser(JSON.parse(stored));
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
        // Continue
      }
    };
    checkSession();
  }, []);

  // Load transactions
  const loadTransactions = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/transactions");
      if (res.ok) {
        const data = await res.json();
        setTransactions(
          Array.isArray(data.transactions) ? data.transactions : []
        );
      }
    } catch (e) {
      console.error("Failed to load transactions:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

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

  const handleUpdateTransaction = async (updated: BankTransaction) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === updated.id ? updated : t))
    );
    if (selectedTx && selectedTx.id === updated.id) {
      setSelectedTx(updated);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    if (selectedTx && selectedTx.id === id) {
      setSelectedTx(null);
    }
  };

  const handleAddManual = async (newTxItem: TransactionItem) => {
    const isCredit = newTxItem.type === "credit";
    const typeFormatted = isCredit ? "Credit" : "Debit";
    const txDate = newTxItem.date || new Date().toISOString().slice(0, 10);
    const timeStr = newTxItem.time ? ` ${newTxItem.time}` : "";

    const newBankTx: BankTransaction = {
      id: `tx-${Date.now()}`,
      date: `${txDate}${timeStr}`.trim(),
      payee: newTxItem.merchant,
      amount: newTxItem.amount,
      category: newTxItem.category,
      referenceNo:
        newTxItem.upiId || `MANUAL-${Date.now().toString().slice(-8)}`,
      notes:
        newTxItem.notes ||
        (isCredit ? "Manually credited amount" : "Manually recorded expense"),
      bankNotification: isCredit
        ? `Manual Credit: ₹${newTxItem.amount} received via ${newTxItem.upiApp} from ${newTxItem.merchant}.`
        : `Manual Debit: ₹${newTxItem.amount} debited via ${newTxItem.upiApp} to ${newTxItem.merchant}.`,
      messageId: `manual_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 7)}`,
      type: typeFormatted,
      source: `${newTxItem.upiApp} (Manual)`,
      aiParsed: false,
      aiModel: "Manual Entry",
    };

    setTransactions((prev) => [newBankTx, ...prev]);

    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBankTx),
      });
      if (res.ok) {
        loadTransactions();
      }
    } catch (e) {
      console.error("Error saving transaction:", e);
    }
  };

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
    <div className="w-full min-h-screen bg-[#F6F3EB] p-3 sm:p-6 lg:p-8 pb-36 sm:pb-28 md:pb-8 relative overflow-x-clip flex flex-col font-sans touch-pan-y">
      {/* Decorative ambient glows */}
      <div className="pointer-events-none absolute -top-32 -right-32 w-[350px] sm:w-[550px] h-[350px] sm:h-[550px] rounded-full bg-[#F5D547]/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 w-[300px] sm:w-[480px] h-[300px] sm:h-[480px] rounded-full bg-[#F5D547]/10 blur-3xl" />

      {/* Top Navbar */}
      <TopNavbar
        activeTab={activeTab}
        onTabChange={(tab) => {
          if (tab === "Dashboard") {
            window.location.href = "/";
          } else if (tab === "Transactions") {
            window.location.href = "/?tab=transactions";
          } else {
            setActiveTab(tab);
          }
        }}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onLogout={handleLogout}
        userName={currentUser?.name || "Shreyas Hathiwala"}
      />

      {/* Category Analytics Component */}
      <main className="flex-1">
        <CategorySpendingAnalytics
          transactions={transactions}
          onEditTransaction={(tx) => {
            setSelectedTx(tx);
            setInspectorMode("edit");
          }}
          onSelectTransaction={(tx) => {
            setSelectedTx(tx);
            setInspectorMode("view");
          }}
          isLoading={isLoading}
        />
      </main>

      {/* Modals */}
      <TransactionInspectorModal
        transaction={selectedTx}
        initialMode={inspectorMode}
        onClose={() => setSelectedTx(null)}
        onUpdateTransaction={handleUpdateTransaction}
        onDeleteTransaction={handleDeleteTransaction}
      />

      <AddTransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddTransaction={handleAddManual}
        initialType="Debit"
      />
    </div>
  );
};
