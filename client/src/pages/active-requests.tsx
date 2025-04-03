import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/page-header";
import { Win11Card, CardContent } from "@/components/ui/win11-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { PriorityBadge } from "@/components/ui/priority-badge";
import { ColorCircle } from "@/components/ui/color-circle";
import { Progress } from "@/components/ui/progress";
import { Win11Button } from "@/components/ui/win11-button";
import { getColorHex, formatDate, formatPartType } from "@/lib/utils";
import { Link } from "wouter";
import { Clock, Eye } from "lucide-react";

export default function ActiveRequests() {
  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['/api/requests'],
    select: (data) => data.filter((req: any) => 
      req.status === 'processing' || req.status === 'waiting'
    ),
  });

  const getProgressValue = (status: string, createdDate: string) => {
    if (status === 'processing') {
      const created = new Date(createdDate);
      const now = new Date();
      const differenceInDays = Math.floor((now.getTime() - created.getTime()) / (1000 * 3600 * 24));
      
      // Assuming a request takes maximum 5 days to complete
      return Math.min(Math.max(differenceInDays * 20, 10), 90);
    } else if (status === 'waiting') {
      return 5;
    }
    return 0;
  };

  return (
    <div className="container mx-auto">
      <PageHeader 
        title="Richieste in Corso" 
        subtitle="Monitora lo stato delle richieste di verniciatura attive"
      />
      
      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Caricamento richieste in corso...</p>
          </div>
        ) : requests.length === 0 ? (
          <Win11Card>
            <CardContent className="p-8 text-center">
              <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Nessuna richiesta attiva</h3>
              <p className="text-muted-foreground mb-4">Non ci sono richieste in lavorazione o in attesa al momento.</p>
              <Link href="/new-request">
                <Win11Button>Crea nuova richiesta</Win11Button>
              </Link>
            </CardContent>
          </Win11Card>
        ) : (
          requests.map((request: any) => (
            <Win11Card key={request.id}>
              <CardContent className="p-0">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                    <div className="flex items-center mb-2 md:mb-0">
                      <h3 className="text-lg font-semibold mr-3">{request.requestCode}</h3>
                      <StatusBadge status={request.status} className="mr-2" />
                      <PriorityBadge priority={request.priority} />
                    </div>
                    <div className="flex items-center">
                      <p className="text-sm text-muted-foreground mr-2">Richiesto il {formatDate(request.createdAt)}</p>
                      <Link href={`/request/${request.id}`}>
                        <Win11Button size="sm" variant="outline" className="flex items-center">
                          <Eye className="h-4 w-4 mr-1" /> Dettagli
                        </Win11Button>
                      </Link>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium mb-1">Ricambio</p>
                      <p className="text-muted-foreground">{formatPartType(request.partType)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">Modello</p>
                      <p className="text-muted-foreground">{request.vehicleModel}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">Colore</p>
                      <div className="flex items-center">
                        <ColorCircle colorHex={getColorHex(request.color)} className="mr-2" />
                        <p className="text-muted-foreground">{request.color}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-muted/20">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium">Stato avanzamento</p>
                    <p className="text-sm text-muted-foreground">
                      {request.status === 'processing' ? 'In lavorazione' : 'In attesa di elaborazione'}
                    </p>
                  </div>
                  <Progress value={getProgressValue(request.status, request.createdAt)} className="h-2" />
                </div>
              </CardContent>
            </Win11Card>
          ))
        )}
      </div>
    </div>
  );
}
