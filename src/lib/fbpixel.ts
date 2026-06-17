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

export function initPixel(pixelId: string) {
  if (typeof window === "undefined" || !pixelId) return
  if (window.fbq) return

  const script = document.createElement("script")
  script.async = true
  script.src = "https://connect.facebook.net/en_US/fbevents.js"
  document.head.appendChild(script)

  window.fbq = function (...args: any[]) {
    window._fbq = window._fbq || []
    window._fbq.push(args)
  }
  window.fbq("init", pixelId)
  window.fbq("track", "PageView")
}

export function fbqEvent(
  eventName: string,
  params?: Record<string, any>,
  eventId?: string
) {
  if (typeof window === "undefined" || !window.fbq) return
  if (eventId) {
    window.fbq("trackSingle", eventName, params, { eventID: eventId })
  } else {
    window.fbq("track", eventName, params)
  }
}

export function generateEventId(
  eventName: string,
  suffix?: string
): string {
  const ts = Date.now()
  return `${eventName}_${suffix || "web"}_${ts}`
}


