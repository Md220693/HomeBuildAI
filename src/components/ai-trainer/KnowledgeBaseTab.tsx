import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Plus, Save, Trash2, Edit, Database, Settings } from 'lucide-react';

interface KBDoc {
  id: string;
  title: string;
  tags: string[];
  content_text: string;
  created_at: string;
}

interface AISettings {
  id: string;
  use_rag: boolean;
  use_storici: boolean;
  max_neighbors: number;
  guard_rail_pct: number;
  default_confidence: number;
}

export const KnowledgeBaseTab = () => {
  const { toast } = useToast();
  const [kbDocs, setKbDocs] = useState<KBDoc[]>([]);
  const [aiSettings, setAiSettings] = useState<AISettings | null>(null);
  const [editingDoc, setEditingDoc] = useState<KBDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [docsData, settingsData] = await Promise.all([
        supabase.from('kb_docs').select('*').order('created_at', { ascending: false }),
        supabase.from('ai_settings').select('*').limit(1).single()
      ]);

      if (docsData.data) setKbDocs(docsData.data);
      if (settingsData.data) setAiSettings(settingsData.data);
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

  const saveKBDoc = async () => {
    if (!editingDoc) return;

    try {
      if (editingDoc.id === 'new') {
        const { error } = await supabase
          .from('kb_docs')
          .insert([{
            title: editingDoc.title,
            tags: editingDoc.tags,
            content_text: editingDoc.content_text
          }]);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('kb_docs')
          .update({
            title: editingDoc.title,
            tags: editingDoc.tags,
            content_text: editingDoc.content_text
          })
          .eq('id', editingDoc.id);

        if (error) throw error;
      }

      toast({
        title: 'Successo',
        description: 'Documento salvato correttamente',
      });

      setEditingDoc(null);
      loadData();
    } catch (error) {
      console.error('Error saving document:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile salvare il documento',
        variant: 'destructive',
      });
    }
  };

  const deleteKBDoc = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo documento?')) return;

    try {
      const { error } = await supabase
        .from('kb_docs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Successo',
        description: 'Documento eliminato correttamente',
      });

      loadData();
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile eliminare il documento',
        variant: 'destructive',
      });
    }
  };

  const saveAISettings = async () => {
    if (!aiSettings) return;

    try {
      const { error } = await supabase
        .from('ai_settings')
        .update({
          use_rag: aiSettings.use_rag,
          use_storici: aiSettings.use_storici,
          max_neighbors: aiSettings.max_neighbors,
          guard_rail_pct: aiSettings.guard_rail_pct,
          default_confidence: aiSettings.default_confidence
        })
        .eq('id', aiSettings.id);

      if (error) throw error;

      toast({
        title: 'Successo',
        description: 'Impostazioni salvate correttamente',
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile salvare le impostazioni',
        variant: 'destructive',
      });
    }
  };

  const addTag = () => {
    if (!editingDoc || !newTag.trim()) return;

    if (!editingDoc.tags.includes(newTag.trim())) {
      setEditingDoc({
        ...editingDoc,
        tags: [...editingDoc.tags, newTag.trim()]
      });
    }
    setNewTag('');
  };

  const removeTag = (tagToRemove: string) => {
    if (!editingDoc) return;
    
    setEditingDoc({
      ...editingDoc,
      tags: editingDoc.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const indexDocument = async (docId: string) => {
    // Placeholder per l'indicizzazione dei documenti
    toast({
      title: 'Info',
      description: 'Funzionalità di indicizzazione in sviluppo',
    });
  };

  if (loading) return <div>Caricamento...</div>;

  return (
    <div className="space-y-6">
      {/* Knowledge Base Documents */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Database className="w-5 h-5" />
              Knowledge Base
            </h3>
            <p className="text-muted-foreground">
              Gestisci i documenti della knowledge base per migliorare le risposte AI
            </p>
          </div>
          <Button 
            onClick={() => setEditingDoc({
              id: 'new',
              title: '',
              tags: [],
              content_text: '',
              created_at: new Date().toISOString()
            })}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuovo Documento
          </Button>
        </div>

        <div className="grid gap-4">
          {kbDocs.map((doc) => (
            <Card key={doc.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-lg">{doc.title}</h4>
                    <div className="flex flex-wrap gap-1 my-2">
                      {doc.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {doc.content_text.substring(0, 200)}...
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Creato: {new Date(doc.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => indexDocument(doc.id)}
                      title="Indicizza documento"
                    >
                      <Database className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingDoc(doc)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteKBDoc(doc.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {editingDoc && (
          <Card>
            <CardHeader>
              <CardTitle>
                {editingDoc.id === 'new' ? 'Nuovo Documento' : 'Modifica Documento'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Titolo</Label>
                <Input
                  value={editingDoc.title}
                  onChange={(e) =>
                    setEditingDoc({ ...editingDoc, title: e.target.value })
                  }
                  placeholder="Titolo del documento"
                />
              </div>

              <div>
                <Label>Tags</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Nuovo tag"
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  />
                  <Button onClick={addTag} size="sm">
                    Aggiungi
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {editingDoc.tags.map((tag) => (
                    <Badge 
                      key={tag} 
                      variant="secondary" 
                      className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => removeTag(tag)}
                    >
                      {tag} ×
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label>Contenuto</Label>
                <Textarea
                  value={editingDoc.content_text}
                  onChange={(e) =>
                    setEditingDoc({ ...editingDoc, content_text: e.target.value })
                  }
                  placeholder="Contenuto del documento..."
                  rows={12}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={saveKBDoc}>
                  <Save className="w-4 h-4 mr-2" />
                  Salva
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setEditingDoc(null)}
                >
                  Annulla
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Separator />

      {/* AI Settings */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Impostazioni AI
        </h3>

        {aiSettings && (
          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="grid gap-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Usa RAG (Retrieval Augmented Generation)</Label>
                    <p className="text-sm text-muted-foreground">
                      Utilizza la knowledge base per migliorare le risposte
                    </p>
                  </div>
                  <Switch
                    checked={aiSettings.use_rag}
                    onCheckedChange={(checked) =>
                      setAiSettings({ ...aiSettings, use_rag: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Usa Dati Storici</Label>
                    <p className="text-sm text-muted-foreground">
                      Utilizza i preventivi storici per la calibrazione
                    </p>
                  </div>
                  <Switch
                    checked={aiSettings.use_storici}
                    onCheckedChange={(checked) =>
                      setAiSettings({ ...aiSettings, use_storici: checked })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-base font-medium">
                    Massimi Vicini RAG: {aiSettings.max_neighbors}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Numero massimo di documenti simili da recuperare
                  </p>
                  <Slider
                    value={[aiSettings.max_neighbors]}
                    onValueChange={([value]) =>
                      setAiSettings({ ...aiSettings, max_neighbors: value })
                    }
                    min={1}
                    max={20}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-base font-medium">
                    Guard Rail (%): {aiSettings.guard_rail_pct}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Percentuale di deviazione massima dai prezzi storici
                  </p>
                  <Slider
                    value={[aiSettings.guard_rail_pct]}
                    onValueChange={([value]) =>
                      setAiSettings({ ...aiSettings, guard_rail_pct: value })
                    }
                    min={5}
                    max={50}
                    step={5}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-base font-medium">
                    Confidenza Default (%): {aiSettings.default_confidence}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Livello di confidenza predefinito per le stime
                  </p>
                  <Slider
                    value={[aiSettings.default_confidence]}
                    onValueChange={([value]) =>
                      setAiSettings({ ...aiSettings, default_confidence: value })
                    }
                    min={50}
                    max={95}
                    step={5}
                    className="w-full"
                  />
                </div>
              </div>

              <Button onClick={saveAISettings} className="w-full">
                <Save className="w-4 h-4 mr-2" />
                Salva Impostazioni
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};