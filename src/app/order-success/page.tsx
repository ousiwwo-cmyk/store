"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { CheckCircle, ShoppingBag, ArrowLeft, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"

function OrderSuccessContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get("orderId")

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-16 sm:py-24">
      <Card className="w-full max-w-md bg-white border-[#E0D5C5] shadow-xl">
        <CardContent className="p-8 sm:p-10 text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A]">
              تم استلام طلبك بنجاح!
            </h1>
            <p className="text-gray-500">
              سيتصل بك فريقنا خلال 24 ساعة لتأكيد الطلب
            </p>
          </div>

          {orderId && (
            <div className="bg-[#FAF7F2] rounded-lg p-4 border border-[#E0D5C5]">
              <p className="text-sm text-gray-500 mb-1">رقم الطلب</p>
              <p className="text-lg font-bold text-[#C4622D] font-mono" dir="ltr">
                #{orderId}
              </p>
            </div>
          )}

          <div className="space-y-3 pt-2">
            <a
              href={`https://wa.me/213XXXXXXXXX?text=${encodeURIComponent(`مرحباً، طلبي رقم: ${orderId || ""}`)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="w-full gap-2 bg-[#25D366] hover:bg-[#22c35e] text-white text-base">
                <MessageCircle className="h-5 w-5" />
                تواصل عبر واتساب
              </Button>
            </a>

            <Link href="/products">
              <Button variant="outline" className="w-full gap-2 text-base border-[#C4622D] text-[#C4622D] hover:bg-[#C4622D] hover:text-white">
                <ShoppingBag className="h-5 w-5" />
                متابعة التسوق
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}

export default function OrderSuccessPage() {
  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col">
      <Header />
      <Suspense fallback={
        <main className="flex-1 flex items-center justify-center px-4 py-16 sm:py-24">
          <div className="text-gray-400 text-lg">جاري التحميل...</div>
        </main>
      }>
        <OrderSuccessContent />
      </Suspense>
      <Footer />
    </div>
  )
}
