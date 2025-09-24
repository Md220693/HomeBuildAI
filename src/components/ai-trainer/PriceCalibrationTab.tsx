import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Plus, Upload, Save, Trash2, Edit } from 'lucide-react';

interface PriceItem {
  id: string;
  category: string;
  item_code: string;
  unit: string;
  base_price_eur: number;
  description?: string;
}

interface PriceModifierGeo {
  id: string;
  region: string;
  province?: string;
  cap_pattern?: string;
  multiplier: number;
  note?: string;
}

interface PriceModifierQuality {
  id: string;
  quality_tier: string;
  multiplier: number;
}

interface PriceModifierUrgency {
  id: string;
  urgency_band: string;
  multiplier: number;
}

export const PriceCalibrationTab = () => {
  const { toast } = useToast();
  const [priceItems, setPriceItems] = useState<PriceItem[]>([]);
  const [geoModifiers, setGeoModifiers] = useState<PriceModifierGeo[]>([]);
  const [qualityModifiers, setQualityModifiers] = useState<PriceModifierQuality[]>([]);
  const [urgencyModifiers, setUrgencyModifiers] = useState<PriceModifierUrgency[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [csvData, setCsvData] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [priceData, geoData, qualityData, urgencyData] = await Promise.all([
        supabase.from('price_items').select('*').order('category', { ascending: true }),
        supabase.from('price_modifiers_geo').select('*').order('region', { ascending: true }),
        supabase.from('price_modifiers_quality').select('*').order('quality_tier', { ascending: true }),
        supabase.from('price_modifiers_urgency').select('*').order('urgency_band', { ascending: true })
      ]);

      if (priceData.data) setPriceItems(priceData.data);
      if (geoData.data) setGeoModifiers(geoData.data);
      if (qualityData.data) setQualityModifiers(qualityData.data);
      if (urgencyData.data) setUrgencyModifiers(urgencyData.data);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile caricare i dati',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const savePriceItem = async () => {
    if (!editingItem) return;

    try {
      if (editingItem.id === 'new') {
        const { error } = await supabase
          .from('price_items')
          .insert([{
            category: editingItem.category,
            item_code: editingItem.item_code,
            unit: editingItem.unit,
            base_price_eur: editingItem.base_price_eur,
            description: editingItem.description
          }]);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('price_items')
          .update({
            category: editingItem.category,
            item_code: editingItem.item_code,
            unit: editingItem.unit,
            base_price_eur: editingItem.base_price_eur,
            description: editingItem.description
          })
          .eq('id', editingItem.id);

        if (error) throw error;
      }

      toast({
        title: 'Successo',
        description: 'Elemento salvato correttamente',
      });

      setEditingItem(null);
      loadData();
    } catch (error) {
      console.error('Error saving item:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile salvare l\'elemento',
        variant: 'destructive',
      });
    }
  };

  const deletePriceItem = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo elemento?')) return;

    try {
      const { error } = await supabase
        .from('price_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Successo',
        description: 'Elemento eliminato correttamente',
      });

      loadData();
    } catch (error) {
      console.error('Error deleting item:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile eliminare l\'elemento',
        variant: 'destructive',
      });
    }
  };

  const importCsvData = async () => {
    if (!csvData.trim()) {
      toast({
        title: 'Errore',
        description: 'Inserisci i dati CSV',
        variant: 'destructive',
      });
      return;
    }

    try {
      const rows = csvData.trim().split('\n');
      const headers = rows[0].split(',').map(h => h.trim());
      
      if (!headers.includes('item_code') || !headers.includes('base_price_eur')) {
        throw new Error('CSV deve contenere almeno le colonne: item_code, base_price_eur');
      }

      const items = rows.slice(1).map(row => {
        const values = row.split(',').map(v => v.trim());
        const item: any = {};
        
        headers.forEach((header, index) => {
          if (header === 'base_price_eur') {
            item[header] = parseFloat(values[index]) || 0;
          } else {
            item[header] = values[index] || '';
          }
        });

        // Set defaults for required fields
        if (!item.category) item.category = 'Generale';
        if (!item.unit) item.unit = 'cad';
        if (!item.description) item.description = '';

        return item;
      });

      const { error } = await supabase
        .from('price_items')
        .insert(items);

      if (error) throw error;

      toast({
        title: 'Successo',
        description: `Importati ${items.length} elementi`,
      });

      setCsvData('');
      loadData();
    } catch (error) {
      console.error('Error importing CSV:', error);
      toast({
        title: 'Errore',
        description: error.message || 'Errore durante l\'importazione',
        variant: 'destructive',
      });
    }
  };

  if (loading) return <div>Caricamento...</div>;

  return (
    <div className="space-y-6">
      <Tabs defaultValue="price-items" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="price-items">Listino Prezzi</TabsTrigger>
          <TabsTrigger value="geo-modifiers">Mod. Geografici</TabsTrigger>
          <TabsTrigger value="quality-modifiers">Mod. Qualità</TabsTrigger>
          <TabsTrigger value="historical">Storico</TabsTrigger>
        </TabsList>

        <TabsContent value="price-items" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Listino Prezzi Base</h3>
            <Button 
              onClick={() => setEditingItem({
                id: 'new',
                category: '',
                item_code: '',
                unit: 'cad',
                base_price_eur: 0,
                description: ''
              })}
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuovo Elemento
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Importa da CSV</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Dati CSV (item_code, category, unit, base_price_eur, description)</Label>
                <Textarea
                  placeholder={`item_code,category,unit,base_price_eur,description
PIASTR_001,Pavimenti,mq,45.50,Piastrelle ceramica standard
VERNC_002,Verniciature,mq,12.00,Verniciatura pareti interne`}
                  value={csvData}
                  onChange={(e) => setCsvData(e.target.value)}
                  rows={6}
                />
              </div>
              <Button onClick={importCsvData}>
                <Upload className="w-4 h-4 mr-2" />
                Importa CSV
              </Button>
            </CardContent>
          </Card>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Codice</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Unità</TableHead>
                <TableHead>Prezzo €</TableHead>
                <TableHead>Descrizione</TableHead>
                <TableHead>Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {priceItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.item_code}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>{item.unit}</TableCell>
                  <TableCell>{item.base_price_eur.toFixed(2)}</TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingItem(item)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deletePriceItem(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {editingItem && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {editingItem.id === 'new' ? 'Nuovo Elemento' : 'Modifica Elemento'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Codice Elemento</Label>
                    <Input
                      value={editingItem.item_code}
                      onChange={(e) =>
                        setEditingItem({ ...editingItem, item_code: e.target.value })
                      }
                      placeholder="PIASTR_001"
                    />
                  </div>
                  <div>
                    <Label>Categoria</Label>
                    <Input
                      value={editingItem.category}
                      onChange={(e) =>
                        setEditingItem({ ...editingItem, category: e.target.value })
                      }
                      placeholder="Pavimenti"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Unità di Misura</Label>
                    <Input
                      value={editingItem.unit}
                      onChange={(e) =>
                        setEditingItem({ ...editingItem, unit: e.target.value })
                      }
                      placeholder="mq"
                    />
                  </div>
                  <div>
                    <Label>Prezzo Base (€)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={editingItem.base_price_eur}
                      onChange={(e) =>
                        setEditingItem({ 
                          ...editingItem, 
                          base_price_eur: parseFloat(e.target.value) || 0 
                        })
                      }
                      placeholder="45.50"
                    />
                  </div>
                </div>

                <div>
                  <Label>Descrizione</Label>
                  <Input
                    value={editingItem.description || ''}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, description: e.target.value })
                    }
                    placeholder="Descrizione dettagliata dell'elemento"
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={savePriceItem}>
                    <Save className="w-4 h-4 mr-2" />
                    Salva
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setEditingItem(null)}
                  >
                    Annulla
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="geo-modifiers" className="space-y-4">
          <h3 className="text-lg font-semibold">Moltiplicatori Geografici</h3>
          <p className="text-muted-foreground">
            Configura i moltiplicatori di prezzo basati sulla posizione geografica
          </p>
          {/* Placeholder per moltiplicatori geografici */}
        </TabsContent>

        <TabsContent value="quality-modifiers" className="space-y-4">
          <h3 className="text-lg font-semibold">Moltiplicatori Qualità</h3>
          <p className="text-muted-foreground">
            Configura i moltiplicatori basati sul livello di qualità richiesto
          </p>
          {/* Placeholder per moltiplicatori qualità */}
        </TabsContent>

        <TabsContent value="historical" className="space-y-4">
          <h3 className="text-lg font-semibold">Storico Preventivi</h3>
          <p className="text-muted-foreground">
            Importa preventivi storici per migliorare la calibrazione
          </p>
          {/* Placeholder per storico preventivi */}
        </TabsContent>
      </Tabs>
    </div>
  );
};