"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCartStore } from "@/store/cart"
import { formatPrice } from "@/lib/utils"
import { fireAddToCart } from "@/components/layout/PixelEvents"

interface ProductCardProps {
  id: string
  name: string
  price: number
  originalPrice: number | null
  category: string
  imageUrl: string | null
  isOnSale: boolean
  discountPercent: number
  isFeatured: boolean
}

export function ProductCard({
  id,
  name,
  price,
  originalPrice,
  category,
  imageUrl,
  isOnSale,
  discountPercent,
  isFeatured,
}: ProductCardProps) {
  const router = useRouter()
  const addItem = useCartStore((s) => s.addItem)

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addItem({
      product_id: id,
      name,
      price,
      image_url: imageUrl,
    })
    fireAddToCart({ id, name, price })
    router.push("/checkout")
  }

  return (
    <Link href={`/products/${id}`}>
      <div className="group bg-white rounded-xl border border-[#E0D5C5] overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        {/* Image */}
        <div className="relative aspect-square bg-[#FAF7F2] overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl">
              🏺
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2 right-2 flex flex-col gap-1">
            {isOnSale && (
              <Badge variant="destructive" className="text-xs">
                -{discountPercent}%
              </Badge>
            )}
            {isFeatured && (
              <Badge variant="gold" className="text-xs">
                مميز
              </Badge>
            )}
          </div>

          {/* Category */}
          <div className="absolute top-2 left-2">
            <Badge variant="secondary" className="text-xs">
              {category}
            </Badge>
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="font-medium text-[#1A1A1A] group-hover:text-[#C4622D] transition-colors truncate">
            {name}
          </h3>

          <div className="flex items-center gap-2 mt-2">
            <span className="text-lg font-bold text-[#C4622D]">
              {formatPrice(price)}
            </span>
            {originalPrice && originalPrice > price && (
              <span className="text-sm text-gray-400 line-through">
                {formatPrice(originalPrice)}
              </span>
            )}
          </div>

          <Button
            onClick={handleBuyNow}
            size="sm"
            className="w-full mt-3 gap-2"
          >
            <ShoppingBag className="h-4 w-4" />
            اشتر الآن
          </Button>
        </div>
      </div>
    </Link>
  )
}
