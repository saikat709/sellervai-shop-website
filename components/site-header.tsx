"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type SiteHeaderProps = {
  brandName: string;
  logoUrl: string | null;
  tagline: string | null;
  primaryColor: string;
  ctaLabel?: string;
  ctaHref?: string;
};

/**
 * Sticky header with a subtle drop shadow that appears once the user scrolls
 * away from the very top of the page.
 */
export function SiteHeader({
  brandName,
  logoUrl,
  tagline,
  primaryColor,
  ctaLabel = "Order Now",
  ctaHref = "#products",
}: SiteHeaderProps) {
  const [scrolled, setScrolled] = useState(false);

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
        <div className="flex min-w-0 items-center gap-3">
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
        </div>

        <a
          href={ctaHref}
          className="inline-flex h-10 shrink-0 items-center justify-center rounded-full px-4 text-sm font-semibold text-white shadow-sm transition hover:brightness-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          style={{
            backgroundColor: primaryColor,
            // Tailwind can't reach into dynamic hex values, so we expose the
            // color as a CSS variable for any future uses that need it.
            ["--cta-color" as string]: primaryColor,
          }}
        >
          {ctaLabel}
        </a>
      </div>
    </header>
  );
}
