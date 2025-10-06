import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ContactForm from "@/components/ContactForm";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ContactVerification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const leadId = searchParams.get("leadId");
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (!leadId) {
      toast.error("Lead ID mancante");
      navigate("/");
    }
  }, [leadId, navigate]);

  const handleSuccess = async () => {
    if (!leadId) return;
    
    setIsGenerating(true);
    
    try {
      console.log("Generating capitolato after OTP verification...");
      const { error } = await supabase.functions.invoke("generate-capitolato", {
        body: { leadId },
      });

      if (error) {
        console.error("Error generating capitolato:", error);
        toast.error("Errore nella generazione del capitolato");
        return;
      }

      toast.success("Capitolato generato con successo!");
      navigate(`/capitolato?leadId=${leadId}`);
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("Errore imprevisto durante la generazione");
    } finally {
      setIsGenerating(false);
    }
  };

  if (!leadId) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12 px-4">
      <div className="container max-w-2xl mx-auto">
        <Card className="border-2 shadow-lg">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-3xl font-bold">
              Intervista completata! 🎉
            </CardTitle>
            <CardDescription className="text-lg">
              Inserisci i tuoi dati per ricevere il capitolato tecnico personalizzato
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="text-muted-foreground">Generazione capitolato in corso...</p>
              </div>
            ) : (
              <ContactForm leadId={leadId} onSuccess={handleSuccess} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ContactVerification;
