"use client";

import React, { useState, useEffect } from "react";
import { X, Plus, ArrowUpRight, ArrowDownRight, Calendar, Tag, CreditCard, FileText, Sparkles, Check } from "lucide-react";
import { TransactionItem } from "@/types/dashboard";
import { CategoryRuleItem, findCategoryForPayee } from "@/lib/rules";

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
  const [customCategoryInput, setCustomCategoryInput] = useState("");
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [sourceApp, setSourceApp] = useState<"GPay" | "PhonePe" | "Paytm" | "Cred" | "BHIM">("GPay");
  const [referenceNo, setReferenceNo] = useState("");
  const [notes, setNotes] = useState("");

  // Category rules and auto-matching state
  const [rules, setRules] = useState<CategoryRuleItem[]>([]);
  const [matchedRule, setMatchedRule] = useState<{ category: string; matchedPayee: string } | null>(null);
  const [createRoutingRule, setCreateRoutingRule] = useState(false);

  // Fetch rules when modal opens
  useEffect(() => {
    if (isOpen) {
      setTxType(initialType);
      setCategory(initialType === "Credit" ? "Income" : "Food");
      setDate(new Date().toISOString().slice(0, 10));
      setIsCustomCategory(false);
      setCustomCategoryInput("");
      setMatchedRule(null);
      setCreateRoutingRule(false);

      fetch("/api/rules")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.rules) setRules(data.rules);
        })
        .catch((e) => console.error("Could not fetch rules:", e));
    }
  }, [isOpen, initialType]);

  // Live match payee against rules
  const handlePayeeChange = (val: string) => {
    setPayee(val);
    if (!val.trim() || rules.length === 0) {
      setMatchedRule(null);
      return;
    }

    const match = findCategoryForPayee(val, rules);
    if (match) {
      setCategory(match.category);
      setIsCustomCategory(false);
      setMatchedRule({
        category: match.category,
        matchedPayee: val,
      });
    } else {
      setMatchedRule(null);
    }
  };

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

  const allAvailableCategories = Array.from(
    new Set([
      ...(isCredit ? CREDIT_CATEGORIES : DEBIT_CATEGORIES),
      ...rules.map((r) => r.category),
    ])
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (!payee.trim() || isNaN(num) || num <= 0) {
      alert("Please provide a valid recipient/sender name and positive amount.");
      return;
    }

    const finalCategory = isCustomCategory
      ? customCategoryInput.trim() || "Other"
      : category;

    // If user asked to create a persistent rule for this person:
    if (createRoutingRule && payee.trim() && finalCategory) {
      fetch("/api/rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_payee",
          category: finalCategory,
          payee: payee.trim(),
          applyToPast: true,
        }),
      }).catch((err) => console.error("Error creating routing rule:", err));
    }

    const now = new Date();
    const timeFormatted = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const newTx: TransactionItem = {
      id: `tx-${Date.now().toString().slice(-6)}`,
      merchant: payee.trim(),
      title: notes.trim() || (isCredit ? `Received via ${sourceApp}` : `${finalCategory} payment`),
      category: finalCategory,
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
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-[#1A1A1A]">
                {isCredit ? "Sender / Received From *" : "Merchant / Paid To *"}
              </label>
              {matchedRule && (
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  Auto-routed to {matchedRule.category}
                </span>
              )}
            </div>
            <input
              type="text"
              placeholder={
                isCredit
                  ? "e.g. STACKDOT, Aayushi, Client, HDFC Bank"
                  : "e.g. Dhaval Patel, Swiggy, Uber, Chai Point"
              }
              value={payee}
              onChange={(e) => handlePayeeChange(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-white rounded-2xl border border-black/10 focus:border-black focus:outline-hidden text-xs sm:text-sm font-medium text-[#1A1A1A]"
            />
          </div>

          {/* Category & Date Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-[#1A1A1A]">
                  Category
                </label>
                <button
                  type="button"
                  onClick={() => setIsCustomCategory(!isCustomCategory)}
                  className="text-[10px] font-bold text-black/60 hover:text-black underline cursor-pointer"
                >
                  {isCustomCategory ? "Select from list" : "+ Custom category"}
                </button>
              </div>

              {isCustomCategory ? (
                <input
                  type="text"
                  placeholder="Enter custom category name..."
                  value={customCategoryInput}
                  onChange={(e) => setCustomCategoryInput(e.target.value)}
                  className="w-full px-3 py-2 bg-white rounded-2xl border border-black/10 focus:border-black focus:outline-hidden text-xs font-medium text-[#1A1A1A]"
                  autoFocus
                />
              ) : (
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white rounded-2xl border border-black/10 focus:border-black focus:outline-hidden text-xs font-medium text-[#1A1A1A]"
                >
                  {allAvailableCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              )}
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

          {/* Always Route Rule Checkbox */}
          {payee.trim().length > 1 && !matchedRule && (
            <label className="flex items-center gap-2 p-2 rounded-xl bg-amber-50/80 border border-amber-200/80 cursor-pointer select-none text-xs">
              <input
                type="checkbox"
                checked={createRoutingRule}
                onChange={(e) => setCreateRoutingRule(e.target.checked)}
                className="rounded text-black accent-[#1A1A1A] cursor-pointer"
              />
              <span className="font-semibold text-amber-950">
                ⚡ Always route payments to &ldquo;{payee}&rdquo; into &ldquo;{isCustomCategory ? customCategoryInput || "this category" : category}&rdquo;
              </span>
            </label>
          )}

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

