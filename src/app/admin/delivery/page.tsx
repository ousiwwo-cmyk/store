"use client"

export const dynamic = 'force-dynamic'



import { useState, useEffect } from "react"
import { Save, Search, Edit3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import { formatPrice } from "@/lib/utils"
import { toast } from "sonner"
import { wilayas } from "@/data/wilayas"
import { DeliveryPrice } from "@/types"

export default function AdminDeliveryPage() {
  const [prices, setPrices] = useState<DeliveryPrice[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [savingRows, setSavingRows] = useState<Set<string>>(new Set())
  const [savingAll, setSavingAll] = useState(false)
  const [seeding, setSeeding] = useState(false)

  useEffect(() => {
    fetchPrices()
  }, [])

  async function fetchPrices() {
    setLoading(true)
    const { data, error } = await supabase
      .from("delivery_prices")
      .select("*")
      .order("wilaya_code", { ascending: true })
    if (error) {
      toast.error("فشل في تحميل أسعار التوصيل")
      setLoading(false)
      return
    }
    if (!data || data.length === 0) {
      await seedDefaultPrices()
    } else {
      setPrices(data as DeliveryPrice[])
    }
    setLoading(false)
  }

  async function seedDefaultPrices() {
    setSeeding(true)
    const defaultPrices = wilayas.map((w) => {
      let home = 700
      let office = 500
      if (w.code === 22) { home = 400; office = 300 }
      else if (w.code === 16) { home = 600; office = 400 }
      else if (w.code === 30) { home = 600; office = 400 }
      return {
        wilaya_code: w.code,
        wilaya_name: w.name_ar,
        home_delivery: home,
        office_delivery: office,
      }
    })
    const { data, error } = await supabase
      .from("delivery_prices")
      .insert(defaultPrices)
      .select()
      .order("wilaya_code", { ascending: true })
    if (error) {
      toast.error("فشل في إنشاء الأسعار الافتراضية")
    } else if (data) {
      setPrices(data as DeliveryPrice[])
      toast.success("تم إنشاء الأسعار الافتراضية")
    }
    setSeeding(false)
  }

  function handlePriceChange(wilayaCode: number, field: "home_delivery" | "office_delivery", value: string) {
    const num = Number(value)
    if (isNaN(num)) return
    setPrices((prev) =>
      prev.map((p) =>
        p.wilaya_code === wilayaCode ? { ...p, [field]: num } : p
      )
    )
  }

  async function saveRow(wilayaCode: number) {
    const price = prices.find((p) => p.wilaya_code === wilayaCode)
    if (!price) return
    setSavingRows((prev) => new Set(prev).add(String(wilayaCode)))
    const { error } = await supabase
      .from("delivery_prices")
      .upsert({
        id: price.id,
        wilaya_code: price.wilaya_code,
        wilaya_name: price.wilaya_name,
        home_delivery: price.home_delivery,
        office_delivery: price.office_delivery,
      })
    if (error) {
      toast.error(`فشل في حفظ ${price.wilaya_name}`)
    } else {
      toast.success(`تم حفظ ${price.wilaya_name}`)
    }
    setSavingRows((prev) => {
      const next = new Set(prev)
      next.delete(String(wilayaCode))
      return next
    })
  }

  async function saveAllRows() {
    setSavingAll(true)
    const { error } = await supabase
      .from("delivery_prices")
      .upsert(
        prices.map((p) => ({
          id: p.id,
          wilaya_code: p.wilaya_code,
          wilaya_name: p.wilaya_name,
          home_delivery: p.home_delivery,
          office_delivery: p.office_delivery,
        }))
      )
    if (error) {
      toast.error("فشل في حفظ جميع الأسعار")
    } else {
      toast.success("تم حفظ جميع الأسعار")
    }
    setSavingAll(false)
  }

  const filteredPrices = prices.filter((p) =>
    p.wilaya_name.includes(searchQuery)
  )

  if (loading || (seeding && prices.length === 0)) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C4622D]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">أسعار التوصيل</h1>
          <p className="text-sm text-gray-500 mt-0.5">إدارة أسعار التوصيل حسب الولاية</p>
        </div>
        <Button
          onClick={saveAllRows}
          disabled={savingAll}
          className="bg-[#C4622D] hover:bg-[#A84E1F] text-white"
        >
          <Save className="h-4 w-4 ml-2" />
          {savingAll ? "جاري الحفظ..." : "حفظ الكل"}
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="بحث باسم الولاية..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pr-10"
        />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-[#1A1A1A]">قائمة الولايات</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E0D5C5]">
                  <th className="text-right py-3 px-4 font-medium text-gray-500 text-xs">رقم الولاية</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500 text-xs">اسم الولاية</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500 text-xs">توصيل للمنزل (دج)</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500 text-xs">توصيل للمكتب (دج)</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-500 text-xs"></th>
                </tr>
              </thead>
              <tbody>
                {filteredPrices.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-400 text-sm">
                      لا توجد نتائج
                    </td>
                  </tr>
                ) : (
                  filteredPrices.map((price) => (
                    <tr key={price.wilaya_code} className="border-b border-[#E0D5C5]/50 hover:bg-[#FAF7F2] transition-colors">
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="text-xs">
                          {price.wilaya_code}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 font-medium text-[#1A1A1A]">
                        {price.wilaya_name}
                      </td>
                      <td className="py-3 px-4">
                        <Input
                          type="number"
                          value={price.home_delivery}
                          onChange={(e) => handlePriceChange(price.wilaya_code, "home_delivery", e.target.value)}
                          className="w-24 h-8 text-left"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <Input
                          type="number"
                          value={price.office_delivery}
                          onChange={(e) => handlePriceChange(price.wilaya_code, "office_delivery", e.target.value)}
                          className="w-24 h-8 text-left"
                        />
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => saveRow(price.wilaya_code)}
                          disabled={savingRows.has(String(price.wilaya_code))}
                          className="border-[#C4622D] text-[#C4622D] hover:bg-[#C4622D] hover:text-white text-xs"
                        >
                          <Edit3 className="h-3 w-3 ml-1" />
                          {savingRows.has(String(price.wilaya_code)) ? "..." : "حفظ"}
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

