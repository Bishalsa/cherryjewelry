// ============================================
// LUMIÈRE — TypeScript Type Definitions
// ============================================

// --- Product Types ---
export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  compareAtPrice: number | null;
  costPrice: number | null;
  sku: string;
  material: string;
  weight: string;
  purity: string | null;
  categoryId: string;
  category?: Category;
  images: ProductImage[];
  variants: ProductVariant[];
  reviews: Review[];
  tags: string[];
  metaTitle: string | null;
  metaDescription: string | null;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  isActive: boolean;
  averageRating: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  position: number;
  productId: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price: number;
  compareAtPrice: number | null;
  material: string;
  size: string | null;
  weight: string | null;
  stock: number;
  productId: string;
  isActive: boolean;
}

// --- Category Types ---
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  parentId: string | null;
  parent?: Category | null;
  children?: Category[];
  position: number;
  isActive: boolean;
  productCount?: number;
}

// --- Cart Types ---
export interface CartItem {
  id: string;
  productId: string;
  variantId: string | null;
  product: Product;
  variant: ProductVariant | null;
  quantity: number;
  price: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  tax: number;
  total: number;
  couponCode: string | null;
  itemCount: number;
}

// --- Order Types ---
export interface Order {
  id: string;
  orderNumber: string;
  userId: string | null;
  email: string;
  phone: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  subtotal: number;
  shipping: number;
  discount: number;
  tax: number;
  total: number;
  couponCode: string | null;
  shippingAddress: Address;
  billingAddress: Address;
  items: OrderItem[];
  notes: string | null;
  gstNumber: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
  estimatedDelivery: Date | null;
  deliveredAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  variantId: string | null;
  product: Product;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  total: number;
  image: string;
}

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED"
  | "RETURNED"
  | "REFUNDED";

export type PaymentStatus =
  | "PENDING"
  | "PAID"
  | "FAILED"
  | "REFUNDED"
  | "COD_PENDING";

// --- User Types ---
export interface User {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  avatar: string | null;
  role: UserRole;
  addresses: Address[];
  createdAt: Date;
}

export type UserRole = "CUSTOMER" | "ADMIN" | "MANAGER" | "SUPPORT";

export interface Address {
  id: string;
  label: string;
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  pincode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

// --- Review Types ---
export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  content: string;
  images: string[];
  isVerified: boolean;
  isApproved: boolean;
  createdAt: Date;
}

// --- Coupon Types ---
export interface Coupon {
  id: string;
  code: string;
  description: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  minOrderAmount: number;
  maxDiscount: number | null;
  usageLimit: number | null;
  usedCount: number;
  validFrom: Date;
  validUntil: Date;
  isActive: boolean;
}

// --- Wishlist Types ---
export interface WishlistItem {
  id: string;
  productId: string;
  product: Product;
  addedAt: Date;
}

// --- Search Types ---
export interface SearchFilters {
  query?: string;
  category?: string;
  material?: string;
  priceMin?: number;
  priceMax?: number;
  rating?: number;
  sortBy?: "price_asc" | "price_desc" | "newest" | "popularity" | "rating";
  page?: number;
  limit?: number;
}

export interface SearchResult {
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
  filters: {
    categories: { name: string; slug: string; count: number }[];
    materials: { name: string; count: number }[];
    priceRange: { min: number; max: number };
  };
}

// --- API Response Types ---
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// --- Admin Dashboard Types ---
export interface DashboardMetrics {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  revenueChange: number;
  ordersChange: number;
  customersChange: number;
  averageOrderValue: number;
  recentOrders: Order[];
  topProducts: { product: Product; soldCount: number; revenue: number }[];
  lowStockProducts: { product: Product; variant: ProductVariant; stock: number }[];
  revenueByDay: { date: string; revenue: number; orders: number }[];
}

// --- Shipping Types ---
export interface ShippingRate {
  courierId: string;
  courierName: string;
  rate: number;
  estimatedDays: number;
  cod: boolean;
}

// --- Payment Types ---
export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
}

export interface PaymentVerification {
  orderId: string;
  paymentId: string;
  signature: string;
}
