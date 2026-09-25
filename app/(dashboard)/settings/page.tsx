"use client";

import { useEffect, useState } from "react";
import {
  Settings,
  Bot,
  Shield,
  Truck,
  Building2,
  Save,
  Check,
  Loader2,
  Sparkles,
  Lock,
} from "lucide-react";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Business state
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [city, setCity] = useState("Lahore");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [currency, setCurrency] = useState("PKR");

  // Delivery settings
  const [deliveryFee, setDeliveryFee] = useState("250");
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState("3000");
  const [cityDeliveryTime, setCityDeliveryTime] = useState("1-2 Business Days");
  const [nationalDeliveryTime, setNationalDeliveryTime] = useState("3-5 Business Days");

  // AI settings
  const [aiMode, setAiMode] = useState<"ASSISTANT" | "APPROVAL" | "AUTONOMOUS">("APPROVAL");
  const [permissions, setPermissions] = useState({
    draftFollowUps: true,
    createCustomers: true,
    createDraftOrders: true,
    updateOrderStatus: false,
    sendAutomatedFollowups: false,
    answerCustomerQuestions: true,
    sendPaymentReminders: false,
  });

  useEffect(() => {
    async function loadBusiness() {
      try {
        setLoading(true);
        const res = await fetch("/api/business");
        const data = await res.json();
        if (data.business) {
          const b = data.business;
          setName(b.name || "");
          setCategory(b.category || "");
          setCity(b.city || "Lahore");
          setPhone(b.phone || "");
          setAddress(b.address || "");
          setCurrency(b.currency || "PKR");

          if (b.settings) {
            setDeliveryFee(b.settings.deliveryFee?.toString() || "250");
            setFreeDeliveryThreshold(b.settings.freeDeliveryThreshold?.toString() || "3000");
            setCityDeliveryTime(b.settings.cityDeliveryTime || "1-2 Business Days");
            setNationalDeliveryTime(b.settings.nationalDeliveryTime || "3-5 Business Days");
          }

          if (b.aiSettings) {
            setAiMode(b.aiSettings.mode || "APPROVAL");
            if (b.aiSettings.permissions) {
              setPermissions({ ...permissions, ...b.aiSettings.permissions });
            }
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadBusiness();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      const res = await fetch("/api/business", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          category,
          city,
          phone,
          address,
          currency,
          settings: {
            deliveryFee: Number(deliveryFee),
            freeDeliveryThreshold: Number(freeDeliveryThreshold),
            cityDeliveryTime,
            nationalDeliveryTime,
          },
          aiSettings: {
            mode: aiMode,
            permissions,
          },
        }),
      });

      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-sky-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-slate-700" />
          Settings & AI Permissions
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Configure business profile, delivery rates, and grant/restrict AI autonomous permissions.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: AI Operating Mode & Permissions */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">
                AI Digital Manager Authority & Mode
              </h3>
              <span className="text-xs text-slate-500">
                Determine what actions AI can perform autonomously vs requiring your approval.
              </span>
            </div>
          </div>

          {/* Mode Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                mode: "ASSISTANT",
                title: "Mode 1: Assistant",
                desc: "Suggestions only. AI answers queries but executes no database changes.",
              },
              {
                mode: "APPROVAL",
                title: "Mode 2: Approval (Default)",
                desc: "AI prepares ready-to-send messages & draft orders. You approve with 1 click.",
              },
              {
                mode: "AUTONOMOUS",
                title: "Mode 3: Autonomous",
                desc: "AI automatically executes allowed routine operations checked below.",
              },
            ].map((m) => (
              <div
                key={m.mode}
                onClick={() => setAiMode(m.mode as any)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition flex flex-col justify-between ${
                  aiMode === m.mode
                    ? "border-sky-600 bg-sky-50/50 shadow-sm"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-slate-900">{m.title}</span>
                    {aiMode === m.mode && <Check className="w-4 h-4 text-sky-600 stroke-[3]" />}
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{m.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Granular Permission Toggles */}
          <div className="pt-3 border-t border-slate-100 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Granular AI Permission Controls
            </span>

            <div className="space-y-2.5">
              {[
                {
                  key: "draftFollowUps",
                  label: "AI can draft customer follow-ups",
                  desc: "Generates personalized WhatsApp reminders for pending orders & reviews.",
                },
                {
                  key: "createCustomers",
                  label: "AI can auto-create customer records from inquiries",
                  desc: "Extracts phone and address to build client profiles without manual entry.",
                },
                {
                  key: "createDraftOrders",
                  label: "AI can prepare draft orders",
                  desc: "Parses items from chat inquiries to assemble confirmed order tickets.",
                },
                {
                  key: "answerCustomerQuestions",
                  label: "AI can answer customer availability questions",
                  desc: "Uses live catalog inventory to state availability and sizes.",
                },
                {
                  key: "sendAutomatedFollowups",
                  label: "AI can send routine follow-ups automatically",
                  desc: "Requires autonomous mode. High impact action.",
                  danger: true,
                },
                {
                  key: "updateOrderStatus",
                  label: "AI can update order status",
                  desc: "Allows automated transition to preparing/shipped states.",
                  danger: true,
                },
                {
                  key: "sendPaymentReminders",
                  label: "AI can send direct payment reminders",
                  desc: "Dispatches payment nudges after designated delay.",
                  danger: true,
                },
              ].map((item) => (
                <label
                  key={item.key}
                  className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer transition"
                >
                  <input
                    type="checkbox"
                    checked={(permissions as any)[item.key]}
                    onChange={(e) =>
                      setPermissions({ ...permissions, [item.key]: e.target.checked })
                    }
                    className="mt-0.5 w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500"
                  />
                  <div>
                    <span className="font-bold text-xs text-slate-900 block flex items-center gap-1.5">
                      {item.label}
                      {item.danger && (
                        <span className="text-[9px] uppercase font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded">
                          Approval Required
                        </span>
                      )}
                    </span>
                    <span className="text-[11px] text-slate-500 mt-0.5 block">{item.desc}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Section 2: Business Profile */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Building2 className="w-5 h-5 text-slate-500" />
            <h3 className="font-bold text-base text-slate-900">Business Profile</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Business Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Business Category</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">WhatsApp Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Store / Warehouse Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Delivery Rules (Used by AI in responses) */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Truck className="w-5 h-5 text-slate-500" />
            <h3 className="font-bold text-base text-slate-900">
              Delivery Rates & Courier Rules (Used by AI)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Standard Delivery Fee (PKR)</label>
              <input
                type="number"
                value={deliveryFee}
                onChange={(e) => setDeliveryFee(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Free Delivery on Orders Above (PKR)</label>
              <input
                type="number"
                value={freeDeliveryThreshold}
                onChange={(e) => setFreeDeliveryThreshold(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">City Delivery Timeframe</label>
              <input
                type="text"
                value={cityDeliveryTime}
                onChange={(e) => setCityDeliveryTime(e.target.value)}
                placeholder="1-2 Business Days"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nationwide Delivery Timeframe</label>
              <input
                type="text"
                value={nationalDeliveryTime}
                onChange={(e) => setNationalDeliveryTime(e.target.value)}
                placeholder="3-5 Business Days"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
              />
            </div>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-between pt-2">
          {savedSuccess && (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
              <Check className="w-4 h-4 stroke-[3]" />
              Settings and AI permissions saved successfully!
            </span>
          )}
          {!savedSuccess && <div />}

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md shadow-sky-600/25 flex items-center gap-2 transition disabled:opacity-70"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Changes</span>
          </button>
        </div>
      </form>
    </div>
  );
}
