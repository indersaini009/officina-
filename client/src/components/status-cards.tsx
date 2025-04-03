import { useQuery } from "@tanstack/react-query";
import { 
  Win11Card, 
  CardContent 
} from "@/components/ui/win11-card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  ArrowUp, 
  AlertTriangle, 
  PaintBucket 
} from "lucide-react";

export function StatusCards() {
  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['/api/requests'],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {Array(4).fill(0).map((_, i) => (
          <Win11Card key={i}>
            <CardContent className="p-5">
              <div className="flex justify-between items-center">
                <div>
                  <Skeleton className="h-4 w-28 mb-2" />
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-10 w-10 rounded-full" />
              </div>
            </CardContent>
          </Win11Card>
        ))}
      </div>
    );
  }

  // Count requests by status
  const pendingRequests = requests.filter((req: any) => req.status === 'pending');
  const processingRequests = requests.filter((req: any) => req.status === 'processing');
  const completedRequests = requests.filter((req: any) => req.status === 'completed');
  const rejectedRequests = requests.filter((req: any) => req.status === 'rejected');

  // Get today's pending requests
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayPendingRequests = pendingRequests.filter((req: any) => {
    const reqDate = new Date(req.createdAt);
    reqDate.setHours(0, 0, 0, 0);
    return reqDate.getTime() === today.getTime();
  });

  // Check for delayed processing requests
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  const delayedRequests = processingRequests.filter((req: any) => {
    return new Date(req.createdAt) < threeDaysAgo;
  });

  // Calculate completed requests this week
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);
  const weekCompletedRequests = completedRequests.filter((req: any) => {
    return new Date(req.completedAt || req.updatedAt) >= weekStart;
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Pending Requests Card */}
      <Win11Card>
        <CardContent className="p-5">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">Nuove richieste</p>
              <h3 className="text-2xl font-bold mt-1">{pendingRequests.length}</h3>
              {todayPendingRequests.length > 0 && (
                <p className="text-xs text-blue-500 mt-1 flex items-center">
                  <ArrowUp className="h-3 w-3 mr-1" />
                  <span>+{todayPendingRequests.length} oggi</span>
                </p>
              )}
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-500">
              <FileText className="h-5 w-5" />
            </div>
          </div>
        </CardContent>
      </Win11Card>
      
      {/* Processing Requests Card */}
      <Win11Card>
        <CardContent className="p-5">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">In corso</p>
              <h3 className="text-2xl font-bold mt-1">{processingRequests.length}</h3>
              {processingRequests.map(req => req.plannedDate && (
                <p key={req.id} className="text-xs text-orange-500 mt-1 flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  </p>
              ))}
              {delayedRequests.length > 0 && (
                <p className="text-xs text-orange-500 mt-1 flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>{delayedRequests.length} in ritardo</span>
                </p>
              )}
            </div>
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-500">
              <PaintBucket className="h-5 w-5" />
            </div>
          </div>
        </CardContent>
      </Win11Card>
      
      {/* Completed Requests Card */}
      <Win11Card>
        <CardContent className="p-5">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">Completate</p>
              <h3 className="text-2xl font-bold mt-1">{completedRequests.length}</h3>
              {weekCompletedRequests.length > 0 && (
                <p className="text-xs text-green-500 mt-1 flex items-center">
                  <ArrowUp className="h-3 w-3 mr-1" />
                  <span>+{weekCompletedRequests.length} questa settimana</span>
                </p>
              )}
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-500">
              <CheckCircle className="h-5 w-5" />
            </div>
          </div>
        </CardContent>
      </Win11Card>
      
      {/* Rejected Requests Card */}
      <Win11Card>
        <CardContent className="p-5">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">Rifiutate</p>
              <h3 className="text-2xl font-bold mt-1">{rejectedRequests.length}</h3>
              {rejectedRequests.length > 0 && (
                <p className="text-xs text-red-500 mt-1 flex items-center">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  <span>Richiede azione</span>
                </p>
              )}
            </div>
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-500">
              <XCircle className="h-5 w-5" />
            </div>
          </div>
        </CardContent>
      </Win11Card>
    </div>
  );
}
