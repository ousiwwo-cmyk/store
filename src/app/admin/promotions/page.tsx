"use client"

export const dynamic = 'force-dynamic'



import { useState, useEffect } from "react"
import { Plus, Edit2, Trash2, Gift, Calendar, Percent, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import type { Promotion } from "@/types"

const CATEGORIES = ["أواني الطبخ", "أدوات المطبخ", "غرفة النوم", "الحمام", "الديكور", "التنظيف"]

type FormData = {
  title: string
  description: string
  discount_percent: string
  applies_to: string
  start_date: string
  end_date: string
  is_active: boolean
}

const emptyForm: FormData = {
  title: "",
  description: "",
  discount_percent: "0",
  applies_to: "all",
  start_date: "",
  end_date: "",
  is_active: true,
}

export default function AdminPromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<FormData>(emptyForm)

  useEffect(() => {
    fetchPromotions()
  }, [])

  async function fetchPromotions() {
    setLoading(true)
    const { data, error } = await supabase
      .from("promotions")
      .select("*")
      .order("created_at", { ascending: false })
    if (error) {
      toast.error("فشل في تحميل العروض")
    } else if (data) {
      setPromotions(data as Promotion[])
    }
    setLoading(false)
  }

  function openAddDialog() {
    setEditingPromotion(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  function openEditDialog(promotion: Promotion) {
    setEditingPromotion(promotion)
    setForm({
      title: promotion.title,
      description: promotion.description ?? "",
      discount_percent: String(promotion.discount_percent),
      applies_to: promotion.applies_to,
      start_date: promotion.start_date ?? "",
      end_date: promotion.end_date ?? "",
      is_active: promotion.is_active,
    })
    setDialogOpen(true)
  }

  async function handleSave() {
    if (!form.title.trim()) {
      toast.error("يرجى إدخال عنوان العرض")
      return
    }
    if (!form.discount_percent || isNaN(Number(form.discount_percent)) || Number(form.discount_percent) <= 0) {
      toast.error("يرجى إدخال نسبة خصم صالحة")
      return
    }

    setSaving(true)

    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      discount_percent: Number(form.discount_percent),
      applies_to: form.applies_to,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      is_active: form.is_active,
    }

    if (editingPromotion) {
      const { error } = await supabase
        .from("promotions")
        .update(payload)
        .eq("id", editingPromotion.id)
      if (error) {
        toast.error("فشل في تحديث العرض")
      } else {
        toast.success("تم تحديث العرض بنجاح")
        setDialogOpen(false)
        fetchPromotions()
      }
    } else {
      const { error } = await supabase
        .from("promotions")
        .insert([payload])
      if (error) {
        toast.error("فشل في إضافة العرض")
      } else {
        toast.success("تم إضافة العرض بنجاح")
        setDialogOpen(false)
        fetchPromotions()
      }
    }

    setSaving(false)
  }

  async function handleDelete(promotion: Promotion) {
    if (!window.confirm(`هل أنت متأكد من حذف "${promotion.title}"؟`)) return

    const { error } = await supabase
      .from("promotions")
      .delete()
      .eq("id", promotion.id)

    if (error) {
      toast.error("فشل في حذف العرض")
    } else {
      toast.success("تم حذف العرض بنجاح")
      fetchPromotions()
    }
  }

  function formatDate(dateStr: string | null) {
    if (!dateStr) return ""
    const d = new Date(dateStr)
    return d.toLocaleDateString("ar-DZ", { year: "numeric", month: "short", day: "numeric" })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">إدارة العروض</h1>
          <p className="text-sm text-gray-500 mt-0.5">{promotions.length} عرض</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog} className="gap-2">
              <Plus className="h-4 w-4" />
              إضافة عرض جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingPromotion ? "تعديل العرض" : "إضافة عرض جديد"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-1">عنوان العرض</label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="عنوان العرض"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-1">الوصف</label>
                <textarea
                  className="flex h-24 w-full rounded-lg border border-[#E0D5C5] bg-white px-3 py-2 text-sm text-[#1A1A1A] placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C4622D] focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="وصف العرض"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-1">نسبة الخصم %</label>
                <Input
                  type="number"
                  value={form.discount_percent}
                  onChange={(e) => setForm({ ...form, discount_percent: e.target.value })}
                  placeholder="نسبة الخصم"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-1">ينطبق على</label>
                <Select
                  value={form.applies_to}
                  onValueChange={(value) => setForm({ ...form, applies_to: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">كل المنتجات</SelectItem>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1A1A1A] mb-1">تاريخ البداية</label>
                  <Input
                    type="date"
                    value={form.start_date}
                    onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1A1A1A] mb-1">تاريخ النهاية</label>
                  <Input
                    type="date"
                    value={form.end_date}
                    onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-1">نشط</label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={form.is_active ? "default" : "secondary"}
                    size="sm"
                    onClick={() => setForm({ ...form, is_active: true })}
                  >
                    نعم
                  </Button>
                  <Button
                    type="button"
                    variant={!form.is_active ? "default" : "secondary"}
                    size="sm"
                    onClick={() => setForm({ ...form, is_active: false })}
                  >
                    لا
                  </Button>
                </div>
              </div>
            </div>
            <DialogFooter className="pt-2">
              <DialogClose asChild>
                <Button variant="secondary" type="button">إلغاء</Button>
              </DialogClose>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "جاري الحفظ..." : editingPromotion ? "حفظ التعديلات" : "إضافة العرض"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6 space-y-3">
                <div className="h-5 bg-gray-200 rounded w-2/3" />
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-1/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : promotions.length === 0 ? (
        <div className="text-center py-16">
          <Gift className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-lg">لا توجد عروض بعد</p>
          <Button variant="outline" className="mt-4" onClick={openAddDialog}>
            <Plus className="h-4 w-4 ml-2" />
            إضافة أول عرض
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {promotions.map((promotion) => (
            <Card key={promotion.id} className="group hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-[#C4622D]/10 flex items-center justify-center shrink-0">
                      <Percent className="h-5 w-5 text-[#C4622D]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#1A1A1A]">{promotion.title}</h3>
                      <p className="text-xs text-gray-400 line-clamp-1">
                        {promotion.description || "لا يوجد وصف"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => openEditDialog(promotion)}
                      className="p-1.5 rounded-lg hover:bg-[#FAF7F2] text-gray-400 hover:text-[#C4622D] transition-colors"
                      title="تعديل"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(promotion)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                      title="حذف"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <div className="text-3xl font-bold text-[#C4622D]">
                    {promotion.discount_percent}%
                  </div>
                  <Badge
                    variant={promotion.is_active ? "success" : "secondary"}
                    className="text-xs"
                  >
                    {promotion.is_active ? "نشط" : "غير نشط"}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Tag className="h-3.5 w-3.5" />
                  <span>{promotion.applies_to === "all" ? "كل المنتجات" : promotion.applies_to}</span>
                </div>

                {(promotion.start_date || promotion.end_date) && (
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>
                      {promotion.start_date ? formatDate(promotion.start_date) : "بدون تاريخ"} - {promotion.end_date ? formatDate(promotion.end_date) : "بدون تاريخ"}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

