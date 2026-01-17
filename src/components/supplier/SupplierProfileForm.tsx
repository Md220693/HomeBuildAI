import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface SupplierProfileFormProps {
  supplier: any;
  onSave: (updatedSupplier: any) => void;
  onCancel: () => void;
}

const SupplierProfileForm = ({ supplier, onSave, onCancel }: SupplierProfileFormProps) => {
  const [firstName, setFirstName] = useState(supplier.first_name || "");
  const [lastName, setLastName] = useState(supplier.last_name || "");
  const [telefono, setTelefono] = useState(supplier.telefono || "");
  const [ragioneSociale, setRagioneSociale] = useState(supplier.ragione_sociale || "");
  const [partitaIva, setPartitaIva] = useState(supplier.partita_iva || "");
  const [sitoWeb, setSitoWeb] = useState(supplier.sito_web || "");
  const [zonaOperativa, setZonaOperativa] = useState<string[]>(supplier.zona_operativa || []);
  const [loading, setLoading] = useState(false);

  const validatePhone = (phone: string) => {
    const regex = /^(\+39|0039)?[\s]?([0-9]{2,3}[\s]?[0-9]{3,4}[\s]?[0-9]{3,4})$/;
    return regex.test(phone.replace(/\s/g, ""));
  };

  const handleSave = async () => {
    if (!firstName.trim()) return toast.error("Inserisci il nome");
    if (!lastName.trim()) return toast.error("Inserisci il cognome");
    if (!telefono.trim()) return toast.error("Inserisci il telefono");
    if (!validatePhone(telefono)) return toast.error("Numero di telefono non valido");

    setLoading(true);

    const { data, error } = await supabase
      .from("suppliers")
      .update({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        telefono: telefono.trim(),
        ragione_sociale: ragioneSociale || null,
        partita_iva: partitaIva || null,
        sito_web: sitoWeb || null,
        zona_operativa: zonaOperativa,
      })
      .eq("user_id", supplier.user_id)
      .select()
      .single();

    setLoading(false);

    if (error) {
      console.error("Update error:", error);
      toast.error("Errore durante l'aggiornamento del profilo");
      return;
    }

    toast.success("Profilo aggiornato con successo 🎉");
    onSave(data);
  };

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label>Nome *</Label>
          <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
        </div>
        <div>
          <Label>Cognome *</Label>
          <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
        </div>
      </div>

      <div>
        <Label>Telefono *</Label>
        <Input value={telefono} onChange={(e) => setTelefono(e.target.value)} />
        <p className="text-sm text-muted-foreground mt-1">Numero italiano valido richiesto</p>
      </div>

      <div>
        <Label>Ragione sociale (opzionale)</Label>
        <Input value={ragioneSociale} onChange={(e) => setRagioneSociale(e.target.value)} />
      </div>

      <div>
        <Label>Partita IVA (opzionale)</Label>
        <Input value={partitaIva} onChange={(e) => setPartitaIva(e.target.value)} />
      </div>

      <div>
        <Label>Sito web (opzionale)</Label>
        <Input value={sitoWeb} onChange={(e) => setSitoWeb(e.target.value)} />
      </div>

      {/* TODO: Add GeographicSelector if needed */}
      {/* <GeographicSelector value={zonaOperativa} onChange={setZonaOperativa} /> */}

      <div className="flex gap-4 mt-4">
        <Button variant="secondary" onClick={onCancel} disabled={loading}>
          Annulla
        </Button>
        <Button onClick={handleSave} disabled={loading}>
          {loading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null} Salva
        </Button>
      </div>
    </div>
  );
};

export default SupplierProfileForm;
