"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { unitPriceOf } from "@/lib/format";

export type CartItem = {
  productId: string;
  productCode: string;
  name: string;
  image_url: string | null;
  price: string; // Decimal serialized as string by FastAPI
  discount: string | null;
  quantity: number;
  available_count?: number;
};

export type CartDiscount = {
  code: string;
  amount: number;
};

type CartState = {
  items: CartItem[];
  discount: CartDiscount | null;
};

type CartContextValue = CartState & {
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQty: (productId: string, quantity: number) => void;
  clearCart: () => void;
  applyDiscount: (discount: CartDiscount | null) => void;
  itemCount: number;
  subtotal: number;
  total: number;
};

const EMPTY_STATE: CartState = { items: [], discount: null };

const CartContext = createContext<CartContextValue | null>(null);

function storageKey(subdomain: string | null) {
  return `sellervai_cart_${subdomain ?? "default"}`;
}

function loadFromStorage(key: string): CartState {
  if (typeof window === "undefined") return EMPTY_STATE;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return EMPTY_STATE;
    const parsed = JSON.parse(raw) as Partial<CartState>;
    return {
      items: Array.isArray(parsed.items) ? parsed.items : [],
      discount: parsed.discount ?? null,
    };
  } catch {
    return EMPTY_STATE;
  }
}

function saveToStorage(key: string, state: CartState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(state));
  } catch {
    // Quota or disabled storage — best-effort, do not crash the app.
  }
}

export function CartProvider({
  subdomain,
  children,
}: {
  subdomain: string | null;
  children: ReactNode;
}) {
  const key = storageKey(subdomain);
  const [state, setState] = useState<CartState>(EMPTY_STATE);

  useEffect(() => {
    setState(loadFromStorage(key));
    const onStorage = (e: StorageEvent) => {
      // `e.key === null` means `localStorage.clear()` was called — re-read
      // to stay in sync. Otherwise, only react to writes to our own key.
      if (e.key !== null && e.key !== key) return;
      setState(loadFromStorage(key));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [key]);

  useEffect(() => {
    saveToStorage(key, state);
  }, [key, state]);

  const addItem = useCallback<CartContextValue["addItem"]>((item, quantity = 1) => {
    setState((prev) => {
      const idx = prev.items.findIndex(
        (i) => i.productId === item.productId,
      );
      if (idx >= 0) {
        const next = [...prev.items];
        const existing = next[idx];
        const cap = item.available_count ?? Infinity;
        next[idx] = {
          ...existing,
          ...item,
          quantity: Math.min(existing.quantity + quantity, cap),
        };
        return { ...prev, items: next };
      }
      const cap = item.available_count ?? Infinity;
      return {
        ...prev,
        items: [
          ...prev.items,
          { ...item, quantity: Math.min(quantity, cap) },
        ],
      };
    });
  }, []);

  const removeItem = useCallback<CartContextValue["removeItem"]>((productId) => {
    setState((prev) => ({
      ...prev,
      items: prev.items.filter((i) => i.productId !== productId),
    }));
  }, []);

  const updateQty = useCallback<CartContextValue["updateQty"]>(
    (productId, quantity) => {
      setState((prev) => ({
        ...prev,
        items: prev.items
          .map((i) => {
            if (i.productId !== productId) return i;
            const cap = i.available_count ?? Infinity;
            return { ...i, quantity: Math.max(1, Math.min(quantity, cap)) };
          })
          .filter((i) => i.quantity > 0),
      }));
    },
    [],
  );

  const clearCart = useCallback(() => {
    setState(EMPTY_STATE);
  }, []);

  const applyDiscount = useCallback<CartContextValue["applyDiscount"]>(
    (discount) => {
      setState((prev) => ({ ...prev, discount }));
    },
    [],
  );

  const derived = useMemo(() => {
    const itemCount = state.items.reduce((s, i) => s + i.quantity, 0);
    const subtotal = state.items.reduce(
      (s, i) => s + unitPriceOf(i) * i.quantity,
      0,
    );
    const total = Math.max(0, subtotal - (state.discount?.amount ?? 0));
    return { itemCount, subtotal, total };
  }, [state]);

  const value = useMemo<CartContextValue>(
    () => ({
      ...state,
      ...derived,
      addItem,
      removeItem,
      updateQty,
      clearCart,
      applyDiscount,
    }),
    [state, derived, addItem, removeItem, updateQty, clearCart, applyDiscount],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return ctx;
}
