"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Search as SearchIcon, X, SlidersHorizontal, ArrowRight } from "lucide-react";
import ProductCard from "@/components/product/ProductCard";
import { sampleProducts } from "@/lib/sample-data";
import { cn } from "@/lib/utils";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("relevance");

  const results = query.length >= 2
    ? sampleProducts.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.material.toLowerCase().includes(query.toLowerCase()) ||
          p.tags.some((t) => t.toLowerCase().includes(query.toLowerCase()))
      )
    : [];

  const popularSearches = ["Gold Rings", "Diamond Necklace", "Silver Earrings", "Bangles", "Rose Gold", "Platinum"];
  const recentSearches: string[] = [];

  return (
    <div className="min-h-screen">
      {/* Search Header */}
      <section className="bg-gradient-to-b from-champagne-light to-ivory py-12 md:py-16">
        <div className="container-luxury">
          <div className="max-w-2xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="font-heading text-2xl md:text-4xl text-obsidian text-center mb-8">
                Find Your Perfect Piece
              </h1>
              <div className="relative">
                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for rings, necklaces, earrings..."
                  autoFocus
                  className="w-full py-4 pl-12 pr-12 bg-white border border-neutral-200 rounded-2xl text-base focus:outline-none focus:border-gold focus:shadow-glow transition-all"
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
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
        {query.length < 2 ? (
          /* Empty State / Popular Searches */
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-10">
              <h3 className="text-sm uppercase tracking-wider text-neutral-400 mb-4">Popular Searches</h3>
              <div className="flex flex-wrap justify-center gap-2">
                {popularSearches.map((term) => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="px-4 py-2 bg-white border border-neutral-200 hover:border-gold hover:bg-gold/5 rounded-full text-sm transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>

            {/* Trending Categories */}
            <div>
              <h3 className="text-sm uppercase tracking-wider text-neutral-400 mb-4">Trending Categories</h3>
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
                    className="flex items-center gap-3 p-4 bg-white border border-neutral-100 rounded-xl hover:border-gold/30 hover:shadow-soft transition-all group"
                  >
                    <span className="text-2xl">{cat.emoji}</span>
                    <div className="text-left">
                      <p className="text-sm font-medium text-obsidian group-hover:text-gold-dark transition-colors">{cat.name}</p>
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
                {results.length} result{results.length !== 1 ? "s" : ""} for &ldquo;<span className="text-obsidian font-medium">{query}</span>&rdquo;
              </p>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
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
                <h3 className="font-heading text-xl text-obsidian mb-2">No results found</h3>
                <p className="text-sm text-neutral-400 mb-6">
                  Try different keywords or browse our collections.
                </p>
                <Link href="/collections" className="inline-flex items-center gap-2 text-sm text-gold hover:text-gold-dark transition-colors">
                  Browse Collections <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {results.map((product, i) => (
                  <ProductCard key={product.id} product={product} index={i} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
