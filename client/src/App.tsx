import { useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import Dashboard from "@/pages/dashboard";
import NewRequest from "@/pages/new-request";
import ActiveRequests from "@/pages/active-requests";
import RequestHistory from "@/pages/request-history";
import RequestDetails from "@/pages/request-details";
import Impostazioni from "@/pages/impostazioni";
import NotFound from "@/pages/not-found";

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen flex flex-col bg-neutral-lightest">
        <Header onSidebarToggle={toggleSidebar} />
        
        <div className="flex flex-1 overflow-hidden">
          <Sidebar collapsed={sidebarCollapsed} />
          
          <main className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            <Switch>
              <Route path="/" component={Dashboard} />
              <Route path="/new-request" component={NewRequest} />
              <Route path="/active-requests" component={ActiveRequests} />
              <Route path="/request-history" component={RequestHistory} />
              <Route path="/request/:id" component={RequestDetails} />
              <Route path="/impostazioni" component={Impostazioni} />
              <Route path="/archive" component={RequestHistory} />
              <Route path="/reports" component={RequestHistory} />
              <Route component={NotFound} />
            </Switch>
            
            <footer className="mt-8 text-center text-sm text-gray-500 pb-4">
              © 2025 Eurosystems Gestione Verniciatura - Tutti i diritti riservati
            </footer>
          </main>
        </div>
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
