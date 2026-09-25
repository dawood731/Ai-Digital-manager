"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Bot,
  TrendingUp,
  ShoppingCart,
  MessageSquare,
  Clock,
  AlertTriangle,
  CreditCard,
  Plus,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Phone,
  Send,
  Loader2,
  Package,
} from "lucide-react";
import { formatPKR, formatDate } from "@/lib/utils";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [aiGreeting, setAiGreeting] = useState("");
  const [greetingLoading, setGreetingLoading] = useState(false);

  async function loadDashboard() {
    try {
      setLoading(true);
      const [analyticsRes, followupsRes, inquiriesRes, productsRes] = await Promise.all([
        fetch("/api/analytics?range=today"),
        fetch("/api/followups?dueToday=true"),
        fetch("/api/inquiries?status=NEW"),
        fetch("/api/products?lowStock=true"),
      ]);

      const analytics = (await analyticsRes.json()).analytics;
      const followups = (await followupsRes.json()).followUps;
      const inquiries = (await inquiriesRes.json()).inquiries;
      const lowStockProducts = (await productsRes.json()).products;

      setData({
        analytics,
        followups,
        inquiries,
        lowStockProducts,
      });

      // Generate context-aware AI Digital Manager greeting
      const pendingPay = analytics?.pendingPaymentsCount || 0;
      const lowStockCount = lowStockProducts?.length || 0;
      const followDue = followups?.length || 0;
      const inqCount = inquiries?.length || 0;

      setAiGreeting(
        `Good day! I am actively monitoring your store. Today you have ${followDue} customer follow-ups due, ${pendingPay} pending payments, ${lowStockCount} items low on stock, and ${inqCount} new incoming inquiries.`
      );
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleMarkFollowUpDone = async (id: string) => {
    try {
      await fetch(`/api/followups/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "COMPLETED" }),
      });
      loadDashboard();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-sky-600 mb-2" />
        <span className="text-sm font-medium">Updating business metrics...</span>
      </div>
    );
  }

  const { analytics, followups, inquiries, lowStockProducts } = data || {};

  return (
    <div className="space-y-6">
      {/* Top Greeting & Location Context */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <span className="text-xs font-bold text-sky-600 uppercase tracking-widest">
            Daily Operations Center
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Today&apos;s Business Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Lahore, Pakistan • Real-time database status
          </p>
        </div>

        {/* Quick Create Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <Link
            href="/orders"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-sm transition shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Order</span>
          </Link>
          <Link
            href="/inquiries"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition shrink-0"
          >
            <MessageSquare className="w-3.5 h-3.5 text-sky-600" />
            <span>Inquiries ({inquiries?.length || 0})</span>
          </Link>
          <Link
            href="/customers"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Customer</span>
          </Link>
        </div>
      </div>

      {/* AI Digital Manager Proactive Action Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-sky-900 via-indigo-900 to-slate-900 text-white p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-40 h-40 rounded-full bg-sky-500/10 blur-2xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-sky-500/30">
              <Bot className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg text-white">
                  Your Digital Manager is on Duty
                </h3>
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-sky-500/30 text-sky-300 px-2 py-0.5 rounded border border-sky-400/30">
                  Approval Mode
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                {aiGreeting}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
            <Link
              href="/ai-manager"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-slate-900 text-xs font-bold hover:bg-slate-100 transition shadow"
            >
              <Sparkles className="w-3.5 h-3.5 text-sky-600" />
              <span>Ask AI Manager</span>
            </Link>
            <Link
              href="/followups"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600/80 hover:bg-sky-600 text-white text-xs font-bold transition border border-sky-400/30"
            >
              <span>Review {followups?.length || 0} Tasks</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Today&apos;s Sales</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
            {formatPKR(analytics?.totalRevenue || 0)}
          </p>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 inline-block">
            {analytics?.totalOrders || 0} orders today
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>New Inquiries</span>
            <MessageSquare className="w-4 h-4 text-sky-600" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
            {inquiries?.length || 0}
          </p>
          <Link href="/inquiries" className="text-[11px] text-sky-600 hover:underline font-semibold mt-1 inline-block">
            Generate replies →
          </Link>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Follow-ups Due</span>
            <Clock className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
            {followups?.length || 0}
          </p>
          <Link href="/followups" className="text-[11px] text-indigo-600 hover:underline font-semibold mt-1 inline-block">
            Send on WhatsApp →
          </Link>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Pending Payments</span>
            <CreditCard className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-amber-600 mt-2">
            {formatPKR(analytics?.pendingPaymentsAmount || 0)}
          </p>
          <span className="text-[11px] text-slate-500 font-semibold mt-1 inline-block">
            {analytics?.pendingPaymentsCount || 0} unpaid orders
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Low Stock Items</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-rose-600 mt-2">
            {lowStockProducts?.length || 0}
          </p>
          <Link href="/products" className="text-[11px] text-rose-600 hover:underline font-semibold mt-1 inline-block">
            Restock needed →
          </Link>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Avg Order Value</span>
            <ShoppingCart className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
            {formatPKR(analytics?.averageOrderValue || 0)}
          </p>
          <span className="text-[11px] text-slate-500 font-semibold mt-1 inline-block">
            Per customer basket
          </span>
        </div>
      </div>

      {/* Two Column Section: Priority Follow-ups & Incoming Inquiries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Due Follow-ups with WhatsApp Action */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-sm text-slate-900">
                  Follow-ups Due Today ({followups?.length || 0})
                </h3>
              </div>
              <Link href="/followups" className="text-xs font-semibold text-sky-600 hover:underline">
                View all
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              {followups?.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-1" />
                  All follow-ups completed for today!
                </div>
              ) : (
                followups?.slice(0, 3).map((f: any) => {
                  const cleanedPhone = f.customerId?.phone?.replace(/[^0-9]/g, "");
                  const waPhone = cleanedPhone?.startsWith("03") ? "92" + cleanedPhone.slice(1) : cleanedPhone;
                  const waUrl = `https://wa.me/${waPhone}?text=${encodeURIComponent(f.message)}`;

                  return (
                    <div
                      key={f._id}
                      className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between gap-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="font-bold text-xs text-slate-900">
                            {f.customerId?.name || "Customer"}
                          </span>
                          <span className="text-[11px] text-slate-500 ml-2 font-mono">
                            {f.customerId?.phone}
                          </span>
                          <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                            {f.message}
                          </p>
                        </div>
                        <span className="text-[10px] font-bold uppercase bg-amber-100 text-amber-800 px-2 py-0.5 rounded shrink-0">
                          {f.type}
                        </span>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200/60">
                        <button
                          onClick={() => handleMarkFollowUpDone(f._id)}
                          className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-200/70"
                        >
                          Mark Done
                        </button>
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm"
                        >
                          <Send className="w-3 h-3" />
                          Send WhatsApp
                        </a>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* New Inquiries with AI Suggested Replies */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-sky-600" />
                <h3 className="font-bold text-sm text-slate-900">
                  New Customer Inquiries ({inquiries?.length || 0})
                </h3>
              </div>
              <Link href="/inquiries" className="text-xs font-semibold text-sky-600 hover:underline">
                View all
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              {inquiries?.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  <CheckCircle2 className="w-8 h-8 mx-auto text-sky-500 mb-1" />
                  No pending customer inquiries. All caught up!
                </div>
              ) : (
                inquiries?.slice(0, 3).map((inq: any) => (
                  <div
                    key={inq._id}
                    className="p-3.5 rounded-xl border border-sky-100 bg-sky-50/40 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900">
                        {inq.customerName}
                      </span>
                      <span className="text-[10px] uppercase font-bold bg-sky-100 text-sky-700 px-1.5 py-0.5 rounded">
                        {inq.channel}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 font-medium">
                      “{inq.message}”
                    </p>

                    {inq.aiSuggestedReply ? (
                      <div className="p-2.5 rounded-lg bg-white border border-sky-200 text-xs text-slate-600 space-y-1">
                        <span className="text-[10px] font-bold text-sky-700 flex items-center gap-1">
                          <Bot className="w-3 h-3" /> AI Suggested Reply:
                        </span>
                        <p className="text-[11px] text-slate-700 line-clamp-2">
                          {inq.aiSuggestedReply}
                        </p>
                      </div>
                    ) : null}

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <Link
                        href={`/inquiries`}
                        className="text-xs font-semibold text-sky-600 hover:underline"
                      >
                        Review & Send Response →
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Low Stock Warning Section */}
      {lowStockProducts?.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-rose-50 border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-rose-100 text-rose-700 rounded-xl shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-rose-900">
                Low Inventory Alert: {lowStockProducts.length} items need restock
              </h4>
              <p className="text-xs text-rose-700 mt-0.5">
                {lowStockProducts.map((p: any) => `${p.name} (${p.stockQuantity} left)`).join(" • ")}
              </p>
            </div>
          </div>
          <Link
            href="/products?lowStock=true"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-sm shrink-0 self-start sm:self-auto"
          >
            <span>Update Inventory</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}
