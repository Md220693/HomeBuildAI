import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, Building2 } from "lucide-react";
import { z } from "zod";
import { GeographicSelector } from "@/components/supplier/GeographicSelector";
import { SupplierInfoSidebar } from "@/components/supplier/SupplierInfoSidebar";

const onboardingSchema = z.object({
  ragione_sociale: z.string().min(2, "Ragione sociale richiesta"),
  partita_iva: z.string().regex(/^\d{11}$/, "P.IVA deve essere di 11 cifre"),
  sito_web: z.string().url("URL non valido").optional().or(z.literal("")),
  contatto_referente: z.string().min(2, "Nome referente richiesto"),
  email: z.string().email("Email non valida"),
  telefono: z.string().min(10, "Numero di telefono non valido"),
  zona_operativa: z.array(z.string()).min(1, "Seleziona almeno una zona operativa"),
  codice_condotta_accettato: z.boolean().refine((val) => val === true, "Devi accettare il codice di condotta")
});

const SupplierOnboarding = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    ragione_sociale: "",
    partita_iva: "",
    sito_web: "",
    contatto_referente: "",
    email: "",
    telefono: "",
    zona_operativa: [] as string[],
    codice_condotta_accettato: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      const validatedData = onboardingSchema.parse(formData);

      if (!user) {
        toast({
          variant: "destructive",
          title: "Errore",
          description: "Devi essere autenticato per completare il profilo"
        });
        navigate('/fornitori/auth');
        return;
      }

      const { error } = await supabase
        .from('suppliers')
        .insert({
          user_id: user.id,
          ragione_sociale: validatedData.ragione_sociale,
          partita_iva: validatedData.partita_iva,
          sito_web: validatedData.sito_web || null,
          contatto_referente: validatedData.contatto_referente,
          email: validatedData.email,
          telefono: validatedData.telefono,
          zona_operativa: validatedData.zona_operativa,
          codice_condotta_accettato: validatedData.codice_condotta_accettato,
          onboarding_completato: true
        });

      if (error) {
        console.error('Supabase insert error:', error);
        throw error;
      }

      toast({
        title: "Profilo completato!",
        description: "Benvenuto in HomeBuildAI. Verrai reindirizzato alla dashboard..."
      });

      setTimeout(() => {
        navigate('/fornitori/dashboard', { replace: true });
        setTimeout(() => {
          if (window.location.pathname !== '/fornitori/dashboard') {
            window.location.href = '/fornitori/dashboard';
          }
        }, 100);
      }, 500);

    } catch (error: any) {
      console.error('Onboarding error:', error);
      
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            fieldErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(fieldErrors);
        
        toast({
          variant: "destructive",
          title: "Errori di validazione",
          description: "Controlla i campi evidenziati"
        });
      } else {
        toast({
          variant: "destructive",
          title: "Errore nel salvataggio",
          description: error.message || "Si è verificato un errore. Riprova."
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <Building2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">HomeBuildAI</h1>
              <p className="text-sm text-muted-foreground">Registrazione Fornitori</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Layout a 2 colonne */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Colonna Sinistra - Form (2/3) */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl">Completa il tuo Profilo</CardTitle>
                <CardDescription>
                  Inserisci i dati della tua azienda per iniziare a ricevere lead qualificati
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Dati Aziendali */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold border-b pb-2">Dati Aziendali</h3>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="ragione_sociale">Ragione Sociale *</Label>
                        <Input
                          id="ragione_sociale"
                          name="ragione_sociale"
                          value={formData.ragione_sociale}
                          onChange={handleInputChange}
                          className={errors.ragione_sociale ? "border-destructive" : ""}
                          required
                        />
                        {errors.ragione_sociale && (
                          <p className="text-sm text-destructive">{errors.ragione_sociale}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="partita_iva">Partita IVA *</Label>
                        <Input
                          id="partita_iva"
                          name="partita_iva"
                          value={formData.partita_iva}
                          onChange={handleInputChange}
                          maxLength={11}
                          placeholder="12345678901"
                          className={errors.partita_iva ? "border-destructive" : ""}
                          required
                        />
                        {errors.partita_iva && (
                          <p className="text-sm text-destructive">{errors.partita_iva}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sito_web">Sito Web</Label>
                      <Input
                        id="sito_web"
                        name="sito_web"
                        type="url"
                        placeholder="https://www.tuosito.it"
                        value={formData.sito_web}
                        onChange={handleInputChange}
                        className={errors.sito_web ? "border-destructive" : ""}
                      />
                      {errors.sito_web && (
                        <p className="text-sm text-destructive">{errors.sito_web}</p>
                      )}
                    </div>
                  </div>

                  {/* Dati di Contatto */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold border-b pb-2">Dati di Contatto</h3>
                    
                    <div className="space-y-2">
                      <Label htmlFor="contatto_referente">Nome Referente *</Label>
                      <Input
                        id="contatto_referente"
                        name="contatto_referente"
                        placeholder="Mario Rossi"
                        value={formData.contatto_referente}
                        onChange={handleInputChange}
                        className={errors.contatto_referente ? "border-destructive" : ""}
                        required
                      />
                      {errors.contatto_referente && (
                        <p className="text-sm text-destructive">{errors.contatto_referente}</p>
                      )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="info@tuaazienda.it"
                          value={formData.email}
                          onChange={handleInputChange}
                          className={errors.email ? "border-destructive" : ""}
                          required
                        />
                        {errors.email && (
                          <p className="text-sm text-destructive">{errors.email}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="telefono">Telefono *</Label>
                        <Input
                          id="telefono"
                          name="telefono"
                          type="tel"
                          placeholder="+39 333 1234567"
                          value={formData.telefono}
                          onChange={handleInputChange}
                          className={errors.telefono ? "border-destructive" : ""}
                          required
                        />
                        {errors.telefono && (
                          <p className="text-sm text-destructive">{errors.telefono}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Zona Operativa con nuovo selettore */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold border-b pb-2 mb-4">Zona Operativa</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Seleziona le regioni, province o comuni dove la tua azienda opera. 
                        Puoi selezionare intere regioni, province o singoli comuni.
                      </p>
                    </div>
                    
                    <GeographicSelector
                      value={formData.zona_operativa}
                      onChange={(value) => {
                        setFormData(prev => ({ ...prev, zona_operativa: value }));
                        if (errors.zona_operativa) {
                          setErrors(prev => ({ ...prev, zona_operativa: "" }));
                        }
                      }}
                      error={errors.zona_operativa}
                    />
                  </div>

                  {/* Codice di Condotta */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold border-b pb-2">Codice di Condotta</h3>
                    
                    <div className="flex items-start space-x-3 p-4 border rounded-lg bg-muted/50">
                      <Checkbox
                        id="codice_condotta"
                        checked={formData.codice_condotta_accettato}
                        onCheckedChange={(checked) => {
                          setFormData(prev => ({ ...prev, codice_condotta_accettato: checked === true }));
                          if (errors.codice_condotta_accettato) {
                            setErrors(prev => ({ ...prev, codice_condotta_accettato: "" }));
                          }
                        }}
                        className={errors.codice_condotta_accettato ? "border-destructive" : ""}
                        required
                      />
                      <div className="flex-1">
                        <Label 
                          htmlFor="codice_condotta" 
                          className="text-sm leading-relaxed cursor-pointer"
                        >
                          Accetto il codice di condotta e mi impegno a fornire servizi di qualità, 
                          rispettando i preventivi e le tempistiche concordate con i clienti. *
                        </Label>
                        {errors.codice_condotta_accettato && (
                          <p className="text-sm text-destructive mt-1">{errors.codice_condotta_accettato}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    size="lg"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Salvataggio in corso...
                      </>
                    ) : (
                      "Completa Registrazione e Vai alla Dashboard"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Colonna Destra - Sidebar Informativa (1/3) */}
          <SupplierInfoSidebar />
        </div>
      </div>
    </div>
  );
};

export default SupplierOnboarding;
