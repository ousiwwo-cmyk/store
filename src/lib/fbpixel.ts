export const FB_PIXEL_KEYS = {
  PIXEL_ID: "fb_pixel_id",
  ACCESS_TOKEN: "fb_access_token",
  ENABLED: "fb_enabled",
  TEST_CODE: "fb_test_code",
}

declare global {
  interface Window {
    fbq: any
    _fbq: any
  }
}

let pixelIdCache = ""

export function initPixel(pixelId: string) {
  if (typeof window === "undefined" || !pixelId) return
  if (window.fbq) return

  pixelIdCache = pixelId

  const n = window
  const f = n as any
  if (f.fbq) return
  f.fbq = function () {
    f.fbq.callMethod
      ? f.fbq.callMethod.apply(f.fbq, arguments)
      : f.fbq.queue.push(arguments)
  }
  if (!f._fbq) f._fbq = f.fbq
  f.fbq.push = f.fbq
  f.fbq.loaded = !0
  f.fbq.version = "2.0"
  f.fbq.queue = []

  const t = document.createElement("script")
  t.async = !0
  t.src = "https://connect.facebook.net/en_US/fbevents.js"
  const s = document.getElementsByTagName("script")[0]
  s.parentNode?.insertBefore(t, s)

  f.fbq("init", pixelId)
  f.fbq("track", "PageView")
}

export function fbqEvent(
  eventName: string,
  params?: Record<string, any>,
  eventId?: string
) {
  if (typeof window === "undefined" || !window.fbq || !pixelIdCache) return
  if (eventId) {
    window.fbq("trackSingle", pixelIdCache, eventName, params, { eventID: eventId })
  } else {
    window.fbq("track", eventName, params)
  }
}

export function isPixelReady() {
  return typeof window !== "undefined" && !!window.fbq && !!pixelIdCache
}

export function generateEventId(eventName: string, suffix?: string): string {
  const ts = Date.now()
  return `${eventName}_${suffix || "web"}_${ts}`
}
