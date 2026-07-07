"use client";

import { useState } from "react";
import { Save, Loader2, Store, CreditCard, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { APP_NAME } from "@/lib/constants";

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [storeName, setStoreName] = useState(APP_NAME);
  const [storeEmail, setStoreEmail] = useState("info@cherryjewelry.in");
  const [taxRate, setTaxRate] = useState("0");
  const [freeShippingLimit, setFreeShippingLimit] = useState("999");
  
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Settings updated successfully (Simulation).");
    }, 800);
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="font-heading text-3xl text-obsidian">Settings</h1>
        <p className="text-neutral-500 mt-1">Configure your e-commerce store settings.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Store Profile */}
        <div className="bg-white rounded-2xl p-6 border border-neutral-100 shadow-card">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-neutral-100">
            <div className="p-2 bg-gold/10 rounded-lg">
              <Store className="w-5 h-5 text-gold-dark" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-obsidian">Store Profile</h2>
              <p className="text-xs text-neutral-400">Manage public identity and contact emails.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-wider text-neutral-400 font-medium block">Store Name</label>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full px-3.5 py-2 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-gold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs uppercase tracking-wider text-neutral-400 font-medium block">Contact Email</label>
              <input
                type="email"
                required
                value={storeEmail}
                onChange={(e) => setStoreEmail(e.target.value)}
                className="w-full px-3.5 py-2 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-gold"
              />
            </div>
          </div>
        </div>

        {/* Pricing & Checkout Settings */}
        <div className="bg-white rounded-2xl p-6 border border-neutral-100 shadow-card">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-neutral-100">
            <div className="p-2 bg-gold/10 rounded-lg">
              <CreditCard className="w-5 h-5 text-gold-dark" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-obsidian">Pricing & Checkout</h2>
              <p className="text-xs text-neutral-400">Configure default tax rules and shipping cost thresholds.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-wider text-neutral-400 font-medium block">Default Tax / GST Rate (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                className="w-full px-3.5 py-2 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-gold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs uppercase tracking-wider text-neutral-400 font-medium block">Free Shipping Minimum Threshold (INR)</label>
              <input
                type="number"
                min="0"
                value={freeShippingLimit}
                onChange={(e) => setFreeShippingLimit(e.target.value)}
                className="w-full px-3.5 py-2 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-gold"
              />
            </div>
          </div>
        </div>

        {/* Security & Access */}
        <div className="bg-white rounded-2xl p-6 border border-neutral-100 shadow-card">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-neutral-100">
            <div className="p-2 bg-gold/10 rounded-lg">
              <ShieldCheck className="w-5 h-5 text-gold-dark" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-obsidian">Security & Access</h2>
              <p className="text-xs text-neutral-400">Configure administrative access parameters.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-obsidian">Admin Password Protection</p>
                <p className="text-xs text-neutral-400 mt-0.5">Control panel authentication is secured via environment credentials.</p>
              </div>
              <span className="text-xs bg-success/10 text-success px-2.5 py-1 rounded-full font-medium">Active</span>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-obsidian text-white rounded-xl text-sm font-medium hover:bg-neutral-800 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
}
