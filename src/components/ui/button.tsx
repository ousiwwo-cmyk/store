import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-[#C4622D] text-white hover:bg-[#A85222] shadow-sm hover:shadow-md",
        destructive: "bg-red-600 text-white hover:bg-red-700",
        outline: "border-2 border-[#C4622D] text-[#C4622D] hover:bg-[#C4622D] hover:text-white",
        secondary: "bg-[#FAF7F2] text-[#1A1A1A] hover:bg-[#F0EBE0] border border-[#E0D5C5]",
        ghost: "text-[#1A1A1A] hover:bg-[#FAF7F2]",
        link: "text-[#C4622D] underline-offset-4 hover:underline",
        gold: "bg-[#D4A843] text-white hover:bg-[#C49630] shadow-sm hover:shadow-md",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-9 rounded-md px-3 text-xs",
        lg: "h-12 rounded-lg px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
