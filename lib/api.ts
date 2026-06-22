/** Type definitions for the public storefront payload. */

export type PublicProduct = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  other_images: string[];
  price: string; // Decimal serialized as string by FastAPI
  discount: string | null;
};

export type PublicStore = {
  id: string;
  name: string;
  brand_name: string | null;
  logo_url: string | null;
  description: string | null;
};

export type PublicConfig = {
  subdomain: string;
  hero_image_url: string | null;
  tagline: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  meta_title: string | null;
  meta_description: string | null;
};

export type ShopData = {
  store: PublicStore;
  config: PublicConfig;
  products: PublicProduct[];
};

// Edge cache TTL for storefront payloads. Combined with a future
// `revalidateTag(\`shop:<subdomain>\`)` call from the admin PATCH endpoint,
// edits surface promptly without a hard cache miss on every request.
export const SHOP_REVALIDATE_SECONDS = 60;

// Default applied only when running on the server in dev where
// NEXT_PUBLIC_API_URL may not be set. Production builds MUST set the env var.
const DEV_API_URL = "http://localhost:8000";

const API_BASE_URL: string = (() => {
  const raw =
    process.env.NEXT_PUBLIC_API_URL ||
    (process.env.NODE_ENV !== "production" ? DEV_API_URL : "");
  return raw.replace(/\/+$/, "");
})();

function getApiBaseUrl(): string {
  if (!API_BASE_URL) {
    throw new Error(
      "NEXT_PUBLIC_API_URL is not set. Set it in the deployment environment.",
    );
  }
  return API_BASE_URL;
}

/**
 * Fetch the public shop data for a given subdomain. Returns `null` if the
 * subdomain is missing, the backend responds with 404, or the network call
 * fails — callers should render the "Shop not found" state.
 */
export async function getShopData(
  subdomain: string | null | undefined,
): Promise<ShopData | null> {
  if (!subdomain) return null;

  const url = `${getApiBaseUrl()}/api/v1/website-config/public/${encodeURIComponent(subdomain)}`;

  try {
    const res = await fetch(url, {
      next: {
        revalidate: SHOP_REVALIDATE_SECONDS,
        tags: [`shop:${subdomain}`],
      },
      headers: { accept: "application/json" },
    });

    if (res.status === 404) return null;
    if (!res.ok) return null;

    const data = (await res.json()) as ShopData;
    if (!data || !data.store || !data.config) return null;
    return data;
  } catch {
    return null;
  }
}
