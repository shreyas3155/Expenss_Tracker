"use client";

import React from "react";
import { ArrowUpRight, TrendingUp, Sparkles } from "lucide-react";
import { BankTransaction } from "@/types/bankTransaction";

interface BankSpendTrendChartProps {
  transactions: BankTransaction[];
  timeframeLabel: string;
}

export const BankSpendTrendChart: React.FC<BankSpendTrendChartProps> = ({
  transactions,
  timeframeLabel,
}) => {
  // Aggregate transactions by date / day
  const dateMap = new Map<string, { debits: number; credits: number; count: number }>();

  transactions.forEach((tx) => {
    // Extract date YYYY-MM-DD or readable
    const dayKey = tx.date.split(" ")[0];
    const curr = dateMap.get(dayKey) || { debits: 0, credits: 0, count: 0 };
    if (tx.type === "Debit") {
      curr.debits += tx.amount;
    } else {
      curr.credits += tx.amount;
    }
    curr.count += 1;
    dateMap.set(dayKey, curr);
  });

  const daysList = Array.from(dateMap.entries()).slice(0, 7);

  const maxVal = Math.max(
    ...daysList.map(([, d]) => Math.max(d.debits, d.credits)),
    1000
  );

  return (
    <div className="bg-white/85 backdrop-blur-md rounded-[26px] p-5 sm:p-6 border border-black/5 shadow-xs flex flex-col justify-between h-full">
      <div className="flex items-center justify-between pb-3 border-b border-black/5">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#F5D547]" />
            <h3 className="text-sm sm:text-base font-bold text-[#1A1A1A]">
              Cash Flow Trend ({timeframeLabel})
            </h3>
          </div>
          <p className="text-[11px] text-black/50">
            Daily debits (spent) vs credits (received)
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1A1A1A]" />
            <span className="text-black/70">Debits</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F5D547]" />
            <span className="text-black/70">Credits</span>
          </div>
        </div>
      </div>

      {/* Chart Visual */}
      <div className="my-4 pt-4">
        {daysList.length === 0 ? (
          <div className="h-36 flex items-center justify-center text-xs text-black/40">
            No transaction activity in this timeframe
          </div>
        ) : (
          <div className="h-36 sm:h-44 flex items-end justify-between px-2 sm:px-6 relative">
            {/* Dotted mid guide */}
            <div className="absolute inset-x-2 sm:inset-x-6 top-1/2 border-b border-dotted border-black/10 pointer-events-none" />

            {daysList.map(([day, stats], idx) => {
              const debitHeight = Math.min(100, Math.round((stats.debits / maxVal) * 100));
              const creditHeight = Math.min(100, Math.round((stats.credits / maxVal) * 100));

              return (
                <div
                  key={day}
                  className="flex flex-col items-center gap-2 group cursor-pointer relative"
                  title={`${day}: Debits ₹${stats.debits.toFixed(0)}, Credits ₹${stats.credits.toFixed(0)}`}
                >
                  {/* Bars container */}
                  <div className="h-28 sm:h-34 flex items-end justify-center gap-1.5">
                    {/* Debit Bar */}
                    <div
                      style={{ height: `${Math.max(debitHeight, 6)}%` }}
                      className="w-2.5 sm:w-3.5 bg-[#1A1A1A] rounded-full group-hover:bg-black transition-all"
                    />

                    {/* Credit Bar */}
                    {stats.credits > 0 && (
                      <div
                        style={{ height: `${Math.max(creditHeight, 6)}%` }}
                        className="w-2.5 sm:w-3.5 bg-[#F5D547] rounded-full group-hover:bg-[#edd045] transition-all"
                      />
                    )}
                  </div>

                  {/* Day label */}
                  <span className="text-[10px] font-semibold text-black/50 group-hover:text-black">
                    {day.slice(-5)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="pt-2 border-t border-black/5 flex items-center justify-between text-[11px] text-black/50">
        <span>Auto-synced from bank alert emails</span>
        <span className="text-[#1A1A1A] font-bold">
          {transactions.filter((t) => t.type === "Debit").length} Debits •{" "}
          {transactions.filter((t) => t.type === "Credit").length} Credits
        </span>
      </div>
    </div>
  );
};
