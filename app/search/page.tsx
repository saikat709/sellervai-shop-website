import { loadStorefrontContext } from "@/lib/shop-page";
import { SiteHeader } from "@/components/site-header";
import { ShopNotFound, SiteFooter } from "@/components/storefront";
import { SearchResults } from "./search-results";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const { q: rawQ } = await searchParams;
  const query = (Array.isArray(rawQ) ? rawQ[0] : rawQ ?? "").trim();

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

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <SearchResults
          products={shop.products}
          primary={primary}
          query={query}
        />
      </main>

      <SiteFooter displayName={displayName} description={store.description} />
    </div>
  );
}
