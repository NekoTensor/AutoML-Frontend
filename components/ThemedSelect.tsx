"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

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
//
// Two things this version adds over a naive custom dropdown:
//   1. Smart positioning — measures available space below the button
//      when it opens, and flips the list upward if there isn't enough
//      room, instead of always opening downward and running off-screen.
//   2. `select-none` on the option buttons — without it, a normal click
//      can register as a text-selection drag, which paints the browser's
//      native (untheme-able) selection highlight color over the option
//      text. This blocks that entirely.

export default function ThemedSelect({ value, onChange, options, placeholder = "Select...", disabled }: ThemedSelectProps) {
  const [open, setOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const MAX_LIST_HEIGHT = 240; // matches max-h-60

  useLayoutEffect(() => {
    if (!open || !buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    // Only flip up if there's genuinely not enough room below AND more room above
    setOpenUpward(spaceBelow < MAX_LIST_HEIGHT && spaceAbove > spaceBelow);
  }, [open]);

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
        ref={buttonRef}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:border-accent2/50 transition-colors select-none"
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
        <div
          className={`absolute z-30 w-full overflow-y-auto rounded-xl glass-strong neon-border p-1.5 select-none ${
            openUpward ? "bottom-full mb-2" : "top-full mt-2"
          }`}
          style={{ maxHeight: MAX_LIST_HEIGHT }}
        >
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
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors select-none ${
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
