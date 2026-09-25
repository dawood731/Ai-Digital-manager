"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Shield,
  Building2,
  Users,
  CreditCard,
  History,
  Bot,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Database,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function AdminPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [seedLoading, setSeedLoading] = useState(false);

  async function loadAdminData() {
    try {
      setLoading(true);
      const res = await fetch("/api/admin");
      if (res.status === 403 || res.status === 401) {
        router.push("/login");
        return;
      }
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load admin data");
      setData(json);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleSeed = async () => {
    setSeedLoading(true);
    try {
      const res = await fetch("/api/dev/seed", { method: "POST" });
      if (res.ok) {
        alert("Seed data executed successfully!");
        loadAdminData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSeedLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white p-4">
        <AlertCircle className="w-10 h-10 text-rose-500 mb-2" />
        <h2 className="text-lg font-bold">Admin Authorization Error</h2>
        <p className="text-xs text-slate-400 mt-1 mb-4">{error}</p>
        <Link href="/login" className="px-4 py-2 bg-purple-600 rounded-xl text-xs font-bold">
          Sign In as Admin
        </Link>
      </div>
    );
  }

  const { businesses, users, subscriptions, auditLogs } = data || {};

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 sm:p-8 space-y-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-lg shadow-purple-600/30">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                Super Admin Control Panel
              </h1>
              <span className="text-xs text-slate-400">
                Multi-tenant tenant oversight & system telemetry
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSeed}
              disabled={seedLoading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
            >
              <Database className="w-3.5 h-3.5 text-purple-400" />
              <span>{seedLoading ? "Seeding..." : "Reset / Reseed Platform"}</span>
            </button>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition shadow-sm"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>To Business App</span>
            </Link>
          </div>
        </div>

        {/* High-level Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/60">
            <span className="text-xs text-slate-400">Total Businesses</span>
            <p className="text-2xl font-black text-white mt-1">{businesses?.length || 0}</p>
          </div>
          <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/60">
            <span className="text-xs text-slate-400">Total Users</span>
            <p className="text-2xl font-black text-white mt-1">{users?.length || 0}</p>
          </div>
          <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/60">
            <span className="text-xs text-slate-400">Active Subscriptions</span>
            <p className="text-2xl font-black text-purple-400 mt-1">{subscriptions?.length || 0}</p>
          </div>
          <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/60">
            <span className="text-xs text-slate-400">Audit Logs Recorded</span>
            <p className="text-2xl font-black text-emerald-400 mt-1">{auditLogs?.length || 0}</p>
          </div>
        </div>

        {/* Businesses Table */}
        <div className="bg-slate-800/60 p-5 rounded-2xl border border-slate-700/60 space-y-3">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-purple-400" />
            Registered Business Tenants
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/60 text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="p-3">Business Name</th>
                  <th className="p-3">Owner</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">City</th>
                  <th className="p-3">AI Mode</th>
                  <th className="p-3">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/40">
                {businesses?.map((b: any) => (
                  <tr key={b._id} className="hover:bg-slate-800/40">
                    <td className="p-3 font-bold text-white">{b.name}</td>
                    <td className="p-3">{b.ownerId?.name || "Owner"}</td>
                    <td className="p-3">{b.category}</td>
                    <td className="p-3">{b.city}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-purple-900/60 text-purple-300 text-[10px] font-bold">
                        {b.aiSettings?.mode || "APPROVAL"}
                      </span>
                    </td>
                    <td className="p-3 text-slate-400">{formatDate(b.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="bg-slate-800/60 p-5 rounded-2xl border border-slate-700/60 space-y-3">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <History className="w-4 h-4 text-emerald-400" />
            Platform Audit Trails
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/60 text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="p-3">Action</th>
                  <th className="p-3">Entity</th>
                  <th className="p-3">Entity ID</th>
                  <th className="p-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/40">
                {auditLogs?.map((log: any) => (
                  <tr key={log._id} className="hover:bg-slate-800/40">
                    <td className="p-3 font-mono text-purple-300 font-bold">{log.action}</td>
                    <td className="p-3">{log.entity}</td>
                    <td className="p-3 font-mono text-slate-400">{log.entityId || "-"}</td>
                    <td className="p-3 text-slate-400">{formatDate(log.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
