"use client"

export const dynamic = 'force-dynamic'



import { useState, useEffect } from "react"
import { Package, ShoppingBag, DollarSign, Clock, ArrowUp, ArrowDown } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"
import { formatPrice } from "@/lib/utils"
import Link from "next/link"
import { Button } from "@/components/ui/button"

type RecentOrder = {
  id: string
  customer_name: string
  customer_wilaya: string
  total: number
  status: string
  created_at: string
}

type WilayaStat = {
  wilaya: string
  count: number
}

const statusVariant: Record<string, "warning" | "info" | "default" | "success" | "destructive"> = {
  pending: "warning",
  confirmed: "info",
  shipped: "default",
  delivered: "success",
  cancelled: "destructive",
}

const statusLabel: Record<string, string> = {
  pending: "قيد الانتظار",
  confirmed: "مؤكد",
  shipped: "تم الشحن",
  delivered: "تم التوصيل",
  cancelled: "ملغي",
}

function StatSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardHeader className="pb-2">
        <div className="h-4 w-24 bg-gray-200 rounded" />
      </CardHeader>
      <CardContent>
        <div className="h-8 w-20 bg-gray-200 rounded" />
      </CardContent>
    </Card>
  )
}

function TableSkeleton() {
  return (
    <div className="animate-pulse space-y-3">
      <div className="h-10 bg-gray-200 rounded" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-12 bg-gray-200 rounded" />
      ))}
    </div>
  )
}

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [ordersToday, setOrdersToday] = useState(0)
  const [ordersThisMonth, setOrdersThisMonth] = useState(0)
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [pendingCount, setPendingCount] = useState(0)
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [topWilayas, setTopWilayas] = useState<WilayaStat[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const now = new Date()
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

        const [
          { count: todayCount },
          { count: monthCount },
          { count: pending },
          { data: revenueData },
          { data: ordersData },
        ] = await Promise.all([
          supabase.from("orders").select("*", { count: "exact", head: true }).gte("created_at", startOfDay),
          supabase.from("orders").select("*", { count: "exact", head: true }).gte("created_at", startOfMonth),
          supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "pending"),
          supabase.from("orders").select("total").eq("status", "delivered"),
          supabase.from("orders")
            .select("id, customer_name, customer_wilaya, total, status, created_at")
            .order("created_at", { ascending: false })
            .limit(10),
        ])

        const { data: wilayaData } = await supabase
          .from("orders")
          .select("customer_wilaya")

        setOrdersToday(todayCount ?? 0)
        setOrdersThisMonth(monthCount ?? 0)
        setPendingCount(pending ?? 0)

        if (revenueData) {
          const revenueSum = revenueData.reduce((sum: number, r: any) => sum + (r.total ?? 0), 0)
          setTotalRevenue(revenueSum)
        }

        if (ordersData) {
          setRecentOrders(ordersData as unknown as RecentOrder[])
        }

        if (wilayaData) {
          const wilayaMap: Record<string, number> = {}
          wilayaData.forEach((o: any) => {
            const w = o.customer_wilaya || "غير محدد"
            wilayaMap[w] = (wilayaMap[w] || 0) + 1
          })
          const sorted = Object.entries(wilayaMap)
            .map(([wilaya, count]) => ({ wilaya, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5)
          setTopWilayas(sorted)
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">لوحة الإحصائيات</h1>
          <p className="text-sm text-gray-500 mt-0.5">نظرة عامة على أداء المتجر</p>
        </div>
        <Link href="/admin/orders">
          <Button variant="outline" className="border-[#C4622D] text-[#C4622D] hover:bg-[#C4622D] hover:text-white">
            <ShoppingBag className="h-4 w-4 ml-2" />
            عرض جميع الطلبات
          </Button>
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          <>
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
          </>
        ) : (
          <>
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">إجمالي الطلبات اليوم</CardTitle>
                <Package className="h-4 w-4 text-[#C4622D]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#1A1A1A]">{ordersToday}</div>
                <p className="text-xs text-gray-400 mt-1">طلبات اليوم</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">إجمالي الطلبات هذا الشهر</CardTitle>
                <ShoppingBag className="h-4 w-4 text-[#C4622D]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#1A1A1A]">{ordersThisMonth}</div>
                <p className="text-xs text-gray-400 mt-1">طلبات هذا الشهر</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">إجمالي الإيرادات</CardTitle>
                <DollarSign className="h-4 w-4 text-[#C4622D]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#1A1A1A]">{formatPrice(totalRevenue)}</div>
                <p className="text-xs text-gray-400 mt-1">إيرادات الطلبات المكتملة</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">الطلبات المعلقة</CardTitle>
                <Clock className="h-4 w-4 text-[#C4622D]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#1A1A1A]">{pendingCount}</div>
                <p className="text-xs text-gray-400 mt-1">في انتظار المراجعة</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders Table */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-lg text-[#1A1A1A]">أحدث الطلبات</CardTitle>
              <Link href="/admin/orders">
                <Button variant="ghost" size="sm" className="text-[#C4622D] text-xs">
                  عرض الكل
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-6 pt-0">
                  <TableSkeleton />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#E0D5C5]">
                        <th className="text-right py-3 px-4 font-medium text-gray-500 text-xs">رقم الطلب</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-500 text-xs">الاسم</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-500 text-xs">الولاية</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-500 text-xs">المجموع</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-500 text-xs">الحالة</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-500 text-xs">التاريخ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-8 text-gray-400 text-sm">
                            لا توجد طلبات حتى الآن
                          </td>
                        </tr>
                      ) : (
                        recentOrders.map((order) => (
                          <tr key={order.id} className="border-b border-[#E0D5C5]/50 hover:bg-[#FAF7F2] transition-colors">
                            <td className="py-3 px-4 font-mono text-xs text-gray-600">
                              #{order.id.slice(0, 8)}
                            </td>
                            <td className="py-3 px-4 font-medium text-[#1A1A1A]">
                              {order.customer_name}
                            </td>
                            <td className="py-3 px-4 text-gray-600">
                              {order.customer_wilaya}
                            </td>
                            <td className="py-3 px-4 font-medium text-[#1A1A1A]">
                              {formatPrice(order.total)}
                            </td>
                            <td className="py-3 px-4">
                              <Badge variant={statusVariant[order.status] || "outline"} className="text-xs">
                                {statusLabel[order.status] || order.status}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-gray-500 text-xs">
                              {new Date(order.created_at).toLocaleDateString("ar-DZ", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Top Wilayas */}
        <div>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-[#1A1A1A]">أكثر الولايات طلباً</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="animate-pulse space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-8 bg-gray-200 rounded" />
                  ))}
                </div>
              ) : topWilayas.length === 0 ? (
                <p className="text-center py-6 text-gray-400 text-sm">لا توجد بيانات</p>
              ) : (
                <div className="space-y-2">
                  {topWilayas.map((item, idx) => (
                    <div
                      key={item.wilaya}
                      className="flex items-center justify-between py-2 px-3 rounded-lg bg-[#FAF7F2]"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#C4622D] w-5">{idx + 1}</span>
                        <span className="text-sm font-medium text-[#1A1A1A]">{item.wilaya}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {item.count} طلب
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

