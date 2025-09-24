import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Building, User, Mail, Phone, Globe, MapPin, Loader2, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { z } from "zod";

const onboardingSchema = z.object({
  ragioneSociale: z.string().min(2, "Ragione sociale è obbligatoria"),
  partitaIva: z.string().regex(/^[0-9]{11}$/, "P.IVA deve essere di 11 cifre"),
  sitoWeb: z.string().url("URL non valido").optional().or(z.literal("")),
  contattoReferente: z.string().min(2, "Nome referente è obbligatorio"),
  email: z.string().email("Email non valida"),
  telefono: z.string().min(10, "Numero di telefono non valido"),
  zonaOperativa: z.string().min(5, "Indica almeno una zona operativa"),
  codiceCondotta: z.boolean().refine(val => val === true, "Devi accettare il codice di condotta")
});

const SupplierOnboarding = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    ragioneSociale: "",
    partitaIva: "",
    sitoWeb: "",
    contattoReferente: "",
    email: "",
    telefono: "",
    zonaOperativa: "",
    codiceCondotta: false
  });
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!user) {
    navigate('/fornitori/auth');
    return null;
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validatedData = onboardingSchema.parse(formData);
      setIsLoading(true);

      // Prepara i dati per il database
      const supplierData = {
        user_id: user.id,
        ragione_sociale: validatedData.ragioneSociale,
        partita_iva: validatedData.partitaIva,
        sito_web: validatedData.sitoWeb || null,
        contatto_referente: validatedData.contattoReferente,
        email: validatedData.email,
        telefono: validatedData.telefono,
        zona_operativa: validatedData.zonaOperativa.split(',').map(z => z.trim()),
        codice_condotta_accettato: validatedData.codiceCondotta,
        onboarding_completato: true,
        attivo: true
      };

      const { error } = await supabase
        .from('suppliers')
        .insert([supplierData]);

      if (error) {
        if (error.message.includes('duplicate')) {
          toast({
            variant: "destructive",
            title: "Dati duplicati",
            description: "P.IVA già registrata o profilo già esistente"
          });
        } else {
          throw error;
        }
        return;
      }

      toast({
        title: "Profilo creato con successo!",
        description: "Il tuo account fornitore è ora attivo",
        duration: 3000
      });

      navigate('/fornitori/dashboard');

    } catch (error) {
      console.error('Onboarding error:', error);
      if (error instanceof z.ZodError) {
        toast({
          variant: "destructive",
          title: "Dati non validi",
          description: error.errors[0]?.message
        });
      } else {
        toast({
          variant: "destructive",
          title: "Errore nel salvataggio",
          description: error instanceof Error ? error.message : "Riprova più tardi"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle p-6">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-elegant">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-4">
              <Building className="h-6 w-6 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl">Completa il tuo Profilo</CardTitle>
            <CardDescription>
              Inserisci i dati della tua azienda per attivare l'account fornitore
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Dati Aziendali */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <Building className="mr-2 h-5 w-5 text-primary" />
                  Dati Aziendali
                </h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ragioneSociale">Ragione Sociale *</Label>
                    <Input
                      id="ragioneSociale"
                      value={formData.ragioneSociale}
                      onChange={(e) => handleInputChange('ragioneSociale', e.target.value)}
                      placeholder="Es. ABC Costruzioni S.r.l."
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="partitaIva">Partita IVA *</Label>
                    <Input
                      id="partitaIva"
                      value={formData.partitaIva}
                      onChange={(e) => handleInputChange('partitaIva', e.target.value.replace(/\D/g, ''))}
                      placeholder="12345678901"
                      maxLength={11}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sitoWeb">Sito Web</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="sitoWeb"
                      type="url"
                      value={formData.sitoWeb}
                      onChange={(e) => handleInputChange('sitoWeb', e.target.value)}
                      placeholder="https://www.tuaazienda.com"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              {/* Contatto Referente */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <User className="mr-2 h-5 w-5 text-primary" />
                  Contatto Referente
                </h3>
                
                <div className="space-y-2">
                  <Label htmlFor="contattoReferente">Nome e Cognome *</Label>
                  <Input
                    id="contattoReferente"
                    value={formData.contattoReferente}
                    onChange={(e) => handleInputChange('contattoReferente', e.target.value)}
                    placeholder="Mario Rossi"
                    required
                  />
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="mario@azienda.com"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="telefono">Telefono *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="telefono"
                        type="tel"
                        value={formData.telefono}
                        onChange={(e) => handleInputChange('telefono', e.target.value)}
                        placeholder="+39 123 456 7890"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Zona Operativa */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <MapPin className="mr-2 h-5 w-5 text-primary" />
                  Zona Operativa
                </h3>
                
                <div className="space-y-2">
                  <Label htmlFor="zonaOperativa">CAP/Province di Servizio *</Label>
                  <Textarea
                    id="zonaOperativa"
                    value={formData.zonaOperativa}
                    onChange={(e) => handleInputChange('zonaOperativa', e.target.value)}
                    placeholder="Es. 20100, 20121, Milano, Monza-Brianza, Bergamo"
                    rows={3}
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    Separa con virgole i CAP e/o le province dove operi
                  </p>
                </div>
              </div>

              {/* Accettazione */}
              <div className="space-y-4">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="codiceCondotta"
                    checked={formData.codiceCondotta}
                    onCheckedChange={(checked) => handleInputChange('codiceCondotta', !!checked)}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label
                      htmlFor="codiceCondotta"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Accetto il Codice di Condotta *
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Accetti di rispettare gli standard di qualità e professionalità richiesti
                    </p>
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                variant="hero" 
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creazione profilo...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Completa Registrazione
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SupplierOnboarding;