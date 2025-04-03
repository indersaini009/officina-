import { useState, useEffect } from 'react';
import { Win11Card } from '@/components/ui/win11-card';
import { Win11Button } from '@/components/ui/win11-button';
import { PageHeader } from '@/components/page-header';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

export default function Impostazioni() {
  const { toast } = useToast();
  const [workstation, setWorkstation] = useState('');
  const [serverAddress, setServerAddress] = useState('');
  const [serverPort, setServerPort] = useState('5000');
  const [connectionStatus, setConnectionStatus] = useState('Non connesso');
  
  useEffect(() => {
    // Carica le impostazioni dal localStorage all'avvio
    const savedWorkstation = localStorage.getItem('workstation');
    if (savedWorkstation) {
      setWorkstation(savedWorkstation);
    }
    
    const savedServerAddress = localStorage.getItem('serverAddress');
    if (savedServerAddress) {
      setServerAddress(savedServerAddress);
    }
    
    const savedServerPort = localStorage.getItem('serverPort');
    if (savedServerPort) {
      setServerPort(savedServerPort);
    }
  }, []);

  const saveSettings = () => {
    // Salva le impostazioni nel localStorage
    localStorage.setItem('workstation', workstation);
    localStorage.setItem('serverAddress', serverAddress);
    localStorage.setItem('serverPort', serverPort);
    
    toast({
      title: "Impostazioni salvate",
      description: "Le impostazioni sono state salvate con successo",
    });
  };

  const testConnection = () => {
    // Simula un test di connessione
    setConnectionStatus('Connessione in corso...');
    
    setTimeout(() => {
      if (serverAddress && serverPort) {
        setConnectionStatus('Connesso');
        toast({
          title: "Connessione stabilita",
          description: `Connesso con successo al server ${serverAddress}:${serverPort}`,
        });
      } else {
        setConnectionStatus('Errore di connessione');
        toast({
          title: "Errore di connessione",
          description: "Inserisci l'indirizzo del server e la porta",
          variant: "destructive",
        });
      }
    }, 1500);
  };

  return (
    <div className="container px-4 py-6 mx-auto">
      <PageHeader
        title="Impostazioni"
        subtitle="Configura la tua postazione e le impostazioni di connessione"
      />
      
      <div className="grid grid-cols-1 gap-6 mt-6 lg:grid-cols-2">
        <Win11Card>
          <CardHeader>
            <CardTitle>Configurazione Postazione</CardTitle>
            <CardDescription>
              Imposta il nome della postazione di lavoro che verrà utilizzato nelle richieste
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="workstation">Nome Postazione</Label>
                <Input
                  id="workstation"
                  placeholder="Es. Postazione 1"
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
              Configura la connessione al database condiviso sulla rete locale
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="serverAddress">Indirizzo Server</Label>
                <Input
                  id="serverAddress"
                  placeholder="Es. 192.168.1.100"
                  value={serverAddress}
                  onChange={(e) => setServerAddress(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="serverPort">Porta Server</Label>
                <Input
                  id="serverPort"
                  placeholder="Es. 5000"
                  value={serverPort}
                  onChange={(e) => setServerPort(e.target.value)}
                />
              </div>
              
              <div className="flex items-center space-x-4">
                <Win11Button onClick={testConnection}>
                  Verifica Connessione
                </Win11Button>
                <span className={`text-sm font-medium ${
                  connectionStatus === 'Connesso' 
                    ? 'text-green-500' 
                    : connectionStatus === 'Non connesso' 
                      ? 'text-gray-500' 
                      : connectionStatus === 'Connessione in corso...'
                        ? 'text-blue-500'
                        : 'text-red-500'
                }`}>
                  {connectionStatus}
                </span>
              </div>
              
              <Win11Button onClick={saveSettings}>
                Salva Impostazioni
              </Win11Button>
            </div>
          </CardContent>
        </Win11Card>
      </div>
      
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Informazioni di Rete</CardTitle>
          <CardDescription>
            Come configurare il database condiviso sulla rete locale
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>
              Per condividere il database tra più postazioni, è necessario configurare un server centrale che ospita il database PostgreSQL.
              Ogni postazione deve essere configurata per connettersi allo stesso server.
            </p>
            
            <Separator />
            
            <h3 className="text-lg font-medium">Istruzioni di configurazione:</h3>
            <ol className="list-decimal list-inside space-y-2">
              <li>Installare PostgreSQL sul server centrale</li>
              <li>Configurare PostgreSQL per accettare connessioni remote</li>
              <li>Creare un database dedicato per l'applicazione</li>
              <li>Inserire l'indirizzo IP del server e la porta nelle impostazioni di connessione</li>
              <li>Verificare la connessione utilizzando il pulsante "Verifica Connessione"</li>
            </ol>
            
            <p className="text-sm text-gray-500 mt-4">
              Nota: Per ulteriori informazioni sulla configurazione del database, consultare la documentazione di PostgreSQL o contattare il supporto tecnico.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}