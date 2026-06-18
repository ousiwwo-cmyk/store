"use client"

export const dynamic = 'force-dynamic'



import { useState, useEffect } from "react"
import { Plus, Edit2, Trash2, Search, Star, Percent, Image, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { supabase } from "@/lib/supabase"
import { formatPrice } from "@/lib/utils"
import { toast } from "sonner"
import { categories } from "@/data/categories"
import type { Product } from "@/types"

type FormData = {
  name: string
  description: string
  price: string
  original_price: string
  category: string
  stock: string
  image_url: string
  image_file: File | null
  image_preview: string
  is_featured: boolean
  is_on_sale: boolean
  discount_percent: string
}

const emptyForm: FormData = {
  name: "",
  description: "",
  price: "",
  original_price: "",
  category: "",
  stock: "0",
  image_url: "",
  image_file: null,
  image_preview: "",
  is_featured: false,
  is_on_sale: false,
  discount_percent: "0",
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<FormData>(emptyForm)

  useEffect(() => {
    fetchProducts()
  }, [])

  async function fetchProducts() {
    setLoading(true)
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false })
    if (error) {
      toast.error("فشل في تحميل المنتجات")
    } else if (data) {
      setProducts(data as Product[])
    }
    setLoading(false)
  }

  function openAddDialog() {
    setEditingProduct(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  function openEditDialog(product: Product) {
    setEditingProduct(product)
    setForm({
      name: product.name,
      description: product.description ?? "",
      price: String(product.price),
      original_price: product.original_price ? String(product.original_price) : "",
      category: product.category,
      stock: String(product.stock),
      image_url: product.image_url ?? "",
      image_file: null,
      image_preview: product.image_url ?? "",
      is_featured: product.is_featured,
      is_on_sale: product.is_on_sale,
      discount_percent: String(product.discount_percent),
    })
    setDialogOpen(true)
  }

  async function handleSave() {
    if (!form.name.trim()) {
      toast.error("يرجى إدخال اسم المنتج")
      return
    }
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0) {
      toast.error("يرجى إدخال سعر صالح")
      return
    }
    if (!form.category) {
      toast.error("يرجى اختيار الفئة")
      return
    }

    setSaving(true)

    let imageUrl = form.image_url

    if (form.image_file) {
      const fileExt = form.image_file.name.split(".").pop()
      const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${fileExt}`
      const filePath = fileName

      const { error: uploadError } = await supabase.storage
        .from("products")
        .upload(filePath, form.image_file)

      if (uploadError) {
        toast.error("فشل في رفع الصورة")
        setSaving(false)
        return
      }

      const { data: publicUrl } = supabase.storage
        .from("products")
        .getPublicUrl(filePath)

      imageUrl = publicUrl?.publicUrl || ""
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      price: Number(form.price),
      original_price: form.original_price ? Number(form.original_price) : null,
      category: form.category,
      stock: Number(form.stock) || 0,
      image_url: imageUrl || null,
      is_featured: form.is_featured,
      is_on_sale: form.is_on_sale,
      discount_percent: form.is_on_sale ? Number(form.discount_percent) || 0 : 0,
    }

    if (editingProduct) {
      const { error } = await supabase
        .from("products")
        .update(payload)
        .eq("id", editingProduct.id)
      if (error) {
        toast.error("فشل في تحديث المنتج")
      } else {
        toast.success("تم تحديث المنتج بنجاح")
        setDialogOpen(false)
        fetchProducts()
      }
    } else {
      const { error } = await supabase
        .from("products")
        .insert([payload])
      if (error) {
        toast.error("فشل في إضافة المنتج")
      } else {
        toast.success("تم إضافة المنتج بنجاح")
        setDialogOpen(false)
        fetchProducts()
      }
    }

    setSaving(false)
  }

  async function handleDelete(product: Product) {
    if (!window.confirm(`هل أنت متأكد من حذف "${product.name}"؟`)) return

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", product.id)

    if (error) {
      toast.error("فشل في حذف المنتج")
    } else {
      toast.success("تم حذف المنتج بنجاح")
      fetchProducts()
    }
  }

  async function toggleFeatured(product: Product) {
    const { error } = await supabase
      .from("products")
      .update({ is_featured: !product.is_featured })
      .eq("id", product.id)

    if (error) {
      toast.error("فشل في تحديث المنتج")
    } else {
      fetchProducts()
    }
  }

  async function toggleOnSale(product: Product) {
    const newOnSale = !product.is_on_sale
    const updates: Partial<Product> = { is_on_sale: newOnSale }
    if (!newOnSale) {
      updates.discount_percent = 0
    }
    const { error } = await supabase
      .from("products")
      .update(updates)
      .eq("id", product.id)

    if (error) {
      toast.error("فشل في تحديث المنتج")
    } else {
      fetchProducts()
    }
  }

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">إدارة المنتجات</h1>
          <p className="text-sm text-gray-500 mt-0.5">{products.length} منتج</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog} className="gap-2">
              <Plus className="h-4 w-4" />
              إضافة منتج جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingProduct ? "تعديل المنتج" : "إضافة منتج جديد"}</DialogTitle>
              <DialogDescription>
                {editingProduct ? "قم بتعديل بيانات المنتج" : "أدخل بيانات المنتج الجديد"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-1">اسم المنتج</label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="اسم المنتج"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-1">الوصف</label>
                <textarea
                  className="flex h-24 w-full rounded-lg border border-[#E0D5C5] bg-white px-3 py-2 text-sm text-[#1A1A1A] placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C4622D] focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="وصف المنتج"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1A1A1A] mb-1">السعر</label>
                  <Input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="السعر"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1A1A1A] mb-1">السعر الأصلي</label>
                  <Input
                    type="number"
                    value={form.original_price}
                    onChange={(e) => setForm({ ...form, original_price: e.target.value })}
                    placeholder="السعر الأصلي (اختياري)"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-1">الفئة</label>
                <Select
                  value={form.category}
                  onValueChange={(value) => setForm({ ...form, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الفئة" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.name}>
                        {cat.icon} {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1A1A1A] mb-1">المخزون</label>
                  <Input
                    type="number"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    placeholder="المخزون"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1A1A1A] mb-1">صورة المنتج</label>
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null
                        if (file) {
                          setForm({
                            ...form,
                            image_file: file,
                            image_preview: URL.createObjectURL(file),
                          })
                        }
                      }}
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[#C4622D] file:text-white hover:file:bg-[#A85222] transition-colors cursor-pointer"
                    />
                    {form.image_preview && (
                      <div className="relative w-full aspect-square rounded-lg overflow-hidden border border-[#E0D5C5] bg-[#FAF7F2]">
                        <img
                          src={form.image_preview}
                          alt="معاينة"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setForm({
                              ...form,
                              image_file: null,
                              image_url: "",
                              image_preview: "",
                            })
                          }
                          className="absolute top-1 left-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-1">منتج مميز؟</label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={form.is_featured ? "default" : "secondary"}
                    size="sm"
                    onClick={() => setForm({ ...form, is_featured: true })}
                  >
                    نعم
                  </Button>
                  <Button
                    type="button"
                    variant={!form.is_featured ? "default" : "secondary"}
                    size="sm"
                    onClick={() => setForm({ ...form, is_featured: false })}
                  >
                    لا
                  </Button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-1">في العرض؟</label>
                <div className="flex gap-2 mb-2">
                  <Button
                    type="button"
                    variant={form.is_on_sale ? "default" : "secondary"}
                    size="sm"
                    onClick={() => setForm({ ...form, is_on_sale: true })}
                  >
                    نعم
                  </Button>
                  <Button
                    type="button"
                    variant={!form.is_on_sale ? "default" : "secondary"}
                    size="sm"
                    onClick={() => setForm({ ...form, is_on_sale: false })}
                  >
                    لا
                  </Button>
                </div>
                {form.is_on_sale && (
                  <div>
                    <label className="block text-sm font-medium text-[#1A1A1A] mb-1">نسبة الخصم</label>
                    <Input
                      type="number"
                      value={form.discount_percent}
                      onChange={(e) => setForm({ ...form, discount_percent: e.target.value })}
                      placeholder="نسبة الخصم"
                    />
                  </div>
                )}
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <DialogClose asChild>
                  <Button variant="secondary" type="button">إلغاء</Button>
                </DialogClose>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? "جاري الحفظ..." : editingProduct ? "حفظ التعديلات" : "إضافة المنتج"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="بحث عن منتج..."
          className="pr-10"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4 space-y-3">
                <div className="aspect-square bg-gray-200 rounded-lg" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-16">
          <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-lg">
            {searchTerm ? "لا توجد نتائج للبحث" : "لا توجد منتجات بعد"}
          </p>
          {!searchTerm && (
            <Button variant="outline" className="mt-4" onClick={openAddDialog}>
              <Plus className="h-4 w-4 ml-2" />
              إضافة أول منتج
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="group hover:shadow-md transition-shadow">
              <CardContent className="p-0">
                <div className="aspect-square bg-[#FAF7F2] flex items-center justify-center text-5xl rounded-t-xl border-b border-[#E0D5C5]">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover rounded-t-xl"
                    />
                  ) : (
                    <span>🏺</span>
                  )}
                </div>
                <div className="p-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-medium text-sm text-[#1A1A1A] line-clamp-1 flex-1">
                      {product.name}
                    </h3>
                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => openEditDialog(product)}
                        className="p-1.5 rounded-lg hover:bg-[#FAF7F2] text-gray-400 hover:text-[#C4622D] transition-colors"
                        title="تعديل"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(product)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                        title="حذف"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary" className="text-[10px]">
                      {product.category}
                    </Badge>
                    <Badge
                      variant={product.stock > 0 ? "success" : "destructive"}
                      className="text-[10px]"
                    >
                      {product.stock > 0 ? `${product.stock} في المخزون` : "نفذ"}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#C4622D]">
                      {formatPrice(product.price)}
                    </span>
                    {product.is_on_sale && product.original_price && (
                      <span className="text-xs text-gray-400 line-through">
                        {formatPrice(product.original_price)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-1 border-t border-[#E0D5C5]/50">
                    <button
                      onClick={() => toggleFeatured(product)}
                      className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                        product.is_featured
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-[#FAF7F2] text-gray-400 hover:text-yellow-600"
                      }`}
                    >
                      <Star className={`h-3 w-3 ${product.is_featured ? "fill-yellow-500" : ""}`} />
                      مميز
                    </button>
                    <button
                      onClick={() => toggleOnSale(product)}
                      className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                        product.is_on_sale
                          ? "bg-green-100 text-green-700"
                          : "bg-[#FAF7F2] text-gray-400 hover:text-green-600"
                      }`}
                    >
                      <Percent className="h-3 w-3" />
                      عرض
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

