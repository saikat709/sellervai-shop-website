import { loadStorefrontContext } from "@/lib/shop-page";
import { SiteHeader } from "@/components/site-header";
import { ShopNotFound, SiteFooter } from "@/components/storefront";
import { CheckoutClient } from "./checkout-client";

export default async function CheckoutPage() {
  const ctx = await loadStorefrontContext();
  if (!ctx) return <ShopNotFound />;

  const { shop, displayName, primary } = ctx;
  const { store } = shop;

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader
        brandName={displayName}
        logoUrl={store.logo_url}
        tagline={shop.config.tagline}
        primaryColor={primary}
      />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 sm:py-12">
        <CheckoutClient storeId={store.id} primary={primary} />
      </main>

      <SiteFooter displayName={displayName} description={store.description} />
    </div>
  );
}