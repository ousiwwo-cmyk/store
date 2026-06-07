export interface Category {
  id: string
  name: string
  slug: string
  icon: string
}

export const categories: Category[] = [
  {
    id: "cooking",
    name: "أواني الطبخ",
    slug: "أواني-الطبخ",
    icon: "🍳",
  },
  {
    id: "kitchen-tools",
    name: "أدوات المطبخ",
    slug: "أدوات-المطبخ",
    icon: "🔪",
  },
  {
    id: "bedroom",
    name: "غرفة النوم",
    slug: "غرفة-النوم",
    icon: "🛏️",
  },
  {
    id: "bathroom",
    name: "الحمام",
    slug: "الحمام",
    icon: "🚿",
  },
  {
    id: "decor",
    name: "الديكور",
    slug: "الديكور",
    icon: "🖼️",
  },
  {
    id: "cleaning",
    name: "التنظيف",
    slug: "التنظيف",
    icon: "🧹",
  },
]
