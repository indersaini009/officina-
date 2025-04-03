import { PageHeader } from "@/components/page-header";
import { RequestForm } from "@/components/request-form";
import { Win11Card, CardContent } from "@/components/ui/win11-card";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NewRequest() {
  return (
    <div className="container mx-auto">
      <PageHeader 
        title="Crea Nuova Richiesta" 
        subtitle="Compila il modulo per inviare una richiesta di verniciatura"
      />
      
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Dettagli Richiesta</h3>
        <Button variant="ghost" className="text-sm text-primary flex items-center">
          <AlertCircle className="h-4 w-4 mr-1" /> Guida alla creazione
        </Button>
      </div>
      
      <Win11Card>
        <CardContent className="p-6">
          <RequestForm />
        </CardContent>
      </Win11Card>
    </div>
  );
}
