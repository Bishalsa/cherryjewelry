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
  Heart,
  Gem,
  Award,
  Clock,
  Gift,
  Camera,
} from "lucide-react";
import ProductCard from "@/components/product/ProductCard";
import { sampleTestimonials } from "@/lib/sample-data";
import { cn } from "@/lib/utils";
import { APP_NAME, TRUST_BADGES } from "@/lib/constants";
import type { Product, Category } from "@/types";

// ============================================
// Section Header (reusable)
// ============================================
function SectionHeader({
  subtitle,
  title,
  description,
  action,
}: {
  subtitle: string;
  title: string;
  description: string;
  action?: { label: string; href: string };
}) {
  return (
    <div className="text-center max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-center gap-3 mb-4"
      >
        <div className="h-[1px] w-8 bg-rose-gold/40" />
        <span className="text-xs tracking-[0.3em] uppercase text-rose-gold-dark font-medium">
          {subtitle}
        </span>
        <div className="h-[1px] w-8 bg-rose-gold/40" />
      </motion.div>
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="font-heading text-3xl md:text-4xl lg:text-5xl text-deep-plum mb-4"
      >
        {title}
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-neutral-500 text-sm md:text-base leading-relaxed"
      >
        {description}
      </motion.p>
      {action && (
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-6"
        >
          <Link
            href={action.href}
            className="inline-flex items-center gap-2 text-sm font-medium text-rose-gold-dark hover:text-rose-gold transition-colors group"
          >
            {action.label}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      )}
    </div>
  );
}

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
        <div className="absolute inset-0 bg-gradient-to-br from-soft-pink/40 via-ivory to-soft-pink/20" />
        {/* Decorative elements */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-rose-gold/8 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-cherry-ruby/5 rounded-full blur-3xl" />
        {/* Floating sparkles */}
        <motion.div
          animate={{ y: [-10, 10, -10], rotate: [0, 180, 360] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[20%] right-[20%] text-rose-gold/20 text-4xl"
        >
          ✦
        </motion.div>
        <motion.div
          animate={{ y: [10, -10, 10], rotate: [360, 180, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[60%] left-[15%] text-rose-gold/15 text-3xl"
        >
          ✧
        </motion.div>
        <motion.div
          animate={{ y: [-5, 15, -5] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[40%] right-[40%] text-cherry-ruby/10 text-5xl"
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
            <div className="h-[1px] w-8 bg-rose-gold/40" />
            <span className="text-xs tracking-[0.3em] uppercase text-rose-gold-dark font-medium">
              Handcrafted with Love
            </span>
            <div className="h-[1px] w-8 bg-rose-gold/40" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="font-heading text-4xl md:text-6xl lg:text-7xl text-deep-plum leading-[1.1] mb-6"
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
              className="group inline-flex items-center gap-2 bg-deep-plum text-white px-8 py-4 rounded-full text-sm font-medium hover:bg-deep-plum-dark transition-all duration-300 btn-glow"
            >
              Explore Collection
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/collections/best-sellers"
              className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm text-deep-plum px-8 py-4 rounded-full text-sm font-medium hover:bg-white transition-all duration-300 border border-rose-gold/30"
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
                <p className="text-2xl md:text-3xl font-heading text-rose-gold-dark">
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
// Trust Badges Section
// ============================================
function TrustBadgesSection() {
  const iconMap: Record<string, React.ReactNode> = {
    Shield: <Shield className="w-6 h-6" />,
    Truck: <Truck className="w-6 h-6" />,
    RefreshCw: <RefreshCw className="w-6 h-6" />,
    Lock: <Lock className="w-6 h-6" />,
  };

  return (
    <section className="py-6 md:py-8 border-y border-neutral-100">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {TRUST_BADGES.map((badge, i) => (
            <motion.div
              key={badge.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="flex items-center gap-3 justify-center md:justify-start"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-soft-pink flex items-center justify-center text-rose-gold-dark">
                {iconMap[badge.icon] || <Shield className="w-6 h-6" />}
              </div>
              <div>
                <p className="text-xs font-semibold text-deep-plum">{badge.label}</p>
                <p className="text-[10px] text-neutral-400">{badge.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================
// Testimonials Section
// ============================================
function TestimonialsSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const testimonials = sampleTestimonials;

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-soft-pink/20 to-ivory">
      <div className="max-w-6xl mx-auto px-4">
        <SectionHeader
          subtitle="Love Letters"
          title="What Our Customers Say"
          description="Real stories from real people who found their perfect piece."
        />

        <div className="mt-16 relative max-w-3xl mx-auto">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={testimonial.id}
              initial={false}
              animate={{
                opacity: i === activeIndex ? 1 : 0,
                scale: i === activeIndex ? 1 : 0.95,
                position: i === activeIndex ? "relative" as const : "absolute" as const,
              }}
              transition={{ duration: 0.5 }}
              className={cn(
                "text-center",
                i !== activeIndex && "absolute inset-0 pointer-events-none"
              )}
            >
              {/* Stars */}
              <div className="flex items-center justify-center gap-1 mb-6">
                {Array.from({ length: testimonial.rating }).map((_, s) => (
                  <Star
                    key={s}
                    className="w-4 h-4 fill-rose-gold text-rose-gold"
                  />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-lg md:text-xl text-neutral-700 leading-relaxed mb-8 font-light italic">
                &ldquo;{testimonial.text}&rdquo;
              </blockquote>

              {/* Author */}
              <div className="flex items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-gold to-rose-gold-dark flex items-center justify-center text-white text-xs font-semibold">
                  {testimonial.avatar}
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-deep-plum">{testimonial.name}</p>
                  <p className="text-xs text-neutral-400">{testimonial.location} · {testimonial.product}</p>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Dots */}
          <div className="flex items-center justify-center gap-2 mt-10">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-300",
                  i === activeIndex
                    ? "bg-rose-gold w-6"
                    : "bg-neutral-300 hover:bg-neutral-400"
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================
// Limited Time Offer
// ============================================
function LimitedOffer() {
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 59, seconds: 59 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const totalSeconds = prev.hours * 3600 + prev.minutes * 60 + prev.seconds - 1;
        if (totalSeconds <= 0) return { hours: 23, minutes: 59, seconds: 59 };
        return {
          hours: Math.floor(totalSeconds / 3600),
          minutes: Math.floor((totalSeconds % 3600) / 60),
          seconds: totalSeconds % 60,
        };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-16 md:py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-deep-plum-dark via-deep-plum to-deep-plum-dark" />
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-rose-gold rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-cherry-ruby rounded-full blur-[80px]" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 bg-rose-gold/10 border border-rose-gold/20 px-4 py-1.5 rounded-full mb-6">
            <Clock className="w-3.5 h-3.5 text-rose-gold-light" />
            <span className="text-xs tracking-wider uppercase text-rose-gold-light font-medium">
              Limited Time Offer
            </span>
          </div>

          <h2 className="font-heading text-3xl md:text-5xl text-white mb-4">
            Get <span className="text-gradient-gold">20% Off</span> Your First Order
          </h2>
          <p className="text-neutral-400 text-sm md:text-base max-w-lg mx-auto mb-8">
            Use code <span className="font-mono text-rose-gold-light font-semibold bg-rose-gold/10 px-2 py-0.5 rounded">CHERRY20</span> at checkout. Offer ends soon!
          </p>

          {/* Countdown */}
          <div className="flex items-center justify-center gap-3 md:gap-4 mb-10">
            {[
              { value: timeLeft.hours, label: "Hours" },
              { value: timeLeft.minutes, label: "Minutes" },
              { value: timeLeft.seconds, label: "Seconds" },
            ].map((unit) => (
              <div key={unit.label} className="text-center">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-2">
                  <span className="font-heading text-2xl md:text-3xl text-white">
                    {String(unit.value).padStart(2, "0")}
                  </span>
                </div>
                <span className="text-[10px] uppercase tracking-wider text-neutral-500">
                  {unit.label}
                </span>
              </div>
            ))}
          </div>

          <Link
            href="/collections"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-gold to-cherry-ruby text-white px-8 py-4 rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Gift className="w-4 h-4" />
            Shop Now & Save
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================
// Why Choose Us Section
// ============================================
function WhyChooseUs() {
  const reasons = [
    {
      icon: <Gem className="w-6 h-6" />,
      title: "BIS Hallmarked Gold",
      description:
        "Every gold piece is certified with BIS hallmark, guaranteeing purity and authenticity you can trust.",
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: "Certified Diamonds",
      description:
        "All our diamonds come with IGI/GIA certification, ensuring quality, cut, clarity, and brilliance.",
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: "Handcrafted with Love",
      description:
        "Each piece is meticulously crafted by skilled artisans with decades of expertise in fine jewelry.",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Lifetime Exchange",
      description:
        "We stand behind our quality. Enjoy lifetime exchange on all gold jewelry at full value.",
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-soft-pink/15">
      <div className="max-w-6xl mx-auto px-4">
        <SectionHeader
          subtitle="Our Promise"
          title="Why Choose Cherry Jewelry"
          description="We combine traditional craftsmanship with modern design to create jewelry that tells your story."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
          {reasons.map((reason, i) => (
            <motion.div
              key={reason.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group text-center p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-neutral-100 hover:border-rose-gold/20 hover:shadow-[0_0_30px_rgba(183,110,121,0.1)] transition-all duration-500"
            >
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-soft-pink to-soft-pink-dark flex items-center justify-center text-rose-gold-dark mx-auto mb-5 group-hover:scale-110 transition-transform duration-300">
                {reason.icon}
              </div>
              <h3 className="font-heading text-lg text-deep-plum mb-2">
                {reason.title}
              </h3>
              <p className="text-sm text-neutral-500 leading-relaxed">
                {reason.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================
// Instagram Gallery Section
// ============================================
function InstagramGallery() {
  const images = [
    { id: 1, gradient: "from-rose-gold/20 to-soft-pink", emoji: "💍" },
    { id: 2, gradient: "from-cherry-ruby/10 to-soft-pink/50", emoji: "✨" },
    { id: 3, gradient: "from-soft-pink to-ivory", emoji: "📿" },
    { id: 4, gradient: "from-deep-plum/10 to-soft-pink/30", emoji: "💎" },
    { id: 5, gradient: "from-rose-gold/10 to-cherry-ruby/8", emoji: "⭐" },
    { id: 6, gradient: "from-soft-pink/50 to-ivory", emoji: "🌟" },
  ];

  return (
    <section className="py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-4">
        <SectionHeader
          subtitle="Follow Us"
          title="@CherryJewelry"
          description="Join our community of jewelry lovers. Tag us in your photos for a chance to be featured."
        />

        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-3 mt-12">
          {images.map((img, i) => (
            <motion.a
              key={img.id}
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer"
            >
              <div className={cn("absolute inset-0 bg-gradient-to-br", img.gradient)} />
              <div className="absolute inset-0 flex items-center justify-center text-4xl opacity-20 group-hover:opacity-40 group-hover:scale-110 transition-all duration-500">
                {img.emoji}
              </div>
              <div className="absolute inset-0 bg-deep-plum/0 group-hover:bg-deep-plum/40 transition-colors duration-300 flex items-center justify-center">
                <Camera className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================
// Main Client Component
// ============================================
interface HomePageClientProps {
  categories: Category[];
  bestSellers: Product[];
  newArrivals: Product[];
}

export default function HomePageClient({
  categories,
  bestSellers,
  newArrivals,
}: HomePageClientProps) {
  return (
    <>
      <HeroSection />
      <TrustBadgesSection />

      {/* Featured Collections */}
      <section className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-4">
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
                    i % 3 === 0 ? "bg-gradient-to-br from-soft-pink to-soft-pink-dark" :
                    i % 3 === 1 ? "bg-gradient-to-br from-rose-gold/10 to-soft-pink" :
                    "bg-gradient-to-br from-deep-plum/10 to-neutral-100"
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
                    <div className="flex items-center gap-1 text-white/70 text-xs group-hover:text-rose-gold-lighter transition-colors">
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
        <div className="max-w-6xl mx-auto px-4">
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
        <div className="max-w-6xl mx-auto px-4">
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
