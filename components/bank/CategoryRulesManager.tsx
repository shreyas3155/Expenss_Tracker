"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Sparkles,
  Plus,
  Trash2,
  Edit2,
  Check,
  Search,
  Users,
  Tag,
  ArrowRight,
  RefreshCw,
  FolderPlus,
  CheckCircle2,
  Layers,
  HelpCircle,
} from "lucide-react";
import { CategoryRuleItem } from "@/lib/rules";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { TagInput } from "@/components/ui/tag-input";
import { renderCategoryIcon } from "@/lib/categoryUtils";

interface CategoryRulesManagerProps {
  onRulesUpdated?: () => void;
}

const PRESET_COLORS = [
  "#F59E0B", // Amber / Food
  "#8B5CF6", // Purple / Shopping
  "#0EA5E9", // Sky / Transport
  "#10B981", // Emerald / Health
  "#EC4899", // Pink / Entertainment
  "#F97316", // Orange / Utilities
  "#06B6D4", // Cyan / Coffee
  "#6366F1", // Indigo / Work
  "#14B8A6", // Teal / Investments
  "#EAB308", // Golden / Income
  "#64748B", // Slate / Other
];

const PRESET_ICONS = [
  "Tag",
  "Utensils",
  "Coffee",
  "ShoppingBag",
  "Car",
  "Zap",
  "HeartPulse",
  "Film",
  "Receipt",
  "BookOpen",
  "TrendingUp",
];

export const CategoryRulesManager: React.FC<CategoryRulesManagerProps> = ({
  onRulesUpdated,
}) => {
  const [rules, setRules] = useState<CategoryRuleItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modal State for Create / Edit
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);

  // Form State
  const [categoryName, setCategoryName] = useState<string>("");
  const [payeesList, setPayeesList] = useState<string[]>([]);
  const [selectedColor, setSelectedColor] = useState<string>(PRESET_COLORS[0]);
  const [selectedIcon, setSelectedIcon] = useState<string>("Tag");
  const [applyToPast, setApplyToPast] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Inline Quick Add Payee State per Rule
  const [inlineInputs, setInlineInputs] = useState<Record<string, string>>({});
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Live Match Simulator
  const [testPayeeInput, setTestPayeeInput] = useState<string>("Dhaval Patel");

  // Fetch all rules
  const fetchRules = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/rules");
      if (res.ok) {
        const data = await res.json();
        setRules(data.rules || []);
      }
    } catch (e) {
      console.error("Failed to load category rules:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const openCreateModal = () => {
    setModalMode("create");
    setEditingRuleId(null);
    setCategoryName("");
    setPayeesList([]);
    setSelectedColor(PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)]);
    setSelectedIcon("Tag");
    setApplyToPast(true);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (rule: CategoryRuleItem) => {
    setModalMode("edit");
    setEditingRuleId(rule.id);
    setCategoryName(rule.category);
    setPayeesList([...rule.payees]);
    setSelectedColor(rule.color || PRESET_COLORS[0]);
    setSelectedIcon(rule.icon || "Tag");
    setApplyToPast(false);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      setFormError("Category name cannot be empty");
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      const res = await fetch("/api/rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: categoryName.trim(),
          payees: payeesList,
          color: selectedColor,
          icon: selectedIcon,
          applyToPast,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save category rule");
      }

      setIsModalOpen(false);
      setStatusMessage(
        data.updatedPastTransactionsCount > 0
          ? `Saved "${categoryName}" & updated ${data.updatedPastTransactionsCount} past transactions!`
          : `Saved category rule "${categoryName}"!`
      );
      setTimeout(() => setStatusMessage(null), 4000);

      await fetchRules();
      onRulesUpdated?.();
    } catch (err: any) {
      setFormError(err.message || "Failed to save rule");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete an entire category rule
  const handleDeleteRule = async (category: string) => {
    if (!confirm(`Are you sure you want to delete the rule for "${category}"?`)) return;

    try {
      const res = await fetch(`/api/rules?category=${encodeURIComponent(category)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setRules((prev) => prev.filter((r) => r.category !== category));
        setStatusMessage(`Deleted rule for "${category}"`);
        setTimeout(() => setStatusMessage(null), 3000);
        onRulesUpdated?.();
      }
    } catch (e) {
      console.error("Failed to delete rule:", e);
    }
  };

  // Remove a single guy / payee from a category
  const handleRemovePayee = async (category: string, payeeToRemove: string) => {
    try {
      const res = await fetch(
        `/api/rules?category=${encodeURIComponent(category)}&payee=${encodeURIComponent(
          payeeToRemove
        )}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        setRules((prev) =>
          prev.map((r) =>
            r.category === category
              ? { ...r, payees: r.payees.filter((p) => p !== payeeToRemove) }
              : r
          )
        );
        onRulesUpdated?.();
      }
    } catch (e) {
      console.error("Failed to remove payee:", e);
    }
  };

  // Quick inline add guy to an existing category card
  const handleInlineAddPayee = async (category: string) => {
    const val = inlineInputs[category]?.trim();
    if (!val) return;

    try {
      const res = await fetch("/api/rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_payee",
          category,
          payee: val,
          applyToPast: true,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setInlineInputs((prev) => ({ ...prev, [category]: "" }));
        setStatusMessage(
          `Added "${val}" to ${category}${
            data.updatedPastTransactionsCount > 0
              ? ` (${data.updatedPastTransactionsCount} transactions updated)`
              : ""
          }`
        );
        setTimeout(() => setStatusMessage(null), 3500);
        await fetchRules();
        onRulesUpdated?.();
      }
    } catch (e) {
      console.error("Failed to add payee:", e);
    }
  };

  // Manually trigger retroactive application
  const handleApplyRetroactive = async (rule: CategoryRuleItem) => {
    if (rule.payees.length === 0) {
      alert("Please add at least one person / payee to this category first.");
      return;
    }

    try {
      const res = await fetch("/api/rules/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: rule.category,
          payees: rule.payees,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMessage(
          `Updated ${data.updatedCount} past transaction${
            data.updatedCount === 1 ? "" : "s"
          } to "${rule.category}"!`
        );
        setTimeout(() => setStatusMessage(null), 4000);
        onRulesUpdated?.();
      }
    } catch (e) {
      console.error("Failed to apply retroactive rules:", e);
    }
  };

  // Filter rules by search
  const filteredRules = useMemo(() => {
    if (!searchQuery.trim()) return rules;
    const q = searchQuery.toLowerCase();
    return rules.filter(
      (r) =>
        r.category.toLowerCase().includes(q) ||
        r.payees.some((p) => p.toLowerCase().includes(q))
    );
  }, [rules, searchQuery]);

  // Live match simulator result
  const simulatedMatch = useMemo(() => {
    if (!testPayeeInput.trim()) return null;
    const target = testPayeeInput.trim().toLowerCase();
    for (const rule of rules) {
      for (const p of rule.payees) {
        const candidate = p.trim().toLowerCase();
        if (candidate && (target.includes(candidate) || candidate.includes(target))) {
          return { rule, matchedPayee: p };
        }
      }
    }
    return null;
  }, [testPayeeInput, rules]);

  return (
    <div className="space-y-6">
      {/* Top Banner / Introduction Card */}
      <div className="bg-white/80 backdrop-blur-md rounded-[28px] p-5 sm:p-7 border border-black/5 shadow-xs relative overflow-hidden">
        <div className="pointer-events-none absolute -top-12 -right-12 w-48 h-48 rounded-full bg-[#F5D547]/25 blur-3xl" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 bg-[#1A1A1A] text-white px-3 py-1 rounded-full text-xs font-bold tracking-tight">
              <Sparkles className="w-3.5 h-3.5 text-[#F5D547]" />
              <span>Smart Payee Routing Engine</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#1A1A1A] tracking-tight">
              Dedicated Categories & People Rules
            </h2>
            <p className="text-xs sm:text-sm text-black/60 leading-relaxed">
              Whenever you pay someone (like <span className="font-bold text-[#1A1A1A]">Dhaval Patel</span>), 
              automatically route the transaction to a dedicated category instead of &ldquo;Other&rdquo;. 
              Add as many people as you want to any category!
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Button
              variant="gold"
              onClick={openCreateModal}
              leftIcon={<FolderPlus className="w-4 h-4 stroke-[2.5]" />}
            >
              + Create Category & Add Guys
            </Button>
          </div>
        </div>

        {/* Status notification toast */}
        {statusMessage && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Live Payee Route Simulator Bar */}
        <div className="mt-6 pt-5 border-t border-black/5 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-black/70 shrink-0">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Test Routing:</span>
          </div>
          <div className="relative flex-1">
            <input
              type="text"
              value={testPayeeInput}
              onChange={(e) => setTestPayeeInput(e.target.value)}
              placeholder="Type recipient name to test (e.g. Dhaval Patel or Swiggy)..."
              className="w-full bg-[#F6F3EB] border border-black/10 focus:border-black rounded-full px-4 py-2 text-xs sm:text-sm font-semibold text-[#1A1A1A] outline-none"
            />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <ArrowRight className="w-4 h-4 text-black/40 hidden sm:block" />
            {simulatedMatch ? (
              <div
                className="px-3 py-1.5 rounded-full text-xs font-extrabold flex items-center gap-1.5 shadow-2xs text-white"
                style={{ backgroundColor: simulatedMatch.rule.color || "#8B5CF6" }}
              >
                <span>Routes to: {simulatedMatch.rule.category}</span>
                <span className="text-[10px] opacity-80">
                  (Matched &ldquo;{simulatedMatch.matchedPayee}&rdquo;)
                </span>
              </div>
            ) : (
              <span className="text-xs font-semibold text-black/40 italic px-2 py-1">
                No rule matched (defaults to &ldquo;Other&rdquo;)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Search & Stats Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-black text-[#1A1A1A]">
            Active Rules ({rules.length})
          </span>
          <span className="text-xs text-black/40">
            • {rules.reduce((acc, r) => acc + r.payees.length, 0)} people mapped
          </span>
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-black/40 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search categories or people..."
            className="w-full bg-white border border-black/10 focus:border-black rounded-full pl-9 pr-4 py-1.5 text-xs font-semibold text-[#1A1A1A] outline-none shadow-2xs"
          />
        </div>
      </div>

      {/* Rules Grid */}
      {isLoading ? (
        <div className="bg-white/50 rounded-3xl p-12 text-center text-xs font-semibold text-black/40 animate-pulse">
          Loading category rules...
        </div>
      ) : filteredRules.length === 0 ? (
        <div className="bg-white/80 rounded-[32px] p-8 sm:p-12 text-center border border-black/5 shadow-xs space-y-4">
          <div className="w-14 h-14 rounded-full bg-[#F5D547]/30 text-[#1A1A1A] flex items-center justify-center mx-auto">
            <Users className="w-7 h-7" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-base sm:text-lg font-black text-[#1A1A1A]">
              {searchQuery ? "No matching rules found" : "No Category Rules Yet"}
            </h3>
            <p className="text-xs text-black/60">
              {searchQuery
                ? "Try searching with a different category or payee name."
                : "Create your first category (e.g. 'Contractors' or 'Friends') and add people like Dhaval Patel so expenses never get lost in 'Other'."}
            </p>
          </div>
          <Button variant="gold" onClick={openCreateModal} size="md">
            + Create Your First Category Rule
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRules.map((rule) => {
            const ruleColor = rule.color || "#8B5CF6";
            return (
              <div
                key={rule.id}
                className="bg-white rounded-[26px] p-5 border border-black/5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group relative overflow-hidden"
              >
                {/* Top color indicator accent line */}
                <div
                  className="absolute top-0 left-0 right-0 h-1.5"
                  style={{ backgroundColor: ruleColor }}
                />

                <div className="space-y-3 pt-1">
                  {/* Category Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-9 h-9 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-xs"
                        style={{ backgroundColor: ruleColor }}
                      >
                        {renderCategoryIcon(rule.icon || "Tag", "w-4 h-4")}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-sm sm:text-base text-[#1A1A1A] leading-tight">
                          {rule.category}
                        </h3>
                        <p className="text-[11px] font-semibold text-black/40">
                          {rule.payees.length} {rule.payees.length === 1 ? "person" : "people"} mapped
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEditModal(rule)}
                        className="p-1.5 rounded-full hover:bg-black/5 text-black/50 hover:text-black cursor-pointer transition-colors"
                        title="Edit category"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteRule(rule.category)}
                        className="p-1.5 rounded-full hover:bg-red-50 text-black/40 hover:text-red-600 cursor-pointer transition-colors"
                        title="Delete rule"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* List of People / Payees */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-extrabold text-black/40 uppercase tracking-wider block">
                      Assigned Payees
                    </span>

                    {rule.payees.length === 0 ? (
                      <p className="text-xs text-black/40 italic py-1">
                        No people added yet. Add guys below!
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                        {rule.payees.map((payee) => (
                          <span
                            key={payee}
                            className="inline-flex items-center gap-1.5 bg-[#F6F3EB] hover:bg-[#eae6db] text-[#1A1A1A] border border-black/10 px-2.5 py-1 rounded-full text-xs font-bold transition-colors group/chip"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span>{payee}</span>
                            <button
                              onClick={() => handleRemovePayee(rule.category, payee)}
                              className="text-black/40 hover:text-red-600 ml-0.5 cursor-pointer"
                              title={`Remove ${payee}`}
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Card Controls: Inline quick add guy + Apply to past */}
                <div className="mt-4 pt-3 border-t border-black/5 space-y-2">
                  {/* Inline quick add input */}
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={inlineInputs[rule.category] || ""}
                      onChange={(e) =>
                        setInlineInputs((prev) => ({
                          ...prev,
                          [rule.category]: e.target.value,
                        }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleInlineAddPayee(rule.category);
                        }
                      }}
                      placeholder="+ Add another person..."
                      className="flex-1 bg-[#F6F3EB] border border-black/10 focus:border-black rounded-full px-3 py-1.5 text-xs font-semibold text-[#1A1A1A] outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleInlineAddPayee(rule.category)}
                      disabled={!inlineInputs[rule.category]?.trim()}
                      className="bg-[#1A1A1A] disabled:opacity-30 text-white p-1.5 rounded-full hover:bg-black cursor-pointer disabled:cursor-not-allowed transition-all"
                      title="Add person"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Apply to past transactions button */}
                  {rule.payees.length > 0 && (
                    <button
                      type="button"
                      onClick={() => handleApplyRetroactive(rule)}
                      className="w-full text-[11px] font-bold text-black/60 hover:text-black hover:bg-black/5 py-1 px-2 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3 text-black/40" />
                      <span>Sync all past transactions for this group</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT CATEGORY RULE MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        maxWidth="lg"
        title={
          modalMode === "create" ? (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#F5D547] text-[#1A1A1A] flex items-center justify-center">
                <FolderPlus className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span>Create Dedicated Category & Add Guys</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#1A1A1A] text-[#F5D547] flex items-center justify-center">
                <Edit2 className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
              <span>Edit Category Rule</span>
            </div>
          )
        }
        subtitle="Route payments automatically whenever you pay people in this list"
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="gold"
              size="sm"
              onClick={handleSaveRule}
              isLoading={isSubmitting}
            >
              {modalMode === "create" ? "Save Category & Rule" : "Update Rule"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveRule} className="space-y-4 pt-1">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl">
              {formError}
            </div>
          )}

          {/* Category Name */}
          <Input
            label="Category Name"
            placeholder="e.g. Freelancers, Contractors, Friends, Tea & Snacks"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            required
            autoFocus
          />

          {/* People / Payees Tag Input */}
          <TagInput
            label="People / Payees Assigned To This Category"
            tags={payeesList}
            onChange={setPayeesList}
            placeholder="Type name (e.g. Dhaval Patel) and press Enter..."
            helperText="Type any name (e.g. 'Dhaval Patel') and press Enter or comma. You can add as many people as you want!"
          />

          {/* Color Palette Picker */}
          <div>
            <label className="text-[11px] font-bold text-black/70 uppercase tracking-wider block mb-1.5">
              Category Color
            </label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform cursor-pointer flex items-center justify-center ${
                    selectedColor === c ? "scale-125 ring-2 ring-black shadow-xs" : "hover:scale-110"
                  }`}
                  style={{ backgroundColor: c }}
                >
                  {selectedColor === c && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                </button>
              ))}
            </div>
          </div>

          {/* Icon Picker */}
          <div>
            <label className="text-[11px] font-bold text-black/70 uppercase tracking-wider block mb-1.5">
              Category Icon
            </label>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_ICONS.map((iconName) => (
                <button
                  key={iconName}
                  type="button"
                  onClick={() => setSelectedIcon(iconName)}
                  className={`p-2 rounded-xl border transition-all cursor-pointer ${
                    selectedIcon === iconName
                      ? "bg-[#1A1A1A] text-white border-black shadow-xs"
                      : "bg-white text-black/70 border-black/10 hover:border-black/30"
                  }`}
                  title={iconName}
                >
                  {renderCategoryIcon(iconName, "w-4 h-4")}
                </button>
              ))}
            </div>
          </div>

          {/* Retroactive Checkbox */}
          <label className="flex items-start gap-2.5 p-3 rounded-2xl bg-white border border-black/10 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={applyToPast}
              onChange={(e) => setApplyToPast(e.target.checked)}
              className="mt-0.5 rounded text-black accent-[#1A1A1A] cursor-pointer"
            />
            <div className="text-xs">
              <span className="font-bold text-[#1A1A1A] block">
                Update all existing transactions
              </span>
              <span className="text-black/50 text-[11px]">
                Immediately change past expenses matching these people to &ldquo;{categoryName || "this category"}&rdquo;.
              </span>
            </div>
          </label>
        </form>
      </Modal>
    </div>
  );
};
