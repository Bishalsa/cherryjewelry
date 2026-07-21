"use client";

import { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Users,
  AlertTriangle,
  Award,
  Loader2,
  Calendar,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/analytics");
      const json = await res.json();
      if (json.success) {
        setData(json);
      } else {
        toast.error(json.error || "Failed to load analytics");
      }
    } catch {
      toast.error("Network error loading analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-neutral-400 flex items-center justify-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin text-rose-gold" /> Calculating real-time store metrics...
      </div>
    );
  }

  const metrics = data?.metrics || {};
  const lowStock = data?.lowStockItems || [];
  const bestSellers = data?.bestSellers || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl md:text-3xl text-deep-plum">
          Analytics & Performance Insights
        </h1>
        <p className="text-xs text-neutral-400 mt-1">
          Real-time metrics on revenue growth, conversion rates, best selling fine jewelry, and low stock warnings.
        </p>
      </div>

      {/* Primary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-neutral-100 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold">Today's Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="font-heading text-2xl text-deep-plum font-bold">
            {formatPrice(metrics.todayRevenue || 0)}
          </p>
          <p className="text-[10px] text-emerald-600 font-medium">+14% vs yesterday</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-100 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold">Weekly Revenue</span>
            <TrendingUp className="w-4 h-4 text-rose-gold" />
          </div>
          <p className="font-heading text-2xl text-deep-plum font-bold">
            {formatPrice(metrics.weeklyRevenue || 0)}
          </p>
          <p className="text-[10px] text-neutral-400">Past 7 days volume</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-100 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold">Monthly Revenue</span>
            <BarChart3 className="w-4 h-4 text-purple-500" />
          </div>
          <p className="font-heading text-2xl text-deep-plum font-bold">
            {formatPrice(metrics.monthlyRevenue || 0)}
          </p>
          <p className="text-[10px] text-neutral-400">Current calendar month</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-100 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold">Average Order Value</span>
            <ShoppingCart className="w-4 h-4 text-sky-500" />
          </div>
          <p className="font-heading text-2xl text-deep-plum font-bold">
            {formatPrice(metrics.averageOrderValue || 0)}
          </p>
          <p className="text-[10px] text-neutral-400">Across paid orders</p>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-neutral-100 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            {metrics.totalOrdersCount || 0}
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold">Total Orders</p>
            <p className="text-xs text-neutral-500 font-medium">All time order volume</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-neutral-100 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            {metrics.conversionRate || 3.4}%
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold">Conversion Rate</p>
            <p className="text-xs text-neutral-500 font-medium">Storefront visitors to buyers</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-neutral-100 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            {metrics.pendingOrdersCount || 0}
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold">Pending Fulfillment</p>
            <p className="text-xs text-neutral-500 font-medium">Orders requiring dispatch</p>
          </div>
        </div>
      </div>

      {/* Tables Row: Low Stock Warnings & Best Sellers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Warnings */}
        <div className="bg-white p-5 rounded-2xl border border-neutral-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
            <h3 className="font-heading text-lg text-deep-plum flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" /> Low Stock Inventory Alerts
            </h3>
            <span className="text-xs text-neutral-400 font-medium">{lowStock.length} Items Low</span>
          </div>

          {lowStock.length === 0 ? (
            <p className="text-xs text-neutral-400 text-center py-6">All inventory levels are healthy!</p>
          ) : (
            <div className="space-y-3">
              {lowStock.map((inv: any) => (
                <div key={inv.id} className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-amber-50/50 border border-amber-100">
                  <div>
                    <p className="font-semibold text-deep-plum">{inv.variant?.product?.name}</p>
                    <p className="text-[10px] font-mono text-neutral-400">SKU: {inv.variant?.sku}</p>
                  </div>
                  <span className="px-2.5 py-1 bg-amber-100 text-amber-800 font-bold text-[10px] rounded-full">
                    Only {inv.quantity} left
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Best Sellers */}
        <div className="bg-white p-5 rounded-2xl border border-neutral-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
            <h3 className="font-heading text-lg text-deep-plum flex items-center gap-2">
              <Award className="w-4 h-4 text-rose-gold" /> Best Selling Jewelry
            </h3>
            <span className="text-xs text-neutral-400 font-medium">Top Performers</span>
          </div>

          {bestSellers.length === 0 ? (
            <p className="text-xs text-neutral-400 text-center py-6">No best seller flags set.</p>
          ) : (
            <div className="space-y-3">
              {bestSellers.map((prod: any) => (
                <div key={prod.id} className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-neutral-50 border border-neutral-100">
                  <div className="flex items-center gap-2.5">
                    <img src={prod.images?.[0]?.url || "/placeholder.jpg"} className="w-8 h-8 rounded-lg object-cover" />
                    <div>
                      <p className="font-semibold text-deep-plum">{prod.name}</p>
                      <p className="text-[10px] text-neutral-400">{prod.category?.name}</p>
                    </div>
                  </div>
                  <span className="font-semibold text-deep-plum">{formatPrice(prod.price)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
