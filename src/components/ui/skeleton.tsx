import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-[#E0D5C5]/50", className)}
      {...props}
    />
  )
}

export { Skeleton }
