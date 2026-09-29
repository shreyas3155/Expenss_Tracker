"use client";

import React, { useState, KeyboardEvent } from "react";
import { X, Plus, User } from "lucide-react";

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  label?: string;
  helperText?: string;
  maxTags?: number;
}

export const TagInput: React.FC<TagInputProps> = ({
  tags,
  onChange,
  placeholder = "Type name and press Enter...",
  label,
  helperText,
  maxTags,
}) => {
  const [inputValue, setInputValue] = useState("");

  const addTag = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    if (tags.some((t) => t.toLowerCase() === trimmed.toLowerCase())) {
      setInputValue("");
      return;
    }
    if (maxTags && tags.length >= maxTags) return;

    onChange([...tags, trimmed]);
    setInputValue("");
  };

  const removeTag = (indexToRemove: number) => {
    onChange(tags.filter((_, idx) => idx !== indexToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label className="text-[11px] font-bold text-black/70 uppercase tracking-wider block">
          {label}
        </label>
      )}

      <div className="min-h-[46px] w-full bg-white border border-black/10 focus-within:border-black rounded-2xl p-2 flex flex-wrap items-center gap-1.5 shadow-2xs transition-all">
        {/* Existing Tag Chips */}
        {tags.map((tag, idx) => (
          <span
            key={idx}
            className="inline-flex items-center gap-1.5 bg-[#1A1A1A] text-white px-2.5 py-1 rounded-full text-xs font-semibold animate-in zoom-in-95 duration-150 select-none group"
          >
            <User className="w-3 h-3 text-[#F5D547]" />
            <span>{tag}</span>
            <button
              type="button"
              onClick={() => removeTag(idx)}
              className="text-white/60 hover:text-white group-hover:opacity-100 transition-opacity ml-0.5 cursor-pointer"
              aria-label={`Remove ${tag}`}
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}

        {/* Input */}
        {(!maxTags || tags.length < maxTags) && (
          <div className="flex-1 min-w-[140px] flex items-center gap-1">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={() => {
                if (inputValue.trim()) {
                  addTag(inputValue);
                }
              }}
              placeholder={tags.length === 0 ? placeholder : "Add another name..."}
              className="w-full bg-transparent border-none text-xs sm:text-sm font-semibold text-[#1A1A1A] placeholder:text-black/35 outline-none px-1.5 py-1"
            />
            {inputValue.trim() && (
              <button
                type="button"
                onClick={() => addTag(inputValue)}
                className="bg-[#F5D547] text-[#1A1A1A] p-1 rounded-full hover:scale-105 active:scale-95 transition-all text-xs font-bold shrink-0 cursor-pointer"
                title="Add person"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {helperText && (
        <p className="text-[11px] text-black/50">{helperText}</p>
      )}
    </div>
  );
};
