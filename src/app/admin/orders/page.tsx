"use client"

export const dynamic = 'force-dynamic'



import { useState, useEffect } from "react"
import { Search, Filter, MessageCircle, Phone, X, ChevronDown, Eye, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { supabase } from "@/lib/supabase"
import { formatPrice } from "@/lib/utils"
import { toast } from "sonner"
import type { Order } from "@/types"

const statusLabels: Record<string, string> = {
  pending: "معلق",
  confirmed: "مؤكد",
  shipped: "في الشحن",
  delivered: "تم التسليم",
  cancelled: "ملغي",
}

const statusVariants: Record<string, "warning" | "info" | "default" | "success" | "destructive"> = {
  pending: "warning",
  confirmed: "info",
  shipped: "default",
  delivered: "success",
  cancelled: "destructive",
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString("ar-DZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchOrders()
    const channel = supabase
      .channel("orders-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        (payload: any) => {
          const newOrder = payload.new as Order
          toast("طلب جديد!", {
            description: `طلب من ${newOrder.customer_name} - ${formatPrice(newOrder.total)}`,
          })
          setOrders((prev) => [{ ...newOrder, status: "pending" }, ...prev])
        }
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  async function fetchOrders() {
    setLoading(true)
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
    if (error) {
      toast.error("فشل في تحميل الطلبات")
    } else {
      setOrders(data || [])
    }
    setLoading(false)
  }

  async function updateOrderStatus(orderId: string, newStatus: string) {
    setUpdating(true)
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId)
    if (error) {
      toast.error("فشل في تحديث الحالة")
    } else {
      toast.success("تم تحديث الحالة بنجاح")
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus as Order["status"] } : o))
      )
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus as Order["status"] } : null))
      }
    }
    setUpdating(false)
  }

  const filteredOrders = orders.filter((o) => {
    const q = search.trim().toLowerCase()
    const matchesSearch =
      !q ||
      o.customer_name.toLowerCase().includes(q) ||
      o.customer_phone.includes(q)
    const matchesStatus = statusFilter === "all" || o.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div dir="rtl" className="min-h-screen bg-[#FAF7F2] p-4 md:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-[#1A1A1A]">إدارة الطلبات</h1>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="بحث بالاسم أو الهاتف..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-10 w-full pr-10 sm:w-64"
              />
            </div>
            <div className="relative">
              <Filter className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 z-10" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-10 w-full pr-10 sm:w-44">
                  <SelectValue placeholder="جميع الحالات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="pending">معلق</SelectItem>
                  <SelectItem value="confirmed">مؤكد</SelectItem>
                  <SelectItem value="shipped">في الشحن</SelectItem>
                  <SelectItem value="delivered">تم التسليم</SelectItem>
                  <SelectItem value="cancelled">ملغي</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#C4622D] border-t-transparent" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <AlertCircle className="mb-3 h-12 w-12" />
            <p className="text-lg">لا توجد طلبات</p>
          </div>
        ) : (
          <>
            <div className="hidden md:block overflow-hidden rounded-xl border border-[#E0D5C5] bg-white shadow-sm">
              <table className="w-full text-right">
                <thead>
                  <tr className="border-b border-[#E0D5C5] bg-[#FAF7F2] text-sm font-medium text-gray-500">
                    <th className="px-4 py-3">رقم الطلب</th>
                    <th className="px-4 py-3">الاسم</th>
                    <th className="px-4 py-3">الهاتف</th>
                    <th className="px-4 py-3">الولاية</th>
                    <th className="px-4 py-3">المجموع</th>
                    <th className="px-4 py-3">التاريخ</th>
                    <th className="px-4 py-3">الحالة</th>
                    <th className="px-4 py-3">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E0D5C5]">
                  {filteredOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="cursor-pointer transition-colors hover:bg-[#FAF7F2]"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <td className="px-4 py-3 text-sm font-medium text-[#C4622D]">
                        #{order.id.slice(0, 8)}
                      </td>
                      <td className="px-4 py-3 text-sm text-[#1A1A1A]">{order.customer_name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600" dir="ltr">{order.customer_phone}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{order.customer_wilaya}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-[#1A1A1A]">{formatPrice(order.total)}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{formatDate(order.created_at)}</td>
                      <td className="px-4 py-3">
                        <Badge variant={statusVariants[order.status] || "default"}>
                          {statusLabels[order.status] || order.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedOrder(order)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid gap-4 md:hidden">
              {filteredOrders.map((order) => (
                <Card
                  key={order.id}
                  className="cursor-pointer transition-shadow hover:shadow-md"
                  onClick={() => setSelectedOrder(order)}
                >
                  <CardContent className="p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-medium text-[#C4622D]">#{order.id.slice(0, 8)}</span>
                      <Badge variant={statusVariants[order.status] || "default"}>
                        {statusLabels[order.status] || order.status}
                      </Badge>
                    </div>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-sm text-[#1A1A1A]">{order.customer_name}</span>
                      <span className="text-xs text-gray-500" dir="ltr">{order.customer_phone}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{order.customer_wilaya}</span>
                      <span className="text-sm font-semibold">{formatPrice(order.total)}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs text-gray-400">{formatDate(order.created_at)}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-1 text-xs"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedOrder(order)
                        }}
                      >
                        <Eye className="h-3 w-3" />
                        عرض
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        <Dialog open={!!selectedOrder} onOpenChange={(open) => { if (!open) setSelectedOrder(null) }}>
          {selectedOrder && (
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>تفاصيل الطلب #{selectedOrder.id.slice(0, 8)}</DialogTitle>
                <DialogDescription>معلومات الطلب والعميل</DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <p className="text-xs text-gray-400">الاسم</p>
                    <p className="text-sm font-medium text-[#1A1A1A]">{selectedOrder.customer_name}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-400">الهاتف</p>
                    <p className="text-sm font-medium text-[#1A1A1A]" dir="ltr">{selectedOrder.customer_phone}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-400">الولاية</p>
                    <p className="text-sm font-medium text-[#1A1A1A]">{selectedOrder.customer_wilaya}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-400">العنوان</p>
                    <p className="text-sm font-medium text-[#1A1A1A]">{selectedOrder.customer_address}</p>
                  </div>
                </div>

                <div>
                  <h4 className="mb-2 text-sm font-semibold text-[#1A1A1A]">المنتجات</h4>
                  <div className="divide-y divide-[#E0D5C5] rounded-lg border border-[#E0D5C5]">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between px-3 py-2 text-sm">
                        <span className="text-[#1A1A1A]">{item.name}</span>
                        <span className="text-gray-500">
                          {item.quantity} × {formatPrice(item.price)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-1 rounded-lg bg-[#FAF7F2] p-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">المجموع الفرعي</span>
                    <span>{formatPrice(selectedOrder.subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">رسوم التوصيل</span>
                    <span>{formatPrice(selectedOrder.delivery_fee)}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-[#E0D5C5] pt-1 text-base font-bold text-[#1A1A1A]">
                    <span>المجموع</span>
                    <span className="text-[#C4622D]">{formatPrice(selectedOrder.total)}</span>
                  </div>
                </div>

                {selectedOrder.notes && (
                  <div className="space-y-1">
                    <p className="text-xs text-gray-400">ملاحظات</p>
                    <p className="rounded-lg bg-yellow-50 p-3 text-sm text-yellow-800 border border-yellow-200">
                      {selectedOrder.notes}
                    </p>
                  </div>
                )}

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">الحالة:</span>
                    <Select
                      value={selectedOrder.status}
                      onValueChange={(val) => updateOrderStatus(selectedOrder.id, val)}
                      disabled={updating}
                    >
                      <SelectTrigger className="h-9 w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">معلق</SelectItem>
                        <SelectItem value="confirmed">مؤكد</SelectItem>
                        <SelectItem value="shipped">في الشحن</SelectItem>
                        <SelectItem value="delivered">تم التسليم</SelectItem>
                        <SelectItem value="cancelled">ملغي</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={`tel:${selectedOrder.customer_phone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="secondary" size="sm" className="gap-2">
                        <Phone className="h-4 w-4" />
                        اتصل بالعميل
                      </Button>
                    </a>
                    <a
                      href={`https://wa.me/${selectedOrder.customer_phone.replace(/^0/, "213")}?text=${encodeURIComponent(
                        `طلب جديد #${selectedOrder.id.slice(0, 8)}\nالاسم: ${selectedOrder.customer_name}\nالهاتف: ${selectedOrder.customer_phone}\nالعنوان: ${selectedOrder.customer_wilaya} - ${selectedOrder.customer_address}\nالمنتجات:\n${selectedOrder.items.map((i) => `- ${i.name} (${i.quantity} × ${formatPrice(i.price)})`).join("\n")}\nالمجموع: ${formatPrice(selectedOrder.total)}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button size="sm" className="gap-2 bg-green-600 hover:bg-green-700">
                        <MessageCircle className="h-4 w-4" />
                        واتساب
                      </Button>
                    </a>
                  </div>
                </div>
              </div>
            </DialogContent>
          )}
        </Dialog>
      </div>
    </div>
  )
}

