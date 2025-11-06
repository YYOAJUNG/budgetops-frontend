'use client'

import * as React from "react"

import { cn } from "@/lib/utils"

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
  variant?: 'default' | 'warning' | 'danger'
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, variant = 'default', ...props }, ref) => (
    <div
      ref={ref}
      className={cn("relative h-2 w-full overflow-hidden rounded-full bg-slate-200", className)}
      {...props}
    >
      <div
        className={cn(
          'h-full w-full flex-1 rounded-full transition-all',
          variant === 'danger'
            ? 'bg-red-400'
            : variant === 'warning'
              ? 'bg-gradient-to-r from-orange-300 to-red-300'
             : 'bg-sky-400'
        )}
        style={{ transform: `translateX(-${100 - Math.min(100, value)}%)` }}
      />
    </div>
  )
)
Progress.displayName = "Progress"

export { Progress }

