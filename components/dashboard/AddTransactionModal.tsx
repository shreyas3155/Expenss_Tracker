"use client";

import React, { useState } from "react";
import { X, Plus, Sparkles, Check } from "lucide-react";
import { TransactionItem } from "@/types/dashboard";

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTransaction: (transaction: TransactionItem) => void;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  onAddTransaction,
}) => {
  const [merchant, setMerchant] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [upiApp, setUpiApp] = useState<"GPay" | "PhonePe" | "Paytm" | "Cred" | "BHIM">("GPay");
  const [notes, setNotes] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (!merchant.trim() || isNaN(num) || num <= 0) {
      alert("Please provide a valid merchant and amount.");
      return;
    }

    const newTx: TransactionItem = {
      id: `tx-${Date.now().toString().slice(-4)}`,
      merchant: merchant.trim(),
      title: notes.trim() || `${category} payment`,
      category: category,
      amount: num,
      amountFormatted: `₹${num.toLocaleString("en-IN")}`,
      type: "debit",
      date: "Sep 26, 2024",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      timeSlot: "10:00 am",
      dayOfWeek: "Thu",
      dayNumber: 26,
      upiId: `${merchant.toLowerCase().replace(/\s+/g, "")}@upi`,
      upiApp: upiApp,
      status: "Success",
      avatarInitials: ["ME"],
      notes: notes.trim(),
    };

    onAddTransaction(newTx);
    setMerchant("");
    setAmount("");
    setNotes("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-[#F6F3EB] rounded-[30px] p-6 shadow-2xl border border-black/10 relative overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center text-black/60 hover:text-black transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="mb-5">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F5D547]" />
            <span className="text-xs font-bold uppercase tracking-wider text-black/40">
              Quick Record
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-[#1A1A1A]">
            Log UPI Transaction
          </h2>
          <p className="text-xs text-black/50">
            Instant sync with Google Sheets & monthly budget
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">
              Amount (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg font-bold text-black/50">
                ₹
              </span>
              <input
                type="number"
                placeholder="450"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full pl-8 pr-4 py-3 bg-white rounded-2xl border border-black/10 focus:border-black focus:outline-hidden text-lg font-bold text-[#1A1A1A]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">
              Merchant / Payee Name
            </label>
            <input
              type="text"
              placeholder="e.g. Swiggy, Uber, Chai Point"
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-white rounded-2xl border border-black/10 focus:border-black focus:outline-hidden text-sm sm:text-xs font-medium text-[#1A1A1A]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 bg-white rounded-2xl border border-black/10 focus:border-black focus:outline-hidden text-xs font-medium text-[#1A1A1A]"
              >
                <option value="Food">Food & Dining</option>
                <option value="Transport">Transport & Fuel</option>
                <option value="Shopping">Shopping & Tech</option>
                <option value="Utilities">Utilities & Bills</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Health">Health & Fitness</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">
                UPI App
              </label>
              <select
                value={upiApp}
                onChange={(e) => setUpiApp(e.target.value as any)}
                className="w-full px-3 py-2.5 bg-white rounded-2xl border border-black/10 focus:border-black focus:outline-hidden text-xs font-medium text-[#1A1A1A]"
              >
                <option value="GPay">Google Pay (GPay)</option>
                <option value="PhonePe">PhonePe</option>
                <option value="Paytm">Paytm</option>
                <option value="Cred">Cred UPI</option>
                <option value="BHIM">BHIM UPI</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">
              Note (optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Lunch with team, project supplies"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2.5 bg-white rounded-2xl border border-black/10 focus:border-black focus:outline-hidden text-xs font-medium text-[#1A1A1A]"
            />
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-white hover:bg-black/5 text-[#1A1A1A] font-semibold text-xs py-3 rounded-2xl border border-black/10 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-[#1A1A1A] hover:bg-black text-white font-semibold text-xs py-3 rounded-2xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all"
            >
              <Plus className="w-3.5 h-3.5 text-[#F5D547]" />
              Save Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
