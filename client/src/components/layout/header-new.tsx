import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Win11Button } from "@/components/ui/win11-button";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { User, LogOut, Settings, UserCog, RefreshCw } from "lucide-react";

interface HeaderProps {
  onSidebarToggle: () => void;
}

export function Header({ onSidebarToggle }: HeaderProps) {
  const { toast } = useToast();

  // Fetch user data
  const { data: user } = useQuery({
    queryKey: ['/api/user'],
  });

  return (
    <header className="flex items-center justify-between p-3 border-b border-gray-200 bg-background/85 backdrop-blur-md z-10">
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onSidebarToggle}
          className="mr-4"
        >
          <User className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold text-foreground">Eurosystems Gestione Verniciatura</h1>
      </div>
      
      <div className="flex items-center space-x-2">
        <Win11Button 
          variant="ghost" 
          size="icon" 
          onClick={() => {
            toast({
              title: "Sincronizzazione",
              description: "Sincronizzazione del database in corso...",
            });
            
            // Simuliamo una sincronizzazione del database
            setTimeout(() => {
              toast({
                title: "Sincronizzazione",
                description: "Database sincronizzato con successo",
              });
            }, 1000);
          }}
          className="mr-1"
        >
          <RefreshCw className="h-5 w-5" />
        </Win11Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Win11Button variant="ghost" className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={`https://ui-avatars.com/api/?name=${localStorage.getItem('workstation') || 'Reparto'}&background=0D8ABC&color=fff`} />
                <AvatarFallback>{(localStorage.getItem('workstation') || 'R')[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="font-medium text-sm hidden md:inline">{localStorage.getItem('workstation') || 'Reparto'}</span>
            </Win11Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              <p className="font-medium text-sm">{localStorage.getItem('workstation') || 'Reparto'}</p>
              <p className="text-xs text-gray-500">Reparto richiedente</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <UserCog className="mr-2 h-4 w-4" /> Profilo
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" /> Impostazioni
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" /> Disconnetti
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}