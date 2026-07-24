import { loadStorefrontContext } from "@/lib/shop-page";
import { SiteHeader } from "@/components/site-header";
import {
  ProductCard,
  ShopNotFound,
  SiteFooter,
} from "@/components/storefront";

export default async function HomePage() {
  const ctx = await loadStorefrontContext();
  if (!ctx) return <ShopNotFound />;

  const { shop, displayName, primary } = ctx;
  const { store, config, products } = shop;

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader
        brandName={displayName}
        logoUrl={store.logo_url}
        tagline={config.tagline}
        primaryColor={primary}
      />

      <section className="relative w-full overflow-hidden">
        <div className="relative h-[70vh] min-h-[420px] w-full">
          {config.hero_image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={config.hero_image_url}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div
              className="absolute inset-0"
              style={{ backgroundColor: primary }}
            />
          )}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.35) 35%, rgba(0,0,0,0) 70%)",
            }}
            aria-hidden
          />
        </div>

        <div className="absolute inset-0 flex items-center justify-center p-4 sm:p-6">
          <div className="w-full max-w-3xl rounded-2xl border border-white/20 bg-black/45 p-6 text-center backdrop-blur-md shadow-2xl sm:p-10">
            {store.logo_url && (
              <img
                src={store.logo_url}
                alt=""
                className="mx-auto mb-4 h-16 w-16 rounded-full object-cover border-2 border-white/30 shadow-md"
              />
            )}
            <h2 className="text-xs font-bold uppercase tracking-widest text-white/75 sm:text-sm">
              {store.brand_name || store.name}
            </h2>
            {config.tagline ? (
              <h1 className="mt-3 text-3xl font-extrabold leading-tight text-white drop-shadow-md sm:text-5xl">
                {config.tagline}
              </h1>
            ) : null}
            {store.description ? (
              <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/80 sm:text-base">
                {store.description}
              </p>
            ) : null}
            <a
              href="#products"
              className="mt-8 inline-flex h-11 items-center justify-center rounded-full px-8 text-sm font-bold text-white shadow-lg transition duration-200 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
              style={{ backgroundColor: primary }}
            >
              Explore Catalog
            </a>
          </div>
        </div>
      </section>

      <main
        id="products"
        className="mx-auto w-full max-w-6xl flex-1 scroll-mt-20 px-4 py-16 sm:px-6"
      >
        <div className="mb-10 flex flex-col items-center text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Our Products
          </h2>
          <span
            className="mt-3 block h-1 w-16 rounded-full"
            style={{ backgroundColor: primary }}
            aria-hidden
          />
          {products.length > 0 ? (
            <p className="mt-4 text-sm text-zinc-500">
              {products.length} item{products.length === 1 ? "" : "s"} available
            </p>
          ) : null}
        </div>

        {products.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-300 p-10 text-center text-zinc-500">
            No products available right now.
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <li key={product.id} className="h-full">
                <ProductCard product={product} primary={primary} />
              </li>
            ))}
          </ul>
        )}
      </main>

      <SiteFooter displayName={displayName} description={store.description} />
    </div>
  );
}
