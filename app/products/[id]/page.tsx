import { notFound } from "next/navigation";
import { getProductDetail } from "@/lib/api";
import { loadStorefrontContext } from "@/lib/shop-page";
import { SiteHeader } from "@/components/site-header";
import { Breadcrumb, ShopNotFound, SiteFooter } from "@/components/storefront";
import { ProductDetailClient } from "./product-detail-client";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Shop and product are independent — fetch in parallel to halve TTFB.
  const [ctx, product] = await Promise.all([
    loadStorefrontContext(),
    getProductDetail(id),
  ]);
  if (!ctx) return <ShopNotFound />;
  if (!product) notFound();

  const { shop, displayName, primary } = ctx;
  const { store, config } = shop;

  return (
    <div className="flex min-h-screen flex-col pb-24 sm:pb-0">
      <SiteHeader
        brandName={displayName}
        logoUrl={store.logo_url}
        tagline={config.tagline}
        primaryColor={primary}
      />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Products", href: "/products" },
            { label: product.name },
          ]}
        />

        <ProductDetailClient product={product} primary={primary} />
      </main>

      <SiteFooter displayName={displayName} description={store.description} />
    </div>
  );
}
