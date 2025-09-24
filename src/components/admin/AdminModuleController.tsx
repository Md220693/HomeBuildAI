import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Settings, Database, FileText, Users, Mail, Phone, CreditCard, Bell } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AppModule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  icon: any;
  dependencies?: string[];
  config?: {[key: string]: any};
}

const AdminModuleController = () => {
  const [modules, setModules] = useState<AppModule[]>([]);
  const [configs, setConfigs] = useState<{[key: string]: any}>({});
  const { toast } = useToast();

  const defaultModules: AppModule[] = [
    {
      id: 'ai-interview',
      name: 'AI Interview',
      description: 'Sistema di intervista AI per raccolta requisiti clienti',
      enabled: true,
      icon: FileText,
      config: {
        model: 'gpt-4',
        maxTokens: 2000,
        temperature: 0.7
      }
    },
    {
      id: 'pdf-generation',
      name: 'Generazione PDF',
      description: 'Creazione automatica capitolati in formato PDF',
      enabled: true,
      icon: FileText,
      dependencies: ['ai-interview']
    },
    {
      id: 'supplier-management',
      name: 'Gestione Fornitori',
      description: 'Sistema completo di gestione fornitori e onboarding',
      enabled: true,
      icon: Users,
      config: {
        autoApproval: false,
        requireDocuments: true,
        maxZoneOperative: 10
      }
    },
    {
      id: 'lead-distribution',
      name: 'Distribuzione Lead',
      description: 'Sistema di assegnazione automatica lead ai fornitori',
      enabled: true,
      icon: Database,
      dependencies: ['supplier-management'],
      config: {
        maxAssignments: 5,
        expirationDays: 7,
        autoAssign: true
      }
    },
    {
      id: 'email-notifications',
      name: 'Notifiche Email',
      description: 'Sistema di invio email automatiche',
      enabled: false,
      icon: Mail,
      config: {
        fromEmail: 'noreply@buildhome.ai',
        templates: {
          newLead: 'Nuovo lead disponibile',
          leadPurchased: 'Lead acquistato con successo',
          leadExpired: 'Lead scaduto'
        }
      }
    },
    {
      id: 'voice-calls',
      name: 'Chiamate Vocali AI',
      description: 'Notifiche vocali automatiche via Twilio',
      enabled: false,
      icon: Phone,
      dependencies: ['supplier-management'],
      config: {
        voice: 'it-IT-Standard-A',
        retryAttempts: 3,
        callWindow: '09:00-19:00'
      }
    },
    {
      id: 'payments',
      name: 'Sistema Pagamenti',
      description: 'Integrazione Stripe per pagamenti fornitori',
      enabled: false,
      icon: CreditCard,
      dependencies: ['supplier-management', 'lead-distribution'],
      config: {
        currency: 'EUR',
        webhookUrl: '/api/stripe/webhook',
        captureMethod: 'automatic'
      }
    },
    {
      id: 'admin-notifications',
      name: 'Notifiche Admin',
      description: 'Sistema di notifiche per amministratori',
      enabled: true,
      icon: Bell,
      config: {
        channels: ['email', 'dashboard'],
        frequency: 'realtime'
      }
    }
  ];

  useEffect(() => {
    setModules(defaultModules);
    // Initialize configs
    const initialConfigs: {[key: string]: any} = {};
    defaultModules.forEach(module => {
      if (module.config) {
        initialConfigs[module.id] = { ...module.config };
      }
    });
    setConfigs(initialConfigs);
  }, []);

  const toggleModule = async (moduleId: string) => {
    const module = modules.find(m => m.id === moduleId);
    if (!module) return;

    // Check dependencies
    if (!module.enabled && module.dependencies) {
      const missingDeps = module.dependencies.filter(depId => {
        const dep = modules.find(m => m.id === depId);
        return !dep || !dep.enabled;
      });

      if (missingDeps.length > 0) {
        toast({
          variant: "destructive",
          title: "Dipendenze mancanti",
          description: `Questo modulo richiede: ${missingDeps.join(', ')}`
        });
        return;
      }
    }

    // Check dependents when disabling
    if (module.enabled) {
      const dependents = modules.filter(m => 
        m.dependencies?.includes(moduleId) && m.enabled
      );

      if (dependents.length > 0) {
        toast({
          variant: "destructive",
          title: "Moduli dipendenti attivi",
          description: `Disabilita prima: ${dependents.map(d => d.name).join(', ')}`
        });
        return;
      }
    }

    setModules(prev => prev.map(m => 
      m.id === moduleId ? { ...m, enabled: !m.enabled } : m
    ));

    toast({
      title: module.enabled ? "Modulo disabilitato" : "Modulo abilitato",
      description: `${module.name} è stato ${module.enabled ? 'disabilitato' : 'abilitato'}`
    });
  };

  const updateConfig = (moduleId: string, key: string, value: any) => {
    setConfigs(prev => ({
      ...prev,
      [moduleId]: {
        ...prev[moduleId],
        [key]: value
      }
    }));
  };

  const saveConfig = async (moduleId: string) => {
    // Here you would save to your backend/database
    toast({
      title: "Configurazione salvata",
      description: "Le impostazioni sono state aggiornate"
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Controllo Moduli Applicazione
          </CardTitle>
          <CardDescription>
            Abilita/disabilita funzionalità e configura i parametri dei moduli
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {modules.map((module) => (
            <div key={module.id} className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <module.icon className="h-5 w-5 text-primary" />
                  <div>
                    <h3 className="font-medium flex items-center gap-2">
                      {module.name}
                      <Badge variant={module.enabled ? "default" : "secondary"}>
                        {module.enabled ? 'Attivo' : 'Inattivo'}
                      </Badge>
                    </h3>
                    <p className="text-sm text-muted-foreground">{module.description}</p>
                    {module.dependencies && (
                      <p className="text-xs text-muted-foreground">
                        Dipendenze: {module.dependencies.join(', ')}
                      </p>
                    )}
                  </div>
                </div>
                <Switch
                  checked={module.enabled}
                  onCheckedChange={() => toggleModule(module.id)}
                />
              </div>

              {module.config && module.enabled && (
                <div className="pl-8 space-y-4 border-l-2 border-muted">
                  <h4 className="font-medium text-sm">Configurazione</h4>
                  
                  {Object.entries(module.config).map(([key, defaultValue]) => (
                    <div key={key} className="grid grid-cols-3 gap-4 items-center">
                      <Label className="text-sm capitalize">
                        {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                      </Label>
                      
                      {typeof defaultValue === 'boolean' ? (
                        <Switch
                          checked={configs[module.id]?.[key] ?? defaultValue}
                          onCheckedChange={(checked) => updateConfig(module.id, key, checked)}
                        />
                      ) : typeof defaultValue === 'object' ? (
                        <Textarea
                          value={JSON.stringify(configs[module.id]?.[key] ?? defaultValue, null, 2)}
                          onChange={(e) => {
                            try {
                              const parsed = JSON.parse(e.target.value);
                              updateConfig(module.id, key, parsed);
                            } catch {}
                          }}
                          className="font-mono text-xs"
                          rows={3}
                        />
                      ) : (
                        <input
                          type={typeof defaultValue === 'number' ? 'number' : 'text'}
                          value={configs[module.id]?.[key] ?? defaultValue}
                          onChange={(e) => updateConfig(module.id, key, 
                            typeof defaultValue === 'number' ? 
                              parseInt(e.target.value) : e.target.value
                          )}
                          className="px-3 py-1 border rounded text-sm"
                        />
                      )}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => saveConfig(module.id)}
                      >
                        Salva
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminModuleController;