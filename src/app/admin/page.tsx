"use client";

import { motion } from "framer-motion";
import { 
  TrendingUp, 
  ShoppingCart, 
  Package, 
  Users, 
  ArrowUpRight, 
  ArrowDownRight 
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

const STATS = [
  {
    label: "Total Revenue",
    value: 1254300,
    change: "+12.5%",
    isPositive: true,
    icon: TrendingUp,
    format: (v: number) => formatPrice(v),
  },
  {
    label: "Total Orders",
    value: 145,
    change: "+5.2%",
    isPositive: true,
    icon: ShoppingCart,
    format: (v: number) => v.toString(),
  },
  {
    label: "Total Products",
    value: 52,
    change: "-2.1%",
    isPositive: false,
    icon: Package,
    format: (v: number) => v.toString(),
  },
  {
    label: "Active Customers",
    value: 843,
    change: "+18.4%",
    isPositive: true,
    icon: Users,
    format: (v: number) => v.toString(),
  },
];

const RECENT_ORDERS = [
  { id: "#ORD-001", customer: "Priya Sharma", date: "Today", amount: 45999, status: "Processing" },
  { id: "#ORD-002", customer: "Rahul Verma", date: "Yesterday", amount: 125000, status: "Shipped" },
  { id: "#ORD-003", customer: "Anjali Patel", date: "May 28", amount: 34500, status: "Delivered" },
  { id: "#ORD-004", customer: "Vikram Singh", date: "May 25", amount: 78500, status: "Processing" },
];

export default function AdminDashboard() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-3xl text-obsidian">Dashboard Overview</h1>
        <p className="text-neutral-500 mt-2">Welcome back! Here&apos;s what&apos;s happening with your store today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {STATS.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-6 rounded-2xl shadow-card border border-neutral-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-gold/10 rounded-xl flex items-center justify-center">
                  <Icon className="w-5 h-5 text-gold-dark" />
                </div>
                <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${stat.isPositive ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                  {stat.isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {stat.change}
                </div>
              </div>
              <h3 className="text-neutral-500 text-sm font-medium mb-1">{stat.label}</h3>
              <p className="text-2xl font-semibold text-obsidian">{stat.format(stat.value)}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-card border border-neutral-100 overflow-hidden">
          <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
            <h2 className="font-heading text-xl text-obsidian">Recent Orders</h2>
            <button className="text-sm text-gold-dark hover:text-gold transition-colors">View All</button>
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
                {RECENT_ORDERS.map((order) => (
                  <tr key={order.id} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-obsidian">{order.id}</td>
                    <td className="px-6 py-4 text-sm text-neutral-600">{order.customer}</td>
                    <td className="px-6 py-4 text-sm text-neutral-400">{order.date}</td>
                    <td className="px-6 py-4 text-sm text-obsidian font-medium">{formatPrice(order.amount)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        order.status === 'Delivered' ? 'bg-success/10 text-success' :
                        order.status === 'Processing' ? 'bg-warning/10 text-warning-dark' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-2xl shadow-card border border-neutral-100 p-6">
          <h2 className="font-heading text-xl text-obsidian mb-6">Top Products</h2>
          <div className="space-y-6">
            {[
              { name: "Celestial Diamond Ring", sales: 24, revenue: 1103976 },
              { name: "Aria Gold Necklace", sales: 18, revenue: 1413000 },
              { name: "Rose Petal Earrings", sales: 31, revenue: 898969 },
            ].map((product, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-12 h-12 bg-neutral-100 rounded-lg flex items-center justify-center shrink-0">
                  <span className="text-xl opacity-20">💎</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-obsidian truncate">{product.name}</p>
                  <p className="text-xs text-neutral-400 mt-0.5">{product.sales} sales</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-obsidian">{formatPrice(product.revenue)}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-2.5 border border-neutral-200 rounded-xl text-sm font-medium text-neutral-600 hover:bg-neutral-50 transition-colors">
            View Inventory
          </button>
        </div>
      </div>
    </div>
  );
}
