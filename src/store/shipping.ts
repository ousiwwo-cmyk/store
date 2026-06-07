import { create } from "zustand"

interface ShippingState {
  deliveryType: "home" | "office"
  selectedWilaya: number | null
  homePrice: number
  officePrice: number
  setDeliveryType: (type: "home" | "office") => void
  setSelectedWilaya: (code: number | null) => void
  setPrices: (home: number, office: number) => void
}

export const useShippingStore = create<ShippingState>((set) => ({
  deliveryType: "home",
  selectedWilaya: null,
  homePrice: 0,
  officePrice: 0,
  setDeliveryType: (type) => set({ deliveryType: type }),
  setSelectedWilaya: (code) => set({ selectedWilaya: code }),
  setPrices: (home, office) => set({ homePrice: home, officePrice: office }),
}))
