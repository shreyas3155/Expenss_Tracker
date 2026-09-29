"use client";

import React from "react";
import { Loader2 } from "lucide-react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost" | "gold";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className = "",
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: "px-3 py-1.5 text-xs rounded-full gap-1.5",
      md: "px-4 py-2 text-xs sm:text-sm rounded-full gap-2",
      lg: "px-5 py-2.5 text-sm sm:text-base rounded-full gap-2.5",
    };

    const variantClasses = {
      primary:
        "bg-[#1A1A1A] hover:bg-black text-white shadow-xs focus-visible:ring-black",
      secondary:
        "bg-white hover:bg-black/5 text-[#1A1A1A] border border-black/10 shadow-2xs focus-visible:ring-black/20",
      outline:
        "bg-transparent hover:bg-black/5 text-[#1A1A1A] border border-black/20 focus-visible:ring-black/20",
      danger:
        "bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 focus-visible:ring-red-300",
      ghost:
        "bg-transparent hover:bg-black/5 text-black/70 hover:text-black focus-visible:ring-black/10",
      gold:
        "bg-[#F5D547] hover:bg-[#ebd043] text-[#1A1A1A] font-bold shadow-xs focus-visible:ring-[#F5D547]",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`inline-flex items-center justify-center font-bold tracking-tight transition-all duration-150 cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 outline-none focus-visible:ring-2 select-none ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-current" />
        ) : (
          leftIcon
        )}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = "Button";
