"use client";

import { useEffect, useRef, useState } from "react";

interface ThemedSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  disabled?: boolean;
}

// Native <select> dropdown option lists are rendered by the OS/browser
// and can't be restyled with CSS in any reliable cross-browser way —
// that's the plain white/blue box you get regardless of what you do to
// the <select> element itself. This component replaces it entirely with
// a button + absolutely-positioned list built from plain divs, so every
// pixel of it (including the open list) can carry the site's theme.

export default function ThemedSelect({ value, onChange, options, placeholder = "Select...", disabled }: ThemedSelectProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:border-accent2/50 transition-colors"
      >
        <span className={value ? "text-white" : "text-white/40"}>{value || placeholder}</span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          className={`text-accent2 transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="M2 4.5L7 9.5L12 4.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && !disabled && (
        <div className="absolute z-30 mt-2 w-full max-h-60 overflow-y-auto rounded-xl glass-strong neon-border p-1.5">
          {options.length === 0 && (
            <div className="px-3 py-2 text-sm text-white/40">No options</div>
          )}
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                opt === value
                  ? "bg-gradient-to-r from-accent2/25 to-accent/25 text-white"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
