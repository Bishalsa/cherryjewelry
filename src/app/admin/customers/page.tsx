"use client";

import { useState, useEffect } from "react";
import { Search, Loader2, Users, ShoppingBag } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  ordersCount: number;
  totalSpent: number;
  role: string;
  isGuest: boolean;
  createdAt: string;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  const fetchCustomers = async () => {
    try {
      const res = await fetch("/api/admin/customers");
      const data = await res.json();
      if (data.success) {
        setCustomers(data.customers);
      } else {
        toast.error(data.error || "Failed to load customers list");
      }
    } catch {
      toast.error("Network error fetching customers");
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchCustomers();
      setLoading(false);
    };
    init();
  }, []);

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.email.toLowerCase().includes(query.toLowerCase()) ||
      c.phone.includes(query)
  );

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-gold animate-spin" />
        <p className="text-neutral-400 text-sm font-medium">Loading customers list...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-3xl text-obsidian">Customers</h1>
          <p className="text-neutral-500 mt-1">View store customers and their spending history.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-card border border-neutral-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-neutral-100 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search by Customer Name, Email, or Phone..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-gold transition-colors"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50/50">
                <th className="px-6 py-4 text-xs uppercase tracking-wider text-neutral-500 font-medium border-b border-neutral-100">Customer details</th>
                <th className="px-6 py-4 text-xs uppercase tracking-wider text-neutral-500 font-medium border-b border-neutral-100">Phone</th>
                <th className="px-6 py-4 text-xs uppercase tracking-wider text-neutral-500 font-medium border-b border-neutral-100">Joined</th>
                <th className="px-6 py-4 text-xs uppercase tracking-wider text-neutral-500 font-medium border-b border-neutral-100 text-center">Orders</th>
                <th className="px-6 py-4 text-xs uppercase tracking-wider text-neutral-500 font-medium border-b border-neutral-100 text-right">Total Spent</th>
                <th className="px-6 py-4 text-xs uppercase tracking-wider text-neutral-500 font-medium border-b border-neutral-100">Account Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-neutral-400 text-sm">
                    No customers found.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => {
                  const dateFormatted = new Date(customer.createdAt).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  });

                  return (
                    <tr key={customer.id} className="hover:bg-neutral-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-obsidian">{customer.name}</p>
                          <p className="text-xs text-neutral-400">{customer.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-500">{customer.phone}</td>
                      <td className="px-6 py-4 text-sm text-neutral-500">{dateFormatted}</td>
                      <td className="px-6 py-4 text-sm text-neutral-600 text-center font-medium">
                        <span className="inline-flex items-center gap-1">
                          <ShoppingBag className="w-3.5 h-3.5 text-neutral-400" />
                          {customer.ordersCount}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-obsidian text-right">
                        {formatPrice(customer.totalSpent)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider ${
                          customer.role === "ADMIN" ? "bg-gold/15 text-gold-dark" :
                          customer.isGuest ? "bg-neutral-100 text-neutral-500" :
                          "bg-success/10 text-success"
                        }`}>
                          {customer.role === "ADMIN" ? "Admin" : customer.isGuest ? "Guest" : "Member"}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
