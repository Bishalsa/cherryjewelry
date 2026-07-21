"use client";

import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, User, Phone, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { APP_NAME } from "@/lib/constants";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const { name, email, phone } = formData;
    if (!name || !email) {
      toast.error("Please fill in required fields.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "register", email, name, phone }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Welcome! Account created successfully.");
        router.push("/account");
        router.refresh();
      } else {
        toast.error(data.error || "Failed to create account");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-100 via-white to-neutral-50 flex items-center justify-center p-4">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-rose-gold/5 blur-[120px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white border border-neutral-100 p-8 md:p-10 rounded-3xl shadow-luxury relative overflow-hidden"
      >
        <div className="text-center mb-8">
          <div className="relative w-24 h-24 mx-auto mb-2">
            <Image
              src="/logo.png"
              alt={APP_NAME}
              fill
              className="object-contain"
              priority
              sizes="96px"
            />
          </div>
          <h1 className="font-heading text-2xl md:text-3xl text-deep-plum tracking-wide font-semibold uppercase">
            Create Account
          </h1>
          <p className="text-neutral-600 text-sm mt-2">
            Join {APP_NAME} to track orders and save addresses.
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          {/* Full Name */}
          <div className="space-y-1">
            <label className="text-xs uppercase tracking-wider text-neutral-700 font-bold block">
              Full Name *
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Priya Sharma"
                className="w-full pl-11 pr-4 py-2.5 bg-white border border-neutral-300 rounded-xl text-sm font-medium focus:outline-none focus:border-rose-gold focus:ring-2 focus:ring-rose-gold/20 transition-all text-deep-plum placeholder:text-neutral-500 shadow-xs"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-xs uppercase tracking-wider text-neutral-700 font-bold block">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="you@example.com"
                className="w-full pl-11 pr-4 py-2.5 bg-white border border-neutral-300 rounded-xl text-sm font-medium focus:outline-none focus:border-rose-gold focus:ring-2 focus:ring-rose-gold/20 transition-all text-deep-plum placeholder:text-neutral-500 shadow-xs"
              />
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-1">
            <label className="text-xs uppercase tracking-wider text-neutral-700 font-bold block">
              Phone Number (Optional)
            </label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 XXXXX XXXXX"
                className="w-full pl-11 pr-4 py-2.5 bg-white border border-neutral-300 rounded-xl text-sm font-medium focus:outline-none focus:border-rose-gold focus:ring-2 focus:ring-rose-gold/20 transition-all text-deep-plum placeholder:text-neutral-500 shadow-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 mt-2 bg-deep-plum text-white font-medium rounded-xl text-sm tracking-wide shadow-sm hover:bg-neutral-800 transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Registering...
              </>
            ) : (
              <>
                Sign Up
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-neutral-100 pt-6">
          <p className="text-neutral-500 text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-rose-gold-dark hover:underline font-semibold transition-all">
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
