"use client";

// ============================================
// Cherry Jewelry — CollectionSlugClient
// Client-side filter/sort/pagination for the
// dynamic /collections/[slug] pages.
//
// Key difference from CollectionsClient:
//   - URL stays at /collections/[slug]?material=...
//   - Category is fixed by the slug, so no category
//     filter is shown (it is already applied SSR).
// ============================================

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  SlidersHorizontal,
  X,
  Grid3X3,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  PackageSearch,
} from "lucide-react";
import Link from "next/link";
import ProductCard from "@/components/product/ProductCard";
import { MATERIALS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Product, Category } from "@/types";

interface CollectionSlugClientProps {
  products: Product[];
  categories: Category[];
  total: number;
  currentPage: number;
  totalPages: number;
  collectionSlug: string;
  activeMaterial: string | null;
  activePriceMin: number | null;
  activePriceMax: number | null;
  activeSort: string;
  collectionEmoji: string;
}

const PRICE_RANGES = [
  { label: "Under ₹10,000", min: 0, max: 10000 },
  { label: "₹10,000 – ₹50,000", min: 10000, max: 50000 },
  { label: "₹50,000 – ₹1,00,000", min: 50000, max: 100000 },
  { label: "Above ₹1,00,000", min: 100000, max: 500000 },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
];

export default function CollectionSlugClient({
  products,
  categories,
  total,
  currentPage,
  totalPages,
  collectionSlug,
  activeMaterial,
  activePriceMin,
  activePriceMax,
  activeSort,
  collectionEmoji,
}: CollectionSlugClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [gridCols, setGridCols] = useState<2 | 3>(3);

  // ── Update URL without losing the slug ──────────────────────────────────
  const updateFilters = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }

    // Reset to page 1 when filter changes (unless explicitly setting page)
    if (!("page" in updates)) {
      params.delete("page");
    }

    const query = params.toString();
    // Stay on the same /collections/[slug] path
    router.push(`${pathname}${query ? `?${query}` : ""}`);
  };

  const clearFilters = () => router.push(pathname);

  const hasFilters =
    activeMaterial ||
    activePriceMin !== null ||
    activePriceMax !== null;

  const activeFilterCount = [
    activeMaterial,
    activePriceMin !== null ? "price" : null,
  ].filter(Boolean).length;

  return (
    <>
      {/* ── Toolbar ───────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6 gap-3">
        <div className="flex items-center gap-3">
          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 border rounded-full text-sm transition-all duration-200 min-h-[44px]",
              showFilters
                ? "border-rose-gold bg-rose-gold/5 text-rose-gold-dark"
                : "border-neutral-200 hover:border-neutral-300 text-neutral-600"
            )}
            aria-expanded={showFilters}
            aria-label="Toggle filters"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 bg-rose-gold text-white text-[10px] font-semibold rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          <span className="text-sm text-neutral-400 hidden sm:inline">
            {total} {total === 1 ? "product" : "products"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Grid toggle (desktop only) */}
          <div className="hidden md:flex items-center border border-neutral-200 rounded-full overflow-hidden">
            <button
              onClick={() => setGridCols(2)}
              className={cn(
                "p-2.5 transition-colors",
                gridCols === 2 ? "bg-neutral-100" : "hover:bg-neutral-50"
              )}
              aria-label="2-column grid"
            >
              <LayoutGrid className="w-4 h-4 text-neutral-500" />
            </button>
            <button
              onClick={() => setGridCols(3)}
              className={cn(
                "p-2.5 transition-colors",
                gridCols === 3 ? "bg-neutral-100" : "hover:bg-neutral-50"
              )}
              aria-label="3-column grid"
            >
              <Grid3X3 className="w-4 h-4 text-neutral-500" />
            </button>
          </div>

          {/* Sort */}
          <select
            value={activeSort}
            onChange={(e) => updateFilters({ sort: e.target.value })}
            className="px-4 py-2.5 border border-neutral-200 rounded-full text-sm bg-white focus:outline-none focus:border-rose-gold transition-colors appearance-none cursor-pointer text-neutral-700 min-h-[44px]"
            aria-label="Sort products"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Active Filter Pills ────────────────────────────────────────────── */}
      {hasFilters && (
        <div className="flex flex-wrap items-center gap-2 mb-5">
          <span className="text-xs text-neutral-400">Active:</span>
          {activeMaterial && (
            <FilterPill
              label={activeMaterial}
              onRemove={() => updateFilters({ material: null })}
            />
          )}
          {activePriceMin !== null && (
            <FilterPill
              label={`₹${activePriceMin.toLocaleString("en-IN")} – ₹${(activePriceMax ?? 500000).toLocaleString("en-IN")}`}
              onRemove={() => updateFilters({ priceMin: null, priceMax: null })}
            />
          )}
          <button
            onClick={clearFilters}
            className="text-xs text-rose-gold hover:text-rose-gold-dark transition-colors underline underline-offset-2"
          >
            Clear all
          </button>
        </div>
      )}

      <div className="flex gap-6 md:gap-8">
        {/* ── Filter Sidebar ─────────────────────────────────────────────── */}
        <AnimatePresence>
          {showFilters && (
            <motion.aside
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 240 }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="shrink-0 hidden md:block overflow-hidden"
            >
              <div className="w-60 sticky top-28 space-y-6 pr-2">
                {/* Material Filter */}
                <FilterSection title="Material">
                  {MATERIALS.map((mat) => (
                    <FilterButton
                      key={mat}
                      label={mat}
                      active={activeMaterial === mat}
                      onClick={() =>
                        updateFilters({
                          material: activeMaterial === mat ? null : mat,
                        })
                      }
                    />
                  ))}
                </FilterSection>

                {/* Price Range */}
                <FilterSection title="Price Range">
                  {PRICE_RANGES.map((range) => (
                    <FilterButton
                      key={range.label}
                      label={range.label}
                      active={
                        activePriceMin === range.min &&
                        activePriceMax === range.max
                      }
                      onClick={() =>
                        updateFilters({
                          priceMin:
                            activePriceMin === range.min &&
                            activePriceMax === range.max
                              ? null
                              : String(range.min),
                          priceMax:
                            activePriceMin === range.min &&
                            activePriceMax === range.max
                              ? null
                              : String(range.max),
                        })
                      }
                    />
                  ))}
                </FilterSection>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* ── Product Grid ───────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          {products.length === 0 ? (
            <EmptyState
              emoji={collectionEmoji}
              hasFilters={!!hasFilters}
              onClearFilters={clearFilters}
            />
          ) : (
            <>
              <motion.div
                layout
                className={cn(
                  "grid gap-3 md:gap-5",
                  gridCols === 2
                    ? "grid-cols-2"
                    : "grid-cols-2 md:grid-cols-3"
                )}
              >
                {products.map((product, i) => (
                  <ProductCard key={product.id} product={product} index={i} />
                ))}
              </motion.div>

              {/* ── Pagination ─────────────────────────────────────────── */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12 flex-wrap">
                  <button
                    onClick={() =>
                      updateFilters({
                        page: String(Math.max(1, currentPage - 1)),
                      })
                    }
                    disabled={currentPage <= 1}
                    className={cn(
                      "flex items-center gap-1 px-4 py-2.5 border rounded-full text-sm transition-all min-h-[44px]",
                      currentPage <= 1
                        ? "border-neutral-100 text-neutral-300 cursor-not-allowed"
                        : "border-neutral-200 hover:border-rose-gold hover:text-rose-gold text-neutral-600"
                    )}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Prev
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(
                      (n) =>
                        n === 1 ||
                        n === totalPages ||
                        Math.abs(n - currentPage) <= 1
                    )
                    .reduce<(number | "...")[]>((acc, n, i, arr) => {
                      if (i > 0 && n - (arr[i - 1] as number) > 1) {
                        acc.push("...");
                      }
                      acc.push(n);
                      return acc;
                    }, [])
                    .map((item, i) =>
                      item === "..." ? (
                        <span key={`dots-${i}`} className="px-1 text-neutral-300">
                          …
                        </span>
                      ) : (
                        <button
                          key={item}
                          onClick={() =>
                            updateFilters({ page: String(item) })
                          }
                          className={cn(
                            "w-10 h-10 rounded-full text-sm font-medium transition-all min-h-[44px]",
                            item === currentPage
                              ? "bg-rose-gold text-white shadow-md"
                              : "border border-neutral-200 text-neutral-600 hover:border-rose-gold hover:text-rose-gold"
                          )}
                        >
                          {item}
                        </button>
                      )
                    )}

                  <button
                    onClick={() =>
                      updateFilters({
                        page: String(Math.min(totalPages, currentPage + 1)),
                      })
                    }
                    disabled={currentPage >= totalPages}
                    className={cn(
                      "flex items-center gap-1 px-4 py-2.5 border rounded-full text-sm transition-all min-h-[44px]",
                      currentPage >= totalPages
                        ? "border-neutral-100 text-neutral-300 cursor-not-allowed"
                        : "border-neutral-200 hover:border-rose-gold hover:text-rose-gold text-neutral-600"
                    )}
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Mobile Filter Sheet ────────────────────────────────────────────── */}
      <AnimatePresence>
        {showFilters && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-[150] md:hidden"
              onClick={() => setShowFilters(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-white z-[151] rounded-t-2xl p-6 pb-8 max-h-[80vh] overflow-y-auto md:hidden overscroll-contain"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-heading text-lg text-deep-plum">Filters</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-2 hover:bg-neutral-50 rounded-full transition-colors"
                  aria-label="Close filters"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                <FilterSection title="Material">
                  <div className="flex flex-wrap gap-2">
                    {MATERIALS.map((mat) => (
                      <button
                        key={mat}
                        onClick={() =>
                          updateFilters({
                            material: activeMaterial === mat ? null : mat,
                          })
                        }
                        className={cn(
                          "px-3 py-1.5 border rounded-full text-xs transition-all",
                          activeMaterial === mat
                            ? "border-rose-gold bg-rose-gold/10 text-rose-gold-dark"
                            : "border-neutral-200 text-neutral-500"
                        )}
                      >
                        {mat}
                      </button>
                    ))}
                  </div>
                </FilterSection>

                <FilterSection title="Price Range">
                  <div className="flex flex-wrap gap-2">
                    {PRICE_RANGES.map((range) => (
                      <button
                        key={range.label}
                        onClick={() =>
                          updateFilters({
                            priceMin:
                              activePriceMin === range.min &&
                              activePriceMax === range.max
                                ? null
                                : String(range.min),
                            priceMax:
                              activePriceMin === range.min &&
                              activePriceMax === range.max
                                ? null
                                : String(range.max),
                          })
                        }
                        className={cn(
                          "px-3 py-1.5 border rounded-full text-xs transition-all",
                          activePriceMin === range.min &&
                            activePriceMax === range.max
                            ? "border-rose-gold bg-rose-gold/10 text-rose-gold-dark"
                            : "border-neutral-200 text-neutral-500"
                        )}
                      >
                        {range.label}
                      </button>
                    ))}
                  </div>
                </FilterSection>
              </div>

              <button
                onClick={() => {
                  clearFilters();
                  setShowFilters(false);
                }}
                className="mt-6 w-full py-3 border border-neutral-200 rounded-full text-sm text-neutral-500 hover:border-rose-gold hover:text-rose-gold transition-colors"
              >
                Clear all filters
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function FilterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-3">
        {title}
      </h4>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function FilterButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors min-h-[40px]",
        active
          ? "bg-rose-gold/10 text-rose-gold-dark font-medium"
          : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700"
      )}
    >
      {label}
    </button>
  );
}

function FilterPill({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-soft-pink/50 text-rose-gold-dark text-xs rounded-full border border-rose-gold/20">
      {label}
      <button
        onClick={onRemove}
        className="hover:text-cherry-ruby transition-colors"
        aria-label={`Remove ${label} filter`}
      >
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}

function EmptyState({
  emoji,
  hasFilters,
  onClearFilters,
}: {
  emoji: string;
  hasFilters: boolean;
  onClearFilters: () => void;
}) {
  return (
    <div className="text-center py-20">
      <PackageSearch className="w-16 h-16 text-neutral-200 mx-auto mb-4" />
      <h3 className="font-heading text-xl text-deep-plum mb-2">
        {hasFilters ? "No products match your filters" : "No products yet"}
      </h3>
      <p className="text-sm text-neutral-400 mb-6 max-w-sm mx-auto">
        {hasFilters
          ? "Try removing some filters to see more results."
          : "This collection is coming soon — check back for new arrivals."}
      </p>
      {hasFilters ? (
        <button
          onClick={onClearFilters}
          className="text-sm text-rose-gold hover:text-rose-gold-dark transition-colors underline underline-offset-4"
        >
          Clear all filters
        </button>
      ) : (
        <Link
          href="/collections"
          className="inline-flex items-center gap-2 bg-deep-plum text-white px-6 py-3 rounded-full text-sm hover:bg-deep-plum-dark transition-colors"
        >
          Browse All Collections
        </Link>
      )}
    </div>
  );
}
