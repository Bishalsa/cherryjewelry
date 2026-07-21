"use client";

import { useState, useEffect } from "react";
import { Users, Search, Loader2, Mail, Phone, ShoppingBag, Award, Eye, X } from "lucide-react";
import { formatPrice, cn } from "@/lib/utils";
import { toast } from "sonner";

interface CustomerItem {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: string;
  createdAt: string;
  orders?: Array<{ id: string; total: number; createdAt: string; status: string }>;
  _count?: { orders: number; wishlist: number };
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerItem | null>(null);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/customers");
      const data = await res.json();
      if (data.success) {
        setCustomers(data.customers);
      } else {
        toast.error(data.error || "Failed to load customers");
      }
    } catch {
      toast.error("Network error fetching customers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.email.toLowerCase().includes(query.toLowerCase()) ||
      (c.phone && c.phone.includes(query))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl text-deep-plum">
            Customer Directory
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            View registered buyers, lifetime spend metrics, and individual order history.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-100 shadow-sm flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, email, or phone..."
            className="w-full pl-10 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:border-rose-gold"
          />
        </div>
        <div className="text-xs text-neutral-400 font-medium">
          Total Registered: {filtered.length} Customers
        </div>
      </div>

      {/* Customer Table */}
      <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-neutral-400 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-rose-gold" /> Loading customer list...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-deep-plum mb-1">No customers found</p>
            <p className="text-xs text-neutral-400">Try adjusting search query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50/50 text-[10px] uppercase tracking-wider text-neutral-400 font-semibold">
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Orders Placed</th>
                  <th className="py-3.5 px-4">Lifetime Spend</th>
                  <th className="py-3.5 px-4">Joined Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-xs">
                {filtered.map((c) => {
                  const ordersCount = c.orders?.length || c._count?.orders || 0;
                  const totalSpend = c.orders?.reduce((sum, o) => sum + Number(o.total), 0) || 0;

                  return (
                    <tr key={c.id} className="hover:bg-neutral-50/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-rose-gold to-rose-gold-dark text-white font-bold flex items-center justify-center text-xs uppercase shadow-sm">
                            {c.name.slice(0, 2)}
                          </div>
                          <div>
                            <p className="font-semibold text-deep-plum">{c.name}</p>
                            <span className="text-[10px] bg-rose-gold/10 text-rose-gold-dark font-medium px-2 py-0.5 rounded-full uppercase">
                              {c.role}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="text-neutral-600 font-medium">{c.email}</p>
                        <p className="text-[11px] text-neutral-400">{c.phone || "No phone"}</p>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-deep-plum">
                        {ordersCount} orders
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-deep-plum">
                        {formatPrice(totalSpend)}
                      </td>

                      <td className="py-3.5 px-4 text-neutral-400">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedCustomer(c)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-deep-plum hover:text-white text-deep-plum font-medium rounded-xl text-xs transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" /> View Profile
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Customer Profile Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setSelectedCustomer(null)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
          />
          <div className="bg-white rounded-3xl shadow-luxury border border-neutral-100 w-full max-w-lg relative z-10 p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="font-heading text-xl text-deep-plum">Customer Profile</h3>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-1 text-neutral-400 hover:text-neutral-600 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 bg-neutral-50 p-4 rounded-2xl border border-neutral-100">
                <div className="w-12 h-12 rounded-full bg-rose-gold text-white font-bold flex items-center justify-center text-sm">
                  {selectedCustomer.name.slice(0, 2)}
                </div>
                <div>
                  <h4 className="font-semibold text-deep-plum text-sm">{selectedCustomer.name}</h4>
                  <p className="text-xs text-neutral-500">{selectedCustomer.email}</p>
                  <p className="text-xs text-neutral-500">{selectedCustomer.phone || "No phone number"}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold">Total Orders</p>
                  <p className="text-lg font-heading text-deep-plum font-bold mt-0.5">
                    {selectedCustomer.orders?.length || 0}
                  </p>
                </div>
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold">Total Spend</p>
                  <p className="text-lg font-heading text-deep-plum font-bold mt-0.5">
                    {formatPrice(
                      selectedCustomer.orders?.reduce((sum, o) => sum + Number(o.total), 0) || 0
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
