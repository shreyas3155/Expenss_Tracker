"use client";

import React, { useState } from "react";
import { X, Sparkles, CheckCircle2, Copy, Check, Mail, Building2, Receipt, Share2 } from "lucide-react";
import { BankTransaction } from "@/types/bankTransaction";

interface TransactionInspectorModalProps {
  transaction: BankTransaction | null;
  onClose: () => void;
  onUpdateTransaction?: (updated: BankTransaction) => void;
}

export const TransactionInspectorModal: React.FC<TransactionInspectorModalProps> = ({
  transaction,
  onClose,
  onUpdateTransaction,
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!transaction) return null;

  const copyVal = (val: string, fieldName: string) => {
    navigator.clipboard?.writeText(val);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 1500);
  };

  const isDebit = transaction.type === "Debit";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl max-h-[90vh] bg-[#F6F3EB] rounded-[32px] p-6 sm:p-7 shadow-2xl border border-black/10 flex flex-col relative overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Soft yellow ambient glow */}
        <div className="pointer-events-none absolute -top-16 -right-16 w-52 h-52 rounded-full bg-[#F5D547]/25 blur-3xl" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center text-black/60 hover:text-black transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2 mb-1">
          <div className="flex items-center gap-1.5 bg-[#1A1A1A] text-white px-2.5 py-0.5 rounded-full text-[11px] font-semibold">
            <Receipt className="w-3 h-3 text-[#F5D547]" />
            <span>Bank Transaction Details</span>
          </div>
          <span className="text-xs text-black/50">• {transaction.date}</span>
        </div>

        <div className="flex flex-wrap items-baseline justify-between gap-2 mt-2 pb-4 border-b border-black/5">
          <div>
            <h2 className="text-2xl font-extrabold text-[#1A1A1A]">
              {transaction.payee}
            </h2>
            <p className="text-xs text-black/50">
              Source: <span className="font-semibold text-black">{transaction.source}</span>
            </p>
          </div>

          <div className="text-right">
            <span
              className={`text-3xl font-extrabold tabular-nums tracking-tight ${
                isDebit ? "text-[#1A1A1A]" : "text-emerald-700"
              }`}
            >
              {isDebit ? "-" : "+"}₹
              {transaction.amount.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
              })}
            </span>
            <span
              className={`block text-[11px] font-bold ${
                isDebit ? "text-red-600" : "text-emerald-700"
              }`}
            >
              {transaction.type}
            </span>
          </div>
        </div>

        {/* Body content scrollable */}
        <div className="flex-1 overflow-y-auto pr-1 my-4 space-y-4">
          {/* Column 7: Raw Bank Notification */}
          <div className="bg-white rounded-2xl p-4 border border-black/5 shadow-2xs space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-[#1A1A1A]">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-black/60" />
                Raw Bank Alert / Email (Column 7)
              </span>
              <button
                onClick={() => copyVal(transaction.bankNotification, "notification")}
                className="text-black/40 hover:text-black flex items-center gap-1 text-[11px] font-normal cursor-pointer"
              >
                <span>Copy</span>
                {copiedField === "notification" ? (
                  <Check className="w-3 h-3 text-emerald-600" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>
            </div>
            <div className="p-3 bg-[#FAF9F5] rounded-xl font-mono text-[11px] text-black/80 leading-relaxed border border-black/5 select-all">
              {transaction.bankNotification || "No raw notification text recorded."}
            </div>
          </div>

          {/* 10 Columns Inspector Grid */}
          <div className="bg-white rounded-2xl p-4 border border-black/5 shadow-2xs">
            <h4 className="text-xs font-bold text-[#1A1A1A] mb-3">
              Excel / Google Sheet 10 Columns
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded-xl bg-[#F6F3EB]/60">
                <span className="text-[10px] text-black/40 font-semibold block">
                  Column 1: Date
                </span>
                <span className="font-semibold text-[#1A1A1A]">{transaction.date}</span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#F6F3EB]/60">
                <span className="text-[10px] text-black/40 font-semibold block">
                  Column 2: Payee / Description
                </span>
                <span className="font-bold text-[#1A1A1A]">{transaction.payee}</span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#F6F3EB]/60">
                <span className="text-[10px] text-black/40 font-semibold block">
                  Column 3: Amount
                </span>
                <span className="font-bold text-[#1A1A1A]">₹{transaction.amount}</span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#F6F3EB]/60">
                <span className="text-[10px] text-black/40 font-semibold block">
                  Column 4: Category (AI Classified)
                </span>
                <span className="font-bold text-[#1A1A1A] flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  {transaction.category}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#F6F3EB]/60">
                <span className="text-[10px] text-black/40 font-semibold block">
                  Column 5: Reference No. / UTR
                </span>
                <button
                  onClick={() => copyVal(transaction.referenceNo, "utr")}
                  className="font-mono text-black/80 font-bold hover:text-black flex items-center gap-1 cursor-pointer"
                >
                  <span>{transaction.referenceNo}</span>
                  {copiedField === "utr" ? (
                    <Check className="w-2.5 h-2.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-2.5 h-2.5 opacity-50" />
                  )}
                </button>
              </div>

              <div className="p-2.5 rounded-xl bg-[#F6F3EB]/60">
                <span className="text-[10px] text-black/40 font-semibold block">
                  Column 9: Type
                </span>
                <span className="font-bold text-[#1A1A1A]">{transaction.type}</span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#F6F3EB]/60">
                <span className="text-[10px] text-black/40 font-semibold block">
                  Column 10: Source / Method
                </span>
                <span className="font-semibold text-[#1A1A1A]">{transaction.source}</span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#F6F3EB]/60">
                <span className="text-[10px] text-black/40 font-semibold block">
                  Column 8: Message ID
                </span>
                <button
                  onClick={() => copyVal(transaction.messageId, "msgId")}
                  className="font-mono text-[11px] text-black/70 hover:text-black flex items-center gap-1 cursor-pointer"
                >
                  <span className="truncate max-w-[150px]">{transaction.messageId}</span>
                  {copiedField === "msgId" ? (
                    <Check className="w-2.5 h-2.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-2.5 h-2.5 opacity-50" />
                  )}
                </button>
              </div>
            </div>

            {/* Column 6: Notes */}
            <div className="mt-3 p-2.5 rounded-xl bg-[#F6F3EB]/60 text-xs">
              <span className="text-[10px] text-black/40 font-semibold block">
                Column 6: Notes
              </span>
              <p className="text-black/80 font-medium mt-0.5">
                {transaction.notes || "No notes added."}
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-black/5 flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="bg-[#1A1A1A] hover:bg-black text-white px-5 py-2.5 rounded-full text-xs font-semibold shadow-md transition-all cursor-pointer"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
