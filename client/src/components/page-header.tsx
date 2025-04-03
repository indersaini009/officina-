import { Win11Button } from "@/components/ui/win11-button";
import { Link } from "wouter";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: {
    label: string;
    href: string;
    icon?: React.ReactNode;
  };
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">{title}</h2>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      
      {action && (
        <Link href={action.href}>
          <Win11Button className="mt-2 md:mt-0 flex items-center">
            {action.icon}
            <span>{action.label}</span>
          </Win11Button>
        </Link>
      )}
    </div>
  );
}
