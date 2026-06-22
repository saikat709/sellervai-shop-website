"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import type { PublicProduct } from "@/lib/api";
import { ProductCard } from "@/components/storefront";

/**
 * Search results page client island. Renders the search input (preserved from
 * the URL query) plus a grid of products whose name or description contains
 * the query (case-insensitive substring match).
 */
export function SearchResults({
  products,
  primary,
  query,
}: {
  products: PublicProduct[];
  primary: string;
  query: string;
}) {
  const router = useRouter();
  const [draft, setDraft] = useState(query);

  const results = useMemo(() => {
    const q = query.toLowerCase();
    if (!q) return products;
    return products.filter((p) => {
      if (p.name.toLowerCase().includes(q)) return true;
      if (p.description?.toLowerCase().includes(q)) return true;
      return false;
    });
  }, [products, query]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next = draft.trim();
    if (!next) return;
    router.push(`/search?q=${encodeURIComponent(next)}`);
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="mb-6">
        <label className="relative block">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
            aria-hidden
          />
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Search products by name…"
            className="h-11 w-full rounded-lg border border-zinc-200 bg-white pl-9 pr-10 text-sm shadow-sm focus:border-transparent focus:outline-none focus:ring-2"
            style={{ ["--tw-ring-color" as string]: `${primary}66` }}
            aria-label="Search products"
          />
          {draft ? (
            <button
              type="button"
              onClick={() => setDraft("")}
              aria-label="Clear"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-zinc-400 transition hover:text-zinc-700"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </label>
      </form>

      <div className="mb-6 flex items-baseline justify-between gap-3">
        <h1 className="text-xl font-semibold text-zinc-900 sm:text-2xl">
          {query ? (
            <>
              Results for <span className="text-zinc-500">&ldquo;{query}&rdquo;</span>
            </>
          ) : (
            "Search products"
          )}
        </h1>
        <span className="text-sm text-zinc-500">
          {results.length} item{results.length === 1 ? "" : "s"}
        </span>
      </div>

      {results.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 px-4 py-16 text-center">
          <p className="text-sm text-zinc-500">
            No products match your search.
          </p>
          <Link
            href="/products"
            className="mt-4 inline-flex h-10 items-center justify-center rounded-full border border-zinc-200 bg-white px-5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
          >
            Browse all products
          </Link>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((product) => (
            <li key={product.id} className="h-full">
              <ProductCard product={product} primary={primary} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
