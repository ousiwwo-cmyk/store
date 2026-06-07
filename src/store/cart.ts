import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface CartItem {
  product_id: string
  name: string
  price: number
  quantity: number
  image_url: string | null
}

interface CartState {
  items: CartItem[]
  addItem: (item: Omit<CartItem, "quantity">) => void
  removeItem: (product_id: string) => void
  updateQuantity: (product_id: string, quantity: number) => void
  clearCart: () => void
  getSubtotal: () => number
  getItemCount: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.product_id === item.product_id)
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.product_id === item.product_id
                  ? { ...i, quantity: i.quantity + 1 }
                  : i
              ),
            }
          }
          return { items: [...state.items, { ...item, quantity: 1 }] }
        }),
      removeItem: (product_id) =>
        set((state) => ({
          items: state.items.filter((i) => i.product_id !== product_id),
        })),
      updateQuantity: (product_id, quantity) =>
        set((state) => ({
          items: quantity <= 0
            ? state.items.filter((i) => i.product_id !== product_id)
            : state.items.map((i) =>
                i.product_id === product_id ? { ...i, quantity } : i
              ),
        })),
      clearCart: () => set({ items: [] }),
      getSubtotal: () => {
        return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0)
      },
      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0)
      },
    }),
    {
      name: "cart-storage",
    }
  )
)
