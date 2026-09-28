"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Calendar,
  Filter,
  ArrowDownRight,
  ArrowUpRight,
  TrendingDown,
  TrendingUp,
  CreditCard,
  Layers,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Search,
  X,
  PieChart as PieIcon,
  BarChart3,
  SlidersHorizontal,
  Edit3,
  ExternalLink,
  RotateCcw,
} from "lucide-react";
import { BankTransaction } from "@/types/bankTransaction";
import {
  getCategoryStyle,
  renderCategoryIcon,
  toISODateString,
} from "@/lib/categoryUtils";

interface CategorySpendingAnalyticsProps {
  transactions: BankTransaction[];
  onEditTransaction?: (tx: BankTransaction) => void;
  onSelectTransaction?: (tx: BankTransaction) => void;
  isLoading?: boolean;
}

export type AnalyticsTimeframe =
  | "all"
  | "today"
  | "week"
  | "month"
  | "last_month"
  | "custom";

export const CategorySpendingAnalytics: React.FC<
  CategorySpendingAnalyticsProps
> = ({
  transactions,
  onEditTransaction,
  onSelectTransaction,
  isLoading = false,
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const [timeframe, setTimeframe] = useState<AnalyticsTimeframe>("all");
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [customEndDate, setCustomEndDate] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<"debit" | "credit" | "all">(
    "debit"
  );
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [chartView, setChartView] = useState<"both" | "donut" | "bar">("both");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Quick preset shortcuts for custom date
  const setQuickCustomRange = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    setCustomStartDate(start.toISOString().slice(0, 10));
    setCustomEndDate(end.toISOString().slice(0, 10));
    setTimeframe("custom");
  };

  const setYearToDate = () => {
    const end = new Date();
    const start = new Date(end.getFullYear(), 0, 1);
    setCustomStartDate(start.toISOString().slice(0, 10));
    setCustomEndDate(end.toISOString().slice(0, 10));
    setTimeframe("custom");
  };

  // Filter transactions based on timeframe, custom date, and type
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoStr = weekAgo.toISOString().slice(0, 10);

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthStartStr = monthStart.toISOString().slice(0, 10);

    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthStartStr = lastMonthStart.toISOString().slice(0, 10);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    const lastMonthEndStr = lastMonthEnd.toISOString().slice(0, 10);

    return transactions.filter((tx) => {
      // 1. Transaction Type Check
      if (typeFilter === "debit" && tx.type !== "Debit") return false;
      if (typeFilter === "credit" && tx.type !== "Credit") return false;

      // 2. Timeframe Date Check
      const txISODate = toISODateString(tx.date);

      if (timeframe === "today") {
        if (txISODate !== todayStr) return false;
      } else if (timeframe === "week") {
        if (txISODate < weekAgoStr) return false;
      } else if (timeframe === "month") {
        if (txISODate < monthStartStr) return false;
      } else if (timeframe === "last_month") {
        if (txISODate < lastMonthStartStr || txISODate > lastMonthEndStr)
          return false;
      } else if (timeframe === "custom") {
        if (customStartDate && txISODate < customStartDate) return false;
        if (customEndDate && txISODate > customEndDate) return false;
      }

      // 3. Search query check
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          tx.category.toLowerCase().includes(q) ||
          tx.payee.toLowerCase().includes(q) ||
          tx.notes.toLowerCase().includes(q);
        if (!matches) return false;
      }

      return true;
    });
  }, [
    transactions,
    timeframe,
    customStartDate,
    customEndDate,
    typeFilter,
    searchQuery,
  ]);

  // Aggregate by Category
  const categoryStats = useMemo(() => {
    const map = new Map<
      string,
      {
        category: string;
        totalAmount: number;
        count: number;
        items: BankTransaction[];
      }
    >();

    filteredTransactions.forEach((tx) => {
      const cat = tx.category.trim() || "Other";
      const existing = map.get(cat) || {
        category: cat,
        totalAmount: 0,
        count: 0,
        items: [],
      };
      existing.totalAmount += tx.amount;
      existing.count += 1;
      existing.items.push(tx);
      map.set(cat, existing);
    });

    const totalPeriodSpend = Array.from(map.values()).reduce(
      (sum, c) => sum + c.totalAmount,
      0
    );

    const list = Array.from(map.values())
      .map((item) => {
        const style = getCategoryStyle(item.category);
        const percentage =
          totalPeriodSpend > 0
            ? (item.totalAmount / totalPeriodSpend) * 100
            : 0;
        const avgTicket = item.count > 0 ? item.totalAmount / item.count : 0;
        return {
          ...item,
          style,
          percentage,
          avgTicket,
        };
      })
      .sort((a, b) => b.totalAmount - a.totalAmount);

    return {
      list,
      totalSpend: totalPeriodSpend,
      totalCount: filteredTransactions.length,
      topCategory: list[0] || null,
      activeCategoriesCount: list.length,
    };
  }, [filteredTransactions]);

  // Chart data formatted for Recharts
  const chartData = useMemo(() => {
    return categoryStats.list.map((c) => ({
      name: c.category,
      value: Math.round(c.totalAmount * 100) / 100,
      count: c.count,
      percentage: Math.round(c.percentage * 10) / 10,
      color: c.style.color,
    }));
  }, [categoryStats.list]);

  // Custom Tooltip for Recharts Donut & Bar
  const CustomChartTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const style = getCategoryStyle(data.name);

      return (
        <div className="bg-[#1A1A1A] text-white p-3 rounded-2xl shadow-xl border border-white/10 text-xs min-w-[170px] pointer-events-none">
          <div className="flex items-center gap-2 mb-1.5 pb-1.5 border-b border-white/10">
            <div
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: data.color }}
            />
            <span className="font-bold text-white truncate">{data.name}</span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between items-center text-white/70">
              <span>Total Spent:</span>
              <span className="font-bold text-[#F5D547] text-sm tabular-nums">
                ₹{Number(data.value).toLocaleString("en-IN")}
              </span>
            </div>
            <div className="flex justify-between items-center text-white/70">
              <span>Share:</span>
              <span className="font-semibold text-white">
                {data.percentage}%
              </span>
            </div>
            <div className="flex justify-between items-center text-white/70">
              <span>Transactions:</span>
              <span className="font-semibold text-white">{data.count}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const timeframes: Array<{ id: AnalyticsTimeframe; label: string }> = [
    { id: "all", label: "All Time" },
    { id: "today", label: "Today" },
    { id: "week", label: "This Week" },
    { id: "month", label: "This Month" },
    { id: "last_month", label: "Last Month" },
    { id: "custom", label: "Custom Date Range" },
  ];

  return (
    <div className="w-full space-y-5 touch-pan-y">
      {/* Page Title & Breadcrumb header */}
      <div className="bg-white/85 backdrop-blur-md rounded-[26px] p-5 sm:p-6 border border-black/5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#F5D547] flex items-center justify-center text-[#1A1A1A] shadow-xs">
                <PieIcon className="w-4 h-4" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-[#1A1A1A] tracking-tight">
                  Category Spending Breakdown
                </h1>
                <p className="text-xs text-black/50 mt-0.5">
                  Understand how much you spend on what with interactive bar and
                  circular charts
                </p>
              </div>
            </div>
          </div>

          {/* Type Filter (Debits vs Credits vs All) */}
          <div className="flex items-center gap-1 bg-[#F6F3EB] p-1 rounded-full border border-black/5 self-start md:self-auto">
            <button
              onClick={() => setTypeFilter("debit")}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                typeFilter === "debit"
                  ? "bg-[#1A1A1A] text-white shadow-xs"
                  : "text-black/60 hover:text-black"
              }`}
            >
              <ArrowDownRight className="w-3.5 h-3.5 text-red-400" />
              <span>Debits (Expenses)</span>
            </button>

            <button
              onClick={() => setTypeFilter("credit")}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                typeFilter === "credit"
                  ? "bg-[#1A1A1A] text-white shadow-xs"
                  : "text-black/60 hover:text-black"
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
              <span>Credits (Income)</span>
            </button>

            <button
              onClick={() => setTypeFilter("all")}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                typeFilter === "all"
                  ? "bg-[#1A1A1A] text-white shadow-xs"
                  : "text-black/60 hover:text-black"
              }`}
            >
              All
            </button>
          </div>
        </div>

        {/* Date Filter Controls */}
        <div className="mt-4 pt-4 border-t border-black/5 space-y-3">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            {/* Timeframe Presets */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 max-w-full">
              <Calendar className="w-4 h-4 text-black/40 mr-1 shrink-0" />
              {timeframes.map((tf) => {
                const isActive = timeframe === tf.id;
                return (
                  <button
                    key={tf.id}
                    onClick={() => {
                      setTimeframe(tf.id);
                      if (tf.id !== "custom") {
                        setSelectedCategory(null);
                      }
                    }}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                      isActive
                        ? "bg-[#1A1A1A] text-white shadow-xs"
                        : "bg-[#F6F3EB] text-black/70 hover:bg-black/5 hover:text-black border border-black/5"
                    }`}
                  >
                    {tf.label}
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="relative w-full lg:w-72">
              <Search className="w-3.5 h-3.5 text-black/40 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Filter category or payee..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-8 py-1.5 bg-[#F6F3EB] rounded-full border border-black/5 text-xs font-medium text-[#1A1A1A] focus:outline-hidden focus:border-black shadow-2xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-black/40 hover:text-black p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Custom Date Range Picker Accordion (Shows if "custom" selected) */}
          {timeframe === "custom" && (
            <div className="bg-[#FAF9F5] p-3.5 sm:p-4 rounded-2xl border border-black/5 animate-in fade-in zoom-in-99 duration-150 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-[#1A1A1A] flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#F5D547]" />
                  Select Custom Date Range:
                </span>

                {/* Quick Range Helper Buttons */}
                <div className="flex items-center gap-1.5 overflow-x-auto text-[11px]">
                  <button
                    onClick={() => setQuickCustomRange(7)}
                    className="px-2.5 py-1 rounded-lg bg-white border border-black/10 hover:border-black font-semibold text-black/70 cursor-pointer"
                  >
                    Last 7 Days
                  </button>
                  <button
                    onClick={() => setQuickCustomRange(30)}
                    className="px-2.5 py-1 rounded-lg bg-white border border-black/10 hover:border-black font-semibold text-black/70 cursor-pointer"
                  >
                    Last 30 Days
                  </button>
                  <button
                    onClick={() => setQuickCustomRange(90)}
                    className="px-2.5 py-1 rounded-lg bg-white border border-black/10 hover:border-black font-semibold text-black/70 cursor-pointer"
                  >
                    Last 90 Days
                  </button>
                  <button
                    onClick={setYearToDate}
                    className="px-2.5 py-1 rounded-lg bg-white border border-black/10 hover:border-black font-semibold text-black/70 cursor-pointer"
                  >
                    This Year
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 items-center">
                <div>
                  <label className="block text-[11px] font-bold text-black/60 mb-1">
                    Start Date (From):
                  </label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="w-full bg-white px-3 py-2 rounded-xl border border-black/10 text-xs font-semibold text-[#1A1A1A] focus:outline-hidden focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-black/60 mb-1">
                    End Date (To):
                  </label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="w-full bg-white px-3 py-2 rounded-xl border border-black/10 text-xs font-semibold text-[#1A1A1A] focus:outline-hidden focus:border-black"
                  />
                </div>

                <div className="flex items-center gap-2 sm:self-end pt-1">
                  {(customStartDate || customEndDate) && (
                    <button
                      onClick={() => {
                        setCustomStartDate("");
                        setCustomEndDate("");
                      }}
                      className="px-3 py-2 rounded-xl bg-white border border-black/10 text-xs font-bold text-black/60 hover:text-black hover:bg-black/5 flex items-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset</span>
                    </button>
                  )}
                  <span className="text-[11px] text-black/50 font-medium">
                    {filteredTransactions.length} transactions in range
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Spend */}
        <div className="bg-white/85 backdrop-blur-md rounded-[22px] p-4 sm:p-5 border border-black/5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-black/50">
              {typeFilter === "credit"
                ? "Total Received"
                : typeFilter === "all"
                ? "Total Flow"
                : "Total Spent"}
            </span>
            <div className="w-6 h-6 rounded-full bg-[#1A1A1A] text-[#F5D547] flex items-center justify-center">
              <CreditCard className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-[#1A1A1A] tabular-nums">
            ₹
            {categoryStats.totalSpend.toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
          <p className="text-[11px] text-black/50 mt-1">
            Across{" "}
            <strong className="text-[#1A1A1A]">
              {categoryStats.totalCount}
            </strong>{" "}
            transactions
          </p>
        </div>

        {/* Top Spending Category */}
        <div className="bg-white/85 backdrop-blur-md rounded-[22px] p-4 sm:p-5 border border-black/5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-black/50">
              Top Category
            </span>
            <div className="w-6 h-6 rounded-full bg-[#F5D547] text-[#1A1A1A] flex items-center justify-center font-bold text-xs">
              #1
            </div>
          </div>
          {categoryStats.topCategory ? (
            <div>
              <div className="text-base sm:text-lg font-extrabold text-[#1A1A1A] truncate">
                {categoryStats.topCategory.category}
              </div>
              <div className="flex items-center gap-1.5 mt-1 text-xs">
                <span className="font-bold text-[#1A1A1A] tabular-nums">
                  ₹
                  {categoryStats.topCategory.totalAmount.toLocaleString(
                    "en-IN"
                  )}
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#F5D547]/40 text-[#1A1A1A]">
                  {Math.round(categoryStats.topCategory.percentage)}%
                </span>
              </div>
            </div>
          ) : (
            <div className="text-sm font-semibold text-black/40">
              No categories
            </div>
          )}
        </div>

        {/* Average per Transaction */}
        <div className="bg-white/85 backdrop-blur-md rounded-[22px] p-4 sm:p-5 border border-black/5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-black/50">Avg / Expense</span>
            <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <TrendingDown className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-[#1A1A1A] tabular-nums">
            ₹
            {categoryStats.totalCount > 0
              ? Math.round(
                  categoryStats.totalSpend / categoryStats.totalCount
                ).toLocaleString("en-IN")
              : "0"}
          </div>
          <p className="text-[11px] text-black/50 mt-1">Average ticket size</p>
        </div>

        {/* Active Categories Count */}
        <div className="bg-white/85 backdrop-blur-md rounded-[22px] p-4 sm:p-5 border border-black/5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-black/50">
              Active Categories
            </span>
            <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-800 flex items-center justify-center">
              <Layers className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-[#1A1A1A] tabular-nums">
            {categoryStats.activeCategoriesCount}
          </div>
          <p className="text-[11px] text-black/50 mt-1">Distinct buckets</p>
        </div>
      </div>

      {/* Main Charts Section */}
      <div className="bg-white/85 backdrop-blur-md rounded-[26px] p-5 sm:p-6 border border-black/5 shadow-xs">
        {/* Chart View Header & Toggles */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-black/5">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F5D547]" />
              <h2 className="text-base sm:text-lg font-bold text-[#1A1A1A]">
                Visual Breakdown & Analytics
              </h2>
            </div>
            <p className="text-xs text-black/50 mt-0.5">
              Interactive charts showing exact spending breakdown by category.
              Hover or click any segment to filter.
            </p>
          </div>

          {/* Chart Display Mode Switcher (Both / Circular / Bar) */}
          <div className="flex items-center gap-1 bg-[#F6F3EB] p-1 rounded-full border border-black/5">
            <button
              onClick={() => setChartView("both")}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                chartView === "both"
                  ? "bg-[#1A1A1A] text-white shadow-xs"
                  : "text-black/60 hover:text-black"
              }`}
            >
              Both
            </button>
            <button
              onClick={() => setChartView("donut")}
              className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                chartView === "donut"
                  ? "bg-[#1A1A1A] text-white shadow-xs"
                  : "text-black/60 hover:text-black"
              }`}
            >
              <PieIcon className="w-3.5 h-3.5" />
              <span>Circular</span>
            </button>
            <button
              onClick={() => setChartView("bar")}
              className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                chartView === "bar"
                  ? "bg-[#1A1A1A] text-white shadow-xs"
                  : "text-black/60 hover:text-black"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Bar Chart</span>
            </button>
          </div>
        </div>

        {/* Empty State */}
        {chartData.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-black/5 flex items-center justify-center text-black/40 mx-auto mb-2">
              <PieIcon className="w-7 h-7" />
            </div>
            <p className="font-bold text-[#1A1A1A] text-base">
              No expenses in this timeframe
            </p>
            <p className="text-xs text-black/50 mt-1 max-w-sm mx-auto">
              Try switching your date range (e.g. to &quot;All Time&quot;) or
              clearing your search query to see your category breakdown.
            </p>
            <button
              onClick={() => {
                setTimeframe("all");
                setSearchQuery("");
                setTypeFilter("debit");
              }}
              className="mt-4 px-4 py-2 bg-[#F5D547] hover:bg-[#ebd043] text-[#1A1A1A] font-bold text-xs rounded-full shadow-xs cursor-pointer transition-colors"
            >
              Reset to All Time
            </button>
          </div>
        ) : (
          <div
            className={`grid gap-6 items-stretch pt-4 ${
              chartView === "both"
                ? "grid-cols-1 lg:grid-cols-12"
                : "grid-cols-1"
            }`}
          >
            {/* 1. Circular / Donut Chart */}
            {(chartView === "both" || chartView === "donut") && (
              <div
                className={`${
                  chartView === "both" ? "lg:col-span-6" : "w-full"
                } bg-[#FAF9F5] border border-black/5 rounded-2xl p-4 flex flex-col justify-between`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <PieIcon className="w-4 h-4 text-black/60" />
                    <span className="text-xs sm:text-sm font-bold text-[#1A1A1A]">
                      Category Share (Circular)
                    </span>
                  </div>
                  <span className="text-[11px] text-black/50">
                    {chartData.length} categories
                  </span>
                </div>

                <div className="h-64 sm:h-72 w-full relative touch-pan-y">
                  {isMounted && (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Tooltip content={<CustomChartTooltip />} />
                        <Pie
                          data={chartData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={65}
                          outerRadius={105}
                          paddingAngle={3}
                          cornerRadius={5}
                          onClick={(entry) => {
                            const catName = entry?.name;
                            if (!catName || selectedCategory === catName) {
                              setSelectedCategory(null);
                            } else {
                              setSelectedCategory(catName);
                              setExpandedCategory(catName);
                            }
                          }}
                          className="cursor-pointer"
                        >
                          {chartData.map((entry, index) => {
                            const isSelected =
                              selectedCategory === null ||
                              selectedCategory === entry.name;
                            return (
                              <Cell
                                key={`cell-${index}`}
                                fill={entry.color}
                                opacity={isSelected ? 1 : 0.35}
                                stroke={
                                  selectedCategory === entry.name
                                    ? "#1A1A1A"
                                    : "#ffffff"
                                }
                                strokeWidth={
                                  selectedCategory === entry.name ? 2.5 : 1
                                }
                              />
                            );
                          })}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  )}

                  {/* Centered Donut Stat Card */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                    <span className="text-[10px] font-bold text-black/45 uppercase tracking-wider">
                      {selectedCategory || "Total Spent"}
                    </span>
                    <span className="text-base sm:text-xl font-extrabold text-[#1A1A1A] tabular-nums">
                      ₹
                      {(selectedCategory
                        ? categoryStats.list.find(
                            (c) => c.category === selectedCategory
                          )?.totalAmount || 0
                        : categoryStats.totalSpend
                      ).toLocaleString("en-IN", {
                        maximumFractionDigits: 0,
                      })}
                    </span>
                    <span className="text-[10px] font-semibold text-black/40">
                      {selectedCategory
                        ? `${
                            categoryStats.list.find(
                              (c) => c.category === selectedCategory
                            )?.count || 0
                          } transactions`
                        : `${categoryStats.totalCount} transactions`}
                    </span>
                  </div>
                </div>

                {/* Micro Legend */}
                <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-black/5 justify-center max-h-24 overflow-y-auto">
                  {chartData.slice(0, 8).map((cat) => (
                    <button
                      key={cat.name}
                      onClick={() =>
                        setSelectedCategory(
                          selectedCategory === cat.name ? null : cat.name
                        )
                      }
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 cursor-pointer transition-all border ${
                        selectedCategory === cat.name
                          ? "bg-[#1A1A1A] text-white border-black"
                          : "bg-white text-black/70 border-black/10 hover:border-black/30"
                      }`}
                    >
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="truncate max-w-[80px]">{cat.name}</span>
                      <span className="opacity-60">{cat.percentage}%</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 2. Bar Chart Ranking */}
            {(chartView === "both" || chartView === "bar") && (
              <div
                className={`${
                  chartView === "both" ? "lg:col-span-6" : "w-full"
                } bg-[#FAF9F5] border border-black/5 rounded-2xl p-4 flex flex-col justify-between`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <BarChart3 className="w-4 h-4 text-black/60" />
                    <span className="text-xs sm:text-sm font-bold text-[#1A1A1A]">
                      Spending by Category (Ranked Bar Chart)
                    </span>
                  </div>
                  <span className="text-[11px] text-black/50">
                    Highest to Lowest
                  </span>
                </div>

                <div className="h-64 sm:h-72 w-full touch-pan-y">
                  {isMounted && (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={chartData.slice(0, 10)}
                        margin={{ top: 10, right: 10, left: -10, bottom: 25 }}
                        onClick={(e) => {
                          if (e && e.activeLabel) {
                            const name = String(e.activeLabel);
                            setSelectedCategory(
                              selectedCategory === name ? null : name
                            );
                            setExpandedCategory(name);
                          }
                        }}
                      >
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 10, fill: "#666" }}
                          interval={0}
                          angle={-25}
                          textAnchor="end"
                          height={40}
                        />
                        <YAxis
                          tick={{ fontSize: 10, fill: "#666" }}
                          tickFormatter={(v) =>
                            v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`
                          }
                        />
                        <Tooltip content={<CustomChartTooltip />} />
                        <Bar
                          dataKey="value"
                          radius={[6, 6, 0, 0]}
                          className="cursor-pointer"
                        >
                          {chartData.slice(0, 10).map((entry, index) => {
                            const isSelected =
                              selectedCategory === null ||
                              selectedCategory === entry.name;
                            return (
                              <Cell
                                key={`bar-${index}`}
                                fill={entry.color}
                                opacity={isSelected ? 1 : 0.35}
                                stroke={
                                  selectedCategory === entry.name
                                    ? "#1A1A1A"
                                    : "transparent"
                                }
                                strokeWidth={2}
                              />
                            );
                          })}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>

                <div className="pt-2 border-t border-black/5 flex items-center justify-between text-[11px] text-black/50">
                  <span>Top 10 Categories shown</span>
                  <span className="font-semibold text-[#1A1A1A]">
                    Click bar to drill down
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Category Breakdown Detailed Table & Itemized List */}
      <div className="bg-white/85 backdrop-blur-md rounded-[26px] p-5 sm:p-6 border border-black/5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-black/5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1A1A1A]" />
            <h3 className="text-base sm:text-lg font-bold text-[#1A1A1A]">
              Category Breakdown Details
            </h3>
            {selectedCategory && (
              <span className="text-xs bg-[#F5D547] text-[#1A1A1A] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                Filtered: {selectedCategory}
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="hover:text-black cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>

          <span className="text-xs text-black/50">
            Click any category to view individual transactions
          </span>
        </div>

        {/* Category List */}
        <div className="space-y-3">
          {categoryStats.list
            .filter(
              (cat) => !selectedCategory || cat.category === selectedCategory
            )
            .map((cat, idx) => {
              const isExpanded = expandedCategory === cat.category;

              return (
                <div
                  key={cat.category}
                  className={`bg-[#FAF9F5] border rounded-2xl transition-all ${
                    isExpanded
                      ? "border-black/20 shadow-xs"
                      : "border-black/5 hover:border-black/15"
                  }`}
                >
                  {/* Category Header Row */}
                  <div
                    onClick={() =>
                      setExpandedCategory(isExpanded ? null : cat.category)
                    }
                    className="p-3.5 sm:p-4 flex items-center justify-between gap-3 cursor-pointer select-none"
                  >
                    {/* Left: Rank & Icon & Name */}
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xs font-bold text-black/35 w-5 text-center">
                        #{idx + 1}
                      </span>

                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-2xs"
                        style={{
                          backgroundColor: `${cat.style.color}20`,
                          color: cat.style.color,
                        }}
                      >
                        {renderCategoryIcon(cat.style.iconName, "w-4 h-4")}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-[#1A1A1A] truncate">
                            {cat.category}
                          </span>
                          <span
                            className={`px-2 py-0.2 rounded-full text-[10px] font-semibold border ${cat.style.bgColor} ${cat.style.textColor} ${cat.style.borderColor}`}
                          >
                            {Math.round(cat.percentage)}%
                          </span>
                        </div>
                        <span className="text-[11px] text-black/50">
                          {cat.count} {cat.count === 1 ? "expense" : "expenses"}{" "}
                          • Avg ₹{Math.round(cat.avgTicket).toLocaleString("en-IN")}/tx
                        </span>
                      </div>
                    </div>

                    {/* Right: Amount & Progress & Expand Chevron */}
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <div className="font-extrabold text-base sm:text-lg text-[#1A1A1A] tabular-nums">
                          ₹
                          {cat.totalAmount.toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </div>
                        <div className="w-24 sm:w-36 h-2 bg-black/10 rounded-full overflow-hidden mt-1 ml-auto">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.min(100, Math.max(4, cat.percentage))}%`,
                              backgroundColor: cat.style.color,
                            }}
                          />
                        </div>
                      </div>

                      <div className="w-7 h-7 rounded-full bg-white border border-black/5 flex items-center justify-center text-black/50 hover:text-black shrink-0">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Transaction Drill-down */}
                  {isExpanded && (
                    <div className="px-3.5 sm:px-4 pb-4 pt-2 border-t border-black/5 animate-in fade-in duration-150 space-y-2">
                      <div className="flex items-center justify-between text-xs text-black/50 pb-1">
                        <span className="font-bold text-[#1A1A1A]">
                          Transactions in &quot;{cat.category}&quot; ({cat.items.length})
                        </span>
                        <span className="text-[11px]">
                          Sorted by latest date
                        </span>
                      </div>

                      <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                        {cat.items.map((tx) => (
                          <div
                            key={tx.id}
                            onClick={() => onSelectTransaction && onSelectTransaction(tx)}
                            className="bg-white p-3 rounded-xl border border-black/5 flex items-center justify-between gap-2 hover:bg-[#F6F3EB]/60 transition-colors cursor-pointer group"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-xs sm:text-sm text-[#1A1A1A] truncate">
                                  {tx.payee}
                                </span>
                                {tx.aiParsed && (
                                  <Sparkles className="w-3 h-3 text-amber-500 fill-amber-300 shrink-0" />
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-[11px] text-black/50 mt-0.5">
                                <span>{tx.date}</span>
                                <span>•</span>
                                <span className="font-mono text-[10px] bg-black/5 px-1.5 py-0.2 rounded truncate max-w-[120px]">
                                  {tx.referenceNo}
                                </span>
                                {tx.source && (
                                  <>
                                    <span>•</span>
                                    <span className="truncate max-w-[100px]">
                                      {tx.source}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <span className="font-extrabold text-sm text-[#1A1A1A] tabular-nums">
                                ₹
                                {tx.amount.toLocaleString("en-IN", {
                                  minimumFractionDigits: 2,
                                })}
                              </span>

                              {onEditTransaction && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onEditTransaction(tx);
                                  }}
                                  className="text-amber-800 bg-amber-50 hover:bg-amber-100 p-1 rounded-md transition-colors"
                                  title="Edit Transaction"
                                >
                                  <Edit3 className="w-3 h-3" />
                                </button>
                              )}
                              <ExternalLink className="w-3 h-3 text-black/20 group-hover:text-black/60" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};
