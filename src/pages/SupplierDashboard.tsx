import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building,
  LogOut,
  Loader2,
  AlertCircle,
  Pencil,
  Save,
  X,
  MapPin,
  Euro,
  Clock,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

/* ================= TYPES ================= */

interface SupplierProfile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  ragione_sociale?: string;
  partita_iva?: string;
  telefono?: string;
  sito_web?: string;
  zona_operativa?: string[];
  attivo: boolean;
  created_at: string;
}

interface SupplierLead {
  id: string;
  status: string;
  price?: number;
  offered_at: string;
  expires_at: string;
  leads: {
    id: string;
    interview_data: any;
    cost_estimate_min?: number;
    cost_estimate_max?: number;
  };
}

/* ================= HELPERS ================= */

const formatCurrency = (v?: number) =>
  v
    ? new Intl.NumberFormat("it-IT", {
        style: "currency",
        currency: "EUR",
        maximumFractionDigits: 0,
      }).format(v)
    : "—";

/* ================= COMPONENT ================= */

const SupplierDashboard = () => {
  const [supplier, setSupplier] = useState<SupplierProfile | null>(null);
  const [leads, setLeads] = useState<SupplierLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("nuovi");
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<Partial<SupplierProfile>>({});

  const { user, loading: authLoading, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  /* ================= LOAD ================= */

  useEffect(() => {
    if (authLoading || !user) return;
    loadAll();
  }, [authLoading, user]);

  const loadAll = async () => {
    try {
      const { data: supplierData, error } = await supabase
        .from("suppliers")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();

    // 👇 supplier profile missing → onboarding
    if (!supplierData) {
      navigate("/fornitori/onboarding", { replace: true });
      return;
    }

    const { data: leadsData } = await supabase
      .from("supplier_leads")
      .select(`
        *,
        leads (
          id,
          interview_data,
          cost_estimate_min,
          cost_estimate_max
        )
      `)
      .eq("supplier_id", supplierData.id)
      .order("offered_at", { ascending: false });

    setSupplier(supplierData);
    setLeads(leadsData || []);
  } catch (err) {
    toast({
      variant: "destructive",
      title: "Errore",
      description: "Errore nel caricamento dashboard",
    });
  } finally {
    setLoading(false);
  }
};


  /* ================= SAVE PROFILE ================= */

  const handleSaveProfile = async () => {
    if (!supplier) return;

    const { error } = await supabase
      .from("suppliers")
      .update({
        first_name: formData.first_name,
        last_name: formData.last_name,
        telefono: formData.telefono,
        sito_web: formData.sito_web,
        ragione_sociale: formData.ragione_sociale,
        partita_iva: formData.partita_iva,
      })
      .eq("id", supplier.id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Salvataggio non riuscito",
      });
      return;
    }

    toast({ title: "Profilo aggiornato con successo" });
    setEditMode(false);
    loadAll();
  };

  /* ================= STATES ================= */

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <AlertCircle className="h-10 w-10 text-destructive" />
      </div>
    );
  }

  const nuovi = leads.filter((l) => l.status === "offered");
  const acquistati = leads.filter((l) => l.status === "purchased");
  const storico = leads.filter(
    (l) => l.status === "expired" || l.status === "declined"
  );

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* HEADER */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-6 py-4 flex justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <Building className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-lg">BuildHomeAI</h1>
              <p className="text-sm text-muted-foreground">
                Portale Fornitori
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge>{supplier.attivo ? "Attivo" : "Inattivo"}</Badge>
            <Button variant="ghost" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Esci
            </Button>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="container mx-auto px-6 py-8">
        <h2 className="text-3xl font-bold mb-1">
          Benvenuto, {supplier.first_name}
        </h2>
        <p className="text-muted-foreground mb-6">
          Ricevi lead qualificati e aumenta il tuo business.
        </p>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 max-w-xl">
            <TabsTrigger value="nuovi">Nuovi lead</TabsTrigger>
            <TabsTrigger value="acquistati">Acquistati</TabsTrigger>
            <TabsTrigger value="storico">Storico</TabsTrigger>
            <TabsTrigger value="profilo">Profilo</TabsTrigger>
          </TabsList>

          {/* -------- LEADS -------- */}
          <TabsContent value="nuovi">
            {nuovi.length === 0 && (
              <Card>
                <CardContent className="py-6 text-center text-muted-foreground">
                  Nessun nuovo lead disponibile
                </CardContent>
              </Card>
            )}
            {nuovi.map((l) => (
              <LeadCard key={l.id} lead={l} />
            ))}
          </TabsContent>

          <TabsContent value="acquistati">
            {acquistati.length === 0 && (
              <Card>
                <CardContent className="py-6 text-center text-muted-foreground">
                  Nessun lead acquistato
                </CardContent>
              </Card>
            )}
            {acquistati.map((l) => (
              <LeadCard key={l.id} lead={l} />
            ))}
          </TabsContent>

          <TabsContent value="storico">
            {storico.length === 0 && (
              <Card>
                <CardContent className="py-6 text-center text-muted-foreground">
                  Nessun lead nello storico
                </CardContent>
              </Card>
            )}
            {storico.map((l) => (
              <LeadCard key={l.id} lead={l} />
            ))}
          </TabsContent>

          {/* -------- PROFILO -------- */}
          <TabsContent value="profilo">
            <Card>
              <CardHeader className="flex flex-row justify-between">
                <CardTitle>Profilo fornitore</CardTitle>
                {!editMode && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setFormData(supplier);
                      setEditMode(true);
                    }}
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Modifica
                  </Button>
                )}
              </CardHeader>

              <CardContent className="space-y-4">
                {!editMode ? (
                  <>
                    <p><b>Nome:</b> {supplier.first_name}</p>
                    <p><b>Cognome:</b> {supplier.last_name}</p>
                    <p><b>Ragione sociale:</b> {supplier.ragione_sociale || "—"}</p>
                    <p><b>Partita IVA:</b> {supplier.partita_iva || "—"}</p>
                    <p><b>Telefono:</b> {supplier.telefono || "—"}</p>
                    <p><b>Sito web:</b> {supplier.sito_web || "—"}</p>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Nome</Label>
                        <Input
                          value={formData.first_name || ""}
                          onChange={(e) =>
                            setFormData({ ...formData, first_name: e.target.value })
                          }
                        />
                      </div>

                      <div>
                        <Label>Cognome</Label>
                        <Input
                          value={formData.last_name || ""}
                          onChange={(e) =>
                            setFormData({ ...formData, last_name: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Ragione sociale (opzionale)</Label>
                      <Input
                        value={formData.ragione_sociale || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            ragione_sociale: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div>
                      <Label>Partita IVA (opzionale)</Label>
                      <Input
                        value={formData.partita_iva || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            partita_iva: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div>
                      <Label>Telefono</Label>
                      <Input
                        value={formData.telefono || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, telefono: e.target.value })
                        }
                      />
                    </div>

                    <div>
                      <Label>Sito web</Label>
                      <Input
                        value={formData.sito_web || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, sito_web: e.target.value })
                        }
                      />
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button onClick={handleSaveProfile}>
                        <Save className="h-4 w-4 mr-2" />
                        Salva
                      </Button>

                      <Button
                        variant="ghost"
                        onClick={() => setEditMode(false)}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Annulla
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

/* ================= LEAD CARD ================= */

const LeadCard = ({ lead }: { lead: SupplierLead }) => {
  const info = lead.leads?.interview_data || {};

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Lead #{lead.leads.id.slice(0, 8)}</CardTitle>
      </CardHeader>

      <CardContent className="grid md:grid-cols-3 gap-4">
        <div className="flex gap-2">
          <MapPin className="h-4 w-4 mt-1" />
          <div>
            <p className="text-xs text-muted-foreground">Zona</p>
            <p>{info.location || "—"}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Euro className="h-4 w-4 mt-1" />
          <div>
            <p className="text-xs text-muted-foreground">Budget</p>
            <p>
              {formatCurrency(lead.leads.cost_estimate_min)} –{" "}
              {formatCurrency(lead.leads.cost_estimate_max)}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Clock className="h-4 w-4 mt-1" />
          <div>
            <p className="text-xs text-muted-foreground">Urgenza</p>
            <p>{info.timeline || "—"}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SupplierDashboard;
