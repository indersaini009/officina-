import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Win11Button } from "@/components/ui/win11-button";
import { insertPaintRequestSchema } from "@shared/schema";

const priorities = [
  { value: "normal", label: "Normale" },
  { value: "medium", label: "Media" },
  { value: "high", label: "Alta" },
  { value: "urgent", label: "Urgente" },
];

// Extend the paint request schema with custom validation
const formSchema = insertPaintRequestSchema.extend({
  partDescription: z.string().min(1, { message: "Inserisci una descrizione del ricambio" }),
  partCode: z.string().min(1, { message: "Inserisci il codice del ricambio" }),
  partColor: z.string().optional(),
  quantity: z.number().min(1, { message: "La quantità deve essere almeno 1" }),
  priority: z.string().min(1, { message: "Seleziona una priorità" }),
  plannedDate: z.date().optional().nullable(),
});

export function RequestForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: 1, // In a real app, this would be the current authenticated user's ID
      workstation: localStorage.getItem('workstation') || "Postazione 1",
      partDescription: "",
      partCode: "",
      partColor: "",
      quantity: 1,
      priority: "normal",
      notes: "",
      plannedDate: null,
    },
  });
  
  // Aggiorna il valore della postazione quando cambia nel localStorage
  useEffect(() => {
    const workstation = localStorage.getItem('workstation') || "Postazione 1";
    form.setValue('workstation', workstation);
  }, [form]);

  const createRequestMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const response = await apiRequest("POST", "/api/requests", values);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/requests'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      toast({
        title: "Richiesta inviata",
        description: "La tua richiesta è stata inviata con successo",
      });
      navigate("/");
    },
    onError: (error) => {
      toast({
        title: "Errore",
        description: `Non è stato possibile inviare la richiesta: ${error}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    createRequestMutation.mutate(values);
  };

  const onCancel = () => {
    navigate("/");
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <FormField
              control={form.control}
              name="partDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrizione Ricambio</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descrivi il ricambio richiesto..." 
                      className="resize-none"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="partCode"
              render={({ field }) => (
                <FormItem className="mt-4">
                  <FormLabel>Codice Ricambio</FormLabel>
                  <FormControl>
                    <Input placeholder="Es. PR-2022-A453" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            

            
            <FormField
              control={form.control}
              name="partColor"
              render={({ field }) => (
                <FormItem className="mt-4">
                  <FormLabel>Colore Ricambio</FormLabel>
                  <FormControl>
                    <Input placeholder="Es. Rosso metallizzato RAL 3020" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div>
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantità</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min={1} 
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem className="mt-4">
                  <FormLabel>Priorità</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona priorità" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {priorities.map((priority) => (
                        <SelectItem key={priority.value} value={priority.value}>
                          {priority.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="plannedDate"
              render={({ field }) => (
                <FormItem className="mt-4">
                  <FormLabel>Data Pianificata</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Win11Button
                          variant={"outline"}
                          type="button"
                          className={`w-full pl-3 text-left font-normal ${
                            !field.value && "text-muted-foreground"
                          }`}
                        >
                          {field.value ? (
                            format(field.value, "dd/MM/yyyy")
                          ) : (
                            <span>Seleziona una data</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Win11Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value || undefined}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem className="mt-4">
                  <FormLabel>Note Aggiuntive</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Inserisci eventuali dettagli o richieste speciali" 
                      className="resize-none" 
                      value={field.value || ""}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        <div className="flex justify-end mt-6 space-x-3">
          <Win11Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
          >
            Annulla
          </Win11Button>
          <Win11Button 
            type="submit" 
            disabled={createRequestMutation.isPending}
          >
            {createRequestMutation.isPending ? "Invio in corso..." : "Invia Richiesta"}
          </Win11Button>
        </div>
      </form>
    </Form>
  );
}
