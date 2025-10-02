import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building, User, Settings, LogOut, Loader2, AlertCircle, CheckCircle, MapPin, Home, Euro, Clock, FileText, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { formatZonaOperativaDisplay } from "@/data/italianMunicipalities";

interface SupplierProfile {
  id: string;
  ragione_sociale: string;
  partita_iva: string;
  sito_web?: string;
  contatto_referente: string;
  email: string;
  telefono: string;
  zona_operativa: string[];
  codice_condotta_accettato: boolean;
  onboarding_completato: boolean;
  attivo: boolean;
  created_at: string;
}

interface LeadInfo {
  id: string;
  zona: string;
  mq?: number;
  cost_estimate_min?: number;
  cost_estimate_max?: number;
  urgenza?: string;
  tipologia?: string;
  status: string;
  offered_at: string;
  purchased_at?: string;
  expires_at: string;
  price?: number;
}

interface SupplierLead {
  id: string;
  status: string;
  offered_at: string;
  purchased_at?: string;
  expires_at: string;
  price?: number;
  leads: {
    id: string;
    interview_data: any;
    capitolato_data: any;
    cost_estimate_min?: number;
    cost_estimate_max?: number;
    user_contact?: any;
    created_at: string;
    assignment_type?: string;
    max_assignments?: number;
    current_assignments?: number;
  };
}

const SupplierDashboard = () => {
  const [supplier, setSupplier] = useState<SupplierProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("nuovi-lead");
  const [supplierLeads, setSupplierLeads] = useState<SupplierLead[]>([]);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const { user, isInitialized, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isInitialized) return;
    
    if (!user) {
      navigate('/fornitori/auth');
      return;
    }

    loadSupplierProfile();
  }, [user, isInitialized, navigate]);

  useEffect(() => {
    if (supplier) {
      loadSupplierLeads();
    }
  }, [supplier]);

  const loadSupplierProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No profile found - redirect to onboarding
          navigate('/fornitori/onboarding');
        } else {
          throw error;
        }
        return;
      }

      setSupplier(data);
    } catch (error) {
      console.error('Error loading supplier profile:', error);
      toast({
        variant: "destructive",
        title: "Errore nel caricamento",
        description: "Impossibile caricare il profilo"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadSupplierLeads = async () => {
    setLeadsLoading(true);
    try {
      const { data, error } = await supabase
        .from('supplier_leads')
        .select(`
          *,
          leads (
            id,
            interview_data,
            capitolato_data,
            cost_estimate_min,
            cost_estimate_max,
            user_contact,
            created_at,
            assignment_type,
            max_assignments,
            current_assignments
          )
        `)
        .eq('supplier_id', supplier?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSupplierLeads(data || []);
    } catch (error) {
      console.error('Error loading supplier leads:', error);
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Impossibile caricare i lead"
      });
    } finally {
      setLeadsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/fornitori/auth');
      toast({
        title: "Disconnesso",
        description: "Sei stato disconnesso con successo"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Errore nella disconnessione"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Caricamento dashboard...</p>
        </div>
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <CardTitle>Profilo non trovato</CardTitle>
            <CardDescription>
              Non è stato trovato un profilo fornitore associato al tuo account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate('/fornitori/onboarding')}
              className="w-full"
              variant="hero"
            >
              Completa Registrazione
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <Building className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">BuildHomeAI</h1>
                <p className="text-sm text-muted-foreground">Portale Fornitori</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Badge variant={supplier.attivo ? "default" : "destructive"}>
                {supplier.attivo ? "Attivo" : "Inattivo"}
              </Badge>
              
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Impostazioni
              </Button>
              
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Esci
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Benvenuto, {supplier.contatto_referente}
          </h1>
          <p className="text-muted-foreground">
            Ricevi richieste qualificate con capitolati già pronti. Risparmia tempo e parla solo con clienti realmente interessati.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="nuovi-lead">Nuovi Lead</TabsTrigger>
            <TabsTrigger value="acquistati">Acquistati</TabsTrigger>
            <TabsTrigger value="storico">Storico</TabsTrigger>
            <TabsTrigger value="pagamenti">Pagamenti</TabsTrigger>
            <TabsTrigger value="impostazioni">Impostazioni</TabsTrigger>
          </TabsList>

          {/* Nuovi Lead Tab */}
          <TabsContent value="nuovi-lead" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Lead Disponibili</h2>
              <Badge variant="secondary">{supplierLeads.filter(l => l.status === 'offered').length} disponibili</Badge>
            </div>
            {leadsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <div className="grid gap-4">
                {supplierLeads
                  .filter(lead => lead.status === 'offered')
                  .map((supplierLead) => (
                    <LeadCard key={supplierLead.id} supplierLead={supplierLead} showContacts={false} />
                  ))}
                {supplierLeads.filter(l => l.status === 'offered').length === 0 && (
                  <Card>
                    <CardContent className="py-8 text-center">
                      <p className="text-muted-foreground">Nessun nuovo lead disponibile</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>

          {/* Lead Acquistati Tab */}
          <TabsContent value="acquistati" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Lead Acquistati</h2>
              <Badge variant="secondary">{supplierLeads.filter(l => l.status === 'purchased').length} acquistati</Badge>
            </div>
            <div className="grid gap-4">
              {supplierLeads
                .filter(lead => lead.status === 'purchased')
                .map((supplierLead) => (
                  <LeadCard key={supplierLead.id} supplierLead={supplierLead} showContacts={true} />
                ))}
              {supplierLeads.filter(l => l.status === 'purchased').length === 0 && (
                <Card>
                  <CardContent className="py-8 text-center">
                    <p className="text-muted-foreground">Nessun lead acquistato</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Storico Tab */}
          <TabsContent value="storico" className="space-y-4">
            <h2 className="text-2xl font-bold">Storico Lead</h2>
            <div className="grid gap-4">
              {supplierLeads
                .filter(lead => lead.status === 'expired' || lead.status === 'declined')
                .map((supplierLead) => (
                  <LeadCard key={supplierLead.id} supplierLead={supplierLead} showContacts={false} />
                ))}
              {supplierLeads.filter(l => l.status === 'expired' || l.status === 'declined').length === 0 && (
                <Card>
                  <CardContent className="py-8 text-center">
                    <p className="text-muted-foreground">Nessun lead nello storico</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Pagamenti Tab */}
          <TabsContent value="pagamenti" className="space-y-4">
            <h2 className="text-2xl font-bold">Pagamenti</h2>
            <Card>
              <CardContent className="py-8 text-center">
                <CreditCard className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Sezione pagamenti in arrivo</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Impostazioni Tab */}
          <TabsContent value="impostazioni" className="space-y-4">
            <h2 className="text-2xl font-bold">Impostazioni Profilo</h2>
            
            {/* Profilo Aziendale */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="mr-2 h-5 w-5" />
                  Profilo Aziendale
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground">RAGIONE SOCIALE</h4>
                    <p className="font-medium">{supplier.ragione_sociale}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground">PARTITA IVA</h4>
                    <p className="font-medium">{supplier.partita_iva}</p>
                  </div>
                </div>
                
                {supplier.sito_web && (
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground">SITO WEB</h4>
                    <p className="font-medium">
                      <a 
                        href={supplier.sito_web} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {supplier.sito_web}
                      </a>
                    </p>
                  </div>
                )}
                
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground">ZONA OPERATIVA</h4>
                  <p className="font-medium text-sm mt-1">
                    {formatZonaOperativaDisplay(supplier.zona_operativa)}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {supplier.zona_operativa.slice(0, 10).map((zona, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {zona.replace('REG:', '').replace('PROV:', 'Prov. ').replace('COM:', '')}
                      </Badge>
                    ))}
                    {supplier.zona_operativa.length > 10 && (
                      <Badge variant="outline" className="text-xs">
                        +{supplier.zona_operativa.length - 10} altre
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground">REFERENTE</h4>
                    <p className="font-medium">{supplier.contatto_referente}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground">EMAIL</h4>
                    <p className="font-medium">{supplier.email}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground">TELEFONO</h4>
                  <p className="font-medium">{supplier.telefono}</p>
                </div>
              </CardContent>
            </Card>

            {/* Stato Account */}
            <Card>
              <CardHeader>
                <CardTitle>Stato Account</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Onboarding</span>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Codice Condotta</span>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Account Attivo</span>
                  {supplier.attivo ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-destructive" />
                  )}
                </div>
                
                <div className="pt-3 border-t">
                  <p className="text-xs text-muted-foreground">
                    Membro dal {new Date(supplier.created_at).toLocaleDateString('it-IT')}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

// Lead Card Component
const LeadCard = ({ supplierLead, showContacts }: { supplierLead: SupplierLead; showContacts: boolean }) => {
  const { toast } = useToast();
  const lead = supplierLead.leads;
  
  // Extract info from interview_data and capitolato_data
  const getLeadInfo = () => {
    const interviewData = lead.interview_data || {};
    const capitolatoData = lead.capitolato_data || {};
    
    return {
      zona: interviewData.location || capitolatoData.zona || "Non specificata",
      mq: interviewData.propertySize || capitolatoData.mq,
      tipologia: interviewData.projectType || capitolatoData.tipologia_immobile || "Non specificata",
      urgenza: interviewData.timeline || "Non specificata"
    };
  };

  const leadInfo = getLeadInfo();
  const isExpired = new Date(supplierLead.expires_at) < new Date();
  
  const handlePurchaseLead = async () => {
    try {
      // Check if lead can still be purchased
      const { data: leadData, error: leadError } = await supabase
        .from('leads')
        .select('assignment_type, max_assignments, current_assignments')
        .eq('id', lead.id)
        .single();

      if (leadError) throw leadError;

      // Check purchase eligibility
      if (leadData.assignment_type === 'exclusive' && leadData.current_assignments > 0) {
        toast({
          variant: "destructive",
          title: "Lead non disponibile",
          description: "Questo lead è già stato acquistato in esclusiva"
        });
        return;
      }

      if (leadData.assignment_type === 'multi' && leadData.current_assignments >= leadData.max_assignments) {
        toast({
          variant: "destructive", 
          title: "Lead non disponibile",
          description: `Raggiunto il limite massimo di ${leadData.max_assignments} acquisti per questo lead`
        });
        return;
      }

      // Update supplier_lead status to purchased
      const { error: purchaseError } = await supabase
        .from('supplier_leads')
        .update({ 
          status: 'purchased',
          purchased_at: new Date().toISOString()
        })
        .eq('id', supplierLead.id);

      if (purchaseError) throw purchaseError;

      // Increment lead assignments count
      const { error: updateError } = await supabase
        .from('leads')
        .update({ 
          current_assignments: leadData.current_assignments + 1
        })
        .eq('id', lead.id);

      if (updateError) throw updateError;

      // If exclusive lead, mark all other assignments as expired
      if (leadData.assignment_type === 'exclusive') {
        await supabase
          .from('supplier_leads')
          .update({ status: 'expired' })
          .eq('lead_id', lead.id)
          .neq('id', supplierLead.id)
          .eq('status', 'offered');
      }

      toast({
        title: "Lead acquistato!",
        description: "Hai acquistato con successo questo lead. Ora puoi vedere i contatti del cliente."
      });

      // Refresh leads
      window.location.reload();

    } catch (error) {
      console.error('Error purchasing lead:', error);
      toast({
        variant: "destructive",
        title: "Errore nell'acquisto",
        description: "Si è verificato un errore durante l'acquisto del lead"
      });
    }
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return "N/A";
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'offered':
        return <Badge variant="secondary">Disponibile</Badge>;
      case 'purchased':
        return <Badge variant="default">Acquistato</Badge>;
      case 'expired':
        return <Badge variant="destructive">Scaduto</Badge>;
      case 'declined':
        return <Badge variant="outline">Rifiutato</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <Card className={`${isExpired ? 'opacity-60' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CardTitle className="text-lg">Lead #{lead.id.slice(0, 8)}</CardTitle>
            {getStatusBadge(supplierLead.status)}
          </div>
          {supplierLead.price && (
            <div className="text-right">
              <p className="font-semibold text-lg">{formatCurrency(supplierLead.price)}</p>
              <p className="text-xs text-muted-foreground">Prezzo lead</p>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Informazioni sintetiche del lead */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">ZONA</p>
              <p className="font-medium text-sm">{leadInfo.zona}</p>
            </div>
          </div>
          
          {leadInfo.mq && (
            <div className="flex items-center space-x-2">
              <Home className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">MQ</p>
                <p className="font-medium text-sm">{leadInfo.mq} m²</p>
              </div>
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            <Euro className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">BUDGET</p>
              <p className="font-medium text-sm">
                {lead.cost_estimate_min && lead.cost_estimate_max
                  ? `${formatCurrency(lead.cost_estimate_min)} - ${formatCurrency(lead.cost_estimate_max)}`
                  : "Da definire"}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">URGENZA</p>
              <p className="font-medium text-sm">{leadInfo.urgenza}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">TIPOLOGIA</p>
            <p className="font-medium text-sm">{leadInfo.tipologia}</p>
          </div>
        </div>

        {/* Informazioni sui tempi e tipo di lead */}
        <div className="flex justify-between items-center pt-2 border-t">
          <div className="text-xs text-muted-foreground">
            Offerto il {new Date(supplierLead.offered_at).toLocaleDateString('it-IT')}
          </div>
          <div className="flex items-center space-x-2">
            {lead.assignment_type === 'exclusive' ? (
              <Badge variant="destructive" className="text-xs">Esclusivo</Badge>
            ) : (
              <Badge variant="secondary" className="text-xs">
                Multi ({lead.current_assignments || 0}/{lead.max_assignments || 5})
              </Badge>
            )}
            {supplierLead.status === 'offered' && !isExpired && (
              <span className="text-xs text-muted-foreground">
                Scade il {new Date(supplierLead.expires_at).toLocaleDateString('it-IT')}
              </span>
            )}
          </div>
          {supplierLead.purchased_at && (
            <div className="text-xs text-muted-foreground">
              Acquistato il {new Date(supplierLead.purchased_at).toLocaleDateString('it-IT')}
            </div>
          )}
        </div>

        {/* Contatti cliente (solo se il lead è stato acquistato) */}
        {showContacts && lead.user_contact && (
          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-semibold text-sm mb-2">CONTATTI CLIENTE</h4>
            <div className="space-y-2">
              {lead.user_contact.name && (
                <p className="text-sm"><span className="font-medium">Nome:</span> {lead.user_contact.name}</p>
              )}
              {lead.user_contact.email && (
                <p className="text-sm"><span className="font-medium">Email:</span> {lead.user_contact.email}</p>
              )}
              {lead.user_contact.phone && (
                <p className="text-sm"><span className="font-medium">Telefono:</span> {lead.user_contact.phone}</p>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        {supplierLead.status === 'offered' && !isExpired && (
          <div className="flex gap-2 pt-2">
            <Button onClick={handlePurchaseLead} className="flex-1">
              Acquista Lead
            </Button>
            <Button variant="outline" onClick={() => {}}>
              Rifiuta
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SupplierDashboard;