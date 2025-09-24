import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileText, Search, Filter, Eye, Edit, Trash2, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Lead {
  id: string;
  status: string;
  created_at: string;
  user_contact?: any;
  cost_estimate_min?: number;
  cost_estimate_max?: number;
  current_assignments: number;
  max_assignments: number;
  assignment_type: string;
}

const AdminLeadsTable = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadLeads();
  }, []);

  useEffect(() => {
    filterLeads();
  }, [leads, searchTerm, statusFilter]);

  const loadLeads = async () => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLeads(data || []);
    } catch (error) {
      console.error('Error loading leads:', error);
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Impossibile caricare i lead"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterLeads = () => {
    let filtered = leads;

    if (searchTerm) {
      filtered = filtered.filter(lead => {
        const contact = lead.user_contact;
        const searchLower = searchTerm.toLowerCase();
        return (
          lead.id.toLowerCase().includes(searchLower) ||
          contact?.nome?.toLowerCase().includes(searchLower) ||
          contact?.cognome?.toLowerCase().includes(searchLower) ||
          contact?.email?.toLowerCase().includes(searchLower)
        );
      });
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(lead => lead.status === statusFilter);
    }

    setFilteredLeads(filtered);
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'new': { label: 'Nuovo', variant: 'secondary' as const },
      'interview_completed': { label: 'Intervista Completata', variant: 'default' as const },
      'capitolato_generated': { label: 'Capitolato Generato', variant: 'default' as const },
      'queued': { label: 'In Coda', variant: 'default' as const },
      'assigned': { label: 'Assegnato', variant: 'default' as const },
      'completed': { label: 'Completato', variant: 'default' as const }
    };

    const statusInfo = statusMap[status as keyof typeof statusMap] || { label: status, variant: 'secondary' as const };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const updateLeadStatus = async (leadId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ status: newStatus })
        .eq('id', leadId);

      if (error) throw error;

      setLeads(prev => prev.map(lead => 
        lead.id === leadId ? { ...lead, status: newStatus } : lead
      ));

      toast({
        title: "Status aggiornato",
        description: "Lo stato del lead è stato modificato"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Impossibile aggiornare lo stato"
      });
    }
  };

  const deleteLead = async (leadId: string) => {
    if (!confirm("Sei sicuro di voler eliminare questo lead?")) return;

    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', leadId);

      if (error) throw error;

      setLeads(prev => prev.filter(lead => lead.id !== leadId));
      toast({
        title: "Lead eliminato",
        description: "Il lead è stato rimosso dal sistema"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Impossibile eliminare il lead"
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Gestione Lead
          </CardTitle>
          <CardDescription>
            Visualizza e gestisci tutti i lead del sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filtri */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cerca per ID, nome, email..."
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
                <SelectItem value="all">Tutti gli stati</SelectItem>
                <SelectItem value="new">Nuovo</SelectItem>
                <SelectItem value="interview_completed">Intervista Completata</SelectItem>
                <SelectItem value="capitolato_generated">Capitolato Generato</SelectItem>
                <SelectItem value="queued">In Coda</SelectItem>
                <SelectItem value="assigned">Assegnato</SelectItem>
                <SelectItem value="completed">Completato</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tabella */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Stima Costi</TableHead>
                  <TableHead>Assegnazioni</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Data Creazione</TableHead>
                  <TableHead>Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      Caricamento...
                    </TableCell>
                  </TableRow>
                ) : filteredLeads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Nessun lead trovato
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLeads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell className="font-mono text-sm">
                        {lead.id.slice(0, 8)}...
                      </TableCell>
                      <TableCell>
                        {lead.user_contact ? (
                          <div>
                            <div className="font-medium">
                              {lead.user_contact.nome} {lead.user_contact.cognome}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {lead.user_contact.email}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Non disponibile</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(lead.status)}
                      </TableCell>
                      <TableCell>
                        {lead.cost_estimate_min && lead.cost_estimate_max ? (
                          <div>
                            {formatCurrency(lead.cost_estimate_min)} - {formatCurrency(lead.cost_estimate_max)}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Non calcolata</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {lead.current_assignments || 0}/{lead.max_assignments || 5}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={lead.assignment_type === 'exclusive' ? 'default' : 'secondary'}>
                          {lead.assignment_type === 'exclusive' ? 'Esclusivo' : 'Condiviso'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDate(lead.created_at)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="icon"
                                onClick={() => setSelectedLead(lead)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Dettagli Lead</DialogTitle>
                                <DialogDescription>
                                  Informazioni complete del lead selezionato
                                </DialogDescription>
                              </DialogHeader>
                              {selectedLead && (
                                <div className="space-y-4">
                                  <div>
                                    <strong>ID:</strong> {selectedLead.id}
                                  </div>
                                  <div>
                                    <strong>Status:</strong> {getStatusBadge(selectedLead.status)}
                                  </div>
                                  {selectedLead.user_contact && (
                                    <div>
                                      <strong>Cliente:</strong>
                                      <div className="ml-4 mt-2 space-y-1">
                                        <div>Nome: {selectedLead.user_contact.nome} {selectedLead.user_contact.cognome}</div>
                                        <div>Email: {selectedLead.user_contact.email}</div>
                                        <div>Telefono: {selectedLead.user_contact.telefono}</div>
                                        <div>Indirizzo: {selectedLead.user_contact.indirizzo}</div>
                                      </div>
                                    </div>
                                  )}
                                  <div>
                                    <strong>Data Creazione:</strong> {formatDate(selectedLead.created_at)}
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                          
                          <Select onValueChange={(value) => updateLeadStatus(lead.id, value)}>
                            <SelectTrigger className="w-32">
                              <Edit className="h-4 w-4 mr-2" />
                              <SelectValue placeholder="Cambia stato" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="new">Nuovo</SelectItem>
                              <SelectItem value="queued">In Coda</SelectItem>
                              <SelectItem value="assigned">Assegnato</SelectItem>
                              <SelectItem value="completed">Completato</SelectItem>
                            </SelectContent>
                          </Select>

                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => deleteLead(lead.id)}
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

export default AdminLeadsTable;