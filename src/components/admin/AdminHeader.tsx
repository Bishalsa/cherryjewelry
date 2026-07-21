"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Plus, Bell, Package, ShoppingCart, Users, FolderTree, X, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";

interface SearchResults {
  products: any[];
  orders: any[];
  customers: any[];
  categories: any[];
}

export default function AdminHeader() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/admin/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (data.success) {
          setResults(data);
          setIsOpen(true);
        }
      } catch (err) {
        console.error("Global admin search error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const hasResults =
    results &&
    (results.products.length > 0 ||
      results.orders.length > 0 ||
      results.customers.length > 0 ||
      results.categories.length > 0);

  return (
    <header className="h-16 bg-white border-b border-neutral-100 px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Global Search Bar */}
      <div className="relative w-full max-w-md" ref={searchRef}>
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.length >= 2 && setIsOpen(true)}
            placeholder="Search products, orders, customers, collections..."
            className="w-full pl-10 pr-9 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:border-rose-gold focus:bg-white transition-all text-deep-plum placeholder-neutral-400"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-neutral-400 hover:text-neutral-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Global Search Results Dropdown */}
        {isOpen && results && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-neutral-100 rounded-2xl shadow-luxury overflow-hidden max-h-96 overflow-y-auto z-50 p-2">
            {!hasResults ? (
              <div className="p-4 text-center text-xs text-neutral-400">
                No results matching "{query}"
              </div>
            ) : (
              <div className="space-y-3">
                {/* Products */}
                {results.products.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-rose-gold-dark px-2 mb-1">
                      <Package className="w-3 h-3" /> Products
                    </div>
                    {results.products.map((p) => (
                      <Link
                        key={p.id}
                        href="/admin/products"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-neutral-50 text-xs transition-colors"
                      >
                        <span className="font-medium text-deep-plum truncate">{p.name}</span>
                        <span className="text-neutral-400 text-[10px]">{formatPrice(p.price)}</span>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Orders */}
                {results.orders.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-rose-gold-dark px-2 mb-1">
                      <ShoppingCart className="w-3 h-3" /> Orders
                    </div>
                    {results.orders.map((o) => (
                      <Link
                        key={o.id}
                        href="/admin/orders"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-neutral-50 text-xs transition-colors"
                      >
                        <span className="font-medium text-deep-plum">{o.orderNumber}</span>
                        <span className="text-neutral-400 text-[10px]">{formatPrice(o.total)}</span>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Customers */}
                {results.customers.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-rose-gold-dark px-2 mb-1">
                      <Users className="w-3 h-3" /> Customers
                    </div>
                    {results.customers.map((c) => (
                      <Link
                        key={c.id}
                        href="/admin/customers"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-neutral-50 text-xs transition-colors"
                      >
                        <span className="font-medium text-deep-plum">{c.name}</span>
                        <span className="text-neutral-400 text-[10px]">{c.email}</span>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Categories */}
                {results.categories.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-rose-gold-dark px-2 mb-1">
                      <FolderTree className="w-3 h-3" /> Collections
                    </div>
                    {results.categories.map((cat) => (
                      <Link
                        key={cat.id}
                        href="/admin/collections"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-neutral-50 text-xs transition-colors"
                      >
                        <span className="font-medium text-deep-plum">{cat.name}</span>
                        <span className="text-neutral-400 text-[10px]">/{cat.slug}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Header Controls */}
      <div className="flex items-center gap-3">
        <Link
          href="/"
          target="_blank"
          className="hidden sm:inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-rose-gold transition-colors px-3 py-1.5 border border-neutral-200 rounded-xl"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          View Storefront
        </Link>

        <Link
          href="/admin/products"
          className="inline-flex items-center gap-1.5 bg-deep-plum text-white px-3.5 py-1.5 rounded-xl text-xs font-medium hover:bg-deep-plum-dark transition-colors shadow-sm cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Product
        </Link>
      </div>
    </header>
  );
}
