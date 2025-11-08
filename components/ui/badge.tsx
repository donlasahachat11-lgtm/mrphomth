import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        success: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300",
        warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300",
        error: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300",
        info: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        purple: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300",
        gray: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
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
