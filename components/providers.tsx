"use client";

import type { ReactNode } from "react";
import { CartProvider } from "@/context/cart-context";
import { ToastProvider } from "@/context/toast-context";

export function Providers({
  subdomain,
  children,
}: {
  subdomain: string | null;
  children: ReactNode;
}) {
  return (
    <ToastProvider>
      <CartProvider subdomain={subdomain}>{children}</CartProvider>
    </ToastProvider>
  );
}
