import type { Metadata } from "next"
import "./globals.css"
import { Tajawal, Playfair_Display } from "next/font/google"
import { Toaster } from "sonner"

const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "700", "800"],
  variable: "--font-tajawal",
})

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-playfair",
})

export const metadata: Metadata = {
  title: "بيت الأناقة | متجر الأواني المنزلية",
  description: "كل ما يحتاجه بيتك — بجودة وأناقة",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${tajawal.variable} ${playfair.variable}`}
    >
      <body className="min-h-screen bg-[#FAF7F2] text-[#1A1A1A] font-sans antialiased">
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  )
}
