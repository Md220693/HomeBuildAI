import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileText, Trash2, Download, CheckCircle, XCircle } from 'lucide-react';

interface RegionalPricelist {
  id: string;
  nome_regione: string;
  anno_riferimento: number;
  fonte: string;
  attivo: boolean;
  file_originale_url?: string;
  file_originale_name?: string;
  created_at: string;
  note?: string;
  items_count?: number;
}

interface UploadForm {
  file: File | null;
  nome_regione: string;
  anno_riferimento: number;
  note: string;
}

export const RegionalPricelistsTab = () => {
  const { toast } = useToast();
  const [pricelists, setPricelists] = useState<RegionalPricelist[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadForm, setUploadForm] = useState<UploadForm>({
    file: null,
    nome_regione: '',
    anno_riferimento: new Date().getFullYear(),
    note: ''
  });

  useEffect(() => {
    loadPricelists();
  }, []);

  const loadPricelists = async () => {
    try {
      const { data: pricelistsData, error } = await supabase
        .from('regional_pricelists')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get items count for each pricelist
      const pricelistsWithCounts = await Promise.all(
        (pricelistsData || []).map(async (pricelist) => {
          const { count } = await supabase
            .from('price_items')
            .select('id', { count: 'exact' })
            .eq('regional_pricelist_id', pricelist.id);

          return { ...pricelist, items_count: count || 0 };
        })
      );

      setPricelists(pricelistsWithCounts);
    } catch (error) {
      console.error('Error loading pricelists:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile caricare i prezziari',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async () => {
    if (!uploadForm.file || !uploadForm.nome_regione) {
      toast({
        title: 'Errore',
        description: 'Seleziona un file e specifica la regione',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    
    try {
      // Convert file to base64
      const fileData = await fileToBase64(uploadForm.file);
      
      const { data, error } = await supabase.functions.invoke('parse-regional-pricelist', {
        body: {
          file_data: fileData,
          file_name: uploadForm.file.name,
          file_type: uploadForm.file.type,
          nome_regione: uploadForm.nome_regione,
          anno_riferimento: uploadForm.anno_riferimento,
          note: uploadForm.note
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: 'Successo',
          description: data.message,
        });

        // Reset form
        setUploadForm({
          file: null,
          nome_regione: '',
          anno_riferimento: new Date().getFullYear(),
          note: ''
        });

        // Reload pricelists
        loadPricelists();
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: 'Errore',
        description: error.message || 'Errore durante l\'upload',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const togglePricelistStatus = async (id: string, attivo: boolean) => {
    try {
      const { error } = await supabase
        .from('regional_pricelists')
        .update({ attivo })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Successo',
        description: `Prezzario ${attivo ? 'attivato' : 'disattivato'}`,
      });

      loadPricelists();
    } catch (error) {
      console.error('Error updating pricelist:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile aggiornare il prezzario',
        variant: 'destructive',
      });
    }
  };

  const deletePricelist = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo prezzario? Tutti gli elementi collegati verranno rimossi.')) {
      return;
    }

    try {
      // First delete associated price items
      await supabase
        .from('price_items')
        .delete()
        .eq('regional_pricelist_id', id);

      // Then delete the pricelist
      const { error } = await supabase
        .from('regional_pricelists')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Successo',
        description: 'Prezzario eliminato',
      });

      loadPricelists();
    } catch (error) {
      console.error('Error deleting pricelist:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile eliminare il prezzario',
        variant: 'destructive',
      });
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]); // Remove data:type/subtype;base64, prefix
      };
      reader.onerror = (error) => reject(error);
    });
  };

  if (loading) return <div>Caricamento...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Prezziari Regionali</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Gestisci i prezziari specifici per regione. I prezzi regionali hanno priorità su quelli nazionali.
        </p>
      </div>

      {/* Upload Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Carica Nuovo Prezzario
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>File Prezzario</Label>
              <Input
                type="file"
                accept=".csv,.xlsx,.xls,.pdf"
                onChange={(e) => setUploadForm(prev => ({ ...prev, file: e.target.files?.[0] || null }))}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Supportati: CSV, Excel (.xlsx/.xls), PDF
              </p>
            </div>
            
            <div>
              <Label>Regione</Label>
              <Input
                value={uploadForm.nome_regione}
                onChange={(e) => setUploadForm(prev => ({ ...prev, nome_regione: e.target.value }))}
                placeholder="es. Lombardia"
              />
            </div>

            <div>
              <Label>Anno di Riferimento</Label>
              <Input
                type="number"
                value={uploadForm.anno_riferimento}
                onChange={(e) => setUploadForm(prev => ({ ...prev, anno_riferimento: parseInt(e.target.value) || new Date().getFullYear() }))}
                min="2020"
                max="2030"
              />
            </div>
          </div>

          <div>
            <Label>Note (opzionale)</Label>
            <Textarea
              value={uploadForm.note}
              onChange={(e) => setUploadForm(prev => ({ ...prev, note: e.target.value }))}
              placeholder="Note aggiuntive sul prezzario..."
              rows={3}
            />
          </div>

          <Button 
            onClick={handleFileUpload} 
            disabled={uploading || !uploadForm.file || !uploadForm.nome_regione}
            className="w-full md:w-auto"
          >
            <Upload className="w-4 h-4 mr-2" />
            {uploading ? 'Caricamento...' : 'Carica Prezzario'}
          </Button>
        </CardContent>
      </Card>

      {/* Pricelists Table */}
      <Card>
        <CardHeader>
          <CardTitle>Prezziari Caricati</CardTitle>
        </CardHeader>
        <CardContent>
          {pricelists.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Nessun prezzario regionale caricato
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Regione</TableHead>
                  <TableHead>Anno</TableHead>
                  <TableHead>Formato</TableHead>
                  <TableHead>Elementi</TableHead>
                  <TableHead>Stato</TableHead>
                  <TableHead>Caricato</TableHead>
                  <TableHead>Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pricelists.map((pricelist) => (
                  <TableRow key={pricelist.id}>
                    <TableCell className="font-medium">{pricelist.nome_regione}</TableCell>
                    <TableCell>{pricelist.anno_riferimento}</TableCell>
                    <TableCell>
                      <span className="capitalize">{pricelist.fonte}</span>
                    </TableCell>
                    <TableCell>{pricelist.items_count}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {pricelist.attivo ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-gray-400" />
                        )}
                        <Switch
                          checked={pricelist.attivo}
                          onCheckedChange={(checked) => togglePricelistStatus(pricelist.id, checked)}
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(pricelist.created_at).toLocaleDateString('it-IT')}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {pricelist.file_originale_url && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(pricelist.file_originale_url, '_blank')}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deletePricelist(pricelist.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Usage Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Come Funzionano i Prezziari Regionali
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
              <p>
                <strong>Priorità:</strong> I prezzi regionali hanno precedenza su quelli nazionali durante il calcolo automatico delle stime.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
              <p>
                <strong>Formati supportati:</strong> CSV (migliore compatibilità), Excel (.xlsx/.xls), PDF (estrazione automatica).
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
              <p>
                <strong>Colonne riconosciute:</strong> Il sistema cerca automaticamente colonne per codice, descrizione, unità, prezzo e categoria.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
              <p>
                <strong>Fallback intelligente:</strong> Se un elemento non è trovato nel prezzario regionale, il sistema usa quello nazionale.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};