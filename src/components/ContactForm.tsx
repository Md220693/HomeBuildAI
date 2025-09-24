import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Phone, MapPin, Shield, Download, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ContactData {
  nome: string;
  cognome: string;
  email: string;
  telefono: string;
  indirizzo: string;
}

interface ContactFormProps {
  leadId: string;
  onSuccess: () => void;
}

const ContactForm = ({ leadId, onSuccess }: ContactFormProps) => {
  const [contactData, setContactData] = useState<ContactData>({
    nome: "",
    cognome: "",
    email: "",
    telefono: "",
    indirizzo: ""
  });
  const [otpCode, setOtpCode] = useState("");
  const [step, setStep] = useState<'contact' | 'otp'>('contact');
  const [isLoading, setIsLoading] = useState(false);
  const [debugOtp, setDebugOtp] = useState(""); // For development only
  const { toast } = useToast();

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!contactData.nome || !contactData.cognome || !contactData.email || !contactData.telefono || !contactData.indirizzo) {
      toast({
        variant: "destructive",
        title: "Campi mancanti",
        description: "Tutti i campi sono obbligatori"
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactData.email)) {
      toast({
        variant: "destructive",
        title: "Email non valida",
        description: "Inserisci un indirizzo email valido"
      });
      return;
    }

    // Validate phone format (basic Italian phone validation)
    const phoneRegex = /^(\+39|0039)?[\s]?([0-9]{2,3}[\s]?[0-9]{3,4}[\s]?[0-9]{3,4})$/;
    if (!phoneRegex.test(contactData.telefono.replace(/\s/g, ''))) {
      toast({
        variant: "destructive",
        title: "Numero di telefono non valido",
        description: "Inserisci un numero di telefono italiano valido"
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('send-otp', {
        body: { leadId, contactData }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      // In development, show debug OTP
      if (data.debug_otp) {
        setDebugOtp(data.debug_otp);
      }

      toast({
        title: "OTP inviato!",
        description: "Controlla il tuo telefono per il codice di verifica"
      });

      setStep('otp');
    } catch (error) {
      console.error('Error sending OTP:', error);
      toast({
        variant: "destructive",
        title: "Errore nell'invio OTP",
        description: error instanceof Error ? error.message : "Riprova più tardi"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otpCode || otpCode.length !== 6) {
      toast({
        variant: "destructive",
        title: "Codice OTP non valido",
        description: "Il codice deve essere di 6 cifre"
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('verify-otp-and-send-pdf', {
        body: { leadId, otpCode }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

        toast({
          title: "Stima generata con successo",
          description: "Controlla la tua email per il capitolato PDF"
        });

      onSuccess();
    } catch (error) {
      console.error('Error verifying OTP:', error);
      toast({
        variant: "destructive",
        title: "Errore nella verifica",
        description: error instanceof Error ? error.message : "Riprova"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resendOTP = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-otp', {
        body: { leadId, contactData }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      // Update debug OTP
      if (data.debug_otp) {
        setDebugOtp(data.debug_otp);
      }

      toast({
        title: "Nuovo OTP inviato!",
        description: "Controlla il tuo telefono"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Impossibile inviare nuovo OTP"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'contact') {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <User className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-semibold">Inserisci i tuoi dati</h2>
        </div>

        <form onSubmit={handleContactSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                value={contactData.nome}
                onChange={(e) => setContactData(prev => ({...prev, nome: e.target.value}))}
                placeholder="Il tuo nome"
                required
              />
            </div>
            <div>
              <Label htmlFor="cognome">Cognome *</Label>
              <Input
                id="cognome"
                value={contactData.cognome}
                onChange={(e) => setContactData(prev => ({...prev, cognome: e.target.value}))}
                placeholder="Il tuo cognome"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email *</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={contactData.email}
                onChange={(e) => setContactData(prev => ({...prev, email: e.target.value}))}
                placeholder="tua@email.com"
                className="pl-10"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="telefono">Telefono *</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="telefono"
                type="tel"
                value={contactData.telefono}
                onChange={(e) => setContactData(prev => ({...prev, telefono: e.target.value}))}
                placeholder="+39 123 456 7890"
                className="pl-10"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="indirizzo">Indirizzo Completo *</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="indirizzo"
                value={contactData.indirizzo}
                onChange={(e) => setContactData(prev => ({...prev, indirizzo: e.target.value}))}
                placeholder="Via, Città, CAP, Provincia"
                className="pl-10"
                required
              />
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
                Invio OTP...
              </>
            ) : (
              <>
                <Shield className="mr-2 h-4 w-4" />
                Invia Codice di Verifica
              </>
            )}
          </Button>
        </form>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="h-6 w-6 text-primary" />
        <h2 className="text-xl font-semibold">Verifica Codice OTP</h2>
      </div>

      <div className="text-center mb-6">
        <p className="text-muted-foreground">
          Inserisci i tuoi dati e verifica il numero di telefono per ricevere<br />
          il PDF con capitolato e stima al numero <strong>{contactData.telefono}</strong>
        </p>
        
        {/* Development only - show debug OTP */}
        {debugOtp && (
          <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded-md">
            <p className="text-sm text-yellow-800">
              <strong>Debug Mode:</strong> Il tuo codice OTP è: <strong>{debugOtp}</strong>
            </p>
          </div>
        )}
      </div>

      <form onSubmit={handleOtpSubmit} className="space-y-4">
        <div>
          <Label htmlFor="otp">Codice OTP (6 cifre)</Label>
          <Input
            id="otp"
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="123456"
            className="text-center text-lg tracking-widest"
            maxLength={6}
            required
          />
        </div>

        <Button 
          type="submit" 
          className="w-full" 
          variant="hero" 
          size="lg"
          disabled={isLoading || otpCode.length !== 6}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifica in corso...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Verifica e Scarica PDF
            </>
          )}
        </Button>

        <div className="text-center">
          <Button 
            type="button" 
            variant="ghost" 
            onClick={resendOTP}
            disabled={isLoading}
          >
            Non hai ricevuto il codice? Invia di nuovo
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default ContactForm;