"use client";

import { useEffect, useState } from "react";
import {
  ShoppingCart,
  Search,
  Plus,
  Truck,
  CreditCard,
  ChevronRight,
  X,
  Loader2,
  CheckCircle2,
  Clock,
  Send,
  AlertCircle,
} from "lucide-react";
import { formatPKR, formatDate } from "@/lib/utils";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  // Data for Create Modal
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [itemQty, setItemQty] = useState(1);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [discount, setDiscount] = useState("0");
  const [deliveryFee, setDeliveryFee] = useState("250");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function loadOrders() {
    try {
      setLoading(true);
      const url = new URL("/api/orders", window.location.origin);
      if (statusFilter) url.searchParams.set("status", statusFilter);

      const res = await fetch(url.toString());
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err) {
      console.error("Failed to load orders:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  const openCreateModal = async () => {
    setIsCreateModalOpen(true);
    try {
      const [cRes, pRes] = await Promise.all([
        fetch("/api/customers"),
        fetch("/api/products"),
      ]);
      const cData = await cRes.json();
      const pData = await pRes.json();
      setCustomers(cData.customers || []);
      setProducts(pData.products || []);
      if (cData.customers?.length > 0) setSelectedCustomerId(cData.customers[0]._id);
      if (pData.products?.length > 0) setSelectedProductId(pData.products[0]._id);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddItem = () => {
    const product = products.find((p) => p._id === selectedProductId);
    if (!product) return;

    setOrderItems((prev) => [
      ...prev,
      {
        productId: product._id,
        name: product.name,
        quantity: itemQty,
        unitPrice: product.salePrice || product.price,
        total: (product.salePrice || product.price) * itemQty,
      },
    ]);
    setItemQty(1);
  };

  const handleRemoveItem = (index: number) => {
    setOrderItems((prev) => prev.filter((_, i) => i !== index));
  };

  const subtotal = orderItems.reduce((sum, itm) => sum + itm.total, 0);
  const finalTotal = Math.max(0, subtotal - Number(discount || 0) + Number(deliveryFee || 0));

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (orderItems.length === 0) {
      alert("Please add at least one product to the order.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: selectedCustomerId,
          items: orderItems,
          discount: Number(discount),
          deliveryFee: Number(deliveryFee),
          notes,
        }),
      });

      if (res.ok) {
        setIsCreateModalOpen(false);
        setOrderItems([]);
        setNotes("");
        loadOrders();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string, paymentStatus?: string) => {
    try {
      const payload: any = {};
      if (status) payload.status = status;
      if (paymentStatus) payload.paymentStatus = paymentStatus;

      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, ...data.order } : o))
        );
        if (selectedOrder?._id === orderId) {
          setSelectedOrder({ ...selectedOrder, ...data.order });
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-sky-600" />
            Orders & Shipments
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Track order fulfillment, payment status, and automated courier follow-ups
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-sm self-start sm:self-auto transition"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Order</span>
        </button>
      </div>

      {/* Status Pipeline Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
        {[
          { label: "All Orders", val: "" },
          { label: "New", val: "NEW" },
          { label: "Confirmed", val: "CONFIRMED" },
          { label: "Preparing", val: "PREPARING" },
          { label: "Out for Delivery", val: "OUT_FOR_DELIVERY" },
          { label: "Delivered", val: "DELIVERED" },
          { label: "Completed", val: "COMPLETED" },
          { label: "Cancelled", val: "CANCELLED" },
        ].map((tab) => (
          <button
            key={tab.val}
            onClick={() => setStatusFilter(tab.val)}
            className={`px-3 py-2 rounded-xl text-xs font-bold shrink-0 transition ${
              statusFilter === tab.val
                ? "bg-sky-600 text-white shadow-sm"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="py-20 flex justify-center text-slate-400">
          <Loader2 className="w-7 h-7 animate-spin text-sky-600" />
        </div>
      ) : orders.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 p-6">
          <ShoppingCart className="w-10 h-10 mx-auto text-slate-300 mb-2" />
          <h3 className="font-bold text-slate-800 text-sm">No orders in this status</h3>
          <p className="text-xs text-slate-500 mt-1">Select another tab or record a new customer sale.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((ord) => {
            const isUnpaid = ord.paymentStatus === "PENDING" || ord.paymentStatus === "PARTIAL";

            return (
              <div
                key={ord._id}
                onClick={() => setSelectedOrder(ord)}
                className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-sky-300 hover:shadow-md transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <span className="font-black text-sm text-slate-900 font-mono">
                      {ord.orderNumber}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        ord.status === "DELIVERED" || ord.status === "COMPLETED"
                          ? "bg-emerald-100 text-emerald-800"
                          : ord.status === "OUT_FOR_DELIVERY"
                          ? "bg-sky-100 text-sky-800"
                          : ord.status === "CONFIRMED"
                          ? "bg-indigo-100 text-indigo-800"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {ord.status}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        isUnpaid ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {ord.paymentStatus}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 font-medium">
                    <span className="font-bold text-slate-900">
                      {ord.customerId?.name || "Customer"}
                    </span>{" "}
                    ({ord.customerId?.phone}) • {ord.city || "Lahore"}
                  </div>

                  <div className="text-xs text-slate-500">
                    {ord.items?.map((it: any) => `${it.name} (x${it.quantity})`).join(", ")}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div className="text-left sm:text-right">
                    <span className="text-base font-black text-slate-900 block">
                      {formatPKR(ord.total)}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {formatDate(ord.createdAt)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    {ord.status !== "DELIVERED" && ord.status !== "COMPLETED" && (
                      <button
                        onClick={() => handleUpdateOrderStatus(ord._id, "DELIVERED")}
                        className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold hover:bg-emerald-100"
                        title="Mark Delivered (Triggers feedback follow-up automation)"
                      >
                        Mark Delivered
                      </button>
                    )}
                    {isUnpaid && (
                      <button
                        onClick={() => handleUpdateOrderStatus(ord._id, "", "PAID")}
                        className="px-3 py-1.5 rounded-lg bg-sky-50 text-sky-700 border border-sky-200 text-xs font-bold hover:bg-sky-100"
                      >
                        Mark Paid
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Order Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">Create New Order</h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-4 text-xs">
              {/* Customer Select */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Customer *</label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 bg-white"
                >
                  {customers.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} ({c.phone}) - {c.city}
                    </option>
                  ))}
                </select>
              </div>

              {/* Product Add Row */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 block">Add Product Line Item</span>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <select
                      value={selectedProductId}
                      onChange={(e) => setSelectedProductId(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                    >
                      {products.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.name} ({formatPKR(p.salePrice || p.price)}) [Stock: {p.stockQuantity}]
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-1.5">
                    <input
                      type="number"
                      min={1}
                      value={itemQty}
                      onChange={(e) => setItemQty(Number(e.target.value))}
                      className="w-14 px-2 py-1.5 border border-slate-300 rounded-lg text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="flex-1 bg-slate-800 text-white rounded-lg font-bold text-xs hover:bg-slate-700"
                    >
                      + Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Added Line Items */}
              {orderItems.length > 0 && (
                <div className="space-y-1.5">
                  <span className="font-bold text-slate-700 block">Order Items ({orderItems.length})</span>
                  {orderItems.map((itm, i) => (
                    <div
                      key={i}
                      className="p-2 rounded-lg border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-900">{itm.name}</span>
                        <span className="text-slate-500 ml-2">x{itm.quantity}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{formatPKR(itm.total)}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(i)}
                          className="text-rose-600 hover:text-rose-800 p-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Delivery & Discounts */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Delivery Fee (PKR)</label>
                  <input
                    type="number"
                    value={deliveryFee}
                    onChange={(e) => setDeliveryFee(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Discount (PKR)</label>
                  <input
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
              </div>

              {/* Order Total Display */}
              <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-between">
                <span className="font-bold text-sky-950">Grand Total</span>
                <span className="text-lg font-black text-sky-900">{formatPKR(finalTotal)}</span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Special Delivery Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Call before delivery, Meezan Bank transfer..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 py-2.5 border border-slate-300 rounded-xl font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-semibold shadow-sm flex items-center justify-center gap-1.5"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Order"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
