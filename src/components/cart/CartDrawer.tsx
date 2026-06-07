"use client"

import { useEffect } from "react"
import Link from "next/link"
import { X, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/store/cart"
import { formatPrice } from "@/lib/utils"

interface CartDrawerProps {
  open: boolean
  onClose: () => void
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items, removeItem, updateQuantity, getSubtotal } = useCartStore()

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
  }, [open])

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-full max-w-md z-50 bg-white shadow-2xl transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ direction: "rtl" }}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[#E0D5C5]">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-[#C4622D]" />
              <h2 className="text-lg font-bold">سلة التسوق</h2>
              <span className="text-sm text-gray-500">
                ({items.length} {items.length === 1 ? "منتج" : "منتجات"})
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#FAF7F2] rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <ShoppingBag className="h-16 w-16 mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">السلة فارغة</p>
                <p className="text-sm">أضف منتجات إلى السلة</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={onClose}
                >
                  تصفح المنتجات
                </Button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.product_id}
                  className="flex gap-3 p-3 rounded-xl bg-[#FAF7F2] border border-[#E0D5C5]"
                >
                  {/* Image */}
                  <div className="w-20 h-20 rounded-lg bg-[#E0D5C5]/30 flex-shrink-0 overflow-hidden">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">
                        🏺
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium truncate">{item.name}</h3>
                    <p className="text-[#C4622D] font-bold mt-1">
                      {formatPrice(item.price)}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                        className="w-7 h-7 rounded-lg border border-[#E0D5C5] flex items-center justify-center hover:bg-white transition-colors"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-8 text-center font-medium text-sm">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                        className="w-7 h-7 rounded-lg border border-[#E0D5C5] flex items-center justify-center hover:bg-white transition-colors"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => removeItem(item.product_id)}
                        className="mr-auto p-1 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t border-[#E0D5C5] p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">المجموع الفرعي</span>
                <span className="font-bold text-lg">{formatPrice(getSubtotal())}</span>
              </div>
              <p className="text-xs text-gray-400">
                * رسوم التوصيل تحسب عند إتمام الطلب
              </p>
              <Link href="/checkout" onClick={onClose}>
                <Button className="w-full h-12 text-base font-bold gap-2">
                  <ShoppingBag className="h-5 w-5" />
                  إتمام الطلب
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
