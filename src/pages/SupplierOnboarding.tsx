import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { GeographicSelector } from "@/components/supplier/GeographicSelector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const SupplierOnboarding = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [telefono, setTelefono] = useState("");
  const [ragioneSociale, setRagioneSociale] = useState("");
  const [partitaIva, setPartitaIva] = useState("");
  const [zonaOperativa, setZonaOperativa] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  /* ---------------- WAIT FOR AUTH ---------------- */
/*
  if (authLoading) {
    return <Loader2 className="animate-spin" />;
   }

  if (!user) 
  {
    navigate("/login", { replace: true });
    return null;
  }    
*/

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

/*
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">
          Sessione scaduta. Effettua nuovamente l’accesso.
        </p>
      </div>
    );
  }
*/
  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = async () => {
    if (!firstName.trim()) return toast.error("Inserisci il nome");
    if (!lastName.trim()) return toast.error("Inserisci il cognome");
    if (!telefono.trim()) return toast.error("Inserisci il telefono");
    if (zonaOperativa.length === 0)
      return toast.error("Seleziona almeno una località");

    setLoading(true);
    console.log("user", user)
    const { error } = await supabase.from("suppliers").insert({
      user_id: user.id,
      email: user.email,
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      telefono: telefono.trim(),
      ragione_sociale: ragioneSociale || null,
      partita_iva: partitaIva || null,
      zona_operativa: zonaOperativa,
      onboarding_completato: true,
      codice_condotta_accettato: true,
      attivo: true,
    });

    setLoading(false);

    if (error) {
      console.error("Onboarding error:", error);
      toast.error("Errore durante il salvataggio");
      return;
    }

    toast.success("Profilo completato con successo 🎉");
    navigate("/fornitori/dashboard", { replace: true });
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="container max-w-xl py-10 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Completa il tuo profilo</h1>
        <p className="text-muted-foreground">
          Inserisci i dati per iniziare a ricevere richieste.
        </p>
      </div>

      <div className="space-y-4">
        <Input
          placeholder="Nome *"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
        <Input
          placeholder="Cognome *"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
        <Input
          placeholder="Telefono *"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
        />
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold">Dati aziendali (opzionale)</h3>
        <Input
          placeholder="Ragione sociale"
          value={ragioneSociale}
          onChange={(e) => setRagioneSociale(e.target.value)}
        />
        <Input
          placeholder="Partita IVA"
          value={partitaIva}
          onChange={(e) => setPartitaIva(e.target.value)}
        />
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold">Area di lavoro *</h3>
        <GeographicSelector
          value={zonaOperativa}
          onChange={setZonaOperativa}
        />
      </div>

      <Button className="w-full" disabled={loading} onClick={handleSubmit}>
        {loading ? "Salvataggio..." : "Completa registrazione"}
      </Button>
    </div>
  );
};

export default SupplierOnboarding;
