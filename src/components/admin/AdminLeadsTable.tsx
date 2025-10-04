import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileText, Search, Filter, Eye, Edit, Trash2, Download, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Lead {
  id: string;
  status: string;
  created_at: string;
  user_contact?: any;
  interview_data?: any;
  cost_estimate_min?: number;
  cost_estimate_max?: number;
  current_assignments: number;
  max_assignments: number;
  assignment_type: string;
  capitolato_data?: any;
  cap?: string;
  citta?: string;
  regione?: string;
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
      .select('id, status, created_at, user_contact, interview_data, cost_estimate_min, cost_estimate_max, current_assignments, max_assignments, assignment_type, capitolato_data, cap, citta, regione')
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

  // Helper function per estrarre città da indirizzo (fallback per vecchi lead)
  const extractCityFromAddress = (address: string | null): string => {
    if (!address) return 'N/A';
    
    const cities = [
      'Milano', 'Roma', 'Napoli', 'Torino', 'Palermo', 'Genova', 
      'Bologna', 'Firenze', 'Bari', 'Catania', 'Verona', 'Venezia',
      'Messina', 'Padova', 'Trieste', 'Taranto', 'Brescia', 'Parma',
      'Modena', 'Reggio Calabria', 'Reggio Emilia', 'Perugia', 'Livorno', 
      'Cagliari', 'Arezzo', 'Teramo', 'Latina', 'Sassari', 'Pescara',
      'Bergamo', 'Trento', 'Vicenza', 'Treviso', 'Ferrara', 'Ravenna',
      'Rimini', 'Salerno', 'Foggia', 'Ancona', 'Bolzano', 'Novara',
      'Piacenza', 'Lecce', 'Siena', 'Udine', 'Como', 'La Spezia',
      'Pisa', 'Lucca', 'Brindisi'
    ];
    
    const found = cities.find(city => 
      address.toLowerCase().includes(city.toLowerCase())
    );
    
    return found || address.split(',')[0] || 'N/A';
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
                  <TableHead>Email</TableHead>
                  <TableHead>Città/Regione</TableHead>
                  <TableHead>Telefono</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Capitolato</TableHead>
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
                    <TableCell colSpan={12} className="text-center py-8">
                      Caricamento...
                    </TableCell>
                  </TableRow>
                 ) : filteredLeads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={12} className="text-center py-8 text-muted-foreground">
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
                          <div className="font-medium">
                            {lead.user_contact.nome} {lead.user_contact.cognome}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">N/D</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {lead.interview_data?.client_info?.email || lead.user_contact?.email || (
                            <span className="text-muted-foreground">N/D</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {lead.citta ? (
                            <>
                              <div className="font-medium">{lead.citta}</div>
                              {lead.regione && (
                                <div className="text-xs text-muted-foreground">
                                  {lead.regione}{lead.cap && ` - ${lead.cap}`}
                                </div>
                              )}
                            </>
                          ) : lead.user_contact?.indirizzo ? (
                            <div className="font-medium">
                              {extractCityFromAddress(lead.user_contact.indirizzo)}
                            </div>
                          ) : lead.interview_data?.project_details?.city ? (
                            <>
                              <div className="font-medium">{lead.interview_data.project_details.city}</div>
                              <div className="text-xs text-muted-foreground">{lead.interview_data.project_details.postal_code}</div>
                            </>
                          ) : lead.interview_data?.location ? (
                            <div className="text-xs">{lead.interview_data.location}</div>
                          ) : (
                            <span className="text-muted-foreground">N/D</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {lead.user_contact?.telefono || (
                            <span className="text-muted-foreground">N/D</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(lead.status)}
                      </TableCell>
                      <TableCell>
                        {lead.capitolato_data ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(`/capitolato?leadId=${lead.id}`, '_blank')}
                            className="flex items-center gap-2"
                          >
                            <FileText className="h-4 w-4" />
                            Visualizza
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        ) : (
                          <Badge variant="secondary">Non disponibile</Badge>
                        )}
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
                                <div className="space-y-6 max-h-[600px] overflow-y-auto">
                                   {/* Scheda Riassuntiva Cliente - IN EVIDENZA */}
                                  {(selectedLead.user_contact || selectedLead.interview_data?.client_info?.email) && (
                                    <div className="bg-primary/5 border-2 border-primary/20 rounded-lg p-4 space-y-3">
                                      <strong className="text-xl text-primary flex items-center gap-2">
                                        📋 Scheda Riassuntiva Cliente
                                      </strong>
                                      {selectedLead.user_contact ? (
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                          <div className="space-y-1">
                                            <div className="text-muted-foreground text-xs font-medium uppercase">Nome Completo</div>
                                            <div className="font-semibold text-base">{selectedLead.user_contact.nome} {selectedLead.user_contact.cognome}</div>
                                          </div>
                                          <div className="space-y-1">
                                            <div className="text-muted-foreground text-xs font-medium uppercase">Email</div>
                                            <a href={`mailto:${selectedLead.user_contact.email}`} className="text-primary hover:underline font-medium">{selectedLead.user_contact.email}</a>
                                          </div>
                                          <div className="space-y-1">
                                            <div className="text-muted-foreground text-xs font-medium uppercase">Telefono</div>
                                            <a href={`tel:${selectedLead.user_contact.telefono}`} className="text-primary hover:underline font-medium">{selectedLead.user_contact.telefono}</a>
                                          </div>
                                          {selectedLead.user_contact.indirizzo && (
                                            <div className="space-y-1">
                                              <div className="text-muted-foreground text-xs font-medium uppercase">Indirizzo</div>
                                              <div className="font-medium">{selectedLead.user_contact.indirizzo}</div>
                                            </div>
                                          )}
                                        </div>
                                      ) : (
                                        <div className="space-y-2">
                                          <div className="space-y-1">
                                            <div className="text-muted-foreground text-xs font-medium uppercase">Email (da intervista)</div>
                                            <a href={`mailto:${selectedLead.interview_data.client_info.email}`} className="text-primary hover:underline font-medium">{selectedLead.interview_data.client_info.email}</a>
                                          </div>
                                          <Badge variant="secondary" className="text-xs">
                                            ⚠️ Dati completi non ancora forniti
                                          </Badge>
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {/* Informazioni Lead */}
                                  <div className="space-y-2">
                                    <strong className="text-lg">Informazioni Lead</strong>
                                    <div className="ml-4 space-y-1 text-sm">
                                      <div><span className="font-medium">ID:</span> {selectedLead.id}</div>
                                      <div><span className="font-medium">Status:</span> {getStatusBadge(selectedLead.status)}</div>
                                      <div><span className="font-medium">Data Creazione:</span> {formatDate(selectedLead.created_at)}</div>
                                      <div><span className="font-medium">Tipo Assegnazione:</span> {selectedLead.assignment_type === 'exclusive' ? 'Esclusivo' : 'Condiviso'}</div>
                                      {(selectedLead.cost_estimate_min || selectedLead.cost_estimate_max) && (
                                        <div>
                                          <span className="font-medium">Stima Costi:</span> {formatCurrency(selectedLead.cost_estimate_min)} - {formatCurrency(selectedLead.cost_estimate_max)}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  
                                  {/* Report Intervista Completo */}
                                  {selectedLead.interview_data && (
                                    <div className="space-y-4 border-t pt-4">
                                      <strong className="text-lg">📝 Report Intervista Ristrutturazione</strong>
                                      
                                      {/* Dati Tecnici Progetto */}
                                      {selectedLead.interview_data.project_details && (
                                        <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                                          <div className="font-semibold text-base">🏗️ Dettagli Progetto</div>
                                          <div className="ml-4 space-y-2 text-sm">
                                            {selectedLead.interview_data.project_details.renovation_scope && (
                                              <div>
                                                <span className="font-medium">Tipo Ristrutturazione:</span> 
                                                <span className="ml-2 capitalize">{selectedLead.interview_data.project_details.renovation_scope === 'full' ? 'Completa' : selectedLead.interview_data.project_details.renovation_scope === 'partial' ? 'Parziale' : 'Micro-intervento'}</span>
                                              </div>
                                            )}
                                            {selectedLead.interview_data.project_details.target_rooms && selectedLead.interview_data.project_details.target_rooms.length > 0 && (
                                              <div>
                                                <span className="font-medium">Ambienti Interessati:</span>
                                                <div className="ml-4 flex flex-wrap gap-1 mt-1">
                                                  {selectedLead.interview_data.project_details.target_rooms.map((room: string) => (
                                                    <Badge key={room} variant="secondary" className="capitalize">{room}</Badge>
                                                  ))}
                                                </div>
                                              </div>
                                            )}
                                            {selectedLead.interview_data.project_details.location && (
                                              <div>
                                                <span className="font-medium">Località:</span> 
                                                <span className="ml-2">{selectedLead.interview_data.project_details.location}</span>
                                              </div>
                                            )}
                                            {selectedLead.interview_data.project_details.is_micro_intervention && (
                                              <div>
                                                <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400">⚠️ Micro-intervento</Badge>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      )}

                                      {/* Conversazione Completa */}
                                      {selectedLead.interview_data.conversation && selectedLead.interview_data.conversation.length > 0 && (
                                        <div className="space-y-3">
                                          <div className="font-semibold text-base">💬 Conversazione Completa</div>
                                          <div className="space-y-2 max-h-96 overflow-y-auto border rounded-lg p-3 bg-muted/10">
                                            {selectedLead.interview_data.conversation.map((msg: any, idx: number) => (
                                              <div 
                                                key={idx} 
                                                className={`p-3 rounded-lg ${
                                                  msg.role === 'assistant' 
                                                    ? 'bg-primary/5 border-l-2 border-primary' 
                                                    : 'bg-secondary/20 border-l-2 border-secondary ml-8'
                                                }`}
                                              >
                                                <div className="text-xs font-semibold mb-1 uppercase text-muted-foreground">
                                                  {msg.role === 'assistant' ? '🤖 AI' : '👤 Cliente'}
                                                </div>
                                                <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}

                                      {/* Metadata */}
                                      {selectedLead.interview_data.metadata && (
                                        <div className="text-xs text-muted-foreground border-t pt-3 space-y-1">
                                          <div><span className="font-medium">Data Completamento:</span> {selectedLead.interview_data.metadata.completed_at ? new Date(selectedLead.interview_data.metadata.completed_at).toLocaleString('it-IT') : '-'}</div>
                                          <div><span className="font-medium">Messaggi Scambiati:</span> {selectedLead.interview_data.metadata.message_count || '-'}</div>
                                          {selectedLead.interview_data.metadata.completion_trigger && (
                                            <div><span className="font-medium">Completamento:</span> {selectedLead.interview_data.metadata.completion_trigger}</div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {/* Messaggio se interview_data è vuoto */}
                                  {(!selectedLead.interview_data || Object.keys(selectedLead.interview_data).length === 0) && (
                                    <div className="border-t pt-4">
                                      <div className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border border-yellow-500/20 rounded-lg p-4 text-sm">
                                        ℹ️ Nessun dato di intervista disponibile. L'intervista potrebbe essere stata completata prima dell'implementazione di questa funzionalità.
                                      </div>
                                    </div>
                                  )}
                                  
                                  {selectedLead.capitolato_data && (
                                    <div className="space-y-2 border-t pt-4">
                                      <strong className="text-lg">Capitolato</strong>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => window.open(`/capitolato?leadId=${selectedLead.id}`, '_blank')}
                                        className="flex items-center gap-2"
                                      >
                                        <FileText className="h-4 w-4" />
                                        Visualizza Capitolato
                                        <ExternalLink className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  )}
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