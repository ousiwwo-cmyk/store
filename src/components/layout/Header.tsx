"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { ShoppingCart, Menu, X, Search, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCartStore } from "@/store/cart"
import { CartDrawer } from "@/components/cart/CartDrawer"
import { fireSearch, usePageView } from "@/components/layout/PixelEvents"

export function Header() {
  usePageView()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const itemCount = useCartStore((s) => s.getItemCount())

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      fireSearch(searchQuery.trim())
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`
    }
  }

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-md shadow-sm"
            : "bg-white"
        }`}
      >
        {/* Announcement Bar */}
        <div className="bg-[#C4622D] text-white text-center py-1.5 text-xs sm:text-sm font-medium">
          🚚 توصيل مجاني للطلبات فوق 5000 دج | الدفع عند الاستلام
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Mobile Menu Button */}
            <button
              className="sm:hidden p-2 text-[#1A1A1A] hover:text-[#C4622D] transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <Package className="h-6 w-6 text-[#C4622D]" />
              <span className="text-xl font-bold text-[#1A1A1A]">
                دار <span className="text-[#C4622D]">البهجة</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden sm:flex items-center gap-6">
              <Link href="/" className="text-sm font-medium text-[#1A1A1A] hover:text-[#C4622D] transition-colors">
                الرئيسية
              </Link>
              <Link href="/products" className="text-sm font-medium text-[#1A1A1A] hover:text-[#C4622D] transition-colors">
                المنتجات
              </Link>
              <Link href="/products?category=أواني-الطبخ" className="text-sm font-medium text-[#1A1A1A] hover:text-[#C4622D] transition-colors">
                أواني الطبخ
              </Link>
              <Link href="/products?category=أدوات-المطبخ" className="text-sm font-medium text-[#1A1A1A] hover:text-[#C4622D] transition-colors">
                أدوات المطبخ
              </Link>
            </nav>

            {/* Left Actions */}
            <div className="flex items-center gap-3">
              {/* Search */}
              <form onSubmit={handleSearch} className="hidden md:flex items-center">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="بحث..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-40 lg:w-56 pr-9 h-9 text-sm rounded-full bg-[#FAF7F2] border-[#E0D5C5]"
                  />
                </div>
              </form>

              {/* Cart Button */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-[#1A1A1A] hover:text-[#C4622D] transition-colors"
              >
                <ShoppingCart size={22} />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#C4622D] text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="sm:hidden border-t border-[#E0D5C5] bg-white animate-fadeIn">
            <div className="px-4 py-3 space-y-2">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="بحث..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pr-9 rounded-full bg-[#FAF7F2]"
                  />
                </div>
              </form>
              <Link href="/" className="block py-2 text-sm font-medium hover:text-[#C4622D]" onClick={() => setIsMenuOpen(false)}>
                الرئيسية
              </Link>
              <Link href="/products" className="block py-2 text-sm font-medium hover:text-[#C4622D]" onClick={() => setIsMenuOpen(false)}>
                جميع المنتجات
              </Link>
              <Link href="/products?category=أواني-الطبخ" className="block py-2 text-sm font-medium hover:text-[#C4622D]" onClick={() => setIsMenuOpen(false)}>
                أواني الطبخ
              </Link>
              <Link href="/products?category=أدوات-المطبخ" className="block py-2 text-sm font-medium hover:text-[#C4622D]" onClick={() => setIsMenuOpen(false)}>
                أدوات المطبخ
              </Link>
              <Link href="/products?category=غرفة-النوم" className="block py-2 text-sm font-medium hover:text-[#C4622D]" onClick={() => setIsMenuOpen(false)}>
                غرفة النوم
              </Link>
              <Link href="/products?category=الحمام" className="block py-2 text-sm font-medium hover:text-[#C4622D]" onClick={() => setIsMenuOpen(false)}>
                الحمام
              </Link>
            </div>
          </div>
        )}
      </header>

      <CartDrawer open={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  )
}
