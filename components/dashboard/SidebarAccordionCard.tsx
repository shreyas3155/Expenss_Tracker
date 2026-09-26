"use client";

import React, { useState } from "react";
import {
  PieChart,
  CreditCard,
  Layers,
  Repeat,
  Download,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Check,
} from "lucide-react";

interface SidebarAccordionCardProps {
  onExportData?: () => void;
  onOpenBudgets?: () => void;
}

export const SidebarAccordionCard: React.FC<SidebarAccordionCardProps> = ({
  onExportData,
  onOpenBudgets,
}) => {
  const [openSection, setOpenSection] = useState<string | null>("payment");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const toggleSection = (id: string) => {
    setOpenSection((prev) => (prev === id ? null : id));
  };

  const copyUpiId = (id: string) => {
    setCopiedId(id);
    navigator.clipboard?.writeText(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const items = [
    {
      id: "budgets",
      title: "Budgets",
      icon: PieChart,
      badge: "₹45k / mo",
      content: (
        <div className="space-y-2 pt-1 text-xs">
          <div className="flex justify-between text-black/60">
            <span>Spent: ₹12,560</span>
            <span className="font-semibold text-[#1A1A1A]">28% Used</span>
          </div>
          <div className="w-full h-1.5 bg-black/10 rounded-full overflow-hidden">
            <div className="h-full bg-[#F5D547] rounded-full w-[28%]" />
          </div>
          <button
            onClick={onOpenBudgets}
            className="text-[11px] text-black font-semibold hover:underline flex items-center gap-1 pt-1"
          >
            Adjust Budget Limits <ExternalLink className="w-2.5 h-2.5" />
          </button>
        </div>
      ),
    },
    {
      id: "payment",
      title: "Payment Methods",
      icon: CreditCard,
      badge: "2 Linked",
      content: (
        <div className="space-y-2 pt-1">
          <div
            onClick={() => copyUpiId("lora@okhdfcbank")}
            className="flex items-center justify-between p-2 rounded-xl bg-white border border-black/5 hover:border-black/20 transition-all cursor-pointer group"
          >
            <div>
              <p className="text-xs font-bold text-[#1A1A1A]">HDFC Bank UPI</p>
              <p className="text-[10px] text-black/50">lora@okhdfcbank</p>
            </div>
            <span className="text-[10px] bg-[#F5D547]/30 text-[#1A1A1A] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
              {copiedId === "lora@okhdfcbank" ? (
                <>
                  <Check className="w-2.5 h-2.5 text-emerald-700" /> Copied
                </>
              ) : (
                "Primary"
              )}
            </span>
          </div>

          <div
            onClick={() => copyUpiId("lora@axisbank")}
            className="flex items-center justify-between p-2 rounded-xl bg-white border border-black/5 hover:border-black/20 transition-all cursor-pointer group"
          >
            <div>
              <p className="text-xs font-bold text-[#1A1A1A]">Axis Pay UPI</p>
              <p className="text-[10px] text-black/50">lora@axisbank</p>
            </div>
            <span className="text-[10px] bg-black/5 text-black/60 font-medium px-2 py-0.5 rounded-full">
              Secondary
            </span>
          </div>
        </div>
      ),
    },
    {
      id: "categories",
      title: "Categories",
      icon: Layers,
      badge: "8 Active",
      content: (
        <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px]">
          <span className="px-2 py-1 bg-white rounded-lg border border-black/5 text-black/70">
            🍔 Food & Dining
          </span>
          <span className="px-2 py-1 bg-white rounded-lg border border-black/5 text-black/70">
            🚕 Transport
          </span>
          <span className="px-2 py-1 bg-white rounded-lg border border-black/5 text-black/70">
            🛍️ Shopping
          </span>
          <span className="px-2 py-1 bg-white rounded-lg border border-black/5 text-black/70">
            💡 Utilities
          </span>
        </div>
      ),
    },
    {
      id: "recurring",
      title: "Recurring Mandates",
      icon: Repeat,
      badge: "3 AutoPay",
      content: (
        <div className="space-y-1.5 pt-1 text-xs">
          <div className="flex justify-between items-center py-1 border-b border-black/5">
            <span className="font-medium text-[#1A1A1A]">Netflix Premium</span>
            <span className="font-semibold text-black/80">₹649/mo</span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-black/5">
            <span className="font-medium text-[#1A1A1A]">Spotify Duo</span>
            <span className="font-semibold text-black/80">₹149/mo</span>
          </div>
          <div className="flex justify-between items-center py-1">
            <span className="font-medium text-[#1A1A1A]">Zerodha SIP</span>
            <span className="font-semibold text-black/80">₹5,000/mo</span>
          </div>
        </div>
      ),
    },
    {
      id: "export",
      title: "Export & Backup",
      icon: Download,
      badge: "CSV / JSON",
      content: (
        <div className="pt-1">
          <p className="text-[11px] text-black/50 mb-2">
            Download your monthly UPI expense statement for Google Sheets or Excel.
          </p>
          <button
            onClick={onExportData}
            className="w-full bg-[#1A1A1A] hover:bg-black text-white text-xs font-semibold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Download Statement (.CSV)
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white/85 backdrop-blur-md rounded-[26px] p-4 sm:p-5 border border-black/5 shadow-xs flex flex-col justify-between h-full">
      <div className="flex items-center justify-between pb-3 border-b border-black/5 mb-2">
        <h4 className="text-xs font-bold tracking-tight text-[#1A1A1A] uppercase">
          Management
        </h4>
        <span className="text-[10px] text-black/40 font-medium">Quick Settings</span>
      </div>

      <div className="space-y-1.5 divide-y divide-black/5">
        {items.map((item) => {
          const isOpen = openSection === item.id;
          const IconComponent = item.icon;

          return (
            <div key={item.id} className="pt-2 first:pt-0">
              <button
                type="button"
                onClick={() => toggleSection(item.id)}
                className="w-full flex items-center justify-between p-1.5 rounded-xl hover:bg-black/5 transition-colors text-left cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-black/5 group-hover:bg-[#F5D547]/30 flex items-center justify-center transition-colors">
                    <IconComponent className="w-3.5 h-3.5 text-[#1A1A1A]" />
                  </div>
                  <span className="text-xs font-semibold text-[#1A1A1A]">
                    {item.title}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {item.badge && (
                    <span className="text-[10px] font-medium text-black/40 bg-black/5 px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                  {isOpen ? (
                    <ChevronUp className="w-3.5 h-3.5 text-black/40" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-black/40" />
                  )}
                </div>
              </button>

              {isOpen && (
                <div className="p-2.5 bg-[#F6F3EB]/60 rounded-xl my-1 animate-in fade-in zoom-in-98 duration-150">
                  {item.content}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
