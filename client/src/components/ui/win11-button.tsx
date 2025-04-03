import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Win11ButtonProps extends React.ComponentProps<typeof Button> {
  children: React.ReactNode;
}

export function Win11Button({ className, children, ...props }: Win11ButtonProps) {
  return (
    <Button 
      className={cn(
        "transition-all ease-in-out duration-200 hover:translate-y-[-1px] active:translate-y-0",
        className
      )}
      {...props}
    >
      {children}
    </Button>
  );
}
