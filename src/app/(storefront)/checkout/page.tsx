"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ChevronRight,
  CreditCard,
  Truck,
  User,
  MapPin,
  Check,
  ShieldCheck,
  Lock,
  ArrowLeft,
} from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { formatPrice, cn } from "@/lib/utils";
import { APP_NAME, FREE_SHIPPING_THRESHOLD, SHIPPING_COST } from "@/lib/constants";

type Step = "contact" | "shipping" | "payment" | "review";

const STEPS: { id: Step; label: string; icon: React.ElementType }[] = [
  { id: "contact", label: "Contact", icon: User },
  { id: "shipping", label: "Shipping", icon: MapPin },
  { id: "payment", label: "Payment", icon: CreditCard },
  { id: "review", label: "Review", icon: Check },
];

export default function CheckoutPage() {
  const [currentStep, setCurrentStep] = useState<Step>("contact");
  const { items, getSubtotal, getShipping, getItemCount } = useCartStore();
  const subtotal = getSubtotal();
  const shipping = getShipping();
  const total = subtotal + shipping;
  const stepIndex = STEPS.findIndex((s) => s.id === currentStep);

  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    firstName: "",
    lastName: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    pincode: "",
    paymentMethod: "razorpay",
    gstNumber: "",
    orderNotes: "",
  });

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    const idx = STEPS.findIndex((s) => s.id === currentStep);
    if (idx < STEPS.length - 1) setCurrentStep(STEPS[idx + 1].id);
  };

  const prevStep = () => {
    const idx = STEPS.findIndex((s) => s.id === currentStep);
    if (idx > 0) setCurrentStep(STEPS[idx - 1].id);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-5xl mb-4">🛒</p>
          <h2 className="font-heading text-2xl text-obsidian mb-2">Your cart is empty</h2>
          <p className="text-sm text-neutral-400 mb-6">Add some items before checking out.</p>
          <Link href="/collections" className="inline-flex items-center gap-2 bg-obsidian text-white px-6 py-3 rounded-full text-sm hover:bg-neutral-800 transition-colors">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50/50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-100">
        <div className="container-luxury py-4 flex items-center justify-between">
          <Link href="/" className="font-heading text-xl tracking-[0.15em] text-obsidian">
            {APP_NAME}
          </Link>
          <div className="flex items-center gap-1 text-xs text-neutral-400">
            <Lock className="w-3 h-3" />
            Secure Checkout
          </div>
        </div>
      </header>

      {/* Step Indicators */}
      <div className="bg-white border-b border-neutral-100">
        <div className="container-luxury py-4">
          <div className="flex items-center justify-center gap-2 md:gap-8">
            {STEPS.map((step, i) => {
              const isCompleted = i < stepIndex;
              const isCurrent = step.id === currentStep;
              const Icon = step.icon;
              return (
                <div key={step.id} className="flex items-center gap-2 md:gap-3">
                  <button
                    onClick={() => i < stepIndex && setCurrentStep(step.id)}
                    disabled={i > stepIndex}
                    className={cn(
                      "flex items-center gap-2 text-xs font-medium transition-colors",
                      isCurrent ? "text-gold-dark" : isCompleted ? "text-success cursor-pointer" : "text-neutral-300 cursor-not-allowed"
                    )}
                  >
                    <div className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors",
                      isCurrent ? "bg-gold text-white" : isCompleted ? "bg-success text-white" : "bg-neutral-100 text-neutral-400"
                    )}>
                      {isCompleted ? <Check className="w-3 h-3" /> : i + 1}
                    </div>
                    <span className="hidden sm:inline">{step.label}</span>
                  </button>
                  {i < STEPS.length - 1 && (
                    <ChevronRight className="w-4 h-4 text-neutral-200" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-luxury py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {currentStep === "contact" && (
                  <div className="bg-white rounded-2xl p-6 md:p-8 shadow-card">
                    <h2 className="font-heading text-xl text-obsidian mb-6">Contact Information</h2>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="checkout-email" className="block text-sm font-medium text-obsidian mb-1.5">Email Address</label>
                        <input id="checkout-email" type="email" value={formData.email} onChange={(e) => updateField("email", e.target.value)} placeholder="john@example.com" className="w-full px-4 py-3 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-gold transition-colors" required />
                      </div>
                      <div>
                        <label htmlFor="checkout-phone" className="block text-sm font-medium text-obsidian mb-1.5">Phone Number</label>
                        <input id="checkout-phone" type="tel" value={formData.phone} onChange={(e) => updateField("phone", e.target.value)} placeholder="+91 98765 43210" className="w-full px-4 py-3 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-gold transition-colors" required />
                      </div>
                    </div>
                    <div className="flex justify-end mt-8">
                      <button onClick={nextStep} className="flex items-center gap-2 bg-obsidian text-white px-8 py-3 rounded-full text-sm font-medium hover:bg-neutral-800 transition-colors">
                        Continue to Shipping <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {currentStep === "shipping" && (
                  <div className="bg-white rounded-2xl p-6 md:p-8 shadow-card">
                    <h2 className="font-heading text-xl text-obsidian mb-6">Shipping Address</h2>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="checkout-fn" className="block text-sm font-medium text-obsidian mb-1.5">First Name</label>
                          <input id="checkout-fn" type="text" value={formData.firstName} onChange={(e) => updateField("firstName", e.target.value)} className="w-full px-4 py-3 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-gold transition-colors" required />
                        </div>
                        <div>
                          <label htmlFor="checkout-ln" className="block text-sm font-medium text-obsidian mb-1.5">Last Name</label>
                          <input id="checkout-ln" type="text" value={formData.lastName} onChange={(e) => updateField("lastName", e.target.value)} className="w-full px-4 py-3 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-gold transition-colors" required />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="checkout-addr1" className="block text-sm font-medium text-obsidian mb-1.5">Address Line 1</label>
                        <input id="checkout-addr1" type="text" value={formData.address1} onChange={(e) => updateField("address1", e.target.value)} placeholder="House/Flat no., Street" className="w-full px-4 py-3 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-gold transition-colors" required />
                      </div>
                      <div>
                        <label htmlFor="checkout-addr2" className="block text-sm font-medium text-obsidian mb-1.5">Address Line 2 (Optional)</label>
                        <input id="checkout-addr2" type="text" value={formData.address2} onChange={(e) => updateField("address2", e.target.value)} placeholder="Landmark, Area" className="w-full px-4 py-3 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-gold transition-colors" />
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label htmlFor="checkout-pin" className="block text-sm font-medium text-obsidian mb-1.5">Pincode</label>
                          <input id="checkout-pin" type="text" value={formData.pincode} onChange={(e) => updateField("pincode", e.target.value)} maxLength={6} className="w-full px-4 py-3 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-gold transition-colors" required />
                        </div>
                        <div>
                          <label htmlFor="checkout-city" className="block text-sm font-medium text-obsidian mb-1.5">City</label>
                          <input id="checkout-city" type="text" value={formData.city} onChange={(e) => updateField("city", e.target.value)} className="w-full px-4 py-3 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-gold transition-colors" required />
                        </div>
                        <div>
                          <label htmlFor="checkout-state" className="block text-sm font-medium text-obsidian mb-1.5">State</label>
                          <input id="checkout-state" type="text" value={formData.state} onChange={(e) => updateField("state", e.target.value)} className="w-full px-4 py-3 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-gold transition-colors" required />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="checkout-gst" className="block text-sm font-medium text-obsidian mb-1.5">GST Number (Optional)</label>
                        <input id="checkout-gst" type="text" value={formData.gstNumber} onChange={(e) => updateField("gstNumber", e.target.value)} placeholder="22AAAAA0000A1Z5" className="w-full px-4 py-3 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-gold transition-colors" />
                      </div>
                    </div>
                    <div className="flex justify-between mt-8">
                      <button onClick={prevStep} className="flex items-center gap-2 text-sm text-neutral-400 hover:text-obsidian transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Back
                      </button>
                      <button onClick={nextStep} className="flex items-center gap-2 bg-obsidian text-white px-8 py-3 rounded-full text-sm font-medium hover:bg-neutral-800 transition-colors">
                        Continue to Payment <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {currentStep === "payment" && (
                  <div className="bg-white rounded-2xl p-6 md:p-8 shadow-card">
                    <h2 className="font-heading text-xl text-obsidian mb-6">Payment Method</h2>
                    <div className="space-y-3">
                      {[
                        { id: "razorpay", label: "Pay Online", desc: "UPI, Cards, Net Banking, Wallets", icon: "💳" },
                        { id: "cod", label: "Cash on Delivery", desc: "Pay when you receive your order", icon: "💵" },
                      ].map((method) => (
                        <button
                          key={method.id}
                          onClick={() => updateField("paymentMethod", method.id)}
                          className={cn(
                            "w-full flex items-center gap-4 p-4 border rounded-xl text-left transition-all",
                            formData.paymentMethod === method.id
                              ? "border-gold bg-gold/5"
                              : "border-neutral-200 hover:border-gold/30"
                          )}
                        >
                          <span className="text-2xl">{method.icon}</span>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-obsidian">{method.label}</p>
                            <p className="text-xs text-neutral-400">{method.desc}</p>
                          </div>
                          <div className={cn(
                            "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                            formData.paymentMethod === method.id ? "border-gold" : "border-neutral-200"
                          )}>
                            {formData.paymentMethod === method.id && (
                              <div className="w-2.5 h-2.5 bg-gold rounded-full" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                    <div>
                      <label htmlFor="checkout-notes" className="block text-sm font-medium text-obsidian mb-1.5 mt-6">Order Notes (Optional)</label>
                      <textarea id="checkout-notes" value={formData.orderNotes} onChange={(e) => updateField("orderNotes", e.target.value)} placeholder="Any special instructions..." rows={3} className="w-full px-4 py-3 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-gold transition-colors resize-none" />
                    </div>
                    <div className="flex justify-between mt-8">
                      <button onClick={prevStep} className="flex items-center gap-2 text-sm text-neutral-400 hover:text-obsidian transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Back
                      </button>
                      <button onClick={nextStep} className="flex items-center gap-2 bg-obsidian text-white px-8 py-3 rounded-full text-sm font-medium hover:bg-neutral-800 transition-colors">
                        Review Order <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {currentStep === "review" && (
                  <div className="bg-white rounded-2xl p-6 md:p-8 shadow-card">
                    <h2 className="font-heading text-xl text-obsidian mb-6">Review Your Order</h2>
                    <div className="space-y-4 mb-6">
                      <div className="p-4 bg-neutral-50 rounded-xl">
                        <h4 className="text-xs uppercase tracking-wider text-neutral-400 mb-2">Contact</h4>
                        <p className="text-sm text-obsidian">{formData.email || "—"}</p>
                        <p className="text-sm text-neutral-400">{formData.phone || "—"}</p>
                      </div>
                      <div className="p-4 bg-neutral-50 rounded-xl">
                        <h4 className="text-xs uppercase tracking-wider text-neutral-400 mb-2">Shipping Address</h4>
                        <p className="text-sm text-obsidian">
                          {formData.firstName} {formData.lastName}<br />
                          {formData.address1}{formData.address2 ? `, ${formData.address2}` : ""}<br />
                          {formData.city}, {formData.state} {formData.pincode}
                        </p>
                      </div>
                      <div className="p-4 bg-neutral-50 rounded-xl">
                        <h4 className="text-xs uppercase tracking-wider text-neutral-400 mb-2">Payment</h4>
                        <p className="text-sm text-obsidian">
                          {formData.paymentMethod === "razorpay" ? "Online Payment (UPI/Cards/Net Banking)" : "Cash on Delivery"}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <button onClick={prevStep} className="flex items-center gap-2 text-sm text-neutral-400 hover:text-obsidian transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Back
                      </button>
                      <button className="flex items-center gap-2 bg-gold text-white px-8 py-3 rounded-full text-sm font-medium hover:bg-gold-dark transition-colors btn-glow">
                        <ShieldCheck className="w-4 h-4" />
                        Place Order — {formatPrice(total)}
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-card sticky top-28">
              <h3 className="font-heading text-lg text-obsidian mb-4">Order Summary</h3>
              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="w-12 h-14 bg-neutral-100 rounded-lg flex items-center justify-center shrink-0 relative">
                      <span className="text-lg opacity-20">💎</span>
                      <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-neutral-500 text-white text-[10px] rounded-full flex items-center justify-center">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-obsidian truncate">{item.product.name}</p>
                      {item.variant && <p className="text-[10px] text-neutral-400">{item.variant.name}</p>}
                    </div>
                    <p className="text-xs font-semibold">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
              <div className="divider-gold my-4" />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-neutral-500">
                  <span>Subtotal ({getItemCount()} items)</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-neutral-500">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? <span className="text-success">Free</span> : formatPrice(shipping)}</span>
                </div>
                <div className="divider-gold my-2" />
                <div className="flex justify-between font-semibold text-base">
                  <span>Total</span>
                  <span className="text-gold-dark">{formatPrice(total)}</span>
                </div>
              </div>
              <p className="text-[10px] text-neutral-400 text-center mt-3">
                Tax included. Final amount may vary.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
