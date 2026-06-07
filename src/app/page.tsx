"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Package, Truck, ShieldCheck, Headphones } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ProductCard } from "@/components/store/ProductCard"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { supabase } from "@/lib/supabase"
import { formatPrice } from "@/lib/utils"
import { categories } from "@/data/categories"
import { Skeleton } from "@/components/ui/skeleton"
import type { Product } from "@/types"

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [saleProducts, setSaleProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadProducts() {
      const { data } = await supabase
        .from("products")
        .select("*")
        .limit(8)
      if (data) {
        setFeaturedProducts(data.filter((p: any) => p.is_featured).slice(0, 4))
        setSaleProducts(data.filter((p: any) => p.is_on_sale).slice(0, 4))
      }
      setLoading(false)
    }
    loadProducts()
  }, [])

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#1A1A1A] via-[#2A1A10] to-[#C4622D]/80 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-[#D4A843] blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-[#C4622D] blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="max-w-2xl animate-fadeIn">
            <Badge variant="gold" className="mb-4 text-sm px-4 py-1.5">
              🎉 تخفيضات تصل إلى ٢٠٪
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
              كل ما يحتاجه <span className="text-[#D4A843]">بيتك</span>
              <br />
              بجودة <span className="text-[#D4A843]">وأناقة</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-300 mb-8 leading-relaxed">
              أواني منزلية، أدوات مطبخ، ديكورات، ومستلزمات الحمام — بأفضل الأسعار في الجزائر
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/products">
                <Button size="lg" className="text-base gap-2 bg-[#D4A843] hover:bg-[#C49630] text-white">
                  تسوق الآن
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/products?category=أواني-الطبخ">
                <Button size="lg" variant="outline" className="text-base border-white/30 text-white hover:bg-white/10">
                  أشهر الفئات
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Strip */}
      <section className="bg-white border-b border-[#E0D5C5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Truck, title: "توصيل سريع", desc: "لجميع الولايات" },
              { icon: ShieldCheck, title: "دفع آمن", desc: "عند الاستلام" },
              { icon: Package, title: "منتجات أصلية", desc: "ضمان الجودة" },
              { icon: Headphones, title: "دعم متواصل", desc: "خدمة عملاء" },
            ].map((feature) => (
              <div key={feature.title} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#FAF7F2] flex items-center justify-center">
                  <feature.icon className="h-5 w-5 text-[#C4622D]" />
                </div>
                <div>
                  <p className="font-medium text-sm">{feature.title}</p>
                  <p className="text-xs text-gray-500">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8">
          تصفح حسب <span className="text-[#C4622D]">الفئة</span>
        </h2>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.slug}`}
              className="group flex flex-col items-center gap-2 p-4 sm:p-6 rounded-xl bg-white border border-[#E0D5C5] hover:shadow-md hover:border-[#C4622D] transition-all duration-300"
            >
              <span className="text-3xl sm:text-4xl group-hover:scale-110 transition-transform duration-300">
                {cat.icon}
              </span>
              <span className="text-xs sm:text-sm font-medium text-center">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold">
              منتجات <span className="text-[#C4622D]">مميزة</span>
            </h2>
            <Link href="/products" className="text-[#C4622D] hover:text-[#A85222] text-sm font-medium flex items-center gap-1">
              عرض الكل
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-square rounded-xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  originalPrice={product.original_price}
                  category={product.category}
                  imageUrl={product.image_url}
                  isOnSale={product.is_on_sale}
                  discountPercent={product.discount_percent}
                  isFeatured={product.is_featured}
                />
              ))}
              {featuredProducts.length === 0 && !loading && (
                <div className="col-span-full text-center py-12 text-gray-400">
                  <p className="text-lg">لا توجد منتجات مميزة حالياً</p>
                  <Link href="/products">
                    <Button variant="outline" className="mt-4">تصفح جميع المنتجات</Button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Sale Banner */}
      <section className="bg-gradient-to-l from-[#C4622D] to-[#A85222] py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center text-white">
          <Badge variant="gold" className="mb-4 text-sm px-4 py-1.5">عرض محدود</Badge>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            خصومات تصل إلى <span className="text-[#D4A843]">٢٠٪</span>
          </h2>
          <p className="text-lg text-gray-200 mb-8">
            على مجموعة مختارة من المنتجات — لفترة محدودة
          </p>
          <Link href="/products?sort=sale">
            <Button size="lg" className="bg-[#D4A843] hover:bg-[#C49630] text-white text-base gap-2">
              تسوق العروض
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Sale Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold">
            العروض <span className="text-[#C4622D]">الحالية</span>
          </h2>
          <Link href="/products?sort=sale" className="text-[#C4622D] hover:text-[#A85222] text-sm font-medium flex items-center gap-1">
            عرض الكل
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-square rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {saleProducts.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                price={product.price}
                originalPrice={product.original_price}
                category={product.category}
                imageUrl={product.image_url}
                isOnSale={product.is_on_sale}
                discountPercent={product.discount_percent}
                isFeatured={product.is_featured}
              />
            ))}
            {saleProducts.length === 0 && !loading && (
              <div className="col-span-full text-center py-12 text-gray-400">
                <p className="text-lg">لا توجد عروض حالياً</p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Delivery Partners */}
      <section className="bg-white py-8 border-t border-[#E0D5C5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-sm text-gray-500 mb-2">شركاء التوصيل</p>
          <div className="flex justify-center gap-8 text-lg font-medium text-gray-400">
            <span>🚚 زر إكسبريس</span>
            <span>📦 يالا ليفري</span>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
