"use client";

import { useEffect, useState } from "react";
import {
  BarChart3,
  TrendingUp,
  ShoppingCart,
  Users,
  CreditCard,
  Sparkles,
  Bot,
  Calendar,
  Loader2,
  PieChart,
  RefreshCw,
} from "lucide-react";
import { formatPKR } from "@/lib/utils";

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [aiInsights, setAiInsights] = useState<string[]>([]);
  const [range, setRange] = useState("30d");
  const [loading, setLoading] = useState(true);
  const [insightsLoading, setInsightsLoading] = useState(false);

  async function loadAnalytics(withInsights: boolean = false) {
    try {
      if (withInsights) setInsightsLoading(true);
      else setLoading(true);

      const res = await fetch(`/api/analytics?range=${range}&aiInsights=${withInsights}`);
      const data = await res.json();
      setAnalytics(data.analytics);
      if (data.aiInsights?.length > 0) {
        setAiInsights(data.aiInsights);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setInsightsLoading(false);
    }
  }

  useEffect(() => {
    loadAnalytics(true);
  }, [range]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-sky-600" />
            Financial & Operational Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Deterministic revenue, repeat customer retention, and Gemini business insights.
          </p>
        </div>

        {/* Date Filters */}
        <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-xl self-start sm:self-auto shadow-sm">
          {[
            { label: "Today", val: "today" },
            { label: "7 Days", val: "7d" },
            { label: "30 Days", val: "30d" },
            { label: "90 Days", val: "90d" },
            { label: "All Time", val: "all" },
          ].map((r) => (
            <button
              key={r.val}
              onClick={() => setRange(r.val)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                range === r.val ? "bg-sky-600 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-sky-600" />
        </div>
      ) : (
        <>
          {/* AI Strategic Business Insights Card */}
          <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-sky-50 via-indigo-50 to-purple-50 border border-sky-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-sky-600 text-white flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm sm:text-base text-slate-900">
                  AI Digital Manager Strategic Summary ({range.toUpperCase()})
                </h3>
              </div>

              <button
                onClick={() => loadAnalytics(true)}
                disabled={insightsLoading}
                className="inline-flex items-center gap-1 text-xs font-semibold bg-white text-sky-700 px-3 py-1.5 rounded-lg border border-sky-200 hover:bg-sky-50 transition shadow-sm"
              >
                {insightsLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                <span>{insightsLoading ? "Analyzing..." : "Refresh Insights"}</span>
              </button>
            </div>

            <div className="space-y-2 pt-1 text-xs sm:text-sm text-slate-700 leading-relaxed">
              {aiInsights.length > 0 ? (
                aiInsights.map((insight, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-white/80 border border-sky-100 flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                    <span>{insight.replace(/^[-•\d.]\s*/, "")}</span>
                  </div>
                ))
              ) : (
                <p className="italic text-slate-500">
                  Click &apos;Refresh Insights&apos; to let Gemini analyze your current period revenue and retention trends.
                </p>
              )}
            </div>
          </div>

          {/* Core Analytics KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-medium text-slate-500 block">Total Revenue</span>
              <p className="text-2xl font-black text-slate-900 mt-2">
                {formatPKR(analytics?.totalRevenue || 0)}
              </p>
              <span className="text-[11px] text-emerald-600 font-semibold mt-1 inline-block">
                Across {analytics?.totalOrders || 0} customer orders
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-medium text-slate-500 block">Average Order Value (AOV)</span>
              <p className="text-2xl font-black text-slate-900 mt-2">
                {formatPKR(analytics?.averageOrderValue || 0)}
              </p>
              <span className="text-[11px] text-slate-500 font-semibold mt-1 inline-block">
                Mean transaction size
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-medium text-slate-500 block">Repeat Customer Rate</span>
              <p className="text-2xl font-black text-indigo-600 mt-2">
                {analytics?.repeatRatePercent || 0}%
              </p>
              <span className="text-[11px] text-slate-500 font-semibold mt-1 inline-block">
                {analytics?.repeatCustomers || 0} repeat buyers of {analytics?.totalCustomers || 0}
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-medium text-slate-500 block">Inquiry Conversion</span>
              <p className="text-2xl font-black text-emerald-600 mt-2">
                {analytics?.conversionRatePercent || 0}%
              </p>
              <span className="text-[11px] text-slate-500 font-semibold mt-1 inline-block">
                {analytics?.convertedInquiries || 0} converted to confirmed orders
              </span>
            </div>
          </div>

          {/* Top Products & Order Status Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Products */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="font-bold text-sm text-slate-900 pb-2 border-b border-slate-100">
                Top Revenue Generating Products
              </h3>
              {analytics?.topProducts?.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No sales in this period.</p>
              ) : (
                <div className="space-y-2.5">
                  {analytics?.topProducts?.map((p: any, i: number) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-900 block">{p.name}</span>
                        <span className="text-slate-500">{p.quantity} units sold</span>
                      </div>
                      <span className="font-black text-slate-900">{formatPKR(p.revenue)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Order Status Distribution */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="font-bold text-sm text-slate-900 pb-2 border-b border-slate-100">
                Order Pipeline Status Breakdown
              </h3>
              <div className="space-y-2 pt-1">
                {Object.entries(analytics?.statusDistribution || {}).map(([status, count]) => (
                  <div
                    key={status}
                    className="p-2.5 rounded-xl border border-slate-100 flex items-center justify-between text-xs"
                  >
                    <span className="font-bold uppercase tracking-wider text-slate-700">
                      {status}
                    </span>
                    <span className="font-bold text-sky-600 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
                      {count as number} orders
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
