"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  ArrowRight,
} from "lucide-react";
import { APP_NAME, FOOTER_LINKS } from "@/lib/constants";
import { useState } from "react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-deep-plum text-ivory/80">
      {/* Newsletter Section */}
      <div className="border-b border-white/10">
        <div className="container-luxury py-16">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="font-heading text-2xl md:text-3xl text-ivory mb-3 tracking-wide">
              Join the {APP_NAME} Circle
            </h3>
            <p className="text-ivory/50 mb-8 text-sm">
              Be the first to discover new collections, exclusive offers, and
              artisan stories delivered to your inbox.
            </p>
            <form onSubmit={handleSubscribe} className="relative max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-full text-ivory placeholder:text-ivory/30 focus:outline-none focus:border-rose-gold/50 transition-colors pr-14"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-rose-gold hover:bg-rose-gold-dark text-white p-2.5 rounded-full transition-colors"
                aria-label="Subscribe"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
            {subscribed && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-rose-gold-light text-sm mt-4"
              >
                ✨ Welcome to the {APP_NAME} family!
              </motion.p>
            )}
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container-luxury py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1 mb-4 lg:mb-0">
            <Link href="/" className="inline-block">
              <div className="flex items-center gap-2 mb-4">
                <div className="relative w-8 h-8 shrink-0">
                  <Image
                    src="/logo-emblem.png"
                    alt={APP_NAME}
                    fill
                    className="object-contain"
                    sizes="32px"
                  />
                </div>
                <h2 className="font-heading text-2xl tracking-[0.2em] text-ivory font-semibold uppercase">
                  {APP_NAME}
                </h2>
              </div>
            </Link>
            <p className="text-ivory/40 text-sm leading-relaxed mb-6 max-w-xs">
              Everyday luxury fashion & imitation jewelry from Kolkata. Handcrafted with
              premium anti-tarnish finish and modern elegance.
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-3">
              {[
                { label: "Instagram", href: "https://www.instagram.com/cherry_jewelry_official?igsh=Mmc4NHk4bTR5dWZh&igsi=Mmc4NHk4bTR5dWZh", svg: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg> },
              ].map(({ label, href, svg }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-white/5 hover:bg-rose-gold/20 hover:text-rose-gold-light rounded-full transition-all duration-300"
                  aria-label={label}
                >
                  {svg}
                </a>
              ))}
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h4 className="text-ivory font-medium text-sm uppercase tracking-wider mb-4">
              Shop
            </h4>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.shop.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-ivory/40 hover:text-rose-gold-light transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-ivory font-medium text-sm uppercase tracking-wider mb-4">
              Company
            </h4>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-ivory/40 hover:text-rose-gold-light transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="text-ivory font-medium text-sm uppercase tracking-wider mb-4">
              Support
            </h4>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.support.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-ivory/40 hover:text-rose-gold-light transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-2 md:col-span-1">
            <h4 className="text-ivory font-medium text-sm uppercase tracking-wider mb-4">
              Contact
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-ivory/40">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-rose-gold/60" />
                <span>Kolkata, West Bengal, India</span>
              </li>
              <li>
                <a
                  href="tel:+919876543210"
                  className="flex items-center gap-3 text-sm text-ivory/40 hover:text-rose-gold-light transition-colors"
                >
                  <Phone className="w-4 h-4 shrink-0 text-rose-gold/60" />
                  +91 98765 43210
                </a>
              </li>
              <li>
                <a
                  href="mailto:support@cherryjewelry.in"
                  className="flex items-center gap-3 text-sm text-ivory/40 hover:text-rose-gold-light transition-colors"
                >
                  <Mail className="w-4 h-4 shrink-0 text-rose-gold/60" />
                  support@cherryjewelry.in
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Trust Bar */}
      <div className="border-t border-white/10">
        <div className="container-luxury py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Payment Methods */}
            <div className="flex items-center gap-4 text-ivory/30 text-xs">
              <span>We Accept:</span>
              <div className="flex items-center gap-2">
                {["UPI", "Google Pay", "PhonePe", "Cards", "Net Banking", "Cash on Delivery"].map(
                  (method) => (
                    <span
                      key={method}
                      className="px-2 py-1 bg-white/5 rounded text-[10px]"
                    >
                      {method}
                    </span>
                  )
                )}
              </div>
            </div>

            {/* Trust Badges */}
            <div className="flex items-center gap-4 text-ivory/30 text-xs">
              <span>🔒 256-bit SSL Secured</span>
              <span>✨ Anti-Tarnish Finish</span>
              <span>🇮🇳 Ships from Kolkata, India</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/5">
        <div className="container-luxury py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-ivory/25">
            <p>© {currentYear} {APP_NAME}. All rights reserved.</p>
            <div className="flex items-center gap-4">
              {FOOTER_LINKS.legal.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="hover:text-ivory/50 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
