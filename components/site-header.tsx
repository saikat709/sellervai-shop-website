"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/cart-context";
import { SearchTrigger } from "./search-trigger";

type SiteHeaderProps = {
  brandName: string;
  logoUrl: string | null;
  tagline: string | null;
  primaryColor: string;
};

/**
 * Sticky header with a subtle drop shadow that appears once the user scrolls
 * away from the very top of the page. Holds brand, cart icon (with count
 * badge), and the primary CTA — all driven from the cart context.
 */
export function SiteHeader({
  brandName,
  logoUrl,
  tagline,
  primaryColor,
}: SiteHeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const { itemCount } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b border-zinc-200 bg-white/95 backdrop-blur transition-shadow",
        scrolled ? "shadow-md" : "shadow-none",
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-3"
          aria-label={`${brandName} home`}
        >
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt={`${brandName} logo`}
              className="h-9 w-9 shrink-0 rounded-full object-cover"
            />
          ) : (
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
              style={{ backgroundColor: primaryColor }}
              aria-hidden
            >
              {brandName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex min-w-0 flex-col leading-tight">
            <span className="truncate text-base font-semibold tracking-tight sm:text-lg">
              {brandName}
            </span>
            {tagline ? (
              <span className="hidden truncate text-xs text-zinc-500 sm:block">
                {tagline}
              </span>
            ) : null}
          </div>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/cart"
            aria-label={`Cart, ${itemCount} item${itemCount === 1 ? "" : "s"}`}
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-zinc-700 transition hover:bg-zinc-100"
          >
            <ShoppingCart className="h-5 w-5" aria-hidden />
            {itemCount > 0 ? (
              <span
                className="absolute -right-1 -top-1 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1 text-[10px] font-semibold text-white shadow ring-2 ring-white"
                style={{ backgroundColor: primaryColor }}
              >
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            ) : null}
          </Link>

          <SearchTrigger primary={primaryColor} />

          <Link
            href="/products"
            className="inline-flex h-10 shrink-0 items-center justify-center rounded-full px-4 text-sm font-semibold text-white shadow-sm transition hover:brightness-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            style={{ backgroundColor: primaryColor }}
          >
            <span className="hidden sm:inline">Order Now</span>
            <span className="sm:hidden">Shop</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
