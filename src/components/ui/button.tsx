import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-medium transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 relative overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-purple-500/80 to-pink-500/80 text-white backdrop-blur-md border border-white/20 shadow-lg hover:from-purple-600/90 hover:to-pink-600/90 hover:shadow-xl hover:border-white/30",
        destructive:
          "bg-red-500/20 text-red-100 backdrop-blur-md border border-red-500/30 hover:bg-red-500/30 hover:border-red-500/50 shadow-lg",
        outline:
          "border border-white/20 bg-white/10 backdrop-blur-md hover:bg-white/20 hover:border-white/30 text-gray-800 dark:text-white shadow-lg",
        secondary:
          "bg-white/20 text-gray-800 dark:text-white backdrop-blur-md border border-white/30 hover:bg-white/30 hover:border-white/40 shadow-lg",
        ghost: "hover:bg-white/10 hover:backdrop-blur-md text-gray-800 dark:text-white",
        link: "text-purple-600 dark:text-purple-400 underline-offset-4 hover:underline hover:text-purple-700 dark:hover:text-purple-300",
        glass: "bg-white/10 backdrop-blur-xl border border-white/20 text-white hover:bg-white/20 hover:border-white/30 shadow-lg",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 rounded-xl px-4 text-xs",
        lg: "h-12 rounded-2xl px-8 text-base",
        icon: "h-10 w-10 rounded-full",
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
