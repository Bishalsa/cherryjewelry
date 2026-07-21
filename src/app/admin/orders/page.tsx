"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  Search,
  Filter,
  Eye,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
  X,
  CreditCard,
  User,
  MapPin,
  FileText,
  ExternalLink,
} from "lucide-react";
import { formatPrice, cn } from "@/lib/utils";
import { toast } from "sonner";

interface OrderItem {
  id: string;
  orderNumber: string;
  email: string;
  phone: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  total: number;
  subtotal: number;
  shipping: number;
  trackingNumber: string | null;
  courierName: string | null;
  notes: string | null;
  createdAt: string;
  user?: { name: string; email: string };
  shippingAddress?: {
    firstName: string;
    lastName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
  };
  items: Array<{
    id: string;
    name: string;
    sku: string;
    image: string;
    price: number;
    quantity: number;
    total: number;
  }>;
}

const ORDER_STATUSES = [
  "ALL",
  "PENDING",
  "PAID",
  "PACKED",
  "READY_FOR_PICKUP",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
  "RETURNED",
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Form states for detail editing
  const [editStatus, setEditStatus] = useState("");
  const [editCourier, setEditCourier] = useState("");
  const [editTracking, setEditTracking] = useState("");
  const [editNotes, setEditNotes] = useState("");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/orders");
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
      } else {
        toast.error(data.error || "Failed to load orders");
      }
    } catch {
      toast.error("Network error fetching orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleOpenDetail = (order: OrderItem) => {
    setSelectedOrder(order);
    setEditStatus(order.status);
    setEditCourier(order.courierName || "Shadowfax");
    setEditTracking(order.trackingNumber || "");
    setEditNotes(order.notes || "");
    setIsDetailOpen(true);
  };

  const handleUpdateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/orders/${selectedOrder.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: editStatus,
          courierName: editCourier,
          trackingNumber: editTracking,
          notes: editNotes,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Order status and shipping tracking updated");
        setIsDetailOpen(false);
        fetchOrders();
      } else {
        toast.error(data.error || "Update failed");
      }
    } catch {
      toast.error("Error updating order");
    } finally {
      setUpdating(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(query.toLowerCase()) ||
      o.email.toLowerCase().includes(query.toLowerCase()) ||
      o.phone.includes(query);

    if (!matchesSearch) return false;
    if (selectedStatus !== "ALL" && o.status !== selectedStatus) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl text-deep-plum">
            Order Fulfillment Center
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Track customer orders, assign courier tracking numbers, and update delivery workflow statuses.
          </p>
        </div>
      </div>

      {/* Workflow Tabs & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-100 shadow-sm space-y-4">
        <div className="flex items-center gap-1.5 overflow-x-auto border-b border-neutral-100 pb-3">
          {ORDER_STATUSES.map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={cn(
                "px-3.5 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer",
                selectedStatus === status
                  ? "bg-deep-plum text-white"
                  : "text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50"
              )}
            >
              {status.replace(/_/g, " ")}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="relative max-w-sm flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search order #, customer email, or phone..."
              className="w-full pl-10 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:border-rose-gold"
            />
          </div>

          <div className="text-xs text-neutral-400">
            Total Orders: {filteredOrders.length}
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-neutral-400 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-rose-gold" /> Loading order details...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center">
            <ShoppingCart className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-deep-plum mb-1">No orders found</p>
            <p className="text-xs text-neutral-400">No orders match the selected filter query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50/50 text-[10px] uppercase tracking-wider text-neutral-400 font-semibold">
                  <th className="py-3.5 px-4">Order #</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Payment</th>
                  <th className="py-3.5 px-4">Total</th>
                  <th className="py-3.5 px-4">Order Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-xs">
                {filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-semibold text-deep-plum">
                      {o.orderNumber}
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-medium text-deep-plum">{o.user?.name || o.email}</p>
                      <p className="text-[11px] text-neutral-400">{o.phone}</p>
                    </td>

                    <td className="py-3.5 px-4 text-neutral-500">
                      {new Date(o.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider",
                          o.paymentStatus === "PAID"
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-amber-50 text-amber-600"
                        )}
                      >
                        {o.paymentMethod} · {o.paymentStatus}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-deep-plum">
                      {formatPrice(o.total)}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={cn(
                          "px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider",
                          o.status === "DELIVERED"
                            ? "bg-emerald-50 text-emerald-600"
                            : o.status === "SHIPPED"
                            ? "bg-sky-50 text-sky-600"
                            : o.status === "CANCELLED"
                            ? "bg-rose-50 text-rose-600"
                            : "bg-purple-50 text-purple-600"
                        )}
                      >
                        {o.status.replace(/_/g, " ")}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenDetail(o)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-deep-plum hover:text-white text-deep-plum font-medium rounded-xl text-xs transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      <AnimatePresence>
        {isDetailOpen && selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDetailOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-white rounded-3xl shadow-luxury border border-neutral-100 w-full max-w-3xl max-h-[90vh] overflow-y-auto relative z-10 p-6 md:p-8 space-y-6"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                <div>
                  <h3 className="font-heading text-xl text-deep-plum flex items-center gap-2">
                    Order {selectedOrder.orderNumber}
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Placed on {new Date(selectedOrder.createdAt).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => setIsDetailOpen(false)}
                  className="p-1 text-neutral-400 hover:text-neutral-600 rounded-full hover:bg-neutral-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Order Status Update Form */}
              <form onSubmit={handleUpdateOrder} className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200 space-y-4">
                <h4 className="text-xs uppercase tracking-wider font-semibold text-deep-plum flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-rose-gold" /> Logistics & Fulfillment
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-neutral-400 font-medium">
                      Order Status
                    </label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-rose-gold"
                    >
                      {ORDER_STATUSES.filter((s) => s !== "ALL").map((s) => (
                        <option key={s} value={s}>
                          {s.replace(/_/g, " ")}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-neutral-400 font-medium">
                      Courier Partner
                    </label>
                    <input
                      type="text"
                      value={editCourier}
                      onChange={(e) => setEditCourier(e.target.value)}
                      placeholder="Shadowfax / BlueDart / Delhivery"
                      className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs focus:outline-none focus:border-rose-gold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-neutral-400 font-medium">
                      Tracking Waybill Number
                    </label>
                    <input
                      type="text"
                      value={editTracking}
                      onChange={(e) => setEditTracking(e.target.value)}
                      placeholder="e.g. SFX987654321"
                      className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs font-mono focus:outline-none focus:border-rose-gold"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-neutral-400 font-medium">
                    Internal Admin Notes
                  </label>
                  <input
                    type="text"
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="e.g. Package dispatched via insured air shipment."
                    className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs focus:outline-none focus:border-rose-gold"
                  />
                </div>

                <button
                  type="submit"
                  disabled={updating}
                  className="inline-flex items-center gap-2 bg-deep-plum text-white px-5 py-2 rounded-xl text-xs font-medium hover:bg-deep-plum-dark transition-colors disabled:opacity-50"
                >
                  {updating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Update Fulfillment Status
                </button>
              </form>

              {/* Order Items List */}
              <div className="space-y-3">
                <h4 className="text-xs uppercase tracking-wider font-semibold text-deep-plum">
                  Ordered Items ({selectedOrder.items.length})
                </h4>

                <div className="divide-y divide-neutral-100 border border-neutral-100 rounded-2xl overflow-hidden">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="p-3 flex items-center justify-between gap-3 bg-white">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-neutral-100 border border-neutral-200 overflow-hidden flex-shrink-0">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <ShoppingCart className="w-4 h-4 text-neutral-400 m-auto mt-3" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-deep-plum text-xs">{item.name}</p>
                          <p className="text-[10px] font-mono text-neutral-400">{item.sku} × {item.quantity}</p>
                        </div>
                      </div>
                      <p className="font-semibold text-deep-plum text-xs">{formatPrice(item.total)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Customer & Address Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-neutral-100 pt-4">
                <div>
                  <h4 className="text-[10px] uppercase tracking-wider font-semibold text-neutral-400 mb-1">
                    Customer Info
                  </h4>
                  <p className="text-xs font-medium text-deep-plum">{selectedOrder.user?.name || "Guest Checkout"}</p>
                  <p className="text-xs text-neutral-500">{selectedOrder.email}</p>
                  <p className="text-xs text-neutral-500">{selectedOrder.phone}</p>
                </div>

                <div>
                  <h4 className="text-[10px] uppercase tracking-wider font-semibold text-neutral-400 mb-1">
                    Shipping Address
                  </h4>
                  {selectedOrder.shippingAddress ? (
                    <p className="text-xs text-neutral-600 leading-relaxed">
                      {selectedOrder.shippingAddress.addressLine1},{" "}
                      {selectedOrder.shippingAddress.addressLine2 && `${selectedOrder.shippingAddress.addressLine2}, `}
                      {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.pincode}
                    </p>
                  ) : (
                    <p className="text-xs text-neutral-400 italic">No address provided</p>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
