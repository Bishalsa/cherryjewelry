"use client";

import { motion } from "framer-motion";
import { APP_NAME } from "@/lib/constants";
import { Gem, Award, Users, Heart } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative py-24 md:py-32 bg-gradient-to-b from-champagne-light to-ivory overflow-hidden">
        <div className="absolute top-10 right-10 w-60 h-60 bg-gold/5 rounded-full blur-3xl" />
        <div className="container-luxury text-center relative">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <p className="text-xs tracking-[0.3em] uppercase text-gold-dark mb-4">Our Story</p>
            <h1 className="font-heading text-4xl md:text-6xl text-obsidian mb-6">
              Crafting Beauty,<br />
              One Piece at a Time
            </h1>
            <p className="text-neutral-500 max-w-xl mx-auto leading-relaxed">
              At {APP_NAME}, we believe that every piece of jewelry is more than an accessory —
              it&apos;s a chapter in your story, a memory made tangible, a celebration of the moments that define you.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 md:py-28">
        <div className="container-luxury">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Gem, title: "Master Craftsmanship", desc: "Each piece is handcrafted by skilled artisans with decades of experience in traditional and modern jewelry-making techniques." },
              { icon: Award, title: "Certified Quality", desc: "All our gold jewelry is BIS hallmarked, and diamonds come with IGI/GIA certification — your guarantee of authenticity." },
              { icon: Users, title: "10,000+ Happy Customers", desc: "We've delivered happiness to over ten thousand customers across India, earning their trust with every order." },
              { icon: Heart, title: "Made with Love", desc: "From sketch to final polish, every LUMIÈRE piece is infused with passion, precision, and an unwavering commitment to beauty." },
            ].map((value, i) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center p-6"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 bg-gold/10 rounded-2xl mb-4">
                  <value.icon className="w-6 h-6 text-gold-dark" />
                </div>
                <h3 className="font-heading text-lg text-obsidian mb-2">{value.title}</h3>
                <p className="text-sm text-neutral-400 leading-relaxed">{value.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Journey */}
      <section className="py-20 bg-neutral-50/50">
        <div className="container-luxury">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2 className="font-heading text-3xl text-obsidian mb-6">Our Journey</h2>
              <div className="text-sm text-neutral-500 space-y-4 leading-relaxed">
                <p>
                  {APP_NAME} was born from a simple belief: that everyone deserves to wear jewelry that is as unique and extraordinary as they are. Founded with a passion for artisanal craftsmanship and a vision for modern luxury, we set out to create a platform where quality meets accessibility.
                </p>
                <p>
                  Our team of master artisans, with generations of expertise, works tirelessly to bring you jewelry that transcends trends. Every design begins with inspiration — from nature, architecture, emotions — and is refined through countless iterations until it achieves perfection.
                </p>
                <p>
                  Today, {APP_NAME} is proud to serve customers across India, offering a curated selection of rings, necklaces, earrings, bracelets, and more. Each piece in our collection is a testament to our commitment to excellence, sustainability, and the art of fine jewelry making.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container-luxury text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="font-heading text-3xl text-obsidian mb-4">Ready to Discover?</h2>
            <p className="text-neutral-400 mb-8">Explore our latest collection and find the piece that speaks to you.</p>
            <a href="/collections" className="inline-flex items-center gap-2 bg-obsidian text-white px-8 py-4 rounded-full text-sm font-medium hover:bg-neutral-800 transition-colors btn-glow">
              Shop the Collection
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
