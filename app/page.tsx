import Link from "next/link";
import {
  Bot,
  MessageSquare,
  Package,
  Users,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Zap,
  TrendingUp,
  ShieldCheck,
  ChevronRight,
  PhoneCall,
  Clock,
  Layers,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Header / Navbar */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <span className="font-bold text-lg text-slate-900 tracking-tight flex items-center gap-1.5">
                AI Digital Manager
                <span className="text-[10px] uppercase font-bold tracking-widest bg-sky-100 text-sky-700 px-1.5 py-0.5 rounded">SaaS</span>
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#how-it-works" className="hover:text-sky-600 transition">How It Works</a>
            <a href="#features" className="hover:text-sky-600 transition">Features</a>
            <a href="#ai-modes" className="hover:text-sky-600 transition">AI Control Modes</a>
            <a href="#pricing" className="hover:text-sky-600 transition">Pricing</a>
            <a href="#faq" className="hover:text-sky-600 transition">FAQ</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-semibold text-slate-700 hover:text-sky-600 px-3.5 py-2 transition"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="text-sm font-semibold bg-sky-600 hover:bg-sky-500 text-white px-4 py-2 rounded-lg shadow-sm hover:shadow transition flex items-center gap-1.5"
            >
              Start Free Trial
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs sm:text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4 text-sky-600 animate-pulse" />
            <span>Built for Modern Pakistani Small Businesses & Online Sellers</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-[1.15]">
            Your Business Has a <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-sky-600 via-indigo-600 to-emerald-600 bg-clip-text text-transparent">
              Digital Manager
            </span>{" "}
            Now.
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Stop losing hours in notebooks, forgotten WhatsApp messages, spreadsheets, and manual follow-ups.
            Let your AI Digital Manager handle customer replies, order pipelines, and daily business tasks.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <Link
              href="/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 text-base font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-xl shadow-lg shadow-sky-600/25 transition transform active:scale-95"
            >
              Start 7-Day Free Trial
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition"
            >
              Explore Live Demo
            </Link>
          </div>

          <p className="mt-3 text-xs text-slate-500">
            No credit card required. Pre-seeded with Lahore demo business data.
          </p>

          {/* Interactive Mobile-First Preview Card */}
          <div className="mt-14 max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-left">
            <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
                <span className="text-xs text-slate-400 ml-2 font-mono">Dawood Fashion — Live Dashboard</span>
              </div>
              <span className="text-xs bg-emerald-500/20 text-emerald-300 font-semibold px-2 py-0.5 rounded border border-emerald-500/30">
                Mode: Approval
              </span>
            </div>

            <div className="p-5 sm:p-6 space-y-5 bg-slate-50/50">
              {/* Proactive AI Callout */}
              <div className="bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-200 rounded-xl p-4 flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-lg bg-sky-600 text-white flex items-center justify-center shrink-0 shadow">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                    Digital Manager Alert
                    <span className="text-[10px] font-bold text-sky-600 bg-white px-2 py-0.5 rounded border border-sky-100">
                      3 TASKS PENDING
                    </span>
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1">
                    “Good morning Dawood! I identified 2 pending payments (Rs. 7,400), 1 low-stock item (Embroidered Kurta: 3 left), and prepared an accurate response for Hamza&apos;s WhatsApp inquiry.”
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="text-xs font-semibold bg-sky-600 text-white px-3 py-1 rounded-md shadow-sm">
                      ✓ Approve WhatsApp Follow-ups
                    </span>
                    <span className="text-xs font-semibold bg-white text-slate-700 border border-slate-300 px-3 py-1 rounded-md">
                      Review Stock Alert
                    </span>
                  </div>
                </div>
              </div>

              {/* Sample Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                  <span className="text-xs font-medium text-slate-500">Today&apos;s Sales</span>
                  <p className="text-lg sm:text-xl font-bold text-slate-900 mt-1">Rs. 18,500</p>
                  <span className="text-[11px] text-emerald-600 font-semibold">↑ 14% vs yesterday</span>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                  <span className="text-xs font-medium text-slate-500">Orders Today</span>
                  <p className="text-lg sm:text-xl font-bold text-slate-900 mt-1">4 Orders</p>
                  <span className="text-[11px] text-sky-600 font-semibold">1 out for delivery</span>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                  <span className="text-xs font-medium text-slate-500">New Inquiries</span>
                  <p className="text-lg sm:text-xl font-bold text-slate-900 mt-1">2 Pending</p>
                  <span className="text-[11px] text-amber-600 font-semibold">Roman Urdu parsed</span>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                  <span className="text-xs font-medium text-slate-500">Follow-ups Due</span>
                  <p className="text-lg sm:text-xl font-bold text-slate-900 mt-1">2 Reminders</p>
                  <span className="text-[11px] text-indigo-600 font-semibold">WhatsApp ready</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Problem vs Solution */}
      <section className="py-16 sm:py-24 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs uppercase font-bold tracking-widest text-sky-600 mb-2">
              Why Small Businesses Struggle
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-slate-900">
              You Started a Business to Sell, Not to Do Endless Data Entry.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Old Way */}
            <div className="p-6 sm:p-8 rounded-2xl bg-rose-50/60 border border-rose-200">
              <h3 className="text-lg font-bold text-rose-900 flex items-center gap-2 mb-4">
                <span className="w-6 h-6 rounded-full bg-rose-200 text-rose-700 flex items-center justify-center text-xs">✕</span>
                The Manual Chaotic Way
              </h3>
              <ul className="space-y-3.5 text-sm text-rose-800">
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-500 font-bold">•</span>
                  Writing customer phone numbers and addresses in paper notebooks or loose chats.
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-500 font-bold">•</span>
                  Repeatedly checking your storage racks to answer “black shirt medium available hai?”
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-500 font-bold">•</span>
                  Forgetting to follow up with customers on pending bank transfers and COD delivery confirmations.
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-500 font-bold">•</span>
                  End of day headache: calculating total sales, profit, and pending couriers.
                </li>
              </ul>
            </div>

            {/* AI Digital Manager Way */}
            <div className="p-6 sm:p-8 rounded-2xl bg-emerald-50/60 border border-emerald-200">
              <h3 className="text-lg font-bold text-emerald-900 flex items-center gap-2 mb-4">
                <span className="w-6 h-6 rounded-full bg-emerald-200 text-emerald-700 flex items-center justify-center text-xs">✓</span>
                The AI Digital Manager Way
              </h3>
              <ul className="space-y-3.5 text-sm text-emerald-800">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  AI understands customer inquiries in Roman Urdu or English and drafts factual replies from your real stock.
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  One-click conversion: <strong>Inquiry → Customer → Order</strong> without retyping information.
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  Scheduled WhatsApp click-to-chat follow-ups for post-delivery reviews and pending payments.
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  Deterministic real-time profit and sales analytics summarized clearly by Gemini AI.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works: Philosophy */}
      <section id="how-it-works" className="py-16 sm:py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs uppercase font-bold tracking-widest text-sky-600 mb-2">Core Philosophy</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-slate-900">
              Input → Understand → Organize → Act → Notify
            </p>
            <p className="mt-4 text-slate-600">
              A digital employee for your business that handles the heavy lifting while keeping you in total command.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative">
              <span className="text-2xl font-black text-slate-200 absolute top-3 right-4">01</span>
              <div className="w-10 h-10 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center font-bold mb-3">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-base">Input</h4>
              <p className="text-xs text-slate-600 mt-2">
                Customer sends an inquiry or order details via WhatsApp, Instagram, or Facebook.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative">
              <span className="text-2xl font-black text-slate-200 absolute top-3 right-4">02</span>
              <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold mb-3">
                <Bot className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-base">Understand</h4>
              <p className="text-xs text-slate-600 mt-2">
                Gemini AI parses intent, checks real MongoDB inventory, and verifies delivery charges.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative">
              <span className="text-2xl font-black text-slate-200 absolute top-3 right-4">03</span>
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold mb-3">
                <Package className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-base">Organize</h4>
              <p className="text-xs text-slate-600 mt-2">
                Updates customer profiles, tracks inventory, and queues order pipeline states.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative">
              <span className="text-2xl font-black text-slate-200 absolute top-3 right-4">04</span>
              <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center font-bold mb-3">
                <Zap className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-base">Act</h4>
              <p className="text-xs text-slate-600 mt-2">
                Generates polished WhatsApp responses, creates draft orders, and schedules follow-up tasks.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative">
              <span className="text-2xl font-black text-slate-200 absolute top-3 right-4">05</span>
              <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center font-bold mb-3">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-base">Notify</h4>
              <p className="text-xs text-slate-600 mt-2">
                Owner reviews AI proposals with 1-click approvals and gets proactive low stock warnings.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* AI Modes Comparison */}
      <section id="ai-modes" className="py-16 sm:py-24 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs uppercase font-bold tracking-widest text-sky-600 mb-2">Safety & Control</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-slate-900">
              Three Distinct AI Operating Modes
            </p>
            <p className="mt-4 text-slate-600">
              You choose how much freedom to grant your AI Digital Manager. You are always in control.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Mode 1</span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">Assistant Mode</h3>
                <p className="text-sm text-slate-600 mt-3">
                  AI provides read-only suggestions, analytics summaries, and answers your business questions. It performs no actions directly.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200 text-xs text-slate-500 font-medium">
                Best for: Business owners wanting conversational insights.
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-sky-50/60 border-2 border-sky-500 flex flex-col justify-between relative shadow-md">
              <span className="absolute -top-3 right-6 bg-sky-600 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full">
                Default Recommended
              </span>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-sky-600">Mode 2</span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">Approval Mode</h3>
                <p className="text-sm text-slate-700 mt-3">
                  AI prepares accurate drafts (customer replies, draft orders, WhatsApp follow-ups). The owner reviews and clicks <strong>Approve</strong> before anything executes.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-sky-200 text-xs text-sky-800 font-medium">
                Best for: 95% of small business owners. Maximum safety and speed.
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Mode 3</span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">Autonomous Mode</h3>
                <p className="text-sm text-slate-600 mt-3">
                  AI automatically executes specific routine tasks that the owner explicitly enables in <em>Settings → AI Permissions</em> (e.g. drafting follow-ups).
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200 text-xs text-slate-500 font-medium">
                Best for: Experienced teams scaling high-volume operations.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 sm:py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs uppercase font-bold tracking-widest text-sky-600 mb-2">Simple Transparent Plans</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-slate-900">
              Priced in PKR for Pakistani Businesses
            </p>
            <p className="mt-4 text-slate-600">
              Start with a 7-day free trial. Upgrade when your business grows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Trial */}
            <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900">7-Day Free Trial</h3>
                <p className="text-xs text-slate-500 mt-1">Experience the AI Digital Manager risk-free</p>
                <div className="mt-6 mb-6">
                  <span className="text-4xl font-black text-slate-900">Rs. 0</span>
                  <span className="text-slate-500 text-sm ml-1">/ 7 days</span>
                </div>
                <ul className="space-y-3 text-sm text-slate-600">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" /> Up to 50 Customers</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" /> Up to 25 Products</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" /> 60 Orders per month</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" /> 150 AI Requests</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" /> WhatsApp Click-to-Chat</li>
                </ul>
              </div>
              <Link
                href="/signup"
                className="mt-8 block text-center py-3 px-4 rounded-xl border border-sky-600 text-sky-600 font-semibold hover:bg-sky-50 transition"
              >
                Start Free Trial
              </Link>
            </div>

            {/* Starter Growth */}
            <div className="bg-white p-7 rounded-2xl border-2 border-sky-600 shadow-xl flex flex-col justify-between relative">
              <span className="absolute -top-3 right-6 bg-sky-600 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full">
                Most Popular
              </span>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Starter Growth</h3>
                <p className="text-xs text-slate-500 mt-1">For growing online and retail shops</p>
                <div className="mt-6 mb-6">
                  <span className="text-4xl font-black text-slate-900">Rs. 2,999</span>
                  <span className="text-slate-500 text-sm ml-1">/ month</span>
                </div>
                <ul className="space-y-3 text-sm text-slate-600">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" /> 250 Customers</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" /> 100 Products</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" /> 300 Orders / mo</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" /> 800 AI Requests</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" /> 10 Active Automations</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" /> Roman Urdu & English Parser</li>
                </ul>
              </div>
              <Link
                href="/signup"
                className="mt-8 block text-center py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold shadow-md shadow-sky-600/20 transition"
              >
                Choose Starter
              </Link>
            </div>

            {/* Business Pro */}
            <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Business Pro</h3>
                <p className="text-xs text-slate-500 mt-1">For established multi-product stores</p>
                <div className="mt-6 mb-6">
                  <span className="text-4xl font-black text-slate-900">Rs. 6,999</span>
                  <span className="text-slate-500 text-sm ml-1">/ month</span>
                </div>
                <ul className="space-y-3 text-sm text-slate-600">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" /> 2,000 Customers</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" /> 1,000 Products</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" /> 3,000 Orders / mo</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" /> 5,000 AI Requests</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" /> WhatsApp Cloud API Ready</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" /> Priority Support</li>
                </ul>
              </div>
              <Link
                href="/signup"
                className="mt-8 block text-center py-3 px-4 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition"
              >
                Choose Pro
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-16 sm:py-24 bg-white border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-xs uppercase font-bold tracking-widest text-sky-600 mb-2">FAQ</h2>
            <p className="text-3xl font-extrabold text-slate-900">Frequently Asked Questions</p>
          </div>

          <div className="space-y-6">
            <div className="p-5 rounded-xl border border-slate-200">
              <h4 className="font-bold text-slate-900 text-base">Does the AI hallucinate product prices or stock?</h4>
              <p className="text-sm text-slate-600 mt-2">
                No. The AI Digital Manager is strictly bound to your actual MongoDB product catalog. It is mathematically barred from inventing prices or stock that do not exist in your database.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-slate-200">
              <h4 className="font-bold text-slate-900 text-base">Can it understand Urdu and Roman Urdu messages?</h4>
              <p className="text-sm text-slate-600 mt-2">
                Yes! Built specifically for Pakistani e-commerce, it effortlessly comprehends customer queries such as <em>“Black shirt medium available hai?”</em> or <em>“Lahore mein delivery kitne din mein hogi?”</em> and generates respectful, natural responses.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-slate-200">
              <h4 className="font-bold text-slate-900 text-base">Do I need the official WhatsApp Business API?</h4>
              <p className="text-sm text-slate-600 mt-2">
                Not for V1! You can use our built-in <strong>WhatsApp Click-to-Chat</strong> generator which pre-fills the message directly into WhatsApp with one tap. If you upgrade to official WhatsApp Cloud API later, the app is already architected to support it.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-slate-200">
              <h4 className="font-bold text-slate-900 text-base">Can another business see my data?</h4>
              <p className="text-sm text-slate-600 mt-2">
                Never. The system is engineered from day one with strict multi-tenant isolation at the database query level. Every single record requires authenticated business verification.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center text-white font-bold">
              <Bot className="w-5 h-5" />
            </div>
            <span className="font-bold text-white text-base">AI Digital Manager</span>
            <span className="text-xs text-slate-500 ml-2">Lahore, Pakistan</span>
          </div>

          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} AI Digital Manager SaaS. All rights reserved.
          </p>

          <div className="flex items-center gap-4 text-xs">
            <Link href="/login" className="hover:text-white transition">Sign In</Link>
            <Link href="/signup" className="hover:text-white transition">Start Trial</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
