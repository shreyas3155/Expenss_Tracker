"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Sparkles,
  Copy,
  Check,
  Mail,
  Receipt,
  Edit3,
  Save,
  Trash2,
  ChevronDown,
  ArrowDownRight,
  ArrowUpRight,
  RotateCcw,
} from "lucide-react";
import { BankTransaction } from "@/types/bankTransaction";

const PRESET_CATEGORIES = [
  "Food & Dining",
  "Shopping",
  "Groceries",
  "Transport",
  "Bills & Utilities",
  "Entertainment",
  "Salary & Income",
  "Investment",
  "Health & Medical",
  "Personal Care",
  "Transfer",
  "Other",
];

interface TransactionInspectorModalProps {
  transaction: BankTransaction | null;
  isOpen?: boolean;
  initialMode?: "view" | "edit";
  onClose: () => void;
  onUpdateTransaction?: (updated: BankTransaction) => Promise<void> | void;
  onDeleteTransaction?: (id: string) => Promise<void> | void;
}

export const TransactionInspectorModal: React.FC<TransactionInspectorModalProps> = ({
  transaction,
  initialMode = "view",
  onClose,
  onUpdateTransaction,
  onDeleteTransaction,
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(initialMode === "edit");
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Editable Form State
  const [payee, setPayee] = useState<string>("");
  const [amount, setAmount] = useState<number | string>("");
  const [category, setCategory] = useState<string>("Other");
  const [customCategory, setCustomCategory] = useState<string>("");
  const [type, setType] = useState<"Debit" | "Credit">("Debit");
  const [date, setDate] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  // Sync state whenever transaction changes or modal opens
  useEffect(() => {
    if (transaction) {
      setPayee(transaction.payee || "");
      setAmount(transaction.amount ?? 0);
      setCategory(transaction.category || "Other");
      setCustomCategory("");
      setType(transaction.type === "Credit" ? "Credit" : "Debit");
      setDate(transaction.date || "");
      setNotes(transaction.notes || "");
      setIsEditing(initialMode === "edit");
      setShowDeleteConfirm(false);
      setSaveSuccess(false);
      setErrorMessage(null);
    }
  }, [transaction, initialMode]);

  if (!transaction) return null;

  const copyVal = (val: string, fieldName: string) => {
    navigator.clipboard?.writeText(val);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 1500);
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!transaction) return;

    const finalCategory = category === "Custom" ? customCategory.trim() || "Other" : category;
    const finalAmount = Math.abs(parseFloat(String(amount))) || 0;
    const finalPayee = payee.trim() || transaction.payee;

    setIsSaving(true);
    setErrorMessage(null);

    const updatedTx: BankTransaction = {
      ...transaction,
      payee: finalPayee,
      amount: finalAmount,
      category: finalCategory,
      type: type,
      date: date.trim() || transaction.date,
      notes: notes.trim(),
    };

    try {
      const res = await fetch("/api/transactions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: transaction.id,
          payee: finalPayee,
          amount: finalAmount,
          category: finalCategory,
          type: type,
          date: date.trim() || transaction.date,
          notes: notes.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update transaction");
      }

      if (onUpdateTransaction) {
        await onUpdateTransaction(updatedTx);
      }

      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setIsEditing(false);
      }, 700);
    } catch (err: any) {
      console.error("Save transaction error:", err);
      setErrorMessage(err.message || "Failed to save changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!transaction || !onDeleteTransaction) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/transactions?id=${encodeURIComponent(transaction.id)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete transaction");
      }
      await onDeleteTransaction(transaction.id);
      onClose();
    } catch (err: any) {
      console.error("Delete error:", err);
      setErrorMessage(err.message || "Failed to delete transaction.");
      setIsDeleting(false);
    }
  };

  const isDebit = transaction.type === "Debit";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl max-h-[92vh] bg-[#F6F3EB] rounded-[32px] p-5 sm:p-7 shadow-2xl border border-black/10 flex flex-col relative overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Soft yellow ambient glow */}
        <div className="pointer-events-none absolute -top-16 -right-16 w-52 h-52 rounded-full bg-[#F5D547]/25 blur-3xl" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center text-black/60 hover:text-black transition-colors cursor-pointer z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Top Bar */}
        <div className="flex items-center justify-between pr-8 mb-2">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-[#1A1A1A] text-white px-2.5 py-0.5 rounded-full text-[11px] font-semibold">
              <Receipt className="w-3 h-3 text-[#F5D547]" />
              <span>{isEditing ? "Edit Transaction" : "Bank Transaction Details"}</span>
            </div>
            {!isEditing && (
              <span className="text-xs text-black/50">• {transaction.date}</span>
            )}
          </div>

          {/* Quick Toggle Edit Button */}
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-white hover:bg-black/5 border border-black/10 text-[#1A1A1A] px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-amber-600" />
              <span>Edit Payment</span>
            </button>
          )}
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3.5 py-2 rounded-xl text-xs font-medium my-2">
            {errorMessage}
          </div>
        )}

        {/* VIEW MODE HEADER */}
        {!isEditing ? (
          <div className="flex flex-wrap items-baseline justify-between gap-2 mt-1 pb-4 border-b border-black/5">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#1A1A1A]">
                {transaction.payee}
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-xs text-black/50">
                  Source: <span className="font-semibold text-black">{transaction.source}</span>
                </p>
                <span className="text-black/20">•</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white border border-black/10 text-black/70">
                  {transaction.category}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span
                className={`text-2xl sm:text-3xl font-extrabold tabular-nums tracking-tight ${
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
        ) : null}

        {/* SCROLLABLE BODY CONTENT */}
        <div className="flex-1 overflow-y-auto pr-1 my-3 space-y-4">
          {/* EDIT FORM */}
          {isEditing ? (
            <form onSubmit={handleSave} className="space-y-4 pt-1">
              {/* Type Switcher: Debit (Expense) / Credit (Income) */}
              <div>
                <label className="text-[11px] font-bold text-black/60 uppercase tracking-wider block mb-1.5">
                  Transaction Type
                </label>
                <div className="grid grid-cols-2 gap-2 bg-black/5 p-1 rounded-2xl border border-black/5">
                  <button
                    type="button"
                    onClick={() => setType("Debit")}
                    className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      type === "Debit"
                        ? "bg-[#1A1A1A] text-white shadow-xs"
                        : "text-black/60 hover:text-black"
                    }`}
                  >
                    <ArrowDownRight className="w-3.5 h-3.5 text-red-400" />
                    <span>Debit (Expense)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setType("Credit")}
                    className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      type === "Credit"
                        ? "bg-emerald-700 text-white shadow-xs"
                        : "text-black/60 hover:text-black"
                    }`}
                  >
                    <ArrowUpRight className="w-3.5 h-3.5 text-emerald-200" />
                    <span>Credit (Received / Income)</span>
                  </button>
                </div>
              </div>

              {/* Payee & Amount Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-black/60 uppercase tracking-wider block mb-1">
                    Payee / Merchant / Description
                  </label>
                  <input
                    type="text"
                    required
                    value={payee}
                    onChange={(e) => setPayee(e.target.value)}
                    placeholder="e.g. Swiggy, Uber, Rent"
                    className="w-full bg-white border border-black/10 focus:border-black rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-[#1A1A1A] outline-none shadow-2xs"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-black/60 uppercase tracking-wider block mb-1">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-white border border-black/10 focus:border-black rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-extrabold text-[#1A1A1A] outline-none shadow-2xs tabular-nums"
                  />
                </div>
              </div>

              {/* Category Selector */}
              <div>
                <label className="text-[11px] font-bold text-black/60 uppercase tracking-wider block mb-1.5">
                  Category
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {PRESET_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                        category === cat
                          ? "bg-[#1A1A1A] text-white border-black shadow-2xs"
                          : "bg-white text-black/70 border-black/10 hover:border-black/30 hover:bg-black/5"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setCategory("Custom")}
                    className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                      category === "Custom"
                        ? "bg-[#1A1A1A] text-white border-black shadow-2xs"
                        : "bg-white text-black/70 border-black/10 hover:border-black/30 hover:bg-black/5"
                    }`}
                  >
                    + Custom Category
                  </button>
                </div>

                {category === "Custom" && (
                  <input
                    type="text"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="Type custom category name..."
                    className="w-full bg-white border border-black/10 focus:border-black rounded-xl px-3.5 py-2 text-xs font-semibold text-[#1A1A1A] outline-none shadow-2xs mt-1"
                    autoFocus
                  />
                )}
              </div>

              {/* Date Input */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-black/60 uppercase tracking-wider block mb-1">
                    Transaction Date
                  </label>
                  <input
                    type="text"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    placeholder="YYYY-MM-DD"
                    className="w-full bg-white border border-black/10 focus:border-black rounded-xl px-3.5 py-2 text-xs font-semibold text-[#1A1A1A] outline-none shadow-2xs"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-black/60 uppercase tracking-wider block mb-1">
                    Reference / UTR
                  </label>
                  <input
                    type="text"
                    value={transaction.referenceNo}
                    disabled
                    className="w-full bg-black/5 border border-black/5 rounded-xl px-3.5 py-2 text-xs font-mono text-black/50 outline-none cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Notes Input */}
              <div>
                <label className="text-[11px] font-bold text-black/60 uppercase tracking-wider block mb-1">
                  Notes / Tags
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add custom notes, context or tags..."
                  className="w-full bg-white border border-black/10 focus:border-black rounded-xl p-3 text-xs text-[#1A1A1A] outline-none shadow-2xs resize-none"
                />
              </div>

              {/* Raw Bank Alert Info (Read Only) */}
              {transaction.bankNotification && (
                <div className="p-3 bg-white/70 rounded-xl border border-black/5">
                  <span className="text-[10px] text-black/40 font-semibold block mb-1">
                    Original Bank Notification (Column 7)
                  </span>
                  <p className="text-[11px] text-black/70 font-mono line-clamp-2">
                    {transaction.bankNotification}
                  </p>
                </div>
              )}
            </form>
          ) : (
            /* VIEW MODE DETAILS */
            <>
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
                <div className="p-3 bg-[#FAF9F5] rounded-xl font-mono text-[11px] text-black/80 leading-relaxed border border-black/5 select-all max-h-36 overflow-y-auto">
                  {transaction.bankNotification || "No raw notification text recorded."}
                </div>
              </div>

              {/* 10 Columns Inspector Grid */}
              <div className="bg-white rounded-2xl p-4 border border-black/5 shadow-2xs">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-[#1A1A1A]">
                    Excel / Google Sheet 10 Columns
                  </h4>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-amber-700 hover:text-amber-900 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Click to change category or payee</span>
                  </button>
                </div>

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

                  <div
                    onClick={() => setIsEditing(true)}
                    className="p-2.5 rounded-xl bg-[#F6F3EB]/60 hover:bg-[#F5D547]/20 border border-transparent hover:border-[#F5D547] transition-all cursor-pointer group"
                    title="Click to edit category"
                  >
                    <span className="text-[10px] text-black/40 font-semibold flex items-center justify-between">
                      <span>Column 4: Category</span>
                      <Edit3 className="w-2.5 h-2.5 opacity-40 group-hover:opacity-100 text-amber-700" />
                    </span>
                    <span className="font-bold text-[#1A1A1A] flex items-center gap-1 mt-0.5">
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
            </>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="pt-3 border-t border-black/5 flex flex-wrap items-center justify-between gap-2.5">
          {/* Delete Option */}
          {onDeleteTransaction && (
            <div>
              {showDeleteConfirm ? (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isDeleting ? "Deleting..." : "Confirm Delete"}
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="text-black/50 hover:text-black text-xs px-2 py-1 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-red-500/70 hover:text-red-600 hover:bg-red-50 px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                  title="Delete transaction"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Delete</span>
                </button>
              )}
            </div>
          )}

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 ml-auto">
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    // Reset to original
                    setPayee(transaction.payee);
                    setAmount(transaction.amount);
                    setCategory(transaction.category);
                    setType(transaction.type);
                    setDate(transaction.date);
                    setNotes(transaction.notes || "");
                  }}
                  disabled={isSaving}
                  className="bg-white hover:bg-black/5 border border-black/10 text-[#1A1A1A] px-4 py-2 rounded-full text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-[#1A1A1A] hover:bg-black text-white px-5 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer disabled:opacity-60"
                >
                  {saveSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Saved!</span>
                    </>
                  ) : isSaving ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5 text-[#F5D547]" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-[#F5D547] hover:bg-[#e6c63b] text-[#1A1A1A] px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Transaction</span>
                </button>
                <button
                  onClick={onClose}
                  className="bg-[#1A1A1A] hover:bg-black text-white px-4 py-2 rounded-full text-xs font-semibold shadow-md transition-all cursor-pointer"
                >
                  Close
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
