"use client";

import React, { useState } from "react";
import { Search, Calendar, Filter, X, ArrowDownRight, ArrowUpRight, SlidersHorizontal } from "lucide-react";
import { FilterState, TimeframeFilter } from "@/types/bankTransaction";

interface BankFilterBarProps {
  filters: FilterState;
  onChange: (updated: Partial<FilterState>) => void;
  categories: string[];
  sources: string[];
  totalResults: number;
}

export const BankFilterBar: React.FC<BankFilterBarProps> = ({
  filters,
  onChange,
  categories,
  sources,
  totalResults,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const timeframes: Array<{ id: TimeframeFilter; label: string }> = [
    { id: "all", label: "All Time" },
    { id: "today", label: "Today" },
    { id: "week", label: "This Week" },
    { id: "month", label: "This Month" },
    { id: "custom", label: "Custom Date" },
  ];

  return (
    <div className="bg-white/85 backdrop-blur-md rounded-[26px] p-4 sm:p-5 border border-black/5 shadow-xs space-y-3.5">
      {/* Top Row: Timeframe Pills & Type Segmented Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Timeframe Filter Pills */}
        <div className="flex items-center gap-1.5 bg-[#F6F3EB] p-1.5 rounded-full border border-black/5">
          <Calendar className="w-3.5 h-3.5 text-black/50 ml-2" />
          {timeframes.map((tf) => {
            const isActive = filters.timeframe === tf.id;
            return (
              <button
                key={tf.id}
                onClick={() => onChange({ timeframe: tf.id })}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#1A1A1A] text-white shadow-xs"
                    : "text-black/60 hover:text-black hover:bg-black/5"
                }`}
              >
                {tf.label}
              </button>
            );
          })}
        </div>

        {/* Type Filter (All / Debits / Credits) */}
        <div className="flex items-center gap-1 bg-[#F6F3EB] p-1.5 rounded-full border border-black/5">
          <button
            onClick={() => onChange({ type: "all" })}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              filters.type === "all"
                ? "bg-[#1A1A1A] text-white shadow-xs"
                : "text-black/60 hover:text-black"
            }`}
          >
            All
          </button>

          <button
            onClick={() => onChange({ type: "debit" })}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
              filters.type === "debit"
                ? "bg-red-600 text-white shadow-xs"
                : "text-black/60 hover:text-black"
            }`}
          >
            <ArrowDownRight className="w-3 h-3" />
            <span>Debits (Spent)</span>
          </button>

          <button
            onClick={() => onChange({ type: "credit" })}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
              filters.type === "credit"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-black/60 hover:text-black"
            }`}
          >
            <ArrowUpRight className="w-3 h-3" />
            <span>Credits (Income)</span>
          </button>
        </div>
      </div>

      {/* Custom Date Pickers (visible when "custom" is active) */}
      {filters.timeframe === "custom" && (
        <div className="flex flex-wrap items-center gap-3 p-3 bg-[#F6F3EB] rounded-2xl border border-black/5 animate-in fade-in zoom-in-98 duration-150">
          <span className="text-xs font-semibold text-[#1A1A1A]">Custom Date Range:</span>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-black/50">From:</span>
            <input
              type="date"
              value={filters.customStartDate || ""}
              onChange={(e) => onChange({ customStartDate: e.target.value })}
              className="bg-white px-3 py-1.5 rounded-xl border border-black/10 text-xs font-medium text-[#1A1A1A] focus:outline-hidden focus:border-black"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-black/50">To:</span>
            <input
              type="date"
              value={filters.customEndDate || ""}
              onChange={(e) => onChange({ customEndDate: e.target.value })}
              className="bg-white px-3 py-1.5 rounded-xl border border-black/10 text-xs font-medium text-[#1A1A1A] focus:outline-hidden focus:border-black"
            />
          </div>
          {(filters.customStartDate || filters.customEndDate) && (
            <button
              onClick={() => onChange({ customStartDate: "", customEndDate: "" })}
              className="text-xs text-black/50 hover:text-black underline cursor-pointer"
            >
              Reset Dates
            </button>
          )}
        </div>
      )}

      {/* Bottom Row: Search Bar, Category Dropdown, Bank Source Dropdown */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-black/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search Payee, UTR, Bank details, or Gmail Message ID..."
            value={filters.searchQuery}
            onChange={(e) => onChange({ searchQuery: e.target.value })}
            className="w-full pl-9 pr-9 py-2.5 bg-white rounded-2xl border border-black/10 text-xs font-medium text-[#1A1A1A] focus:outline-hidden focus:border-black shadow-2xs"
          />
          {filters.searchQuery && (
            <button
              onClick={() => onChange({ searchQuery: "" })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 hover:text-black"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Dropdown */}
        <div className="w-full sm:w-auto">
          <select
            value={filters.category}
            onChange={(e) => onChange({ category: e.target.value })}
            className="w-full sm:w-48 px-3.5 py-2.5 bg-white rounded-2xl border border-black/10 text-xs font-semibold text-[#1A1A1A] focus:outline-hidden focus:border-black shadow-2xs cursor-pointer"
          >
            <option value="all">All Categories ({categories.length})</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Bank / Source Dropdown */}
        <div className="w-full sm:w-auto">
          <select
            value={filters.source}
            onChange={(e) => onChange({ source: e.target.value })}
            className="w-full sm:w-44 px-3.5 py-2.5 bg-white rounded-2xl border border-black/10 text-xs font-semibold text-[#1A1A1A] focus:outline-hidden focus:border-black shadow-2xs cursor-pointer"
          >
            <option value="all">All Banks / Sources</option>
            {sources.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
