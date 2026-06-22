"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { SearchModal } from "./search-modal";

/**
 * Search icon + modal pair. Co-located so the trigger owns the open state and
 * the modal can be unmounted cleanly on close.
 */
export function SearchTrigger({ primary }: { primary: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open search"
        className="inline-flex h-10 w-10 items-center justify-center rounded-full text-zinc-700 transition hover:bg-zinc-100"
      >
        <Search className="h-5 w-5" aria-hidden />
      </button>
      <SearchModal open={open} onClose={() => setOpen(false)} primary={primary} />
    </>
  );
}
