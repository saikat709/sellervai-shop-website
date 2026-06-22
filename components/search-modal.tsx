"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

/**
 * Site-wide product search. The trigger button toggles the modal; submitting
 * (Enter or click) navigates to `/search?q=…` and closes the modal.
 */
export function SearchModal({
  open,
  onClose,
  primary,
}: {
  open: boolean;
  onClose: () => void;
  primary: string;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");

  // Auto-focus the input when the modal opens; lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => inputRef.current?.focus(), 30);
    return () => {
      document.body.style.overflow = prevOverflow;
      clearTimeout(t);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Reset the field whenever the modal closes so reopening starts fresh.
  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  if (!open) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    onClose();
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-20 sm:pt-32"
      role="dialog"
      aria-modal="true"
      aria-label="Search products"
    >
      <button
        type="button"
        aria-label="Close search"
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />
      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl animate-fade-in"
      >
        <label className="flex items-center gap-3 border-b border-zinc-200 px-4">
          <Search className="h-5 w-5 shrink-0 text-zinc-400" aria-hidden />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products by name…"
            className="h-14 w-full bg-transparent text-base text-zinc-900 outline-none placeholder:text-zinc-400"
            aria-label="Search products"
          />
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700"
            aria-label="Close"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </label>
        <div className="flex items-center justify-between bg-zinc-50 px-4 py-3 text-xs text-zinc-500">
          <span>Press Enter to search</span>
          <button
            type="submit"
            disabled={!query.trim()}
            className="inline-flex h-8 items-center justify-center rounded-full px-4 text-xs font-semibold text-white shadow-sm transition hover:brightness-90 disabled:cursor-not-allowed disabled:opacity-50"
            style={{ backgroundColor: primary }}
          >
            Search
          </button>
        </div>
      </form>
    </div>
  );
}
