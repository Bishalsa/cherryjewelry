"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, Gift } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { formatPrice } from "@/lib/utils";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_COST } from "@/lib/constants";
import { useState } from "react";

export default function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    getSubtotal,
    getItemCount,
    getShipping,
    clearCart,
    giftNote,
    setGiftNote,
  } = useCartStore();

  const [showGiftNote, setShowGiftNote] = useState(false);
  const subtotal = getSubtotal();
  const shipping = getShipping();
  const total = subtotal + shipping;
  const freeShippingProgress = Math.min(
    (subtotal / FREE_SHIPPING_THRESHOLD) * 100,
    100
  );
  const amountToFreeShipping = FREE_SHIPPING_THRESHOLD - subtotal;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[200] backdrop-blur-sm"
            onClick={closeCart}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-[201] flex flex-col shadow-2xl border-l border-neutral-200 h-dvh max-h-dvh"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-neutral-200 bg-white">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-rose-gold-dark" />
                <h2 className="font-heading text-lg text-deep-plum font-semibold">
                  Your Bag ({getItemCount()})
                </h2>
              </div>
              <button
                onClick={closeCart}
                className="p-2 hover:bg-neutral-100 rounded-full transition-colors text-deep-plum"
                aria-label="Close cart"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Free Shipping Progress */}
            {subtotal > 0 && (
              <div className="px-4 py-3 bg-soft-pink/30 border-b border-rose-gold/20">
                {amountToFreeShipping > 0 ? (
                  <p className="text-xs text-neutral-800 mb-2 font-medium">
                    Add <span className="font-bold text-rose-gold-dark">{formatPrice(amountToFreeShipping)}</span> more for free shipping!
                  </p>
                ) : (
                  <p className="text-xs text-success font-semibold mb-2">
                    🎉 You've unlocked free shipping!
                  </p>
                )}
                <div className="w-full h-2 bg-white rounded-full overflow-hidden border border-rose-gold/20">
                  <motion.div
                    className="h-full bg-gradient-to-r from-rose-gold to-cherry-ruby rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${freeShippingProgress}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </div>
              </div>
            )}

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto bg-white">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.1 }}
                  >
                    <ShoppingBag className="w-16 h-16 text-neutral-300 mb-4" />
                  </motion.div>
                  <h3 className="font-heading text-xl text-deep-plum mb-2">Your bag is empty</h3>
                  <p className="text-sm text-neutral-600 mb-6 max-w-xs">
                    Discover our exquisite collection and add something special
                  </p>
                  <Link
                    href="/collections/new-arrivals"
                    onClick={closeCart}
                    className="inline-flex items-center gap-2 bg-deep-plum text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-deep-plum-dark transition-colors shadow-sm"
                  >
                    Shop New Arrivals
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ) : (
                <div className="p-4 space-y-4">
                  <AnimatePresence>
                    {items.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 100 }}
                        className="flex gap-4 py-4 border-b border-neutral-200 last:border-0"
                      >
                        {/* Image */}
                        <div className="w-20 h-24 bg-neutral-100 border border-neutral-200 rounded-lg overflow-hidden shrink-0 relative">
                          {item.product.images?.[0]?.url ? (
                            <Image
                              src={item.product.images[0].url}
                              alt={item.product.name}
                              fill
                              className="object-cover"
                              sizes="80px"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl">
                              💎
                            </div>
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-deep-plum truncate">
                            {item.product.name}
                          </h4>
                          {item.variant && (
                            <p className="text-xs text-neutral-600 font-medium mt-0.5">
                              {item.variant.name}
                            </p>
                          )}
                          <p className="text-sm font-bold text-rose-gold-dark mt-1">
                            {formatPrice(item.price)}
                          </p>

                          {/* Quantity Controls */}
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center border border-neutral-300 rounded-full bg-neutral-50">
                              <button
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity - 1)
                                }
                                disabled={item.quantity <= 1}
                                className="p-1.5 hover:bg-neutral-200 rounded-full disabled:opacity-30 transition-colors text-deep-plum"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-8 text-center text-sm font-semibold text-deep-plum">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity + 1)
                                }
                                className="p-1.5 hover:bg-neutral-200 rounded-full transition-colors text-deep-plum"
                                aria-label="Increase quantity"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            <button
                              onClick={() => removeItem(item.id)}
                              className="p-1.5 text-neutral-500 hover:text-destructive transition-colors"
                              aria-label="Remove item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Gift Note */}
                  <div className="pt-2">
                    <button
                      onClick={() => setShowGiftNote(!showGiftNote)}
                      className="flex items-center gap-2 text-sm font-medium text-neutral-700 hover:text-rose-gold transition-colors"
                    >
                      <Gift className="w-4 h-4 text-rose-gold-dark" />
                      {showGiftNote ? "Hide gift note" : "Add a gift note"}
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
                            placeholder="Write your gift message..."
                            className="w-full mt-3 p-3 border border-neutral-300 rounded-xl text-sm font-medium text-deep-plum resize-none h-20 focus:outline-none focus:border-rose-gold focus:ring-2 focus:ring-rose-gold/20 transition-all placeholder:text-neutral-500"
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Summary */}
            {items.length > 0 && (
              <div className="border-t border-neutral-200 p-4 space-y-3 bg-neutral-50">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-neutral-700 font-medium">
                    <span>Subtotal</span>
                    <span className="font-semibold text-deep-plum">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-neutral-700 font-medium">
                    <span>Shipping</span>
                    <span>
                      {shipping === 0 ? (
                        <span className="text-success font-bold">Free</span>
                      ) : (
                        formatPrice(shipping)
                      )}
                    </span>
                  </div>
                  <div className="divider-rose-gold my-2" />
                  <div className="flex justify-between font-bold text-base text-deep-plum">
                    <span>Total</span>
                    <span className="text-rose-gold-dark text-lg">{formatPrice(total)}</span>
                  </div>
                </div>

                <p className="text-[11px] text-neutral-600 text-center font-medium">
                  Tax included. Free shipping calculated at checkout.
                </p>

                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="block w-full bg-deep-plum text-white text-center py-3.5 rounded-full font-semibold text-sm hover:bg-deep-plum-dark transition-colors shadow-md btn-glow"
                >
                  Proceed to Checkout
                </Link>

                <button
                  onClick={closeCart}
                  className="block w-full text-center py-2 text-sm font-semibold text-neutral-700 hover:text-deep-plum transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
