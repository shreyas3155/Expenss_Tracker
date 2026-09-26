"use client";

import React from "react";
import { ArrowDownRight, ArrowUpRight, Wallet, Sparkles, TrendingUp, TrendingDown } from "lucide-react";
import { ExpenseSummary, TimeframeFilter } from "@/types/bankTransaction";

interface BankKpiCardsProps {
  summary: ExpenseSummary;
  timeframe: TimeframeFilter;
  customRangeLabel?: string;
}

export const BankKpiCards: React.FC<BankKpiCardsProps> = ({
  summary,
  timeframe,
  customRangeLabel,
}) => {
  const getTimeframeLabel = () => {
    switch (timeframe) {
      case "all":
        return "All Time";
      case "today":
        return "Today";
      case "week":
        return "This Week";
      case "month":
        return "This Month";
      case "custom":
        return customRangeLabel || "Custom Range";
    }
  };

  const isNetPositive = summary.netCashFlow >= 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
      {/* CARD 1: Total Debits (Spent) */}
      <div className="bg-white/85 backdrop-blur-md rounded-[20px] sm:rounded-[24px] p-3.5 sm:p-5 border border-black/5 shadow-xs flex flex-col justify-between group hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-[11px] sm:text-xs font-semibold text-black/50 truncate">
            Total Spent
          </span>
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center shrink-0">
            <ArrowDownRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>

        <div className="my-1.5 sm:my-2">
          <div className="text-lg sm:text-2xl lg:text-3xl font-extrabold text-[#1A1A1A] tabular-nums tracking-tight truncate">
            ₹{summary.totalDebits.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] sm:text-[11px] pt-1.5 sm:pt-2 border-t border-black/5">
          <span className="text-black/50 font-medium truncate">{getTimeframeLabel()}</span>
          <span className="font-semibold text-red-600 bg-red-50 px-1.5 sm:px-2 py-0.5 rounded-full shrink-0">
            {summary.debitCount} debits
          </span>
        </div>
      </div>

      {/* CARD 2: Total Credits (Received / Income) */}
      <div className="bg-white/85 backdrop-blur-md rounded-[20px] sm:rounded-[24px] p-3.5 sm:p-5 border border-black/5 shadow-xs flex flex-col justify-between group hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-[11px] sm:text-xs font-semibold text-black/50 truncate">
            Total Received
          </span>
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>

        <div className="my-1.5 sm:my-2">
          <div className="text-lg sm:text-2xl lg:text-3xl font-extrabold text-[#1A1A1A] tabular-nums tracking-tight truncate">
            ₹{summary.totalCredits.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] sm:text-[11px] pt-1.5 sm:pt-2 border-t border-black/5">
          <span className="text-black/50 font-medium truncate">{getTimeframeLabel()}</span>
          <span className="font-semibold text-emerald-700 bg-emerald-50 px-1.5 sm:px-2 py-0.5 rounded-full shrink-0">
            {summary.creditCount} credits
          </span>
        </div>
      </div>

      {/* CARD 3: Net Cash Flow (Income - Expenses) */}
      <div className="bg-white/85 backdrop-blur-md rounded-[20px] sm:rounded-[24px] p-3.5 sm:p-5 border border-black/5 shadow-xs flex flex-col justify-between group hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-[11px] sm:text-xs font-semibold text-black/50 truncate">
            Net Cash Flow
          </span>
          <div
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 ${
              isNetPositive
                ? "bg-[#F5D547]/30 text-[#1A1A1A]"
                : "bg-red-50 text-red-600"
            }`}
          >
            <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>

        <div className="my-1.5 sm:my-2">
          <div
            className={`text-lg sm:text-2xl lg:text-3xl font-extrabold tabular-nums tracking-tight truncate ${
              isNetPositive ? "text-[#1A1A1A]" : "text-red-600"
            }`}
          >
            {isNetPositive ? "+" : ""}
            ₹{summary.netCashFlow.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] sm:text-[11px] pt-1.5 sm:pt-2 border-t border-black/5">
          <span className="text-black/50 font-medium truncate">
            {isNetPositive ? "Net Positive" : "Deficit"}
          </span>
          <span
            className={`font-semibold px-1.5 sm:px-2 py-0.5 rounded-full shrink-0 ${
              isNetPositive
                ? "bg-[#F5D547] text-[#1A1A1A]"
                : "bg-red-100 text-red-700"
            }`}
          >
            {isNetPositive ? "Savings +" : "Overspent"}
          </span>
        </div>
      </div>

      {/* CARD 4: Gemini AI Auto-Parsed Count */}
      <div className="bg-[#1E1E1E] text-white rounded-[20px] sm:rounded-[24px] p-3.5 sm:p-5 shadow-sm flex flex-col justify-between group">
        <div className="flex items-center justify-between">
          <span className="text-[11px] sm:text-xs font-semibold text-white/60 truncate">
            Gemini AI Sync
          </span>
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/10 text-[#F5D547] flex items-center justify-center shrink-0">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>

        <div className="my-1.5 sm:my-2">
          <div className="text-lg sm:text-2xl lg:text-3xl font-extrabold text-white tabular-nums tracking-tight truncate">
            {summary.aiParsedCount} / {summary.transactionCount}
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] sm:text-[11px] pt-1.5 sm:pt-2 border-t border-white/10">
          <span className="text-white/60 font-medium truncate">Auto-Categorized</span>
          <span className="font-bold text-[#F5D547] text-[10px] sm:text-xs shrink-0">100% Synced</span>
        </div>
      </div>
    </div>
  );
};
