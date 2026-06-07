"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ShoppingBag, ArrowLeft, ChevronDown, Truck, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { useCartStore } from "@/store/cart"
import { supabase } from "@/lib/supabase"
import { formatPrice } from "@/lib/utils"
import { wilayas } from "@/data/wilayas"
import { toast } from "sonner"

export default function CheckoutPage() {
  const router = useRouter()
  const { items, clearCart, getSubtotal } = useCartStore()
  const subtotal = getSubtotal()

  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [wilayaCode, setWilayaCode] = useState("")
  const [address, setAddress] = useState("")
  const [deliveryType, setDeliveryType] = useState<"home" | "office">("home")
  const [notes, setNotes] = useState("")
  const [deliveryFee, setDeliveryFee] = useState(700)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (items.length === 0) return
    async function fetchDeliveryPrice() {
      if (!wilayaCode) {
        setDeliveryFee(deliveryType === "home" ? 700 : 500)
        return
      }
      const { data } = await supabase
        .from("delivery_prices")
        .select("*")
        .eq("wilaya_code", parseInt(wilayaCode))
        .single()
      if (data) {
        setDeliveryFee(deliveryType === "home" ? data.home_delivery : data.office_delivery)
      } else {
        setDeliveryFee(deliveryType === "home" ? 700 : 500)
      }
    }
    fetchDeliveryPrice()
  }, [wilayaCode, deliveryType, items.length])

  function validateForm() {
    const newErrors: Record<string, string> = {}
    if (!fullName.trim()) newErrors.fullName = "الاسم الكامل مطلوب"
    if (!phone.trim()) {
      newErrors.phone = "رقم الهاتف مطلوب"
    } else if (!/^(05|06|07)\d{8}$/.test(phone.trim())) {
      newErrors.phone = "رقم الهاتف غير صحيح (يجب أن يبدأ 05x أو 06x أو 07x ويتكون من 10 أرقام)"
    }
    if (!wilayaCode) newErrors.wilaya = "الرجاء اختيار الولاية"
    if (!address.trim()) newErrors.address = "العنوان التفصيلي مطلوب"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validateForm()) return

    setSubmitting(true)
    try {
      const total = subtotal + deliveryFee
      const { data, error } = await supabase
        .from("orders")
        .insert({
          customer_name: fullName.trim(),
          customer_phone: phone.trim(),
          customer_wilaya: wilayaCode,
          customer_address: address.trim(),
          items,
          subtotal,
          delivery_fee: deliveryFee,
          total,
          status: "pending",
          notes: notes.trim() || null,
        })
        .select("id")
        .single()

      if (error) {
        toast.error("حدث خطأ أثناء إرسال الطلب. حاول مرة أخرى.")
        return
      }

      clearCart()
      router.push(`/order-success?id=${data.id}`)
    } catch {
      toast.error("حدث خطأ أثناء إرسال الطلب. حاول مرة أخرى.")
    } finally {
      setSubmitting(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="w-20 h-20 rounded-full bg-[#F0EBE0] flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="h-10 w-10 text-[#C4622D]" />
            </div>
            <h1 className="text-2xl font-bold mb-2">السلة فارغة</h1>
            <p className="text-gray-500 mb-6">أضف بعض المنتجات إلى سلة التسوق قبل إتمام الطلب</p>
            <Link href="/products">
              <Button size="lg" className="gap-2">
                <ArrowLeft className="h-5 w-5" />
                تسوق الآن
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  const selectedWilaya = wilayas.find((w) => w.code.toString() === wilayaCode)

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <Link href="/cart" className="text-[#C4622D] hover:text-[#A85222] text-sm font-medium flex items-center gap-1 w-fit">
            <ArrowLeft className="h-4 w-4" />
            العودة إلى السلة
          </Link>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-8">إتمام الطلب</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-xl border border-[#E0D5C5] p-6 space-y-5">
                <h2 className="text-lg font-bold">معلومات التوصيل</h2>

                <div>
                  <label className="block text-sm font-medium mb-1.5">الاسم الكامل *</label>
                  <Input
                    dir="rtl"
                    placeholder="أدخل اسمك الكامل"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className={errors.fullName ? "border-red-500" : ""}
                  />
                  {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">رقم الهاتف *</label>
                  <Input
                    dir="rtl"
                    placeholder="مثال: 0555123456"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={errors.phone ? "border-red-500" : ""}
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">الولاية *</label>
                  <select
                    dir="rtl"
                    value={wilayaCode}
                    onChange={(e) => setWilayaCode(e.target.value)}
                    className={`w-full h-10 rounded-lg border border-[#E0D5C5] bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#C4622D] focus:border-transparent ${
                      errors.wilaya ? "border-red-500" : ""
                    }`}
                  >
                    <option value="">اختر الولاية</option>
                    {wilayas.map((w) => (
                      <option key={w.code} value={w.code}>
                        {w.name_ar}
                      </option>
                    ))}
                  </select>
                  {errors.wilaya && <p className="text-red-500 text-xs mt-1">{errors.wilaya}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">العنوان التفصيلي *</label>
                  <textarea
                    dir="rtl"
                    placeholder="البلدية، الحي، الشارع، رقم المنزل أو العمارة، الطابق"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows={3}
                    className={`w-full rounded-lg border border-[#E0D5C5] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C4622D] focus:border-transparent resize-none ${
                      errors.address ? "border-red-500" : ""
                    }`}
                  />
                  {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">نوع التوصيل</label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setDeliveryType("home")}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                        deliveryType === "home"
                          ? "border-[#C4622D] bg-[#C4622D]/5 text-[#C4622D]"
                          : "border-[#E0D5C5] bg-white text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      <Truck className="h-4 w-4" />
                      توصيل للمنزل
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeliveryType("office")}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                        deliveryType === "office"
                          ? "border-[#C4622D] bg-[#C4622D]/5 text-[#C4622D]"
                          : "border-[#E0D5C5] bg-white text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      <Building2 className="h-4 w-4" />
                      توصيل للمكتب
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">ملاحظات (اختياري)</label>
                  <textarea
                    dir="rtl"
                    placeholder="أي ملاحظات إضافية للطلب"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    className="w-full rounded-lg border border-[#E0D5C5] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C4622D] focus:border-transparent resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl border border-[#E0D5C5] p-6 sticky top-24">
                <h2 className="text-lg font-bold mb-4">ملخص الطلب</h2>

                <div className="space-y-3 mb-4">
                  {items.map((item) => (
                    <div key={item.product_id} className="flex justify-between text-sm">
                      <span className="text-gray-600 truncate ml-2">
                        {item.name} × {item.quantity}
                      </span>
                      <span className="font-medium whitespace-nowrap">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-[#E0D5C5] pt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">المجموع الفرعي</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">
                      التوصيل
                      {selectedWilaya && ` (${selectedWilaya.name_ar})`}
                    </span>
                    <span>{formatPrice(deliveryFee)}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold pt-2 border-t border-[#E0D5C5]">
                    <span>المجموع</span>
                    <span className="text-[#C4622D]">{formatPrice(subtotal + deliveryFee)}</span>
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full mt-6 gap-2"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      جاري إرسال الطلب...
                    </>
                  ) : (
                    "تأكيد الطلب"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  )
}
