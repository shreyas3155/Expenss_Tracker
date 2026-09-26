"use client";

import React, { useState } from "react";
import { X, CheckCircle2, Copy, Check, Share2, Receipt, ArrowUpRight } from "lucide-react";
import { TransactionItem } from "@/types/dashboard";

interface TransactionDetailModalProps {
  transaction: TransactionItem | null;
  onClose: () => void;
}

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  transaction,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!transaction) return null;

  const utrNumber = `UPI-${transaction.id.toUpperCase()}-948102`;

  const copyUtr = () => {
    navigator.clipboard?.writeText(utrNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-[#F6F3EB] rounded-[30px] p-6 shadow-2xl border border-black/10 relative overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Soft yellow ambient glow */}
        <div className="pointer-events-none absolute -top-16 -right-16 w-48 h-48 rounded-full bg-[#F5D547]/30 blur-2xl" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center text-black/60 hover:text-black transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center pt-2 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-[#1A1A1A] text-white mx-auto flex items-center justify-center mb-3 shadow-md">
            <Receipt className="w-6 h-6 text-[#F5D547]" />
          </div>

          <h2 className="text-lg font-bold text-[#1A1A1A]">
            Transaction Receipt
          </h2>
          <div className="flex items-center justify-center gap-1 text-xs text-black/50 mt-0.5">
            <span className="font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              {transaction.status}
            </span>
            <span>via {transaction.upiApp}</span>
          </div>

          {/* Amount Display */}
          <div className="mt-4">
            <span className="text-4xl font-extrabold text-[#1A1A1A] tabular-nums tracking-tight">
              {transaction.amountFormatted}
            </span>
          </div>
        </div>

        {/* Receipt Details Card */}
        <div className="bg-white rounded-2xl p-4 border border-black/5 space-y-3 shadow-2xs text-xs">
          <div className="flex justify-between items-center pb-2 border-b border-black/5">
            <span className="text-black/50">Merchant / Title</span>
            <span className="font-bold text-[#1A1A1A] text-right">
              {transaction.merchant}
            </span>
          </div>

          <div className="flex justify-between items-center pb-2 border-b border-black/5">
            <span className="text-black/50">Details / Purpose</span>
            <span className="font-medium text-black/80 text-right max-w-[200px] truncate">
              {transaction.title}
            </span>
          </div>

          <div className="flex justify-between items-center pb-2 border-b border-black/5">
            <span className="text-black/50">Date & Time</span>
            <span className="font-medium text-[#1A1A1A]">
              {transaction.date} at {transaction.time}
            </span>
          </div>

          <div className="flex justify-between items-center pb-2 border-b border-black/5">
            <span className="text-black/50">UPI VPA</span>
            <span className="font-mono text-black/80 font-semibold">
              {transaction.upiId}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-black/50">UTR / Ref No.</span>
            <button
              onClick={copyUtr}
              className="flex items-center gap-1 font-mono text-black/70 hover:text-black font-medium group cursor-pointer"
            >
              <span>{utrNumber}</span>
              {copied ? (
                <Check className="w-3 h-3 text-emerald-600" />
              ) : (
                <Copy className="w-3 h-3 opacity-50 group-hover:opacity-100" />
              )}
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 flex gap-2.5">
          <button
            onClick={() => {
              alert(`Sharing receipt for ${transaction.merchant} - ${transaction.amountFormatted}`);
            }}
            className="flex-1 bg-white hover:bg-black/5 border border-black/10 text-[#1A1A1A] font-semibold text-xs py-3 rounded-2xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            Share Receipt
          </button>

          <button
            onClick={onClose}
            className="flex-1 bg-[#1A1A1A] hover:bg-black text-white font-semibold text-xs py-3 rounded-2xl transition-all shadow-md cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
