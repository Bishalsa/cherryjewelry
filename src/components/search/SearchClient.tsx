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
      <section className="bg-gradient-to-b from-champagne-light to-ivory py-12 md:py-16">
        <div className="container-luxury">
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="font-heading text-2xl md:text-4xl text-obsidian text-center mb-8">
                Find Your Perfect Piece
              </h1>
              <div className="relative">
                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => handleInputChange(e.target.value)}
                  placeholder="Search for rings, necklaces, earrings..."
                  autoFocus
                  className="w-full py-4 pl-12 pr-12 bg-white border border-neutral-200 rounded-2xl text-base focus:outline-none focus:border-gold focus:shadow-glow transition-all"
                />
                {inputValue && (
                  <button
                    onClick={() => handleInputChange("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-neutral-100 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4 text-neutral-400" />
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
              <h3 className="text-sm uppercase tracking-wider text-neutral-400 mb-4">
                Popular Searches
              </h3>
              <div className="flex flex-wrap justify-center gap-2">
                {popularSearches.map((term) => (
                  <button
                    key={term}
                    onClick={() => handleQuickSearch(term)}
                    className="px-4 py-2 bg-white border border-neutral-200 hover:border-gold hover:bg-gold/5 rounded-full text-sm transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>

            {/* Trending Categories */}
            <div>
              <h3 className="text-sm uppercase tracking-wider text-neutral-400 mb-4">
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
                    href={`/collections?category=${cat.slug}`}
                    className="flex items-center gap-3 p-4 bg-white border border-neutral-100 rounded-xl hover:border-gold/30 hover:shadow-soft transition-all group"
                  >
                    <span className="text-2xl">{cat.emoji}</span>
                    <div className="text-left">
                      <p className="text-sm font-medium text-obsidian group-hover:text-gold-dark transition-colors">
                        {cat.name}
                      </p>
                      <p className="text-xs text-neutral-400">Explore →</p>
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
              <p className="text-sm text-neutral-400">
                {results.length} result{results.length !== 1 ? "s" : ""} for
                &ldquo;
                <span className="text-obsidian font-medium">
                  {initialQuery}
                </span>
                &rdquo;
              </p>
              <select
                value={initialSort}
                onChange={(e) => handleSortChange(e.target.value)}
                className="px-3 py-1.5 border border-neutral-200 rounded-full text-xs bg-white focus:outline-none"
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
                <h3 className="font-heading text-xl text-obsidian mb-2">
                  No results found
                </h3>
                <p className="text-sm text-neutral-400 mb-6">
                  Try different keywords or browse our collections.
                </p>
                <Link
                  href="/collections"
                  className="inline-flex items-center gap-2 text-sm text-gold hover:text-gold-dark transition-colors"
                >
                  Browse Collections <ArrowRight className="w-3 h-3" />
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
