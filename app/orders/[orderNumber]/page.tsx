import { getPublicOrder } from "@/lib/api";
import { loadStorefrontContext } from "@/lib/shop-page";
import { SiteHeader } from "@/components/site-header";
import { Breadcrumb, ShopNotFound, SiteFooter } from "@/components/storefront";
import { OrderConfirmationClient } from "./order-confirmation-client";

export default async function OrderPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;

  // Shop and order are independent — fetch in parallel.
  const [ctx, order] = await Promise.all([
    loadStorefrontContext(),
    getPublicOrder(orderNumber),
  ]);
  if (!ctx) return <ShopNotFound />;

  const { shop, displayName, primary } = ctx;
  const { store, config } = shop;

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader
        brandName={displayName}
        logoUrl={store.logo_url}
        tagline={config.tagline}
        primaryColor={primary}
      />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6 sm:py-12">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Order Confirmation" }]} />

        <OrderConfirmationClient order={order} primary={primary} />
      </main>

      <SiteFooter displayName={displayName} description={store.description} />
    </div>
  );
}
