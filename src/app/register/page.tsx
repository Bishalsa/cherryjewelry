"use client";

import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, User, Phone, ArrowRight, Loader2, CheckCircle, AlertCircle, Home } from "lucide-react";
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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const validateFields = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = "Full name is required";
    } else if (formData.name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters";
    }

    if (!formData.email.trim()) {
      errors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = "Please enter a valid email address";
    }

    if (formData.phone && !/^[+]?[\d\s-]{10,15}$/.test(formData.phone.replace(/\s/g, ""))) {
      errors.phone = "Please enter a valid phone number";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const clearFieldError = (field: string) => {
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateFields()) return;

    setLoading(true);
    setFieldErrors({});

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "register",
          email: formData.email.trim().toLowerCase(),
          name: formData.name.trim(),
          phone: formData.phone.trim() || null,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccess(true);
        toast.success("Account created! Redirecting...");
        // Auto-login redirect after brief success animation
        setTimeout(() => {
          window.location.href = "/account";
        }, 1500);
      } else if (res.status === 409) {
        // Duplicate email
        setFieldErrors({
          email: "An account with this email already exists. Please sign in instead.",
        });
      } else {
        toast.error(data.error || "Registration failed. Please try again.");
      }
    } catch {
      toast.error("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  // Success state
  if (success) {
    return (
      <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-100 via-white to-neutral-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md bg-white border border-neutral-100 p-8 md:p-10 rounded-3xl shadow-luxury text-center"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-50 rounded-full mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-500" />
          </div>
          <h1 className="font-heading text-2xl text-deep-plum mb-2">Account Created!</h1>
          <p className="text-neutral-500 text-sm mb-6">
            Welcome to {APP_NAME}, <strong className="text-deep-plum">{formData.name}</strong>!
            You&apos;re being redirected to your account dashboard...
          </p>
          <Loader2 className="w-5 h-5 text-rose-gold animate-spin mx-auto" />
        </motion.div>
      </div>
    );
  }

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
        {/* Back to Home link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-rose-gold-dark transition-colors mb-6"
        >
          <Home className="w-3.5 h-3.5" />
          Back to Home
        </Link>

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

        <form onSubmit={handleRegister} className="space-y-4" noValidate>
          {/* Full Name */}
          <div className="space-y-1">
            <label className="text-xs uppercase tracking-wider text-neutral-700 font-bold block">
              Full Name *
            </label>
            <div className="relative">
              <User className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${fieldErrors.name ? "text-red-400" : "text-neutral-600"}`} />
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  clearFieldError("name");
                }}
                placeholder="e.g. Priya Sharma"
                className={`w-full pl-11 pr-4 py-2.5 bg-white border rounded-xl text-sm font-medium focus:outline-none transition-all text-deep-plum placeholder:text-neutral-500 shadow-xs ${
                  fieldErrors.name
                    ? "border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                    : "border-neutral-300 focus:border-rose-gold focus:ring-2 focus:ring-rose-gold/20"
                }`}
              />
            </div>
            <AnimatePresence>
              {fieldErrors.name && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="flex items-center gap-1 text-xs text-red-500 mt-1"
                >
                  <AlertCircle className="w-3 h-3" />
                  {fieldErrors.name}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-xs uppercase tracking-wider text-neutral-700 font-bold block">
              Email Address *
            </label>
            <div className="relative">
              <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${fieldErrors.email ? "text-red-400" : "text-neutral-600"}`} />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  clearFieldError("email");
                }}
                placeholder="you@example.com"
                className={`w-full pl-11 pr-4 py-2.5 bg-white border rounded-xl text-sm font-medium focus:outline-none transition-all text-deep-plum placeholder:text-neutral-500 shadow-xs ${
                  fieldErrors.email
                    ? "border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                    : "border-neutral-300 focus:border-rose-gold focus:ring-2 focus:ring-rose-gold/20"
                }`}
              />
            </div>
            <AnimatePresence>
              {fieldErrors.email && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="flex items-center gap-1 text-xs text-red-500 mt-1"
                >
                  <AlertCircle className="w-3 h-3" />
                  {fieldErrors.email}
                  {fieldErrors.email.includes("sign in") && (
                    <Link href="/login" className="text-rose-gold-dark font-semibold hover:underline ml-1">
                      Sign In →
                    </Link>
                  )}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Phone */}
          <div className="space-y-1">
            <label className="text-xs uppercase tracking-wider text-neutral-700 font-bold block">
              Phone Number (Optional)
            </label>
            <div className="relative">
              <Phone className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${fieldErrors.phone ? "text-red-400" : "text-neutral-600"}`} />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => {
                  setFormData({ ...formData, phone: e.target.value });
                  clearFieldError("phone");
                }}
                placeholder="+91 XXXXX XXXXX"
                className={`w-full pl-11 pr-4 py-2.5 bg-white border rounded-xl text-sm font-medium focus:outline-none transition-all text-deep-plum placeholder:text-neutral-500 shadow-xs ${
                  fieldErrors.phone
                    ? "border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                    : "border-neutral-300 focus:border-rose-gold focus:ring-2 focus:ring-rose-gold/20"
                }`}
              />
            </div>
            <AnimatePresence>
              {fieldErrors.phone && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="flex items-center gap-1 text-xs text-red-500 mt-1"
                >
                  <AlertCircle className="w-3 h-3" />
                  {fieldErrors.phone}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 mt-2 bg-deep-plum text-white font-medium rounded-xl text-sm tracking-wide shadow-sm hover:bg-neutral-800 transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              <>
                Create Account
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
