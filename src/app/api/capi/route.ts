import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
)

const META_GRAPH_URL = "https://graph.facebook.com/v19.0"

export async function POST(req: NextRequest) {
  try {
    const { eventName, eventId, userData, customData } = await req.json()

    const { data: settings } = await supabase
      .from("site_settings")
      .select("key, value")
      .in("key", ["fb_pixel_id", "fb_access_token", "fb_enabled", "fb_test_code"])

    if (!settings) {
      return NextResponse.json({ error: "No settings found" }, { status: 400 })
    }

    const map: Record<string, string> = {}
    for (const row of settings) map[row.key] = row.value ?? ""

    if (map.fb_enabled !== "true" || !map.fb_pixel_id || !map.fb_access_token) {
      return NextResponse.json({ error: "Pixel not configured" }, { status: 400 })
    }

    const event: any = {
      event_name: eventName,
      event_time: Math.floor(Date.now() / 1000),
      event_id: eventId,
      action_source: "website",
      user_data: {
        client_ip_address: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "",
        client_user_agent: req.headers.get("user-agent") || "",
        ...(userData?.ph ? { ph: [userData.ph] } : {}),
      },
      custom_data: customData || {},
    }

    const payload: any = {
      data: [event],
      access_token: map.fb_access_token,
    }

    if (map.fb_test_code) {
      payload.test_event_code = map.fb_test_code
    }

    const metaRes = await fetch(`${META_GRAPH_URL}/${map.fb_pixel_id}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    const metaData = await metaRes.json()
    return NextResponse.json(metaData)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
