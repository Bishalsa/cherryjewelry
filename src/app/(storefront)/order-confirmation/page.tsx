"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { CheckCircle2, ChevronRight, Package, Download, Home, ShoppingBag } from "lucide-react";
import { formatPrice } from "@/lib/utils";

export default function OrderConfirmationPage() {
  const orderNumber = "ORD-" + Math.floor(100000 + Math.random() * 900000);
  
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
          
          <h1 className="font-heading text-3xl md:text-4xl text-obsidian mb-4">
            Thank you for your order!
          </h1>
          
          <p className="text-neutral-500 mb-8 max-w-lg mx-auto">
            Your order has been placed successfully. We've sent a confirmation email with your order details and tracking information.
          </p>
          
          <div className="bg-neutral-50 rounded-2xl p-6 mb-8 inline-block w-full max-w-md mx-auto border border-neutral-100 text-left">
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-neutral-200">
              <span className="text-sm text-neutral-500">Order Number</span>
              <span className="font-medium text-obsidian">{orderNumber}</span>
            </div>
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-neutral-200">
              <span className="text-sm text-neutral-500">Date</span>
              <span className="font-medium text-obsidian">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-neutral-200">
              <span className="text-sm text-neutral-500">Payment Method</span>
              <span className="font-medium text-obsidian">Online Payment</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-obsidian">Total Amount</span>
              <span className="text-lg font-heading text-gold-dark">{formatPrice(125400)}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
            <Link 
              href="/collections" 
              className="flex items-center justify-center gap-2 px-6 py-3.5 bg-obsidian text-white rounded-full text-sm font-medium hover:bg-neutral-800 transition-colors btn-glow"
            >
              <ShoppingBag className="w-4 h-4" />
              Continue Shopping
            </Link>
            <button className="flex items-center justify-center gap-2 px-6 py-3.5 border border-neutral-200 text-neutral-600 rounded-full text-sm font-medium hover:bg-neutral-50 transition-colors">
              <Package className="w-4 h-4" />
              Track Order
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
