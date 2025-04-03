import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Win11CardProps {
  className?: string;
  children: React.ReactNode;
}

export function Win11Card({ className, children }: Win11CardProps) {
  return (
    <Card 
      className={cn(
        "transition-all ease-in-out duration-300 shadow-md backdrop-blur-md bg-opacity-85 bg-card border border-gray-100 rounded-lg hover:shadow-lg",
        className
      )}
    >
      {children}
    </Card>
  );
}

export { CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
