import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Mail, Clock, AlertCircle, Download, Phone, ArrowRight, FileText, Euro, TrendingUp, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface ReportDeliveryProps {
  leadId: string;
}

const ReportDelivery = ({ leadId }: ReportDeliveryProps) => {
  const [status, setStatus] = useState<'processing' | 'delivered' | 'error'>('processing');
  const [reportData, setReportData] = useState<any>(null);
  const [isResending, setIsResending] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();


  useEffect(() => {
    const checkReportStatus = async () => {
      try {
      
        const { data: lead, error } = await supabase
          .from('leads')
          .select('*')
          .eq('id', leadId)
          .single();

        if (error) throw error;

        if (lead && lead.capitolato_data) {
          setReportData({
            estimatedCost: lead.cost_estimate_min && lead.cost_estimate_max 
              ? `€ ${lead.cost_estimate_min.toLocaleString('it-IT')} - € ${lead.cost_estimate_max.toLocaleString('it-IT')}`
              : "In elaborazione",
            timeline: "8-12 settimane",
            deliveredAt: new Date().toLocaleDateString('it-IT'),
            confidence: lead.confidence ? Math.round(lead.confidence * 100) : 75,
            pdfUrl: lead.pdf_url,
            userEmail: lead.user_contact?.email
          });
          
        
          if (lead.status === 'report_delivered' || lead.report_delivered_at || lead.pdf_url) {
            setStatus('delivered');
          } else {
        
            setTimeout(() => {
              setStatus('delivered');
          
              supabase
                .from('leads')
                .update({ 
                  status: 'report_delivered',
                  report_delivered_at: new Date().toISOString()
                })
                .eq('id', leadId);
            }, 3000);
          }
        } else {
          setStatus('error');
        }
      } catch (error) {
        console.error("Error checking report status:", error);
        setStatus('error');
        toast({
          variant: "destructive",
          title: "❌ Errore",
          description: "Impossibile caricare i dati del report"
        });
      }
    };

    if (leadId) {
      checkReportStatus();
    }
  }, [leadId, toast]);

  const handleResendEmail = async () => {
    try {
      setIsResending(true);
      
  
      const { data: lead, error: leadError } = await supabase
        .from('leads')
        .select('*, user_contact, pdf_url')
        .eq('id', leadId)
        .single();

      if (leadError) throw leadError;

      if (!lead.user_contact?.email) {
        throw new Error('Email non trovata per questo lead');
      }

      if (lead.pdf_url) {
      
        try {
          
          const { data, error } = await supabase.functions.invoke('generate-pdf', {
            body: { 
              leadId, 
              sendEmail: true 
            }
          });

          if (error) {
        
            toast({
              title: "📧 Controlla la tua email",
              description: "Il PDF è già stato inviato. Controlla la posta in arrivo e cartella spam."
            });
          } else if (data?.success) {
            toast({
              title: "✅ Email rinviata",
              description: "Il report è stato inviato nuovamente alla tua email"
            });
          }
        } catch (funcError) {
        
          toast({
            title: "📧 PDF Disponibile",
            description: "Il report è già nella tua email. Controlla la posta in arrivo."
          });
        }
      } else {
      
        const { data, error } = await supabase.functions.invoke('generate-pdf', {
          body: { leadId, sendEmail: true }
        });

        if (error) throw error;

        if (data?.success) {
          toast({
            title: "✅ Report generato e inviato",
            description: "Il report è stato creato e inviato alla tua email"
          });
        }
      }
    } catch (error) {
      console.error('Error resending email:', error);
      toast({
        variant: "destructive",
        title: "❌ Informazione",
        description: "Il report è già stato inviato al tuo indirizzo email. Controlla la posta in arrivo."
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleContactSuppliers = () => {
    toast({
      title: "Contatti imprese",
      description: "Ti metteremo in contatto con le imprese partner della tua zona"
    });
  };

  const handleOpenPDF = async () => {
    try {
      setIsDownloading(true);
      
  
      const { data: lead, error } = await supabase
        .from('leads')
        .select('pdf_url, user_contact')
        .eq('id', leadId)
        .single();

      if (error) throw error;

      if (lead.pdf_url) {
    
        console.log('Opening PDF URL:', lead.pdf_url);
        window.open(lead.pdf_url, '_blank');
        toast({
          title: "📄 PDF Aperto",
          description: "Il capitolato è stato aperto in una nuova scheda"
        });
      } else {
      
        toast({
          variant: "destructive",
          title: "📧 Controlla la Tua Email",
          description: "Il PDF completo è stato inviato al tuo indirizzo email. Controlla la posta in arrivo e la cartella spam."
        });
      }
    } catch (error) {
      console.error('Error opening PDF:', error);
      toast({
        variant: "destructive", 
        title: "❌ PDF Non Disponibile",
        description: "Il PDF non è al momento disponibile per il download diretto. Controlla la tua email per il report completo."
      });
    } finally {
      setIsDownloading(false);
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <Header />
      
      <div className="container max-w-6xl mx-auto py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            {status === 'processing' ? 'Generazione Report...' : 'Report Consegnato!'}
          </h1>
          <p className="text-xl text-muted-foreground">
            {status === 'processing' 
              ? 'Stiamo preparando il tuo capitolato tecnico personalizzato...' 
              : 'Il tuo capitolato tecnico è stato generato con successo'
            }
          </p>
        </motion.div>

        <div className="grid gap-8">
          {/* Main Status Card */}
          {status === 'processing' ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="p-12 text-center border-2 border-blue-200 bg-blue-50">
                <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                  <Clock className="h-10 w-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-blue-800 mb-4">
                  ⏳ Generazione in Corso
                </h2>
                <p className="text-lg text-blue-700">
                  La nostra AI sta analizzando i dati e generando il tuo capitolato tecnico...
                </p>
                <div className="mt-6">
                  <div className="w-32 h-2 bg-blue-200 rounded-full mx-auto overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full animate-pulse w-3/4"></div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ) : status === 'error' ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="p-12 text-center border-2 border-red-200 bg-red-50">
                <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-red-800 mb-4">
                  ❌ Errore nel Report
                </h2>
                <p className="text-lg text-red-700 mb-6">
                  Si è verificato un errore durante la generazione del report.
                </p>
                <Button onClick={() => navigate('/')}>
                  Torna alla Home
                </Button>
              </Card>
            </motion.div>
          ) : (
            <>
              {/* Success Message */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="p-8 text-center border-2 border-green-200 bg-green-50">
                  <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="h-10 w-10 text-white" />
                  </div>
                  
                  <h2 className="text-2xl font-bold text-green-800 mb-4">
                    ✅ Report Inviato con Successo
                  </h2>
                  
                  <p className="text-lg text-green-700 mb-6">
                    Il tuo capitolato tecnico dettagliato è stato inviato al tuo indirizzo email.
                    <br />
                    <strong>Controlla la tua casella di posta (e la cartella spam).</strong>
                  </p>

                  {reportData && (
                    <div className="grid md:grid-cols-3 gap-6 mb-6 max-w-4xl mx-auto">
                      <Card className="p-6 bg-white/50 text-center">
                        <Euro className="h-8 w-8 text-green-600 mx-auto mb-3" />
                        <div className="text-xl font-bold text-green-700 mb-1">
                          {reportData.estimatedCost}
                        </div>
                        <div className="text-sm text-green-600">Stima indicativa</div>
                      </Card>
                      <Card className="p-6 bg-white/50 text-center">
                        <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-3" />
                        <div className="text-xl font-bold text-green-700 mb-1">
                          {reportData.confidence}% accuratezza
                        </div>
                        <div className="text-sm text-green-600">Affidabilità stima</div>
                      </Card>
                      <Card className="p-6 bg-white/50 text-center">
                        <FileText className="h-8 w-8 text-green-600 mx-auto mb-3" />
                        <div className="text-xl font-bold text-green-700 mb-1">
                          {reportData.timeline}
                        </div>
                        <div className="text-sm text-green-600">Tempo stimato</div>
                      </Card>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Button 
                      onClick={handleResendEmail}
                      disabled={isResending}
                      variant="outline"
                      className="border-green-500 text-green-700 hover:bg-green-50"
                    >
                      {isResending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Invio in corso...
                        </>
                      ) : (
                        <>
                          <Mail className="w-4 h-4 mr-2" />
                          Rinvia Email
                        </>
                      )}
                    </Button>
                    
                    <Button 
                      onClick={() => window.open('https://mail.google.com', '_blank')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Apri Gmail
                    </Button>

                    <Button 
                      onClick={handleOpenPDF}
                      disabled={isDownloading}
                      variant="outline"
                      className="border-blue-500 text-blue-700 hover:bg-blue-50"
                    >
                      {isDownloading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Caricamento...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Scarica PDF
                        </>
                      )}
                    </Button>
                  </div>
                </Card>
              </motion.div>

              {/* Important Notes */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="p-6 border-2 border-amber-200 bg-amber-50">
                  <div className="flex items-start gap-4">
                    <AlertCircle className="h-6 w-6 text-amber-600 mt-1 flex-shrink-0" />
                    <div className="text-left">
                      <h3 className="text-lg font-semibold text-amber-800 mb-2">
                        💡 Nota Importante
                      </h3>
                      <div className="space-y-2 text-amber-700">
                        <p>
                          <strong>Questo è un preventivo indicativo</strong> basato sulla nostra AI avanzata e l'analisi dei dati forniti.
                        </p>
                        <p>
                          Per un <strong>preventivo vincolante</strong>, è sempre necessario un sopralluogo tecnico da parte delle imprese specializzate.
                        </p>
                        <p>
                          Il nostro team ti contatterà a breve per verificare la ricezione del report e proporti le migliori imprese partner della tua zona.
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportDelivery;