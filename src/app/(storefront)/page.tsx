"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import {
  ArrowRight,
  Shield,
  Truck,
  RefreshCw,
  Lock,
  Star,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import ProductCard from "@/components/product/ProductCard";
import { sampleProducts, sampleCategories, sampleTestimonials } from "@/lib/sample-data";
import { formatPrice, cn } from "@/lib/utils";
import { APP_NAME, TRUST_BADGES } from "@/lib/constants";

// ============================================
// Hero Section
// ============================================
function HeroSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} className="relative h-[85vh] md:h-[90vh] overflow-hidden">
      {/* Background */}
      <motion.div style={{ y }} className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-champagne-light via-ivory to-champagne" />
        {/* Decorative elements */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-rose-gold/5 rounded-full blur-3xl" />
        {/* Floating sparkles */}
        <motion.div
          animate={{ y: [-10, 10, -10], rotate: [0, 180, 360] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[20%] right-[20%] text-gold/20 text-4xl"
        >
          ✦
        </motion.div>
        <motion.div
          animate={{ y: [10, -10, 10], rotate: [360, 180, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[60%] left-[15%] text-gold/15 text-3xl"
        >
          ✧
        </motion.div>
        <motion.div
          animate={{ y: [-5, 15, -5] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[40%] right-[40%] text-rose-gold/10 text-5xl"
        >
          ◇
        </motion.div>
      </motion.div>

      {/* Content */}
      <motion.div
        style={{ opacity }}
        className="relative h-full flex items-center justify-center text-center px-6"
      >
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex items-center justify-center gap-2 mb-6"
          >
            <div className="h-[1px] w-8 bg-gold/40" />
            <span className="text-xs tracking-[0.3em] uppercase text-gold-dark font-medium">
              Handcrafted with Love
            </span>
            <div className="h-[1px] w-8 bg-gold/40" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="font-heading text-4xl md:text-6xl lg:text-7xl text-obsidian leading-[1.1] mb-6"
          >
            Where Artistry
            <br />
            Meets <span className="text-gradient-gold italic">Elegance</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-neutral-500 text-base md:text-lg max-w-xl mx-auto mb-8 leading-relaxed"
          >
            Discover our curated collection of exquisite jewelry — each piece
            tells a unique story of craftsmanship, passion, and timeless beauty.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/collections/new-arrivals"
              className="group inline-flex items-center gap-2 bg-obsidian text-white px-8 py-4 rounded-full text-sm font-medium hover:bg-neutral-800 transition-all duration-300 btn-glow"
            >
              Explore Collection
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/collections/best-sellers"
              className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm text-obsidian px-8 py-4 rounded-full text-sm font-medium hover:bg-white transition-all duration-300 border border-neutral-200/50"
            >
              Best Sellers
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="flex items-center justify-center gap-8 md:gap-12 mt-12 text-center"
          >
            {[
              { value: "10K+", label: "Happy Customers" },
              { value: "500+", label: "Unique Designs" },
              { value: "BIS", label: "Hallmarked" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl md:text-3xl font-heading text-gold-dark">
                  {stat.value}
                </p>
                <p className="text-[10px] md:text-xs text-neutral-400 uppercase tracking-wider mt-1">
                  {stat.label}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 border-2 border-neutral-300/50 rounded-full flex items-start justify-center pt-2"
        >
          <div className="w-1 h-2 bg-neutral-400 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
}

// ============================================
// Main Home Page (Server Component)
// ============================================
import prisma from "@/lib/prisma";
import type { Product, Category } from "@/types";

export default async function HomePage() {
  let categories: Category[] = [];
  let bestSellers: Product[] = [];
  let newArrivals: Product[] = [];
  let usingFallback = false;

  try {
    // Try to fetch from database
    const dbCategories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { position: 'asc' },
      take: 6,
    });
    
    const dbBestSellers = await prisma.product.findMany({
      where: { isActive: true, isBestSeller: true },
      include: { variants: true, images: true },
      take: 4,
    });
    
    const dbNewArrivals = await prisma.product.findMany({
      where: { isActive: true, isNewArrival: true },
      include: { variants: true, images: true },
      orderBy: { createdAt: 'desc' },
      take: 4,
    });

    if (dbCategories.length > 0) {
      categories = dbCategories as unknown as Category[];
      bestSellers = dbBestSellers as unknown as Product[];
      newArrivals = dbNewArrivals as unknown as Product[];
    } else {
      usingFallback = true;
    }
  } catch (error) {
    console.warn("Database connection failed, falling back to sample data", error);
    usingFallback = true;
  }

  if (usingFallback) {
    categories = sampleCategories.slice(0, 6);
    bestSellers = sampleProducts.filter((p) => p.isBestSeller).slice(0, 4);
    newArrivals = sampleProducts.filter((p) => p.isNewArrival).slice(0, 4);
  }

  return (
    <>
      <HeroSection />
      <TrustBadgesSection />
      
      {/* Featured Collections */}
      <section className="py-20 md:py-28">
        <div className="container-luxury">
          <SectionHeader
            subtitle="Curated For You"
            title="Featured Collections"
            description="Explore our handpicked selection of jewelry collections, designed to complement every style and occasion."
          />

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mt-12">
            {categories.map((category, i) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Link
                  href={`/collections/${category.slug}`}
                  className="group block relative aspect-[3/4] md:aspect-[4/5] rounded-2xl overflow-hidden"
                >
                  <div className={cn(
                    "absolute inset-0 transition-transform duration-700 group-hover:scale-105",
                    i % 3 === 0 ? "bg-gradient-to-br from-champagne to-champagne-light" :
                    i % 3 === 1 ? "bg-gradient-to-br from-rose-gold/10 to-champagne-light" :
                    "bg-gradient-to-br from-platinum/30 to-neutral-100"
                  )} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-6xl md:text-7xl opacity-15 group-hover:opacity-25 group-hover:scale-110 transition-all duration-700">
                      {category.slug.includes("ring") ? "💍" :
                       category.slug.includes("necklace") ? "📿" :
                       category.slug.includes("earring") ? "✨" :
                       category.slug.includes("bracelet") ? "⭐" :
                       category.slug.includes("pendant") ? "💎" : "🌟"}
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/5 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
                    <h3 className="font-heading text-lg md:text-xl text-white mb-1">
                      {category.name}
                    </h3>
                    <div className="flex items-center gap-1 text-white/70 text-xs group-hover:text-gold-light transition-colors">
                      <span>Explore</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="py-20 md:py-28 bg-neutral-50/50">
        <div className="container-luxury">
          <SectionHeader
            subtitle="Most Loved"
            title="Best Sellers"
            description="Our most popular pieces, chosen by thousands of happy customers."
            action={{ label: "View All", href: "/collections/best-sellers" }}
          />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-12">
            {bestSellers.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        </div>
      </section>

      <LimitedOffer />

      {/* New Arrivals */}
      <section className="py-20 md:py-28">
        <div className="container-luxury">
          <SectionHeader
            subtitle="Just Landed"
            title="New Arrivals"
            description="Be the first to discover our latest creations, fresh from the artisan's workshop."
            action={{ label: "Shop New", href: "/collections/new-arrivals" }}
          />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-12">
            {newArrivals.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        </div>
      </section>

      <TestimonialsSection />
      <WhyChooseUs />
      <InstagramGallery />
    </>
  );
}
