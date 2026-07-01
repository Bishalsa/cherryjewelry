"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Filter, SlidersHorizontal, ChevronDown, X, Grid3X3, LayoutGrid } from "lucide-react";
import ProductCard from "@/components/product/ProductCard";
import { sampleProducts, sampleCategories } from "@/lib/sample-data";
import { MATERIALS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export default function CollectionsPage() {
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500000]);
  const [gridCols, setGridCols] = useState<2 | 3>(3);

  const filteredProducts = sampleProducts
    .filter((p) => {
      if (selectedCategory && p.categoryId !== selectedCategory) return false;
      if (selectedMaterial && p.material !== selectedMaterial) return false;
      if (p.price < priceRange[0] || p.price > priceRange[1]) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price_asc": return a.price - b.price;
        case "price_desc": return b.price - a.price;
        case "rating": return b.averageRating - a.averageRating;
        case "newest": return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default: return 0;
      }
    });

  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedMaterial(null);
    setPriceRange([0, 500000]);
  };

  const hasFilters = selectedCategory || selectedMaterial || priceRange[0] > 0 || priceRange[1] < 500000;

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-b from-champagne-light to-ivory py-16 md:py-20">
        <div className="container-luxury text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-xs tracking-[0.3em] uppercase text-gold-dark mb-3">
              Our Collection
            </p>
            <h1 className="font-heading text-3xl md:text-5xl text-obsidian">
              All Jewelry
            </h1>
            <p className="text-neutral-400 mt-3 text-sm">
              Discover {sampleProducts.length} handcrafted pieces
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container-luxury py-8">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 border rounded-full text-sm transition-colors",
                showFilters
                  ? "border-gold bg-gold/5 text-gold-dark"
                  : "border-neutral-200 hover:border-neutral-300"
              )}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {hasFilters && (
                <span className="w-4 h-4 bg-gold text-white text-[10px] rounded-full flex items-center justify-center">
                  !
                </span>
              )}
            </button>

            <span className="text-sm text-neutral-400 hidden md:inline">
              {filteredProducts.length} products
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
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-neutral-200 rounded-full text-sm bg-white focus:outline-none focus:border-gold transition-colors appearance-none pr-8 cursor-pointer"
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
                      <span className="text-xs uppercase tracking-wider text-neutral-400">Active Filters</span>
                      <button onClick={clearFilters} className="text-xs text-gold hover:text-gold-dark transition-colors">
                        Clear all
                      </button>
                    </div>
                  </div>
                )}

                {/* Categories */}
                <div>
                  <h4 className="text-sm font-medium text-obsidian mb-3">Category</h4>
                  <div className="space-y-1.5">
                    {sampleCategories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                        className={cn(
                          "block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                          selectedCategory === cat.id
                            ? "bg-gold/10 text-gold-dark"
                            : "text-neutral-500 hover:bg-neutral-50"
                        )}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Material */}
                <div>
                  <h4 className="text-sm font-medium text-obsidian mb-3">Material</h4>
                  <div className="space-y-1.5">
                    {MATERIALS.map((mat) => (
                      <button
                        key={mat}
                        onClick={() => setSelectedMaterial(selectedMaterial === mat ? null : mat)}
                        className={cn(
                          "block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                          selectedMaterial === mat
                            ? "bg-gold/10 text-gold-dark"
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
                  <h4 className="text-sm font-medium text-obsidian mb-3">Price Range</h4>
                  <div className="space-y-2">
                    {[
                      { label: "Under ₹10,000", range: [0, 10000] as [number, number] },
                      { label: "₹10,000 - ₹50,000", range: [10000, 50000] as [number, number] },
                      { label: "₹50,000 - ₹1,00,000", range: [50000, 100000] as [number, number] },
                      { label: "Above ₹1,00,000", range: [100000, 500000] as [number, number] },
                    ].map((option) => (
                      <button
                        key={option.label}
                        onClick={() => setPriceRange(option.range)}
                        className={cn(
                          "block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                          priceRange[0] === option.range[0] && priceRange[1] === option.range[1]
                            ? "bg-gold/10 text-gold-dark"
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
            {filteredProducts.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-5xl mb-4">🔍</p>
                <h3 className="font-heading text-xl text-obsidian mb-2">No products found</h3>
                <p className="text-sm text-neutral-400 mb-4">
                  Try adjusting your filters to find what you&apos;re looking for.
                </p>
                <button
                  onClick={clearFilters}
                  className="text-sm text-gold hover:text-gold-dark transition-colors underline underline-offset-4"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div
                className={cn(
                  "grid gap-4 md:gap-6",
                  gridCols === 2
                    ? "grid-cols-2"
                    : "grid-cols-2 md:grid-cols-3"
                )}
              >
                {filteredProducts.map((product, i) => (
                  <ProductCard key={product.id} product={product} index={i} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
