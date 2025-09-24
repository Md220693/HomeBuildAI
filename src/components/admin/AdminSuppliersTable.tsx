import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, Search, Filter, Eye, Edit, Trash2, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Supplier {
  id: string;
  ragione_sociale: string;
  partita_iva: string;
  email: string;
  telefono: string;
  sito_web?: string;
  zona_operativa: string[];
  attivo: boolean;
  onboarding_completato: boolean;
  codice_condotta_accettato: boolean;
  created_at: string;
  updated_at: string;
}

const AdminSuppliersTable = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadSuppliers();
  }, []);

  useEffect(() => {
    filterSuppliers();
  }, [suppliers, searchTerm, statusFilter]);

  const loadSuppliers = async () => {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSuppliers(data || []);
    } catch (error) {
      console.error('Error loading suppliers:', error);
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Impossibile caricare i fornitori"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterSuppliers = () => {
    let filtered = suppliers;

    if (searchTerm) {
      filtered = filtered.filter(supplier => {
        const searchLower = searchTerm.toLowerCase();
        return (
          supplier.ragione_sociale.toLowerCase().includes(searchLower) ||
          supplier.partita_iva.toLowerCase().includes(searchLower) ||
          supplier.email.toLowerCase().includes(searchLower) ||
          supplier.telefono.toLowerCase().includes(searchLower)
        );
      });
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(supplier => {
        switch (statusFilter) {
          case 'active':
            return supplier.attivo && supplier.onboarding_completato;
          case 'inactive':
            return !supplier.attivo;
          case 'pending':
            return !supplier.onboarding_completato;
          default:
            return true;
        }
      });
    }

    setFilteredSuppliers(filtered);
  };

  const getStatusBadge = (supplier: Supplier) => {
    if (!supplier.onboarding_completato) {
      return <Badge variant="outline">Onboarding Incompleto</Badge>;
    }
    if (!supplier.attivo) {
      return <Badge variant="destructive">Disattivato</Badge>;
    }
    return <Badge variant="default">Attivo</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const toggleSupplierStatus = async (supplierId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('suppliers')
        .update({ attivo: !currentStatus })
        .eq('id', supplierId);

      if (error) throw error;

      setSuppliers(prev => prev.map(supplier => 
        supplier.id === supplierId ? { ...supplier, attivo: !currentStatus } : supplier
      ));

      toast({
        title: "Status aggiornato",
        description: `Fornitore ${!currentStatus ? 'attivato' : 'disattivato'}`
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Impossibile aggiornare lo stato"
      });
    }
  };

  const approveSupplier = async (supplierId: string) => {
    try {
      const { error } = await supabase
        .from('suppliers')
        .update({ 
          onboarding_completato: true,
          attivo: true
        })
        .eq('id', supplierId);

      if (error) throw error;

      setSuppliers(prev => prev.map(supplier => 
        supplier.id === supplierId 
          ? { ...supplier, onboarding_completato: true, attivo: true }
          : supplier
      ));

      toast({
        title: "Fornitore approvato",
        description: "L'onboarding è stato completato"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Impossibile approvare il fornitore"
      });
    }
  };

  const deleteSupplier = async (supplierId: string) => {
    if (!confirm("Sei sicuro di voler eliminare questo fornitore?")) return;

    try {
      const { error } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', supplierId);

      if (error) throw error;

      setSuppliers(prev => prev.filter(supplier => supplier.id !== supplierId));
      toast({
        title: "Fornitore eliminato",
        description: "Il fornitore è stato rimosso dal sistema"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Impossibile eliminare il fornitore"
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Gestione Fornitori
          </CardTitle>
          <CardDescription>
            Visualizza e gestisci tutti i fornitori registrati
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filtri */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cerca per ragione sociale, P.IVA, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filtra per stato" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti i fornitori</SelectItem>
                <SelectItem value="active">Attivi</SelectItem>
                <SelectItem value="inactive">Disattivati</SelectItem>
                <SelectItem value="pending">Onboarding Incompleto</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tabella */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ragione Sociale</TableHead>
                  <TableHead>P.IVA</TableHead>
                  <TableHead>Contatti</TableHead>
                  <TableHead>Zone Operative</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data Registrazione</TableHead>
                  <TableHead>Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Caricamento...
                    </TableCell>
                  </TableRow>
                ) : filteredSuppliers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Nessun fornitore trovato
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSuppliers.map((supplier) => (
                    <TableRow key={supplier.id}>
                      <TableCell className="font-medium">
                        {supplier.ragione_sociale}
                      </TableCell>
                      <TableCell className="font-mono">
                        {supplier.partita_iva}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm">{supplier.email}</div>
                          <div className="text-sm text-muted-foreground">{supplier.telefono}</div>
                          {supplier.sito_web && (
                            <div className="text-sm text-muted-foreground">{supplier.sito_web}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-48">
                          {supplier.zona_operativa.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {supplier.zona_operativa.slice(0, 3).map((zona, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {zona}
                                </Badge>
                              ))}
                              {supplier.zona_operativa.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{supplier.zona_operativa.length - 3}
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">Nessuna zona</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(supplier)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDate(supplier.created_at)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="icon"
                                onClick={() => setSelectedSupplier(supplier)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Dettagli Fornitore</DialogTitle>
                                <DialogDescription>
                                  Informazioni complete del fornitore selezionato
                                </DialogDescription>
                              </DialogHeader>
                              {selectedSupplier && (
                                <div className="space-y-4">
                                  <div>
                                    <strong>Ragione Sociale:</strong> {selectedSupplier.ragione_sociale}
                                  </div>
                                  <div>
                                    <strong>P.IVA:</strong> {selectedSupplier.partita_iva}
                                  </div>
                                  <div>
                                    <strong>Email:</strong> {selectedSupplier.email}
                                  </div>
                                  <div>
                                    <strong>Telefono:</strong> {selectedSupplier.telefono}
                                  </div>
                                  {selectedSupplier.sito_web && (
                                    <div>
                                      <strong>Sito Web:</strong> {selectedSupplier.sito_web}
                                    </div>
                                  )}
                                  <div>
                                    <strong>Zone Operative:</strong>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                      {selectedSupplier.zona_operativa.map((zona, index) => (
                                        <Badge key={index} variant="outline">
                                          {zona}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                  <div>
                                    <strong>Status:</strong>
                                    <div className="mt-2 space-y-2">
                                      <div className="flex items-center gap-2">
                                        {selectedSupplier.attivo ? <CheckCircle className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-red-600" />}
                                        Attivo: {selectedSupplier.attivo ? 'Sì' : 'No'}
                                      </div>
                                      <div className="flex items-center gap-2">
                                        {selectedSupplier.onboarding_completato ? <CheckCircle className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-red-600" />}
                                        Onboarding Completato: {selectedSupplier.onboarding_completato ? 'Sì' : 'No'}
                                      </div>
                                      <div className="flex items-center gap-2">
                                        {selectedSupplier.codice_condotta_accettato ? <CheckCircle className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-red-600" />}
                                        Codice Condotta Accettato: {selectedSupplier.codice_condotta_accettato ? 'Sì' : 'No'}
                                      </div>
                                    </div>
                                  </div>
                                  <div>
                                    <strong>Data Registrazione:</strong> {formatDate(selectedSupplier.created_at)}
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>

                          {!supplier.onboarding_completato && (
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => approveSupplier(supplier.id)}
                              title="Approva onboarding"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}

                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => toggleSupplierStatus(supplier.id, supplier.attivo)}
                            title={supplier.attivo ? 'Disattiva' : 'Attiva'}
                          >
                            {supplier.attivo ? 
                              <XCircle className="h-4 w-4" /> : 
                              <CheckCircle className="h-4 w-4" />
                            }
                          </Button>

                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => deleteSupplier(supplier.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSuppliersTable;