import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
)

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]
const MAX_SIZE = 5 * 1024 * 1024

const EXT_MAP: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "لم يتم اختيار صورة" }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "نوع الملف غير مدعوم. الأنواع المقبولة: JPG, PNG, WebP, GIF" },
        { status: 400 }
      )
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "حجم الصورة كبير جداً. الحد الأقصى: 5MB" },
        { status: 400 }
      )
    }

    const ext = EXT_MAP[file.type] || "jpg"
    const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)

    const { error: uploadError } = await supabase.storage
      .from("products")
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      return NextResponse.json(
        { error: `فشل الرفع: ${uploadError.message}` },
        { status: 500 }
      )
    }

    const { data: publicUrlData } = supabase.storage
      .from("products")
      .getPublicUrl(fileName)

    return NextResponse.json({
      url: publicUrlData?.publicUrl || "",
      path: fileName,
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: "حدث خطأ في رفع الصورة. تأكد من أن الملف أقل من 5MB" },
      { status: 500 }
    )
  }
}
