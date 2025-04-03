import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const priorityBadgeVariants = cva(
  "px-2 inline-flex text-xs leading-5 font-semibold rounded-full",
  {
    variants: {
      priority: {
        normal: "bg-gray-100 text-gray-800",
        medium: "bg-yellow-100 text-yellow-800",
        high: "bg-red-100 text-red-800",
        urgent: "bg-red-600 text-white",
      },
    },
    defaultVariants: {
      priority: "normal",
    },
  }
);

export interface PriorityBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof priorityBadgeVariants> {
  priority: "normal" | "medium" | "high" | "urgent";
}

export function PriorityBadge({
  className,
  priority,
  ...props
}: PriorityBadgeProps) {
  const priorityTexts = {
    normal: "Normale",
    medium: "Media",
    high: "Alta",
    urgent: "Urgente",
  };

  return (
    <span
      className={cn(priorityBadgeVariants({ priority }), className)}
      {...props}
    >
      {priorityTexts[priority]}
    </span>
  );
}
