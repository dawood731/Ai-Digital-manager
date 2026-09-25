"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bot, Lock, Mail, ArrowRight, Loader2, Sparkles, Database } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [seedLoading, setSeedLoading] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      if (data.user?.role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSeed = async () => {
    setSeedLoading(true);
    setSeedSuccess("");
    setError("");
    try {
      const res = await fetch("/api/dev/seed", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setSeedSuccess("Demo database seeded! Click below to auto-fill credentials.");
        setEmail("demo@dawoodfashion.pk");
        setPassword("password123");
      } else {
        setError(data.error || "Failed to seed demo data");
      }
    } catch (e: any) {
      setError(e.message || "Failed to seed demo data");
    } finally {
      setSeedLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 px-4">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
            <Bot className="w-7 h-7" />
          </div>
        </Link>
        <h2 className="mt-4 text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Welcome to AI Digital Manager
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Sign in to access your business operations dashboard
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 rounded-2xl border border-slate-200 sm:px-10">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm">
              {error}
            </div>
          )}

          {seedSuccess && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs sm:text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
              {seedSuccess}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@business.pk"
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-sky-600 hover:bg-sky-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition disabled:opacity-70 active:scale-[0.99]"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign in to Dashboard"}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          {/* Quick Demo Fill Buttons */}
          <div className="mt-6 pt-6 border-t border-slate-200 space-y-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block text-center">
              Quick Demo Access
            </span>

            <button
              type="button"
              onClick={() => {
                setEmail("demo@dawoodfashion.pk");
                setPassword("password123");
              }}
              className="w-full text-left p-2.5 rounded-lg border border-sky-100 bg-sky-50/50 hover:bg-sky-100 text-xs text-slate-700 transition flex items-center justify-between"
            >
              <div>
                <span className="font-bold text-sky-900 block">Dawood Fashion (Owner)</span>
                <span className="text-slate-500 font-mono text-[11px]">demo@dawoodfashion.pk</span>
              </div>
              <span className="text-sky-600 font-semibold text-[11px]">Auto Fill</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setEmail("admin@aidigitalmanager.com");
                setPassword("admin123");
              }}
              className="w-full text-left p-2.5 rounded-lg border border-purple-100 bg-purple-50/50 hover:bg-purple-100 text-xs text-slate-700 transition flex items-center justify-between"
            >
              <div>
                <span className="font-bold text-purple-900 block">System Admin Panel</span>
                <span className="text-slate-500 font-mono text-[11px]">admin@aidigitalmanager.com</span>
              </div>
              <span className="text-purple-600 font-semibold text-[11px]">Auto Fill</span>
            </button>

            <button
              type="button"
              onClick={handleQuickSeed}
              disabled={seedLoading}
              className="w-full mt-2 py-2 px-3 border border-dashed border-slate-300 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition flex items-center justify-center gap-1.5"
            >
              {seedLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Database className="w-3.5 h-3.5 text-sky-600" />}
              {seedLoading ? "Seeding Database..." : "Reset / Seed Demo Database"}
            </button>
          </div>

          <div className="mt-6 text-center text-xs text-slate-500">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-semibold text-sky-600 hover:underline">
              Start Free Trial
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
