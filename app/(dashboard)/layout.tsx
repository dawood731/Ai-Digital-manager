"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Users,
  Package,
  ShoppingCart,
  MessageSquare,
  Clock,
  Bot,
  Zap,
  BarChart3,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X,
  Sparkles,
  ChevronRight,
  Shield,
  Bell,
  Database,
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) {
          router.push("/login");
          return;
        }
        const data = await res.json();
        setUser(data.user);
        setBusiness(data.business);
      } catch (err) {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Customers", href: "/customers", icon: Users },
    { name: "Products", href: "/products", icon: Package },
    { name: "Orders", href: "/orders", icon: ShoppingCart },
    { name: "Inquiries", href: "/inquiries", icon: MessageSquare },
    { name: "Follow-ups", href: "/followups", icon: Clock },
    { name: "AI Manager", href: "/ai-manager", icon: Bot, highlight: true },
    { name: "Automations", href: "/automations", icon: Zap },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
    { name: "Subscription", href: "/subscription", icon: CreditCard },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-sky-600 text-white flex items-center justify-center shadow-lg animate-bounce">
            <Bot className="w-6 h-6" />
          </div>
          <span className="text-sm font-semibold text-slate-600">Loading your Digital Manager...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900 pb-20 md:pb-0">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 shrink-0 sticky top-0 h-screen">
        {/* Brand Logo & Business */}
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20 shrink-0">
              <Bot className="w-6 h-6" />
            </div>
            <div className="overflow-hidden">
              <h1 className="font-bold text-sm text-slate-900 truncate">
                {business?.name || "AI Digital Manager"}
              </h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="text-[11px] text-slate-500 font-medium truncate">
                  {business?.city || "Lahore"}, Pakistan
                </span>
              </div>
            </div>
          </div>

          {/* AI Mode Pill */}
          <div className="mt-3 bg-sky-50 border border-sky-200/80 rounded-lg px-2.5 py-1.5 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-sky-900 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-sky-600" />
              <span>AI: {business?.aiSettings?.mode || "APPROVAL"}</span>
            </div>
            <Link
              href="/settings"
              className="text-[10px] font-bold text-sky-700 hover:underline uppercase"
            >
              Config
            </Link>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? "bg-sky-600 text-white shadow-sm shadow-sky-600/20"
                    : item.highlight
                    ? "text-sky-700 bg-sky-50/60 hover:bg-sky-100/70"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : item.highlight ? "text-sky-600" : "text-slate-500"}`} />
                <span>{item.name}</span>
                {item.highlight && !isActive && (
                  <span className="ml-auto text-[10px] font-bold uppercase bg-sky-200/80 text-sky-800 px-1.5 py-0.5 rounded">
                    AI
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <div className="overflow-hidden mr-2">
              <span className="text-xs font-bold text-slate-800 block truncate">{user?.name}</span>
              <span className="text-[11px] text-slate-500 truncate block font-mono">{user?.email}</span>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Top Header */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 px-4 py-3 flex items-center justify-between md:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center text-white font-bold shadow-sm">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-sm text-slate-900 block leading-tight">
                {business?.name || "AI Digital Manager"}
              </span>
              <span className="text-[10px] font-bold text-sky-600 uppercase tracking-wider">
                Mode: {business?.aiSettings?.mode || "APPROVAL"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/ai-manager"
              className="p-2 text-sky-700 bg-sky-50 rounded-lg border border-sky-200"
              title="AI Studio"
            >
              <Sparkles className="w-4 h-4" />
            </Link>
            <button
              onClick={handleLogout}
              className="p-2 text-slate-500 hover:text-rose-600"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (Mobile-first standard) */}
      <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 z-40 md:hidden safe-bottom shadow-lg">
        <div className="grid grid-cols-5 h-16">
          <Link
            href="/dashboard"
            className={`flex flex-col items-center justify-center gap-1 ${
              pathname === "/dashboard" ? "text-sky-600 font-bold" : "text-slate-500"
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px]">Home</span>
          </Link>

          <Link
            href="/customers"
            className={`flex flex-col items-center justify-center gap-1 ${
              pathname === "/customers" ? "text-sky-600 font-bold" : "text-slate-500"
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="text-[10px]">Customers</span>
          </Link>

          <Link
            href="/orders"
            className={`flex flex-col items-center justify-center gap-1 ${
              pathname === "/orders" ? "text-sky-600 font-bold" : "text-slate-500"
            }`}
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="text-[10px]">Orders</span>
          </Link>

          <Link
            href="/ai-manager"
            className={`flex flex-col items-center justify-center gap-1 relative ${
              pathname === "/ai-manager" ? "text-sky-600 font-bold" : "text-slate-500"
            }`}
          >
            <div className="w-7 h-7 rounded-lg bg-sky-100 flex items-center justify-center text-sky-600">
              <Bot className="w-4 h-4" />
            </div>
            <span className="text-[10px]">AI</span>
          </Link>

          <button
            onClick={() => setMoreMenuOpen(!moreMenuOpen)}
            className={`flex flex-col items-center justify-center gap-1 ${
              moreMenuOpen ? "text-sky-600 font-bold" : "text-slate-500"
            }`}
          >
            <Menu className="w-5 h-5" />
            <span className="text-[10px]">More</span>
          </button>
        </div>
      </nav>

      {/* Mobile "More" Sheet Overlay */}
      {moreMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-slate-900/60 backdrop-blur-sm flex flex-col justify-end">
          <div className="bg-white rounded-t-3xl p-5 space-y-4 max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <span className="font-bold text-base text-slate-900">More Tools & Management</span>
              <button
                onClick={() => setMoreMenuOpen(false)}
                className="p-1.5 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <Link
                href="/products"
                onClick={() => setMoreMenuOpen(false)}
                className="p-3 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center gap-2.5"
              >
                <Package className="w-4 h-4 text-sky-600" />
                <span className="text-xs font-semibold text-slate-800">Products & Stock</span>
              </Link>

              <Link
                href="/inquiries"
                onClick={() => setMoreMenuOpen(false)}
                className="p-3 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center gap-2.5"
              >
                <MessageSquare className="w-4 h-4 text-sky-600" />
                <span className="text-xs font-semibold text-slate-800">Inquiries</span>
              </Link>

              <Link
                href="/followups"
                onClick={() => setMoreMenuOpen(false)}
                className="p-3 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center gap-2.5"
              >
                <Clock className="w-4 h-4 text-sky-600" />
                <span className="text-xs font-semibold text-slate-800">Follow-up Board</span>
              </Link>

              <Link
                href="/automations"
                onClick={() => setMoreMenuOpen(false)}
                className="p-3 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center gap-2.5"
              >
                <Zap className="w-4 h-4 text-sky-600" />
                <span className="text-xs font-semibold text-slate-800">Automations</span>
              </Link>

              <Link
                href="/analytics"
                onClick={() => setMoreMenuOpen(false)}
                className="p-3 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center gap-2.5"
              >
                <BarChart3 className="w-4 h-4 text-sky-600" />
                <span className="text-xs font-semibold text-slate-800">Analytics</span>
              </Link>

              <Link
                href="/subscription"
                onClick={() => setMoreMenuOpen(false)}
                className="p-3 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center gap-2.5"
              >
                <CreditCard className="w-4 h-4 text-sky-600" />
                <span className="text-xs font-semibold text-slate-800">Subscription</span>
              </Link>

              <Link
                href="/settings"
                onClick={() => setMoreMenuOpen(false)}
                className="p-3 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center gap-2.5 col-span-2"
              >
                <Settings className="w-4 h-4 text-sky-600" />
                <span className="text-xs font-semibold text-slate-800">Settings & AI Permissions</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
