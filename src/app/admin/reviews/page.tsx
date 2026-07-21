"use client";

import { useState, useEffect } from "react";
import { Star, Check, X, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ReviewItem {
  id: string;
  rating: number;
  title: string;
  content: string;
  isApproved: boolean;
  isVerified: boolean;
  createdAt: string;
  product?: { name: string; slug: string };
  user?: { name: string; email: string };
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/reviews");
      const data = await res.json();
      if (data.success) {
        setReviews(data.reviews);
      }
    } catch {
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleToggleApprove = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch("/api/admin/reviews", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isApproved: !currentStatus }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(!currentStatus ? "Review approved" : "Review hidden");
        fetchReviews();
      }
    } catch {
      toast.error("Error updating review moderation");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    try {
      const res = await fetch(`/api/admin/reviews?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success("Review deleted");
        fetchReviews();
      }
    } catch {
      toast.error("Error deleting review");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl text-deep-plum">
          Customer Reviews Moderation
        </h1>
        <p className="text-xs text-neutral-400 mt-1">
          Approve or reject customer product ratings and social proof before they appear on the storefront.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-neutral-400 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-rose-gold" /> Loading reviews...
          </div>
        ) : reviews.length === 0 ? (
          <div className="p-12 text-center">
            <Star className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-deep-plum mb-1">No reviews submitted yet</p>
            <p className="text-xs text-neutral-400">Customer feedback will appear here for review.</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {reviews.map((r) => (
              <div key={r.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-neutral-50/50 transition-colors">
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <div className="flex text-amber-400">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "w-3.5 h-3.5",
                            i < r.rating ? "fill-amber-400 text-amber-400" : "text-neutral-200"
                          )}
                        />
                      ))}
                    </div>
                    <span className="font-semibold text-deep-plum text-xs">{r.title}</span>
                    {r.isVerified && (
                      <span className="text-[9px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-semibold">
                        Verified Purchase
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-neutral-600 leading-relaxed">{r.content}</p>

                  <p className="text-[11px] text-neutral-400">
                    By <span className="font-medium text-deep-plum">{r.user?.name || "Customer"}</span> on product{" "}
                    <span className="font-medium text-rose-gold-dark">{r.product?.name}</span> · {new Date(r.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleApprove(r.id, r.isApproved)}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer",
                      r.isApproved
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                        : "bg-amber-50 text-amber-600 border border-amber-200 hover:bg-emerald-500 hover:text-white"
                    )}
                  >
                    {r.isApproved ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> Approved
                      </>
                    ) : (
                      "Approve Review"
                    )}
                  </button>

                  <button
                    onClick={() => handleDelete(r.id)}
                    className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Delete Review"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
