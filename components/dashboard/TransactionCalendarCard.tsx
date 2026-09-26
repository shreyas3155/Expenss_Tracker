"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Filter, Search, ArrowUpRight } from "lucide-react";
import { TransactionItem } from "@/types/dashboard";

interface TransactionCalendarCardProps {
  monthYear: string;
  days: Array<{
    dayName: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
    dateNumber: number;
    isToday?: boolean;
    isSelected?: boolean;
  }>;
  transactions: TransactionItem[];
  onSelectTransaction: (transaction: TransactionItem) => void;
  onOpenAllTransactions?: () => void;
}

export const TransactionCalendarCard: React.FC<TransactionCalendarCardProps> = ({
  monthYear,
  days,
  transactions,
  onSelectTransaction,
  onOpenAllTransactions,
}) => {
  const [selectedDate, setSelectedDate] = useState<number>(24);
  const [currentMonthIndex, setCurrentMonthIndex] = useState<number>(1); // 0: August, 1: September 2024, 2: October

  const months = ["August", "September 2024", "October"];

  const timeSlots = ["8:00 am", "9:00 am", "10:00 am", "11:00 am"];

  return (
    <div className="bg-white/85 backdrop-blur-md rounded-[26px] p-5 sm:p-6 border border-black/5 shadow-xs flex flex-col justify-between h-full relative overflow-hidden">
      {/* Calendar Header with Month Navigation */}
      <div className="flex items-center justify-between pb-4 border-b border-black/5">
        <button
          onClick={() => setCurrentMonthIndex((prev) => Math.max(0, prev - 1))}
          className="text-xs font-semibold text-black/50 hover:text-black transition-colors px-3 py-1.5 rounded-full hover:bg-black/5 flex items-center gap-1 cursor-pointer"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>{months[Math.max(0, currentMonthIndex - 1)]}</span>
        </button>

        <div className="flex items-center gap-2">
          <h3 className="text-sm sm:text-base font-bold text-[#1A1A1A]">
            {months[currentMonthIndex]}
          </h3>
        </div>

        <button
          onClick={() => setCurrentMonthIndex((prev) => Math.min(months.length - 1, prev + 1))}
          className="text-xs font-semibold text-black/50 hover:text-black transition-colors px-3 py-1.5 rounded-full hover:bg-black/5 flex items-center gap-1 cursor-pointer"
        >
          <span>{months[Math.min(months.length - 1, currentMonthIndex + 1)]}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Horizontal Week Strip (Mon - Sat) */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 my-4">
        {/* Empty placeholder column for time labels */}
        <div className="text-[11px] font-semibold text-black/40 flex items-center justify-center">
          Time
        </div>

        {days.map((item) => {
          const isSelected = selectedDate === item.dateNumber;
          return (
            <div
              key={item.dateNumber}
              onClick={() => setSelectedDate(item.dateNumber)}
              className={`flex flex-col items-center justify-center py-2 rounded-2xl cursor-pointer transition-all duration-200 ${
                isSelected
                  ? "bg-[#1A1A1A] text-white shadow-xs scale-105"
                  : "text-[#1A1A1A] hover:bg-black/5"
              }`}
            >
              <span
                className={`text-[11px] font-medium ${
                  isSelected ? "text-white/70" : "text-black/45"
                }`}
              >
                {item.dayName}
              </span>
              <span
                className={`text-sm sm:text-base font-bold tabular-nums ${
                  isSelected ? "text-[#F5D547]" : "text-[#1A1A1A]"
                }`}
              >
                {item.dateNumber}
              </span>
            </div>
          );
        })}
      </div>

      {/* Time Grid with Dashed Guides & Event Transaction Chips */}
      <div className="relative mt-2 min-h-[220px] flex flex-col justify-between py-1">
        {timeSlots.map((time, index) => (
          <div
            key={time}
            className="flex items-center gap-3 relative py-2.5 group"
          >
            {/* Time label */}
            <span className="text-[11px] font-semibold text-black/40 w-16 shrink-0 tabular-nums">
              {time}
            </span>

            {/* Dashed Horizontal Guideline */}
            <div className="flex-1 border-b border-dashed border-black/10 group-hover:border-black/20 transition-colors" />
          </div>
        ))}

        {/* Positioned Event / Transaction Chips */}
        {/* Chip 1: Weekly Team Sync at 9:00 am (Wed 24) */}
        <div
          onClick={() => {
            const tx = transactions.find((t) => t.id === "tx-1");
            if (tx) onSelectTransaction(tx);
          }}
          className="absolute top-[52px] left-[32%] sm:left-[36%] z-10 bg-[#1E1E1E] hover:bg-black text-white px-3 sm:px-4 py-2 rounded-2xl shadow-md border border-white/10 flex items-center justify-between gap-3 sm:gap-4 max-w-[280px] sm:max-w-[320px] cursor-pointer hover:scale-102 transition-all active:scale-98"
        >
          <div className="flex flex-col min-w-0">
            <span className="text-[11px] sm:text-xs font-bold text-white truncate flex items-center gap-1.5">
              Weekly Team Sync
              <span className="text-[#F5D547] text-[10px] font-semibold">₹1,450</span>
            </span>
            <span className="text-[9px] sm:text-[10px] text-white/50 truncate">
              Discuss progress on projects • GPay UPI
            </span>
          </div>

          {/* Small avatar cluster */}
          <div className="flex -space-x-1.5 shrink-0">
            <div className="w-5 h-5 rounded-full bg-amber-400 text-black text-[9px] font-bold flex items-center justify-center border border-black">
              AD
            </div>
            <div className="w-5 h-5 rounded-full bg-emerald-400 text-black text-[9px] font-bold flex items-center justify-center border border-black">
              NK
            </div>
            <div className="w-5 h-5 rounded-full bg-purple-400 text-black text-[9px] font-bold flex items-center justify-center border border-black">
              PS
            </div>
          </div>
        </div>

        {/* Chip 2: Onboarding Session at 11:00 am (Thu 25) */}
        <div
          onClick={() => {
            const tx = transactions.find((t) => t.id === "tx-2");
            if (tx) onSelectTransaction(tx);
          }}
          className="absolute top-[148px] left-[52%] sm:left-[56%] z-10 bg-white hover:bg-[#F6F3EB] text-[#1A1A1A] px-3 sm:px-4 py-2 rounded-2xl shadow-sm border border-black/10 flex items-center justify-between gap-3 sm:gap-4 max-w-[260px] sm:max-w-[300px] cursor-pointer hover:scale-102 transition-all active:scale-98"
        >
          <div className="flex flex-col min-w-0">
            <span className="text-[11px] sm:text-xs font-bold text-[#1A1A1A] truncate flex items-center gap-1.5">
              Onboarding Session
              <span className="text-black/60 text-[10px] font-semibold">₹620</span>
            </span>
            <span className="text-[9px] sm:text-[10px] text-black/50 truncate">
              Introduction for new hires • PhonePe
            </span>
          </div>

          {/* Small avatar cluster */}
          <div className="flex -space-x-1.5 shrink-0">
            <div className="w-5 h-5 rounded-full bg-pink-400 text-white text-[9px] font-bold flex items-center justify-center border border-white">
              LP
            </div>
            <div className="w-5 h-5 rounded-full bg-sky-400 text-white text-[9px] font-bold flex items-center justify-center border border-white">
              RV
            </div>
          </div>
        </div>
      </div>

      {/* Footer Link / View All */}
      <div className="pt-3 border-t border-black/5 flex items-center justify-between text-xs">
        <span className="text-black/50">
          Showing transactions for <span className="font-semibold text-black">Sep {selectedDate}, 2024</span>
        </span>
        <button
          onClick={onOpenAllTransactions}
          className="text-[#1A1A1A] font-bold hover:text-black flex items-center gap-1 hover:underline underline-offset-2 transition-all cursor-pointer"
        >
          <span>View All Transactions</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
