import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building, User, Settings, LogOut, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

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

const SupplierDashboard = () => {
  const [supplier, setSupplier] = useState<SupplierProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/fornitori/auth');
      return;
    }

    loadSupplierProfile();
  }, [user, navigate]);

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
            Gestisci i tuoi servizi e opportunità di business
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Profilo Aziendale */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="mr-2 h-5 w-5" />
                Profilo Aziendale
              </CardTitle>
              <CardDescription>
                Informazioni della tua azienda
              </CardDescription>
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
                <div className="flex flex-wrap gap-2 mt-1">
                  {supplier.zona_operativa.map((zona, index) => (
                    <Badge key={index} variant="secondary">
                      {zona}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contatti */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5" />
                Contatti
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground">REFERENTE</h4>
                <p className="font-medium">{supplier.contatto_referente}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground">EMAIL</h4>
                <p className="font-medium">{supplier.email}</p>
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

          {/* Opportunità */}
          <Card>
            <CardHeader>
              <CardTitle>Opportunità</CardTitle>
              <CardDescription>
                Nuovi progetti disponibili
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6">
                <p className="text-muted-foreground text-sm">
                  Nessuna nuova opportunità al momento
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Statistiche */}
          <Card>
            <CardHeader>
              <CardTitle>Le tue Statistiche</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Progetti completati</span>
                <span className="font-medium">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Preventivi inviati</span>
                <span className="font-medium">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Rating medio</span>
                <span className="font-medium">N/A</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default SupplierDashboard;