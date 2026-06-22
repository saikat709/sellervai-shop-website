import { headers } from "next/headers";
import { getShopData, type ShopData } from "@/lib/api";

export const FALLBACK_PRIMARY_COLOR = "#6366F1";

export type StorefrontContext = {
  shop: ShopData;
  displayName: string;
  primary: string;
};

/**
 * Read the `x-subdomain` header injected by middleware and fetch the shop
 * data. Returns `null` when the subdomain is missing or the shop can't be
 * loaded — callers should render `<ShopNotFound />` in that case.
 */
export async function loadStorefrontContext(): Promise<StorefrontContext | null> {
  const headerList = await headers();
  const subdomain = headerList.get("x-subdomain");
  const shop = await getShopData(subdomain);
  if (!shop) return null;
  const { store, config } = shop;
  return {
    shop,
    displayName: store.brand_name?.trim() || store.name,
    primary: config.primary_color || FALLBACK_PRIMARY_COLOR,
  };
}
