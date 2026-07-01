"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, ShoppingBag, Star, Eye } from "lucide-react";
import { cn, formatPrice, getDiscountPercentage } from "@/lib/utils";
import { useCartStore } from "@/stores/cart-store";
import { useWishlistStore } from "@/stores/wishlist-store";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const { toggleItem, isInWishlist } = useWishlistStore();
  const wishlisted = isInWishlist(product.id);

  const discount =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? getDiscountPercentage(product.compareAtPrice, product.price)
      : 0;

  const firstVariant = product.variants?.[0] || null;
  const totalStock = product.variants?.reduce((sum, v) => sum + v.stock, 0) ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="group relative"
    >
      <div className="card-hover rounded-xl overflow-hidden bg-white">
        {/* Image Container */}
        <Link
          href={`/products/${product.slug}`}
          className="block relative aspect-[4/5] bg-gradient-to-b from-neutral-50 to-neutral-100 overflow-hidden"
        >
          {/* Placeholder gradient for products without images */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-6xl opacity-20 group-hover:scale-110 transition-transform duration-700">
              💎
            </span>
          </div>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            {product.isNewArrival && (
              <span className="px-2.5 py-1 bg-obsidian text-white text-[10px] uppercase tracking-wider rounded-full font-medium">
                New
              </span>
            )}
            {discount > 0 && (
              <span className="px-2.5 py-1 bg-rose-gold text-white text-[10px] uppercase tracking-wider rounded-full font-medium">
                -{discount}%
              </span>
            )}
            {totalStock > 0 && totalStock <= 5 && (
              <span className="px-2.5 py-1 bg-warning/90 text-white text-[10px] uppercase tracking-wider rounded-full font-medium">
                Few Left
              </span>
            )}
          </div>

          {/* Quick Actions Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
          <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-400">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                addItem(product, firstVariant);
              }}
              className="flex-1 flex items-center justify-center gap-2 bg-white/95 backdrop-blur-sm text-obsidian py-2.5 rounded-lg text-xs font-medium hover:bg-obsidian hover:text-white transition-colors shadow-lg"
              aria-label={`Add ${product.name} to cart`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              Add to Bag
            </button>
            <Link
              href={`/products/${product.slug}`}
              onClick={(e) => e.stopPropagation()}
              className="p-2.5 bg-white/95 backdrop-blur-sm rounded-lg hover:bg-obsidian hover:text-white transition-colors shadow-lg"
              aria-label={`Quick view ${product.name}`}
            >
              <Eye className="w-3.5 h-3.5" />
            </Link>
          </div>
        </Link>

        {/* Wishlist Button */}
        <button
          onClick={() => toggleItem(product.id)}
          className={cn(
            "absolute top-3 right-3 p-2 rounded-full transition-all duration-300 z-10",
            wishlisted
              ? "bg-rose-gold/10 text-rose-gold"
              : "bg-white/80 backdrop-blur-sm text-neutral-400 hover:text-rose-gold opacity-0 group-hover:opacity-100"
          )}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            className={cn("w-4 h-4", wishlisted && "fill-current")}
          />
        </button>

        {/* Product Info */}
        <div className="p-4">
          {/* Category */}
          <p className="text-[10px] uppercase tracking-wider text-neutral-400 mb-1">
            {product.material}
          </p>

          {/* Name */}
          <Link href={`/products/${product.slug}`}>
            <h3 className="text-sm font-medium text-obsidian group-hover:text-gold-dark transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>

          {/* Rating */}
          {product.reviewCount > 0 && (
            <div className="flex items-center gap-1 mt-1.5">
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "w-3 h-3",
                      i < Math.round(product.averageRating)
                        ? "text-gold fill-gold"
                        : "text-neutral-200"
                    )}
                  />
                ))}
              </div>
              <span className="text-[10px] text-neutral-400">
                ({product.reviewCount})
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-2 mt-2">
            <span className="font-semibold text-sm text-obsidian">
              {formatPrice(product.price)}
            </span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-xs text-neutral-400 line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
