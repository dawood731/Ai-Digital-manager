"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bot, Check, ArrowRight, ArrowLeft, Loader2, Sparkles, Building2, MapPin, Phone, Shield } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form states
  const [businessName, setBusinessName] = useState("");
  const [category, setCategory] = useState("Clothing & Fashion");
  const [city, setCity] = useState("Lahore");
  const [phone, setPhone] = useState("+92 300 ");
  const [ownerName, setOwnerName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [aiMode, setAiMode] = useState<"ASSISTANT" | "APPROVAL" | "AUTONOMOUS">("APPROVAL");

  const categories = [
    "Clothing & Fashion",
    "Food & Bakery",
    "Cosmetics & Skincare",
    "Mobile Accessories & Tech",
    "Jewelry & Watches",
    "Salon & Personal Care",
    "Home Decor & Furniture",
    "Coaching & Services",
    "General Retail",
  ];

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: ownerName,
          email,
          password,
          businessName,
          category,
          phone,
          city,
          aiMode,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create account");
      }

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
            <Bot className="w-7 h-7" />
          </div>
        </Link>
        <h2 className="mt-4 text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Set Up Your AI Digital Manager
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Step {step} of 3: {step === 1 ? "Business Profile" : step === 2 ? "Account Details" : "AI Mode Configuration"}
        </p>

        {/* Progress Bar */}
        <div className="mt-4 max-w-xs mx-auto flex items-center gap-2">
          <div className={`h-1.5 flex-1 rounded-full ${step >= 1 ? "bg-sky-600" : "bg-slate-200"}`}></div>
          <div className={`h-1.5 flex-1 rounded-full ${step >= 2 ? "bg-sky-600" : "bg-slate-200"}`}></div>
          <div className={`h-1.5 flex-1 rounded-full ${step >= 3 ? "bg-sky-600" : "bg-slate-200"}`}></div>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 rounded-2xl border border-slate-200 sm:px-10">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
            {/* Step 1: Business Details */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Business / Brand Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Dawood Fashion, Lahore Bakers"
                    className="block w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Business Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="block w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Lahore"
                      className="block w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Currency
                    </label>
                    <input
                      type="text"
                      disabled
                      value="PKR (Rs.)"
                      className="block w-full px-3.5 py-2.5 border border-slate-200 bg-slate-100 rounded-xl text-sm text-slate-600 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    WhatsApp Business Phone *
                  </label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+92 300 1234567"
                    className="block w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (!businessName) {
                      setError("Please enter your business name.");
                      return;
                    }
                    setError("");
                    setStep(2);
                  }}
                  className="w-full mt-4 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-sky-600 hover:bg-sky-500 transition"
                >
                  Continue to Owner Account
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Step 2: Owner Credentials */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="e.g. Dawood Khan"
                    className="block w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Work Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="dawood@mybrand.pk"
                    className="block w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Create Password (min 6 characters) *
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 py-3 px-4 rounded-xl text-sm font-semibold text-slate-700 border border-slate-300 hover:bg-slate-50 transition flex items-center justify-center gap-1.5"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!ownerName || !email || !password) {
                        setError("Please fill all account details.");
                        return;
                      }
                      setError("");
                      setStep(3);
                    }}
                    className="flex-1 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-sky-600 hover:bg-sky-500 transition flex items-center justify-center gap-1.5"
                  >
                    Next: AI Control
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: AI Mode Selection */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="text-center pb-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-600 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200">
                    <Sparkles className="w-3.5 h-3.5" />
                    Step 3: Choose AI Operating Mode
                  </span>
                  <p className="text-xs text-slate-500 mt-2">
                    How much autonomous authority should your Digital Manager have? You can change this anytime.
                  </p>
                </div>

                <div className="space-y-2.5">
                  <div
                    onClick={() => setAiMode("APPROVAL")}
                    className={`p-3.5 rounded-xl border-2 cursor-pointer transition flex items-start gap-3 ${
                      aiMode === "APPROVAL"
                        ? "border-sky-600 bg-sky-50/50 shadow-sm"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="w-5 h-5 rounded-full border flex items-center justify-center mt-0.5 border-sky-600 bg-sky-600 text-white">
                      {aiMode === "APPROVAL" && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">Approval Mode</span>
                        <span className="text-[10px] uppercase font-bold bg-sky-100 text-sky-700 px-1.5 py-0.2 rounded">Recommended</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">
                        AI drafts customer replies, follow-ups, and orders. You approve with 1 click before anything is sent.
                      </p>
                    </div>
                  </div>

                  <div
                    onClick={() => setAiMode("ASSISTANT")}
                    className={`p-3.5 rounded-xl border-2 cursor-pointer transition flex items-start gap-3 ${
                      aiMode === "ASSISTANT"
                        ? "border-sky-600 bg-sky-50/50 shadow-sm"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="w-5 h-5 rounded-full border flex items-center justify-center mt-0.5 border-sky-600 bg-sky-600 text-white">
                      {aiMode === "ASSISTANT" && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <div>
                      <span className="font-bold text-sm text-slate-900">Assistant Mode</span>
                      <p className="text-xs text-slate-600 mt-0.5">
                        AI answers questions and gives suggestions only. All actions are performed manually by you.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="flex-1 py-3 px-4 rounded-xl text-sm font-semibold text-slate-700 border border-slate-300 hover:bg-slate-50 transition flex items-center justify-center gap-1.5"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-sky-600 hover:bg-sky-500 shadow-md shadow-sky-600/20 transition flex items-center justify-center gap-1.5 disabled:opacity-70"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Launch My Manager"}
                    {!loading && <ArrowRight className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-sky-600 hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
