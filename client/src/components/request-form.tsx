import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

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
import { ColorPicker } from "@/components/color-picker";
import { insertPaintRequestSchema } from "@shared/schema";

const partTypes = [
  { value: "paraurti_anteriore", label: "Paraurti Anteriore" },
  { value: "paraurti_posteriore", label: "Paraurti Posteriore" },
  { value: "portiera_anteriore_sx", label: "Portiera Anteriore SX" },
  { value: "portiera_anteriore_dx", label: "Portiera Anteriore DX" },
  { value: "portiera_posteriore_sx", label: "Portiera Posteriore SX" },
  { value: "portiera_posteriore_dx", label: "Portiera Posteriore DX" },
  { value: "cofano", label: "Cofano Motore" },
  { value: "parafango_ant_sx", label: "Parafango Anteriore SX" },
  { value: "parafango_ant_dx", label: "Parafango Anteriore DX" },
  { value: "specchietto_sx", label: "Specchietto Laterale SX" },
  { value: "specchietto_dx", label: "Specchietto Laterale DX" },
  { value: "altro", label: "Altro (specificare)" },
];

const finishTypes = [
  { value: "glossy", label: "Lucida" },
  { value: "matte", label: "Opaca" },
  { value: "metallic", label: "Metallizzata" },
  { value: "pearl", label: "Perlata" },
  { value: "satin", label: "Satinata" },
];

const priorities = [
  { value: "normal", label: "Normale" },
  { value: "medium", label: "Media" },
  { value: "high", label: "Alta" },
  { value: "urgent", label: "Urgente" },
];

// Extend the paint request schema with custom validation
const formSchema = insertPaintRequestSchema.extend({
  partType: z.string().min(1, { message: "Seleziona un tipo di ricambio" }),
  partCode: z.string().min(1, { message: "Inserisci il codice del ricambio" }),
  vehicleModel: z.string().min(1, { message: "Inserisci il modello del veicolo" }),
  color: z.string().min(1, { message: "Seleziona un colore" }),
  finishType: z.string().min(1, { message: "Seleziona un tipo di finitura" }),
  quantity: z.number().min(1, { message: "La quantità deve essere almeno 1" }),
  priority: z.string().min(1, { message: "Seleziona una priorità" }),
});

export function RequestForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const [selectedColorName, setSelectedColorName] = useState("Blu");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: 1, // In a real app, this would be the current authenticated user's ID
      partType: "",
      partCode: "",
      vehicleModel: "",
      color: "Blu",
      colorCode: "",
      finishType: "glossy",
      quantity: 1,
      priority: "normal",
      notes: "",
    },
  });

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
    // In a real implementation, we would handle the file upload separately
    // and include the uploaded file path in the request data
    createRequestMutation.mutate(values);
  };

  const handleColorChange = (color: { name: string; hex: string }) => {
    setSelectedColorName(color.name);
    form.setValue("color", color.name);
  };

  const handleColorCodeChange = (colorCode: string) => {
    form.setValue("colorCode", colorCode);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setImageFile(files[0]);
      // In a real implementation, we would handle the file upload here
    }
  };

  const onCancel = () => {
    navigate("/");
  };

  const onSaveAsDraft = () => {
    // In a real implementation, we would save the form data as a draft
    toast({
      title: "Bozza salvata",
      description: "La tua richiesta è stata salvata come bozza",
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <FormField
              control={form.control}
              name="partType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo Ricambio</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona tipo ricambio" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {partTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
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
              name="vehicleModel"
              render={({ field }) => (
                <FormItem className="mt-4">
                  <FormLabel>Modello Veicolo</FormLabel>
                  <FormControl>
                    <Input placeholder="Es. Sedan Model Y" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem className="mt-4">
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
          </div>
          
          <div>
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <ColorPicker 
                      onColorChange={handleColorChange}
                      defaultColor={{ name: field.value, hex: "#2563eb" }}
                      onColorCodeChange={handleColorCodeChange}
                      defaultColorCode={form.getValues("colorCode")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="finishType"
              render={({ field }) => (
                <FormItem className="mt-4">
                  <FormLabel>Tipo di Finitura</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona finitura" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {finishTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
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
              name="notes"
              render={({ field }) => (
                <FormItem className="mt-4">
                  <FormLabel>Note Aggiuntive</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Inserisci eventuali dettagli o richieste speciali" 
                      className="resize-none" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="mt-4">
              <FormLabel className="block mb-1">
                Carica Riferimento Colore (opzionale)
              </FormLabel>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="mx-auto h-12 w-12 text-gray-400" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
                    />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary-dark focus-within:outline-none"
                    >
                      <span>Carica un file</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        onChange={handleFileChange}
                        accept="image/*"
                      />
                    </label>
                    <p className="pl-1">o trascina qui</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG fino a 10MB
                  </p>
                  {imageFile && (
                    <p className="text-xs font-medium text-primary">
                      File selezionato: {imageFile.name}
                    </p>
                  )}
                </div>
              </div>
            </div>
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
            type="button" 
            variant="outline" 
            onClick={onSaveAsDraft}
          >
            Salva come Bozza
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
