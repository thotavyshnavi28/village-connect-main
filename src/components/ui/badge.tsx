import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        submitted: "border-transparent bg-status-submitted/15 text-status-submitted",
        assigned: "border-transparent bg-status-assigned/15 text-status-assigned",
        "in-progress": "border-transparent bg-status-in-progress/15 text-status-in-progress",
        resolved: "border-transparent bg-status-resolved/15 text-status-resolved",
        closed: "border-transparent bg-status-closed/15 text-status-closed",
        rejected: "border-transparent bg-status-rejected/15 text-status-rejected",
        low: "border-transparent bg-priority-low/15 text-priority-low",
        medium: "border-transparent bg-priority-medium/15 text-priority-medium",
        high: "border-transparent bg-priority-high/15 text-priority-high",
        urgent: "border-transparent bg-priority-urgent/15 text-priority-urgent animate-pulse",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
