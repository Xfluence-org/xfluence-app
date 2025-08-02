
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-all duration-300 backdrop-blur-md",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-100 border border-purple-500/30 hover:from-purple-500/30 hover:to-pink-500/30 hover:border-purple-500/50",
        secondary:
          "bg-white/20 text-gray-800 dark:text-white border border-white/30 hover:bg-white/30 hover:border-white/40",
        destructive:
          "bg-red-500/20 text-red-100 border border-red-500/30 hover:bg-red-500/30 hover:border-red-500/50",
        outline: "bg-transparent border border-white/20 text-gray-800 dark:text-white hover:bg-white/10 hover:border-white/30",
        success:
          "bg-green-500/20 text-green-100 border border-green-500/30 hover:bg-green-500/30 hover:border-green-500/50",
        warning:
          "bg-yellow-500/20 text-yellow-100 border border-yellow-500/30 hover:bg-yellow-500/30 hover:border-yellow-500/50",
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
