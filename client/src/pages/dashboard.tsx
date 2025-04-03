import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { StatusCards } from "@/components/status-cards";
import { RequestsTable } from "@/components/requests-table";
import { Plus } from "lucide-react";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("recent");

  return (
    <div className="container mx-auto">
      <PageHeader 
        title="Dashboard" 
        subtitle="Panoramica delle richieste di verniciatura"
        action={{ 
          label: "Nuova Richiesta", 
          href: "/new-request",
          icon: <Plus className="mr-2 h-4 w-4" />
        }}
      />

      <StatusCards />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="border-b border-gray-200 w-full justify-start rounded-none bg-transparent p-0">
          <TabsTrigger 
            value="recent" 
            className="py-2 px-4 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none data-[state=active]:bg-transparent"
          >
            Richieste Recenti
          </TabsTrigger>
          <TabsTrigger 
            value="pending" 
            className="py-2 px-4 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none data-[state=active]:bg-transparent"
          >
            Richieste da Approvare
          </TabsTrigger>
          <TabsTrigger 
            value="completed" 
            className="py-2 px-4 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none data-[state=active]:bg-transparent"
          >
            Completate Recentemente
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="recent" className="mt-4">
          <RequestsTable />
        </TabsContent>
        
        <TabsContent value="pending" className="mt-4">
          <RequestsTable status="pending" />
        </TabsContent>
        
        <TabsContent value="completed" className="mt-4">
          <RequestsTable status="completed" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
