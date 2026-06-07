"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ShoppingCart, ArrowLeft, Minus, Plus, Truck, ShieldCheck, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ProductCard } from "@/components/store/ProductCard"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { useCartStore } from "@/store/cart"
import { supabase } from "@/lib/supabase"
import { formatPrice } from "@/lib/utils"
import type { Product } from "@/types"

export default function ProductPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { addItem } = useCartStore()

  const [product, setProduct] = useState<Product | null>(null)
  const [related, setRelated] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setError(false)

    const fetchProduct = async () => {
      const { data, error: fetchError } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single()

      if (fetchError || !data) {
        setError(true)
        setLoading(false)
        return
      }

      setProduct(data as Product)

      const { data: relatedData } = await supabase
        .from("products")
        .select("*")
        .eq("category", (data as Product).category)
        .neq("id", id)
        .limit(4)

      if (relatedData) {
        setRelated(relatedData as Product[])
      }

      setLoading(false)
    }

    fetchProduct()
  }, [id])

  const handleAddToCart = () => {
    if (!product) return

    for (let i = 0; i < quantity; i++) {
      addItem({
        product_id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url,
      })
    }
  }

  const handleBuyNow = () => {
    handleAddToCart()
    router.push("/checkout")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col" dir="rtl">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-32 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Skeleton className="aspect-square rounded-xl" />
            <div className="space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-8 w-1/4" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-12 w-40" />
              <Skeleton className="h-12 w-40" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col" dir="rtl">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 flex flex-col items-center justify-center">
          <div className="text-8xl mb-4">😞</div>
          <h1 className="text-2xl font-bold mb-2">المنتج غير موجود</h1>
          <p className="text-muted-foreground mb-6">عذراً، لم نتمكن من العثور على هذا المنتج</p>
          <Link href="/products">
            <Button variant="outline">
              <ArrowLeft className="ml-2 h-4 w-4" />
              العودة إلى المنتجات
            </Button>
          </Link>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <Link
          href="/products"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="ml-1 h-4 w-4" />
          العودة إلى المنتجات
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          <div className="aspect-square rounded-xl bg-muted flex items-center justify-center overflow-hidden">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-8xl">🏺</span>
            )}
          </div>

          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-3xl font-bold text-primary">
                  {formatPrice(product.price)}
                </span>
                {product.is_on_sale && product.original_price && (
                  <>
                    <span className="text-xl text-muted-foreground line-through">
                      {formatPrice(product.original_price)}
                    </span>
                    <Badge variant="destructive" className="text-sm">
                      -{product.discount_percent}%
                    </Badge>
                  </>
                )}
              </div>
            </div>

            {product.description && (
              <p className="text-muted-foreground leading-relaxed">{product.description}</p>
            )}

            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">الكمية:</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-10 text-center text-lg font-semibold">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setQuantity((q) => q + 1)}
                  disabled={quantity >= product.stock}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <span className="text-xs text-muted-foreground">
                ({product.stock} متبقي)
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button size="lg" className="flex-1 gap-2" onClick={handleAddToCart}>
                <ShoppingCart className="h-5 w-5" />
                أضف للسلة
              </Button>
              <Button size="lg" variant="secondary" className="flex-1 gap-2" onClick={handleBuyNow}>
                ا طلب الآن
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Truck className="h-5 w-5 text-primary shrink-0" />
                <span>توصيل سريع</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
                <span>دفع عند الاستلام</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Package className="h-5 w-5 text-primary shrink-0" />
                <span>منتج أصلي</span>
              </div>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold mb-6">منتجات ذات صلة</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {related.map((item) => (
                <ProductCard
                  key={item.id}
                  id={item.id}
                  name={item.name}
                  price={item.price}
                  originalPrice={item.original_price}
                  category={item.category}
                  imageUrl={item.image_url}
                  isOnSale={item.is_on_sale}
                  discountPercent={item.discount_percent}
                  isFeatured={item.is_featured}
                />
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  )
}
