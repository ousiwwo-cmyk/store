"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { initPixel, FB_PIXEL_KEYS } from "@/lib/fbpixel"

export function FacebookPixel() {
  const [pixelId, setPixelId] = useState("")

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("site_settings")
        .select("key, value")
        .in("key", [FB_PIXEL_KEYS.PIXEL_ID, FB_PIXEL_KEYS.ENABLED, FB_PIXEL_KEYS.TEST_CODE])

      if (!data) return

      const map: Record<string, string> = {}
      for (const row of data) map[row.key] = row.value ?? ""

      const enabled = map[FB_PIXEL_KEYS.ENABLED] === "true"
      const pid = map[FB_PIXEL_KEYS.PIXEL_ID] || ""

      if (enabled && pid) {
        initPixel(pid)
        setPixelId(pid)
      }
    }
    load()
  }, [])

  return pixelId ? (
    <noscript>
      <img
        height="1"
        width="1"
        style={{ display: "none" }}
        src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
        alt=""
      />
    </noscript>
  ) : null
}
