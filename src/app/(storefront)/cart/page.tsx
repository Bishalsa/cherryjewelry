"use client";

// ============================================
// Cherry Jewelry — Cart Page (/cart)
//
// Dedicated page for cart review.
// - Reuses existing cart store (Zustand) — no
//   duplicate state management.
// - CartDrawer remains available via Navbar.
// - This page exists for: deep links, SEO,
//   browser history, better mobile checkout flow.
// ============================================

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  Gift,
  Tag,
  Truck,
  Shield,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { formatPrice } from "@/lib/utils";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_COST } from "@/lib/constants";

// ─────────────────────────────────────────────────────────────────────────────

export default function CartPage() {
  const {
    items,
    removeItem,
    updateQuantity,
    getSubtotal,
    getItemCount,
    getShipping,
    giftNote,
    setGiftNote,
  } = useCartStore();

  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [showGiftNote, setShowGiftNote] = useState(false);

  const subtotal = getSubtotal();
  const shipping = getShipping();
  const total = subtotal + shipping;
  const freeShippingProgress = Math.min(
    (subtotal / FREE_SHIPPING_THRESHOLD) * 100,
    100
  );
  const amountNeeded = FREE_SHIPPING_THRESHOLD - subtotal;

  // ── Empty state ────────────────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
          >
            <ShoppingBag className="w-20 h-20 text-neutral-200 mx-auto mb-6" />
          </motion.div>
          <h1 className="font-heading text-2xl md:text-3xl text-deep-plum mb-3">
            Your bag is empty
          </h1>
          <p className="text-sm text-neutral-400 mb-8 leading-relaxed">
            Discover our exquisite handcrafted jewelry — something beautiful is
            waiting for you.
          </p>
          <Link
            href="/collections"
            className="inline-flex items-center gap-2 bg-deep-plum text-white px-8 py-3.5 rounded-full text-sm font-medium hover:bg-deep-plum-dark transition-colors btn-glow"
          >
            Explore Collections
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  // ── Filled cart ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-neutral-50/40">
      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-b from-soft-pink/20 to-ivory border-b border-neutral-100">
        <div className="container-luxury py-8">
          <Link
            href="/collections"
            className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-rose-gold transition-colors mb-4"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Continue Shopping
          </Link>
          <h1 className="font-heading text-2xl md:text-3xl text-deep-plum">
            Your Bag
            <span className="ml-3 text-base font-sans font-normal text-neutral-400">
              ({getItemCount()} {getItemCount() === 1 ? "item" : "items"})
            </span>
          </h1>
        </div>
      </section>

      {/* ── Free Shipping Progress ──────────────────────────────────────── */}
      {amountNeeded > 0 && (
        <div className="bg-soft-pink/20 border-b border-soft-pink/30">
          <div className="container-luxury py-3">
            <div className="flex items-center gap-4">
              <Truck className="w-4 h-4 text-rose-gold-dark flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-neutral-600 mb-1.5">
                  Add{" "}
                  <span className="font-semibold text-rose-gold-dark">
                    {formatPrice(amountNeeded)}
                  </span>{" "}
                  more for free shipping!
                </p>
                <div className="w-full h-1.5 bg-white rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-rose-gold to-cherry-ruby rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${freeShippingProgress}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Main Layout ─────────────────────────────────────────────────── */}
      <div className="container-luxury py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">

          {/* ── Cart Items ─────────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-3">
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 80, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-2xl p-4 md:p-5 border border-neutral-100 shadow-sm"
                >
                  <div className="flex gap-4">
                    {/* Thumbnail */}
                    <Link
                      href={`/products/${item.product.slug}`}
                      className="w-20 h-24 md:w-24 md:h-28 bg-gradient-to-b from-neutral-50 to-neutral-100 rounded-xl overflow-hidden shrink-0 relative hover:opacity-90 transition-opacity"
                    >
                      {item.product.images?.[0]?.url ? (
                        <Image
                          src={item.product.images[0].url}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                          sizes="96px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">
                          💎
                        </div>
                      )}
                    </Link>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <Link href={`/products/${item.product.slug}`}>
                            <h3 className="text-sm md:text-base font-medium text-deep-plum hover:text-rose-gold transition-colors line-clamp-2 leading-snug">
                              {item.product.name}
                            </h3>
                          </Link>
                          {item.variant && (
                            <p className="text-xs text-neutral-400 mt-0.5">
                              {item.variant.name}
                            </p>
                          )}
                          <p className="text-xs text-neutral-400 mt-0.5">
                            {item.product.material}
                          </p>
                        </div>
                        {/* Remove */}
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-2 text-neutral-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Price + Quantity row */}
                      <div className="flex items-center justify-between mt-3">
                        <p className="text-base font-semibold text-rose-gold-dark">
                          {formatPrice(item.price)}
                        </p>

                        {/* Quantity controls */}
                        <div className="flex items-center border border-neutral-200 rounded-full overflow-hidden">
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            disabled={item.quantity <= 1}
                            className="w-10 h-10 flex items-center justify-center hover:bg-neutral-50 disabled:opacity-30 transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium select-none">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            className="w-10 h-10 flex items-center justify-center hover:bg-neutral-50 transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Line total */}
                      <p className="text-xs text-neutral-400 mt-1 text-right">
                        Subtotal: {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* ── Gift Note ─────────────────────────────────────────────── */}
            <div className="bg-white rounded-2xl p-4 md:p-5 border border-neutral-100">
              <button
                onClick={() => setShowGiftNote(!showGiftNote)}
                className="flex items-center gap-2 text-sm text-neutral-500 hover:text-rose-gold transition-colors w-full text-left min-h-[44px]"
              >
                <Gift className="w-4 h-4 text-rose-gold" />
                <span>{showGiftNote ? "Hide gift note" : "Add a gift note"}</span>
              </button>
              <AnimatePresence>
                {showGiftNote && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <textarea
                      value={giftNote || ""}
                      onChange={(e) => setGiftNote(e.target.value)}
                      placeholder="Write your gift message here... 🎁"
                      rows={3}
                      className="w-full mt-3 p-3 border border-neutral-200 rounded-xl text-sm resize-none focus:outline-none focus:border-rose-gold transition-colors"
                    />
                    <p className="text-xs text-neutral-400 mt-1">
                      Your message will be included in the package.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── Coupon ─────────────────────────────────────────────────── */}
            <div className="bg-white rounded-2xl p-4 md:p-5 border border-neutral-100">
              <p className="flex items-center gap-2 text-sm font-medium text-neutral-600 mb-3">
                <Tag className="w-4 h-4 text-rose-gold" />
                Coupon Code
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                  placeholder="Enter coupon code (e.g. CHERRY20)"
                  className="flex-1 px-4 py-3 border border-neutral-200 rounded-full text-sm focus:outline-none focus:border-rose-gold transition-colors"
                  aria-label="Coupon code"
                />
                <button
                  onClick={() => coupon && setCouponApplied(!couponApplied)}
                  className="px-5 py-3 bg-deep-plum text-white rounded-full text-sm font-medium hover:bg-deep-plum-dark transition-colors whitespace-nowrap"
                >
                  Apply
                </button>
              </div>
              {couponApplied && (
                <p className="text-xs text-green-600 mt-2">
                  ✓ Coupon applied! Discount will reflect at checkout.
                </p>
              )}
            </div>

            {/* ── Trust badges (mobile) ──────────────────────────────────── */}
            <div className="grid grid-cols-3 gap-3 lg:hidden">
              {[
                { icon: Truck, label: "Free Shipping", sub: "Above ₹999" },
                { icon: Shield, label: "BIS Hallmarked", sub: "Certified" },
                { icon: RefreshCw, label: "15-Day Returns", sub: "Easy" },
              ].map(({ icon: Icon, label, sub }) => (
                <div
                  key={label}
                  className="text-center p-3 bg-white rounded-xl border border-neutral-100"
                >
                  <Icon className="w-4 h-4 text-rose-gold mx-auto mb-1" />
                  <p className="text-[10px] font-medium text-deep-plum leading-tight">
                    {label}
                  </p>
                  <p className="text-[9px] text-neutral-400">{sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Order Summary Sidebar ────────────────────────────────────── */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm sticky top-24 overflow-hidden">
              <div className="p-5 md:p-6">
                <h2 className="font-heading text-lg text-deep-plum mb-5">
                  Order Summary
                </h2>

                {/* Line items summary */}
                <div className="space-y-2.5 mb-5">
                  <div className="flex justify-between text-sm text-neutral-500">
                    <span>
                      Subtotal ({getItemCount()}{" "}
                      {getItemCount() === 1 ? "item" : "items"})
                    </span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-neutral-500">
                    <span>Shipping</span>
                    <span>
                      {shipping === 0 ? (
                        <span className="text-green-600 font-medium">Free</span>
                      ) : (
                        formatPrice(shipping)
                      )}
                    </span>
                  </div>
                  {shipping > 0 && (
                    <p className="text-xs text-neutral-400">
                      Add {formatPrice(amountNeeded)} more for free shipping
                    </p>
                  )}
                </div>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-rose-gold/30 to-transparent my-4" />

                {/* Total */}
                <div className="flex justify-between items-baseline mb-5">
                  <span className="font-semibold text-deep-plum">Total</span>
                  <span className="font-heading text-xl text-rose-gold-dark">
                    {formatPrice(total)}
                  </span>
                </div>

                <p className="text-[11px] text-neutral-400 text-center mb-5">
                  Tax included · Secure checkout · Free gift wrap
                </p>

                {/* CTA */}
                <Link
                  href="/checkout"
                  className="block w-full text-center py-4 bg-deep-plum text-white rounded-full font-medium text-sm hover:bg-deep-plum-dark transition-all duration-300 btn-glow"
                >
                  Proceed to Checkout
                </Link>

                <Link
                  href="/collections"
                  className="block w-full text-center py-3 mt-2 text-sm text-neutral-400 hover:text-rose-gold transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>

              {/* Trust badges (desktop) */}
              <div className="border-t border-neutral-100 p-5 hidden lg:block">
                <div className="space-y-3">
                  {[
                    { icon: Shield, label: "BIS Hallmarked", sub: "100% certified gold & diamonds" },
                    { icon: Truck, label: "Free Shipping", sub: "On orders above ₹999" },
                    { icon: RefreshCw, label: "15-Day Returns", sub: "No questions asked" },
                  ].map(({ icon: Icon, label, sub }) => (
                    <div key={label} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-soft-pink flex items-center justify-center flex-shrink-0">
                        <Icon className="w-3.5 h-3.5 text-rose-gold-dark" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-deep-plum">
                          {label}
                        </p>
                        <p className="text-[10px] text-neutral-400">{sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
