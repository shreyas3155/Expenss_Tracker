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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* CARD 1: Total Debits (Spent) */}
      <div className="bg-white/85 backdrop-blur-md rounded-[24px] p-5 border border-black/5 shadow-xs flex flex-col justify-between group hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-black/50">
            Total Spent (Debits)
          </span>
          <div className="w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
            <ArrowDownRight className="w-4 h-4" />
          </div>
        </div>

        <div className="my-2">
          <div className="text-3xl lg:text-4xl font-extrabold text-[#1A1A1A] tabular-nums tracking-tight">
            ₹{summary.totalDebits.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] pt-2 border-t border-black/5">
          <span className="text-black/50 font-medium">Period: {getTimeframeLabel()}</span>
          <span className="font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
            {summary.debitCount} Payments
          </span>
        </div>
      </div>

      {/* CARD 2: Total Credits (Received / Income) */}
      <div className="bg-white/85 backdrop-blur-md rounded-[24px] p-5 border border-black/5 shadow-xs flex flex-col justify-between group hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-black/50">
            Total Received (Credits)
          </span>
          <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>

        <div className="my-2">
          <div className="text-3xl lg:text-4xl font-extrabold text-[#1A1A1A] tabular-nums tracking-tight">
            ₹{summary.totalCredits.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] pt-2 border-t border-black/5">
          <span className="text-black/50 font-medium">Period: {getTimeframeLabel()}</span>
          <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
            {summary.creditCount} Deposits
          </span>
        </div>
      </div>

      {/* CARD 3: Net Cash Flow (Income - Expenses) */}
      <div className="bg-white/85 backdrop-blur-md rounded-[24px] p-5 border border-black/5 shadow-xs flex flex-col justify-between group hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-black/50">
            Net Cash Flow
          </span>
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              isNetPositive
                ? "bg-[#F5D547]/30 text-[#1A1A1A]"
                : "bg-red-50 text-red-600"
            }`}
          >
            <Wallet className="w-4 h-4" />
          </div>
        </div>

        <div className="my-2">
          <div
            className={`text-3xl lg:text-4xl font-extrabold tabular-nums tracking-tight ${
              isNetPositive ? "text-[#1A1A1A]" : "text-red-600"
            }`}
          >
            {isNetPositive ? "+" : ""}
            ₹{summary.netCashFlow.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] pt-2 border-t border-black/5">
          <span className="text-black/50 font-medium">
            {isNetPositive ? "Net Positive" : "Deficit"}
          </span>
          <span
            className={`font-semibold px-2 py-0.5 rounded-full ${
              isNetPositive
                ? "bg-[#F5D547] text-[#1A1A1A]"
                : "bg-red-100 text-red-700"
            }`}
          >
            {isNetPositive ? "Savings +" : "Overspend"}
          </span>
        </div>
      </div>

      {/* CARD 4: Gemini AI Auto-Parsed Count */}
      <div className="bg-[#1E1E1E] text-white rounded-[24px] p-5 shadow-sm flex flex-col justify-between group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-white/60">
            Gemini AI Parsing
          </span>
          <div className="w-8 h-8 rounded-full bg-white/10 text-[#F5D547] flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>

        <div className="my-2">
          <div className="text-3xl lg:text-4xl font-extrabold text-white tabular-nums tracking-tight">
            {summary.aiParsedCount} / {summary.transactionCount}
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] pt-2 border-t border-white/10">
          <span className="text-white/60 font-medium">Auto-Categorized</span>
          <span className="font-bold text-[#F5D547]">100% Synced</span>
        </div>
      </div>
    </div>
  );
};
