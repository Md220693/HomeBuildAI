import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Mail, Clock, AlertCircle, Download, ArrowRight, FileText, Euro, TrendingUp, Loader2 } from "lucide-react";
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

        if (lead) {
          setReportData({
            estimatedCost: lead.cost_estimate_min && lead.cost_estimate_max 
              ? `€ ${lead.cost_estimate_min.toLocaleString('it-IT')} - € ${lead.cost_estimate_max.toLocaleString('it-IT')}`
              : "In elaborazione",
            timeline: "8-12 settimane",
            deliveredAt: new Date().toLocaleDateString('it-IT'),
            confidence: lead.confidence ? Math.round(lead.confidence * 100) : 75,
            pdfUrl: lead.pdf_url,
            userEmail: lead.user_contact?.email,
            userContact: lead.user_contact
          });
          
    
          if (lead.status === 'generating_pdf') {
            setStatus('processing');
            startPollingStatus();
          } else if (lead.status === 'ready' || lead.pdf_url) {
            setStatus('delivered');
          } else {
            setStatus('processing');
            startPollingStatus();
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

  const startPollingStatus = () => {
    const interval = setInterval(async () => {
      try {
        const { data: lead, error } = await supabase
          .from('leads')
          .select('status, pdf_url')
          .eq('id', leadId)
          .single();

        if (error) {
          clearInterval(interval);
          return;
        }

        if (lead.status === 'ready' || lead.pdf_url) {
          clearInterval(interval);
          setStatus('delivered');
          
          const { data: fullLead } = await supabase
            .from('leads')
            .select('*')
            .eq('id', leadId)
            .single();

          if (fullLead) {
            setReportData(prev => ({
              ...prev,
              pdfUrl: fullLead.pdf_url,
              userEmail: fullLead.user_contact?.email,
              userContact: fullLead.user_contact
            }));
          }
        } else if (lead.status === 'pdf_generation_failed' || lead.status === 'background_error') {
          clearInterval(interval);
          setStatus('error');
          toast({
            variant: "destructive",
            title: "❌ Errore di generazione",
            description: "Si è verificato un errore durante la generazione del PDF"
          });
        }
      } catch (error) {
        console.error("Error polling status:", error);
        clearInterval(interval);
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(interval);
  };

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
        throw new Error('Email non trovata');
      }

      if (!lead.pdf_url) {
        toast({
          variant: "destructive",
          title: "❌ PDF non disponibile",
          description: "Il PDF non è ancora stato generato. Attendi il completamento."
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('resend-pdf-email', {
        body: { 
          leadId,
          email: lead.user_contact.email,
          pdfUrl: lead.pdf_url,
          userName: lead.user_contact.nome || lead.user_contact.email
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: "✅ Email rinviata",
          description: "Il report è stato inviato nuovamente alla tua email"
        });
        
        await supabase
          .from('leads')
          .update({ 
            email_resent_at: new Date().toISOString()
          })
          .eq('id', leadId);
      } else {
        throw new Error(data?.error || 'Failed to resend email');
      }
    } catch (error) {
      console.error('Error resending email:', error);
      toast({
        variant: "destructive",
        title: "❌ Errore",
        description: "Impossibile rinviare l'email. Riprova più tardi."
      });
    } finally {
      setIsResending(false);
    }
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
          title: "📧 PDF Non Disponibile",
          description: "Il PDF non è ancora stato generato. Attendi il completamento o controlla la tua email."
        });
      }
    } catch (error) {
      console.error('Error opening PDF:', error);
      toast({
        variant: "destructive", 
        title: "❌ PDF Non Disponibile",
        description: "Il PDF non è al momento disponibile. Controlla la tua email per il report completo."
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="container max-w-4xl mx-auto py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            {status === 'processing' ? 'Generazione PDF...' : 'Report Consegnato'}
          </h1>
          <p className="text-gray-600 text-sm">
            {status === 'processing' 
              ? 'Stiamo preparando il tuo capitolato tecnico personalizzato...' 
              : 'Il tuo capitolato tecnico è stato generato'
            }
          </p>
        </motion.div>

        <div className="space-y-6">
          {status === 'processing' ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="p-8 text-center border border-gray-200 bg-blue-50">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Loader2 className="h-8 w-8 text-white animate-spin" />
                </div>
                <h2 className="text-lg font-semibold text-blue-800 mb-3">
                  ⏳ Generazione in corso
                </h2>
                <p className="text-blue-700 text-sm mb-4">
                  La nostra AI sta analizzando i dati e generando il tuo capitolato tecnico...
                </p>
                <div className="w-40 h-1.5 bg-blue-200 rounded-full mx-auto overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full animate-pulse w-3/4"></div>
                </div>
                <p className="text-blue-600 text-xs mt-4">
                  Questa operazione potrebbe richiedere alcuni secondi
                </p>
              </Card>
            </motion.div>
          ) : status === 'error' ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="p-8 text-center border border-red-200 bg-red-50">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-lg font-semibold text-red-800 mb-3">
                  ❌ Errore nel report
                </h2>
                <p className="text-red-700 text-sm mb-4">
                  Si è verificato un errore durante la generazione del report.
                </p>
                <Button 
                  onClick={() => navigate('/')}
                  variant="outline"
                  size="sm"
                >
                  Torna alla Home
                </Button>
              </Card>
            </motion.div>
          ) : (
            <>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="p-6 text-center border border-green-200 bg-green-50">
                  <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-7 w-7 text-white" />
                  </div>
                  
                  <h2 className="text-lg font-semibold text-green-800 mb-3">
                    ✅ Report Pronto
                  </h2>
                  
                  <p className="text-green-700 text-sm mb-4">
                    Il tuo capitolato tecnico dettagliato è stato generato con successo.
                    {reportData?.userEmail && (
                      <span className="block mt-1">
                        Inviato a: <strong>{reportData.userEmail}</strong>
                      </span>
                    )}
                  </p>

                  {reportData && (
                    <div className="grid sm:grid-cols-3 gap-4 mb-6">
                      <Card className="p-4 bg-white/50 border border-green-100">
                        <Euro className="h-6 w-6 text-green-600 mx-auto mb-2" />
                        <div className="text-base font-semibold text-green-700 mb-1">
                          {reportData.estimatedCost}
                        </div>
                        <div className="text-xs text-green-600">Stima indicativa</div>
                      </Card>
                      <Card className="p-4 bg-white/50 border border-green-100">
                        <TrendingUp className="h-6 w-6 text-green-600 mx-auto mb-2" />
                        <div className="text-base font-semibold text-green-700 mb-1">
                          {reportData.confidence}% accuratezza
                        </div>
                        <div className="text-xs text-green-600">Affidabilità stima</div>
                      </Card>
                      <Card className="p-4 bg-white/50 border border-green-100">
                        <FileText className="h-6 w-6 text-green-600 mx-auto mb-2" />
                        <div className="text-base font-semibold text-green-700 mb-1">
                          {reportData.timeline}
                        </div>
                        <div className="text-xs text-green-600">Tempo stimato</div>
                      </Card>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                    <Button 
                      onClick={handleResendEmail}
                      disabled={isResending}
                      variant="outline"
                      size="sm"
                      className="border-green-500 text-green-700 hover:bg-green-50 text-sm"
                    >
                      {isResending ? (
                        <>
                          <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                          Invio in corso...
                        </>
                      ) : (
                        <>
                          <Mail className="w-3 h-3 mr-2" />
                          Rinvia email
                        </>
                      )}
                    </Button>
                    
                    <Button 
                      onClick={() => window.open('https://mail.google.com', '_blank')}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-sm"
                    >
                      <Mail className="w-3 h-3 mr-2" />
                      Apri Gmail
                    </Button>

                    <Button 
                      onClick={handleOpenPDF}
                      disabled={isDownloading || !reportData?.pdfUrl}
                      variant="outline"
                      size="sm"
                      className="border-blue-500 text-blue-700 hover:bg-blue-50 text-sm"
                    >
                      {isDownloading ? (
                        <>
                          <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                          Caricamento...
                        </>
                      ) : (
                        <>
                          <Download className="w-3 h-3 mr-2" />
                          Scarica PDF
                        </>
                      )}
                    </Button>
                  </div>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="p-5 border border-amber-200 bg-amber-50">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-4 w-4 text-amber-600 mt-1 flex-shrink-0" />
                    <div className="text-left">
                      <h3 className="text-sm font-semibold text-amber-800 mb-2">
                        💡 Nota importante
                      </h3>
                      <div className="space-y-1.5 text-amber-700 text-xs">
                        <p>
                          <strong>Questo è un preventivo indicativo</strong> basato sulla nostra AI e l'analisi dei dati forniti.
                        </p>
                        <p>
                          Per un <strong>preventivo vincolante</strong>, è necessario un sopralluogo tecnico.
                        </p>
                        <p>
                          Il nostro team ti contatterà a breve per verificare la ricezione del report.
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