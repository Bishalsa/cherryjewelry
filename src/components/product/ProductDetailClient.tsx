"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Heart,
  ShoppingBag,
  Star,
  Truck,
  Shield,
  RefreshCw,
  Minus,
  Plus,
  Share2,
  Check,
} from "lucide-react";
import { cn, formatPrice, getDiscountPercentage } from "@/lib/utils";
import { useCartStore } from "@/stores/cart-store";
import { useWishlistStore } from "@/stores/wishlist-store";
import ProductCard from "@/components/product/ProductCard";
import type { Product, ProductVariant } from "@/types";

interface ProductDetailClientProps {
  product: Product;
  relatedProducts: Product[];
}

export default function ProductDetailClient({
  product,
  relatedProducts,
}: ProductDetailClientProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.variants[0] || null
  );
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [addedToCart, setAddedToCart] = useState(false);

  const addItem = useCartStore((s) => s.addItem);
  const { toggleItem, isInWishlist } = useWishlistStore();
  const wishlisted = isInWishlist(product.id);

  const currentPrice = selectedVariant
    ? Number(selectedVariant.price)
    : product.price;
  const comparePrice = selectedVariant
    ? selectedVariant.compareAtPrice
      ? Number(selectedVariant.compareAtPrice)
      : null
    : product.compareAtPrice;
  const discount = comparePrice
    ? getDiscountPercentage(comparePrice, currentPrice)
    : 0;
  const currentStock = selectedVariant?.stock ?? 0;

  const handleAddToCart = () => {
    addItem(product, selectedVariant, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const tabs = [
    { id: "description", label: "Description" },
    { id: "specs", label: "Specifications" },
    { id: "shipping", label: "Shipping & Returns" },
    { id: "care", label: "Care Guide" },
  ];

  return (
    <>
      {/* Product Section */}
      <section className="container-luxury pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {/* Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="aspect-[4/5] bg-gradient-to-b from-neutral-50 to-neutral-100 rounded-2xl overflow-hidden relative group">
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.span
                  className="text-8xl md:text-9xl opacity-20"
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring" }}
                >
                  💎
                </motion.span>
              </div>
              {/* Badges */}
              {product.isNewArrival && (
                <span className="absolute top-4 left-4 px-3 py-1 bg-deep-plum text-white text-xs uppercase tracking-wider rounded-full">
                  New
                </span>
              )}
              {discount > 0 && (
                <span className="absolute top-4 right-4 px-3 py-1 bg-rose-gold text-white text-xs uppercase tracking-wider rounded-full">
                  -{discount}%
                </span>
              )}
            </div>
            {/* Thumbnail strip */}
            <div className="flex gap-2 mt-3">
              {[1, 2, 3, 4].map((i) => (
                <button
                  key={i}
                  className={cn(
                    "w-16 h-20 rounded-lg bg-neutral-100 flex items-center justify-center border-2 transition-colors",
                    i === 1
                      ? "border-rose-gold"
                      : "border-transparent hover:border-neutral-200"
                  )}
                >
                  <span className="text-xl opacity-20">💎</span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-col"
          >
            {/* Category & SKU */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs tracking-[0.2em] uppercase text-rose-gold-dark font-medium">
                {product.material}
              </span>
              <span className="text-xs text-neutral-300">
                SKU: {product.sku}
              </span>
            </div>

            {/* Name */}
            <h1 className="font-heading text-2xl md:text-3xl lg:text-4xl text-deep-plum mb-3">
              {product.name}
            </h1>

            {/* Rating */}
            {product.reviewCount > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "w-4 h-4",
                        i < Math.round(product.averageRating)
                          ? "text-rose-gold fill-rose-gold"
                          : "text-neutral-200"
                      )}
                    />
                  ))}
                </div>
                <span className="text-sm text-neutral-400">
                  {product.averageRating} ({product.reviewCount} reviews)
                </span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-end gap-3 mb-6">
              <motion.span
                key={currentPrice}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl md:text-3xl font-heading text-deep-plum"
              >
                {formatPrice(currentPrice)}
              </motion.span>
              {comparePrice && (
                <span className="text-lg text-neutral-400 line-through mb-0.5">
                  {formatPrice(comparePrice)}
                </span>
              )}
              {discount > 0 && (
                <span className="px-2 py-0.5 bg-success/10 text-success text-xs font-medium rounded-full mb-1">
                  Save {discount}%
                </span>
              )}
            </div>

            {/* Short Description */}
            <p className="text-sm text-neutral-500 leading-relaxed mb-6">
              {product.shortDescription}
            </p>

            <div className="h-px bg-gradient-to-r from-transparent via-rose-gold/30 to-transparent my-6" />

            {/* Variants */}
            {product.variants.length > 1 && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-deep-plum mb-3">
                  Size / Variant
                </h4>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => {
                        setSelectedVariant(variant);
                        setQuantity(1);
                      }}
                      disabled={variant.stock === 0}
                      className={cn(
                        "px-4 py-3 border rounded-lg text-sm transition-all min-h-[44px]",
                        selectedVariant?.id === variant.id
                          ? "border-rose-gold bg-rose-gold/5 text-rose-gold-dark"
                          : variant.stock === 0
                          ? "border-neutral-100 text-neutral-300 cursor-not-allowed"
                          : "border-neutral-200 hover:border-rose-gold/50 text-neutral-600"
                      )}
                    >
                      {variant.name}
                      {variant.stock === 0 && " (Sold out)"}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stock */}
            {currentStock > 0 && currentStock <= 5 && (
              <p className="text-sm text-warning mb-4 flex items-center gap-1">
                🔥 Only {currentStock} left in stock — order soon!
              </p>
            )}

            {/* Quantity + Add to Cart */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              {/* Quantity */}
              <div className="flex items-center border border-neutral-200 rounded-full">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 hover:bg-neutral-50 rounded-full transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-medium">
                  {quantity}
                </span>
                <button
                  onClick={() =>
                    setQuantity(Math.min(currentStock || 99, quantity + 1))
                  }
                  className="p-3 hover:bg-neutral-50 rounded-full transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Add to Cart */}
              <button
                onClick={handleAddToCart}
                disabled={currentStock === 0}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-3.5 rounded-full text-sm font-medium transition-all duration-300 btn-glow",
                  addedToCart
                    ? "bg-success text-white"
                    : currentStock === 0
                    ? "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                    : "bg-deep-plum text-white hover:bg-deep-plum-dark"
                )}
              >
                {addedToCart ? (
                  <>
                    <Check className="w-4 h-4" />
                    Added to Bag!
                  </>
                ) : currentStock === 0 ? (
                  "Sold Out"
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    Add to Bag — {formatPrice(currentPrice * quantity)}
                  </>
                )}
              </button>

              {/* Wishlist */}
              <button
                onClick={() => toggleItem(product.id)}
                className={cn(
                  "p-3.5 border rounded-full transition-all",
                  wishlisted
                    ? "border-rose-gold bg-rose-gold/5 text-rose-gold"
                    : "border-neutral-200 text-neutral-400 hover:border-rose-gold hover:text-rose-gold"
                )}
                aria-label={
                  wishlisted ? "Remove from wishlist" : "Add to wishlist"
                }
              >
                <Heart
                  className={cn("w-5 h-5", wishlisted && "fill-current")}
                />
              </button>
            </div>

            {/* Trust indicators */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { icon: Truck, label: "Free Shipping", sub: "Above ₹999" },
                { icon: Shield, label: "BIS Hallmarked", sub: "Certified" },
                {
                  icon: RefreshCw,
                  label: "15-Day Returns",
                  sub: "Easy refund",
                },
              ].map(({ icon: Icon, label, sub }) => (
                <div
                  key={label}
                  className="flex flex-col items-center text-center p-3 rounded-xl bg-neutral-50"
                >
                  <Icon className="w-4 h-4 text-rose-gold-dark mb-1" />
                  <span className="text-[10px] font-medium text-deep-plum">
                    {label}
                  </span>
                  <span className="text-[9px] text-neutral-400">{sub}</span>
                </div>
              ))}
            </div>

            {/* Share */}
            <button className="inline-flex items-center gap-2 text-xs text-neutral-400 hover:text-rose-gold transition-colors self-start">
              <Share2 className="w-3.5 h-3.5" />
              Share this product
            </button>
          </motion.div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16 md:mt-24">
          <div className="flex items-center gap-6 border-b border-neutral-200 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "pb-3 text-sm font-medium whitespace-nowrap transition-colors relative",
                  activeTab === tab.id
                    ? "text-deep-plum"
                    : "text-neutral-400 hover:text-neutral-600"
                )}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="product-tab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-gold"
                  />
                )}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="py-8 max-w-3xl"
            >
              {activeTab === "description" && (
                <div className="prose prose-sm max-w-none text-neutral-600 leading-relaxed">
                  <p>{product.description}</p>
                </div>
              )}
              {activeTab === "specs" && (
                <div className="space-y-3">
                  {[
                    { label: "Material", value: product.material },
                    { label: "Weight", value: product.weight || "—" },
                    { label: "Purity", value: product.purity || "—" },
                    { label: "SKU", value: product.sku },
                  ].map((spec) => (
                    <div
                      key={spec.label}
                      className="flex items-center py-2 border-b border-neutral-100"
                    >
                      <span className="text-sm text-neutral-400 w-32">
                        {spec.label}
                      </span>
                      <span className="text-sm text-deep-plum">
                        {spec.value}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              {activeTab === "shipping" && (
                <div className="text-sm text-neutral-600 space-y-4 leading-relaxed">
                  <p>
                    <strong>Free Shipping:</strong> We offer free shipping on
                    all orders above ₹999 across India.
                  </p>
                  <p>
                    <strong>Delivery Time:</strong> Standard delivery takes
                    5-7 business days. Express delivery (2-3 days) is
                    available at checkout.
                  </p>
                  <p>
                    <strong>Returns:</strong> We offer a 15-day hassle-free
                    return policy. Items must be in original condition with
                    all tags attached.
                  </p>
                  <p>
                    <strong>Exchanges:</strong> Lifetime exchange available
                    on all rose-gold jewelry.
                  </p>
                </div>
              )}
              {activeTab === "care" && (
                <div className="text-sm text-neutral-600 space-y-4 leading-relaxed">
                  <p>
                    <strong>Storage:</strong> Store your jewelry in the box
                    provided, away from moisture and direct sunlight.
                  </p>
                  <p>
                    <strong>Cleaning:</strong> Gently clean with a soft
                    cloth. For rose-gold jewelry, use warm soapy water and a soft
                    brush.
                  </p>
                  <p>
                    <strong>Avoid:</strong> Remove jewelry before swimming,
                    bathing, or using chemicals.
                  </p>
                  <p>
                    <strong>Professional Cleaning:</strong> We recommend
                    professional cleaning once a year for diamond jewelry.
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="font-heading text-2xl text-deep-plum mb-8 text-center">
              You May Also Like
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((rp, i) => (
                <ProductCard key={rp.id} product={rp} index={i} />
              ))}
            </div>
          </div>
        )}
      </section>
    </>
  );
}
