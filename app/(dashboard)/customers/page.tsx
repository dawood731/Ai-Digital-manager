"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Search,
  Plus,
  Phone,
  Mail,
  MapPin,
  Bot,
  ShoppingCart,
  Send,
  MoreVertical,
  X,
  Loader2,
  Sparkles,
  Tag,
} from "lucide-react";
import { formatPKR, formatDate } from "@/lib/utils";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [customerOrders, setCustomerOrders] = useState<any[]>([]);
  const [customerFollowUps, setCustomerFollowUps] = useState<any[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [aiSummaryLoading, setAiSummaryLoading] = useState(false);

  // New Customer Form State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("+92 ");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Lahore");
  const [notes, setNotes] = useState("");
  const [tagInput, setTagInput] = useState("");

  async function loadCustomers() {
    try {
      setLoading(true);
      const url = new URL("/api/customers", window.location.origin);
      if (search) url.searchParams.set("search", search);
      if (selectedTag) url.searchParams.set("tag", selectedTag);

      const res = await fetch(url.toString());
      const data = await res.json();
      setCustomers(data.customers || []);
    } catch (err) {
      console.error("Failed to load customers:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      loadCustomers();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, selectedTag]);

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const tags = tagInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          email,
          address,
          city,
          notes,
          tags,
          source: "WHATSAPP",
        }),
      });

      if (res.ok) {
        setIsAddModalOpen(false);
        setName("");
        setPhone("+92 ");
        setEmail("");
        setAddress("");
        setNotes("");
        setTagInput("");
        loadCustomers();
      }
    } catch (err) {
      console.error("Failed to add customer:", err);
    }
  };

  const handleOpenDetail = async (c: any) => {
    setSelectedCustomer(c);
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/customers/${c._id}`);
      const data = await res.json();
      setSelectedCustomer(data.customer);
      setCustomerOrders(data.orders || []);
      setCustomerFollowUps(data.followUps || []);
    } catch (err) {
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleGenerateAiSummary = async () => {
    if (!selectedCustomer) return;
    setAiSummaryLoading(true);
    try {
      const res = await fetch(`/api/customers/${selectedCustomer._id}`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.summary) {
        setSelectedCustomer({ ...selectedCustomer, aiSummary: data.summary });
        // Update in list
        setCustomers((prev) =>
          prev.map((c) => (c._id === selectedCustomer._id ? { ...c, aiSummary: data.summary } : c))
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAiSummaryLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-sky-600" />
            Customers Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            {customers.length} registered clients with complete history
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-sm self-start sm:self-auto transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Customer</span>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, phone (+92...), or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedTag("")}
            className={`px-3 py-2 rounded-xl text-xs font-bold shrink-0 transition ${
              selectedTag === ""
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            All
          </button>
          {["VIP", "Repeat Buyer", "New Customer", "Pending Payment", "Wholesale"].map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-2 rounded-xl text-xs font-bold shrink-0 transition ${
                selectedTag === tag
                  ? "bg-sky-600 text-white"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Customer List (Responsive Cards on Mobile, Table on Desktop) */}
      {loading ? (
        <div className="py-20 flex justify-center text-slate-400">
          <Loader2 className="w-7 h-7 animate-spin text-sky-600" />
        </div>
      ) : customers.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 p-6">
          <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
          <h3 className="font-bold text-slate-800 text-sm">No customers found</h3>
          <p className="text-xs text-slate-500 mt-1">Try another search or add a new customer.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {customers.map((c) => {
            const cleanedPhone = c.phone.replace(/[^0-9]/g, "");
            const waPhone = cleanedPhone.startsWith("03") ? "92" + cleanedPhone.slice(1) : cleanedPhone;
            const waUrl = `https://wa.me/${waPhone}`;

            return (
              <div
                key={c._id}
                onClick={() => handleOpenDetail(c)}
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:border-sky-300 hover:shadow-md transition cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">{c.name}</h3>
                      <span className="text-xs text-slate-500 font-mono mt-0.5 block flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {c.phone}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold uppercase bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                      {c.city || "Lahore"}
                    </span>
                  </div>

                  {c.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2.5">
                      {c.tags.map((t: string) => (
                        <span
                          key={t}
                          className="text-[10px] font-semibold bg-sky-50 text-sky-700 px-2 py-0.5 rounded-md border border-sky-200/60"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}

                  {c.aiSummary && (
                    <div className="mt-3 p-2.5 rounded-xl bg-sky-50/70 border border-sky-100 text-xs text-slate-700">
                      <div className="flex items-center gap-1 text-[10px] font-bold text-sky-800 mb-0.5">
                        <Bot className="w-3 h-3" /> AI Profile Note:
                      </div>
                      <p className="text-[11px] text-slate-600 line-clamp-2">{c.aiSummary}</p>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="text-slate-500">
                    <span className="font-bold text-slate-900">{c.totalOrders || 0}</span> orders •{" "}
                    <span className="font-bold text-emerald-600">{formatPKR(c.totalSpent || 0)}</span>
                  </div>

                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                    title="Open WhatsApp"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Customer Detail & AI Summary Drawer/Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-lg bg-white h-full overflow-y-auto p-5 sm:p-6 shadow-2xl flex flex-col justify-between">
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{selectedCustomer.name}</h2>
                  <span className="text-xs text-slate-500">Customer Profile & Audit</span>
                </div>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="p-1.5 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* AI Summary Section */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-sky-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-sky-600" />
                    AI Factual Customer Summary
                  </span>
                  <button
                    onClick={handleGenerateAiSummary}
                    disabled={aiSummaryLoading}
                    className="text-[11px] font-bold bg-white text-sky-700 border border-sky-300 px-2.5 py-1 rounded-lg hover:bg-sky-50 transition"
                  >
                    {aiSummaryLoading ? "Analyzing..." : "Regenerate AI Summary"}
                  </button>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {selectedCustomer.aiSummary ||
                    "Click 'Regenerate AI Summary' to analyze this customer's actual order history and produce a verified overview."}
                </p>
              </div>

              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block mb-1">Phone (WhatsApp)</span>
                  <span className="font-mono font-bold text-slate-800">{selectedCustomer.phone}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block mb-1">Total Lifetime Spend</span>
                  <span className="font-bold text-emerald-600 text-sm">
                    {formatPKR(selectedCustomer.totalSpent || 0)}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 col-span-2">
                  <span className="text-slate-400 block mb-1">Delivery Address</span>
                  <span className="font-medium text-slate-700">
                    {selectedCustomer.address || "No street address specified"},{" "}
                    {selectedCustomer.city || "Lahore"}
                  </span>
                </div>
              </div>

              {/* Order History */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Order History ({customerOrders.length})
                </h4>
                {customerOrders.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No previous orders recorded yet.</p>
                ) : (
                  <div className="space-y-2">
                    {customerOrders.map((ord: any) => (
                      <div
                        key={ord._id}
                        className="p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-bold text-slate-900 block">{ord.orderNumber}</span>
                          <span className="text-[11px] text-slate-500">{formatDate(ord.createdAt)}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-slate-900 block">{formatPKR(ord.total)}</span>
                          <span className="text-[10px] font-bold uppercase text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded">
                            {ord.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex gap-2">
              <a
                href={`https://wa.me/${selectedCustomer.phone?.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow"
              >
                <Send className="w-4 h-4" />
                Open WhatsApp Chat
              </a>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="py-3 px-4 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">Add New Customer</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCustomer} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ali Raza"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">WhatsApp Phone Number *</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+92 321 1234567"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 font-mono text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="optional"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Lahore"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Street Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. House 12, DHA Phase 5"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="VIP, Repeat Buyer, Wholesale"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Private Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Delivery notes, preferences..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 text-sm"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 border border-slate-300 rounded-xl font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-semibold shadow-sm"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
