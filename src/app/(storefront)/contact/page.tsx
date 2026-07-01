"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Mail, Phone, MapPin, Send, Check } from "lucide-react";
import { APP_NAME } from "@/lib/constants";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-b from-champagne-light to-ivory py-16 md:py-20">
        <div className="container-luxury text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-xs tracking-[0.3em] uppercase text-gold-dark mb-3">Get in Touch</p>
            <h1 className="font-heading text-3xl md:text-5xl text-obsidian">Contact Us</h1>
            <p className="text-neutral-400 mt-3 text-sm max-w-md mx-auto">
              Have a question? We&apos;d love to hear from you. Reach out and we&apos;ll get back within 24 hours.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container-luxury py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 max-w-5xl mx-auto">
          {/* Contact Info */}
          <div className="space-y-6">
            {[
              { icon: Mail, label: "Email", value: "hello@lumiere.in", href: "mailto:hello@lumiere.in" },
              { icon: Phone, label: "Phone", value: "+91 98765 43210", href: "tel:+919876543210" },
              { icon: MapPin, label: "Address", value: "123 Jewel Street, Mumbai, Maharashtra 400001", href: null },
            ].map(({ icon: Icon, label, value, href }) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="flex items-start gap-4 p-4 rounded-xl bg-neutral-50"
              >
                <div className="w-10 h-10 bg-gold/10 rounded-lg flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-gold-dark" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-obsidian">{label}</h4>
                  {href ? (
                    <a href={href} className="text-sm text-neutral-400 hover:text-gold transition-colors">{value}</a>
                  ) : (
                    <p className="text-sm text-neutral-400">{value}</p>
                  )}
                </div>
              </motion.div>
            ))}

            <div className="p-4 rounded-xl bg-champagne-light/50">
              <h4 className="text-sm font-medium text-obsidian mb-1">Business Hours</h4>
              <p className="text-xs text-neutral-400">Mon - Sat: 10:00 AM - 7:00 PM IST</p>
              <p className="text-xs text-neutral-400">Sunday: Closed</p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <motion.form
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-5"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-obsidian mb-1.5">First Name</label>
                  <input
                    id="firstName"
                    type="text"
                    required
                    className="w-full px-4 py-3 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-gold transition-colors"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-obsidian mb-1.5">Last Name</label>
                  <input
                    id="lastName"
                    type="text"
                    required
                    className="w-full px-4 py-3 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-gold transition-colors"
                    placeholder="Doe"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-obsidian mb-1.5">Email</label>
                <input
                  id="email"
                  type="email"
                  required
                  className="w-full px-4 py-3 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-gold transition-colors"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-obsidian mb-1.5">Subject</label>
                <select
                  id="subject"
                  className="w-full px-4 py-3 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-gold transition-colors bg-white"
                >
                  <option>General Inquiry</option>
                  <option>Order Support</option>
                  <option>Return / Exchange</option>
                  <option>Custom Jewelry</option>
                  <option>Wholesale</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-obsidian mb-1.5">Message</label>
                <textarea
                  id="message"
                  required
                  rows={5}
                  className="w-full px-4 py-3 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-gold transition-colors resize-none"
                  placeholder="Tell us how we can help..."
                />
              </div>

              <button
                type="submit"
                className="inline-flex items-center gap-2 bg-obsidian text-white px-8 py-3.5 rounded-full text-sm font-medium hover:bg-neutral-800 transition-colors btn-glow"
              >
                {submitted ? (
                  <>
                    <Check className="w-4 h-4" />
                    Message Sent!
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Message
                  </>
                )}
              </button>
            </motion.form>
          </div>
        </div>
      </div>
    </div>
  );
}
