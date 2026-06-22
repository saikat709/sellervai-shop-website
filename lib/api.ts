/** Type definitions for the public storefront payload. */

export type PublicProduct = {
  id: string;
  product_code: string;
  name: string;
  description: string | null;
  image_url: string | null;
  other_images: string[];
  price: string; // Decimal serialized as string by FastAPI
  discount: string | null;
  available_count: number;
};

export type PublicProductDetail = PublicProduct & {
  store_id: string;
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

export type CouponValidation =
  | { valid: true; discount_amount: number; message: string }
  | { valid: false; discount_amount: 0; message: string };

export type PublicOrderItem = {
  product_code: string;
  product_name: string;
  product_price: string;
  quantity: number;
};

export type CreateOrderInput = {
  store_id: string;
  customer_name: string;
  customer_phone: string;
  customer_phone_2?: string | null;
  delivery_address: string;
  items: PublicOrderItem[];
  coupon_code?: string | null;
  discount_applied: string; // Decimal as string
  total_amount: string; // Decimal as string
};

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export type PublicOrderDetail = {
  order_number: string;
  store_id: string;
  customer_name: string;
  customer_phone: string;
  customer_phone_2: string | null;
  delivery_address: string;
  items: Array<{
    product_code: string;
    product_name: string;
    product_price: string;
    quantity: number;
  }>;
  coupon_code: string | null;
  discount_applied: string;
  total_amount: string;
  status: OrderStatus;
  created_at: string;
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

/**
 * Fetch a single product by id. Returns null on 404 / network failure.
 * Cached per-product on the edge.
 */
export async function getProductDetail(
  productId: string,
): Promise<PublicProductDetail | null> {
  const url = `${getApiBaseUrl()}/api/v1/products/${encodeURIComponent(productId)}/public`;
  try {
    const res = await fetch(url, {
      next: { revalidate: SHOP_REVALIDATE_SECONDS },
      headers: { accept: "application/json" },
    });
    if (res.status === 404) return null;
    if (!res.ok) return null;
    return (await res.json()) as PublicProductDetail;
  } catch {
    return null;
  }
}

/**
 * Validate a coupon code against the backend. Never throws.
 * Cached for 30s so identical lookups (e.g. on remount) don't re-hit the API.
 */
export async function validateCoupon(
  code: string,
  storeId: string,
  subtotal: number,
): Promise<CouponValidation> {
  const params = new URLSearchParams({
    code,
    store_id: storeId,
    subtotal: subtotal.toFixed(2),
  });
  const url = `${getApiBaseUrl()}/api/v1/coupons/validate?${params.toString()}`;
  try {
    const res = await fetch(url, {
      headers: { accept: "application/json" },
      next: { revalidate: 30, tags: [`coupons:${storeId}`] },
    });
    console.log("validateCoupon response", res);
    if (!res.ok) {
      return { valid: false, discount_amount: 0, message: "Could not validate coupon" };
    }
    return (await res.json()) as CouponValidation;
  } catch {
    return { valid: false, discount_amount: 0, message: "Network error" };
  }
}

/**
 * Submit a public order. Returns the order_number on success or throws with
 * a `message` on failure.
 */
export async function createPublicOrder(input: CreateOrderInput): Promise<string> {
  const url = `${getApiBaseUrl()}/api/v1/orders/public`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify(input),
    cache: "no-store",
  });
  if (!res.ok) {
    let message = "Failed to place order";
    try {
      const body = await res.json();
      if (body?.detail) {
        message = Array.isArray(body.detail)
          ? body.detail.map((d: { msg?: string }) => d.msg ?? "").filter(Boolean).join(", ")
          : String(body.detail);
      }
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }
  const data = (await res.json()) as { order_number: string };
  return data.order_number;
}

/**
 * Fetch a public order by order number. Returns null on 404 / failure.
 * Cached per-order on the edge so refreshing the confirmation page is cheap;
 * status updates from the admin side can `revalidateTag` to bust the cache.
 */
export async function getPublicOrder(
  orderNumber: string,
): Promise<PublicOrderDetail | null> {
  const url = `${getApiBaseUrl()}/api/v1/orders/public/${encodeURIComponent(orderNumber)}`;
  try {
    const res = await fetch(url, {
      headers: { accept: "application/json" },
      next: { revalidate: SHOP_REVALIDATE_SECONDS, tags: [`order:${orderNumber}`] },
    });
    if (res.status === 404) return null;
    if (!res.ok) return null;
    return (await res.json()) as PublicOrderDetail;
  } catch {
    return null;
  }
}
