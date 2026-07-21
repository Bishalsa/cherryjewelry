"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  SlidersHorizontal,
  X,
  Grid3X3,
  LayoutGrid,
} from "lucide-react";
import ProductCard from "@/components/product/ProductCard";
import { MATERIALS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Product, Category } from "@/types";

interface CollectionsClientProps {
  products: Product[];
  categories: Category[];
  total: number;
  currentPage: number;
  totalPages: number;
  // Current filter state from URL
  activeCategory: string | null;
  activeMaterial: string | null;
  activePriceMin: number | null;
  activePriceMax: number | null;
  activeSort: string;
}

export default function CollectionsClient({
  products,
  categories,
  total,
  currentPage,
  totalPages,
  activeCategory,
  activeMaterial,
  activePriceMin,
  activePriceMax,
  activeSort,
}: CollectionsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [gridCols, setGridCols] = useState<2 | 3>(3);

  // Build a new URL with updated query params.
  // IMPORTANT: Category navigation goes to /collections/[slug].
  // All other filters (material, price, sort) stay as params on /collections.
  const updateFilters = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    // Handle category separately — navigate to slug route
    if ("category" in updates) {
      const newCat = updates.category;
      if (newCat === null) {
        // Clear category → stay on /collections
        params.delete("category");
        params.delete("page");
        const query = params.toString();
        router.push(`/collections${query ? `?${query}` : ""}`);
      } else {
        // Navigate to /collections/[slug]
        router.push(`/collections/${newCat}`);
      }
      return;
    }

    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }

    // Reset page when filters change (unless we're just changing page)
    if (!("page" in updates)) {
      params.delete("page");
    }

    const query = params.toString();
    router.push(`/collections${query ? `?${query}` : ""}`);
  };

  const clearFilters = () => {
    router.push("/collections");
  };

  const hasFilters =
    activeCategory ||
    activeMaterial ||
    activePriceMin !== null ||
    activePriceMax !== null;

  const priceRanges = [
    { label: "Under ₹10,000", min: 0, max: 10000 },
    { label: "₹10,000 - ₹50,000", min: 10000, max: 50000 },
    { label: "₹50,000 - ₹1,00,000", min: 50000, max: 100000 },
    { label: "Above ₹1,00,000", min: 100000, max: 500000 },
  ];

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 border rounded-full text-sm transition-colors",
              showFilters
                ? "border-rose-gold bg-rose-gold/5 text-rose-gold-dark"
                : "border-neutral-200 hover:border-neutral-300"
            )}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {hasFilters && (
              <span className="w-4 h-4 bg-rose-gold text-white text-[10px] rounded-full flex items-center justify-center">
                !
              </span>
            )}
          </button>

          <span className="text-sm text-neutral-400 hidden md:inline">
            {total} products
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Grid Toggle (Desktop) */}
          <div className="hidden md:flex items-center border border-neutral-200 rounded-full">
            <button
              onClick={() => setGridCols(2)}
              className={cn(
                "p-2 rounded-full transition-colors",
                gridCols === 2 ? "bg-neutral-100" : "hover:bg-neutral-50"
              )}
              aria-label="2 columns"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setGridCols(3)}
              className={cn(
                "p-2 rounded-full transition-colors",
                gridCols === 3 ? "bg-neutral-100" : "hover:bg-neutral-50"
              )}
              aria-label="3 columns"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
          </div>

          {/* Sort */}
          <select
            value={activeSort}
            onChange={(e) => updateFilters({ sort: e.target.value })}
            className="px-4 py-2 border border-neutral-200 rounded-full text-sm bg-white focus:outline-none focus:border-rose-gold transition-colors appearance-none pr-8 cursor-pointer"
          >
            <option value="newest">Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Filter Sidebar */}
        {showFilters && (
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-64 shrink-0 hidden md:block"
          >
            <div className="sticky top-28 space-y-6">
              {/* Active Filters */}
              {hasFilters && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs uppercase tracking-wider text-neutral-400">
                      Active Filters
                    </span>
                    <button
                      onClick={clearFilters}
                      className="text-xs text-rose-gold hover:text-rose-gold-dark transition-colors"
                    >
                      Clear all
                    </button>
                  </div>
                </div>
              )}

              {/* Categories */}
              <div>
                <h4 className="text-sm font-medium text-deep-plum mb-3">
                  Category
                </h4>
                <div className="space-y-1.5">
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/collections/${cat.slug}`}
                      className={cn(
                        "block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                        activeCategory === cat.slug
                          ? "bg-rose-gold/10 text-rose-gold-dark"
                          : "text-neutral-500 hover:bg-neutral-50"
                      )}
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Material */}
              <div>
                <h4 className="text-sm font-medium text-deep-plum mb-3">
                  Material
                </h4>
                <div className="space-y-1.5">
                  {MATERIALS.map((mat) => (
                    <button
                      key={mat}
                      onClick={() =>
                        updateFilters({
                          material: activeMaterial === mat ? null : mat,
                        })
                      }
                      className={cn(
                        "block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                        activeMaterial === mat
                          ? "bg-rose-gold/10 text-rose-gold-dark"
                          : "text-neutral-500 hover:bg-neutral-50"
                      )}
                    >
                      {mat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h4 className="text-sm font-medium text-deep-plum mb-3">
                  Price Range
                </h4>
                <div className="space-y-2">
                  {priceRanges.map((option) => (
                    <button
                      key={option.label}
                      onClick={() =>
                        updateFilters({
                          priceMin:
                            activePriceMin === option.min &&
                            activePriceMax === option.max
                              ? null
                              : String(option.min),
                          priceMax:
                            activePriceMin === option.min &&
                            activePriceMax === option.max
                              ? null
                              : String(option.max),
                        })
                      }
                      className={cn(
                        "block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                        activePriceMin === option.min &&
                          activePriceMax === option.max
                          ? "bg-rose-gold/10 text-rose-gold-dark"
                          : "text-neutral-500 hover:bg-neutral-50"
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.aside>
        )}

        {/* Product Grid */}
        <div className="flex-1">
          {products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-5xl mb-4">🔍</p>
              <h3 className="font-heading text-xl text-deep-plum mb-2">
                No products found
              </h3>
              <p className="text-sm text-neutral-400 mb-4">
                Try adjusting your filters to find what you&apos;re looking
                for.
              </p>
              <button
                onClick={clearFilters}
                className="text-sm text-rose-gold hover:text-rose-gold-dark transition-colors underline underline-offset-4"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <>
              <div
                className={cn(
                  "grid gap-4 md:gap-6",
                  gridCols === 2
                    ? "grid-cols-2"
                    : "grid-cols-2 md:grid-cols-3"
                )}
              >
                {products.map((product, i) => (
                  <ProductCard key={product.id} product={product} index={i} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12">
                  <button
                    onClick={() =>
                      updateFilters({
                        page: String(Math.max(1, currentPage - 1)),
                      })
                    }
                    disabled={currentPage <= 1}
                    className={cn(
                      "px-4 py-2 border rounded-full text-sm transition-colors",
                      currentPage <= 1
                        ? "border-neutral-100 text-neutral-300 cursor-not-allowed"
                        : "border-neutral-200 hover:border-rose-gold text-neutral-600"
                    )}
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() =>
                          updateFilters({ page: String(pageNum) })
                        }
                        className={cn(
                          "w-10 h-10 rounded-full text-sm font-medium transition-colors",
                          pageNum === currentPage
                            ? "bg-rose-gold text-white"
                            : "border border-neutral-200 text-neutral-600 hover:border-rose-gold"
                        )}
                      >
                        {pageNum}
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
                      "px-4 py-2 border rounded-full text-sm transition-colors",
                      currentPage >= totalPages
                        ? "border-neutral-100 text-neutral-300 cursor-not-allowed"
                        : "border-neutral-200 hover:border-rose-gold text-neutral-600"
                    )}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
