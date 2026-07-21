"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Home, Search, ShoppingBag, Heart, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/stores/cart-store";
import { useWishlistStore } from "@/stores/wishlist-store";

const NAV_ITEMS = [
  { icon: Home, label: "Home", href: "/" },
  { icon: Search, label: "Search", href: "/search" },
  { icon: ShoppingBag, label: "Cart", href: "/cart", isCart: true },
  { icon: Heart, label: "Wishlist", href: "/wishlist", isWishlist: true },
  { icon: User, label: "Account", href: "/account" },
] as const;

export default function MobileBottomNav() {
  const pathname = usePathname();
  const cartItemCount = useCartStore((s) => s.getItemCount());
  const openCart = useCartStore((s) => s.openCart);
  const wishlistCount = useWishlistStore((s) => s.items.length);

  // Don't show on admin pages or checkout
  if (pathname.startsWith("/admin") || pathname.startsWith("/checkout")) {
    return null;
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-[90] md:hidden bg-white/98 border-t border-neutral-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] backdrop-blur-md"
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-around h-16 px-2">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;

          const handleClick = () => {
            if ("isCart" in item && item.isCart) {
              openCart();
            }
          };

          const content = (
            <motion.div
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-xl transition-colors relative",
                isActive ? "text-rose-gold font-bold" : "text-neutral-700 font-medium hover:text-deep-plum"
              )}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {/* Cart Badge */}
                {"isCart" in item && item.isCart && cartItemCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-rose-gold text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                    {cartItemCount > 9 ? "9+" : cartItemCount}
                  </span>
                )}
                {/* Wishlist Badge */}
                {"isWishlist" in item && item.isWishlist && wishlistCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-rose-gold text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                    {wishlistCount > 9 ? "9+" : wishlistCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] tracking-tight">{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="mobile-nav-indicator"
                  className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-rose-gold rounded-full"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </motion.div>
          );

          if ("isCart" in item && item.isCart) {
            return (
              <button
                key={item.label}
                onClick={handleClick}
                className="outline-none"
                aria-label={item.label}
              >
                {content}
              </button>
            );
          }

          return (
            <Link key={item.label} href={item.href} aria-label={item.label}>
              {content}
            </Link>
          );
        })}
      </div>
      {/* Safe area spacer for phones with home indicator */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
