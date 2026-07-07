"use client";

import { useState, useEffect } from "react";
import { Search, Filter, Eye, X, Loader2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

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
  tax: number;
  discount: number;
  total: number;
  notes: string | null;
  shippingData: any;
  items: OrderItem[];
  createdAt: string;
}

const ORDER_STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
  CONFIRMED: "bg-blue-100 text-blue-800 border-blue-200",
  PROCESSING: "bg-purple-100 text-purple-800 border-purple-200",
  SHIPPED: "bg-indigo-100 text-indigo-800 border-indigo-200",
  OUT_FOR_DELIVERY: "bg-orange-100 text-orange-800 border-orange-200",
  DELIVERED: "bg-green-100 text-green-800 border-green-200",
  CANCELLED: "bg-red-100 text-red-800 border-red-200",
  RETURNED: "bg-gray-100 text-gray-800 border-gray-200",
  REFUNDED: "bg-pink-100 text-pink-800 border-pink-200",
};

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  PAID: "bg-green-100 text-green-800",
  FAILED: "bg-red-100 text-red-800",
  REFUNDED: "bg-gray-100 text-gray-800",
  COD_PENDING: "bg-blue-100 text-blue-800",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  // Edit state in modal
  const [modalStatus, setModalStatus] = useState("");
  const [modalPaymentStatus, setModalPaymentStatus] = useState("");
  const [submittingStatus, setSubmittingStatus] = useState(false);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/admin/orders");
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
      } else {
        toast.error(data.error || "Failed to load orders");
      }
    } catch {
      toast.error("Network error fetching orders");
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchOrders();
      setLoading(false);
    };
    init();
  }, []);

  const handleOpenDetailModal = (order: Order) => {
    setSelectedOrder(order);
    setModalStatus(order.status);
    setModalPaymentStatus(order.paymentStatus);
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    
    setSubmittingStatus(true);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedOrder.id,
          status: modalStatus,
          paymentStatus: modalPaymentStatus,
        }),
      });
      const data = await res.json();

      if (data.success) {
        toast.success("Order status updated successfully.");
        // Update local orders state
        setOrders((prev) =>
          prev.map((o) => (o.id === selectedOrder.id ? data.order : o))
        );
        setSelectedOrder(data.order);
      } else {
        toast.error(data.error || "Failed to update order");
      }
    } catch {
      toast.error("Network error updating order");
    } finally {
      setSubmittingStatus(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const custName = o.shippingData
      ? `${o.shippingData.firstName || ""} ${o.shippingData.lastName || ""}`.toLowerCase()
      : "";
    return (
      o.orderNumber.toLowerCase().includes(query.toLowerCase()) ||
      o.email.toLowerCase().includes(query.toLowerCase()) ||
      custName.includes(query.toLowerCase())
    );
  });

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-gold animate-spin" />
        <p className="text-neutral-400 text-sm font-medium">Loading orders list...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-3xl text-obsidian">Orders</h1>
          <p className="text-neutral-500 mt-1">Manage and fulfill customer orders.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-card border border-neutral-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-neutral-100 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search by Order ID, Customer Name, or Email..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-gold transition-colors"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50/50">
                <th className="px-6 py-4 text-xs uppercase tracking-wider text-neutral-500 font-medium border-b border-neutral-100">Order ID</th>
                <th className="px-6 py-4 text-xs uppercase tracking-wider text-neutral-500 font-medium border-b border-neutral-100">Date</th>
                <th className="px-6 py-4 text-xs uppercase tracking-wider text-neutral-500 font-medium border-b border-neutral-100">Customer</th>
                <th className="px-6 py-4 text-xs uppercase tracking-wider text-neutral-500 font-medium border-b border-neutral-100">Total</th>
                <th className="px-6 py-4 text-xs uppercase tracking-wider text-neutral-500 font-medium border-b border-neutral-100">Payment</th>
                <th className="px-6 py-4 text-xs uppercase tracking-wider text-neutral-500 font-medium border-b border-neutral-100">Status</th>
                <th className="px-6 py-4 text-xs uppercase tracking-wider text-neutral-500 font-medium border-b border-neutral-100 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-neutral-400 text-sm">
                    No orders found. Check out on storefront to create a test order.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const dateFormatted = new Date(order.createdAt).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  });

                  let customerName = order.email;
                  if (order.shippingData && typeof order.shippingData === "object") {
                    const data = order.shippingData;
                    if (data.firstName && data.lastName) {
                      customerName = `${data.firstName} ${data.lastName}`;
                    } else if (data.firstName) {
                      customerName = data.firstName;
                    }
                  }

                  return (
                    <tr key={order.id} className="hover:bg-neutral-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-obsidian">{order.orderNumber}</td>
                      <td className="px-6 py-4 text-sm text-neutral-500">{dateFormatted}</td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-obsidian">{customerName}</p>
                        <p className="text-xs text-neutral-400">{order.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-obsidian">{formatPrice(order.total)}</p>
                        <p className="text-xs text-neutral-400">{order.items?.length || 0} item(s)</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
                          PAYMENT_STATUS_COLORS[order.paymentStatus] || "bg-neutral-100 text-neutral-600"
                        }`}>
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider border ${
                          ORDER_STATUS_COLORS[order.status] || "bg-neutral-100 text-neutral-500 border-neutral-200"
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end">
                          <button
                            onClick={() => handleOpenDetailModal(order)}
                            className="p-1.5 text-neutral-400 hover:text-gold-dark transition-colors cursor-pointer"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="absolute inset-0 bg-black/55 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-3xl bg-white rounded-3xl overflow-hidden shadow-luxury relative z-10 border border-neutral-100 max-h-[90vh] flex flex-col"
            >
              {/* Header */}
              <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
                <div>
                  <h2 className="font-heading text-xl text-obsidian">Order details</h2>
                  <p className="text-xs text-neutral-400 mt-1">ID: {selectedOrder.orderNumber} • Placed on {new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-1.5 hover:bg-neutral-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-neutral-500" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Customer & Shipping Details */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xs uppercase tracking-wider text-neutral-400 font-medium mb-2">Customer & Contact</h3>
                      <p className="text-sm font-medium text-obsidian">
                        {selectedOrder.shippingData
                          ? `${selectedOrder.shippingData.firstName || ""} ${selectedOrder.shippingData.lastName || ""}`
                          : "Guest Customer"}
                      </p>
                      <p className="text-sm text-neutral-600 mt-1">{selectedOrder.email}</p>
                      <p className="text-sm text-neutral-600">{selectedOrder.phone}</p>
                    </div>

                    <div>
                      <h3 className="text-xs uppercase tracking-wider text-neutral-400 font-medium mb-2">Shipping Address</h3>
                      {selectedOrder.shippingData ? (
                        <div className="text-sm text-neutral-600 leading-relaxed bg-neutral-50 p-4 rounded-2xl border border-neutral-100">
                          <p>{selectedOrder.shippingData.addressLine1}</p>
                          {selectedOrder.shippingData.addressLine2 && <p>{selectedOrder.shippingData.addressLine2}</p>}
                          <p>{selectedOrder.shippingData.city}, {selectedOrder.shippingData.state} - {selectedOrder.shippingData.pincode}</p>
                          <p>{selectedOrder.shippingData.country || "India"}</p>
                        </div>
                      ) : (
                        <p className="text-sm text-neutral-500 italic">No shipping details provided.</p>
                      )}
                    </div>
                  </div>

                  {/* Status update form */}
                  <div className="bg-neutral-50/50 border border-neutral-100 p-5 rounded-2xl">
                    <h3 className="text-xs uppercase tracking-wider text-neutral-400 font-medium mb-4">Update Status</h3>
                    <form onSubmit={handleUpdateStatus} className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-xs text-neutral-500 font-medium block">Order Status</label>
                        <select
                          value={modalStatus}
                          onChange={(e) => setModalStatus(e.target.value)}
                          className="w-full px-3 py-2 border border-neutral-200 bg-white rounded-xl text-sm focus:outline-none focus:border-gold"
                        >
                          <option value="PENDING">Pending</option>
                          <option value="CONFIRMED">Confirmed</option>
                          <option value="PROCESSING">Processing</option>
                          <option value="SHIPPED">Shipped</option>
                          <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                          <option value="DELIVERED">Delivered</option>
                          <option value="CANCELLED">Cancelled</option>
                          <option value="RETURNED">Returned</option>
                          <option value="REFUNDED">Refunded</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs text-neutral-500 font-medium block">Payment Status</label>
                        <select
                          value={modalPaymentStatus}
                          onChange={(e) => setModalPaymentStatus(e.target.value)}
                          className="w-full px-3 py-2 border border-neutral-200 bg-white rounded-xl text-sm focus:outline-none focus:border-gold"
                        >
                          <option value="PENDING">Pending</option>
                          <option value="PAID">Paid</option>
                          <option value="FAILED">Failed</option>
                          <option value="REFUNDED">Refunded</option>
                          <option value="COD_PENDING">COD Pending</option>
                        </select>
                      </div>

                      <button
                        type="submit"
                        disabled={submittingStatus}
                        className="w-full py-2.5 bg-obsidian text-white text-xs font-semibold rounded-xl hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2"
                      >
                        {submittingStatus && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        Update Order State
                      </button>
                    </form>
                  </div>
                </div>

                {/* Items Table */}
                <div>
                  <h3 className="text-xs uppercase tracking-wider text-neutral-400 font-medium mb-3">Order Items</h3>
                  <div className="border border-neutral-100 rounded-2xl overflow-hidden bg-white">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead>
                        <tr className="bg-neutral-50/50 text-xs font-medium text-neutral-500 border-b border-neutral-100">
                          <th className="px-4 py-3">Item details</th>
                          <th className="px-4 py-3">SKU</th>
                          <th className="px-4 py-3 text-right">Price</th>
                          <th className="px-4 py-3 text-center">Qty</th>
                          <th className="px-4 py-3 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100">
                        {selectedOrder.items?.map((item) => (
                          <tr key={item.id}>
                            <td className="px-4 py-3 font-medium text-obsidian">{item.name}</td>
                            <td className="px-4 py-3 text-xs text-neutral-500">{item.sku}</td>
                            <td className="px-4 py-3 text-right text-neutral-600">{formatPrice(item.price)}</td>
                            <td className="px-4 py-3 text-center text-neutral-600">{item.quantity}</td>
                            <td className="px-4 py-3 text-right font-medium text-obsidian">{formatPrice(item.total)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Pricing Summary */}
                <div className="flex justify-end pt-4 border-t border-neutral-100">
                  <div className="w-full max-w-xs space-y-2 text-sm text-neutral-600">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-medium text-obsidian">{formatPrice(selectedOrder.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span className="font-medium text-obsidian">{formatPrice(selectedOrder.shipping)}</span>
                    </div>
                    {selectedOrder.discount > 0 && (
                      <div className="flex justify-between text-success">
                        <span>Discount</span>
                        <span>-{formatPrice(selectedOrder.discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-base font-semibold border-t border-neutral-100 pt-2 text-obsidian">
                      <span>Total Amount</span>
                      <span>{formatPrice(selectedOrder.total)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
