import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { GeographicSelector } from "@/components/supplier/GeographicSelector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

/* ================= VALIDATIONS ================= */

const IT_PHONE_REGEX = /^(?:\+39|0039)?\s?3\d{8,9}$/;
const PIVA_REGEX = /^\d{11}$/;

const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const SupplierOnboarding = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  /* ================= STATE ================= */

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [telefono, setTelefono] = useState("");
  const [ragioneSociale, setRagioneSociale] = useState("");
  const [partitaIva, setPartitaIva] = useState("");
  const [sitoWeb, setSitoWeb] = useState("");
  const [zonaOperativa, setZonaOperativa] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  /* ================= AUTH WAIT ================= */

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  /* ================= SUBMIT ================= */

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Sessione non pronta, attendi...");
      return;
    }

    if (!firstName.trim()) return toast.error("Inserisci il nome");
    if (!lastName.trim()) return toast.error("Inserisci il cognome");
    if (!telefono.trim()) return toast.error("Inserisci il telefono");

    if (!IT_PHONE_REGEX.test(telefono.replace(/\s/g, ""))) {
      return toast.error("Inserisci un numero di telefono italiano valido");
    }

    if (partitaIva && !PIVA_REGEX.test(partitaIva)) {
      return toast.error("La Partita IVA deve contenere 11 cifre");
    }

    if (sitoWeb && !isValidUrl(sitoWeb)) {
      return toast.error("Inserisci un sito web valido (https://...)");
    }

    if (zonaOperativa.length === 0) {
      return toast.error("Seleziona almeno una zona operativa");
    }

    setLoading(true);

    const { error } = await supabase.from("suppliers").insert({
      user_id: user.id,
      email: user.email,
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      telefono: telefono.trim(),
      ragione_sociale: ragioneSociale || null,
      partita_iva: partitaIva || null,
      sito_web: sitoWeb || null,
      zona_operativa: zonaOperativa,
      onboarding_completato: true,
      codice_condotta_accettato: true,
      attivo: true,
    });

    setLoading(false);

    if (error) {
      console.error(error);
      toast.error("Errore durante il salvataggio");
      return;
    }

    toast.success("Profilo completato con successo 🎉");
    navigate("/fornitori/dashboard", { replace: true });
  };

  /* ================= UI ================= */

  return (
    <div className="container max-w-xl py-10 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Completa il tuo profilo</h1>
        <p className="text-muted-foreground">
          Inserisci i dati per iniziare a ricevere richieste.
        </p>
      </div>

      {/* PERSONALI */}
      <div className="space-y-4">
        <Input placeholder="Nome *" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
        <Input placeholder="Cognome *" value={lastName} onChange={(e) => setLastName(e.target.value)} />
        <Input placeholder="Telefono * (Italia)" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
      </div>

      {/* AZIENDALI */}
      <div className="space-y-3">
        <h3 className="font-semibold">
          Dati aziendali <span className="text-muted-foreground">(opzionale)</span>
        </h3>
        <Input placeholder="Ragione sociale (opzionale)" value={ragioneSociale} onChange={(e) => setRagioneSociale(e.target.value)} />
        <Input placeholder="Partita IVA (11 cifre)" value={partitaIva} onChange={(e) => setPartitaIva(e.target.value)} />
        <Input placeholder="Sito web (https://...)" value={sitoWeb} onChange={(e) => setSitoWeb(e.target.value)} />
      </div>

      {/* ZONA */}
      <div className="space-y-3">
        <h3 className="font-semibold">Area di lavoro *</h3>
        <GeographicSelector value={zonaOperativa} onChange={setZonaOperativa} />
      </div>

      <Button className="w-full" disabled={loading} onClick={handleSubmit}>
        {loading ? "Salvataggio..." : "Completa registrazione"}
      </Button>
    </div>
  );
};

export default SupplierOnboarding;
