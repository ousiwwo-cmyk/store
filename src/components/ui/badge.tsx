import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-[#C4622D] text-white",
        secondary: "bg-[#FAF7F2] text-[#1A1A1A] border border-[#E0D5C5]",
        destructive: "bg-red-100 text-red-700",
        success: "bg-green-100 text-green-700",
        warning: "bg-yellow-100 text-yellow-800",
        info: "bg-blue-100 text-blue-700",
        gold: "bg-[#D4A843] text-white",
        outline: "border border-[#E0D5C5] text-[#1A1A1A]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
