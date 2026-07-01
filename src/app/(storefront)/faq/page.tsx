"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants";

const FAQ_CATEGORIES = [
  {
    title: "Orders & Shipping",
    faqs: [
      { q: "How long does delivery take?", a: "Standard delivery takes 5-7 business days across India. Express delivery (2-3 business days) is available at checkout for an additional charge." },
      { q: "Do you offer free shipping?", a: "Yes! We offer free standard shipping on all orders above ₹999. Orders below ₹999 have a flat shipping charge of ₹99." },
      { q: "Can I track my order?", a: "Absolutely! Once your order is shipped, you'll receive an email and SMS with a tracking number. You can also track your order from your account dashboard." },
      { q: "Do you ship internationally?", a: "Currently, we ship only within India. International shipping will be available soon." },
    ],
  },
  {
    title: "Returns & Exchanges",
    faqs: [
      { q: "What is your return policy?", a: "We offer a 15-day hassle-free return policy. Items must be in their original condition with all tags and packaging intact." },
      { q: "Do you offer lifetime exchange?", a: "Yes! All gold jewelry comes with a lifetime exchange policy. You can exchange your old piece for any new design of equal or higher value." },
      { q: "How do I initiate a return?", a: "Simply log into your account, go to 'My Orders', select the item, and click 'Return'. Our team will arrange a pickup within 2-3 days." },
    ],
  },
  {
    title: "Product & Quality",
    faqs: [
      { q: "Are your products BIS hallmarked?", a: "Yes, all our gold and silver jewelry is BIS hallmarked, guaranteeing the purity of the metal used." },
      { q: "Do diamonds come with certification?", a: "All our diamond jewelry above ₹25,000 comes with IGI or GIA certification, verifying the 4Cs of every stone." },
      { q: `How do I care for my ${APP_NAME} jewelry?`, a: "Store in the provided box away from moisture. Clean gently with a soft cloth. Remove before swimming or using chemicals. We recommend annual professional cleaning for diamond pieces." },
    ],
  },
  {
    title: "Payments",
    faqs: [
      { q: "What payment methods do you accept?", a: "We accept UPI, credit/debit cards (Visa, Mastercard, RuPay), net banking, wallets, and Cash on Delivery (COD)." },
      { q: "Is COD available?", a: "Yes, Cash on Delivery is available for orders up to ₹50,000 across most serviceable pincodes in India." },
      { q: "Are payments secure?", a: "Absolutely! All transactions are processed through Razorpay/Cashfree with 256-bit SSL encryption. We never store your card details." },
    ],
  },
];

function FAQItem({ faq }: { faq: { q: string; a: string } }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-neutral-100 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left group"
      >
        <span className={cn("text-sm font-medium transition-colors", open ? "text-gold-dark" : "text-obsidian group-hover:text-gold-dark")}>
          {faq.q}
        </span>
        <ChevronDown className={cn("w-4 h-4 text-neutral-400 transition-transform duration-300", open && "rotate-180 text-gold")} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <p className="text-sm text-neutral-500 leading-relaxed pb-4 pl-0 pr-8">
              {faq.a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQPage() {
  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-b from-champagne-light to-ivory py-16 md:py-20">
        <div className="container-luxury text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <HelpCircle className="w-8 h-8 text-gold mx-auto mb-4" />
            <h1 className="font-heading text-3xl md:text-5xl text-obsidian">Frequently Asked Questions</h1>
            <p className="text-neutral-400 mt-3 text-sm">Everything you need to know about {APP_NAME}</p>
          </motion.div>
        </div>
      </section>

      <div className="container-luxury py-16 max-w-3xl mx-auto">
        <div className="space-y-10">
          {FAQ_CATEGORIES.map((category, i) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <h2 className="font-heading text-xl text-obsidian mb-4">{category.title}</h2>
              <div className="bg-white rounded-xl border border-neutral-100 px-6">
                {category.faqs.map((faq) => (
                  <FAQItem key={faq.q} faq={faq} />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
