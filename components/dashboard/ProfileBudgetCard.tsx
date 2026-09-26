"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ChevronDown, ChevronUp, MoreVertical, Laptop, ShieldCheck, CreditCard, Gift, CheckCircle2 } from "lucide-react";
import { UserProfile, ExpandableListItem } from "@/types/dashboard";

interface ProfileBudgetCardProps {
  user: UserProfile;
  items: ExpandableListItem[];
  onManageBudget?: () => void;
}

export const ProfileBudgetCard: React.FC<ProfileBudgetCardProps> = ({
  user,
  items,
  onManageBudget,
}) => {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({
    devices: true,
  });

  const toggleItem = (id: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="bg-white/85 backdrop-blur-md rounded-[26px] p-4 sm:p-5 border border-black/5 shadow-xs flex flex-col justify-between h-full">
      {/* Top Profile Card Image with Gradient Overlay & Badge */}
      <div className="relative w-full aspect-4/3 rounded-[20px] overflow-hidden group shadow-inner mb-4">
        {/* Profile Avatar Image */}
        <Image
          src={user.avatarUrl}
          alt={user.name}
          fill
          sizes="(max-width: 768px) 100vw, 300px"
          className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
          priority
        />

        {/* Gradient Overlay for light and dark text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Bottom Content inside Image */}
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
          <div className="text-white">
            <h3 className="font-bold text-base sm:text-lg leading-tight drop-shadow-xs">
              {user.name}
            </h3>
            <p className="text-[11px] text-white/80 font-medium drop-shadow-xs">
              {user.role}
            </p>
          </div>

          {/* Monthly Budget Badge */}
          <button
            onClick={onManageBudget}
            className="bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-sm active:scale-95 transition-all cursor-pointer"
            title="Edit Monthly UPI Budget"
          >
            <span>{user.monthlyBudget}</span>
          </button>
        </div>
      </div>

      {/* Expandable list items */}
      <div className="flex flex-col divide-y divide-black/5">
        {items.map((item) => {
          const isOpen = !!openItems[item.id];
          return (
            <div key={item.id} className="py-2.5 first:pt-1 last:pb-1">
              {/* Header row */}
              <button
                type="button"
                onClick={() => toggleItem(item.id)}
                className="w-full flex items-center justify-between text-left group cursor-pointer"
              >
                <span className="text-xs font-semibold text-[#1A1A1A] group-hover:text-black transition-colors">
                  {item.title}
                </span>
                <span className="text-black/40 group-hover:text-black transition-colors">
                  {isOpen ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </span>
              </button>

              {/* Expanded details */}
              {isOpen && item.contentDetails && (
                <div className="mt-2.5 pt-1 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between p-2 rounded-xl bg-[#F6F3EB]/70 border border-black/5">
                    <div className="flex items-center gap-2.5">
                      {/* Device/Item thumbnail */}
                      <div className="w-9 h-9 rounded-lg bg-[#1A1A1A] text-white flex items-center justify-center shrink-0">
                        {item.iconName === "Laptop" ? (
                          <Laptop className="w-4 h-4 text-[#F5D547]" />
                        ) : item.iconName === "ShieldCheck" ? (
                          <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        ) : item.iconName === "CreditCard" ? (
                          <CreditCard className="w-4 h-4 text-sky-400" />
                        ) : (
                          <Gift className="w-4 h-4 text-amber-400" />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-[#1A1A1A] leading-tight">
                          {item.contentDetails.primaryText}
                        </span>
                        <span className="text-[10px] text-black/50">
                          {item.contentDetails.secondaryText}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="text-black/40 hover:text-black p-1 rounded-md"
                      title="Actions"
                    >
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
