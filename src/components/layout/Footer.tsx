import Link from "next/link"
import { Package, Phone, MapPin, Globe, Camera, Music2 } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-[#1A1A1A] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Package className="h-6 w-6 text-[#D4A843]" />
              <span className="text-xl font-bold">
                دار <span className="text-[#D4A843]">البهجة</span>
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              كل ما يحتاجه بيتك — بجودة وأناقة. نقدم لكم أفضل الأواني المنزلية والمستلزمات بأفضل الأسعار.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-[#D4A843]">روابط سريعة</h3>
            <ul className="space-y-2">
              <li><Link href="/products" className="text-gray-400 hover:text-white text-sm transition-colors">جميع المنتجات</Link></li>
              <li><Link href="/products?category=أواني-الطبخ" className="text-gray-400 hover:text-white text-sm transition-colors">أواني الطبخ</Link></li>
              <li><Link href="/products?category=أدوات-المطبخ" className="text-gray-400 hover:text-white text-sm transition-colors">أدوات المطبخ</Link></li>
              <li><Link href="/products?category=الديكور" className="text-gray-400 hover:text-white text-sm transition-colors">الديكور</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-[#D4A843]">معلومات الاتصال</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-gray-400 text-sm">
                <Phone className="h-4 w-4 text-[#D4A843]" />
                <span dir="ltr">+213 XXX XX XX XX</span>
              </li>
              <li className="flex items-center gap-2 text-gray-400 text-sm">
                <MapPin className="h-4 w-4 text-[#D4A843]" />
                <span>عنابة، الجزائر</span>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-[#D4A843]">تابعنا على</h3>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#C4622D] transition-colors">
                <Globe className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#C4622D] transition-colors">
                <Camera className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#C4622D] transition-colors">
                <Music2 className="h-5 w-5" />
              </a>
            </div>
            <div className="mt-4 text-gray-400 text-xs">
              <p className="mb-1">🛵 التوصيل عبر: زر إكسبريس | يالا ليفري</p>
              <p>💰 الدفع عند الاستلام</p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-8 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} دار البهجة — جميع الحقوق محفوظة</p>
        </div>
      </div>
    </footer>
  )
}
