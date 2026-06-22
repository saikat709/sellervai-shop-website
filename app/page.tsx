import { headers } from "next/headers";
import { getShopData, type PublicProduct } from "@/lib/api";
import { formatPrice, discountedPrice } from "@/lib/format";
import { SiteHeader } from "@/components/site-header";
import Link from "next/link";

const FALLBACK_PRIMARY_COLOR = "#6366F1";

export default async function HomePage() {
  const headerList = await headers();
  const subdomain = headerList.get("x-subdomain");
  const shop = await getShopData(subdomain);

  if (!shop) {
    return <ShopNotFound />;
  }

  const { store, config, products } = shop;
  const displayName = store.brand_name?.trim() || store.name;
  const primary = config.primary_color || FALLBACK_PRIMARY_COLOR;

  return (
    <div className="flex min-h-screen flex-col bg-white text-zinc-900">
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
          {/* Dark gradient overlay from bottom for legible text */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.35) 35%, rgba(0,0,0,0) 70%)",
            }}
            aria-hidden
          />
        </div>

        <div className="pointer-events-none absolute inset-0 flex items-end">
          <div className="pointer-events-auto mx-auto w-full max-w-6xl px-4 pb-12 sm:px-6 sm:pb-16">
            <div className="max-w-2xl">
              {config.tagline ? (
                <h1 className="text-3xl font-bold leading-tight text-white drop-shadow sm:text-5xl">
                  {config.tagline}
                </h1>
              ) : null}
              {store.description ? (
                <p className="mt-3 max-w-xl text-sm text-white/85 sm:text-base">
                  {store.description}
                </p>
              ) : null}
              <a
                href="#products"
                className="mt-6 inline-flex h-11 items-center justify-center rounded-full px-6 text-sm font-semibold text-white shadow-md transition hover:brightness-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black/30"
                style={{ backgroundColor: primary }}
              >
                Shop Now
              </a>
            </div>
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

function ProductCard({
  product,
  primary,
}: {
  product: PublicProduct;
  primary: string;
}) {
  const price = formatPrice(product.price);
  const discount = product.discount ? formatPrice(product.discount) : null;
  const finalPrice = discountedPrice(product.price, product.discount);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg">
      <div className="relative aspect-square w-full overflow-hidden bg-zinc-100">
        {product.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-zinc-400">
            No image
          </div>
        )}
        {discount ? (
          <span className="absolute right-3 top-3 rounded-full bg-red-600 px-2.5 py-1 text-xs font-semibold text-white shadow">
            {discount} off
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-1 text-base font-semibold text-zinc-900">
          {product.name}
        </h3>
        {product.description ? (
          <p className="line-clamp-2 text-sm text-zinc-500">
            {product.description}
          </p>
        ) : null}

        <div className="mt-auto flex items-baseline gap-2 pt-3">
          <span
            className="text-lg font-bold"
            style={{ color: finalPrice ? primary : undefined }}
          >
            {finalPrice ?? price}
          </span>
          {discount ? (
            <span className="text-sm text-zinc-400 line-through">{price}</span>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function SiteFooter({
  displayName,
  description,
}: {
  displayName: string;
  description: string | null;
}) {
  return (
    <footer className="mt-12 bg-[#1a1a2e] text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-3 sm:px-6">
        <div>
          <span className="text-lg font-semibold tracking-tight">
            {displayName}
          </span>
          {description ? (
            <p className="mt-2 max-w-xs text-sm text-white/70">
              {description}
            </p>
          ) : null}
        </div>

        <nav className="text-sm" aria-label="Footer">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-white/50">
            Explore
          </h3>
          <ul className="mt-3 space-y-2">
            <li>
              <a href="#" className="text-white/85 transition hover:text-white">
                Home
              </a>
            </li>
            <li>
              <a
                href="#products"
                className="text-white/85 transition hover:text-white"
              >
                Products
              </a>
            </li>
            <li>
              <a href="#" className="text-white/85 transition hover:text-white">
                Contact
              </a>
            </li>
          </ul>
        </nav>

        <div className="text-sm">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-white/50">
            Powered by
          </h3>

          <Link href="https://sellervai.com" className="mt-3 inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/90">
            SellerVai
          </Link>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-4 text-center text-xs text-white/60 sm:px-6">
          © {new Date().getFullYear()} {displayName}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

function ShopNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 text-center">
      <h1 className="text-2xl font-semibold text-zinc-900 sm:text-3xl">
        This shop doesn&apos;t exist or is not published yet.
      </h1>
      <p className="mt-3 max-w-md text-sm text-zinc-500">
        Double-check the URL or come back later.
      </p>
    </div>
  );
}
