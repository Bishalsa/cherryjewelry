"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { APP_NAME } from "@/lib/constants";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    // Check if already logged in
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth");
        const data = await res.json();
        if (data.success && data.user) {
          router.push("/account");
        }
      } catch {
        console.error("Auth check failed");
      } finally {
        setPageLoading(false);
      }
    };
    checkAuth();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", email }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Welcome back! Redirecting to account...");
        router.push("/account");
        router.refresh();
      } else {
        toast.error(data.error || "Email not registered. Please sign up.");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <Loader2 className="w-8 h-8 text-rose-gold animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-100 via-white to-neutral-50 flex items-center justify-center p-4">
      {/* Glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-rose-gold/5 blur-[120px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white border border-neutral-100 p-8 md:p-10 rounded-3xl shadow-luxury relative overflow-hidden"
      >
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-rose-gold/10 rounded-2xl mb-4 border border-rose-gold/25">
            <Sparkles className="w-6 h-6 text-rose-gold-dark" />
          </div>
          <h1 className="font-heading text-2xl md:text-3xl text-deep-plum tracking-wide">
            Sign In
          </h1>
          <p className="text-neutral-500 text-sm mt-2">
            Welcome to {APP_NAME}. Please enter your registered email.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-neutral-700 font-bold block">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-11 pr-4 py-3 bg-white border border-neutral-300 rounded-xl text-sm font-medium focus:outline-none focus:border-rose-gold focus:ring-2 focus:ring-rose-gold/20 transition-all text-deep-plum placeholder:text-neutral-500 shadow-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-deep-plum text-white font-medium rounded-xl text-sm tracking-wide shadow-sm hover:bg-neutral-800 transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing In...
              </>
            ) : (
              <>
                Sign In
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-neutral-100 pt-6">
          <p className="text-neutral-500 text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-rose-gold-dark hover:underline font-semibold transition-all">
              Sign Up
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
