"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { fbqEvent } from "@/lib/fbpixel"

export function usePageView() {
  const pathname = usePathname()

  useEffect(() => {
    fbqEvent("PageView")
  }, [pathname])
}

export function fireViewContent(product: {
  id: string
  name: string
  category: string
  price: number
}) {
  fbqEvent("ViewContent", {
    content_id: product.id,
    content_name: product.name,
    content_category: product.category,
    value: product.price,
    currency: "DZD",
  })
}

export function fireAddToCart(
  product: { id: string; name: string; price: number },
  quantity: number = 1,
  eventId?: string
) {
  fbqEvent(
    "AddToCart",
    {
      content_id: product.id,
      content_name: product.name,
      value: product.price,
      currency: "DZD",
      quantity,
    },
    eventId
  )
}

export function fireInitiateCheckout(
  numItems: number,
  value: number,
  eventId?: string
) {
  fbqEvent(
    "InitiateCheckout",
    {
      num_items: numItems,
      value,
      currency: "DZD",
    },
    eventId
  )
}

export function firePurchase(
  orderId: string,
  value: number,
  contents: Array<{ id: string; quantity: number }>,
  eventId?: string
) {
  fbqEvent(
    "Purchase",
    {
      order_id: orderId,
      value,
      currency: "DZD",
      num_items: contents.reduce((s, c) => s + c.quantity, 0),
      contents,
    },
    eventId
  )
}

export function fireSearch(searchString: string, eventId?: string) {
  fbqEvent("Search", { search_string: searchString }, eventId)
}
