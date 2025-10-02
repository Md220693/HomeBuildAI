import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Eye, EyeOff, Key, RefreshCw, AlertTriangle, CheckCircle, Settings, Shield, Info } from "lucide-react";
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
  const [otpDebugMode, setOtpDebugMode] = useState(false);
  const [supplierEmailConfirmRequired, setSupplierEmailConfirmRequired] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // API Keys gestibili dall'admin panel (salvate in system_settings)
  const managedApiKeyDefinitions = [
    {
      name: 'postmark_api_key',
      description: 'Postmark API per invio email ai fornitori',
    },
    {
      name: 'postmark_server_token',
      description: 'Postmark Server Token per autenticazione',
    },
    {
      name: 'twilio_account_sid',
      description: 'Twilio Account SID per invio SMS/OTP',
    },
    {
      name: 'twilio_auth_token',
      description: 'Twilio Auth Token per autenticazione SMS',
    },
    {
      name: 'twilio_phone_number',
      description: 'Numero di telefono Twilio per invio SMS',
    },
    {
      name: 'stripe_secret_key',
      description: 'Stripe per pagamenti fornitori',
    }
  ];

  // Supabase Secrets (gestiti a livello infrastruttura, solo visualizzazione)
  const supabaseSecretsDefinitions = [
    {
      name: 'DEEPSEEK_API_KEY',
      description: 'DeepSeek API per analisi avanzate e AI',
      managedIn: 'Supabase Secrets'
    },
    {
      name: 'OPENAI_API_KEY',
      description: 'OpenAI API per AI Interview e generazione contenuti',
      managedIn: 'Supabase Secrets'
    },
    {
      name: 'SUPABASE_SERVICE_ROLE_KEY',
      description: 'Service Role Key per operazioni admin Supabase',
      managedIn: 'Supabase Secrets'
    }
  ];

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      
      // Load all system settings from database
      const { data: settings, error } = await supabase
        .from('system_settings')
        .select('*');

      if (error) throw error;

      // Load OTP debug mode
      const debugModeSetting = settings?.find(s => s.setting_key === 'otp_debug_mode');
      setOtpDebugMode(debugModeSetting?.setting_value === 'true');

      // Load supplier email confirmation setting
      const supplierEmailSetting = settings?.find(s => s.setting_key === 'supplier_email_confirmation_required');
      setSupplierEmailConfirmRequired(supplierEmailSetting?.setting_value === 'true');

      // Map settings to API keys (solo chiavi managed)
      const loadedKeys: ApiKey[] = managedApiKeyDefinitions.map(def => {
        const setting = settings?.find(s => s.setting_key === def.name);
        const hasValue = !!setting?.setting_value && setting.setting_value.trim() !== '';
        return {
          name: def.name,
          value: hasValue ? '••••••••••••••••••••••••••••••••••••••••' : '',
          status: hasValue ? 'active' : 'inactive',
          description: def.description,
          lastUsed: setting?.updated_at ? new Date(setting.updated_at).toLocaleDateString('it-IT') : 'Non configurata'
        } as ApiKey;
      });

      setApiKeys(loadedKeys);
    } catch (error) {
      console.error('Error loading settings:', error);
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Impossibile caricare le impostazioni"
      });
    } finally {
      setLoading(false);
    }
  };

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
      const { error } = await supabase.functions.invoke('save-api-settings', {
        body: {
          setting_key: keyName,
          setting_value: newValue
        }
      });

      if (error) throw error;

      // Update local state
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
      console.error('Error saving API key:', error);
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Impossibile salvare la chiave API"
      });
    }
  };

  const toggleOtpDebugMode = async (enabled: boolean) => {
    try {
      const { error } = await supabase.functions.invoke('save-api-settings', {
        body: {
          setting_key: 'otp_debug_mode',
          setting_value: enabled ? 'true' : 'false'
        }
      });

      if (error) throw error;

      setOtpDebugMode(enabled);
      toast({
        title: "Modalità debug aggiornata",
        description: enabled 
          ? "Modalità debug OTP attivata - i codici verranno visualizzati nei log" 
          : "Modalità debug OTP disattivata - SMS inviati normalmente"
      });
    } catch (error) {
      console.error('Error toggling debug mode:', error);
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Impossibile aggiornare la modalità debug"
      });
    }
  };

  const toggleSupplierEmailConfirm = async (enabled: boolean) => {
    try {
      const { error } = await supabase.functions.invoke('save-api-settings', {
        body: {
          setting_key: 'supplier_email_confirmation_required',
          setting_value: enabled ? 'true' : 'false'
        }
      });

      if (error) throw error;

      setSupplierEmailConfirmRequired(enabled);
      toast({
        title: "Impostazione aggiornata",
        description: enabled 
          ? "Conferma email richiesta per i fornitori" 
          : "I fornitori possono accedere immediatamente dopo la registrazione"
      });
    } catch (error) {
      console.error('Error toggling supplier email confirm:', error);
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Impossibile aggiornare l'impostazione"
      });
    }
  };

  const testApiKey = async (keyName: string) => {
    toast({
      title: "Test in corso...",
      description: `Verifica della connessione ${keyName}`
    });

    // For now, just show a success message
    // In production, you'd call a test endpoint
    setTimeout(() => {
      toast({
        title: "Test simulato",
        description: "Implementa un endpoint di test per verificare la connessione reale"
      });
    }, 1500);
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

  if (loading) {
    return <div className="p-8 text-center">Caricamento impostazioni...</div>;
  }

  return (
    <div className="space-y-6">
      {/* System Settings Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Impostazioni Sistema
          </CardTitle>
          <CardDescription>
            Configurazioni generali dell'applicazione
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <Label htmlFor="otp-debug" className="text-base font-medium">
                Modalità Debug OTP
              </Label>
              <p className="text-sm text-muted-foreground">
                Quando attiva, i codici OTP vengono visualizzati nei log invece di essere inviati via SMS
              </p>
            </div>
            <Switch
              id="otp-debug"
              checked={otpDebugMode}
              onCheckedChange={toggleOtpDebugMode}
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <Label htmlFor="supplier-email-confirm" className="text-base font-medium">
                Richiedi Conferma Email Fornitori
              </Label>
              <p className="text-sm text-muted-foreground">
                Se attiva, i fornitori devono confermare l'email prima di accedere al sistema
              </p>
            </div>
            <Switch
              id="supplier-email-confirm"
              checked={supplierEmailConfirmRequired}
              onCheckedChange={toggleSupplierEmailConfirm}
            />
          </div>
        </CardContent>
      </Card>

      {/* Supabase Secrets Status - Read Only */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Supabase Secrets (Solo Lettura)
          </CardTitle>
          <CardDescription>
            Queste chiavi sono gestite direttamente in Supabase e non possono essere modificate da qui
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {supabaseSecretsDefinitions.map((secret) => (
            <div key={secret.name} className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{secret.name}</p>
                  <Badge variant="outline" className="text-xs">
                    {secret.managedIn}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{secret.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm text-muted-foreground">Configurato</span>
              </div>
            </div>
          ))}
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <Info className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Per modificare questi secrets, vai al{" "}
              <a 
                href="https://supabase.com/dashboard/project/wncvvncldryfqqvpmnor/settings/functions"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                pannello Supabase
              </a>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Managed API Keys Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Gestione Chiavi API
          </CardTitle>
          <CardDescription>
            Configura le chiavi API per servizi esterni (Postmark per email, Twilio per SMS, Stripe per pagamenti)
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
