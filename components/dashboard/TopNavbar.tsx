"use client";

import React, { useState } from "react";
import { Settings, Bell, Search, Plus, Sparkles } from "lucide-react";

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
  { id: "Transactions", label: "Transactions" },
  { id: "Categories", label: "Categories" },
  { id: "Budgets", label: "Budgets" },
  { id: "Insights", label: "Insights" },
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
    <header className="w-full flex items-center justify-between gap-2 sm:gap-4 mb-6 sm:mb-8">
      {/* Left: Brand Logo in a clean rounded pill */}
      <div className="flex items-center">
        <div className="group flex items-center gap-2 bg-white/80 hover:bg-white transition-all duration-200 border border-black/5 rounded-full px-5 py-2 shadow-xs cursor-pointer">
          <div className="w-2.5 h-2.5 rounded-full bg-[#F5D547] group-hover:scale-125 transition-transform" />
          <span className="font-bold tracking-tight text-lg text-[#1A1A1A]">
            Spendly
          </span>
          <span className="text-[10px] uppercase font-semibold tracking-wider text-black/40 bg-black/5 px-2 py-0.5 rounded-full hidden sm:inline-block">
            UPI Pro
          </span>
        </div>
      </div>

      {/* Center: Navigation tabs in pill container */}
      <nav
        aria-label="Main Navigation"
        className="hidden md:flex items-center bg-white/60 backdrop-blur-md rounded-full p-1.5 border border-black/5 shadow-xs"
      >
        {NAV_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-3.5 lg:px-4 py-1.5 rounded-full text-xs lg:text-[13px] font-medium transition-all duration-200 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#1A1A1A]/30 ${
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

      {/* Right: Quick actions, notifications, settings */}
      <div className="flex items-center gap-2 sm:gap-2.5 relative">
        {/* Quick Add Transaction Pill */}
        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-1.5 bg-[#F5D547] hover:bg-[#ebd043] active:scale-95 text-[#1A1A1A] font-semibold text-xs px-3.5 py-2 rounded-full transition-all shadow-xs cursor-pointer"
          title="Record new UPI expense"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span className="hidden sm:inline">Add Expense</span>
        </button>

        {/* Setting Button */}
        <button
          onClick={() => alert("Settings panel: UPI Accounts & Sync settings configured")}
          className="hidden sm:flex items-center gap-1.5 bg-white/80 hover:bg-white transition-all text-[#1A1A1A] text-xs font-medium px-3 py-2 rounded-full border border-black/5 shadow-xs cursor-pointer active:scale-95"
        >
          <Settings className="w-3.5 h-3.5 text-black/70" />
          <span>Setting</span>
        </button>

        {/* Notification Bell */}
        <button
          onClick={() => setShowNotificationToast(!showNotificationToast)}
          className="relative bg-white/80 hover:bg-white transition-all text-[#1A1A1A] p-2 rounded-full border border-black/5 shadow-xs cursor-pointer active:scale-95"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4 text-black/80" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#F5D547] border border-white" />
          )}
        </button>

        {/* Notification Popup Dropdown */}
        {showNotificationToast && (
          <div className="absolute top-12 right-0 z-50 w-72 bg-white rounded-2xl shadow-xl border border-black/10 p-3 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-black/5">
              <span className="text-xs font-bold text-[#1A1A1A]">Notifications</span>
              <span className="text-[10px] text-black/40">2 unread</span>
            </div>
            <div className="mt-2 space-y-2 text-xs">
              <div className="p-2 rounded-xl bg-[#F6F3EB] text-[#1A1A1A]">
                <p className="font-semibold">UPI AutoPay Successful</p>
                <p className="text-[11px] text-black/60">₹649 for Netflix debited via HDFC UPI.</p>
              </div>
              <div className="p-2 rounded-xl bg-white border border-black/5 text-[#1A1A1A]">
                <p className="font-semibold">Weekly Budget Alert</p>
                <p className="text-[11px] text-black/60">You have spent 68% of your weekly budget.</p>
              </div>
            </div>
          </div>
        )}

        {/* User Profile & Logout Button */}
        <div className="flex items-center gap-1.5 bg-white/80 border border-black/5 rounded-full py-1 px-2.5 shadow-xs">
          <div className="w-6 h-6 rounded-full bg-[#1A1A1A] text-[#F5D547] text-[10px] font-bold flex items-center justify-center">
            SH
          </div>
          <span className="text-xs font-bold text-[#1A1A1A] hidden md:inline">
            Shreyas H.
          </span>
          {onLogout && (
            <button
              onClick={onLogout}
              className="text-[11px] font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2 py-0.5 rounded-full ml-1 cursor-pointer transition-colors"
              title="Sign out"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
