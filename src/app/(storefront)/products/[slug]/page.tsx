import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import {
  getProductBySlug,
  getRelatedProducts,
  getAllProductSlugs,
} from "@/lib/db-queries";
import { formatPrice } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants";
import ProductDetailClient from "@/components/product/ProductDetailClient";

// ============================================
// Static Generation
// ============================================

export async function generateStaticParams() {
  const slugs = await getAllProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

// Allow on-demand rendering for new products added after build
export const dynamicParams = true;

// ============================================
// Dynamic Metadata
// ============================================

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Product Not Found",
    };
  }

  return {
    title: product.metaTitle || `${product.name} | ${APP_NAME}`,
    description:
      product.metaDescription ||
      product.shortDescription ||
      product.description.slice(0, 160),
    openGraph: {
      title: product.name,
      description: product.shortDescription,
      type: "website",
      images: product.images[0]?.url
        ? [{ url: product.images[0].url, alt: product.name }]
        : undefined,
    },
  };
}

// ============================================
// Page Component
// ============================================

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedProducts(
    product.id,
    product.categoryId,
    4
  );

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": product.images.map((img) => img.url),
    "description": product.shortDescription || product.description,
    "sku": product.sku || undefined,
    "brand": {
      "@type": "Brand",
      "name": APP_NAME,
    },
    "offers": {
      "@type": "Offer",
      "url": `${process.env.NEXT_PUBLIC_APP_URL || "https://cherryjewelry.in"}/products/${product.slug}`,
      "priceCurrency": "INR",
      "price": Number(product.price),
      "priceValidUntil": "2030-12-31",
      "itemCondition": "https://schema.org/NewCondition",
      "availability": product.isActive ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  return (
    <div className="min-h-screen">
      {/* Product JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />

      {/* Breadcrumbs */}
      <div className="container-luxury py-4">
        <nav className="flex items-center gap-2 text-xs text-neutral-400">
          <Link href="/" className="hover:text-rose-gold transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3 h-3" />
          <Link
            href="/collections"
            className="hover:text-rose-gold transition-colors"
          >
            Collections
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-deep-plum">{product.name}</span>
        </nav>
      </div>

      <ProductDetailClient
        product={product}
        relatedProducts={relatedProducts}
      />
    </div>
  );
}
