import React from "react";
import {
  Utensils,
  ShoppingBag,
  Car,
  Zap,
  Film,
  HeartPulse,
  Coffee,
  MoreHorizontal,
  ArrowDownLeft,
  ArrowUpRight,
  BookOpen,
  TrendingUp,
  Receipt,
  Tag,
  Circle,
} from "lucide-react";

export interface CategoryStyle {
  name: string;
  color: string; // Hex color for Recharts
  bgColor: string; // Tailwind background class
  textColor: string; // Tailwind text class
  borderColor: string; // Tailwind border class
  iconName: string;
}

export const CATEGORY_PALETTE: Record<string, CategoryStyle> = {
  "food & dining": {
    name: "Food & Dining",
    color: "#F59E0B",
    bgColor: "bg-amber-100",
    textColor: "text-amber-900",
    borderColor: "border-amber-200",
    iconName: "Utensils",
  },
  food: {
    name: "Food",
    color: "#F59E0B",
    bgColor: "bg-amber-100",
    textColor: "text-amber-900",
    borderColor: "border-amber-200",
    iconName: "Utensils",
  },
  soda: {
    name: "SODA",
    color: "#06B6D4",
    bgColor: "bg-cyan-100",
    textColor: "text-cyan-900",
    borderColor: "border-cyan-200",
    iconName: "Coffee",
  },
  shopping: {
    name: "Shopping",
    color: "#8B5CF6",
    bgColor: "bg-purple-100",
    textColor: "text-purple-900",
    borderColor: "border-purple-200",
    iconName: "ShoppingBag",
  },
  transport: {
    name: "Transport",
    color: "#0EA5E9",
    bgColor: "bg-sky-100",
    textColor: "text-sky-900",
    borderColor: "border-sky-200",
    iconName: "Car",
  },
  utilities: {
    name: "Utilities",
    color: "#F97316",
    bgColor: "bg-orange-100",
    textColor: "text-orange-900",
    borderColor: "border-orange-200",
    iconName: "Zap",
  },
  "bills & utilities": {
    name: "Bills & Utilities",
    color: "#F97316",
    bgColor: "bg-orange-100",
    textColor: "text-orange-900",
    borderColor: "border-orange-200",
    iconName: "Receipt",
  },
  health: {
    name: "Health",
    color: "#10B981",
    bgColor: "bg-emerald-100",
    textColor: "text-emerald-900",
    borderColor: "border-emerald-200",
    iconName: "HeartPulse",
  },
  medical: {
    name: "Medical",
    color: "#10B981",
    bgColor: "bg-emerald-100",
    textColor: "text-emerald-900",
    borderColor: "border-emerald-200",
    iconName: "HeartPulse",
  },
  entertainment: {
    name: "Entertainment",
    color: "#EC4899",
    bgColor: "bg-pink-100",
    textColor: "text-pink-900",
    borderColor: "border-pink-200",
    iconName: "Film",
  },
  income: {
    name: "Income",
    color: "#EAB308",
    bgColor: "bg-[#F5D547]/30",
    textColor: "text-[#1A1A1A]",
    borderColor: "border-[#F5D547]",
    iconName: "ArrowDownLeft",
  },
  "salary & income": {
    name: "Salary & Income",
    color: "#EAB308",
    bgColor: "bg-[#F5D547]/30",
    textColor: "text-[#1A1A1A]",
    borderColor: "border-[#F5D547]",
    iconName: "ArrowDownLeft",
  },
  education: {
    name: "Education",
    color: "#6366F1",
    bgColor: "bg-indigo-100",
    textColor: "text-indigo-900",
    borderColor: "border-indigo-200",
    iconName: "BookOpen",
  },
  investments: {
    name: "Investments",
    color: "#14B8A6",
    bgColor: "bg-teal-100",
    textColor: "text-teal-900",
    borderColor: "border-teal-200",
    iconName: "TrendingUp",
  },
  other: {
    name: "Other",
    color: "#64748B",
    bgColor: "bg-slate-100",
    textColor: "text-slate-800",
    borderColor: "border-slate-200",
    iconName: "MoreHorizontal",
  },
};

// Fallback dynamic colors for arbitrary user categories
const DYNAMIC_COLORS = [
  "#F59E0B",
  "#8B5CF6",
  "#0EA5E9",
  "#10B981",
  "#EC4899",
  "#F97316",
  "#06B6D4",
  "#6366F1",
  "#14B8A6",
  "#D946EF",
  "#84CC16",
  "#64748B",
];

export function getCategoryStyle(categoryName: string): CategoryStyle {
  if (!categoryName) {
    return CATEGORY_PALETTE["other"];
  }

  const key = categoryName.trim().toLowerCase();
  if (CATEGORY_PALETTE[key]) {
    return CATEGORY_PALETTE[key];
  }

  // Hash the name to pick a stable color
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash << 5) - hash + key.charCodeAt(i);
    hash |= 0;
  }
  const color = DYNAMIC_COLORS[Math.abs(hash) % DYNAMIC_COLORS.length];

  return {
    name: categoryName,
    color,
    bgColor: "bg-stone-100",
    textColor: "text-stone-800",
    borderColor: "border-stone-200",
    iconName: "Tag",
  };
}

export function renderCategoryIcon(iconName: string, className = "w-4 h-4") {
  switch (iconName) {
    case "Utensils":
      return <Utensils className={className} />;
    case "Coffee":
      return <Coffee className={className} />;
    case "ShoppingBag":
      return <ShoppingBag className={className} />;
    case "Car":
      return <Car className={className} />;
    case "Zap":
      return <Zap className={className} />;
    case "Receipt":
      return <Receipt className={className} />;
    case "HeartPulse":
      return <HeartPulse className={className} />;
    case "Film":
      return <Film className={className} />;
    case "ArrowDownLeft":
      return <ArrowDownLeft className={className} />;
    case "BookOpen":
      return <BookOpen className={className} />;
    case "TrendingUp":
      return <TrendingUp className={className} />;
    case "Tag":
      return <Tag className={className} />;
    default:
      return <MoreHorizontal className={className} />;
  }
}

/**
 * Robust date normalizer that handles:
 * - "2026-09-28"
 * - "2026-09-28 10:45 AM"
 * - "25-09-26" (DD-MM-YY)
 * - ISO string
 */
export function normalizeDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  const trimmed = dateStr.trim();

  // Format: DD-MM-YY (e.g. 25-09-26)
  if (/^\d{2}-\d{2}-\d{2}$/.test(trimmed)) {
    const [d, m, y] = trimmed.split("-");
    const fullYear = 2000 + parseInt(y, 10);
    return new Date(fullYear, parseInt(m, 10) - 1, parseInt(d, 10));
  }

  // Standard date or date-time
  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) {
    return parsed;
  }

  // Format: DD-MM-YYYY
  if (/^\d{2}-\d{2}-\d{4}$/.test(trimmed)) {
    const [d, m, y] = trimmed.split("-");
    return new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10));
  }

  return null;
}

export function toISODateString(dateStr: string): string {
  const d = normalizeDate(dateStr);
  if (!d) return dateStr.slice(0, 10);
  return d.toISOString().slice(0, 10);
}
