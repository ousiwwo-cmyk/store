const META_GRAPH_URL = "https://graph.facebook.com/v19.0"

interface ConversionsApiEvent {
  event_name: string
  event_time: number
  event_id?: string
  user_data: {
    ph?: string[]
    client_ip_address?: string
    client_user_agent?: string
  }
  custom_data?: Record<string, any>
  action_source?: string
}

export async function sendServerEvent(
  pixelId: string,
  accessToken: string,
  event: ConversionsApiEvent,
  testCode?: string
) {
  if (!pixelId || !accessToken) return

  const payload: any = {
    data: [event],
    access_token: accessToken,
  }

  if (testCode) {
    payload.test_event_code = testCode
  }

  try {
    const res = await fetch(
      `${META_GRAPH_URL}/${pixelId}/events`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    )
    return await res.json()
  } catch (err) {
    console.error("Meta CAPI error:", err)
    return null
  }
}
