"use client"

export const dynamic = 'force-dynamic'



import { useState, useEffect } from "react"
import { Save, Store, Phone, MapPin, MessageCircle, Globe, Camera, Music2, Share2, ToggleLeft, ToggleRight, Code } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function fetchSettings() {
      setLoading(true)
      const { data } = await supabase.from("site_settings").select("key, value")
      if (data) {
        const map: Record<string, string> = {}
        for (const row of data) {
          map[row.key] = row.value ?? ""
        }
        setSettings(map)
      }
      setLoading(false)
    }
    fetchSettings()
  }, [])

  function update(key: string, value: string) {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSave() {
    setSaving(true)
    const promises = Object.entries(settings).map(([key, value]) =>
      supabase.from("site_settings").upsert({ key, value }, { onConflict: "key" })
    )
    await Promise.all(promises)
    setSaving(false)
    toast.success("تم حفظ الإعدادات بنجاح")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin h-6 w-6 border-2 border-gray-300 border-t-black rounded-full" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">إعدادات المتجر</h1>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 ml-2" />
          {saving ? "جارٍ الحفظ..." : "حفظ الإعدادات"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>معلومات المتجر</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">اسم المتجر</label>
            <div className="relative">
              <Store className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                className="pr-10"
                value={settings.store_name ?? ""}
                onChange={(e) => update("store_name", e.target.value)}
                placeholder="دار البهجة"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">رقم الهاتف</label>
            <div className="relative">
              <Phone className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                className="pr-10"
                value={settings.store_phone ?? ""}
                onChange={(e) => update("store_phone", e.target.value)}
                placeholder="05xxxxxxxx"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">العنوان</label>
            <div className="relative">
              <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                className="pr-10"
                value={settings.store_address ?? ""}
                onChange={(e) => update("store_address", e.target.value)}
                placeholder="الجزائر العاصمة"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>روابط التواصل الاجتماعي</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">رابط Facebook</label>
            <div className="relative">
              <Globe className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                className="pr-10"
                value={settings.facebook_url ?? ""}
                onChange={(e) => update("facebook_url", e.target.value)}
                placeholder="https://facebook.com/..."
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">رابط Instagram</label>
            <div className="relative">
              <Camera className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                className="pr-10"
                value={settings.instagram_url ?? ""}
                onChange={(e) => update("instagram_url", e.target.value)}
                placeholder="https://instagram.com/..."
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">رابط TikTok</label>
            <div className="relative">
              <Music2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                className="pr-10"
                value={settings.tiktok_url ?? ""}
                onChange={(e) => update("tiktok_url", e.target.value)}
                placeholder="https://tiktok.com/..."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>الإعلانات</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">نص شريط الإعلان</label>
            <div className="relative">
              <MessageCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                className="pr-10"
                value={settings.announcement_bar ?? ""}
                onChange={(e) => update("announcement_bar", e.target.value)}
                placeholder="توصيل مجاني للطلبات فوق 5000 دج"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>إعدادات فيسبوك بيكسل</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">معرف البيكسل (Pixel ID)</label>
            <div className="relative">
              <Share2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                className="pr-10"
                value={settings.fb_pixel_id ?? ""}
                onChange={(e) => update("fb_pixel_id", e.target.value)}
                placeholder="1234567890"
                dir="ltr"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">مثال: 1234567890</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">رمز الوصول (Access Token)</label>
            <div className="relative">
              <Code className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                className="pr-10 font-mono text-xs"
                value={settings.fb_access_token ?? ""}
                onChange={(e) => update("fb_access_token", e.target.value)}
                placeholder="EAAx..."
                dir="ltr"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">مطلوب لـ Conversions API (خادم إلى خادم)</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">رمز اختبار (Test Event Code)</label>
            <div className="relative">
              <Code className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                className="pr-10"
                value={settings.fb_test_code ?? ""}
                onChange={(e) => update("fb_test_code", e.target.value)}
                placeholder="TEST12345"
                dir="ltr"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">اختياري — من Meta Events Manager</p>
          </div>
          <div className="flex items-center justify-between py-2">
            <label className="text-sm font-medium">تفعيل البيكسل</label>
            <button
              type="button"
              onClick={() =>
                update(
                  "fb_enabled",
                  settings.fb_enabled === "true" ? "false" : "true"
                )
              }
              className={`relative w-12 h-6 rounded-full transition-colors ${
                settings.fb_enabled === "true" ? "bg-[#C4622D]" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  settings.fb_enabled === "true"
                    ? "translate-x-6"
                    : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

