import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("ar-DZ", {
    style: "decimal",
    maximumFractionDigits: 0,
  }).format(price) + " د.ج"
}
