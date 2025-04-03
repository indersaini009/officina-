import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/page-header";
import { Win11Card, CardContent, CardHeader, CardTitle } from "@/components/ui/win11-card";
import { Win11Button } from "@/components/ui/win11-button";
import { StatusBadge } from "@/components/ui/status-badge";
import { PriorityBadge } from "@/components/ui/priority-badge";
import { ColorCircle } from "@/components/ui/color-circle";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { getColorHex, formatDate, formatDateTime, getFinishTypeText } from "@/lib/utils";
import { ArrowLeft, Clock, Check, X, AlertTriangle, HistoryIcon } from "lucide-react";

export default function RequestDetails() {
  const [, params] = useRoute("/request/:id");
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  
  const requestId = params?.id ? parseInt(params.id) : 0;
  
  const { data: request, isLoading } = useQuery({
    queryKey: [`/api/requests/${requestId}`],
    enabled: !!requestId,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ status, rejectionReason }: { status: string, rejectionReason?: string }) => {
      const response = await apiRequest("PATCH", `/api/requests/${requestId}/status`, {
        status,
        rejectionReason,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/requests/${requestId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/requests'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      
      toast({
        title: "Stato aggiornato",
        description: "Lo stato della richiesta è stato aggiornato con successo",
      });
      
      if (rejectDialogOpen) {
        setRejectDialogOpen(false);
      }
    },
    onError: (error) => {
      toast({
        title: "Errore",
        description: `Non è stato possibile aggiornare lo stato: ${error}`,
        variant: "destructive",
      });
    },
  });

  const handleUpdateStatus = (status: string) => {
    if (status === 'rejected') {
      setRejectDialogOpen(true);
    } else {
      updateStatusMutation.mutate({ status });
    }
  };

  const handleRejectConfirm = () => {
    updateStatusMutation.mutate({ 
      status: 'rejected', 
      rejectionReason: rejectionReason || "Nessun motivo specificato" 
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Caricamento dettagli richiesta...</p>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="container mx-auto py-8">
        <Win11Card>
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto text-destructive mb-4" />
            <h3 className="text-xl font-semibold mb-2">Richiesta non trovata</h3>
            <p className="text-muted-foreground mb-4">La richiesta che stai cercando non esiste o è stata rimossa.</p>
            <Win11Button onClick={() => navigate("/")}>Torna alla dashboard</Win11Button>
          </CardContent>
        </Win11Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <PageHeader 
        title={`Richiesta ${request.requestCode}`} 
        subtitle={`Stato: ${request.status}`}
        action={{ 
          label: "Torna indietro", 
          href: "/",
          icon: <ArrowLeft className="mr-2 h-4 w-4" />
        }}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Win11Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <CardTitle>Dettagli Richiesta</CardTitle>
                <div className="flex items-center space-x-2 mt-2 md:mt-0">
                  <StatusBadge status={request.status} />
                  <PriorityBadge priority={request.priority} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium mb-4">Informazioni Ricambio</h4>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Descrizione Ricambio</p>
                      <p className="font-medium">{request.partDescription}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-muted-foreground">Codice Ricambio</p>
                      <p className="font-medium">{request.partCode}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-muted-foreground">Quantità</p>
                      <p className="font-medium">{request.quantity}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-4">Dettagli Verniciatura</h4>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Colore Ricambio</p>
                      <div className="flex items-center">
                        <ColorCircle 
                          colorHex={request.partColor ? getColorHex(request.partColor) : "#6b7280"} 
                          size="md" 
                          className="mr-2" 
                        />
                        <p className="font-medium">{request.partColor || "Non specificato"}</p>
                      </div>
                    </div>
                    
                    {request.notes && (
                      <div>
                        <p className="text-sm text-muted-foreground">Note</p>
                        <p className="font-medium">{request.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {request.rejectionReason && (
                <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-md">
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-red-800">Motivo del rifiuto</h4>
                      <p className="text-sm text-red-700 mt-1">{request.rejectionReason}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {request.status !== 'completed' && request.status !== 'rejected' && (
                <div className="mt-6 border-t border-gray-100 pt-6 flex flex-wrap justify-end space-x-3">
                  {request.status === 'pending' && (
                    <>
                      <Win11Button
                        variant="outline"
                        onClick={() => handleUpdateStatus('rejected')}
                        className="mb-2 sm:mb-0"
                        disabled={updateStatusMutation.isPending}
                      >
                        <X className="mr-2 h-4 w-4" />
                        Rifiuta
                      </Win11Button>
                      <Win11Button
                        variant="outline"
                        onClick={() => handleUpdateStatus('waiting')}
                        className="mb-2 sm:mb-0"
                        disabled={updateStatusMutation.isPending}
                      >
                        <Clock className="mr-2 h-4 w-4" />
                        Metti in Attesa
                      </Win11Button>
                      <Win11Button
                        onClick={() => handleUpdateStatus('processing')}
                        disabled={updateStatusMutation.isPending}
                      >
                        <Check className="mr-2 h-4 w-4" />
                        Avvia Lavorazione
                      </Win11Button>
                    </>
                  )}
                  
                  {request.status === 'processing' && (
                    <Win11Button
                      onClick={() => handleUpdateStatus('completed')}
                      disabled={updateStatusMutation.isPending}
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Segna come Completata
                    </Win11Button>
                  )}
                  
                  {request.status === 'waiting' && (
                    <Win11Button
                      onClick={() => handleUpdateStatus('processing')}
                      disabled={updateStatusMutation.isPending}
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Avvia Lavorazione
                    </Win11Button>
                  )}
                </div>
              )}
            </CardContent>
          </Win11Card>
        </div>
        
        <div>
          <Win11Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent className="pb-6">
              <div className="space-y-6">
                <div className="relative pl-6 pb-6 border-l border-gray-200">
                  <div className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-primary" />
                  <div>
                    <p className="font-medium">Richiesta creata</p>
                    <p className="text-sm text-muted-foreground mt-1">{formatDateTime(request.createdAt)}</p>
                  </div>
                </div>
                
                {request.status !== 'pending' && (
                  <div className="relative pl-6 pb-6 border-l border-gray-200">
                    <div className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-blue-500" />
                    <div>
                      <p className="font-medium">
                        {request.status === 'waiting' 
                          ? 'Messa in attesa' 
                          : 'Avviata lavorazione'}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">{formatDateTime(request.updatedAt)}</p>
                      {request.plannedDate && (
                        <p className="text-sm text-orange-500 mt-1 flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          Completamento previsto: {formatDate(request.plannedDate)}
                        </p>
                      )}
                    </div>
                  </div>
                )}
                
                {request.status === 'completed' && (
                  <div className="relative pl-6 pb-6 border-l border-gray-200">
                    <div className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-green-500" />
                    <div>
                      <p className="font-medium">Completata</p>
                      <p className="text-sm text-muted-foreground mt-1">{formatDateTime(request.completedAt || request.updatedAt)}</p>
                    </div>
                  </div>
                )}
                
                {request.status === 'rejected' && (
                  <div className="relative pl-6">
                    <div className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-red-500" />
                    <div>
                      <p className="font-medium">Rifiutata</p>
                      <p className="text-sm text-muted-foreground mt-1">{formatDateTime(request.updatedAt)}</p>
                    </div>
                  </div>
                )}
              </div>
              
              <Separator className="my-6" />
              
              <div>
                <h4 className="text-sm font-medium flex items-center mb-4">
                  <HistoryIcon className="mr-2 h-4 w-4" /> Informazioni Aggiuntive
                </h4>
                
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">ID Richiesta</p>
                    <p className="font-medium">{request.requestCode}</p>
                  </div>
                  
                  <div>
                    <p className="text-muted-foreground">Data Richiesta</p>
                    <p className="font-medium">{formatDate(request.createdAt)}</p>
                  </div>
                  
                  <div>
                    <p className="text-muted-foreground">Ultimo Aggiornamento</p>
                    <p className="font-medium">{formatDate(request.updatedAt)}</p>
                  </div>
                  
                  {request.plannedDate && (
                    <div>
                      <p className="text-muted-foreground">Data Pianificata</p>
                      <p className="font-medium">{formatDate(request.plannedDate)}</p>
                    </div>
                  )}
                  
                  <div>
                    <p className="text-muted-foreground">Reparto Richiedente</p>
                    <p className="font-medium">{request.workstation}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Win11Card>
        </div>
      </div>
      
      <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rifiuta Richiesta</AlertDialogTitle>
            <AlertDialogDescription>
              Inserisci il motivo del rifiuto. Questo verrà comunicato al richiedente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="my-2">
            <Label htmlFor="rejectionReason">Motivo del rifiuto</Label>
            <Textarea
              id="rejectionReason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Specificare il motivo del rifiuto..."
              className="mt-1"
            />
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleRejectConfirm}
              disabled={updateStatusMutation.isPending}
            >
              Conferma
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
