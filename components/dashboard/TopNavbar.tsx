"use client";

import React, { useState } from "react";
import {
  Settings,
  Bell,
  Search,
  Plus,
  Sparkles,
  LayoutDashboard,
  Receipt,
  FileSpreadsheet,
  LogOut,
  PieChart,
} from "lucide-react";

interface TopNavbarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenAddModal: () => void;
  unreadNotificationsCount?: number;
  onLogout?: () => void;
  userName?: string;
}

export const NAV_TABS = [
  { id: "Dashboard", label: "Dashboard" },
  { id: "Rules", label: "Payee Rules" },
  { id: "Categories", label: "Charts & Categories" },
  { id: "Transactions", label: "Ledger Table" },
  { id: "Reports", label: "Reports" },
];

export const TopNavbar: React.FC<TopNavbarProps> = ({
  activeTab,
  onTabChange,
  onOpenAddModal,
  unreadNotificationsCount = 2,
  onLogout,
  userName = "Shreyas Hathiwala",
}) => {
  const [showNotificationToast, setShowNotificationToast] = useState(false);

  return (
    <>
      <header className="w-full flex items-center justify-between gap-2 sm:gap-4 mb-4 sm:mb-6">
        {/* Left: Brand Logo in a clean rounded pill */}
        <div className="flex items-center">
          <div className="group flex items-center gap-2 bg-white/90 hover:bg-white transition-all duration-200 border border-black/5 rounded-full px-3.5 sm:px-5 py-1.5 sm:py-2 shadow-xs cursor-pointer">
            <div className="w-2.5 h-2.5 rounded-full bg-[#F5D547] group-hover:scale-125 transition-transform shrink-0" />
            <span className="font-extrabold tracking-tight text-base sm:text-lg text-[#1A1A1A]">
              Spendly
            </span>
            <span className="text-[10px] uppercase font-semibold tracking-wider text-black/40 bg-black/5 px-2 py-0.5 rounded-full hidden sm:inline-block">
              UPI Pro
            </span>
          </div>
        </div>

        {/* Center: Navigation tabs in pill container (Desktop) */}
        <nav
          aria-label="Main Navigation"
          className="hidden md:flex items-center bg-white/70 backdrop-blur-md rounded-full p-1.5 border border-black/5 shadow-xs"
        >
          {NAV_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`px-3.5 lg:px-4 py-1.5 rounded-full text-xs lg:text-[13px] font-medium transition-all duration-200 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#1A1A1A]/30 cursor-pointer ${
                  isActive
                    ? "bg-[#1A1A1A] text-white shadow-xs font-semibold"
                    : "text-[#555555] hover:text-[#1A1A1A] hover:bg-black/5"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Right: Quick actions, notifications, user profile */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 relative">
          {/* Quick Add Transaction Pill (Desktop) */}
          <button
            onClick={onOpenAddModal}
            className="hidden sm:flex items-center gap-1.5 bg-[#F5D547] hover:bg-[#ebd043] active:scale-95 text-[#1A1A1A] font-bold text-xs px-3.5 py-2 rounded-full transition-all shadow-xs cursor-pointer"
            title="Record new UPI expense"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Add Expense</span>
          </button>

          {/* Notification Bell */}
          <button
            onClick={() => setShowNotificationToast(!showNotificationToast)}
            className="relative bg-white/90 hover:bg-white transition-all text-[#1A1A1A] p-2 rounded-full border border-black/5 shadow-xs cursor-pointer active:scale-95"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4 text-black/80" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#F5D547] border border-white" />
            )}
          </button>

          {/* Notification Popup Dropdown */}
          {showNotificationToast && (
            <div className="absolute top-12 right-0 z-50 w-72 max-w-[90vw] bg-white rounded-2xl shadow-xl border border-black/10 p-3 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-black/5">
                <span className="text-xs font-bold text-[#1A1A1A]">Notifications</span>
                <span className="text-[10px] text-black/40">2 unread</span>
              </div>
              <div className="mt-2 space-y-2 text-xs">
                <div className="p-2 rounded-xl bg-[#F6F3EB] text-[#1A1A1A]">
                  <p className="font-semibold">UPI Sync Ready</p>
                  <p className="text-[11px] text-black/60">Google Apps Script webhook is live.</p>
                </div>
                <div className="p-2 rounded-xl bg-white border border-black/5 text-[#1A1A1A]">
                  <p className="font-semibold">Database Live</p>
                  <p className="text-[11px] text-black/60">Connected to Supabase PostgreSQL.</p>
                </div>
              </div>
            </div>
          )}

          {/* User Profile & Logout */}
          <div className="flex items-center gap-1.5 bg-white/90 border border-black/5 rounded-full py-1 px-2.5 shadow-xs">
            <div className="w-6 h-6 rounded-full bg-[#1A1A1A] text-[#F5D547] text-[10px] font-bold flex items-center justify-center shrink-0">
              SH
            </div>
            <span className="text-xs font-bold text-[#1A1A1A] hidden md:inline truncate max-w-[90px]">
              Shreyas
            </span>
            {onLogout && (
              <button
                onClick={onLogout}
                className="text-[11px] font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2 py-0.5 rounded-full ml-0.5 cursor-pointer transition-colors"
                title="Sign out"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Floating Bottom Navigation Bar for Mobile (Thumb-Friendly) */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="fixed bottom-3 inset-x-3 z-40 md:hidden bg-[#1A1A1A]/95 text-white backdrop-blur-xl rounded-full px-4 py-2 shadow-[0_8px_30px_rgb(0,0,0,0.3)] flex items-center justify-between border border-white/10"
      >
        <button
          onClick={() => onTabChange("Dashboard")}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-full transition-colors cursor-pointer ${
            activeTab === "Dashboard"
              ? "text-[#F5D547]"
              : "text-white/60 hover:text-white"
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span className="text-[10px] font-semibold">Home</span>
        </button>

        <button
          onClick={() => onTabChange("Rules")}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-full transition-colors cursor-pointer ${
            activeTab === "Rules"
              ? "text-[#F5D547]"
              : "text-white/60 hover:text-white"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span className="text-[10px] font-semibold">Rules</span>
        </button>

        {/* Center Golden Add Button */}
        <button
          onClick={onOpenAddModal}
          className="flex items-center justify-center w-11 h-11 rounded-full bg-[#F5D547] text-[#1A1A1A] shadow-lg active:scale-90 transition-transform -my-1 cursor-pointer shrink-0"
          title="Add Expense"
          aria-label="Add Expense"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
        </button>

        <button
          onClick={() => onTabChange("Transactions")}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-full transition-colors cursor-pointer ${
            activeTab === "Transactions"
              ? "text-[#F5D547]"
              : "text-white/60 hover:text-white"
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span className="text-[10px] font-semibold">Ledger</span>
        </button>

        <button
          onClick={() => onTabChange("Categories")}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-full transition-colors cursor-pointer ${
            activeTab === "Categories" || activeTab === "Analytics"
              ? "text-[#F5D547]"
              : "text-white/60 hover:text-white"
          }`}
        >
          <PieChart className="w-4 h-4" />
          <span className="text-[10px] font-semibold">Charts</span>
        </button>

        <button
          onClick={() => onTabChange("Reports")}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-full transition-colors cursor-pointer ${
            activeTab === "Reports"
              ? "text-[#F5D547]"
              : "text-white/60 hover:text-white"
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span className="text-[10px] font-semibold">Export</span>
        </button>
      </nav>
    </>
  );
};
