// ============================================
// Cherry Jewelry — Dynamic Collection Page
// Route: /collections/[slug]
//
// Server Component — data fetched at request time.
// Generates unique metadata per collection.
// Falls back gracefully if slug is unknown.
// ============================================

import { notFound } from "next/navigation";
import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getProducts, getCategories } from "@/lib/db-queries";
import {
  getCollectionConfig,
  ALL_COLLECTION_SLUGS,
  collectionCanonical,
  buildCollectionJsonLd,
} from "@/lib/collection-meta";
import { APP_NAME, APP_URL, APP_OG_IMAGE } from "@/lib/constants";
import CollectionSlugClient from "@/components/collections/CollectionSlugClient";

// ─── Static params for ISR / build-time generation ───────────────────────────
export async function generateStaticParams() {
  return ALL_COLLECTION_SLUGS.map((slug) => ({ slug }));
}

// ─── Dynamic metadata ─────────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const config = getCollectionConfig(slug);

  // Unknown slug — Next.js will render not-found.tsx
  if (!config) {
    return {
      title: "Collection Not Found",
      robots: { index: false, follow: false },
    };
  }

  const canonical = collectionCanonical(slug);

  return {
    title: config.title,
    description: config.description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      locale: "en_IN",
      url: canonical,
      siteName: APP_NAME,
      title: config.title,
      description: config.ogDescription,
      images: [
        {
          url: APP_OG_IMAGE,
          width: 1200,
          height: 630,
          alt: `${config.heading} — ${APP_NAME}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: config.title,
      description: config.ogDescription,
      images: [APP_OG_IMAGE],
    },
  };
}

// ─── Page Props ───────────────────────────────────────────────────────────────
interface CollectionPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// ─── Page Component ───────────────────────────────────────────────────────────
export default async function CollectionSlugPage({
  params,
  searchParams,
}: CollectionPageProps) {
  const { slug } = await params;
  const config = getCollectionConfig(slug);

  // Unknown collection → 404
  if (!config) {
    notFound();
  }

  const sp = await searchParams;

  // Parse search params for filtering + sorting
  const material = typeof sp.material === "string" ? sp.material : undefined;
  const priceMin =
    typeof sp.priceMin === "string" ? parseInt(sp.priceMin, 10) : undefined;
  const priceMax =
    typeof sp.priceMax === "string" ? parseInt(sp.priceMax, 10) : undefined;
  const sortBy = typeof sp.sort === "string" ? sp.sort : "newest";
  const page = typeof sp.page === "string" ? parseInt(sp.page, 10) : 1;

  // Build filters from both URL params AND collection config
  const dbFilters = {
    ...config.dbFilter,
    material,
    priceMin: priceMin !== undefined && !isNaN(priceMin) ? priceMin : undefined,
    priceMax: priceMax !== undefined && !isNaN(priceMax) ? priceMax : undefined,
    sortBy,
    page: !isNaN(page) ? page : 1,
  };

  // Fetch data in parallel (SSR — runs on server)
  const [{ products, total, totalPages }, categories] = await Promise.all([
    getProducts(dbFilters),
    getCategories(),
  ]);

  // JSON-LD structured data
  const jsonLd = buildCollectionJsonLd(config, total);

  return (
    <>
      {/* Inject JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen">
        {/* ── Hero Banner ───────────────────────────────────────────────── */}
        <section className="relative bg-gradient-to-b from-soft-pink/30 via-ivory to-ivory py-14 md:py-20 overflow-hidden">
          {/* Decorative background blobs */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-rose-gold/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-cherry-ruby/5 rounded-full blur-3xl pointer-events-none" />

          <div className="container-luxury relative">
            {/* ── Breadcrumb ─────────────────────────────────── */}
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-1.5 text-xs text-neutral-400 mb-6"
            >
              <Link
                href="/"
                className="hover:text-rose-gold transition-colors"
              >
                Home
              </Link>
              <ChevronRight className="w-3 h-3 flex-shrink-0" />
              <Link
                href="/collections"
                className="hover:text-rose-gold transition-colors"
              >
                Collections
              </Link>
              <ChevronRight className="w-3 h-3 flex-shrink-0" />
              <span className="text-deep-plum font-medium">
                {config.heading}
              </span>
            </nav>

            {/* ── Title Block ─────────────────────────────────── */}
            <div className="text-center max-w-2xl mx-auto">
              <p className="text-xs tracking-[0.3em] uppercase text-rose-gold-dark font-medium mb-3">
                {config.heroTagline}
              </p>
              <h1 className="font-heading text-3xl md:text-5xl lg:text-6xl text-deep-plum leading-tight mb-4">
                {config.heading}
              </h1>
              <p className="text-neutral-500 text-sm md:text-base leading-relaxed mb-2">
                {config.heroParagraph}
              </p>
              <p className="text-xs text-neutral-400">
                {total} handcrafted{" "}
                {total === 1 ? "piece" : "pieces"}
              </p>
            </div>
          </div>
        </section>

        {/* ── Products + Filters ─────────────────────────────────────────── */}
        <div className="container-luxury py-8 md:py-12">
          <Suspense
            fallback={
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-[4/5] bg-neutral-100 rounded-xl animate-pulse"
                  />
                ))}
              </div>
            }
          >
            <CollectionSlugClient
              products={products}
              categories={categories}
              total={total}
              currentPage={!isNaN(page) ? page : 1}
              totalPages={totalPages}
              collectionSlug={slug}
              activeMaterial={material ?? null}
              activePriceMin={
                priceMin !== undefined && !isNaN(priceMin) ? priceMin : null
              }
              activePriceMax={
                priceMax !== undefined && !isNaN(priceMax) ? priceMax : null
              }
              activeSort={sortBy}
              collectionEmoji={config.emoji}
            />
          </Suspense>
        </div>

        {/* ── Related Collections ────────────────────────────────────────── */}
        {config.relatedSlugs.length > 0 && (
          <section className="bg-soft-pink/10 border-t border-neutral-100 py-12 md:py-16">
            <div className="container-luxury">
              <h2 className="font-heading text-xl md:text-2xl text-deep-plum text-center mb-8">
                Explore More Collections
              </h2>
              <div className="flex flex-wrap justify-center gap-3">
                {config.relatedSlugs.map((relSlug) => {
                  const relConfig = getCollectionConfig(relSlug);
                  if (!relConfig) return null;
                  return (
                    <Link
                      key={relSlug}
                      href={`/collections/${relSlug}`}
                      className="flex items-center gap-2 px-5 py-2.5 bg-white border border-neutral-200 hover:border-rose-gold hover:text-rose-gold rounded-full text-sm font-medium transition-all duration-300 group"
                    >
                      <span>{relConfig.emoji}</span>
                      {relConfig.heading}
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        )}
      </div>
    </>
  );
}
