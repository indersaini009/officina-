import { useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import * as LucideIcons from "lucide-react";

interface SidebarLink {
  path: string;
  label: string;
  icon: keyof typeof LucideIcons;
}

interface SidebarProps {
  collapsed: boolean;
}

export function Sidebar({ collapsed }: SidebarProps) {
  const [location] = useLocation();
  const [darkMode, setDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const links: SidebarLink[] = [
    { path: "/", label: "Dashboard", icon: "LayoutDashboard" },
    { path: "/new-request", label: "Nuova Richiesta", icon: "PlusCircle" },
    { path: "/active-requests", label: "Richieste in Corso", icon: "Clock" },
    { path: "/request-history", label: "Storico Richieste", icon: "History" },
    { path: "/archive", label: "Archivio", icon: "Archive" },
    { path: "/reports", label: "Report", icon: "FileBarChart" },
  ];

  // Toggle dark mode class on the document element
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    
    if (newDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <aside 
      className={cn(
        "h-full border-r border-gray-200 transition-all duration-300 ease-in-out bg-background/85 backdrop-blur-md",
        collapsed ? "w-0 overflow-hidden" : "w-64"
      )}
    >
      <nav className="py-4 h-full flex flex-col">
        <div className="px-4 mb-4">
          <div className="relative">
            <Input 
              type="text" 
              placeholder="Cerca..." 
              className="w-full pr-8 bg-gray-100 focus:bg-white transition-all"
            />
            <LucideIcons.Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-500" />
          </div>
        </div>
        
        <ul className="space-y-1 px-2 flex-1 overflow-y-auto">
          {links.map((link) => {
            const Icon = LucideIcons[link.icon];
            const isActive = location === link.path;
            
            return (
              <li key={link.path}>
                <Link href={link.path}>
                  <a
                    className={cn(
                      "flex items-center px-4 py-2.5 rounded-lg text-neutral-800 font-medium transition-colors",
                      isActive 
                        ? "bg-primary/10 border-l-[3px] border-l-primary" 
                        : "hover:bg-gray-100"
                    )}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    <span>{link.label}</span>
                  </a>
                </Link>
              </li>
            );
          })}
        </ul>
        
        <div className="mt-auto border-t border-gray-200 pt-2">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="darkModeToggle" className="text-sm font-medium">
                Modalità scura
              </Label>
              <Switch
                id="darkModeToggle"
                checked={darkMode}
                onCheckedChange={toggleDarkMode}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="notificationToggle" className="text-sm font-medium">
                Notifiche
              </Label>
              <Switch
                id="notificationToggle"
                checked={notificationsEnabled}
                onCheckedChange={setNotificationsEnabled}
              />
            </div>
          </div>
          <div className="px-4 py-2 text-xs text-gray-500">
            <p>© 2023 Sistema Richieste Verniciatura</p>
            <p>Versione 1.0.5</p>
          </div>
        </div>
      </nav>
    </aside>
  );
}
