"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, Product, ProductVariant } from "@/types";

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  couponCode: string | null;
  giftNote: string | null;

  // Actions
  addItem: (product: Product, variant?: ProductVariant | null, quantity?: number) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  setCouponCode: (code: string | null) => void;
  setGiftNote: (note: string | null) => void;

  // Computed
  getSubtotal: () => number;
  getItemCount: () => number;
  getShipping: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      couponCode: null,
      giftNote: null,

      addItem: (product, variant, quantity = 1) => {
        set((state) => {
          const existingIndex = state.items.findIndex(
            (item) =>
              item.productId === product.id &&
              item.variantId === (variant?.id || null)
          );

          if (existingIndex > -1) {
            const newItems = [...state.items];
            newItems[existingIndex] = {
              ...newItems[existingIndex],
              quantity: newItems[existingIndex].quantity + quantity,
            };
            return { items: newItems, isOpen: true };
          }

          const newItem: CartItem = {
            id: `${product.id}-${variant?.id || "default"}-${Date.now()}`,
            productId: product.id,
            variantId: variant?.id || null,
            product,
            variant: variant || null,
            quantity,
            price: variant ? Number(variant.price) : Number(product.price),
          };

          return { items: [...state.items, newItem], isOpen: true };
        });
      },

      removeItem: (itemId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== itemId),
        }));
      },

      updateQuantity: (itemId, quantity) => {
        if (quantity < 1) return;
        set((state) => ({
          items: state.items.map((item) =>
            item.id === itemId ? { ...item, quantity } : item
          ),
        }));
      },

      clearCart: () => {
        set({ items: [], couponCode: null, giftNote: null });
      },

      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      setCouponCode: (code) => set({ couponCode: code }),
      setGiftNote: (note) => set({ giftNote: note }),

      getSubtotal: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },

      getShipping: () => {
        const subtotal = get().getSubtotal();
        return subtotal >= 999 ? 0 : 99;
      },
    }),
    {
      name: "cherry-cart",
      partialize: (state) => ({
        items: state.items,
        couponCode: state.couponCode,
        giftNote: state.giftNote,
      }),
    }
  )
);
