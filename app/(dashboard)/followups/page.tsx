"use client";

import { useEffect, useState } from "react";
import {
  Clock,
  Search,
  Plus,
  Bot,
  Send,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Phone,
  X,
  Loader2,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function FollowUpsPage() {
  const [followups, setFollowups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [aiGeneratingId, setAiGeneratingId] = useState<string | null>(null);
  const [selectedTone, setSelectedTone] = useState<"Professional" | "Friendly" | "Short" | "Persuasive">("Friendly");

  async function loadFollowUps() {
    try {
      setLoading(true);
      const url = new URL("/api/followups", window.location.origin);
      if (statusFilter) url.searchParams.set("status", statusFilter);

      const res = await fetch(url.toString());
      const data = await res.json();
      setFollowups(data.followUps || []);
    } catch (err) {
      console.error("Failed to load follow-ups:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFollowUps();
  }, [statusFilter]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await fetch(`/api/followups/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      loadFollowUps();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRegenerateWithTone = async (f: any, tone: "Professional" | "Friendly" | "Short" | "Persuasive") => {
    setAiGeneratingId(f._id);
    setSelectedTone(tone);
    try {
      const res = await fetch("/api/ai/followup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: f.customerId?.name || "Customer",
          customerPhone: f.customerId?.phone,
          reason: f.reason,
          tone,
        }),
      });

      const data = await res.json();
      if (data.message) {
        await fetch(`/api/followups/${f._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: data.message }),
        });
        loadFollowUps();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAiGeneratingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Clock className="w-6 h-6 text-indigo-600" />
            Automated Follow-up Board
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Never forget a customer. Track review requests, pending payment reminders, and re-engagements.
          </p>
        </div>

        <button
          onClick={() => loadFollowUps()}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Tasks</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
        {[
          { label: "Pending Due", val: "PENDING" },
          { label: "Sent on WhatsApp", val: "SENT" },
          { label: "Completed", val: "COMPLETED" },
          { label: "All Records", val: "" },
        ].map((tab) => (
          <button
            key={tab.val}
            onClick={() => setStatusFilter(tab.val)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition ${
              statusFilter === tab.val
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Follow-ups List */}
      {loading ? (
        <div className="py-20 flex justify-center text-slate-400">
          <Loader2 className="w-7 h-7 animate-spin text-indigo-600" />
        </div>
      ) : followups.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 p-6">
          <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500 mb-2" />
          <h3 className="font-bold text-slate-800 text-sm">All follow-ups cleared!</h3>
          <p className="text-xs text-slate-500 mt-1">Your automated tasks will appear here as orders are delivered and payments mature.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {followups.map((f) => {
            const cleanedPhone = f.customerId?.phone?.replace(/[^0-9]/g, "");
            const waPhone = cleanedPhone?.startsWith("03") ? "92" + cleanedPhone.slice(1) : cleanedPhone;
            const waUrl = `https://wa.me/${waPhone}?text=${encodeURIComponent(f.message)}`;

            return (
              <div
                key={f._id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 hover:border-slate-300 transition"
              >
                {/* Header Info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-base text-slate-900">
                        {f.customerId?.name || "Customer"}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">
                        ({f.customerId?.phone})
                      </span>
                    </div>
                    <span className="text-xs text-indigo-600 font-medium mt-0.5 block">
                      Target: {f.reason}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full">
                      Due: {formatDate(f.dueAt)}
                    </span>
                    <span className="text-[10px] uppercase font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                      {f.status}
                    </span>
                  </div>
                </div>

                {/* Follow-up Message Box */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <Bot className="w-3.5 h-3.5 text-indigo-600" />
                      Ready-to-Send WhatsApp Message:
                    </span>

                    <button
                      onClick={() => handleCopy(f._id, f.message)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 hover:text-slate-900 bg-white px-2 py-1 rounded-md border border-slate-200"
                    >
                      {copiedId === f._id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      {copiedId === f._id ? "Copied" : "Copy"}
                    </button>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line">
                    {f.message}
                  </p>

                  {/* AI Tone Rewriter */}
                  <div className="pt-2 border-t border-slate-200/60 flex flex-wrap items-center gap-2">
                    <span className="text-[11px] text-slate-400 font-medium">Rewrite Tone:</span>
                    {(["Friendly", "Professional", "Short", "Persuasive"] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => handleRegenerateWithTone(f, t)}
                        disabled={aiGeneratingId === f._id}
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-md border border-slate-300 bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition disabled:opacity-50"
                      >
                        {aiGeneratingId === f._id ? "..." : t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleStatusChange(f._id, "COMPLETED")}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold"
                    >
                      Mark Completed
                    </button>
                    <button
                      onClick={() => handleStatusChange(f._id, "SKIPPED")}
                      className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-slate-600 text-xs font-semibold"
                    >
                      Skip
                    </button>
                  </div>

                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => handleStatusChange(f._id, "SENT")}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send on WhatsApp</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
