"use client";

import { motion } from "framer-motion";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import Link from "next/link";
import { useWishlistStore } from "@/stores/wishlist-store";
import { useCartStore } from "@/stores/cart-store";
import { sampleProducts } from "@/lib/sample-data";
import { formatPrice } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants";

export default function WishlistPage() {
  const { items, removeItem } = useWishlistStore();
  const addItem = useCartStore((s) => s.addItem);

  const wishlistProducts = sampleProducts.filter((p) => items.includes(p.id));

  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-b from-champagne-light to-ivory py-16">
        <div className="container-luxury text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Heart className="w-8 h-8 text-rose-gold mx-auto mb-4" />
            <h1 className="font-heading text-3xl md:text-4xl text-obsidian">Your Wishlist</h1>
            <p className="text-neutral-400 mt-2 text-sm">{items.length} saved items</p>
          </motion.div>
        </div>
      </section>

      <div className="container-luxury py-12">
        {wishlistProducts.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="w-16 h-16 text-neutral-200 mx-auto mb-4" />
            <h3 className="font-heading text-xl text-obsidian mb-2">Your wishlist is empty</h3>
            <p className="text-sm text-neutral-400 mb-6">
              Save your favorite pieces to revisit them later.
            </p>
            <Link href="/collections" className="inline-flex items-center gap-2 bg-obsidian text-white px-6 py-3 rounded-full text-sm hover:bg-neutral-800 transition-colors">
              Explore Collections
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistProducts.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-4 p-4 bg-white rounded-xl border border-neutral-100 card-hover"
              >
                <Link href={`/products/${product.slug}`} className="w-24 h-28 bg-neutral-100 rounded-lg flex items-center justify-center shrink-0">
                  <span className="text-3xl opacity-20">💎</span>
                </Link>
                <div className="flex-1 min-w-0">
                  <Link href={`/products/${product.slug}`}>
                    <h3 className="text-sm font-medium text-obsidian hover:text-gold-dark transition-colors truncate">{product.name}</h3>
                  </Link>
                  <p className="text-xs text-neutral-400 mt-0.5">{product.material}</p>
                  <p className="text-sm font-semibold text-gold-dark mt-2">{formatPrice(product.price)}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() => {
                        addItem(product, product.variants[0] || null);
                        removeItem(product.id);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-obsidian text-white rounded-full text-xs hover:bg-neutral-800 transition-colors"
                    >
                      <ShoppingBag className="w-3 h-3" />
                      Move to Bag
                    </button>
                    <button
                      onClick={() => removeItem(product.id)}
                      className="p-1.5 text-neutral-300 hover:text-destructive rounded-full hover:bg-neutral-50 transition-colors"
                      aria-label="Remove from wishlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
