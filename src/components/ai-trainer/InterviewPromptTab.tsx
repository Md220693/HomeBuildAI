import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Plus, Save, Trash2, Edit, Eye } from 'lucide-react';

interface AIPrompt {
  id: string;
  kind: string;
  content: string;
  version: number;
  is_active: boolean;
  created_at: string;
}

interface InterviewQuestion {
  id: string;
  label: string;
  field_key: string;
  type: string;
  required: boolean;
  help_text?: string;
  options_json?: any;
  sort_order: number;
}

export const InterviewPromptTab = () => {
  const { toast } = useToast();
  const [prompts, setPrompts] = useState<AIPrompt[]>([]);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<AIPrompt | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<InterviewQuestion | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [promptsData, questionsData] = await Promise.all([
        supabase.from('ai_prompts').select('*').order('kind', { ascending: true }),
        supabase.from('interview_questions').select('*').order('sort_order', { ascending: true })
      ]);

      if (promptsData.data) setPrompts(promptsData.data);
      if (questionsData.data) setQuestions(questionsData.data);
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

  const savePrompt = async () => {
    if (!selectedPrompt) return;

    try {
      const { error } = await supabase
        .from('ai_prompts')
        .update({ 
          content: selectedPrompt.content,
          is_active: selectedPrompt.is_active 
        })
        .eq('id', selectedPrompt.id);

      if (error) throw error;

      toast({
        title: 'Successo',
        description: 'Prompt salvato correttamente',
      });

      loadData();
    } catch (error) {
      console.error('Error saving prompt:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile salvare il prompt',
        variant: 'destructive',
      });
    }
  };

  const saveQuestion = async () => {
    if (!editingQuestion) return;

    try {
      if (editingQuestion.id === 'new') {
        const { error } = await supabase
          .from('interview_questions')
          .insert([{
            label: editingQuestion.label,
            field_key: editingQuestion.field_key,
            type: editingQuestion.type,
            required: editingQuestion.required,
            help_text: editingQuestion.help_text,
            options_json: editingQuestion.options_json,
            sort_order: editingQuestion.sort_order
          }]);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('interview_questions')
          .update({
            label: editingQuestion.label,
            field_key: editingQuestion.field_key,
            type: editingQuestion.type,
            required: editingQuestion.required,
            help_text: editingQuestion.help_text,
            options_json: editingQuestion.options_json,
            sort_order: editingQuestion.sort_order
          })
          .eq('id', editingQuestion.id);

        if (error) throw error;
      }

      toast({
        title: 'Successo',
        description: 'Domanda salvata correttamente',
      });

      setEditingQuestion(null);
      loadData();
    } catch (error) {
      console.error('Error saving question:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile salvare la domanda',
        variant: 'destructive',
      });
    }
  };

  const deleteQuestion = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questa domanda?')) return;

    try {
      const { error } = await supabase
        .from('interview_questions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Successo',
        description: 'Domanda eliminata correttamente',
      });

      loadData();
    } catch (error) {
      console.error('Error deleting question:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile eliminare la domanda',
        variant: 'destructive',
      });
    }
  };

  if (loading) return <div>Caricamento...</div>;

  return (
    <div className="space-y-6">
      <Tabs defaultValue="prompts" className="w-full">
        <TabsList>
          <TabsTrigger value="prompts">Prompt di Sistema</TabsTrigger>
          <TabsTrigger value="questions">Domande Intervista</TabsTrigger>
        </TabsList>

        <TabsContent value="prompts" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Prompt Disponibili</h3>
              <div className="space-y-2">
                {prompts.map((prompt) => (
                  <Card 
                    key={prompt.id} 
                    className={`cursor-pointer transition-colors ${
                      selectedPrompt?.id === prompt.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedPrompt(prompt)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">
                            {prompt.kind === 'system_interview' ? '🎯 Prompt Intervista' :
                             prompt.kind === 'system_pricing' ? '💰 Prompt Capitolato' :
                             prompt.kind}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Versione {prompt.version}
                          </p>
                        </div>
                        <Badge variant={prompt.is_active ? 'default' : 'secondary'}>
                          {prompt.is_active ? 'Attivo' : 'Inattivo'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              {selectedPrompt && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Editor Prompt: {selectedPrompt.kind}
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={selectedPrompt.is_active}
                        onCheckedChange={(checked) =>
                          setSelectedPrompt({ ...selectedPrompt, is_active: checked })
                        }
                      />
                      <Label>Prompt attivo</Label>
                    </div>
                    
                    <Textarea
                      placeholder="Contenuto del prompt..."
                      value={selectedPrompt.content}
                      onChange={(e) =>
                        setSelectedPrompt({ ...selectedPrompt, content: e.target.value })
                      }
                      rows={12}
                    />
                    
                    <Button onClick={savePrompt} className="w-full">
                      <Save className="w-4 h-4 mr-2" />
                      Salva Prompt
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="questions" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Domande Intervista</h3>
            <Button 
              onClick={() => setEditingQuestion({
                id: 'new',
                label: '',
                field_key: '',
                type: 'text',
                required: false,
                help_text: '',
                sort_order: questions.length
              })}
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuova Domanda
            </Button>
          </div>

          <div className="space-y-2">
            {questions.map((question, index) => (
              <Card key={question.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{question.label}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{question.field_key}</span>
                        <Badge variant="outline">{question.type}</Badge>
                        {question.required && <Badge variant="destructive">Obbligatorio</Badge>}
                      </div>
                      {question.help_text && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {question.help_text}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingQuestion(question)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteQuestion(question.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {editingQuestion && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {editingQuestion.id === 'new' ? 'Nuova Domanda' : 'Modifica Domanda'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Etichetta</Label>
                    <Input
                      value={editingQuestion.label}
                      onChange={(e) =>
                        setEditingQuestion({ ...editingQuestion, label: e.target.value })
                      }
                      placeholder="Etichetta della domanda"
                    />
                  </div>
                  <div>
                    <Label>Chiave Campo</Label>
                    <Input
                      value={editingQuestion.field_key}
                      onChange={(e) =>
                        setEditingQuestion({ ...editingQuestion, field_key: e.target.value })
                      }
                      placeholder="field_key"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Tipo</Label>
                    <Select
                      value={editingQuestion.type}
                      onValueChange={(value) =>
                        setEditingQuestion({ ...editingQuestion, type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Testo</SelectItem>
                        <SelectItem value="textarea">Area Testo</SelectItem>
                        <SelectItem value="select">Selezione</SelectItem>
                        <SelectItem value="radio">Radio Button</SelectItem>
                        <SelectItem value="checkbox">Checkbox</SelectItem>
                        <SelectItem value="number">Numero</SelectItem>
                        <SelectItem value="date">Data</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Ordine</Label>
                    <Input
                      type="number"
                      value={editingQuestion.sort_order}
                      onChange={(e) =>
                        setEditingQuestion({ 
                          ...editingQuestion, 
                          sort_order: parseInt(e.target.value) || 0 
                        })
                      }
                    />
                  </div>
                </div>

                <div>
                  <Label>Testo di Aiuto</Label>
                  <Input
                    value={editingQuestion.help_text || ''}
                    onChange={(e) =>
                      setEditingQuestion({ ...editingQuestion, help_text: e.target.value })
                    }
                    placeholder="Testo di aiuto per l'utente"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={editingQuestion.required}
                    onCheckedChange={(checked) =>
                      setEditingQuestion({ ...editingQuestion, required: checked })
                    }
                  />
                  <Label>Campo obbligatorio</Label>
                </div>

                <div className="flex gap-2">
                  <Button onClick={saveQuestion}>
                    <Save className="w-4 h-4 mr-2" />
                    Salva
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setEditingQuestion(null)}
                  >
                    Annulla
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};