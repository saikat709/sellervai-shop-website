import { loadStorefrontContext } from "@/lib/shop-page";
import { SiteHeader } from "@/components/site-header";
import { ShopNotFound, SiteFooter } from "@/components/storefront";
import { ProductGrid } from "./product-grid";

export default async function ProductsPage() {
  const ctx = await loadStorefrontContext();
  if (!ctx) return <ShopNotFound />;

  const { shop, displayName, primary } = ctx;
  const { store, products } = shop;

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader
        brandName={displayName}
        logoUrl={store.logo_url}
        tagline={shop.config.tagline}
        primaryColor={primary}
      />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 sm:py-12">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            All Products
          </h1>
          <span
            className="mx-auto mt-3 block h-1 w-16 rounded-full"
            style={{ backgroundColor: primary }}
            aria-hidden
          />
        </div>

        <ProductGrid products={products} primary={primary} />
      </main>

      <SiteFooter displayName={displayName} description={store.description} />
    </div>
  );
}
