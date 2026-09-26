"use client";

import React, { useState } from "react";
import { Database, RefreshCw, Mail, CheckCircle2, Code2, ExternalLink } from "lucide-react";

interface GeminiSyncBadgeProps {
  onSync: () => void;
  onOpenScriptModal: () => void;
  lastSyncTime?: string;
  isSyncing?: boolean;
  totalParsedCount: number;
}

export const GeminiSyncBadge: React.FC<GeminiSyncBadgeProps> = ({
  onSync,
  onOpenScriptModal,
  lastSyncTime = "Just now",
  isSyncing = false,
  totalParsedCount,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 bg-white/70 backdrop-blur-md rounded-2xl p-2.5 sm:p-3 border border-black/5 shadow-2xs">
      {/* Left: DB & Script Status */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        {/* Supabase Status Badge */}
        <div className="flex items-center gap-1.5 bg-[#1A1A1A] text-white px-3 py-1 rounded-full text-xs font-semibold shadow-xs">
          <Database className="w-3.5 h-3.5 text-[#F5D547]" />
          <span>Supabase DB</span>
          <span className="bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full ml-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            Live
          </span>
        </div>

        {/* Gmail Auto Sync Status */}
        <div className="flex items-center gap-1.5 bg-[#F6F3EB] border border-black/5 px-3 py-1 rounded-full text-xs text-[#1A1A1A] font-medium">
          <Mail className="w-3.5 h-3.5 text-black/60" />
          <span className="hidden sm:inline">Bank Email Sync:</span>
          <span className="font-semibold text-emerald-700 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
            Active
          </span>
        </div>

        {/* Stored Count */}
        <div className="text-[11px] text-black/50 hidden md:block">
          <strong className="text-[#1A1A1A] font-bold">{totalParsedCount}</strong> transactions in database
        </div>
      </div>

      {/* Right: Manual Sync & Script Guide Trigger */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenScriptModal}
          className="flex items-center gap-1.5 bg-white hover:bg-black/5 text-[#1A1A1A] border border-black/10 text-xs font-semibold px-3 py-1.5 rounded-full transition-all cursor-pointer shadow-2xs"
          title="View Google Apps Script & Webhook code"
        >
          <Code2 className="w-3.5 h-3.5 text-black/70" />
          <span className="hidden sm:inline">Apps Script Setup</span>
        </button>

        <button
          onClick={onSync}
          disabled={isSyncing}
          className="flex items-center gap-1.5 bg-[#F5D547] hover:bg-[#ebd043] active:scale-95 text-[#1A1A1A] text-xs font-bold px-3.5 py-1.5 rounded-full transition-all shadow-xs cursor-pointer disabled:opacity-50"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`}
          />
          <span>{isSyncing ? "Checking..." : "Sync Mail"}</span>
        </button>
      </div>
    </div>
  );
};
