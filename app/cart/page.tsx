import { loadStorefrontContext } from "@/lib/shop-page";
import { SiteHeader } from "@/components/site-header";
import { ShopNotFound, SiteFooter } from "@/components/storefront";
import { CartClient } from "./cart-client";

export default async function CartPage() {
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
        <h1 className="mb-6 text-2xl font-bold tracking-tight sm:text-3xl">
          Your Cart
        </h1>
        <CartClient
          storeId={store.id}
          primary={primary}
          displayName={displayName}
        />
      </main>

      <SiteFooter displayName={displayName} description={store.description} />
    </div>
  );
}