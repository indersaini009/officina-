import { cn } from "@/lib/utils";

interface ColorCircleProps extends React.HTMLAttributes<HTMLDivElement> {
  colorHex: string;
  size?: "sm" | "md" | "lg";
}

export function ColorCircle({
  colorHex,
  size = "sm",
  className,
  ...props
}: ColorCircleProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <div
      className={cn(
        sizeClasses[size], 
        "rounded-full inline-block border-2 border-white shadow-sm",
        className
      )}
      style={{ backgroundColor: colorHex }}
      {...props}
    />
  );
}
