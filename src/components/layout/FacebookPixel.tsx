"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { initPixel, FB_PIXEL_KEYS } from "@/lib/fbpixel"

export function FacebookPixel() {
  const [ready, setReady] = useState(false)

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
      const pixelId = map[FB_PIXEL_KEYS.PIXEL_ID] || ""
      const testCode = map[FB_PIXEL_KEYS.TEST_CODE] || ""

      if (enabled && pixelId) {
        initPixel(pixelId)
        if (testCode) {
          window.fbq?.("set", "testEventCode", testCode)
        }
        setReady(true)
      }
    }
    load()
  }, [])

  return null
}
