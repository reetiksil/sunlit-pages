"use client";

import React, { useState, useRef, useEffect } from "react";
import { Bookmark, ChevronDown, Check } from "lucide-react";
import { ShelfCategory } from "@/types";

interface BookshelfSelectorProps {
  value: ShelfCategory | null;
  onChange: (category: ShelfCategory | null) => void;
}

const OPTIONS: { value: ShelfCategory | "none"; label: string }[] = [
  { value: "none", label: "Remove from Shelf" },
  { value: "reading", label: "Currently Reading" },
  { value: "plan-to-read", label: "Plan to Read" },
  { value: "completed", label: "Completed Story" },
];

export function BookshelfSelector({ value, onChange }: BookshelfSelectorProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentLabel = value
    ? OPTIONS.find((o) => o.value === value)?.label
    : "Add to Bookshelf";

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="inline-flex h-11 items-center gap-2.5 rounded-full border border-border bg-surface px-5 text-xs font-semibold tracking-wide text-text shadow-sm transition-all hover:border-primary hover:bg-surface-soft"
      >
        <Bookmark className={`h-4 w-4 ${value ? "fill-primary text-primary" : "text-text-muted"}`} />
        <span>{currentLabel}</span>
        <ChevronDown className={`h-3.5 w-3.5 text-text-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute right-0 top-13 z-50 w-52 overflow-hidden rounded-2xl border border-border bg-surface p-1.5 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150"
        >
          {OPTIONS.map((opt) => {
            const isSelected = opt.value === "none" ? value === null : value === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(opt.value === "none" ? null : opt.value);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-xs font-medium transition-colors ${
                  isSelected
                    ? "bg-primary text-primary-fg font-semibold"
                    : "text-text hover:bg-surface-soft"
                }`}
              >
                <span>{opt.label}</span>
                {isSelected && <Check className="h-3.5 w-3.5" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}