"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Heart,
  ShoppingBag,
  User,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_LINKS, APP_NAME } from "@/lib/constants";
import { useCartStore } from "@/stores/cart-store";
import { useWishlistStore } from "@/stores/wishlist-store";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const cartItemCount = useCartStore((s) => s.getItemCount());
  const openCart = useCartStore((s) => s.openCart);
  const wishlistCount = useWishlistStore((s) => s.items.length);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      {/* Announcement Bar */}
      <div className="bg-deep-plum text-ivory text-center py-2 px-4 text-xs tracking-widest uppercase">
        <span className="opacity-80">Free shipping on orders above ₹999</span>
        <span className="mx-2 text-rose-gold-light">✦</span>
        <span className="opacity-80">15-Day Easy Returns</span>
      </div>

      {/* Main Navbar */}
      <header
        className={cn(
          "sticky top-0 z-[100] w-full transition-all duration-300",
          isScrolled
            ? "bg-white/98 backdrop-blur-md shadow-md border-b border-neutral-200/60"
            : "bg-white border-b border-neutral-100"
        )}
      >
        <nav className="container-luxury" aria-label="Main navigation">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Left: Menu + Search (Mobile) | Navigation (Desktop) */}
            <div className="flex items-center gap-2 md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 hover:bg-neutral-100 rounded-full transition-colors text-deep-plum"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium tracking-wide text-neutral-700 hover:text-deep-plum transition-colors duration-300 relative group"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-[1.5px] bg-rose-gold transition-all duration-300 group-hover:w-full" />
                </Link>
              ))}
            </div>

            {/* Center: Logo */}
            <Link
              href="/"
              className="absolute left-1/2 -translate-x-1/2 md:relative md:left-auto md:translate-x-0 flex items-center gap-2 group"
            >
              <motion.div
                whileHover={{ scale: 1.05, rotate: 3 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="relative w-8 h-8 md:w-10 md:h-10 shrink-0"
              >
                <Image
                  src="/logo-emblem.png"
                  alt={APP_NAME}
                  fill
                  className="object-contain"
                  sizes="40px"
                  priority
                />
              </motion.div>
              <motion.h1
                className="font-heading text-xl md:text-2xl tracking-[0.18em] text-deep-plum font-semibold uppercase"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                {APP_NAME}
              </motion.h1>
            </Link>

            {/* Right: Actions */}
            <div className="flex items-center gap-1 md:gap-3">
              {/* Search */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 hover:bg-neutral-100 rounded-full transition-colors text-deep-plum"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Wishlist */}
              <Link
                href="/wishlist"
                className="p-2 hover:bg-neutral-100 rounded-full transition-colors relative hidden md:flex text-deep-plum"
                aria-label="Wishlist"
              >
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 bg-rose-gold text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm"
                  >
                    {wishlistCount}
                  </motion.span>
                )}
              </Link>

              {/* Account */}
              <Link
                href="/account"
                className="p-2 hover:bg-neutral-100 rounded-full transition-colors hidden md:flex text-deep-plum"
                aria-label="Account"
              >
                <User className="w-5 h-5" />
              </Link>

              {/* Cart */}
              <button
                onClick={openCart}
                className="p-2 hover:bg-neutral-100 rounded-full transition-colors relative text-deep-plum"
                aria-label="Cart"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartItemCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 bg-rose-gold text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm"
                  >
                    {cartItemCount > 9 ? "9+" : cartItemCount}
                  </motion.span>
                )}
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-[200] backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-[85%] max-w-sm bg-white z-[201] overflow-y-auto h-dvh max-h-dvh shadow-2xl flex flex-col"
            >
              <div className="p-6 flex-1">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-neutral-100">
                  <div className="flex items-center gap-2">
                    <div className="relative w-7 h-7 shrink-0">
                      <Image
                        src="/logo-emblem.png"
                        alt={APP_NAME}
                        fill
                        className="object-contain"
                        sizes="28px"
                      />
                    </div>
                    <h2 className="font-heading text-lg tracking-[0.15em] text-deep-plum font-semibold uppercase">
                      {APP_NAME}
                    </h2>
                  </div>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 hover:bg-neutral-100 rounded-full transition-colors text-deep-plum"
                    aria-label="Close menu"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-1">
                  {NAV_LINKS.map((link, i) => (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Link
                        href={link.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block py-3 px-4 text-base font-semibold text-deep-plum hover:bg-neutral-100 rounded-xl transition-colors"
                      >
                        {link.label}
                      </Link>
                    </motion.div>
                  ))}
                </div>

                <div className="divider-rose-gold my-6" />

                <div className="space-y-1">
                  {[
                    { label: "My Account", href: "/account", icon: User },
                    { label: "Wishlist", href: "/wishlist", icon: Heart },
                    { label: "About Us", href: "/about", icon: ChevronDown },
                    { label: "Contact", href: "/contact", icon: ChevronDown },
                  ].map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 py-3 px-4 text-sm font-medium text-neutral-800 hover:bg-neutral-100 rounded-xl transition-colors"
                    >
                      <link.icon className="w-4 h-4 text-rose-gold-dark" />
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Search Overlay & Modal */}
      <AnimatePresence>
        {isSearchOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-[300] backdrop-blur-md"
              onClick={() => setIsSearchOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed left-1/2 top-[10%] -translate-x-1/2 w-[92%] max-w-xl bg-white border border-neutral-200 z-[301] rounded-3xl p-6 md:p-8 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-deep-plum uppercase tracking-wider">
                  Search Collection
                </h3>
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="p-1.5 hover:bg-neutral-100 rounded-full transition-colors text-deep-plum"
                  aria-label="Close search"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.currentTarget;
                  const input = form.querySelector("input");
                  if (input && input.value.trim()) {
                    setIsSearchOpen(false);
                    window.location.href = `/search?q=${encodeURIComponent(input.value.trim())}`;
                  }
                }}
                className="relative"
              >
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-600 pointer-events-none" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Search rings, necklaces, earrings..."
                  className="w-full py-3.5 pl-12 pr-12 text-base font-medium text-deep-plum bg-neutral-50 border-2 border-neutral-200 rounded-2xl focus:border-rose-gold focus:bg-white focus:outline-none transition-all placeholder:text-neutral-500 shadow-inner"
                />
              </form>
              <div className="mt-6">
                <p className="text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-3">
                  Popular Searches
                </p>
                <div className="flex flex-wrap gap-2">
                  {["Gold Rings", "Diamond Necklace", "Silver Earrings", "Mangalsutra", "Bracelets"].map(
                    (term) => (
                      <Link
                        key={term}
                        href={`/search?q=${encodeURIComponent(term)}`}
                        onClick={() => setIsSearchOpen(false)}
                        className="px-3.5 py-1.5 bg-neutral-100 hover:bg-deep-plum hover:text-white border border-neutral-200 rounded-full text-xs font-semibold text-neutral-800 transition-colors"
                      >
                        {term}
                      </Link>
                    )
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
