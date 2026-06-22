"use client";

import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { Filter, Search, SlidersHorizontal, X } from "lucide-react";
import type { PublicProduct } from "@/lib/api";
import { unitPriceOf } from "@/lib/format";
import { ringColorStyle } from "@/lib/utils";
import { ProductCard } from "@/components/storefront";

type SortKey = "newest" | "price-asc" | "price-desc" | "name-asc";

const SORT_LABELS: Record<SortKey, string> = {
  newest: "Newest",
  "price-asc": "Price: Low → High",
  "price-desc": "Price: High → Low",
  "name-asc": "Name: A → Z",
};

type Filters = {
  sort: SortKey;
  onSale: boolean;
  inStock: boolean;
  minPrice: string;
  maxPrice: string;
};

const DEFAULT_FILTERS: Filters = {
  sort: "newest",
  onSale: false,
  inStock: false,
  minPrice: "",
  maxPrice: "",
};

export function ProductGrid({
  products,
  primary,
}: {
  products: PublicProduct[];
  primary: string;
}) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const { sort, onSale, inStock, minPrice, maxPrice } = filters;

  const filtered = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    const min = minPrice === "" ? -Infinity : Number(minPrice);
    const max = maxPrice === "" ? Infinity : Number(maxPrice);

    const matched: { p: PublicProduct; unitPrice: number }[] = [];
    for (const p of products) {
      if (q && !p.name.toLowerCase().includes(q)) continue;
      const up = unitPriceOf(p);
      if (Number.isFinite(min) && up < min) continue;
      if (Number.isFinite(max) && up > max) continue;
      if (onSale && !p.discount) continue;
      if (inStock && p.available_count <= 0) continue;
      matched.push({ p, unitPrice: up });
    }

    if (sort === "newest") return matched.map((m) => m.p);
    matched.sort((a, b) => {
      switch (sort) {
        case "price-asc":
          return a.unitPrice - b.unitPrice;
        case "price-desc":
          return b.unitPrice - a.unitPrice;
        case "name-asc":
          return a.p.name.localeCompare(b.p.name);
      }
    });
    return matched.map((m) => m.p);
  }, [products, deferredQuery, filters]);

  const activeFilterCount =
    (onSale ? 1 : 0) +
    (inStock ? 1 : 0) +
    (minPrice !== "" ? 1 : 0) +
    (maxPrice !== "" ? 1 : 0);

  function clearAll() {
    setQuery("");
    setFilters(DEFAULT_FILTERS);
  }

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
            aria-hidden
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products by name…"
            className="h-11 w-full rounded-lg border border-zinc-200 bg-white pl-9 pr-3 text-sm shadow-sm focus:border-transparent focus:outline-none focus:ring-2"
            style={ringColorStyle(primary)}
            aria-label="Search products"
          />
        </label>

        <FiltersButton
          open={filtersOpen}
          onToggle={() => setFiltersOpen((v) => !v)}
          activeCount={activeFilterCount}
          primary={primary}
        />
      </div>

      {filtersOpen ? (
        <FiltersPopover
          onClose={() => setFiltersOpen(false)}
          onClear={clearAll}
          value={filters}
          onChange={setFilters}
          primary={primary}
        />
      ) : null}

      <div className="mb-4 flex items-center justify-between text-sm text-zinc-500">
        <span>
          {filtered.length} item{filtered.length === 1 ? "" : "s"}
        </span>
        {(query || activeFilterCount > 0) ? (
          <button
            type="button"
            onClick={clearAll}
            className="inline-flex items-center gap-1 text-zinc-600 transition hover:text-zinc-900"
          >
            <X className="h-3.5 w-3.5" /> Clear all
          </button>
        ) : null}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-zinc-300 p-10 text-center text-zinc-500">
          No products found
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((product) => (
            <li key={product.id} className="h-full">
              <ProductCard product={product} primary={primary} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function FiltersButton({
  open,
  onToggle,
  activeCount,
  primary,
}: {
  open: boolean;
  onToggle: () => void;
  activeCount: number;
  primary: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      aria-label="Open filters"
      className={`relative inline-flex h-11 items-center gap-2 rounded-lg border px-4 text-sm font-semibold transition ${
        open
          ? "border-zinc-300 bg-zinc-50 text-zinc-900"
          : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
      }`}
    >
      <SlidersHorizontal className="h-4 w-4" aria-hidden />
      Filters
      {activeCount > 0 ? (
        <span
          className="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1.5 text-[10px] font-semibold text-white"
          style={{ backgroundColor: primary }}
        >
          {activeCount}
        </span>
      ) : null}
    </button>
  );
}

function FiltersPopover({
  onClose,
  onClear,
  value,
  onChange,
  primary,
}: {
  onClose: () => void;
  onClear: () => void;
  value: Filters;
  onChange: (next: Filters) => void;
  primary: string;
}) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onCloseRef.current();
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseRef.current();
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const checkboxStyle = { accentColor: primary } as const;
  const inputClass =
    "h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm shadow-sm focus:outline-none focus:ring-2";

  return (
    <div
      ref={popoverRef}
      role="dialog"
      aria-label="Filters"
      className="relative z-20 mb-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-lg"
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
          <Filter className="h-4 w-4" aria-hidden />
          Filters
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close filters"
          className="rounded p-1 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Sort by
          </label>
          <select
            value={value.sort}
            onChange={(e) => onChange({ ...value, sort: e.target.value as SortKey })}
            className={inputClass}
            style={ringColorStyle(primary)}
          >
            {(Object.keys(SORT_LABELS) as SortKey[]).map((k) => (
              <option key={k} value={k}>
                {SORT_LABELS[k]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Price range
          </span>
          <div className="flex items-center gap-2">
            <input
              type="number"
              inputMode="numeric"
              min="0"
              value={value.minPrice}
              onChange={(e) => onChange({ ...value, minPrice: e.target.value })}
              placeholder="Min"
              className={inputClass}
              aria-label="Minimum price"
            />
            <span className="text-zinc-400" aria-hidden>–</span>
            <input
              type="number"
              inputMode="numeric"
              min="0"
              value={value.maxPrice}
              onChange={(e) => onChange({ ...value, maxPrice: e.target.value })}
              placeholder="Max"
              className={inputClass}
              aria-label="Maximum price"
            />
          </div>
        </div>

        <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-zinc-200 bg-white p-3 transition hover:border-zinc-300">
          <input
            type="checkbox"
            checked={value.onSale}
            onChange={(e) => onChange({ ...value, onSale: e.target.checked })}
            className="mt-0.5 h-4 w-4 rounded border-zinc-300"
            style={checkboxStyle}
          />
          <span className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-zinc-900">On sale only</span>
            <span className="mt-0.5 text-xs text-zinc-500">Show discounted products</span>
          </span>
        </label>

        <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-zinc-200 bg-white p-3 transition hover:border-zinc-300">
          <input
            type="checkbox"
            checked={value.inStock}
            onChange={(e) => onChange({ ...value, inStock: e.target.checked })}
            className="mt-0.5 h-4 w-4 rounded border-zinc-300"
            style={checkboxStyle}
          />
          <span className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-zinc-900">In stock only</span>
            <span className="mt-0.5 text-xs text-zinc-500">Hide sold-out products</span>
          </span>
        </label>
      </div>

      <div className="mt-5 flex items-center justify-end gap-3 border-t border-zinc-100 pt-4">
        <button
          type="button"
          onClick={onClear}
          className="text-sm font-semibold text-zinc-600 transition hover:text-zinc-900"
        >
          Clear all
        </button>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-9 items-center justify-center rounded-full px-4 text-sm font-semibold text-white shadow-sm transition hover:brightness-90"
          style={{ backgroundColor: primary }}
        >
          Done
        </button>
      </div>
    </div>
  );
}