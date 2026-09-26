"use client";

import React, { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { DaySpendData } from "@/types/dashboard";

interface SpendingProgressCardProps {
  totalSpend: string;
  subtitle: string;
  days: DaySpendData[];
  onOpenDetails?: () => void;
}

export const SpendingProgressCard: React.FC<SpendingProgressCardProps> = ({
  totalSpend,
  subtitle,
  days,
  onOpenDetails,
}) => {
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(5); // Friday by default
  const [viewMode, setViewMode] = useState<"hours" | "amount">("amount");

  const activeDay = days[selectedDayIndex] || days[5];

  return (
    <div className="bg-white/85 backdrop-blur-md rounded-[26px] p-5 sm:p-6 border border-black/5 shadow-xs flex flex-col justify-between h-full relative overflow-hidden group">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#F5D547]" />
          <div>
            <h3 className="text-sm sm:text-base font-bold text-[#1A1A1A]">
              Progress & Weekly Spend
            </h3>
            <p className="text-[11px] text-black/45 font-medium">
              Daily UPI Volume & Peak Spend Analysis
            </p>
          </div>
        </div>

        {/* Diagonal Arrow Up Right Action Button */}
        <button
          onClick={onOpenDetails}
          className="w-7 h-7 rounded-full border border-black/10 hover:border-black/30 flex items-center justify-center text-[#1A1A1A] hover:bg-black/5 transition-all cursor-pointer"
          title="View detailed daily breakdown"
        >
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main KPI Stat & Quick Metrics Grid */}
      <div className="my-3 flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-baseline gap-3">
          <span className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1A1A1A] tabular-nums tracking-tight">
            {viewMode === "amount" ? "₹6,140" : totalSpend}
          </span>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-[#1A1A1A]">
              {viewMode === "amount" ? "Spent this week" : subtitle}
            </span>
            <span className="text-[10px] text-emerald-600 font-semibold">
              ↓ 14% vs last week (Under Budget)
            </span>
          </div>
        </div>

        {/* Secondary metric chips for wider view */}
        <div className="hidden sm:flex items-center gap-3">
          <div className="bg-[#F6F3EB] px-3.5 py-1.5 rounded-xl border border-black/5">
            <span className="text-[10px] text-black/50 block font-medium">Daily Avg</span>
            <span className="text-xs font-bold text-[#1A1A1A] tabular-nums">₹877 / day</span>
          </div>
          <div className="bg-[#F6F3EB] px-3.5 py-1.5 rounded-xl border border-black/5">
            <span className="text-[10px] text-black/50 block font-medium">Highest Day</span>
            <span className="text-xs font-bold text-[#1A1A1A] tabular-nums">Friday (₹1,850)</span>
          </div>
          <div className="bg-[#F6F3EB] px-3.5 py-1.5 rounded-xl border border-black/5">
            <span className="text-[10px] text-black/50 block font-medium">Txn Count</span>
            <span className="text-xs font-bold text-[#1A1A1A] tabular-nums">19 Txns</span>
          </div>
        </div>
      </div>

      {/* 7-Day Bar Chart Visual */}
      <div className="relative pt-10 pb-2">
        {/* Floating Yellow Tooltip Tag above selected/peak day */}
        <div
          className="absolute top-1 transition-all duration-300 pointer-events-none z-10"
          style={{
            left: `${(selectedDayIndex / (days.length - 1)) * 88 + 6}%`,
            transform: "translateX(-50%)",
          }}
        >
          <div className="bg-[#F5D547] text-[#1A1A1A] font-bold text-xs px-3 py-1 rounded-full shadow-md flex items-center gap-1.5 border border-black/5 whitespace-nowrap animate-bounce-subtle">
            <span>
              {activeDay.tooltipText ||
                (viewMode === "amount"
                  ? `${activeDay.label}: ₹${activeDay.amount}`
                  : `${(activeDay.amount / 300).toFixed(1)}h`)}
            </span>
          </div>
          {/* Tooltip triangle notch */}
          <div className="w-2.5 h-2.5 bg-[#F5D547] rotate-45 mx-auto -mt-1.5 shadow-2xs" />
        </div>

        {/* Chart Bars Grid */}
        <div className="h-36 sm:h-44 flex items-end justify-between px-3 sm:px-8 relative">
          {/* Subtle dotted background grid line */}
          <div className="absolute inset-x-3 sm:inset-x-8 top-1/2 border-b border-dotted border-black/10 pointer-events-none" />

          {days.map((item, index) => {
            const isSelected = selectedDayIndex === index;
            const isPeakYellow = item.isYellow || (index === 5 && !item.isYellow);
            const isThinBar = !item.isHigh;

            return (
              <div
                key={index}
                onClick={() => setSelectedDayIndex(index)}
                className="flex flex-col items-center gap-2 cursor-pointer group/bar relative z-1 py-1"
                title={`${item.label} (${item.dateStr}): ₹${item.amount}`}
              >
                {/* Dotted vertical guide background line */}
                <div className="w-px h-32 sm:h-38 absolute bottom-7 bg-transparent flex flex-col justify-between items-center opacity-25 group-hover/bar:opacity-70 transition-opacity">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="w-1 h-1 rounded-full bg-black/40" />
                  ))}
                </div>

                {/* The Bar */}
                <div className="h-32 sm:h-38 flex items-end justify-center relative">
                  <div
                    style={{ height: `${item.heightPercent}%` }}
                    className={`transition-all duration-300 rounded-full ${
                      isThinBar
                        ? "w-1.5 bg-[#1A1A1A]/40 group-hover/bar:bg-[#1A1A1A] group-hover/bar:w-2"
                        : isPeakYellow || isSelected
                        ? "w-3 sm:w-4 bg-[#F5D547] shadow-sm group-hover/bar:scale-y-105"
                        : "w-3 sm:w-4 bg-[#1A1A1A] group-hover/bar:bg-black group-hover/bar:scale-y-105"
                    }`}
                  />
                </div>

                {/* Day of Week Label */}
                <span
                  className={`text-xs font-semibold transition-colors ${
                    isSelected
                      ? "text-[#1A1A1A] font-bold"
                      : "text-black/40 group-hover/bar:text-black"
                  }`}
                >
                  {item.day}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer mini toggle */}
      <div className="mt-2 pt-3 border-t border-black/5 flex items-center justify-between text-xs">
        <span className="text-black/50">
          Showing 7-day spend cycle • Peak: <strong className="text-[#1A1A1A]">Friday (₹1,850)</strong>
        </span>
        <button
          onClick={() => setViewMode(viewMode === "amount" ? "hours" : "amount")}
          className="text-black/70 hover:text-black font-semibold underline underline-offset-2 transition-colors cursor-pointer"
        >
          {viewMode === "amount" ? "Show in Hours" : "Show in ₹ (INR)"}
        </button>
      </div>
    </div>
  );
};
