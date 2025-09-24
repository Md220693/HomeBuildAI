import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, Mail, Phone, MessageSquare, Send, Eye, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface NotificationTemplate {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'voice' | 'whatsapp';
  trigger: string;
  subject?: string;
  content: string;
  enabled: boolean;
  variables: string[];
}

interface NotificationSettings {
  emailEnabled: boolean;
  smsEnabled: boolean;
  voiceEnabled: boolean;
  whatsappEnabled: boolean;
  retryAttempts: number;
  retryDelay: number;
}

const AdminNotifications = () => {
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>({
    emailEnabled: false,
    smsEnabled: false,
    voiceEnabled: false,
    whatsappEnabled: false,
    retryAttempts: 3,
    retryDelay: 300
  });
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null);
  const [showNewTemplate, setShowNewTemplate] = useState(false);
  const [newTemplate, setNewTemplate] = useState<Partial<NotificationTemplate>>({
    type: 'email',
    enabled: true,
    variables: []
  });
  const { toast } = useToast();

  const defaultTemplates: NotificationTemplate[] = [
    {
      id: '1',
      name: 'Nuovo Lead Disponibile',
      type: 'email',
      trigger: 'lead_assigned',
      subject: 'Nuovo lead disponibile nella tua zona',
      content: `Ciao {supplier_name},

È disponibile un nuovo lead nella tua zona operativa:

**Dettagli Progetto:**
- Tipologia: {project_type}
- Stima costi: {cost_estimate}
- Località: {location}
- Scadenza offerta: {expiry_date}

**Azioni disponibili:**
- Visualizza dettagli: {lead_url}
- Acquista lead: {purchase_url}

Ricorda che questo lead è disponibile anche per altri fornitori della zona.

Saluti,
Il team BuildHomeAI`,
      enabled: true,
      variables: ['supplier_name', 'project_type', 'cost_estimate', 'location', 'expiry_date', 'lead_url', 'purchase_url']
    },
    {
      id: '2',
      name: 'Chiamata Vocale - Nuovo Lead',
      type: 'voice',
      trigger: 'lead_assigned',
      content: 'Salve {supplier_name}, è disponibile un nuovo lead di ristrutturazione nella sua zona operativa del valore stimato di {cost_estimate} euro. Acceda al suo pannello fornitore per visualizzare i dettagli e fare un preventivo. Grazie.',
      enabled: false,
      variables: ['supplier_name', 'cost_estimate']
    },
    {
      id: '3',
      name: 'Lead Acquistato',
      type: 'email',
      trigger: 'lead_purchased',
      subject: 'Lead acquistato con successo - Contatti cliente',
      content: `Complimenti {supplier_name}!

Hai acquistato con successo il lead {lead_id}.

**Contatti Cliente:**
- Nome: {client_name}
- Email: {client_email}
- Telefono: {client_phone}
- Indirizzo: {client_address}

**Prossimi passi:**
1. Contatta il cliente entro 24 ore
2. Fissa un sopralluogo
3. Prepara il preventivo

**Documenti:**
- Scarica il capitolato completo: {pdf_url}

Ti auguriamo buon lavoro!

Il team BuildHomeAI`,
      enabled: true,
      variables: ['supplier_name', 'lead_id', 'client_name', 'client_email', 'client_phone', 'client_address', 'pdf_url']
    },
    {
      id: '4',
      name: 'WhatsApp - Lead Scaduto',
      type: 'whatsapp',
      trigger: 'lead_expired',
      content: 'Ciao {supplier_name}, il lead {lead_id} del valore di {cost_estimate}€ è scaduto. Non perdere i prossimi! Mantieni attivo il tuo profilo su BuildHomeAI.',
      enabled: false,
      variables: ['supplier_name', 'lead_id', 'cost_estimate']
    }
  ];

  useEffect(() => {
    loadTemplates();
    loadSettings();
  }, []);

  const loadTemplates = () => {
    setTemplates(defaultTemplates);
  };

  const loadSettings = () => {
    // Load from localStorage or API
    const savedSettings = localStorage.getItem('notification_settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  };

  const saveSettings = () => {
    localStorage.setItem('notification_settings', JSON.stringify(settings));
    toast({
      title: "Impostazioni salvate",
      description: "Le configurazioni delle notifiche sono state aggiornate"
    });
  };

  const saveTemplate = (template: NotificationTemplate) => {
    setTemplates(prev => prev.map(t => t.id === template.id ? template : t));
    setEditingTemplate(null);
    toast({
      title: "Template salvato",
      description: "Il template di notifica è stato aggiornato"
    });
  };

  const addTemplate = () => {
    if (!newTemplate.name || !newTemplate.content) {
      toast({
        variant: "destructive",
        title: "Campi obbligatori",
        description: "Nome e contenuto sono obbligatori"
      });
      return;
    }

    const template: NotificationTemplate = {
      id: Date.now().toString(),
      name: newTemplate.name!,
      type: newTemplate.type || 'email',
      trigger: newTemplate.trigger || 'manual',
      subject: newTemplate.subject,
      content: newTemplate.content!,
      enabled: newTemplate.enabled || true,
      variables: extractVariables(newTemplate.content!)
    };

    setTemplates(prev => [...prev, template]);
    setNewTemplate({ type: 'email', enabled: true, variables: [] });
    setShowNewTemplate(false);

    toast({
      title: "Template aggiunto",
      description: "Il nuovo template di notifica è stato creato"
    });
  };

  const deleteTemplate = (templateId: string) => {
    if (!confirm("Sei sicuro di voler eliminare questo template?")) return;

    setTemplates(prev => prev.filter(t => t.id !== templateId));
    toast({
      title: "Template eliminato",
      description: "Il template è stato rimosso"
    });
  };

  const toggleTemplate = (templateId: string) => {
    setTemplates(prev => prev.map(template => 
      template.id === templateId ? { ...template, enabled: !template.enabled } : template
    ));
  };

  const extractVariables = (content: string): string[] => {
    const matches = content.match(/\{([^}]+)\}/g);
    return matches ? matches.map(match => match.slice(1, -1)) : [];
  };

  const testNotification = async (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    // Simulate sending test notification
    toast({
      title: "Test in corso...",
      description: `Invio notifica di test: ${template.name}`
    });

    setTimeout(() => {
      toast({
        title: "Test completato",
        description: `Notifica di test inviata con successo`
      });
    }, 2000);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'sms':
        return <MessageSquare className="h-4 w-4" />;
      case 'voice':
        return <Phone className="h-4 w-4" />;
      case 'whatsapp':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'email':
        return 'bg-blue-100 text-blue-800';
      case 'sms':
        return 'bg-green-100 text-green-800';
      case 'voice':
        return 'bg-purple-100 text-purple-800';
      case 'whatsapp':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Settings Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Impostazioni Notifiche
          </CardTitle>
          <CardDescription>
            Configura i canali di notifica e i parametri generali
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <Label>Email</Label>
              </div>
              <Switch
                checked={settings.emailEnabled}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, emailEnabled: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                <Label>SMS</Label>
              </div>
              <Switch
                checked={settings.smsEnabled}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, smsEnabled: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <Label>Chiamate</Label>
              </div>
              <Switch
                checked={settings.voiceEnabled}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, voiceEnabled: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                <Label>WhatsApp</Label>
              </div>
              <Switch
                checked={settings.whatsappEnabled}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, whatsappEnabled: checked }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Tentativi di Retry</Label>
              <Input
                type="number"
                value={settings.retryAttempts}
                onChange={(e) => setSettings(prev => ({ ...prev, retryAttempts: parseInt(e.target.value) }))}
                min="1"
                max="10"
              />
            </div>
            <div>
              <Label>Ritardo Retry (secondi)</Label>
              <Input
                type="number"
                value={settings.retryDelay}
                onChange={(e) => setSettings(prev => ({ ...prev, retryDelay: parseInt(e.target.value) }))}
                min="60"
                max="3600"
              />
            </div>
          </div>

          <Button onClick={saveSettings}>
            Salva Impostazioni
          </Button>
        </CardContent>
      </Card>

      {/* Templates Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Template Notifiche
          </CardTitle>
          <CardDescription>
            Gestisci i template per le notifiche automatiche
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Template Esistenti</h3>
            <Button onClick={() => setShowNewTemplate(true)}>
              Nuovo Template
            </Button>
          </div>

          {/* New Template Form */}
          {showNewTemplate && (
            <Card className="border-2 border-dashed">
              <CardHeader>
                <CardTitle className="text-lg">Nuovo Template</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Nome Template</Label>
                    <Input
                      value={newTemplate.name || ''}
                      onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Es. Nuovo Lead Email"
                    />
                  </div>
                  <div>
                    <Label>Tipo</Label>
                    <Select value={newTemplate.type} onValueChange={(value: any) => 
                      setNewTemplate(prev => ({ ...prev, type: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="sms">SMS</SelectItem>
                        <SelectItem value="voice">Chiamata Vocale</SelectItem>
                        <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Trigger</Label>
                    <Select value={newTemplate.trigger} onValueChange={(value) => 
                      setNewTemplate(prev => ({ ...prev, trigger: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona trigger" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lead_assigned">Lead Assegnato</SelectItem>
                        <SelectItem value="lead_purchased">Lead Acquistato</SelectItem>
                        <SelectItem value="lead_expired">Lead Scaduto</SelectItem>
                        <SelectItem value="payment_successful">Pagamento Riuscito</SelectItem>
                        <SelectItem value="payment_failed">Pagamento Fallito</SelectItem>
                        <SelectItem value="manual">Manuale</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {newTemplate.type === 'email' && (
                    <div>
                      <Label>Oggetto</Label>
                      <Input
                        value={newTemplate.subject || ''}
                        onChange={(e) => setNewTemplate(prev => ({ ...prev, subject: e.target.value }))}
                        placeholder="Oggetto email"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <Label>Contenuto</Label>
                  <Textarea
                    value={newTemplate.content || ''}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Scrivi il contenuto del template..."
                    rows={6}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Usa le variabili come {"{supplier_name}"}, {"{cost_estimate}"}, ecc.
                  </p>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowNewTemplate(false)}>
                    Annulla
                  </Button>
                  <Button onClick={addTemplate}>
                    Salva Template
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Templates List */}
          <div className="space-y-4">
            {templates.map((template) => (
              <Card key={template.id} className={!template.enabled ? 'opacity-60' : ''}>
                <CardContent className="pt-6">
                  {editingTemplate === template.id ? (
                    <EditTemplateForm
                      template={template}
                      onSave={saveTemplate}
                      onCancel={() => setEditingTemplate(null)}
                    />
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getTypeIcon(template.type)}
                          <div>
                            <h3 className="font-medium">{template.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              Trigger: {template.trigger}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getTypeColor(template.type)}>
                            {template.type.toUpperCase()}
                          </Badge>
                          <Badge variant={template.enabled ? 'default' : 'secondary'}>
                            {template.enabled ? 'Attivo' : 'Inattivo'}
                          </Badge>
                          <Switch
                            checked={template.enabled}
                            onCheckedChange={() => toggleTemplate(template.id)}
                          />
                        </div>
                      </div>

                      {template.subject && (
                        <div>
                          <strong className="text-sm">Oggetto:</strong>
                          <p className="text-sm text-muted-foreground">{template.subject}</p>
                        </div>
                      )}

                      <div>
                        <strong className="text-sm">Contenuto:</strong>
                        <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                          {template.content.length > 200 
                            ? template.content.substring(0, 200) + '...' 
                            : template.content
                          }
                        </p>
                      </div>

                      {template.variables.length > 0 && (
                        <div>
                          <strong className="text-sm">Variabili disponibili:</strong>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {template.variables.map((variable, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {`{${variable}}`}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingTemplate(template.id)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Modifica
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => testNotification(template.id)}
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Test
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteTemplate(template.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Elimina
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const EditTemplateForm = ({ 
  template, 
  onSave, 
  onCancel 
}: { 
  template: NotificationTemplate;
  onSave: (template: NotificationTemplate) => void;
  onCancel: () => void;
}) => {
  const [editedTemplate, setEditedTemplate] = useState(template);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Nome Template</Label>
          <Input
            value={editedTemplate.name}
            onChange={(e) => setEditedTemplate(prev => ({ ...prev, name: e.target.value }))}
          />
        </div>
        <div>
          <Label>Tipo</Label>
          <Select value={editedTemplate.type} onValueChange={(value: any) => 
            setEditedTemplate(prev => ({ ...prev, type: value }))
          }>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="sms">SMS</SelectItem>
              <SelectItem value="voice">Chiamata Vocale</SelectItem>
              <SelectItem value="whatsapp">WhatsApp</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {editedTemplate.type === 'email' && (
        <div>
          <Label>Oggetto</Label>
          <Input
            value={editedTemplate.subject || ''}
            onChange={(e) => setEditedTemplate(prev => ({ ...prev, subject: e.target.value }))}
          />
        </div>
      )}

      <div>
        <Label>Contenuto</Label>
        <Textarea
          value={editedTemplate.content}
          onChange={(e) => setEditedTemplate(prev => ({ 
            ...prev, 
            content: e.target.value,
            variables: e.target.value.match(/\{([^}]+)\}/g)?.map(match => match.slice(1, -1)) || []
          }))}
          rows={8}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Annulla
        </Button>
        <Button onClick={() => onSave(editedTemplate)}>
          Salva
        </Button>
      </div>
    </div>
  );
};

export default AdminNotifications;