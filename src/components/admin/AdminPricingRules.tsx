import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Euro, Plus, Edit, Trash2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PricingRule {
  id: string;
  name: string;
  type: 'shared' | 'exclusive';
  base_price: number;
  max_assignments?: number;
  min_cost_estimate?: number;
  max_cost_estimate?: number;
  zone_multiplier?: number;
  active: boolean;
  description?: string;
}

const AdminPricingRules = () => {
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([]);
  const [editingRule, setEditingRule] = useState<string | null>(null);
  const [newRule, setNewRule] = useState<Partial<PricingRule>>({
    type: 'shared',
    base_price: 50,
    active: true
  });
  const [showNewRuleForm, setShowNewRuleForm] = useState(false);
  const { toast } = useToast();

  const defaultRules: PricingRule[] = [
    {
      id: '1',
      name: 'Lead Condiviso Standard',
      type: 'shared',
      base_price: 50,
      max_assignments: 5,
      min_cost_estimate: 0,
      max_cost_estimate: 50000,
      zone_multiplier: 1.0,
      active: true,
      description: 'Prezzo base per lead condivisi fino a 50k€'
    },
    {
      id: '2',
      name: 'Lead Condiviso Premium',
      type: 'shared',
      base_price: 100,
      max_assignments: 3,
      min_cost_estimate: 50001,
      max_cost_estimate: 200000,
      zone_multiplier: 1.2,
      active: true,
      description: 'Lead condivisi per progetti 50k-200k€'
    },
    {
      id: '3',
      name: 'Lead Esclusivo Standard',
      type: 'exclusive',
      base_price: 200,
      max_assignments: 1,
      min_cost_estimate: 0,
      max_cost_estimate: 100000,
      zone_multiplier: 1.5,
      active: true,
      description: 'Lead esclusivi fino a 100k€'
    },
    {
      id: '4',
      name: 'Lead Esclusivo Premium',
      type: 'exclusive',
      base_price: 500,
      max_assignments: 1,
      min_cost_estimate: 100001,
      max_cost_estimate: 999999,
      zone_multiplier: 2.0,
      active: true,
      description: 'Lead esclusivi per grandi progetti >100k€'
    }
  ];

  useEffect(() => {
    loadPricingRules();
  }, []);

  const loadPricingRules = async () => {
    // For now, use default rules
    // In a real app, you'd load from database
    setPricingRules(defaultRules);
  };

  const savePricingRule = async (rule: PricingRule) => {
    try {
      // Here you would save to your database
      setPricingRules(prev => prev.map(r => r.id === rule.id ? rule : r));
      setEditingRule(null);
      
      toast({
        title: "Regola salvata",
        description: "Le modifiche sono state salvate con successo"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Impossibile salvare la regola"
      });
    }
  };

  const addNewRule = async () => {
    if (!newRule.name || !newRule.base_price) {
      toast({
        variant: "destructive",
        title: "Campi obbligatori mancanti",
        description: "Nome e prezzo base sono obbligatori"
      });
      return;
    }

    const rule: PricingRule = {
      id: Date.now().toString(),
      name: newRule.name!,
      type: newRule.type || 'shared',
      base_price: newRule.base_price!,
      max_assignments: newRule.max_assignments,
      min_cost_estimate: newRule.min_cost_estimate,
      max_cost_estimate: newRule.max_cost_estimate,
      zone_multiplier: newRule.zone_multiplier || 1.0,
      active: newRule.active || true,
      description: newRule.description
    };

    setPricingRules(prev => [...prev, rule]);
    setNewRule({
      type: 'shared',
      base_price: 50,
      active: true
    });
    setShowNewRuleForm(false);

    toast({
      title: "Regola aggiunta",
      description: "La nuova regola di pricing è stata creata"
    });
  };

  const deleteRule = async (ruleId: string) => {
    if (!confirm("Sei sicuro di voler eliminare questa regola?")) return;

    setPricingRules(prev => prev.filter(r => r.id !== ruleId));
    toast({
      title: "Regola eliminata",
      description: "La regola di pricing è stata rimossa"
    });
  };

  const toggleRuleStatus = async (ruleId: string) => {
    setPricingRules(prev => prev.map(rule => 
      rule.id === ruleId ? { ...rule, active: !rule.active } : rule
    ));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Euro className="h-5 w-5" />
            Configurazione Prezzi
          </CardTitle>
          <CardDescription>
            Gestisci le regole di pricing per lead condivisi ed esclusivi
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add New Rule Button */}
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Regole Attuali</h3>
            <Button onClick={() => setShowNewRuleForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nuova Regola
            </Button>
          </div>

          {/* New Rule Form */}
          {showNewRuleForm && (
            <Card className="border-2 border-dashed">
              <CardHeader>
                <CardTitle className="text-lg">Nuova Regola di Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Nome Regola</Label>
                    <Input
                      value={newRule.name || ''}
                      onChange={(e) => setNewRule(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Es. Lead Condiviso Standard"
                    />
                  </div>
                  <div>
                    <Label>Tipo</Label>
                    <Select value={newRule.type} onValueChange={(value: 'shared' | 'exclusive') => 
                      setNewRule(prev => ({ ...prev, type: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="shared">Condiviso</SelectItem>
                        <SelectItem value="exclusive">Esclusivo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Prezzo Base (€)</Label>
                    <Input
                      type="number"
                      value={newRule.base_price || ''}
                      onChange={(e) => setNewRule(prev => ({ ...prev, base_price: parseFloat(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label>Max Assegnazioni</Label>
                    <Input
                      type="number"
                      value={newRule.max_assignments || ''}
                      onChange={(e) => setNewRule(prev => ({ ...prev, max_assignments: parseInt(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label>Moltiplicatore Zona</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={newRule.zone_multiplier || 1.0}
                      onChange={(e) => setNewRule(prev => ({ ...prev, zone_multiplier: parseFloat(e.target.value) }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Stima Min (€)</Label>
                    <Input
                      type="number"
                      value={newRule.min_cost_estimate || ''}
                      onChange={(e) => setNewRule(prev => ({ ...prev, min_cost_estimate: parseInt(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label>Stima Max (€)</Label>
                    <Input
                      type="number"
                      value={newRule.max_cost_estimate || ''}
                      onChange={(e) => setNewRule(prev => ({ ...prev, max_cost_estimate: parseInt(e.target.value) }))}
                    />
                  </div>
                </div>

                <div>
                  <Label>Descrizione</Label>
                  <Input
                    value={newRule.description || ''}
                    onChange={(e) => setNewRule(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descrizione breve della regola"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowNewRuleForm(false)}>
                    Annulla
                  </Button>
                  <Button onClick={addNewRule}>
                    <Save className="h-4 w-4 mr-2" />
                    Salva Regola
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Existing Rules */}
          <div className="space-y-4">
            {pricingRules.map((rule) => (
              <Card key={rule.id} className={!rule.active ? 'opacity-60' : ''}>
                <CardContent className="pt-6">
                  {editingRule === rule.id ? (
                    <EditRuleForm
                      rule={rule}
                      onSave={savePricingRule}
                      onCancel={() => setEditingRule(null)}
                    />
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <h3 className="font-medium text-lg">{rule.name}</h3>
                          <Badge variant={rule.type === 'exclusive' ? 'default' : 'secondary'}>
                            {rule.type === 'exclusive' ? 'Esclusivo' : 'Condiviso'}
                          </Badge>
                          <Badge variant={rule.active ? 'default' : 'secondary'}>
                            {rule.active ? 'Attiva' : 'Inattiva'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={rule.active}
                            onCheckedChange={() => toggleRuleStatus(rule.id)}
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setEditingRule(rule.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => deleteRule(rule.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Prezzo Base:</span>
                          <div className="font-medium">{formatCurrency(rule.base_price)}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Max Assegnazioni:</span>
                          <div className="font-medium">{rule.max_assignments || 'N/A'}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Range Stima:</span>
                          <div className="font-medium">
                            {rule.min_cost_estimate && rule.max_cost_estimate
                              ? `${formatCurrency(rule.min_cost_estimate)} - ${formatCurrency(rule.max_cost_estimate)}`
                              : 'N/A'
                            }
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Moltiplicatore:</span>
                          <div className="font-medium">{rule.zone_multiplier || 1.0}x</div>
                        </div>
                      </div>

                      {rule.description && (
                        <p className="text-sm text-muted-foreground">{rule.description}</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const EditRuleForm = ({ 
  rule, 
  onSave, 
  onCancel 
}: { 
  rule: PricingRule;
  onSave: (rule: PricingRule) => void;
  onCancel: () => void;
}) => {
  const [editedRule, setEditedRule] = useState(rule);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Nome Regola</Label>
          <Input
            value={editedRule.name}
            onChange={(e) => setEditedRule(prev => ({ ...prev, name: e.target.value }))}
          />
        </div>
        <div>
          <Label>Tipo</Label>
          <Select value={editedRule.type} onValueChange={(value: 'shared' | 'exclusive') => 
            setEditedRule(prev => ({ ...prev, type: value }))
          }>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="shared">Condiviso</SelectItem>
              <SelectItem value="exclusive">Esclusivo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label>Prezzo Base (€)</Label>
          <Input
            type="number"
            value={editedRule.base_price}
            onChange={(e) => setEditedRule(prev => ({ ...prev, base_price: parseFloat(e.target.value) }))}
          />
        </div>
        <div>
          <Label>Max Assegnazioni</Label>
          <Input
            type="number"
            value={editedRule.max_assignments || ''}
            onChange={(e) => setEditedRule(prev => ({ ...prev, max_assignments: parseInt(e.target.value) }))}
          />
        </div>
        <div>
          <Label>Moltiplicatore Zona</Label>
          <Input
            type="number"
            step="0.1"
            value={editedRule.zone_multiplier || 1.0}
            onChange={(e) => setEditedRule(prev => ({ ...prev, zone_multiplier: parseFloat(e.target.value) }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Stima Min (€)</Label>
          <Input
            type="number"
            value={editedRule.min_cost_estimate || ''}
            onChange={(e) => setEditedRule(prev => ({ ...prev, min_cost_estimate: parseInt(e.target.value) }))}
          />
        </div>
        <div>
          <Label>Stima Max (€)</Label>
          <Input
            type="number"
            value={editedRule.max_cost_estimate || ''}
            onChange={(e) => setEditedRule(prev => ({ ...prev, max_cost_estimate: parseInt(e.target.value) }))}
          />
        </div>
      </div>

      <div>
        <Label>Descrizione</Label>
        <Input
          value={editedRule.description || ''}
          onChange={(e) => setEditedRule(prev => ({ ...prev, description: e.target.value }))}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Annulla
        </Button>
        <Button onClick={() => onSave(editedRule)}>
          <Save className="h-4 w-4 mr-2" />
          Salva
        </Button>
      </div>
    </div>
  );
};

export default AdminPricingRules;
