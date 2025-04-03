import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const statusBadgeVariants = cva(
  "px-2 inline-flex text-xs leading-5 font-semibold rounded-full",
  {
    variants: {
      status: {
        pending: "bg-yellow-100 text-yellow-800",
        processing: "bg-blue-100 text-blue-800",
        completed: "bg-green-100 text-green-800",
        rejected: "bg-red-100 text-red-800",
        waiting: "bg-yellow-100 text-yellow-800",
      },
    },
    defaultVariants: {
      status: "pending",
    },
  }
);

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusBadgeVariants> {
  status: "pending" | "processing" | "completed" | "rejected" | "waiting";
}

export function StatusBadge({
  className,
  status,
  ...props
}: StatusBadgeProps) {
  const statusTexts = {
    pending: "In attesa",
    processing: "In lavorazione",
    completed: "Completata",
    rejected: "Rifiutata",
    waiting: "In attesa",
  };

  return (
    <span
      className={cn(statusBadgeVariants({ status }), className)}
      {...props}
    >
      {statusTexts[status]}
    </span>
  );
}
