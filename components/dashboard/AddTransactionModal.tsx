"use client";

import React, { useState, useEffect } from "react";
import { X, Plus, ArrowUpRight, ArrowDownRight, Calendar, Tag, CreditCard, FileText } from "lucide-react";
import { TransactionItem } from "@/types/dashboard";

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTransaction: (transaction: TransactionItem) => void;
  initialType?: "Credit" | "Debit";
}

const DEBIT_CATEGORIES = [
  "Food",
  "Transport",
  "Shopping",
  "Utilities",
  "Entertainment",
  "Health",
  "Other",
];

const CREDIT_CATEGORIES = [
  "Income",
  "Salary",
  "Freelance",
  "Cashback",
  "Refund",
  "Investment",
  "Gift / Transfer",
  "Other",
];

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  onAddTransaction,
  initialType = "Debit",
}) => {
  const [txType, setTxType] = useState<"Credit" | "Debit">(initialType);
  const [payee, setPayee] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [sourceApp, setSourceApp] = useState<"GPay" | "PhonePe" | "Paytm" | "Cred" | "BHIM">("GPay");
  const [referenceNo, setReferenceNo] = useState("");
  const [notes, setNotes] = useState("");

  // Sync initialType when modal opens
  useEffect(() => {
    if (isOpen) {
      setTxType(initialType);
      setCategory(initialType === "Credit" ? "Income" : "Food");
      setDate(new Date().toISOString().slice(0, 10));
    }
  }, [isOpen, initialType]);

  // When type toggles, set reasonable default category
  const handleTypeChange = (newType: "Credit" | "Debit") => {
    setTxType(newType);
    if (newType === "Credit" && !CREDIT_CATEGORIES.includes(category)) {
      setCategory("Income");
    } else if (newType === "Debit" && !DEBIT_CATEGORIES.includes(category)) {
      setCategory("Food");
    }
  };

  if (!isOpen) return null;

  const isCredit = txType === "Credit";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (!payee.trim() || isNaN(num) || num <= 0) {
      alert("Please provide a valid recipient/sender name and positive amount.");
      return;
    }

    const now = new Date();
    const timeFormatted = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const newTx: TransactionItem = {
      id: `tx-${Date.now().toString().slice(-6)}`,
      merchant: payee.trim(),
      title: notes.trim() || (isCredit ? `Received via ${sourceApp}` : `${category} payment`),
      category: category,
      amount: num,
      amountFormatted: `₹${num.toLocaleString("en-IN")}`,
      type: isCredit ? "credit" : "debit",
      date: date,
      time: timeFormatted,
      timeSlot: "10:00 am",
      dayOfWeek: "Mon",
      dayNumber: 1,
      upiId: referenceNo.trim() || `UPI/${Date.now().toString().slice(-8)}`,
      upiApp: sourceApp,
      status: "Success",
      avatarInitials: [payee.slice(0, 2).toUpperCase()],
      notes: notes.trim(),
    };

    onAddTransaction(newTx);
    setPayee("");
    setAmount("");
    setReferenceNo("");
    setNotes("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-[#F6F3EB] rounded-[28px] sm:rounded-[32px] p-5 sm:p-7 shadow-2xl border border-black/10 relative overflow-hidden animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center text-black/60 hover:text-black transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isCredit ? "bg-emerald-500 animate-pulse" : "bg-[#F5D547]"
              }`}
            />
            <span className="text-[11px] font-bold uppercase tracking-wider text-black/40">
              Supabase Manual Entry
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#1A1A1A]">
            {isCredit ? "Add Received / Credit" : "Add Expense / Debit"}
          </h2>
          <p className="text-xs text-black/50 mt-0.5">
            {isCredit
              ? "Record manual income, salary, or received money into Supabase"
              : "Record manual expense or spent transaction into Supabase"}
          </p>
        </div>

        {/* Segmented Type Toggle (Debit vs Credit) */}
        <div className="grid grid-cols-2 p-1.5 bg-black/5 rounded-2xl mb-4 gap-1.5">
          <button
            type="button"
            onClick={() => handleTypeChange("Debit")}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              !isCredit
                ? "bg-white text-red-600 shadow-sm"
                : "text-black/50 hover:text-black"
            }`}
          >
            <ArrowDownRight className="w-4 h-4" />
            <span>Expense (Spent)</span>
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange("Credit")}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              isCredit
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                : "text-black/50 hover:text-black"
            }`}
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Received (Income)</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Amount Input */}
          <div>
            <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">
              Amount (₹) *
            </label>
            <div className="relative">
              <span
                className={`absolute left-3.5 top-1/2 -translate-y-1/2 text-lg font-extrabold ${
                  isCredit ? "text-emerald-600" : "text-black/50"
                }`}
              >
                ₹
              </span>
              <input
                type="number"
                step="any"
                placeholder={isCredit ? "10000" : "450"}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                autoFocus
                className={`w-full pl-8 pr-4 py-2.5 sm:py-3 bg-white rounded-2xl border focus:outline-hidden text-lg sm:text-xl font-extrabold text-[#1A1A1A] transition-colors ${
                  isCredit
                    ? "border-emerald-200 focus:border-emerald-600"
                    : "border-black/10 focus:border-black"
                }`}
              />
            </div>
          </div>

          {/* Payee / Sender Input */}
          <div>
            <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">
              {isCredit ? "Sender / Received From *" : "Merchant / Paid To *"}
            </label>
            <input
              type="text"
              placeholder={
                isCredit
                  ? "e.g. STACKDOT, Aayushi, Client, HDFC Bank"
                  : "e.g. Swiggy, Uber, Chai Point, Grocery"
              }
              value={payee}
              onChange={(e) => setPayee(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-white rounded-2xl border border-black/10 focus:border-black focus:outline-hidden text-xs sm:text-sm font-medium text-[#1A1A1A]"
            />
          </div>

          {/* Category & Date Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 bg-white rounded-2xl border border-black/10 focus:border-black focus:outline-hidden text-xs font-medium text-[#1A1A1A]"
              >
                {(isCredit ? CREDIT_CATEGORIES : DEBIT_CATEGORIES).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-3 py-2 bg-white rounded-2xl border border-black/10 focus:border-black focus:outline-hidden text-xs font-medium text-[#1A1A1A]"
              />
            </div>
          </div>

          {/* App / Method & Reference No */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">
                Payment Channel
              </label>
              <select
                value={sourceApp}
                onChange={(e) => setSourceApp(e.target.value as any)}
                className="w-full px-3 py-2.5 bg-white rounded-2xl border border-black/10 focus:border-black focus:outline-hidden text-xs font-medium text-[#1A1A1A]"
              >
                <option value="GPay">Google Pay (GPay)</option>
                <option value="PhonePe">PhonePe</option>
                <option value="Paytm">Paytm</option>
                <option value="Cred">Cred UPI</option>
                <option value="BHIM">BHIM / Bank UPI</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">
                UPI Ref / UTR (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. 663425297257 or XXXX"
                value={referenceNo}
                onChange={(e) => setReferenceNo(e.target.value)}
                className="w-full px-3 py-2.5 bg-white rounded-2xl border border-black/10 focus:border-black focus:outline-hidden text-xs font-medium text-[#1A1A1A]"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">
              Note (Optional)
            </label>
            <input
              type="text"
              placeholder={
                isCredit
                  ? "e.g. Monthly salary, project milestone payment"
                  : "e.g. Lunch with team, monthly groceries"
              }
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2 bg-white rounded-2xl border border-black/10 focus:border-black focus:outline-hidden text-xs font-medium text-[#1A1A1A]"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-white hover:bg-black/5 text-[#1A1A1A] font-semibold text-xs py-3 rounded-2xl border border-black/10 cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`flex-1 font-bold text-xs py-3 rounded-2xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all ${
                isCredit
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/25"
                  : "bg-[#1A1A1A] hover:bg-black text-white"
              }`}
            >
              {isCredit ? (
                <>
                  <ArrowUpRight className="w-4 h-4 text-emerald-200" />
                  Save Received Amount
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5 text-[#F5D547]" />
                  Save Expense
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

