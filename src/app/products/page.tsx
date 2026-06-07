"use client"

import { useState, useEffect, useMemo, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Search, SlidersHorizontal, X, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ProductCard } from "@/components/store/ProductCard"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { Skeleton } from "@/components/ui/skeleton"
import { supabase } from "@/lib/supabase"
import type { Product } from "@/types"
import { categories } from "@/data/categories"
import { formatPrice } from "@/lib/utils"

const sortOptions = [
  { value: "newest", label: "الأحدث" },
  { value: "price-asc", label: "السعر تصاعدي" },
  { value: "price-desc", label: "السعر تنازلي" },
]

function ProductsContent() {
  const searchParams = useSearchParams()
  const categoryParam = searchParams.get("category")
  const searchParam = searchParams.get("search")
  const sortParam = searchParams.get("sort")

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState(searchParam || "")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(categoryParam)
  const [sortBy, setSortBy] = useState(sortParam || "newest")
  const [filterOpen, setFilterOpen] = useState(false)

  useEffect(() => {
    setSearchQuery(searchParam || "")
  }, [searchParam])

  useEffect(() => {
    setSelectedCategory(categoryParam)
  }, [categoryParam])

  useEffect(() => {
    setSortBy(sortParam || "newest")
  }, [sortParam])

  useEffect(() => {
    async function loadProducts() {
      setLoading(true)
      const { data } = await supabase
        .from("products")
        .select("*")
      if (data) {
        setProducts(data)
      }
      setLoading(false)
    }
    loadProducts()
  }, [])

  const filteredProducts = useMemo(() => {
    let result = [...products]

    if (selectedCategory) {
      const cat = categories.find((c) => c.slug === selectedCategory)
      if (cat) {
        result = result.filter((p) => p.category === cat.name)
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q))
      )
    }

    switch (sortBy) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price)
        break
      case "price-desc":
        result.sort((a, b) => b.price - a.price)
        break
      case "newest":
      default:
        result.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        break
    }

    return result
  }, [products, selectedCategory, searchQuery, sortBy])

  const resetFilters = () => {
    setSelectedCategory(null)
    setSearchQuery("")
    setSortBy("newest")
  }

  const hasActiveFilters = selectedCategory || searchQuery.trim()

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-[#C4622D] transition-colors inline-flex items-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            العودة للرئيسية
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">المنتجات</h1>
            <p className="text-gray-500 text-sm mt-1">
              {loading ? "جارٍ التحميل..." : `${filteredProducts.length} منتج`}
            </p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="بحث في المنتجات..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 pr-9 rounded-full bg-white border-[#E0D5C5]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button
              variant="secondary"
              size="sm"
              className="sm:hidden gap-2"
              onClick={() => setFilterOpen(true)}
            >
              <SlidersHorizontal className="h-4 w-4" />
              فلتر
            </Button>
          </div>
        </div>

        <div className="flex gap-8">
          <aside className="hidden sm:block w-56 flex-shrink-0">
            <div className="bg-white rounded-xl border border-[#E0D5C5] p-5 sticky top-28">
              <h3 className="font-bold text-sm mb-4">الفئات</h3>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`w-full text-right px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedCategory === null
                      ? "bg-[#C4622D] text-white font-medium"
                      : "hover:bg-[#FAF7F2] text-[#1A1A1A]"
                  }`}
                >
                  الكل
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.slug)}
                    className={`w-full text-right px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                      selectedCategory === cat.slug
                        ? "bg-[#C4622D] text-white font-medium"
                        : "hover:bg-[#FAF7F2] text-[#1A1A1A]"
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.name}</span>
                  </button>
                ))}
              </div>

              <hr className="my-4 border-[#E0D5C5]" />

              <h3 className="font-bold text-sm mb-4">الترتيب</h3>
              <div className="space-y-1">
                {sortOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setSortBy(opt.value)}
                    className={`w-full text-right px-3 py-2 rounded-lg text-sm transition-colors ${
                      sortBy === opt.value
                        ? "bg-[#C4622D] text-white font-medium"
                        : "hover:bg-[#FAF7F2] text-[#1A1A1A]"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {filterOpen && (
            <div className="fixed inset-0 z-50 sm:hidden">
              <div
                className="absolute inset-0 bg-black/40"
                onClick={() => setFilterOpen(false)}
              />
              <div className="absolute top-0 bottom-0 right-0 w-72 bg-[#FAF7F2] shadow-xl">
                <div className="flex items-center justify-between p-4 border-b border-[#E0D5C5] bg-white">
                  <h2 className="font-bold">تصفية</h2>
                  <button
                    onClick={() => setFilterOpen(false)}
                    className="p-1 hover:text-[#C4622D] transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="p-4 space-y-6">
                  <div>
                    <h3 className="font-bold text-sm mb-3">الفئات</h3>
                    <div className="space-y-1">
                      <button
                        onClick={() => {
                          setSelectedCategory(null)
                          setFilterOpen(false)
                        }}
                        className={`w-full text-right px-3 py-2 rounded-lg text-sm transition-colors ${
                          selectedCategory === null
                            ? "bg-[#C4622D] text-white font-medium"
                            : "hover:bg-white text-[#1A1A1A]"
                        }`}
                      >
                        الكل
                      </button>
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => {
                            setSelectedCategory(cat.slug)
                            setFilterOpen(false)
                          }}
                          className={`w-full text-right px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                            selectedCategory === cat.slug
                              ? "bg-[#C4622D] text-white font-medium"
                              : "hover:bg-white text-[#1A1A1A]"
                          }`}
                        >
                          <span>{cat.icon}</span>
                          <span>{cat.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-sm mb-3">الترتيب</h3>
                    <div className="space-y-1">
                      {sortOptions.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => {
                            setSortBy(opt.value)
                            setFilterOpen(false)
                          }}
                          className={`w-full text-right px-3 py-2 rounded-lg text-sm transition-colors ${
                            sortBy === opt.value
                              ? "bg-[#C4622D] text-white font-medium"
                              : "hover:bg-white text-[#1A1A1A]"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="hidden sm:flex items-center gap-2 mb-6">
              <span className="text-sm text-gray-500">ترتيب:</span>
              <div className="flex gap-1">
                {sortOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setSortBy(opt.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      sortBy === opt.value
                        ? "bg-[#C4622D] text-white"
                        : "bg-white border border-[#E0D5C5] text-[#1A1A1A] hover:border-[#C4622D]"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="mr-auto text-xs text-[#C4622D] hover:text-[#A85222] transition-colors flex items-center gap-1"
                >
                  <X className="h-3 w-3" />
                  إعادة تعيين
                </button>
              )}
            </div>

            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="aspect-square rounded-xl" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="text-xl font-bold mb-2">لا توجد منتجات</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  لم نعثر على منتجات تطابق بحثك. حاول تغيير الفئة أو كلمة البحث.
                </p>
                <div className="flex items-center justify-center gap-3">
                  <Button variant="outline" onClick={resetFilters}>
                    إعادة تعيين الفلتر
                  </Button>
                  <Link href="/products">
                    <Button>عرض الكل</Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                {filteredProducts.map((product) => (
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
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF7F2]">
          <Header />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            <Skeleton className="h-8 w-48 mb-4" />
            <Skeleton className="h-4 w-24 mb-8" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-square rounded-xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          </div>
          <Footer />
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  )
}
