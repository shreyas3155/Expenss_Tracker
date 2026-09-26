"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Copy,
  Check,
  ExternalLink,
  ArrowDownRight,
  ArrowUpRight,
  Download,
  Info,
  CreditCard,
  Building2,
  Mail,
} from "lucide-react";
import { BankTransaction } from "@/types/bankTransaction";

interface BankTransactionsTableProps {
  transactions: BankTransaction[];
  onSelectTransaction: (tx: BankTransaction) => void;
  onExportCsv: () => void;
  isLoading?: boolean;
}

export const BankTransactionsTable: React.FC<BankTransactionsTableProps> = ({
  transactions,
  onSelectTransaction,
  onExportCsv,
  isLoading = false,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyText = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const getCategoryColor = (cat: string) => {
    switch (cat.toLowerCase()) {
      case "food & dining":
        return "bg-amber-100 text-amber-900 border-amber-200";
      case "transport":
        return "bg-sky-100 text-sky-900 border-sky-200";
      case "shopping":
        return "bg-purple-100 text-purple-900 border-purple-200";
      case "groceries":
        return "bg-emerald-100 text-emerald-900 border-emerald-200";
      case "utilities":
        return "bg-orange-100 text-orange-900 border-orange-200";
      case "salary & income":
        return "bg-[#F5D547] text-[#1A1A1A] border-[#e2c130]";
      case "entertainment":
        return "bg-pink-100 text-pink-900 border-pink-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="bg-white/85 backdrop-blur-md rounded-[26px] p-5 sm:p-6 border border-black/5 shadow-xs flex flex-col justify-between">
      {/* Table Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-black/5">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F5D547]" />
            <h3 className="text-base sm:text-lg font-bold text-[#1A1A1A]">
              10-Column Bank Email & Gemini Ledger
            </h3>
          </div>
          <p className="text-xs text-black/50 mt-0.5">
            Real Supabase PostgreSQL Database • Click any row to inspect details
          </p>
        </div>

        <button
          onClick={onExportCsv}
          disabled={transactions.length === 0}
          className="bg-white hover:bg-black/5 border border-black/10 text-[#1A1A1A] px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export 10-Col Excel/CSV</span>
        </button>
      </div>

      {/* Transactions Table */}
      <div className="overflow-x-auto mt-4 -mx-5 sm:mx-0">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="border-b border-black/10 text-[11px] font-bold text-black/50 uppercase tracking-wider">
              <th className="py-2.5 px-3">Date (Col 1)</th>
              <th className="py-2.5 px-3">Payee / Description (Col 2)</th>
              <th className="py-2.5 px-3">Amount (Col 3)</th>
              <th className="py-2.5 px-3">Category (Col 4)</th>
              <th className="py-2.5 px-3">Type (Col 9)</th>
              <th className="py-2.5 px-3">Reference No / UTR (Col 5)</th>
              <th className="py-2.5 px-3">Source / Method (Col 10)</th>
              <th className="py-2.5 px-3">Bank Notification (Col 7)</th>
              <th className="py-2.5 px-3">Message ID (Col 8)</th>
              <th className="py-2.5 px-3 text-right">Inspect</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5 text-xs">
            {isLoading ? (
              <tr>
                <td colSpan={10} className="text-center py-16 text-black/50">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="w-6 h-6 border-2 border-[#1A1A1A] border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs font-medium text-black/60">
                      Loading real data from Supabase...
                    </span>
                  </div>
                </td>
              </tr>
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center py-16 text-black/50">
                  <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                    <div className="w-12 h-12 rounded-2xl bg-black/5 flex items-center justify-center text-black/40 mb-1">
                      <CreditCard className="w-6 h-6" />
                    </div>
                    <p className="font-bold text-[#1A1A1A] text-sm">No transactions found</p>
                    <p className="text-xs text-black/50 text-center leading-relaxed">
                      Your Supabase database currently has 0 transactions. Once bank alerts are synced via Google Apps Script or added manually, they will appear here in real-time.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              transactions.map((tx) => {
                const isDebit = tx.type === "Debit";

                return (
                  <tr
                    key={tx.id}
                    onClick={() => onSelectTransaction(tx)}
                    className="hover:bg-[#FAF9F5] transition-colors cursor-pointer group"
                  >
                    {/* Col 1: Date */}
                    <td className="py-3 px-3 font-medium text-black/80 whitespace-nowrap">
                      {tx.date}
                    </td>

                    {/* Col 2: Payee */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5 font-bold text-[#1A1A1A]">
                        <span>{tx.payee}</span>
                        {tx.aiParsed && (
                          <span title="Categorized by Gemini AI">
                            <Sparkles className="w-3 h-3 text-amber-500 fill-amber-300" />
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Col 3: Amount */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        className={`font-extrabold text-sm tabular-nums ${
                          isDebit ? "text-[#1A1A1A]" : "text-emerald-700"
                        }`}
                      >
                        {isDebit ? "-" : "+"}₹
                        {tx.amount.toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </td>

                    {/* Col 4: Category */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getCategoryColor(
                          tx.category
                        )}`}
                      >
                        {tx.category}
                      </span>
                    </td>

                    {/* Col 9: Type */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          isDebit
                            ? "bg-red-50 text-red-700"
                            : "bg-emerald-50 text-emerald-700"
                        }`}
                      >
                        {tx.type}
                      </span>
                    </td>

                    {/* Col 5: Reference / UTR */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <button
                        onClick={(e) => copyText(tx.referenceNo, e)}
                        className="flex items-center gap-1 font-mono text-[11px] text-black/60 hover:text-black group/btn bg-black/5 hover:bg-black/10 px-2 py-0.5 rounded-md transition-all cursor-pointer"
                        title="Click to copy UTR"
                      >
                        <span>{tx.referenceNo}</span>
                        {copiedId === tx.referenceNo ? (
                          <Check className="w-2.5 h-2.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-2.5 h-2.5 opacity-40 group-hover/btn:opacity-100" />
                        )}
                      </button>
                    </td>

                    {/* Col 10: Source / Method */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="text-[11px] text-black/70 font-medium bg-white border border-black/5 px-2 py-0.5 rounded-md shadow-2xs">
                        {tx.source}
                      </span>
                    </td>

                    {/* Col 7: Bank Notification Snippet */}
                    <td className="py-3 px-3 max-w-[200px]">
                      <p className="truncate text-[11px] text-black/50 font-mono" title={tx.bankNotification}>
                        {tx.bankNotification}
                      </p>
                    </td>

                    {/* Col 8: Message ID */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <button
                        onClick={(e) => copyText(tx.messageId, e)}
                        className="font-mono text-[10px] text-black/40 hover:text-black flex items-center gap-1"
                        title="Click to copy Gmail message ID"
                      >
                        <span>{tx.messageId.slice(0, 10)}...</span>
                        {copiedId === tx.messageId ? (
                          <Check className="w-2.5 h-2.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-2.5 h-2.5 opacity-40" />
                        )}
                      </button>
                    </td>

                    {/* Inspect button */}
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => onSelectTransaction(tx)}
                        className="text-black/30 group-hover:text-black p-1 rounded-md hover:bg-black/5"
                        title="Inspect Bank Alert & Gemini extraction"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Summary */}
      <div className="pt-4 border-t border-black/5 flex flex-wrap items-center justify-between text-xs text-black/50 gap-2">
        <span>
          Showing <strong className="text-[#1A1A1A]">{transactions.length}</strong> transactions
        </span>
        <span className="text-[11px]">
          Auto-synchronized with Google Sheet column format (Col 1 to Col 10)
        </span>
      </div>
    </div>
  );
};
