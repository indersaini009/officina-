import { useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Win11Button } from "@/components/ui/win11-button";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { User, LogOut, Bell, Settings, UserCog, RefreshCw } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface HeaderProps {
  onSidebarToggle: () => void;
}

export function Header({ onSidebarToggle }: HeaderProps) {
  const { toast } = useToast();
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Fetch user data
  const { data: user } = useQuery({
    queryKey: ['/api/user'],
  });

  // Fetch notifications
  const { data: notifications = [], refetch: refetchNotifications } = useQuery({
    queryKey: ['/api/notifications'],
  });

  const unreadNotifications = notifications.filter((notification: any) => !notification.isRead);

  const handleMarkAllAsRead = async () => {
    try {
      await apiRequest('POST', '/api/notifications/read-all', { userId: 1 });
      await refetchNotifications();
      toast({
        title: "Notifiche",
        description: "Tutte le notifiche sono state segnate come lette",
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile aggiornare le notifiche",
        variant: "destructive",
      });
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await apiRequest('POST', `/api/notifications/read/${id}`);
      await refetchNotifications();
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile aggiornare la notifica",
        variant: "destructive",
      });
    }
  };

  const getNotificationTypeIcon = (type: string) => {
    switch (type) {
      case "success": return "bg-green-500";
      case "error": return "bg-red-500";
      case "warning": return "bg-yellow-500";
      default: return "bg-blue-500";
    }
  };

  const formatNotificationTime = (date: string) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInMs = now.getTime() - notificationDate.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 60) {
      return `${diffInMinutes} minuti fa`;
    } else if (diffInHours < 24) {
      return `${diffInHours} ore fa`;
    } else if (diffInDays < 2) {
      return "Ieri";
    } else {
      return notificationDate.toLocaleDateString();
    }
  };

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
              refetchNotifications();
            }, 1000);
          }}
          className="mr-1"
        >
          <RefreshCw className="h-5 w-5" />
        </Win11Button>
        <DropdownMenu open={notificationsOpen} onOpenChange={setNotificationsOpen}>
          <DropdownMenuTrigger asChild>
            <Win11Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unreadNotifications.length > 0 && (
                <Badge className="absolute top-0 right-0 h-2 w-2 p-0 bg-destructive" />
              )}
            </Win11Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-96 max-h-[70vh] overflow-auto">
            <DropdownMenuLabel className="flex justify-between items-center">
              <span className="text-base font-semibold">Notifiche</span>
              <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead}>
                <span className="text-xs text-primary font-medium">Segna tutti come letti</span>
              </Button>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.length === 0 ? (
              <div className="p-6 text-center">
                <Bell className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-25" />
                <p className="text-sm text-muted-foreground">Nessuna notifica</p>
              </div>
            ) : (
              notifications.map((notification: any) => (
                <div key={notification.id} className="px-4 py-3 hover:bg-muted/50 cursor-pointer border-b border-gray-100 last:border-0">
                  <div className="flex items-start" onClick={() => handleMarkAsRead(notification.id)}>
                    <div className={`h-3 w-3 mt-1.5 ${getNotificationTypeIcon(notification.type)} rounded-full shrink-0 mr-3`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium mb-1 break-words">{notification.message}</p>
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-gray-400">{formatNotificationTime(notification.createdAt)}</p>
                        {!notification.isRead && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">Nuovo</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
            <DropdownMenuSeparator />
            <div className="p-3 text-center">
              <Win11Button variant="outline" size="sm">
                <span className="text-sm">Visualizza cronologia completa</span>
              </Win11Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
        
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
