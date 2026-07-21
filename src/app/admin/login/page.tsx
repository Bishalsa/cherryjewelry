"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, Mail, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { APP_NAME } from "@/lib/constants";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      toast.success("Welcome back! Redirecting...");
      router.push("/admin");
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Invalid credentials";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-900 via-deep-plum to-black flex items-center justify-center p-4">
      {/* Background ambient rose-gold glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-rose-gold/5 blur-[120px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] p-8 md:p-10 rounded-3xl shadow-luxury relative overflow-hidden"
      >
        {/* Decorative border line */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-rose-gold/40 to-transparent" />

        <div className="text-center mb-8">
          <div className="relative w-28 h-28 mx-auto mb-3">
            <Image
              src="/logo.png"
              alt={APP_NAME}
              fill
              className="object-contain filter drop-shadow-md"
              priority
              sizes="112px"
            />
          </div>
          <h1 className="font-heading text-2xl md:text-3xl text-white tracking-wide uppercase font-semibold">
            {APP_NAME} Admin
          </h1>
          <p className="text-neutral-400 text-sm mt-2">
            Secure portal for luxury store management.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-neutral-400 font-medium block">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@yourdomain.com"
                className="w-full pl-11 pr-4 py-3 bg-white/[0.02] border border-white/[0.08] rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-rose-gold focus:bg-white/[0.04] transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-neutral-400 font-medium block">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 bg-white/[0.02] border border-white/[0.08] rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-rose-gold focus:bg-white/[0.04] transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-rose-gold-dark via-rose-gold to-rose-gold-dark text-deep-plum font-semibold rounded-xl text-sm tracking-wide shadow-glow hover:opacity-95 active:scale-[0.99] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Verifying Credentials...
              </>
            ) : (
              "Sign In to Dashboard"
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
