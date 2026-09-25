"use client";

import { useEffect, useState, useRef } from "react";
import {
  Bot,
  Sparkles,
  Send,
  MessageSquare,
  Package,
  TrendingUp,
  Clock,
  Copy,
  Check,
  Loader2,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  HelpCircle,
} from "lucide-react";
import { formatPKR } from "@/lib/utils";

export default function AiManagerPage() {
  const [activeTab, setActiveTab] = useState<"chat" | "reply" | "followup">("chat");

  // Tab 1: AI Chat state
  const [chatMessages, setChatMessages] = useState<any[]>([
    {
      role: "assistant",
      content:
        "Good day! I am your AI Digital Manager. You can ask me anything about today's orders, revenue, inventory levels, pending payments, or customer history. All answers are derived directly from your live database.",
    },
  ]);
  const [queryInput, setQueryInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Tab 2: Customer Reply Generator state
  const [incomingMessage, setIncomingMessage] = useState("Black shirt medium available hai? Lahore delivery kitne din mein hogi?");
  const [customerPhone, setCustomerPhone] = useState("+92 322 4443322");
  const [generatedReply, setGeneratedReply] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);
  const [copiedReply, setCopiedReply] = useState(false);
  const [whatsAppUrl, setWhatsAppUrl] = useState("");

  // Tab 3: Follow-up generator state
  const [targetCustomerName, setTargetCustomerName] = useState("Ahmed Bilal");
  const [targetCustomerPhone, setTargetCustomerPhone] = useState("+92 301 5554321");
  const [followUpReason, setFollowUpReason] = useState("Pending payment for order ORD-1003 (Rs. 3,700)");
  const [followUpTone, setFollowUpTone] = useState<"Friendly" | "Professional" | "Short" | "Persuasive">("Friendly");
  const [generatedFollowUp, setGeneratedFollowUp] = useState("");
  const [followUpLoading, setFollowUpLoading] = useState(false);
  const [copiedFollowUp, setCopiedFollowUp] = useState(false);
  const [followUpWaUrl, setFollowUpWaUrl] = useState("");

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, chatLoading]);

  // Handle Chat Submit
  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryInput.trim() || chatLoading) return;

    const userText = queryInput.trim();
    setQueryInput("");
    setChatMessages((prev) => [...prev, { role: "user", content: userText }]);
    setChatLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText }),
      });

      const data = await res.json();
      if (data.answer) {
        setChatMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.answer },
        ]);
      } else {
        setChatMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.error || "Unable to retrieve data right now." },
        ]);
      }
    } catch (err: any) {
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Error communicating with AI manager." },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  // Quick Prompt Chips
  const promptChips = [
    "How many orders did I get today?",
    "Which products are low in stock?",
    "Show me pending payments",
    "Who is my best customer?",
    "Summarize sales this week",
  ];

  // Handle Generate Customer Reply
  const handleGenerateReply = async (e: React.FormEvent) => {
    e.preventDefault();
    setReplyLoading(true);
    setCopiedReply(false);

    try {
      const res = await fetch("/api/ai/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerMessage: incomingMessage,
          customerPhone,
        }),
      });

      const data = await res.json();
      if (data.reply) {
        setGeneratedReply(data.reply);
        setWhatsAppUrl(data.whatsAppUrl || "");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setReplyLoading(false);
    }
  };

  // Handle Generate Follow-up
  const handleGenerateFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setFollowUpLoading(true);
    setCopiedFollowUp(false);

    try {
      const res = await fetch("/api/ai/followup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: targetCustomerName,
          customerPhone: targetCustomerPhone,
          reason: followUpReason,
          tone: followUpTone,
        }),
      });

      const data = await res.json();
      if (data.message) {
        setGeneratedFollowUp(data.message);
        setFollowUpWaUrl(data.whatsAppUrl || "");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFollowUpLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Bot className="w-7 h-7 text-sky-600" />
              AI Digital Manager Studio
            </h1>
            <span className="text-[10px] font-extrabold uppercase bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full border border-sky-200">
              Gemini 2.5 Flash
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time business intelligence and automated drafting. Strict data isolation guaranteed.
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-xl self-start sm:self-auto shadow-sm">
          <button
            onClick={() => setActiveTab("chat")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === "chat" ? "bg-sky-600 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Manager Q&A
          </button>
          <button
            onClick={() => setActiveTab("reply")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === "reply" ? "bg-sky-600 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Reply Generator
          </button>
          <button
            onClick={() => setActiveTab("followup")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === "followup" ? "bg-sky-600 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Follow-up Drafter
          </button>
        </div>
      </div>

      {/* TAB 1: Conversational Q&A */}
      {activeTab === "chat" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[650px] overflow-hidden">
          {/* Top Info Bar */}
          <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
            <span className="text-slate-600 flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Verified live MongoDB connection • Zero hallucinations
            </span>
            <button
              onClick={() =>
                setChatMessages([
                  {
                    role: "assistant",
                    content: "Conversation history cleared. How can I assist your business operations now?",
                  },
                ])
              }
              className="text-slate-400 hover:text-slate-600 text-[11px] font-semibold"
            >
              Clear Chat
            </button>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-3 ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-xl p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-line shadow-sm ${
                    msg.role === "user"
                      ? "bg-sky-600 text-white rounded-tr-none"
                      : "bg-slate-50 text-slate-800 border border-slate-200 rounded-tl-none"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {chatLoading && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-500 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-sky-600" />
                  <span>Checking database and computing metrics...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Prompt Chips */}
          <div className="px-4 py-2 bg-white border-t border-slate-100 flex items-center gap-2 overflow-x-auto">
            <span className="text-[11px] font-bold text-slate-400 shrink-0">Ask:</span>
            {promptChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => setQueryInput(chip)}
                className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-sky-50 hover:text-sky-700 text-slate-600 text-[11px] font-medium shrink-0 transition"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <form onSubmit={handleChatSubmit} className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200 flex gap-2">
            <input
              type="text"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              placeholder="Ask anything about your business (e.g. Which orders are still pending?)"
              className="flex-1 px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <button
              type="submit"
              disabled={chatLoading || !queryInput.trim()}
              className="px-4 sm:px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm flex items-center gap-1.5 transition disabled:opacity-50"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* TAB 2: AI Customer Reply Generator */}
      {activeTab === "reply" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Customer Message Reply Drafter
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Paste any customer message. AI cross-references your real stock, catalog prices, and delivery rules.
              </p>
            </div>

            <form onSubmit={handleGenerateReply} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Customer Inquiry (Urdu, Roman Urdu, or English) *
                </label>
                <textarea
                  rows={4}
                  required
                  value={incomingMessage}
                  onChange={(e) => setIncomingMessage(e.target.value)}
                  placeholder="e.g. Black shirt medium available hai? Lahore delivery kitne din mein hogi?"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Customer WhatsApp Number (Optional for 1-tap send)
                </label>
                <input
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+92 322 4443322"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 font-mono text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={replyLoading}
                className="w-full py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md shadow-sky-600/20 flex items-center justify-center gap-2 transition disabled:opacity-70"
              >
                {replyLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>Generate Verified Reply</span>
              </button>
            </form>
          </div>

          {/* Generated Reply Card */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-bold text-sky-900 flex items-center gap-1.5">
                  <Bot className="w-4 h-4 text-sky-600" />
                  AI Generated Customer Response
                </span>
                {generatedReply && (
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generatedReply);
                      setCopiedReply(true);
                      setTimeout(() => setCopiedReply(false), 2000);
                    }}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200"
                  >
                    {copiedReply ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedReply ? "Copied" : "Copy Reply"}
                  </button>
                )}
              </div>

              <div className="mt-4">
                {generatedReply ? (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm leading-relaxed whitespace-pre-line">
                    {generatedReply}
                  </div>
                ) : (
                  <div className="py-16 text-center text-slate-400 text-xs">
                    <MessageSquare className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    Enter customer message and click Generate to see the response.
                  </div>
                )}
              </div>
            </div>

            {generatedReply && (
              <div className="pt-4 border-t border-slate-100 flex gap-2">
                {whatsAppUrl ? (
                  <a
                    href={whatsAppUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow"
                  >
                    <Send className="w-4 h-4" />
                    Send via WhatsApp
                  </a>
                ) : null}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: AI Follow-Up Drafter */}
      {activeTab === "followup" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Custom Follow-up Generator
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Generate high-converting, courteous follow-ups with customizable tones.
              </p>
            </div>

            <form onSubmit={handleGenerateFollowUp} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Customer Name *</label>
                <input
                  type="text"
                  required
                  value={targetCustomerName}
                  onChange={(e) => setTargetCustomerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">WhatsApp Phone Number</label>
                <input
                  type="text"
                  value={targetCustomerPhone}
                  onChange={(e) => setTargetCustomerPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Follow-up Reason *</label>
                <input
                  type="text"
                  required
                  value={followUpReason}
                  onChange={(e) => setFollowUpReason(e.target.value)}
                  placeholder="e.g. Unpaid COD balance, Post-delivery review, Reorder check"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Communication Tone</label>
                <div className="grid grid-cols-4 gap-2">
                  {(["Friendly", "Professional", "Short", "Persuasive"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setFollowUpTone(t)}
                      className={`py-2 rounded-xl text-xs font-bold border transition ${
                        followUpTone === t
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={followUpLoading}
                className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition disabled:opacity-70"
              >
                {followUpLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>Draft Follow-up Message</span>
              </button>
            </form>
          </div>

          {/* Generated Follow-up Display */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                  <Bot className="w-4 h-4 text-indigo-600" />
                  Prepared WhatsApp Follow-up ({followUpTone})
                </span>
                {generatedFollowUp && (
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generatedFollowUp);
                      setCopiedFollowUp(true);
                      setTimeout(() => setCopiedFollowUp(false), 2000);
                    }}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200"
                  >
                    {copiedFollowUp ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedFollowUp ? "Copied" : "Copy"}
                  </button>
                )}
              </div>

              <div className="mt-4">
                {generatedFollowUp ? (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm leading-relaxed whitespace-pre-line">
                    {generatedFollowUp}
                  </div>
                ) : (
                  <div className="py-16 text-center text-slate-400 text-xs">
                    <Clock className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    Configure details and click Draft to generate your follow-up.
                  </div>
                )}
              </div>
            </div>

            {generatedFollowUp && followUpWaUrl && (
              <div className="pt-4 border-t border-slate-100">
                <a
                  href={followUpWaUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow"
                >
                  <Send className="w-4 h-4" />
                  Send to {targetCustomerName} on WhatsApp
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
