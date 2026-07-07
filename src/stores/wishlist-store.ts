"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WishlistStore {
  items: string[]; // Product IDs
  addItem: (productId: string) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  toggleItem: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
  syncFromDatabase: () => Promise<void>;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: async (productId) => {
        set((state) => ({
          items: state.items.includes(productId)
            ? state.items
            : [...state.items, productId],
        }));
        try {
          await fetch("/api/wishlist", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId }),
          });
        } catch (e) {
          console.warn("Local wishlist updated; database sync failed", e);
        }
      },

      removeItem: async (productId) => {
        set((state) => ({
          items: state.items.filter((id) => id !== productId),
        }));
        try {
          await fetch(`/api/wishlist?productId=${productId}`, {
            method: "DELETE",
          });
        } catch (e) {
          console.warn("Local wishlist updated; database sync failed", e);
        }
      },

      toggleItem: async (productId) => {
        const { items } = get();
        const exists = items.includes(productId);
        if (exists) {
          set({ items: items.filter((id) => id !== productId) });
          try {
            await fetch(`/api/wishlist?productId=${productId}`, {
              method: "DELETE",
            });
          } catch {}
        } else {
          set({ items: [...items, productId] });
          try {
            await fetch("/api/wishlist", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ productId }),
            });
          } catch {}
        }
      },

      isInWishlist: (productId) => {
        return get().items.includes(productId);
      },

      clearWishlist: () => set({ items: [] }),

      syncFromDatabase: async () => {
        try {
          const res = await fetch("/api/wishlist");
          const data = await res.json();
          if (res.ok && data.success && data.items) {
            const dbIds = data.items.map((item: any) => item.id);
            const localItems = get().items;
            const merged = Array.from(new Set([...localItems, ...dbIds]));
            set({ items: merged });

            // Send any local-only items to database
            const missingInDb = localItems.filter((id) => !dbIds.includes(id));
            for (const id of missingInDb) {
              await fetch("/api/wishlist", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ productId: id }),
              });
            }
          }
        } catch (err) {
          console.warn("Could not sync wishlist with database", err);
        }
      },
    }),
    {
      name: "cherry-wishlist",
    }
  )
);
