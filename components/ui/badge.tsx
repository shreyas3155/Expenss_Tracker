"use client";

import React from "react";
import { X } from "lucide-react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "outline" | "gold" | "success" | "warning" | "danger";
  size?: "sm" | "md";
  onRemove?: () => void;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className = "",
  variant = "default",
  size = "md",
  onRemove,
  icon,
  ...props
}) => {
  const sizeClasses = {
    sm: "px-2 py-0.5 text-[10px] gap-1",
    md: "px-2.5 py-1 text-xs gap-1.5",
  };

  const variantClasses = {
    default: "bg-[#1A1A1A] text-white border-transparent",
    secondary: "bg-black/5 text-[#1A1A1A] border-black/10",
    outline: "bg-white text-black/80 border-black/15",
    gold: "bg-[#F5D547]/30 text-[#1A1A1A] border-[#F5D547] font-bold",
    success: "bg-emerald-50 text-emerald-800 border-emerald-200",
    warning: "bg-amber-50 text-amber-800 border-amber-200",
    danger: "bg-red-50 text-red-700 border-red-200",
  };

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full border transition-colors select-none ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {icon}
      <span>{children}</span>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="hover:opacity-100 opacity-60 ml-0.5 rounded-full p-0.5 hover:bg-black/10 cursor-pointer transition-colors"
          aria-label="Remove item"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
};
