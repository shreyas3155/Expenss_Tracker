"use client";

import React, { useState } from "react";
import { ArrowUpRight, Play, Pause, RotateCw, Clock } from "lucide-react";
import { CashFlowStats } from "@/types/dashboard";

interface CashFlowGaugeCardProps {
  cashFlow: CashFlowStats;
  onOpenDetails?: () => void;
}

export const CashFlowGaugeCard: React.FC<CashFlowGaugeCardProps> = ({
  cashFlow,
  onOpenDetails,
}) => {
  const [activeMode, setActiveMode] = useState<"debits" | "credits">("debits");
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isRotating, setIsRotating] = useState<boolean>(false);

  // Gauge parameters
  const size = 160;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // Arc sweeps around 68% of the circle, starting from top or top-right
  const strokeDashoffset = circumference - (circumference * cashFlow.gaugePercentage) / 100;

  const handleRefresh = () => {
    setIsRotating(true);
    setTimeout(() => setIsRotating(false), 600);
  };

  return (
    <div className="bg-white/85 backdrop-blur-md rounded-[26px] p-5 sm:p-6 border border-black/5 shadow-xs flex flex-col justify-between h-full relative">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-[#1A1A1A]">
            Time tracker
          </h3>
          <p className="text-[11px] text-black/45 font-medium">
            Cash Flow & Velocity
          </p>
        </div>

        {/* Diagonal Arrow Up Right Action Button */}
        <button
          onClick={onOpenDetails}
          className="w-7 h-7 rounded-full border border-black/10 hover:border-black/30 flex items-center justify-center text-[#1A1A1A] hover:bg-black/5 transition-all cursor-pointer"
          title="View cash flow breakdown"
        >
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Center Circular Gauge with Radial Ticks & Yellow Butter Arc */}
      <div className="my-2 sm:my-3 flex items-center justify-center relative">
        <div className="relative w-38 h-38 sm:w-42 sm:h-42 flex items-center justify-center">
          {/* 60 Minute Radial Tick Marks (Dotted Clock/Dial style from the reference) */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 160 160"
          >
            {[...Array(40)].map((_, i) => {
              const angle = (i * 360) / 40;
              const isMajor = i % 5 === 0;
              return (
                <line
                  key={i}
                  x1="80"
                  y1={isMajor ? "16" : "18"}
                  x2="80"
                  y2="22"
                  transform={`rotate(${angle} 80 80)`}
                  stroke="#1A1A1A"
                  strokeWidth={isMajor ? "1.5" : "0.75"}
                  strokeLinecap="round"
                  opacity={isMajor ? 0.35 : 0.18}
                />
              );
            })}

            {/* Glowing Butter Yellow Arc Progress Indicator */}
            <circle
              cx="80"
              cy="80"
              r={radius - 8}
              fill="none"
              stroke="#F5D547"
              strokeWidth="9"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              transform="rotate(35 80 80)"
              className="transition-all duration-700 ease-out drop-shadow-2xs"
            />
          </svg>

          {/* Center Digital Readout */}
          <div className="text-center relative z-10 flex flex-col items-center justify-center">
            <span className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] tabular-nums tracking-tight">
              {activeMode === "debits" ? cashFlow.currentBalance : "₹18,450"}
            </span>
            <span className="text-[10px] sm:text-[11px] text-black/50 font-medium">
              {activeMode === "debits" ? cashFlow.balanceLabel : "Net Balance"}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Controls: Play/Pause Pill Toggle & Dark Circular Refresh */}
      <div className="flex items-center justify-between pt-1">
        {/* Play/Pause Pill Style Toggle */}
        <div className="flex items-center bg-white border border-black/10 rounded-full p-1 shadow-2xs">
          <button
            onClick={() => {
              setIsPlaying(true);
              setActiveMode("debits");
            }}
            className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeMode === "debits"
                ? "bg-[#1A1A1A] text-white shadow-xs"
                : "text-black/60 hover:text-black"
            }`}
            title="Debits View"
          >
            <Play className="w-3 h-3 fill-current" />
            <span className="text-[11px]">Debits</span>
          </button>

          <button
            onClick={() => {
              setIsPlaying(false);
              setActiveMode("credits");
            }}
            className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeMode === "credits"
                ? "bg-[#F5D547] text-[#1A1A1A] shadow-xs"
                : "text-black/60 hover:text-black"
            }`}
            title="Credits View"
          >
            <Pause className="w-3 h-3 fill-current" />
            <span className="text-[11px]">Credits</span>
          </button>
        </div>

        {/* Small Refresh / Clock in Dark Circle */}
        <button
          onClick={handleRefresh}
          className="w-9 h-9 rounded-full bg-[#1A1A1A] hover:bg-black text-white flex items-center justify-center shadow-xs transition-transform active:scale-90 cursor-pointer"
          title="Refresh real-time UPI sync"
        >
          <RotateCw
            className={`w-3.5 h-3.5 transition-transform duration-500 ${
              isRotating ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>
    </div>
  );
};
