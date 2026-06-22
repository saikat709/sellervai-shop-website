"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Filter, Search, SlidersHorizontal, X } from "lucide-react";
import type { PublicProduct } from "@/lib/api";
import { unitPriceOf } from "@/lib/format";
import { ProductCard } from "@/components/storefront";

type SortKey = "newest" | "price-asc" | "price-desc" | "name-asc";

const SORT_LABELS: Record<SortKey, string> = {
  newest: "Newest",
  "price-asc": "Price: Low → High",
  "price-desc": "Price: High → Low",
  "name-asc": "Name: A → Z",
};

/**
 * Client island for the products grid. The server page hands us the
 * pre-fetched product list; we drive search + filters + sort locally.
 */
export function ProductGrid({
  products,
  primary,
}: {
  products: PublicProduct[];
  primary: string;
}) {
  const [query, setQuery] = useState("");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [onSale, setOnSale] = useState(false);
  const [inStock, setInStock] = useState(false);
  const [sort, setSort] = useState<SortKey>("newest");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const min = minPrice === "" ? -Infinity : Number(minPrice);
    const max = maxPrice === "" ? Infinity : Number(maxPrice);

    const matched = products.filter((p) => {
      if (q && !p.name.toLowerCase().includes(q)) return false;
      const up = unitPriceOf(p);
      if (Number.isFinite(min) && up < min) return false;
      if (Number.isFinite(max) && up > max) return false;
      if (onSale && !p.discount) return false;
      if (inStock && p.available_count <= 0) return false;
      return true;
    });

    const sorted = [...matched];
    switch (sort) {
      case "price-asc":
        sorted.sort((a, b) => unitPriceOf(a) - unitPriceOf(b));
        break;
      case "price-desc":
        sorted.sort((a, b) => unitPriceOf(b) - unitPriceOf(a));
        break;
      case "name-asc":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "newest":
      default:
        // Server already orders by created_at desc; no-op.
        break;
    }
    return sorted;
  }, [products, query, minPrice, maxPrice, onSale, inStock, sort]);

  const activeFilterCount =
    (onSale ? 1 : 0) +
    (inStock ? 1 : 0) +
    (minPrice !== "" ? 1 : 0) +
    (maxPrice !== "" ? 1 : 0);

  function clearAll() {
    setQuery("");
    setMinPrice("");
    setMaxPrice("");
    setOnSale(false);
    setInStock(false);
    setSort("newest");
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
            style={{ ["--tw-ring-color" as string]: `${primary}66` }}
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
          sort={sort}
          setSort={setSort}
          onSale={onSale}
          setOnSale={setOnSale}
          inStock={inStock}
          setInStock={setInStock}
          minPrice={minPrice}
          maxPrice={maxPrice}
          setMinPrice={setMinPrice}
          setMaxPrice={setMaxPrice}
          onClear={clearAll}
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
  sort,
  setSort,
  onSale,
  setOnSale,
  inStock,
  setInStock,
  minPrice,
  maxPrice,
  setMinPrice,
  setMaxPrice,
  onClear,
  primary,
}: {
  onClose: () => void;
  sort: SortKey;
  setSort: (s: SortKey) => void;
  onSale: boolean;
  setOnSale: (v: boolean) => void;
  inStock: boolean;
  setInStock: (v: boolean) => void;
  minPrice: string;
  maxPrice: string;
  setMinPrice: (v: string) => void;
  setMaxPrice: (v: string) => void;
  onClear: () => void;
  primary: string;
}) {
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close on click outside.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

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
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm shadow-sm focus:outline-none focus:ring-2"
            style={{ ["--tw-ring-color" as string]: `${primary}66` }}
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
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="Min"
              className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm shadow-sm focus:outline-none focus:ring-2"
              aria-label="Minimum price"
            />
            <span className="text-zinc-400" aria-hidden>–</span>
            <input
              type="number"
              inputMode="numeric"
              min="0"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="Max"
              className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm shadow-sm focus:outline-none focus:ring-2"
              aria-label="Maximum price"
            />
          </div>
        </div>

        <ToggleField
          label="On sale only"
          description="Show discounted products"
          checked={onSale}
          onChange={setOnSale}
          primary={primary}
        />

        <ToggleField
          label="In stock only"
          description="Hide sold-out products"
          checked={inStock}
          onChange={setInStock}
          primary={primary}
        />
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

function ToggleField({
  label,
  description,
  checked,
  onChange,
  primary,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  primary: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-zinc-200 bg-white p-3 transition hover:border-zinc-300">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 rounded border-zinc-300"
        style={{ accentColor: primary }}
      />
      <span className="flex flex-col leading-tight">
        <span className="text-sm font-semibold text-zinc-900">{label}</span>
        <span className="mt-0.5 text-xs text-zinc-500">{description}</span>
      </span>
    </label>
  );
}