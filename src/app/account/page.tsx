"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User as UserIcon, 
  MapPin, 
  ShoppingBag, 
  LogOut, 
  Plus, 
  Edit, 
  Trash2, 
  Loader2, 
  Home, 
  Briefcase,
  Globe,
  X
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";
import { useWishlistStore } from "@/stores/wishlist-store";

interface Address {
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

interface OrderItem {
  id: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  total: number;
}

interface Order {
  id: string;
  orderNumber: string;
  email: string;
  phone: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  subtotal: number;
  shipping: number;
  total: number;
  items: OrderItem[];
  createdAt: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  createdAt: string;
  addresses: Address[];
  orders: Order[];
}

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"profile" | "orders" | "addresses">("profile");
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const syncWishlist = useWishlistStore((state) => state.syncFromDatabase);

  // Address Form State
  const [addressForm, setAddressForm] = useState({
    label: "Home",
    firstName: "",
    lastName: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    phone: "",
    isDefault: false,
  });
  const [submittingAddress, setSubmittingAddress] = useState(false);

  const fetchUserData = async () => {
    try {
      const res = await fetch("/api/auth");
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        // Sync wishlist on successful customer login
        syncWishlist();
      } else {
        toast.error("Please login to access your account");
        router.push("/login");
      }
    } catch {
      toast.error("Failed to load user profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth", { method: "DELETE" });
      if (res.ok) {
        toast.success("Logged out successfully");
        router.push("/login");
        router.refresh();
      }
    } catch {
      toast.error("Logout failed");
    }
  };

  const handleOpenAddAddress = () => {
    setEditingAddress(null);
    setAddressForm({
      label: "Home",
      firstName: "",
      lastName: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      pincode: "",
      country: "India",
      phone: "",
      isDefault: user?.addresses.length === 0, // default if first address
    });
    setAddressModalOpen(true);
  };

  const handleOpenEditAddress = (addr: Address) => {
    setEditingAddress(addr);
    setAddressForm({
      label: addr.label,
      firstName: addr.firstName,
      lastName: addr.lastName,
      addressLine1: addr.addressLine1,
      addressLine2: addr.addressLine2 || "",
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      country: addr.country,
      phone: addr.phone,
      isDefault: addr.isDefault,
    });
    setAddressModalOpen(true);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingAddress(true);

    try {
      const method = editingAddress ? "PUT" : "POST";
      const payload = editingAddress ? { ...addressForm, id: editingAddress.id } : addressForm;

      const res = await fetch("/api/addresses", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(editingAddress ? "Address updated" : "Address added");
        setAddressModalOpen(false);
        fetchUserData();
      } else {
        toast.error(data.error || "Failed to save address");
      }
    } catch {
      toast.error("Network error saving address");
    } finally {
      setSubmittingAddress(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;

    try {
      const res = await fetch(`/api/addresses?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success("Address deleted successfully");
        fetchUserData();
      } else {
        toast.error(data.error || "Failed to delete address");
      }
    } catch {
      toast.error("Network error deleting address");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-rose-gold animate-spin" />
        <p className="text-neutral-400 text-sm font-medium">Loading account details...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="container-luxury py-10 md:py-16">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar Nav */}
        <div className="w-full lg:w-1/4 space-y-6">
          <div className="bg-white border border-neutral-100 rounded-3xl p-6 shadow-card">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-rose-gold/10 border border-rose-gold/25 flex items-center justify-center shrink-0">
                <UserIcon className="w-5 h-5 text-rose-gold-dark" />
              </div>
              <div className="min-w-0">
                <h3 className="font-heading text-lg text-deep-plum truncate">{user.name}</h3>
                <p className="text-xs text-neutral-400 truncate">{user.email}</p>
              </div>
            </div>

            <div className="space-y-1">
              {[
                { id: "profile", label: "Profile Settings", icon: UserIcon },
                { id: "orders", label: "Order History", icon: ShoppingBag, count: user.orders.length },
                { id: "addresses", label: "Address Book", icon: MapPin, count: user.addresses.length },
              ].map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      active 
                        ? "bg-rose-gold/10 text-rose-gold-dark" 
                        : "text-neutral-500 hover:bg-neutral-50 hover:text-deep-plum"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${active ? "text-rose-gold-dark" : "text-neutral-400"}`} />
                      {tab.label}
                    </div>
                    {tab.count !== undefined && tab.count > 0 && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        active ? "bg-rose-gold text-deep-plum" : "bg-neutral-100 text-neutral-500"
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="border-t border-neutral-100 mt-6 pt-4">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-neutral-500 hover:bg-rose-50 hover:text-rose-600 transition-all"
              >
                <LogOut className="w-4 h-4 text-neutral-400 group-hover:text-rose-600" />
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Content Pane */}
        <div className="flex-1 min-w-0">
          <div className="bg-white border border-neutral-100 rounded-3xl p-6 md:p-8 shadow-card min-h-[50vh]">
            
            {/* Tab: Profile */}
            {activeTab === "profile" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div>
                  <h2 className="font-heading text-2xl text-deep-plum">Profile Settings</h2>
                  <p className="text-neutral-400 text-sm mt-1">Manage your basic identity details.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-neutral-50 p-6 rounded-2xl border border-neutral-100">
                  <div className="space-y-1">
                    <span className="text-xs uppercase tracking-wider text-neutral-400 font-medium">Full Name</span>
                    <p className="text-sm font-semibold text-deep-plum">{user.name}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs uppercase tracking-wider text-neutral-400 font-medium">Email Address</span>
                    <p className="text-sm font-semibold text-deep-plum">{user.email}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs uppercase tracking-wider text-neutral-400 font-medium">Phone Number</span>
                    <p className="text-sm font-semibold text-deep-plum">{user.phone || "Not provided"}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs uppercase tracking-wider text-neutral-400 font-medium">Member Since</span>
                    <p className="text-sm font-semibold text-deep-plum">
                      {new Date(user.createdAt).toLocaleDateString("en-IN", {
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Tab: Orders */}
            {activeTab === "orders" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div>
                  <h2 className="font-heading text-2xl text-deep-plum">Order History</h2>
                  <p className="text-neutral-400 text-sm mt-1">Track states of your current and historical orders.</p>
                </div>

                {user.orders.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-5xl mb-4">🛍️</p>
                    <h3 className="font-heading text-lg text-deep-plum">No orders placed yet</h3>
                    <p className="text-neutral-400 text-sm mt-1">Explore our catalog and find your perfect piece.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {user.orders.map((order) => {
                      const dateFormatted = new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      });

                      return (
                        <div key={order.id} className="border border-neutral-100 rounded-2xl overflow-hidden shadow-sm">
                          {/* Order Header */}
                          <div className="bg-neutral-50 p-4 border-b border-neutral-100 flex flex-wrap justify-between items-center gap-3">
                            <div className="space-y-1">
                              <p className="text-xs text-neutral-400 uppercase tracking-wider">Order Number</p>
                              <p className="text-sm font-medium text-deep-plum">{order.orderNumber}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs text-neutral-400 uppercase tracking-wider">Date Placed</p>
                              <p className="text-sm font-medium text-deep-plum">{dateFormatted}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs text-neutral-400 uppercase tracking-wider">Total Value</p>
                              <p className="text-sm font-bold text-deep-plum">{formatPrice(order.total)}</p>
                            </div>
                            <div className="flex gap-2">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                order.status === "DELIVERED" ? "bg-green-100 text-green-800 border-green-200" :
                                order.status === "PROCESSING" || order.status === "CONFIRMED" ? "bg-purple-100 text-purple-800 border-purple-200" :
                                order.status === "CANCELLED" ? "bg-red-100 text-red-800 border-red-200" :
                                "bg-yellow-100 text-yellow-800 border-yellow-200"
                              }`}>
                                {order.status}
                              </span>
                            </div>
                          </div>

                          {/* Items List */}
                          <div className="p-4 divide-y divide-neutral-100">
                            {order.items.map((item) => (
                              <div key={item.id} className="flex justify-between items-center py-3 first:pt-0 last:pb-0">
                                <div>
                                  <p className="text-sm font-medium text-deep-plum">{item.name}</p>
                                  <p className="text-xs text-neutral-400">SKU: {item.sku} • Qty: {item.quantity}</p>
                                </div>
                                <p className="text-sm font-medium text-deep-plum">{formatPrice(item.total)}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {/* Tab: Addresses */}
            {activeTab === "addresses" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="font-heading text-2xl text-deep-plum">Address Book</h2>
                    <p className="text-neutral-400 text-sm mt-1">Manage delivery locations.</p>
                  </div>
                  <button
                    onClick={handleOpenAddAddress}
                    className="inline-flex items-center gap-1 bg-deep-plum text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-neutral-800 transition-colors shadow-sm cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    New Address
                  </button>
                </div>

                {user.addresses.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-5xl mb-4">📍</p>
                    <h3 className="font-heading text-lg text-deep-plum">No addresses saved</h3>
                    <p className="text-neutral-400 text-sm mt-1">Save your addresses for quicker checkouts.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {user.addresses.map((addr) => {
                      const LabelIcon = addr.label === "Home" ? Home : addr.label === "Office" ? Briefcase : Globe;
                      return (
                        <div key={addr.id} className="border border-neutral-100 rounded-2xl p-5 shadow-sm bg-white relative flex flex-col justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <LabelIcon className="w-4 h-4 text-rose-gold-dark" />
                              <span className="text-xs uppercase tracking-wider font-bold text-deep-plum">{addr.label}</span>
                              {addr.isDefault && (
                                <span className="bg-success/10 text-success text-[10px] px-2 py-0.5 rounded-full font-bold">Default</span>
                              )}
                            </div>
                            <p className="text-sm font-semibold text-deep-plum">{addr.firstName} {addr.lastName}</p>
                            <p className="text-xs text-neutral-500 mt-2">{addr.addressLine1}</p>
                            {addr.addressLine2 && <p className="text-xs text-neutral-500">{addr.addressLine2}</p>}
                            <p className="text-xs text-neutral-500">{addr.city}, {addr.state} - {addr.pincode}</p>
                            <p className="text-xs text-neutral-500">{addr.country}</p>
                            <p className="text-xs text-neutral-500 mt-2">Phone: {addr.phone}</p>
                          </div>

                          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-neutral-100 justify-end">
                            <button
                              onClick={() => handleOpenEditAddress(addr)}
                              className="p-1.5 text-neutral-400 hover:text-rose-gold-dark transition-colors cursor-pointer"
                              title="Edit Address"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteAddress(addr.id)}
                              className="p-1.5 text-neutral-400 hover:text-destructive transition-colors cursor-pointer"
                              title="Delete Address"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

          </div>
        </div>
      </div>

      {/* Address Form Modal */}
      <AnimatePresence>
        {addressModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAddressModalOpen(false)}
              className="absolute inset-0 bg-black/55 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-xl bg-white rounded-3xl overflow-hidden shadow-luxury relative z-10 border border-neutral-100 max-h-[90vh] flex flex-col"
            >
              {/* Header */}
              <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
                <h2 className="font-heading text-xl text-deep-plum">
                  {editingAddress ? "Edit Shipping Address" : "Add Shipping Address"}
                </h2>
                <button
                  onClick={() => setAddressModalOpen(false)}
                  className="p-1.5 hover:bg-neutral-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-neutral-500" />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSaveAddress} className="flex-1 overflow-y-auto p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* Label */}
                  <div className="col-span-2 space-y-1">
                    <label className="text-xs uppercase tracking-wider text-neutral-400 font-medium">Address Label</label>
                    <select
                      value={addressForm.label}
                      onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                      className="w-full px-3.5 py-2 border border-neutral-200 bg-white rounded-xl text-sm focus:outline-none focus:border-rose-gold"
                    >
                      <option value="Home">Home</option>
                      <option value="Office">Office</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* First Name */}
                  <div className="space-y-1">
                    <label className="text-xs uppercase tracking-wider text-neutral-400 font-medium">First Name</label>
                    <input
                      type="text"
                      required
                      value={addressForm.firstName}
                      onChange={(e) => setAddressForm({ ...addressForm, firstName: e.target.value })}
                      placeholder="e.g. Priya"
                      className="w-full px-3.5 py-2 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-rose-gold"
                    />
                  </div>

                  {/* Last Name */}
                  <div className="space-y-1">
                    <label className="text-xs uppercase tracking-wider text-neutral-400 font-medium">Last Name</label>
                    <input
                      type="text"
                      required
                      value={addressForm.lastName}
                      onChange={(e) => setAddressForm({ ...addressForm, lastName: e.target.value })}
                      placeholder="e.g. Sharma"
                      className="w-full px-3.5 py-2 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-rose-gold"
                    />
                  </div>

                  {/* Address Line 1 */}
                  <div className="col-span-2 space-y-1">
                    <label className="text-xs uppercase tracking-wider text-neutral-400 font-medium">Address Line 1</label>
                    <input
                      type="text"
                      required
                      value={addressForm.addressLine1}
                      onChange={(e) => setAddressForm({ ...addressForm, addressLine1: e.target.value })}
                      placeholder="Flat, House no., Apartment, Street"
                      className="w-full px-3.5 py-2 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-rose-gold"
                    />
                  </div>

                  {/* Address Line 2 */}
                  <div className="col-span-2 space-y-1">
                    <label className="text-xs uppercase tracking-wider text-neutral-400 font-medium">Address Line 2 (Optional)</label>
                    <input
                      type="text"
                      value={addressForm.addressLine2}
                      onChange={(e) => setAddressForm({ ...addressForm, addressLine2: e.target.value })}
                      placeholder="Landmark, Area, Sector"
                      className="w-full px-3.5 py-2 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-rose-gold"
                    />
                  </div>

                  {/* City */}
                  <div className="space-y-1">
                    <label className="text-xs uppercase tracking-wider text-neutral-400 font-medium">City</label>
                    <input
                      type="text"
                      required
                      value={addressForm.city}
                      onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                      placeholder="e.g. Mumbai"
                      className="w-full px-3.5 py-2 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-rose-gold"
                    />
                  </div>

                  {/* State */}
                  <div className="space-y-1">
                    <label className="text-xs uppercase tracking-wider text-neutral-400 font-medium">State</label>
                    <input
                      type="text"
                      required
                      value={addressForm.state}
                      onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                      placeholder="e.g. Maharashtra"
                      className="w-full px-3.5 py-2 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-rose-gold"
                    />
                  </div>

                  {/* Pincode */}
                  <div className="space-y-1">
                    <label className="text-xs uppercase tracking-wider text-neutral-400 font-medium">Pincode</label>
                    <input
                      type="text"
                      required
                      value={addressForm.pincode}
                      onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                      placeholder="e.g. 400001"
                      className="w-full px-3.5 py-2 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-rose-gold"
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-1">
                    <label className="text-xs uppercase tracking-wider text-neutral-400 font-medium">Phone Number</label>
                    <input
                      type="tel"
                      required
                      value={addressForm.phone}
                      onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                      placeholder="Delivery contact no."
                      className="w-full px-3.5 py-2 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-rose-gold"
                    />
                  </div>

                  {/* Default switch */}
                  <div className="col-span-2 flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="isDefault"
                      checked={addressForm.isDefault}
                      onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                      className="rounded border-neutral-200 text-rose-gold focus:ring-rose-gold"
                    />
                    <label htmlFor="isDefault" className="text-xs text-neutral-500 font-medium cursor-pointer">
                      Make this my default shipping address
                    </label>
                  </div>
                </div>

                {/* Footer buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100">
                  <button
                    type="button"
                    onClick={() => setAddressModalOpen(false)}
                    className="px-5 py-2.5 border border-neutral-200 rounded-xl text-sm font-medium hover:bg-neutral-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingAddress}
                    className="px-6 py-2.5 bg-deep-plum text-white rounded-xl text-sm font-medium hover:bg-neutral-800 transition-colors flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {submittingAddress && <Loader2 className="w-4 h-4 animate-spin" />}
                    Save Address
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
