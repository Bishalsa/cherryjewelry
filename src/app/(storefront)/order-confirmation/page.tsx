"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { CheckCircle2, Package, ShoppingBag, Loader2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface OrderData {
  orderNumber: string;
  createdAt: string;
  paymentMethod: string;
  total: number;
  email: string;
}

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    const fetchOrderDetails = async () => {
      try {
        const res = await fetch(`/api/orders/confirmation?orderId=${orderId}`);
        const data = await res.json();
        if (res.ok && data.success && data.order) {
          setOrder(data.order);
        }
      } catch (err) {
        console.error("Error fetching order confirmation details", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50/50 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-rose-gold animate-spin" />
        <p className="text-neutral-400 text-sm font-medium">Confirming order details...</p>
      </div>
    );
  }

  // Fallback metadata if order id was missing or fetch failed
  const resolvedOrderNumber = order?.orderNumber || searchParams.get("orderNumber") || "ORD-" + Math.floor(100000 + Math.random() * 900000);
  const resolvedDateStr = order?.createdAt 
    ? new Date(order.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })
    : new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" });
  const resolvedPaymentMethod = order?.paymentMethod === "COD" ? "Cash on Delivery" : "Online Payment";
  const resolvedTotal = order?.total || 0;

  return (
    <div className="min-h-screen bg-neutral-50/50 py-12 md:py-20">
      <div className="container-luxury max-w-3xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-3xl p-8 md:p-12 shadow-card text-center"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-success/10 rounded-full mb-6">
            <CheckCircle2 className="w-10 h-10 text-success" />
          </div>

          <h1 className="font-heading text-3xl md:text-4xl text-deep-plum mb-4">
            Thank you for your order!
          </h1>

          <p className="text-neutral-500 mb-8 max-w-lg mx-auto">
            Your order has been placed successfully. We&apos;ve sent a confirmation email to <strong className="text-deep-plum">{order?.email || "your registered email"}</strong> with your order details and tracking information.
          </p>

          <div className="bg-neutral-50 rounded-2xl p-6 mb-8 inline-block w-full max-w-md mx-auto border border-neutral-100 text-left">
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-neutral-200">
              <span className="text-sm text-neutral-500">Order Number</span>
              <span className="font-medium text-deep-plum">{resolvedOrderNumber}</span>
            </div>
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-neutral-200">
              <span className="text-sm text-neutral-500">Date</span>
              <span className="font-medium text-deep-plum">{resolvedDateStr}</span>
            </div>
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-neutral-200">
              <span className="text-sm text-neutral-500">Payment Method</span>
              <span className="font-medium text-deep-plum">{resolvedPaymentMethod}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-deep-plum">Total Amount</span>
              <span className="text-lg font-heading text-rose-gold-dark">{formatPrice(resolvedTotal)}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
            <Link
              href="/collections"
              className="flex items-center justify-center gap-2 px-6 py-3.5 bg-deep-plum text-white rounded-full text-sm font-medium hover:bg-neutral-800 transition-colors btn-glow"
            >
              <ShoppingBag className="w-4 h-4" />
              Continue Shopping
            </Link>
            <Link
              href="/account"
              className="flex items-center justify-center gap-2 px-6 py-3.5 border border-neutral-200 text-neutral-600 rounded-full text-sm font-medium hover:bg-neutral-50 transition-colors"
            >
              <Package className="w-4 h-4" />
              Go to Account
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-neutral-50/50 flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-10 h-10 text-rose-gold animate-spin" />
          <p className="text-neutral-400 text-sm font-medium">Loading confirmation details...</p>
        </div>
      }
    >
      <OrderConfirmationContent />
    </Suspense>
  );
}
