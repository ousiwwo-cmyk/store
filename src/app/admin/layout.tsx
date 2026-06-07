"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import {
  Package, LayoutDashboard, ShoppingBag, Truck, Gift,
  Settings, LogOut, Menu, X, Bell, ChevronDown,
  ShoppingCart, Users, BarChart3
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"

const sidebarLinks = [
  { href: "/admin/dashboard", label: "الإحصائيات", icon: LayoutDashboard },
  { href: "/admin/orders", label: "الطلبات", icon: ShoppingBag },
  { href: "/admin/products", label: "المنتجات", icon: Package },
  { href: "/admin/delivery", label: "أسعار التوصيل", icon: Truck },
  { href: "/admin/promotions", label: "العروض", icon: Gift },
  { href: "/admin/settings", label: "الإعدادات", icon: Settings },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)

  // Redirect to login if not authenticated
  useEffect(() => {
    const session = localStorage.getItem("admin_session")
    if (session !== "authenticated") {
      router.push("/admin/login")
    }
  }, [router])

  // Fetch pending orders count
  useEffect(() => {
    const fetchPending = async () => {
      const { count } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending")
      if (count !== null) setPendingCount(count)
    }
    fetchPending()
    const interval = setInterval(fetchPending, 30000)
    return () => clearInterval(interval)
  }, [])

  // Real-time subscription for pending orders
  useEffect(() => {
    const channel = supabase
      .channel("admin-orders")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        (payload: any) => {
          if (payload.eventType === "INSERT") {
            setPendingCount((prev) => prev + 1)
          } else if (
            payload.eventType === "UPDATE" &&
            payload.new &&
            (payload.new as any).status !== "pending"
          ) {
            setPendingCount((prev) => Math.max(0, prev - 1))
          }
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  // If on login page, don't show sidebar
  if (pathname === "/admin/login") {
    return <>{children}</>
  }

  const handleLogout = () => {
    localStorage.removeItem("admin_session")
    router.push("/admin/login")
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex">
      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 right-0 z-50 h-full w-64 bg-white border-l border-[#E0D5C5] transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto ${
          isMobileSidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-[#E0D5C5]">
            <Link href="/admin/dashboard" className="flex items-center gap-2">
              <Package className="h-6 w-6 text-[#C4622D]" />
              <span className="font-bold text-sm">لوحة التحكم</span>
            </Link>
            <button
              className="lg:hidden p-1 hover:bg-[#FAF7F2] rounded"
              onClick={() => setIsMobileSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Sidebar Links */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {sidebarLinks.map((link) => {
              const isActive = pathname === link.href
              const Icon = link.icon
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-[#C4622D] text-white"
                      : "text-[#1A1A1A] hover:bg-[#FAF7F2]"
                  }`}
                  onClick={() => setIsMobileSidebarOpen(false)}
                >
                  <Icon className="h-5 w-5" />
                  <span>{link.label}</span>
                  {link.href === "/admin/orders" && pendingCount > 0 && (
                    <Badge variant="destructive" className="mr-auto text-xs px-1.5 py-0">
                      {pendingCount}
                    </Badge>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-3 border-t border-[#E0D5C5] space-y-1">
            <Link
              href="/"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#1A1A1A] hover:bg-[#FAF7F2] transition-colors"
            >
              <ShoppingCart className="h-5 w-5" />
              <span>العودة للمتجر</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 w-full transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-[#E0D5C5] shadow-sm">
          <div className="flex items-center justify-between h-14 px-4 sm:px-6">
            <div className="flex items-center gap-3">
              <button
                className="lg:hidden p-1.5 hover:bg-[#FAF7F2] rounded-lg"
                onClick={() => setIsMobileSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </button>
              <button
                className="hidden lg:block p-1.5 hover:bg-[#FAF7F2] rounded-lg"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="hidden sm:flex items-center gap-2">
                <Package className="h-5 w-5 text-[#C4622D]" />
                <span className="font-bold">بيت الأناقة</span>
                <Badge variant="outline" className="text-xs">لوحة التحكم</Badge>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Pending Orders Bell */}
              <button className="relative p-1.5 hover:bg-[#FAF7F2] rounded-lg transition-colors">
                <Bell className="h-5 w-5" />
                {pendingCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {pendingCount}
                  </span>
                )}
              </button>

              {/* Admin Badge */}
              <Badge variant="gold" className="hidden sm:flex text-xs">
                المدير
              </Badge>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
