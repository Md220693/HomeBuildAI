import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, Key, RefreshCw, AlertTriangle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ApiKey {
  name: string;
  value: string;
  status: 'active' | 'inactive' | 'error';
  description: string;
  lastUsed?: string;
}

const AdminApiManager = () => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [showValues, setShowValues] = useState<{[key: string]: boolean}>({});
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [newValues, setNewValues] = useState<{[key: string]: string}>({});
  const { toast } = useToast();

  const defaultApiKeys = [
    {
      name: 'OPENAI_API_KEY',
      value: '••••••••••••••••••••••••••••••••••••••••',
      status: 'active' as const,
      description: 'OpenAI API per AI Interview e generazione contenuti',
      lastUsed: '2 ore fa'
    },
    {
      name: 'DEEPSEEK_API_KEY', 
      value: '••••••••••••••••••••••••••••••••••••••••',
      status: 'active' as const,
      description: 'DeepSeek API per analisi avanzate',
      lastUsed: '1 giorno fa'
    },
    {
      name: 'RESEND_API_KEY',
      value: '',
      status: 'inactive' as const,
      description: 'Resend per invio email automatiche',
      lastUsed: 'Mai'
    },
    {
      name: 'STRIPE_SECRET_KEY',
      value: '',
      status: 'inactive' as const,
      description: 'Stripe per pagamenti fornitori',
      lastUsed: 'Mai'
    },
    {
      name: 'TWILIO_AUTH_TOKEN',
      value: '',
      status: 'inactive' as const,
      description: 'Twilio per chiamate vocali AI',
      lastUsed: 'Mai'
    }
  ];

  useEffect(() => {
    setApiKeys(defaultApiKeys);
  }, []);

  const toggleShowValue = (keyName: string) => {
    setShowValues(prev => ({
      ...prev,
      [keyName]: !prev[keyName]
    }));
  };

  const startEditing = (keyName: string, currentValue: string) => {
    setEditingKey(keyName);
    setNewValues(prev => ({
      ...prev,
      [keyName]: currentValue.startsWith('••••') ? '' : currentValue
    }));
  };

  const saveApiKey = async (keyName: string) => {
    const newValue = newValues[keyName];
    
    if (!newValue || newValue.trim() === '') {
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Il valore della chiave API non può essere vuoto"
      });
      return;
    }

    try {
      // Here you would normally call your edge function to save the API key
      // For now, we'll simulate the update
      setApiKeys(prev => prev.map(key => 
        key.name === keyName 
          ? { 
              ...key, 
              value: '••••••••••••••••••••••••••••••••••••••••',
              status: 'active' as const,
              lastUsed: 'Appena aggiornato'
            }
          : key
      ));

      setEditingKey(null);
      setNewValues(prev => ({ ...prev, [keyName]: '' }));

      toast({
        title: "Chiave API aggiornata",
        description: `${keyName} è stata salvata con successo`
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Impossibile salvare la chiave API"
      });
    }
  };

  const testApiKey = async (keyName: string) => {
    toast({
      title: "Test in corso...",
      description: `Verifica della connessione ${keyName}`
    });

    // Simulate API test
    setTimeout(() => {
      const isSuccess = Math.random() > 0.3; // 70% success rate for demo
      
      if (isSuccess) {
        setApiKeys(prev => prev.map(key => 
          key.name === keyName 
            ? { ...key, status: 'active' as const, lastUsed: 'Testato ora' }
            : key
        ));
        
        toast({
          title: "Test riuscito",
          description: `${keyName} funziona correttamente`
        });
      } else {
        setApiKeys(prev => prev.map(key => 
          key.name === keyName 
            ? { ...key, status: 'error' as const }
            : key
        ));
        
        toast({
          variant: "destructive",
          title: "Test fallito",
          description: `${keyName} non risponde correttamente`
        });
      }
    }, 2000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Gestione Chiavi API
          </CardTitle>
          <CardDescription>
            Configura e gestisci tutte le chiavi API utilizzate dall'applicazione
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {apiKeys.map((apiKey) => (
            <div key={apiKey.name} className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(apiKey.status)}
                  <div>
                    <h3 className="font-medium">{apiKey.name}</h3>
                    <p className="text-sm text-muted-foreground">{apiKey.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(apiKey.status)}>
                    {apiKey.status === 'active' ? 'Attiva' : 
                     apiKey.status === 'error' ? 'Errore' : 'Inattiva'}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Ultimo uso: {apiKey.lastUsed}
                  </span>
                </div>
              </div>

              {editingKey === apiKey.name ? (
                <div className="space-y-3">
                  <Label htmlFor={`key-${apiKey.name}`}>Nuova chiave API</Label>
                  <div className="flex gap-2">
                    <Input
                      id={`key-${apiKey.name}`}
                      type="password"
                      value={newValues[apiKey.name] || ''}
                      onChange={(e) => setNewValues(prev => ({
                        ...prev,
                        [apiKey.name]: e.target.value
                      }))}
                      placeholder="Inserisci la nuova chiave API..."
                    />
                    <Button 
                      onClick={() => saveApiKey(apiKey.name)}
                      className="px-4"
                    >
                      Salva
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setEditingKey(null)}
                      className="px-4"
                    >
                      Annulla
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Input
                      value={showValues[apiKey.name] ? (apiKey.value || 'Non configurata') : apiKey.value || 'Non configurata'}
                      readOnly
                      type={showValues[apiKey.name] ? 'text' : 'password'}
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => toggleShowValue(apiKey.name)}
                    >
                      {showValues[apiKey.name] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => startEditing(apiKey.name, apiKey.value)}
                    >
                      Modifica
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => testApiKey(apiKey.name)}
                      disabled={!apiKey.value || apiKey.value.startsWith('Non configurata')}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Test Connessione
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminApiManager;