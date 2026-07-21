// ============================================
// Cherry Jewelry — Application Constants
// ============================================

export const APP_NAME = "Cherry Jewelry";
export const APP_TAGLINE = "Where Artistry Meets Elegance";
export const APP_DESCRIPTION = "Discover exquisite handcrafted jewelry — rings, necklaces, earrings & bracelets. BIS Hallmarked rose-gold & certified diamonds. Free shipping above ₹999.";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://cherryjewelry.store";
export const APP_OG_IMAGE = "/og-image.jpg";

// Navigation
export const NAV_LINKS = [
  { label: "New Arrivals", href: "/collections/new-arrivals" },
  { label: "Rings", href: "/collections/rings" },
  { label: "Necklaces", href: "/collections/necklaces" },
  { label: "Earrings", href: "/collections/earrings" },
  { label: "Bracelets", href: "/collections/bracelets" },
  { label: "Pendants", href: "/collections/pendants" },
] as const;

export const FOOTER_LINKS = {
  shop: [
    { label: "New Arrivals", href: "/collections/new-arrivals" },
    { label: "Best Sellers", href: "/collections/best-sellers" },
    { label: "Rings", href: "/collections/rings" },
    { label: "Necklaces", href: "/collections/necklaces" },
    { label: "Earrings", href: "/collections/earrings" },
    { label: "Bracelets", href: "/collections/bracelets" },
  ],
  company: [
    { label: "About Us", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "/contact" },
    { label: "Careers", href: "/careers" },
  ],
  support: [
    { label: "FAQ", href: "/faq" },
    { label: "Shipping", href: "/shipping-policy" },
    { label: "Returns", href: "/returns" },
    { label: "Size Guide", href: "/size-guide" },
    { label: "Care Guide", href: "/care-guide" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Refund Policy", href: "/returns" },
  ],
} as const;

// Product categories
export const CATEGORIES = [
  { name: "Rings", slug: "rings", icon: "💍" },
  { name: "Necklaces", slug: "necklaces", icon: "📿" },
  { name: "Earrings", slug: "earrings", icon: "✨" },
  { name: "Bracelets", slug: "bracelets", icon: "⭐" },
  { name: "Pendants", slug: "pendants", icon: "💎" },
  { name: "Bangles", slug: "bangles", icon: "🌟" },
  { name: "Anklets", slug: "anklets", icon: "🦶" },
  { name: "Mangalsutra", slug: "mangalsutra", icon: "🪷" },
] as const;

// Materials
export const MATERIALS = [
  "Gold (22K)",
  "Gold (18K)",
  "Gold (14K)",
  "Rose Gold",
  "White Gold",
  "Platinum",
  "Silver (925)",
  "Diamond",
] as const;

// Order statuses
export const ORDER_STATUSES = {
  PENDING: { label: "Pending", color: "bg-yellow-100 text-yellow-800" },
  CONFIRMED: { label: "Confirmed", color: "bg-blue-100 text-blue-800" },
  PROCESSING: { label: "Processing", color: "bg-purple-100 text-purple-800" },
  SHIPPED: { label: "Shipped", color: "bg-indigo-100 text-indigo-800" },
  OUT_FOR_DELIVERY: { label: "Out for Delivery", color: "bg-orange-100 text-orange-800" },
  DELIVERED: { label: "Delivered", color: "bg-green-100 text-green-800" },
  CANCELLED: { label: "Cancelled", color: "bg-red-100 text-red-800" },
  RETURNED: { label: "Returned", color: "bg-gray-100 text-gray-800" },
  REFUNDED: { label: "Refunded", color: "bg-pink-100 text-pink-800" },
} as const;

// Payment methods
export const PAYMENT_METHODS = [
  { id: "razorpay", label: "Pay Online (UPI, Cards, Net Banking)", icon: "💳" },
  { id: "cashfree", label: "Cashfree", icon: "🏦" },
  { id: "cod", label: "Cash on Delivery", icon: "💵" },
] as const;

// Trust badges
export const TRUST_BADGES = [
  { icon: "Shield", label: "100% Certified", description: "BIS Hallmarked jewelry" },
  { icon: "Truck", label: "Free Shipping", description: "On orders above ₹999" },
  { icon: "RefreshCw", label: "Easy Returns", description: "15-day return policy" },
  { icon: "Lock", label: "Secure Payment", description: "256-bit SSL encryption" },
] as const;

// Free shipping threshold (INR)
export const FREE_SHIPPING_THRESHOLD = 999;
export const SHIPPING_COST = 99;

// Pagination
export const PRODUCTS_PER_PAGE = 12;
export const ORDERS_PER_PAGE = 10;
export const REVIEWS_PER_PAGE = 5;

// Image sizes
export const IMAGE_SIZES = {
  thumbnail: { width: 100, height: 100 },
  card: { width: 400, height: 500 },
  product: { width: 800, height: 1000 },
  hero: { width: 1920, height: 800 },
} as const;
