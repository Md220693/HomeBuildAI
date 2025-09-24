import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Euro, TrendingUp, Download, Loader2, AlertTriangle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import ContactForm from "@/components/ContactForm";
import { supabase } from "@/integrations/supabase/client";
import { useSearchParams, useNavigate } from "react-router-dom";

interface CapitolatoSection {
  descrizione: string;
  lavorazioni: string[];
  materiali: string[];
  quantita_stimate: string;
}

interface Capitolato {
  demolizioni: CapitolatoSection;
  impianti_elettrici: CapitolatoSection;
  impianti_idraulici: CapitolatoSection;
  murature: CapitolatoSection;
  massetti: CapitolatoSection;
  pavimenti: CapitolatoSection;
  serramenti: CapitolatoSection;
  pitturazioni: CapitolatoSection;
  opere_accessorie: CapitolatoSection;
}

interface LeadData {
  capitolato_data: Capitolato;
  cost_estimate_min: number;
  cost_estimate_max: number;
  confidence: number;
  disclaimer: string;
  user_contact?: {
    nome: string;
    cognome: string;
    email: string;
    telefono: string;
    indirizzo: string;
  };
}

const Capitolato = () => {
  const [leadData, setLeadData] = useState<LeadData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [isDownloadReady, setIsDownloadReady] = useState(false);
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const leadId = searchParams.get('leadId');

  useEffect(() => {
    if (!leadId) {
      toast({
        variant: "destructive",
        title: "Errore",
        description: "ID progetto mancante"
      });
      navigate('/');
      return;
    }

    loadCapitolato();
  }, [leadId, toast, navigate]);

  const loadCapitolato = async () => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('id', leadId)
        .single();

      if (error) throw error;

      // Check if OTP already verified (status = queued)
      if (data.status === 'queued' || data.otp_verified_at) {
        setIsDownloadReady(true);
      }

      if (!data.capitolato_data) {
        // Need to generate capitolato
        await generateCapitolato();
      } else {
        setLeadData({
          ...data,
          capitolato_data: data.capitolato_data as unknown as Capitolato,
          user_contact: data.user_contact as any
        } as LeadData);
      }
    } catch (error) {
      console.error('Error loading capitolato:', error);
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Impossibile caricare il capitolato"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleContactSuccess = () => {
    setIsDownloadReady(true);
    setShowContactForm(false);
    toast({
      title: "Verifica completata!",
      description: "Ora puoi scaricare il PDF del capitolato"
    });
  };

  const downloadPDF = () => {
    if (!isDownloadReady) {
      setShowContactForm(true);
      return;
    }
    
    // Create simple PDF download - in production use proper PDF generation
    const element = document.createElement('a');
    const file = new Blob([`
      CAPITOLATO TECNICO - BUILDHOMEAI
      
      Cliente: ${leadData?.user_contact?.nome} ${leadData?.user_contact?.cognome}
      Stima: €${leadData?.cost_estimate_min?.toLocaleString()} - €${leadData?.cost_estimate_max?.toLocaleString()}
      
      [Contenuto capitolato completo...]
    `], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `capitolato-buildhomeai-${leadId}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    toast({
      title: "Download avviato!",
      description: "Il PDF del capitolato è stato scaricato"
    });
  };

  const generateCapitolato = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-capitolato', {
        body: { leadId }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      toast({
        title: "Capitolato generato!",
        description: "Il tuo capitolato tecnico è pronto"
      });

      // Reload data
      await loadCapitolato();
    } catch (error) {
      console.error('Error generating capitolato:', error);
      toast({
        variant: "destructive",
        title: "Errore nella generazione",
        description: "Riprova più tardi"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-100';
    if (confidence >= 0.7) return 'text-blue-600 bg-blue-100';
    return 'text-yellow-600 bg-yellow-100';
  };

  const sectionTitles = {
    demolizioni: "Demolizioni e Preparazione",
    impianti_elettrici: "Impianti Elettrici",
    impianti_idraulici: "Impianti Idraulici/Termici",
    murature: "Murature e Tramezzi",
    massetti: "Massetti e Sottofondi",
    pavimenti: "Pavimenti e Rivestimenti",
    serramenti: "Serramenti e Infissi",
    pitturazioni: "Pitturazioni e Finiture",
    opere_accessorie: "Opere Accessorie"
  };

  if (isLoading || isGenerating) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <Header />
        <main className="container py-12">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <h1 className="text-2xl font-bold">
                {isGenerating ? "Generazione capitolato in corso..." : "Caricamento..."}
              </h1>
              <p className="text-muted-foreground">
                {isGenerating ? "L'AI sta analizzando i dati e creando il capitolato personalizzato" : "Attendere prego"}
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!leadData) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <Header />
        <main className="container py-12">
          <div className="max-w-4xl mx-auto text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-4">Capitolato non disponibile</h1>
            <Button onClick={() => navigate('/')} variant="outline">
              Torna alla home
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      
      <main className="container py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Capitolato Tecnico Personalizzato
            </h1>
            <p className="text-xl text-muted-foreground mb-6">
              Il tuo progetto di ristrutturazione analizzato in dettaglio
            </p>
            
            {/* Cost Estimate */}
            <Card className="p-6 mb-8 bg-gradient-accent">
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div>
                  <Euro className="h-8 w-8 mx-auto mb-2 text-accent-foreground" />
                  <h3 className="text-lg font-semibold text-accent-foreground mb-1">Stima Costi</h3>
                  <p className="text-2xl font-bold text-accent-foreground">
                    {formatCurrency(leadData.cost_estimate_min)} - {formatCurrency(leadData.cost_estimate_max)}
                  </p>
                </div>
                <div>
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 text-accent-foreground" />
                  <h3 className="text-lg font-semibold text-accent-foreground mb-1">Affidabilità</h3>
                  <Badge className={`text-sm px-3 py-1 ${getConfidenceColor(leadData.confidence)}`}>
                    {Math.round(leadData.confidence * 100)}% di confidenza
                  </Badge>
                </div>
                <div>
                  <Download className="h-8 w-8 mx-auto mb-2 text-accent-foreground" />
                  <h3 className="text-lg font-semibold text-accent-foreground mb-1">Documento</h3>
                  <Button 
                    variant="secondary" 
                    className="mt-1"
                    onClick={downloadPDF}
                  >
                    {isDownloadReady ? "Scarica PDF" : "Inserisci Dati"}
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Contact Form for PDF Download */}
          {showContactForm && (
            <div className="mb-8">
              <ContactForm 
                leadId={leadId!} 
                onSuccess={handleContactSuccess}
              />
            </div>
          )}

          {/* Capitolato Sections */}
          <div className="grid gap-6 mb-8">
            {Object.entries(leadData.capitolato_data).map(([key, section]) => (
              <Card key={key} className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="h-6 w-6 text-primary" />
                  <h2 className="text-xl font-semibold">
                    {sectionTitles[key as keyof typeof sectionTitles]}
                  </h2>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Descrizione</h3>
                    <p className="text-muted-foreground">{section.descrizione}</p>
                  </div>
                  
                  {section.lavorazioni.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Lavorazioni</h3>
                      <ul className="list-disc list-inside space-y-1">
                        {section.lavorazioni.map((lavorazione, idx) => (
                          <li key={idx} className="text-muted-foreground">{lavorazione}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {section.materiali.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Materiali</h3>
                      <div className="flex flex-wrap gap-2">
                        {section.materiali.map((materiale, idx) => (
                          <Badge key={idx} variant="secondary">
                            {materiale}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {section.quantita_stimate && (
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Quantità Stimate</h3>
                      <p className="text-muted-foreground">{section.quantita_stimate}</p>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {/* Disclaimer */}
          <Card className="p-6 bg-yellow-50 border-yellow-200 mb-8">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 text-yellow-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-yellow-800 mb-2">Importante</h3>
                <p className="text-yellow-700">
                  {leadData.disclaimer}
                </p>
              </div>
            </div>
          </Card>

          {/* Actions */}
          <div className="text-center">
            <div className="space-y-4">
              <div className="flex justify-center items-center gap-4">
                <Button 
                  variant="hero" 
                  size="lg"
                  onClick={downloadPDF}
                  className="inline-flex items-center"
                >
                  {isDownloadReady ? (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Scarica PDF Capitolato
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Inserisci Dati per Download PDF
                    </>
                  )}
                </Button>
                {isDownloadReady && (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                )}
              </div>
              
              <div className="space-x-4">
                <Button variant="outline" size="lg">
                  Richiedi Preventivo Dettagliato
                </Button>
                <Button variant="ghost" size="lg">
                  Modifica Progetto
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Capitolato;