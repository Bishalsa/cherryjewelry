"use client";

import { useState, useEffect } from "react";
import { Tag, Plus, Edit, Trash2, Loader2, X, Check, Calendar } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";

interface CouponItem {
  id: string;
  code: string;
  description: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  minOrderAmount: number;
  maxDiscount: number | null;
  usedCount: number;
  usageLimit: number | null;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
}

export default function AdminDiscountsPage() {
  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<CouponItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    code: "",
    description: "",
    type: "PERCENTAGE" as "PERCENTAGE" | "FIXED",
    value: "20",
    minOrderAmount: "999",
    maxDiscount: "2000",
    usageLimit: "100",
    isActive: true,
  });

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/coupons");
      const data = await res.json();
      if (data.success) {
        setCoupons(data.coupons);
      }
    } catch {
      toast.error("Failed to fetch coupons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleOpenCreate = () => {
    setEditingCoupon(null);
    setFormData({
      code: "",
      description: "",
      type: "PERCENTAGE",
      value: "20",
      minOrderAmount: "999",
      maxDiscount: "2000",
      usageLimit: "100",
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code) {
      toast.error("Coupon code is required");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...(editingCoupon && { id: editingCoupon.id }),
        code: formData.code,
        description: formData.description,
        type: formData.type,
        value: Number(formData.value),
        minOrderAmount: Number(formData.minOrderAmount),
        maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : null,
        usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
        isActive: formData.isActive,
      };

      const method = editingCoupon ? "PUT" : "POST";
      const res = await fetch("/api/admin/coupons", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(editingCoupon ? "Coupon updated" : "Coupon created!");
        setIsModalOpen(false);
        fetchCoupons();
      } else {
        toast.error(data.error || "Operation failed");
      }
    } catch {
      toast.error("Error saving coupon");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;
    try {
      const res = await fetch(`/api/admin/coupons?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success("Coupon deleted");
        fetchCoupons();
      }
    } catch {
      toast.error("Error deleting coupon");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl text-deep-plum">
            Discount & Promotional Coupons
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Create percentage or flat discounts to drive storefront marketing conversions.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 bg-deep-plum text-white px-5 py-2.5 rounded-xl text-xs font-medium hover:bg-deep-plum-dark transition-colors shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Create Coupon
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-neutral-400 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-rose-gold" /> Loading coupons...
          </div>
        ) : coupons.length === 0 ? (
          <div className="p-12 text-center">
            <Tag className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-deep-plum mb-1">No coupons active</p>
            <p className="text-xs text-neutral-400 mb-4">Create your first promo code (e.g. CHERRY20).</p>
            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 bg-rose-gold text-white px-4 py-2 rounded-xl text-xs font-medium"
            >
              <Plus className="w-3.5 h-3.5" /> Create Coupon
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50/50 text-[10px] uppercase tracking-wider text-neutral-400 font-semibold">
                  <th className="py-3.5 px-4">Coupon Code</th>
                  <th className="py-3.5 px-4">Discount Value</th>
                  <th className="py-3.5 px-4">Min Order</th>
                  <th className="py-3.5 px-4">Times Used</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-xs">
                {coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-deep-plum">
                      {c.code}
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-rose-gold-dark">
                      {c.type === "PERCENTAGE" ? `${c.value}% OFF` : formatPrice(c.value)}
                    </td>

                    <td className="py-3.5 px-4 text-neutral-600">
                      {formatPrice(c.minOrderAmount)}
                    </td>

                    <td className="py-3.5 px-4 text-neutral-500">
                      {c.usedCount} {c.usageLimit ? `/ ${c.usageLimit}` : "uses"}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                          c.isActive ? "bg-emerald-50 text-emerald-600" : "bg-neutral-100 text-neutral-400"
                        }`}
                      >
                        {c.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right space-x-1">
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="p-1.5 hover:bg-rose-50 text-neutral-400 hover:text-rose-600 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Create Coupon */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsModalOpen(false)} className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="bg-white rounded-3xl shadow-luxury border border-neutral-100 w-full max-w-md relative z-10 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="font-heading text-lg text-deep-plum">Create Discount Code</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-neutral-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="uppercase tracking-wider text-neutral-400 font-medium">Coupon Code *</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="CHERRY20"
                  className="w-full px-3.5 py-2 border border-neutral-200 rounded-xl font-mono uppercase focus:outline-none focus:border-rose-gold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="uppercase tracking-wider text-neutral-400 font-medium">Discount Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-3.5 py-2 border border-neutral-200 rounded-xl bg-white focus:outline-none focus:border-rose-gold font-semibold"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed Amount (₹)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="uppercase tracking-wider text-neutral-400 font-medium">Discount Value *</label>
                  <input
                    type="number"
                    required
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    placeholder="20"
                    className="w-full px-3.5 py-2 border border-neutral-200 rounded-xl focus:outline-none focus:border-rose-gold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="uppercase tracking-wider text-neutral-400 font-medium">Minimum Order Amount (₹)</label>
                <input
                  type="number"
                  value={formData.minOrderAmount}
                  onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                  placeholder="999"
                  className="w-full px-3.5 py-2 border border-neutral-200 rounded-xl focus:outline-none focus:border-rose-gold"
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-neutral-100 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-neutral-200 rounded-xl text-neutral-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-deep-plum text-white px-5 py-2 rounded-xl font-medium hover:bg-deep-plum-dark"
                >
                  Save Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
