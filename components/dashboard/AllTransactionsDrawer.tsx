"use client";

import React, { useState } from "react";
import { X, Search, Filter, Download, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { TransactionItem } from "@/types/dashboard";

interface AllTransactionsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: TransactionItem[];
  onSelectTransaction: (transaction: TransactionItem) => void;
  onExportCsv: () => void;
}

export const AllTransactionsDrawer: React.FC<AllTransactionsDrawerProps> = ({
  isOpen,
  onClose,
  transactions,
  onSelectTransaction,
  onExportCsv,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  if (!isOpen) return null;

  const filtered = transactions.filter((t) => {
    const matchesSearch =
      t.merchant.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.title && t.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      t.upiId.toLowerCase().includes(searchTerm.toLowerCase());

    if (selectedFilter === "all") return matchesSearch;
    if (selectedFilter === "debits") return matchesSearch && t.type === "debit";
    if (selectedFilter === "credits") return matchesSearch && t.type === "credit";
    return matchesSearch;
  });

  const totalAmount = filtered.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-3xl max-h-[90vh] bg-[#F6F3EB] rounded-[32px] p-6 shadow-2xl border border-black/10 flex flex-col relative overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-black/5">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F5D547]" />
              <h2 className="text-xl font-extrabold text-[#1A1A1A]">
                Transactions Ledger
              </h2>
            </div>
            <p className="text-xs text-black/50 mt-0.5">
              {filtered.length} transactions recorded • Total ₹{totalAmount.toLocaleString("en-IN")}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onExportCsv}
              className="bg-white hover:bg-black/5 text-[#1A1A1A] font-semibold text-xs px-3.5 py-2 rounded-full border border-black/10 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center text-black/60 hover:text-black transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 my-4">
          <div className="relative flex-1 w-full">
            <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-black/40" />
            <input
              type="text"
              placeholder="Search merchant, UTR, or note..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white rounded-full border border-black/10 text-xs focus:outline-hidden focus:border-black"
            />
          </div>

          <div className="flex items-center gap-1 self-start sm:self-auto bg-white p-1 rounded-full border border-black/10">
            <button
              onClick={() => setSelectedFilter("all")}
              className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-all ${
                selectedFilter === "all"
                  ? "bg-[#1A1A1A] text-white"
                  : "text-black/60 hover:text-black"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedFilter("debits")}
              className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-all ${
                selectedFilter === "debits"
                  ? "bg-[#1A1A1A] text-white"
                  : "text-black/60 hover:text-black"
              }`}
            >
              Debits
            </button>
            <button
              onClick={() => setSelectedFilter("credits")}
              className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-all ${
                selectedFilter === "credits"
                  ? "bg-[#1A1A1A] text-white"
                  : "text-black/60 hover:text-black"
              }`}
            >
              Credits
            </button>
          </div>
        </div>

        {/* List of Transactions */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-2 max-h-[480px]">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-black/40 text-xs">
              No transactions match your search.
            </div>
          ) : (
            filtered.map((tx) => (
              <div
                key={tx.id}
                onClick={() => {
                  onSelectTransaction(tx);
                }}
                className="bg-white hover:bg-[#FAF9F5] p-3.5 rounded-2xl border border-black/5 hover:border-black/20 flex items-center justify-between gap-3 transition-all cursor-pointer group shadow-2xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[#1A1A1A] text-white flex items-center justify-center font-bold text-xs shrink-0 group-hover:bg-[#F5D547] group-hover:text-black transition-colors">
                    {tx.merchant.slice(0, 2).toUpperCase()}
                  </div>

                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-[#1A1A1A] truncate group-hover:text-black">
                      {tx.merchant}
                    </span>
                    <span className="text-[11px] text-black/50 truncate">
                      {tx.title} • {tx.date} at {tx.time}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span className="text-sm font-bold text-[#1A1A1A] tabular-nums block">
                      {tx.type === "credit" ? "+" : "-"}
                      {tx.amountFormatted}
                    </span>
                    <span className="text-[10px] text-black/40 font-mono">
                      {tx.upiApp}
                    </span>
                  </div>

                  <ArrowUpRight className="w-4 h-4 text-black/30 group-hover:text-black transition-colors" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
