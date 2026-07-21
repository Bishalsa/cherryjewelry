"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  TrendingUp, 
  ShoppingCart, 
  Package, 
  Users, 
  ArrowUpRight, 
  ArrowDownRight,
  Loader2,
  RefreshCw
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import { toast } from "sonner";

interface StatItem {
  label: string;
  value: number;
  change: string;
  isPositive: boolean;
  icon: string;
}

interface RecentOrder {
  id: string;
  customer: string;
  date: string;
  amount: number;
  status: string;
}

interface TopProduct {
  name: string;
  sales: number;
  revenue: number;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  TrendingUp: TrendingUp,
  ShoppingCart: ShoppingCart,
  Package: Package,
  Users: Users,
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<StatItem[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      const res = await fetch("/api/admin/metrics");
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to load dashboard metrics");
      }

      setStats(data.stats);
      setRecentOrders(data.recentOrders);
      setTopProducts(data.topProducts);
    } catch (err: unknown) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Error loading dashboard metrics");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-rose-gold animate-spin" />
        <p className="text-neutral-400 text-sm font-medium">Loading store metrics...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-3xl text-deep-plum">Dashboard Overview</h1>
          <p className="text-neutral-500 mt-2">Welcome back! Here&apos;s what&apos;s happening with your store today.</p>
        </div>
        <button
          onClick={() => fetchDashboardData(true)}
          disabled={refreshing}
          className="inline-flex items-center gap-2 px-4 py-2 border border-neutral-200 bg-white hover:bg-neutral-50 rounded-xl text-sm font-medium text-neutral-600 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, i) => {
          const Icon = ICON_MAP[stat.icon] || Package;
          const isCurrency = stat.label.toLowerCase().includes("revenue");

          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-6 rounded-2xl shadow-card border border-neutral-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-rose-gold/10 rounded-xl flex items-center justify-center">
                  <Icon className="w-5 h-5 text-rose-gold-dark" />
                </div>
                <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${stat.isPositive ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                  {stat.isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {stat.change}
                </div>
              </div>
              <h3 className="text-neutral-500 text-sm font-medium mb-1">{stat.label}</h3>
              <p className="text-2xl font-semibold text-deep-plum">
                {isCurrency ? formatPrice(stat.value) : stat.value}
              </p>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-card border border-neutral-100 overflow-hidden">
          <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
            <h2 className="font-heading text-xl text-deep-plum">Recent Orders</h2>
            <Link href="/admin/orders" className="text-sm text-rose-gold-dark hover:text-rose-gold transition-colors font-medium">
              View All
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50/50">
                  <th className="px-6 py-4 text-xs uppercase tracking-wider text-neutral-500 font-medium border-b border-neutral-100">Order ID</th>
                  <th className="px-6 py-4 text-xs uppercase tracking-wider text-neutral-500 font-medium border-b border-neutral-100">Customer</th>
                  <th className="px-6 py-4 text-xs uppercase tracking-wider text-neutral-500 font-medium border-b border-neutral-100">Date</th>
                  <th className="px-6 py-4 text-xs uppercase tracking-wider text-neutral-500 font-medium border-b border-neutral-100">Amount</th>
                  <th className="px-6 py-4 text-xs uppercase tracking-wider text-neutral-500 font-medium border-b border-neutral-100">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-neutral-400 text-sm">
                      No recent orders found. Test checkout to populate.
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-neutral-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-deep-plum">{order.id}</td>
                      <td className="px-6 py-4 text-sm text-neutral-600">{order.customer}</td>
                      <td className="px-6 py-4 text-sm text-neutral-400">{order.date}</td>
                      <td className="px-6 py-4 text-sm text-deep-plum font-medium">{formatPrice(order.amount)}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          order.status === 'DELIVERED' || order.status === 'Delivered' ? 'bg-success/10 text-success' :
                          order.status === 'PROCESSING' || order.status === 'Processing' || order.status === 'CONFIRMED' || order.status === 'Confirmed' ? 'bg-warning/10 text-warning-dark' :
                          order.status === 'CANCELLED' || order.status === 'Cancelled' ? 'bg-destructive/10 text-destructive' :
                          'bg-blue-50 text-blue-700'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-2xl shadow-card border border-neutral-100 p-6 flex flex-col justify-between">
          <div>
            <h2 className="font-heading text-xl text-deep-plum mb-6">Top Products</h2>
            <div className="space-y-6">
              {topProducts.map((product, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-neutral-100 rounded-lg flex items-center justify-center shrink-0">
                    <span className="text-xl opacity-40">💍</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-deep-plum truncate">{product.name}</p>
                    <p className="text-xs text-neutral-400 mt-0.5">{product.sales} sales</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-deep-plum">{formatPrice(product.revenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <Link 
            href="/admin/products" 
            className="w-full mt-6 py-2.5 text-center border border-neutral-200 rounded-xl text-sm font-medium text-neutral-600 hover:bg-neutral-50 transition-colors block"
          >
            Manage Inventory
          </Link>
        </div>
      </div>
    </div>
  );
}
