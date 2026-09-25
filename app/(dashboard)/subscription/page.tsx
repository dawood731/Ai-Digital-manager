"use client";

import { useEffect, useState } from "react";
import {
  CreditCard,
  CheckCircle2,
  Sparkles,
  Zap,
  Users,
  Package,
  ShoppingCart,
  Bot,
  ArrowRight,
  Loader2,
  Clock,
} from "lucide-react";
import { formatPKR } from "@/lib/utils";

export default function SubscriptionPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [upgradingSlug, setUpgradingSlug] = useState<string | null>(null);

  async function loadSubscription() {
    try {
      setLoading(true);
      const res = await fetch("/api/subscription");
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSubscription();
  }, []);

  const handleUpgrade = async (slug: string) => {
    setUpgradingSlug(slug);
    try {
      const res = await fetch("/api/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planSlug: slug }),
      });
      const resJson = await res.json();
      if (res.ok) {
        alert(resJson.message);
        loadSubscription();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpgradingSlug(null);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-sky-600" />
      </div>
    );
  }

  const { subscription, availablePlans, currentUsage } = data || {};
  const plan = subscription?.planId;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-sky-600" />
          Subscription & Platform Usage Limits
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Manage your SaaS plan and inspect resource allocation in PKR.
        </p>
      </div>

      {/* Current Subscription Status Card */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Active Tier
            </span>
            <div className="flex items-center gap-2 mt-1">
              <h2 className="text-xl font-black text-slate-900">{plan?.name || "Free Trial (7 Days)"}</h2>
              <span className="text-xs font-bold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                {subscription?.status || "TRIALING"}
              </span>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs text-slate-500 block">Monthly Rate</span>
            <span className="text-xl font-black text-slate-900">
              {formatPKR(plan?.pricePKR || 0)} / mo
            </span>
          </div>
        </div>

        {/* Resource Usage Meters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {/* Customers */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-600 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-sky-600" /> Customers
              </span>
              <span className="text-slate-900">
                {currentUsage?.customers || 0} / {plan?.limits?.maxCustomers || 50}
              </span>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-sky-600 rounded-full"
                style={{
                  width: `${Math.min(
                    100,
                    ((currentUsage?.customers || 0) / (plan?.limits?.maxCustomers || 50)) * 100
                  )}%`,
                }}
              ></div>
            </div>
          </div>

          {/* Products */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-600 flex items-center gap-1">
                <Package className="w-3.5 h-3.5 text-sky-600" /> Products
              </span>
              <span className="text-slate-900">
                {currentUsage?.products || 0} / {plan?.limits?.maxProducts || 25}
              </span>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-sky-600 rounded-full"
                style={{
                  width: `${Math.min(
                    100,
                    ((currentUsage?.products || 0) / (plan?.limits?.maxProducts || 25)) * 100
                  )}%`,
                }}
              ></div>
            </div>
          </div>

          {/* Orders */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-600 flex items-center gap-1">
                <ShoppingCart className="w-3.5 h-3.5 text-sky-600" /> Orders
              </span>
              <span className="text-slate-900">
                {currentUsage?.orders || 0} / {plan?.limits?.maxOrdersPerMonth || 60}
              </span>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600 rounded-full"
                style={{
                  width: `${Math.min(
                    100,
                    ((currentUsage?.orders || 0) / (plan?.limits?.maxOrdersPerMonth || 60)) * 100
                  )}%`,
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Available Plans Grid */}
      <div>
        <h3 className="text-lg font-bold text-slate-900 mb-4">Available Subscription Tiers</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {availablePlans?.map((p: any) => {
            const isCurrent = plan?.slug === p.slug;

            return (
              <div
                key={p._id}
                className={`p-6 rounded-2xl bg-white border transition flex flex-col justify-between space-y-6 ${
                  isCurrent
                    ? "border-sky-600 ring-2 ring-sky-600/20 shadow-md"
                    : "border-slate-200 shadow-sm hover:border-slate-300"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-base text-slate-900">{p.name}</h4>
                    {isCurrent && (
                      <span className="text-[10px] font-bold uppercase bg-sky-100 text-sky-700 px-2 py-0.5 rounded">
                        Current
                      </span>
                    )}
                  </div>

                  <div className="mt-4 mb-4">
                    <span className="text-3xl font-black text-slate-900">{formatPKR(p.pricePKR)}</span>
                    <span className="text-xs text-slate-500 ml-1">/ month</span>
                  </div>

                  <ul className="space-y-2.5 text-xs text-slate-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                      Up to {p.limits?.maxCustomers} Customers
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                      Up to {p.limits?.maxProducts} Products
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                      {p.limits?.maxOrdersPerMonth} Orders / month
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                      {p.limits?.maxAiRequestsPerMonth} AI Queries / month
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                      {p.limits?.maxAutomations} Automations
                    </li>
                  </ul>
                </div>

                <button
                  onClick={() => handleUpgrade(p.slug)}
                  disabled={isCurrent || upgradingSlug === p.slug}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    isCurrent
                      ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                      : "bg-sky-600 hover:bg-sky-500 text-white shadow-sm"
                  }`}
                >
                  {upgradingSlug === p.slug ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isCurrent ? (
                    "Current Plan"
                  ) : (
                    "Switch to this Tier"
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
