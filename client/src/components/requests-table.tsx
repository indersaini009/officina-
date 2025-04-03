import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationEllipsis, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ColorCircle } from "@/components/ui/color-circle";
import { StatusBadge } from "@/components/ui/status-badge";
import { PriorityBadge } from "@/components/ui/priority-badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Eye, 
  MoreHorizontal, 
  Play, 
  Clock, 
  X, 
  CheckCircle 
} from "lucide-react";

interface RequestsTableProps {
  status?: string;
  userId?: number;
}

const getColorHex = (colorName: string): string => {
  const colorMap: Record<string, string> = {
    "Nero": "#000000",
    "Bianco": "#ffffff",
    "Grigio": "#6b7280",
    "Grigio Titanio": "#909090",
    "Rosso": "#dc2626",
    "Rosso Ferrari": "#ff2800",
    "Blu": "#2563eb",
    "Blu Metallizzato": "#0047ab",
    "Verde": "#16a34a",
    "Verde Militare": "#4b5320",
    "Giallo": "#eab308",
    "Arancione": "#f97316",
    "Viola": "#7c3aed",
    "Rosa": "#ec4899",
  };

  return colorMap[colorName] || "#6b7280";
};

// Format date to Italian format (dd/mm/yyyy)
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
};

export function RequestsTable({ status, userId }: RequestsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['/api/requests', status, userId],
    select: (data) => {
      if (Array.isArray(data)) {
        // Se status è "active", filtra tutte le richieste diverse da "completed"
        if (status === "active") {
          return data.filter((req: any) => req.status !== "completed");
        }
        // Se status è "completed-only", mostra solo le richieste completate
        else if (status === "completed-only") {
          return data.filter((req: any) => req.status === "completed");
        }
      }
      return data;
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, rejectionReason }: { id: number, status: string, rejectionReason?: string }) => {
      const response = await apiRequest("PATCH", `/api/requests/${id}/status`, {
        status,
        rejectionReason,
      });
      return response.json();
    },
    onSuccess: () => {
      // Invalida le cache per aggiornare tutte le viste
      queryClient.invalidateQueries({ queryKey: ['/api/requests'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      
      toast({
        title: "Stato aggiornato",
        description: "Lo stato della richiesta è stato aggiornato con successo",
      });
    },
    onError: (error) => {
      toast({
        title: "Errore",
        description: `Non è stato possibile aggiornare lo stato: ${error}`,
        variant: "destructive",
      });
    },
  });

  const handleStatusChange = (id: number, newStatus: string) => {
    if (newStatus === 'rejected') {
      const reason = prompt("Inserisci il motivo del rifiuto:");
      if (reason === null) return; // L'utente ha annullato
      
      updateStatusMutation.mutate({ 
        id, 
        status: newStatus, 
        rejectionReason: reason || "Nessun motivo specificato" 
      });
    } else {
      updateStatusMutation.mutate({ id, status: newStatus });
    }
  };

  const requestsArray = Array.isArray(requests) ? requests : [];
  const paginatedRequests = requestsArray.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const totalPages = Math.ceil(requestsArray.length / pageSize);

  return (
    <div className="overflow-hidden rounded-lg shadow-sm border border-gray-100 backdrop-blur-md bg-card/85">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">ID</TableHead>
              <TableHead>Ricambio</TableHead>
              <TableHead>Colore</TableHead>
              <TableHead>Data richiesta</TableHead>
              <TableHead>Stato</TableHead>
              <TableHead>Priorità</TableHead>
              <TableHead className="text-right">Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array(5).fill(0).map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : paginatedRequests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Nessuna richiesta trovata
                </TableCell>
              </TableRow>
            ) : (
              paginatedRequests.map((request: any) => (
                <TableRow key={request.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="font-medium">{request.requestCode}</TableCell>
                  <TableCell className="text-muted-foreground">{request.partDescription}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <ColorCircle colorHex={request.partColor ? getColorHex(request.partColor) : "#6b7280"} className="mr-2" />
                      <span>{request.partColor || "Non specificato"}</span>
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(request.createdAt)}</TableCell>
                  <TableCell>
                    <StatusBadge status={request.status as any} />
                  </TableCell>
                  <TableCell>
                    <PriorityBadge priority={request.priority as any} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/request/${request.id}`}>
                      <Button variant="ghost" size="sm" className="text-primary h-8 w-8 p-0">
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">Visualizza</span>
                      </Button>
                    </Link>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-muted-foreground h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Altro</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Azioni</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        
                        {request.status === 'pending' && (
                          <>
                            <DropdownMenuItem onClick={() => handleStatusChange(request.id, 'processing')}>
                              <Play className="mr-2 h-4 w-4" />
                              <span>Avvia lavorazione</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(request.id, 'processing')}>
                              <Play className="mr-2 h-4 w-4" />
                              <span>Avvia lavorazione</span>
                                });
                              }
                            }}>
                              <Clock className="mr-2 h-4 w-4" />
                              <span>Pianifica completamento</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(request.id, 'rejected')}>
                              <X className="mr-2 h-4 w-4" />
                              <span>Rifiuta</span>
                            </DropdownMenuItem>
                          </>
                        )}
                        
                        {request.status === 'processing' && (
                          <DropdownMenuItem onClick={() => handleStatusChange(request.id, 'completed')}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            <span>Completa</span>
                          </DropdownMenuItem>
                        )}
                        
                        {request.status === 'waiting' && (
                          <DropdownMenuItem onClick={() => handleStatusChange(request.id, 'processing')}>
                            <Play className="mr-2 h-4 w-4" />
                            <span>Avvia lavorazione</span>
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {requestsArray.length > 0 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
          <div>
            <p className="text-sm text-muted-foreground">
              Visualizzazione <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> - <span className="font-medium">{Math.min(currentPage * pageSize, requestsArray.length)}</span> di <span className="font-medium">{requestsArray.length}</span> risultati
            </p>
          </div>
          
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) setCurrentPage(currentPage - 1);
                  }}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              
              {Array.from({ length: Math.min(totalPages, 3) }).map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink 
                    href="#" 
                    isActive={i + 1 === currentPage}
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage(i + 1);
                    }}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              
              {totalPages > 3 && (
                <>
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink 
                      href="#" 
                      isActive={totalPages === currentPage}
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(totalPages);
                      }}
                    >
                      {totalPages}
                    </PaginationLink>
                  </PaginationItem>
                </>
              )}
              
              <PaginationItem>
                <PaginationNext 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                  }}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
