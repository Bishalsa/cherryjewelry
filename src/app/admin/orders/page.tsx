"use client";

import { useState } from "react";
import { Search, Filter, MoreVertical, Eye, FileText } from "lucide-react";
import { formatPrice } from "@/lib/utils";

const MOCK_ORDERS = [
  { id: "ORD-001", date: "2026-07-01", customer: { name: "Priya Sharma", email: "priya@example.com" }, total: 45999, status: "Processing", items: 1, payment: "Paid" },
  { id: "ORD-002", date: "2026-06-30", customer: { name: "Rahul Verma", email: "rahul@example.com" }, total: 125000, status: "Shipped", items: 2, payment: "Paid" },
  { id: "ORD-003", date: "2026-06-28", customer: { name: "Anjali Patel", email: "anjali@example.com" }, total: 34500, status: "Delivered", items: 1, payment: "Paid" },
  { id: "ORD-004", date: "2026-06-25", customer: { name: "Vikram Singh", email: "vikram@example.com" }, total: 78500, status: "Processing", items: 1, payment: "COD" },
  { id: "ORD-005", date: "2026-06-20", customer: { name: "Neha Gupta", email: "neha@example.com" }, total: 28999, status: "Cancelled", items: 1, payment: "Refunded" },
];

export default function AdminOrdersPage() {
  const [query, setQuery] = useState("");

  const filteredOrders = MOCK_ORDERS.filter(o => 
    o.id.toLowerCase().includes(query.toLowerCase()) || 
    o.customer.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-3xl text-obsidian">Orders</h1>
          <p className="text-neutral-500 mt-1">Manage and fulfill customer orders.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-card border border-neutral-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-neutral-100 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search by Order ID or Customer Name..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-gold transition-colors"
            />
          </div>
          <div className="flex gap-2">
            <button className="inline-flex items-center gap-2 px-4 py-2 border border-neutral-200 rounded-xl text-sm font-medium text-neutral-600 hover:bg-neutral-50 transition-colors shrink-0">
              <Filter className="w-4 h-4" />
              Filters
            </button>
            <button className="inline-flex items-center gap-2 px-4 py-2 border border-neutral-200 rounded-xl text-sm font-medium text-neutral-600 hover:bg-neutral-50 transition-colors shrink-0">
              <FileText className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50/50">
                <th className="px-6 py-4 text-xs uppercase tracking-wider text-neutral-500 font-medium border-b border-neutral-100">Order ID</th>
                <th className="px-6 py-4 text-xs uppercase tracking-wider text-neutral-500 font-medium border-b border-neutral-100">Date</th>
                <th className="px-6 py-4 text-xs uppercase tracking-wider text-neutral-500 font-medium border-b border-neutral-100">Customer</th>
                <th className="px-6 py-4 text-xs uppercase tracking-wider text-neutral-500 font-medium border-b border-neutral-100">Total</th>
                <th className="px-6 py-4 text-xs uppercase tracking-wider text-neutral-500 font-medium border-b border-neutral-100">Payment</th>
                <th className="px-6 py-4 text-xs uppercase tracking-wider text-neutral-500 font-medium border-b border-neutral-100">Status</th>
                <th className="px-6 py-4 text-xs uppercase tracking-wider text-neutral-500 font-medium border-b border-neutral-100 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-neutral-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-obsidian">{order.id}</td>
                  <td className="px-6 py-4 text-sm text-neutral-500">{order.date}</td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-obsidian">{order.customer.name}</p>
                    <p className="text-xs text-neutral-400">{order.customer.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-obsidian">{formatPrice(order.total)}</p>
                    <p className="text-xs text-neutral-400">{order.items} item(s)</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
                      order.payment === 'Paid' ? 'bg-success/10 text-success' : 
                      order.payment === 'Refunded' ? 'bg-neutral-100 text-neutral-600' : 
                      'bg-warning/10 text-warning-dark'
                    }`}>
                      {order.payment}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider ${
                      order.status === 'Delivered' ? 'bg-success/10 text-success' :
                      order.status === 'Processing' ? 'bg-blue-100 text-blue-700' :
                      order.status === 'Shipped' ? 'bg-purple-100 text-purple-700' :
                      'bg-destructive/10 text-destructive'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-1.5 text-neutral-400 hover:text-gold transition-colors" title="View Details">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-neutral-400 hover:text-obsidian transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredOrders.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-sm text-neutral-500">No orders found matching your search.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
