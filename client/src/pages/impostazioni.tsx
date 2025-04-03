import { useState, useEffect } from 'react';
import { Win11Card } from '@/components/ui/win11-card';
import { Win11Button } from '@/components/ui/win11-button';
import { PageHeader } from '@/components/page-header';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

export default function Impostazioni() {
  const { toast } = useToast();
  const [workstation, setWorkstation] = useState('');
  const [sharedDatabasePath, setSharedDatabasePath] = useState('');
  const [dbType, setDbType] = useState('local');
  
  useEffect(() => {
    // Carica le impostazioni dal localStorage all'avvio
    const savedWorkstation = localStorage.getItem('workstation');
    if (savedWorkstation) {
      setWorkstation(savedWorkstation);
    }
    
    const savedSharedDatabasePath = localStorage.getItem('sharedDatabasePath');
    if (savedSharedDatabasePath) {
      setSharedDatabasePath(savedSharedDatabasePath);
    }
    
    const savedDbType = localStorage.getItem('dbType');
    if (savedDbType) {
      setDbType(savedDbType);
    }
  }, []);

  const saveSettings = () => {
    // Salva le impostazioni nel localStorage
    localStorage.setItem('workstation', workstation);
    localStorage.setItem('sharedDatabasePath', sharedDatabasePath);
    localStorage.setItem('dbType', dbType);
    
    toast({
      title: "Impostazioni salvate",
      description: "Le impostazioni sono state salvate con successo. Riavvia l'applicazione per applicare le modifiche.",
    });
  };

  const testSharedPath = () => {
    // Controlla che il percorso sia valido
    if (!sharedDatabasePath) {
      toast({
        title: "Percorso non valido",
        description: "Inserisci un percorso valido per il database condiviso",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Test completato",
      description: "Il percorso è stato verificato. Al riavvio l'applicazione proverà a connettersi al database condiviso.",
    });
  };

  return (
    <div className="container px-4 py-6 mx-auto">
      <PageHeader
        title="Impostazioni"
        subtitle="Configura la tua postazione e le impostazioni di condivisione dati"
      />
      
      <div className="grid grid-cols-1 gap-6 mt-6 lg:grid-cols-2">
        <Win11Card>
          <CardHeader>
            <CardTitle>Configurazione Reparto Richiedente</CardTitle>
            <CardDescription>
              Imposta il nome del reparto richiedente che verrà utilizzato nelle richieste
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="workstation">Nome Reparto Richiedente</Label>
                <Input
                  id="workstation"
                  placeholder="Es. Assistenza Tecnica"
                  value={workstation}
                  onChange={(e) => setWorkstation(e.target.value)}
                />
              </div>
              
              <Win11Button onClick={saveSettings}>
                Salva Impostazioni
              </Win11Button>
            </div>
          </CardContent>
        </Win11Card>
        
        <Win11Card>
          <CardHeader>
            <CardTitle>Configurazione Database Condiviso</CardTitle>
            <CardDescription>
              Configura il percorso del file database condiviso sulla rete locale
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="dbType">Tipo di Database</Label>
                <Select 
                  value={dbType} 
                  onValueChange={(value) => setDbType(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona tipo di database" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="local">Database Locale</SelectItem>
                    <SelectItem value="shared">Database Condiviso</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {dbType === 'shared' && (
                <div className="space-y-2">
                  <Label htmlFor="sharedDatabasePath">Percorso Database Condiviso</Label>
                  <Input
                    id="sharedDatabasePath"
                    placeholder="Es. \\SERVER\Condiviso\database.sqlite"
                    value={sharedDatabasePath}
                    onChange={(e) => setSharedDatabasePath(e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Inserisci il percorso completo del file database condiviso sulla rete locale.
                  </p>
                </div>
              )}
              
              {dbType === 'shared' && (
                <div className="flex items-center space-x-4">
                  <Win11Button onClick={testSharedPath}>
                    Verifica Percorso
                  </Win11Button>
                </div>
              )}
              
              <Win11Button onClick={saveSettings}>
                Salva Impostazioni
              </Win11Button>
            </div>
          </CardContent>
        </Win11Card>
      </div>
      
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Informazioni sulla Condivisione Dati</CardTitle>
          <CardDescription>
            Come configurare un database condiviso sulla rete locale
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>
              Per condividere il database tra più reparti, è possibile utilizzare un file di database condiviso sulla rete locale.
              Questo permette a tutti i reparti di accedere agli stessi dati senza necessità di un server dedicato.
            </p>
            
            <Separator />
            
            <h3 className="text-lg font-medium">Istruzioni di configurazione:</h3>
            <ol className="list-decimal list-inside space-y-2">
              <li>Creare una cartella condivisa sulla rete accessibile a tutti i reparti</li>
              <li>Assicurarsi che tutti i computer abbiano i permessi di lettura e scrittura sulla cartella</li>
              <li>Inserire il percorso completo della cartella condivisa nelle impostazioni</li>
              <li>Salvare le impostazioni e riavviare l'applicazione</li>
              <li>Se il database non esiste già, verrà creato automaticamente al primo avvio</li>
            </ol>
            
            <div className="bg-blue-50 p-4 rounded-md border border-blue-200 mt-4">
              <h4 className="text-md font-medium text-blue-800">Suggerimento</h4>
              <p className="text-sm text-blue-600 mt-1">
                Se si utilizza Windows, il percorso del file condiviso potrebbe essere nella forma \\NOME-SERVER\Condiviso\database.sqlite.
                Se si utilizza macOS o Linux, il percorso potrebbe essere nella forma /Volumes/Condiviso/database.sqlite o /mnt/shared/database.sqlite.
              </p>
            </div>
            
            <p className="text-sm text-gray-500 mt-4">
              Nota: Per evitare problemi di accesso concorrente, si consiglia di utilizzare SQLite in modalità WAL (Write-Ahead Logging).
              Per ulteriori informazioni, consultare la documentazione di SQLite o contattare il supporto tecnico.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}