import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { RequestsTable } from "@/components/requests-table";
import { Win11Card, CardContent } from "@/components/ui/win11-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Download, Search } from "lucide-react";
import { Win11Button } from "@/components/ui/win11-button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { it } from "date-fns/locale";

export default function RequestHistory() {
  const [date, setDate] = useState<Date>();
  
  return (
    <div className="container mx-auto">
      <PageHeader 
        title="Storico Richieste" 
        subtitle="Visualizza e cerca le richieste passate"
        action={{ 
          label: "Esporta Report", 
          href: "#",
          icon: <Download className="mr-2 h-4 w-4" />
        }}
      />
      
      <Win11Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search" className="mb-2 block">Cerca</Label>
              <div className="relative">
                <Input 
                  id="search" 
                  placeholder="ID o Ricambio..." 
                  className="pl-9" 
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            
            <div>
              <Label htmlFor="status" className="mb-2 block">Stato</Label>
              <Select>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Tutti gli stati" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutti gli stati</SelectItem>
                  <SelectItem value="pending">In attesa</SelectItem>
                  <SelectItem value="processing">In lavorazione</SelectItem>
                  <SelectItem value="completed">Completata</SelectItem>
                  <SelectItem value="rejected">Rifiutata</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="mb-2 block">Data (dal)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className="w-full justify-start text-left font-normal"
                  >
                    {date ? (
                      format(date, "PPP", { locale: it })
                    ) : (
                      <span>Seleziona data</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    locale={it}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="flex items-end">
              <Win11Button className="w-full">
                <Search className="mr-2 h-4 w-4" /> Cerca
              </Win11Button>
            </div>
          </div>
        </CardContent>
      </Win11Card>
      
      <RequestsTable />
    </div>
  );
}
