import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground transition-all duration-200",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive:
          "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
        soft: "bg-primary/10 border-primary/20 text-primary dark:border-primary/30 [&>svg]:text-primary",
        warning: "bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-400 dark:border-amber-400/30 [&>svg]:text-amber-500",
        error: "bg-destructive/10 border-destructive/20 text-destructive dark:border-destructive/30 [&>svg]:text-destructive",
        info: "bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-400 dark:border-blue-400/30 [&>svg]:text-blue-500",
        success: "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400 dark:border-emerald-400/30 [&>svg]:text-emerald-500",
        accent: "bg-accent/10 border-accent/20 text-accent dark:border-accent/30 [&>svg]:text-accent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
))
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }
