"use client";

import { useEffect, useState } from "react";
import {
  MessageSquare,
  Search,
  Plus,
  Bot,
  Send,
  CheckCircle2,
  Copy,
  Check,
  ArrowRight,
  ShoppingCart,
  X,
  Loader2,
  Sparkles,
  Phone,
} from "lucide-react";
import { formatPKR, formatDate } from "@/lib/utils";

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [convertingId, setConvertingId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Inquiry Form
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("+92 3");
  const [message, setMessage] = useState("");
  const [channel, setChannel] = useState("WHATSAPP");

  async function loadInquiries() {
    try {
      setLoading(true);
      const url = new URL("/api/inquiries", window.location.origin);
      if (statusFilter) url.searchParams.set("status", statusFilter);

      const res = await fetch(url.toString());
      const data = await res.json();
      setInquiries(data.inquiries || []);
    } catch (err) {
      console.error("Failed to load inquiries:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInquiries();
  }, [statusFilter]);

  const handleCopyReply = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleGenerateReply = async (inq: any) => {
    setGeneratingId(inq._id);
    try {
      const res = await fetch("/api/ai/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerMessage: inq.message,
          customerPhone: inq.customerPhone,
          productId: inq.productId?._id,
        }),
      });

      const data = await res.json();
      if (data.reply) {
        // Save reply to inquiry
        await fetch(`/api/inquiries/${inq._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            aiSuggestedReply: data.reply,
            status: "RESPONDED",
          }),
        });
        loadInquiries();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingId(null);
    }
  };

  const handleConvertInquiry = async (inq: any) => {
    setConvertingId(inq._id);
    try {
      const res = await fetch(`/api/inquiries/${inq._id}/convert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const data = await res.json();
      if (data.success) {
        alert(data.message);
        loadInquiries();
      }
    } catch (err) {
      console.error("Conversion error:", err);
    } finally {
      setConvertingId(null);
    }
  };

  const handleCreateInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          customerPhone,
          message,
          channel,
        }),
      });

      if (res.ok) {
        setIsAddModalOpen(false);
        setCustomerName("");
        setCustomerPhone("+92 3");
        setMessage("");
        loadInquiries();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-sky-600" />
            Customer Inquiries & Leads
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Incoming WhatsApp, Instagram & Facebook messages. AI drafts accurate replies using your real stock.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-sm self-start sm:self-auto transition"
        >
          <Plus className="w-4 h-4" />
          <span>Record New Inquiry</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
        {[
          { label: "All Inquiries", val: "" },
          { label: "New Leads", val: "NEW" },
          { label: "Open", val: "OPEN" },
          { label: "Responded", val: "RESPONDED" },
          { label: "Converted to Order", val: "CONVERTED" },
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

      {/* Inquiries List */}
      {loading ? (
        <div className="py-20 flex justify-center text-slate-400">
          <Loader2 className="w-7 h-7 animate-spin text-sky-600" />
        </div>
      ) : inquiries.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 p-6">
          <MessageSquare className="w-10 h-10 mx-auto text-slate-300 mb-2" />
          <h3 className="font-bold text-slate-800 text-sm">No inquiries found</h3>
          <p className="text-xs text-slate-500 mt-1">Record messages received from WhatsApp or social media.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {inquiries.map((inq) => {
            const cleanedPhone = inq.customerPhone?.replace(/[^0-9]/g, "");
            const waPhone = cleanedPhone?.startsWith("03") ? "92" + cleanedPhone.slice(1) : cleanedPhone;
            const waUrl = inq.aiSuggestedReply
              ? `https://wa.me/${waPhone}?text=${encodeURIComponent(inq.aiSuggestedReply)}`
              : `https://wa.me/${waPhone}`;

            return (
              <div
                key={inq._id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 hover:border-slate-300 transition"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base text-slate-900">{inq.customerName}</span>
                    <span className="text-xs text-slate-500 font-mono">({inq.customerPhone})</span>
                    <span className="text-[10px] uppercase font-bold bg-sky-50 text-sky-700 px-2 py-0.5 rounded border border-sky-200">
                      {inq.channel}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        inq.status === "CONVERTED"
                          ? "bg-emerald-100 text-emerald-800"
                          : inq.status === "NEW"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {inq.status}
                    </span>
                    <span className="text-[11px] text-slate-400">{formatDate(inq.createdAt)}</span>
                  </div>
                </div>

                {/* Customer Message */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-medium">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Incoming Customer Message:
                  </span>
                  “{inq.message}”
                </div>

                {/* AI Suggested Response Box */}
                {inq.aiSuggestedReply ? (
                  <div className="p-4 rounded-xl bg-gradient-to-r from-sky-50 to-indigo-50/70 border border-sky-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-sky-900 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                        AI Verified Customer Response (Derived from real stock & delivery rates)
                      </span>
                      <button
                        onClick={() => handleCopyReply(inq._id, inq.aiSuggestedReply)}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-700 hover:text-sky-900 bg-white px-2 py-1 rounded-md border border-sky-200"
                      >
                        {copiedId === inq._id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        {copiedId === inq._id ? "Copied!" : "Copy Text"}
                      </button>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                      {inq.aiSuggestedReply}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-sky-200/60">
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Send via WhatsApp</span>
                      </a>

                      {inq.status !== "CONVERTED" && (
                        <button
                          onClick={() => handleConvertInquiry(inq)}
                          disabled={convertingId === inq._id}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-sm"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>
                            {convertingId === inq._id ? "Converting..." : "Convert → Customer & Order"}
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-dashed border-slate-200">
                    <span className="text-xs text-slate-500">No AI reply generated yet.</span>
                    <button
                      onClick={() => handleGenerateReply(inq)}
                      disabled={generatingId === inq._id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 text-white text-xs font-bold hover:bg-sky-500"
                    >
                      {generatingId === inq._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Bot className="w-3.5 h-3.5" />}
                      <span>Generate AI Reply</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Record Inquiry Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">Record Customer Inquiry</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInquiry} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Customer Name *</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Hamza Malik"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">WhatsApp Phone *</label>
                <input
                  type="text"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+92 322 4443322"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Channel</label>
                <select
                  value={channel}
                  onChange={(e) => setChannel(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm bg-white"
                >
                  <option value="WHATSAPP">WhatsApp</option>
                  <option value="INSTAGRAM">Instagram</option>
                  <option value="FACEBOOK">Facebook</option>
                  <option value="DIRECT">Direct Call / Store</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Customer Inquiry Message (Roman Urdu or English) *
                </label>
                <textarea
                  rows={3}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="e.g. Black shirt medium size available hai? Lahore delivery charges kitne hain?"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 border border-slate-300 rounded-xl font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-semibold shadow-sm"
                >
                  Save & Trigger AI Reply
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
