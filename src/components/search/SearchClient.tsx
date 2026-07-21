"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search as SearchIcon,
  X,
  ArrowRight,
} from "lucide-react";
import ProductCard from "@/components/product/ProductCard";
import { cn } from "@/lib/utils";
import { debounce } from "@/lib/utils";
import type { Product } from "@/types";

interface SearchClientProps {
  initialQuery: string;
  results: Product[];
  sortBy: string;
}

const popularSearches = [
  "Gold Rings",
  "Diamond Necklace",
  "Silver Earrings",
  "Bangles",
  "Rose Gold",
  "Platinum",
];

export default function SearchClient({
  initialQuery,
  results,
  sortBy: initialSort,
}: SearchClientProps) {
  const router = useRouter();
  const [inputValue, setInputValue] = useState(initialQuery);

  // Debounced navigation for search-as-you-type
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      const params = new URLSearchParams();
      if (query.length >= 2) {
        params.set("q", query);
      }
      router.push(`/search${params.toString() ? `?${params.toString()}` : ""}`);
    }, 400),
    [router]
  );

  const handleInputChange = (value: string) => {
    setInputValue(value);
    debouncedSearch(value);
  };

  const handleSortChange = (newSort: string) => {
    const params = new URLSearchParams();
    if (initialQuery) params.set("q", initialQuery);
    if (newSort !== "relevance") params.set("sort", newSort);
    router.push(`/search${params.toString() ? `?${params.toString()}` : ""}`);
  };

  const handleQuickSearch = (term: string) => {
    setInputValue(term);
    router.push(`/search?q=${encodeURIComponent(term)}`);
  };

  const hasQuery = initialQuery.length >= 2;

  return (
    <>
      {/* Search Header */}
      <section className="bg-gradient-to-b from-soft-pink/40 to-ivory py-12 md:py-16">
        <div className="container-luxury">
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="font-heading text-2xl md:text-4xl text-deep-plum text-center font-bold mb-8">
                Find Your Perfect Piece
              </h1>
              <div className="relative">
                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-600 pointer-events-none" />
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => handleInputChange(e.target.value)}
                  placeholder="Search for rings, necklaces, earrings..."
                  autoFocus
                  className="w-full py-4 pl-12 pr-12 bg-white border-2 border-neutral-300 rounded-2xl text-base md:text-lg font-medium text-deep-plum focus:outline-none focus:border-rose-gold focus:ring-4 focus:ring-rose-gold/15 placeholder:text-neutral-500 shadow-sm transition-all"
                />
                {inputValue && (
                  <button
                    onClick={() => handleInputChange("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-neutral-100 rounded-full transition-colors text-deep-plum"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <div className="container-luxury py-8">
        {!hasQuery ? (
          /* Empty State / Popular Searches */
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-10">
              <h3 className="text-xs uppercase tracking-wider font-semibold text-neutral-700 mb-4">
                Popular Searches
              </h3>
              <div className="flex flex-wrap justify-center gap-2">
                {popularSearches.map((term) => (
                  <button
                    key={term}
                    onClick={() => handleQuickSearch(term)}
                    className="px-4 py-2 bg-white border border-neutral-300 hover:border-deep-plum hover:bg-deep-plum hover:text-white font-medium text-neutral-800 rounded-full text-sm transition-colors shadow-xs"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>

            {/* Trending Categories */}
            <div>
              <h3 className="text-xs uppercase tracking-wider font-semibold text-neutral-700 mb-4">
                Trending Categories
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { name: "Rings", emoji: "💍", slug: "rings" },
                  { name: "Necklaces", emoji: "📿", slug: "necklaces" },
                  { name: "Earrings", emoji: "✨", slug: "earrings" },
                  { name: "Bracelets", emoji: "⭐", slug: "bracelets" },
                ].map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/collections/${cat.slug}`}
                    className="flex items-center gap-3 p-4 bg-white border border-neutral-200 rounded-xl hover:border-rose-gold hover:shadow-md transition-all group"
                  >
                    <span className="text-2xl">{cat.emoji}</span>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-deep-plum group-hover:text-rose-gold-dark transition-colors">
                        {cat.name}
                      </p>
                      <p className="text-xs font-medium text-neutral-600">Explore →</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Search Results */
          <div>
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm font-medium text-neutral-700">
                {results.length} result{results.length !== 1 ? "s" : ""} for
                &ldquo;
                <span className="text-deep-plum font-bold">
                  {initialQuery}
                </span>
                &rdquo;
              </p>
              <select
                value={initialSort}
                onChange={(e) => handleSortChange(e.target.value)}
                className="px-3.5 py-2 border border-neutral-300 rounded-full text-xs font-semibold text-deep-plum bg-white focus:outline-none focus:border-rose-gold"
              >
                <option value="relevance">Relevance</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="newest">Newest</option>
              </select>
            </div>

            {results.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-5xl mb-4">🔍</p>
                <h3 className="font-heading text-xl text-deep-plum font-bold mb-2">
                  No results found
                </h3>
                <p className="text-sm text-neutral-600 mb-6">
                  Try different keywords or browse our collections.
                </p>
                <Link
                  href="/collections"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-rose-gold-dark hover:text-deep-plum transition-colors"
                >
                  Browse Collections <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {results.map((product, i) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    index={i}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
