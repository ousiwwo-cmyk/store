export interface Product {
  id: string
  name: string
  description: string | null
  price: number
  original_price: number | null
  category: string
  stock: number
  image_url: string | null
  is_featured: boolean
  is_on_sale: boolean
  discount_percent: number
  created_at: string
}

export interface CartItem {
  product_id: string
  name: string
  price: number
  quantity: number
  image_url: string | null
}

export interface Order {
  id: string
  customer_name: string
  customer_phone: string
  customer_wilaya: string
  customer_address: string
  items: CartItem[]
  subtotal: number
  delivery_fee: number
  total: number
  status: OrderStatus
  notes: string | null
  created_at: string
}

export type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled"

export interface DeliveryPrice {
  id: string
  wilaya_name: string
  wilaya_code: number
  home_delivery: number
  office_delivery: number
}

export interface Promotion {
  id: string
  title: string
  description: string | null
  discount_percent: number
  applies_to: string
  is_active: boolean
  start_date: string | null
  end_date: string | null
  created_at: string
}

export interface SiteSetting {
  key: string
  value: string
}

export interface Wilaya {
  code: number
  name_ar: string
  name_fr: string
}
