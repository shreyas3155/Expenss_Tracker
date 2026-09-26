"use client";

import React, { useState } from "react";
import {
  Monitor,
  Zap,
  Database,
  SlidersHorizontal,
  Paperclip,
  CheckCircle2,
  Circle,
  Utensils,
  Car,
  ShoppingBag,
  Receipt,
  Film,
  HeartPulse,
} from "lucide-react";
import { CategorySummary } from "@/types/dashboard";

interface CategorySplitCardProps {
  percentage: string;
  ratio: string;
  categories: CategorySummary[];
  onSelectCategory?: (categoryId: string) => void;
}

export const CategorySplitCard: React.FC<CategorySplitCardProps> = ({
  percentage,
  ratio,
  categories,
  onSelectCategory,
}) => {
  const [items, setItems] = useState<CategorySummary[]>(categories);

  const toggleStatus = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: item.status === "active" ? "pending" : "active",
            }
          : item
      )
    );
  };

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case "Monitor":
        return <Monitor className="w-3.5 h-3.5 text-white/80" />;
      case "Zap":
        return <Zap className="w-3.5 h-3.5 text-white/80" />;
      case "Database":
        return <Database className="w-3.5 h-3.5 text-white/80" />;
      case "SlidersHorizontal":
        return <SlidersHorizontal className="w-3.5 h-3.5 text-white/80" />;
      case "Paperclip":
        return <Paperclip className="w-3.5 h-3.5 text-white/80" />;
      case "Utensils":
        return <Utensils className="w-3.5 h-3.5 text-white/80" />;
      case "Car":
        return <Car className="w-3.5 h-3.5 text-white/80" />;
      case "ShoppingBag":
        return <ShoppingBag className="w-3.5 h-3.5 text-white/80" />;
      case "Receipt":
        return <Receipt className="w-3.5 h-3.5 text-white/80" />;
      case "Film":
        return <Film className="w-3.5 h-3.5 text-white/80" />;
      default:
        return <Circle className="w-3.5 h-3.5 text-white/80" />;
    }
  };

  return (
    <div className="flex flex-col h-full justify-between gap-3">
      {/* Top Part: Category Split & 3 Horizontal Progress Bars */}
      <div className="bg-white/85 backdrop-blur-md rounded-[26px] p-4 sm:p-5 border border-black/5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-bold text-[#1A1A1A]">Onboarding</span>
          <span className="text-2xl font-extrabold text-[#1A1A1A] tabular-nums">
            {percentage}
          </span>
        </div>

        {/* 3 Horizontal split bars with labels */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-black/50 font-medium px-1">
            <span>30%</span>
            <span>25%</span>
            <span>0%</span>
          </div>

          <div className="grid grid-cols-3 gap-1.5 h-7">
            {/* Yellow Segment */}
            <div className="bg-[#F5D547] rounded-xl flex items-center px-2 shadow-2xs">
              <span className="text-[10px] font-bold text-[#1A1A1A] truncate">
                Task
              </span>
            </div>

            {/* Dark Segment */}
            <div className="bg-[#1A1A1A] rounded-xl flex items-center px-2">
              <span className="text-[10px] font-bold text-white truncate">
                Other
              </span>
            </div>

            {/* Muted/Outline Segment */}
            <div className="bg-black/10 rounded-xl flex items-center px-2 border border-black/10">
              <span className="text-[10px] font-medium text-black/40 truncate">
                Wait
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stacked Dark Rounded Card: Top Categories / Tasks */}
      <div className="bg-[#1E1E1E] text-white rounded-[26px] p-4 sm:p-5 shadow-lg flex-1 flex flex-col justify-between">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <span className="text-xs sm:text-sm font-bold tracking-tight text-white/90">
            Onboarding Task
          </span>
          <span className="text-base sm:text-lg font-bold tabular-nums text-white/90">
            {ratio}
          </span>
        </div>

        {/* List of 5 category rows */}
        <div className="space-y-2.5 my-2">
          {items.map((cat) => {
            const isCompleted = cat.status === "active";

            return (
              <div
                key={cat.id}
                onClick={() => onSelectCategory && onSelectCategory(cat.id)}
                className="group flex items-center justify-between p-1.5 rounded-xl hover:bg-white/5 transition-all cursor-pointer"
              >
                {/* Left: Icon in dark capsule + Name + Date */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center shrink-0 group-hover:bg-white/20 transition-colors">
                    {getCategoryIcon(cat.iconName)}
                  </div>

                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-medium text-white/95 truncate">
                      {cat.name}
                    </span>
                    <span className="text-[10px] text-white/45 truncate">
                      {cat.dateFormatted || cat.amount}
                    </span>
                  </div>
                </div>

                {/* Right: Checkmark / indicator */}
                <button
                  type="button"
                  onClick={(e) => toggleStatus(cat.id, e)}
                  className="shrink-0 p-1 cursor-pointer active:scale-90 transition-transform"
                  title={isCompleted ? "Mark incomplete" : "Mark complete"}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-[#F5D547] fill-[#F5D547]/20" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-white/25 hover:border-white/50" />
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer Info */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-white/50">
          <span>{items.filter((i) => i.status === "active").length} of {items.length} completed</span>
          <span className="text-[#F5D547] font-medium cursor-pointer hover:underline">
            View All
          </span>
        </div>
      </div>
    </div>
  );
};
