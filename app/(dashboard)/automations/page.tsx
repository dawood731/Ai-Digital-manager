"use client";

import { useEffect, useState } from "react";
import {
  Zap,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Play,
  Pause,
  Plus,
  ArrowRight,
  Loader2,
  History,
  Shield,
  Bot,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function AutomationsPage() {
  const [automations, setAutomations] = useState<any[]>([]);
  const [executions, setExecutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  async function loadAutomations() {
    try {
      setLoading(true);
      const res = await fetch("/api/automations");
      const data = await res.json();
      setAutomations(data.automations || []);
      setExecutions(data.recentExecutions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAutomations();
  }, []);

  const handleToggle = async (auto: any) => {
    setTogglingId(auto._id);
    const newStatus = !auto.enabled;
    try {
      await fetch(`/api/automations/${auto._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: newStatus }),
      });
      setAutomations((prev) =>
        prev.map((a) => (a._id === auto._id ? { ...a, enabled: newStatus } : a))
      );
    } catch (err) {
      console.error(err);
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Zap className="w-6 h-6 text-amber-500" />
            Business Automation Engine
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Automate routine business operations without writing code. Trigger → Condition → Action.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            Engine: Online & Active
          </span>
        </div>
      </div>

      {/* Automation Cards */}
      {loading ? (
        <div className="py-20 flex justify-center text-slate-400">
          <Loader2 className="w-7 h-7 animate-spin text-sky-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {automations.map((auto) => (
            <div
              key={auto._id}
              className={`p-5 rounded-2xl border transition flex flex-col justify-between space-y-4 ${
                auto.enabled
                  ? "bg-white border-slate-200 shadow-sm"
                  : "bg-slate-50/70 border-slate-200 opacity-70"
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-base text-slate-900">{auto.name}</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {auto.description}
                    </p>
                  </div>

                  <button
                    onClick={() => handleToggle(auto)}
                    disabled={togglingId === auto._id}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                      auto.enabled
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {auto.enabled ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Active</span>
                      </>
                    ) : (
                      <>
                        <Pause className="w-3.5 h-3.5" />
                        <span>Paused</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Visual Pipeline Block */}
                <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-400 uppercase text-[10px] w-12">WHEN:</span>
                    <span className="font-semibold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {auto.trigger}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-400 uppercase text-[10px] w-12">THEN:</span>
                    <span className="font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                      {auto.actions?.[0]?.type || "EXECUTE_ACTION"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Created: {formatDate(auto.createdAt)}</span>
                <span className="font-medium text-slate-600">Continuous background polling</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Execution Audit Log Section */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <History className="w-4 h-4 text-slate-500" />
            Recent Automation Trigger Executions
          </h3>
          <span className="text-xs text-slate-400">Live system log</span>
        </div>

        {executions.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            No executions logged yet. As orders update, automated actions will record here.
          </div>
        ) : (
          <div className="space-y-2">
            {executions.map((ex) => (
              <div
                key={ex._id}
                className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      ex.status === "SUCCESS" ? "bg-emerald-500" : "bg-rose-500"
                    }`}
                  ></span>
                  <span className="font-bold text-slate-800">{ex.trigger}</span>
                  <span className="text-slate-500">{ex.details}</span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  {formatDate(ex.executedAt)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
