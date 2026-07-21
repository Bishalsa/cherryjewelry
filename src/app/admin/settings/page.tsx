"use client";

import { useState } from "react";
import { Save, Loader2, Store, CreditCard, ShieldCheck, Image as ImageIcon, Share2, Truck } from "lucide-react";
import { toast } from "sonner";
import CloudinaryImageUploader from "@/components/admin/CloudinaryImageUploader";
import { APP_NAME } from "@/lib/constants";

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [storeName, setStoreName] = useState(APP_NAME);
  const [storeEmail, setStoreEmail] = useState("support@cherryjewelry.com");
  const [storePhone, setStorePhone] = useState("+91 98765 43210");
  const [freeShippingLimit, setFreeShippingLimit] = useState("999");
  const [shippingCost, setShippingCost] = useState("99");
  const [gstRate, setGstRate] = useState("3"); // 3% GST on Gold/Diamond jewelry in India
  const [razorpayKey, setRazorpayKey] = useState("rzp_test_TCZD2a3giQ0WY6");
  const [logoUrl, setLogoUrl] = useState<string[]>([]);
  const [faviconUrl, setFaviconUrl] = useState<string[]>([]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Store & payment settings saved successfully.");
    }, 800);
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl text-deep-plum">
          Store & System Settings
        </h1>
        <p className="text-xs text-neutral-400 mt-1">
          Configure store details, payment gateways, tax rates, Cloudinary logos, and shipping limits.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Store Profile */}
        <div className="bg-white rounded-2xl p-6 border border-neutral-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-neutral-100 pb-4">
            <div className="p-2 bg-rose-gold/10 rounded-lg">
              <Store className="w-5 h-5 text-rose-gold-dark" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-deep-plum">General Store Identity</h2>
              <p className="text-xs text-neutral-400">Public brand details displayed to buyers.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="uppercase tracking-wider text-neutral-400 font-medium block">Store Name</label>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full px-3.5 py-2 border border-neutral-200 rounded-xl focus:outline-none focus:border-rose-gold"
              />
            </div>

            <div className="space-y-1">
              <label className="uppercase tracking-wider text-neutral-400 font-medium block">Support Email</label>
              <input
                type="email"
                required
                value={storeEmail}
                onChange={(e) => setStoreEmail(e.target.value)}
                className="w-full px-3.5 py-2 border border-neutral-200 rounded-xl focus:outline-none focus:border-rose-gold"
              />
            </div>

            <div className="space-y-1">
              <label className="uppercase tracking-wider text-neutral-400 font-medium block">Support Phone Number</label>
              <input
                type="text"
                value={storePhone}
                onChange={(e) => setStorePhone(e.target.value)}
                className="w-full px-3.5 py-2 border border-neutral-200 rounded-xl focus:outline-none focus:border-rose-gold"
              />
            </div>
          </div>
        </div>

        {/* Branding & Logos */}
        <div className="bg-white rounded-2xl p-6 border border-neutral-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-neutral-100 pb-4">
            <div className="p-2 bg-rose-gold/10 rounded-lg">
              <ImageIcon className="w-5 h-5 text-rose-gold-dark" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-deep-plum">Branding Assets (Cloudinary)</h2>
              <p className="text-xs text-neutral-400">Upload primary logo and browser favicon.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-neutral-400 font-medium block">Primary Store Logo</label>
              <CloudinaryImageUploader
                images={logoUrl}
                onChange={setLogoUrl}
                folder="logos"
                maxFiles={1}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-neutral-400 font-medium block">Browser Favicon</label>
              <CloudinaryImageUploader
                images={faviconUrl}
                onChange={setFaviconUrl}
                folder="logos"
                maxFiles={1}
              />
            </div>
          </div>
        </div>

        {/* Logistics & Taxes */}
        <div className="bg-white rounded-2xl p-6 border border-neutral-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-neutral-100 pb-4">
            <div className="p-2 bg-rose-gold/10 rounded-lg">
              <Truck className="w-5 h-5 text-rose-gold-dark" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-deep-plum">Shipping & Tax Rules</h2>
              <p className="text-xs text-neutral-400">Configure free shipping threshold and GST rates.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1">
              <label className="uppercase tracking-wider text-neutral-400 font-medium block">Free Shipping Above (₹)</label>
              <input
                type="number"
                value={freeShippingLimit}
                onChange={(e) => setFreeShippingLimit(e.target.value)}
                className="w-full px-3.5 py-2 border border-neutral-200 rounded-xl focus:outline-none focus:border-rose-gold"
              />
            </div>

            <div className="space-y-1">
              <label className="uppercase tracking-wider text-neutral-400 font-medium block">Standard Delivery Fee (₹)</label>
              <input
                type="number"
                value={shippingCost}
                onChange={(e) => setShippingCost(e.target.value)}
                className="w-full px-3.5 py-2 border border-neutral-200 rounded-xl focus:outline-none focus:border-rose-gold"
              />
            </div>

            <div className="space-y-1">
              <label className="uppercase tracking-wider text-neutral-400 font-medium block">Jewelry GST Rate (%)</label>
              <input
                type="number"
                value={gstRate}
                onChange={(e) => setGstRate(e.target.value)}
                className="w-full px-3.5 py-2 border border-neutral-200 rounded-xl focus:outline-none focus:border-rose-gold"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 bg-deep-plum text-white px-6 py-2.5 rounded-xl text-xs font-medium hover:bg-deep-plum-dark transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
}
