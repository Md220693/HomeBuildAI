import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronDown, ChevronRight, Search, MapPin } from 'lucide-react';
import { regioni, type Provincia, type Comune } from '@/data/italianMunicipalities';
import { cn } from '@/lib/utils';

interface GeographicSelectorProps {
  value: string[];
  onChange: (value: string[]) => void;
  error?: string;
}

export function GeographicSelector({ value, onChange, error }: GeographicSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRegioni, setExpandedRegioni] = useState<Set<string>>(new Set());
  const [expandedProvince, setExpandedProvince] = useState<Set<string>>(new Set());

  // Filtra regioni/province/comuni in base alla ricerca
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return regioni;
    
    const query = searchQuery.toLowerCase();
    return regioni
      .map(regione => {
        // Controlla se il nome della regione matcha
        if (regione.nome.toLowerCase().includes(query)) {
          return regione;
        }
        
        // Filtra le province che matchano
        const filteredProvince = regione.province
          .map(provincia => {
            // Controlla se il nome della provincia matcha
            if (provincia.nome.toLowerCase().includes(query) || provincia.sigla.toLowerCase().includes(query)) {
              return provincia;
            }
            
            // Filtra i comuni che matchano
            const filteredComuni = provincia.comuni.filter(comune => 
              comune.nome.toLowerCase().includes(query)
            );
            
            if (filteredComuni.length > 0) {
              return { ...provincia, comuni: filteredComuni };
            }
            
            return null;
          })
          .filter(Boolean) as Provincia[];
        
        if (filteredProvince.length > 0) {
          return { ...regione, province: filteredProvince };
        }
        
        return null;
      })
      .filter(Boolean) as typeof regioni;
  }, [searchQuery]);

  // Calcola statistiche selezione
  const stats = useMemo(() => {
    const regioni = value.filter(v => v.startsWith('REG:')).length;
    const province = value.filter(v => v.startsWith('PROV:')).length;
    const comuni = value.filter(v => v.startsWith('COM:')).length;
    return { regioni, province, comuni, totale: regioni + province + comuni };
  }, [value]);

  const toggleExpanded = (set: Set<string>, key: string) => {
    const newSet = new Set(set);
    if (newSet.has(key)) {
      newSet.delete(key);
    } else {
      newSet.add(key);
    }
    return newSet;
  };

  const isRegioneSelected = (nomeRegione: string): boolean => {
    return value.includes(`REG:${nomeRegione}`);
  };

  const isProvinciaSelected = (sigla: string): boolean => {
    return value.some(v => v.startsWith(`PROV:${sigla}:`));
  };

  const isComuneSelected = (nome: string, sigla: string): boolean => {
    return value.includes(`COM:${nome}:${sigla}`);
  };

  const handleRegioneToggle = (nomeRegione: string) => {
    const regioneKey = `REG:${nomeRegione}`;
    const isSelected = value.includes(regioneKey);
    
    if (isSelected) {
      // Rimuovi regione
      onChange(value.filter(v => v !== regioneKey));
    } else {
      // Aggiungi regione e rimuovi tutte le province/comuni di quella regione
      const regione = regioni.find(r => r.nome === nomeRegione);
      if (!regione) return;
      
      const toRemove = new Set<string>();
      regione.province.forEach(prov => {
        // Rimuovi province della regione
        value.forEach(v => {
          if (v.startsWith(`PROV:${prov.sigla}:`)) toRemove.add(v);
        });
        
        // Rimuovi comuni della regione
        prov.comuni.forEach(comune => {
          toRemove.add(`COM:${comune.nome}:${prov.sigla}`);
        });
      });
      
      const filtered = value.filter(v => !toRemove.has(v));
      onChange([...filtered, regioneKey]);
    }
  };

  const handleProvinciaToggle = (provincia: Provincia) => {
    const provinciaKey = `PROV:${provincia.sigla}:${provincia.nome}`;
    const isSelected = isProvinciaSelected(provincia.sigla);
    
    if (isSelected) {
      // Rimuovi provincia
      onChange(value.filter(v => !v.startsWith(`PROV:${provincia.sigla}:`)));
    } else {
      // Aggiungi provincia e rimuovi la regione (se c'è) e tutti i comuni di quella provincia
      const toRemove = new Set<string>();
      toRemove.add(`REG:${provincia.regione}`);
      
      provincia.comuni.forEach(comune => {
        toRemove.add(`COM:${comune.nome}:${provincia.sigla}`);
      });
      
      const filtered = value.filter(v => !toRemove.has(v));
      onChange([...filtered, provinciaKey]);
    }
  };

  const handleComuneToggle = (comune: Comune, provincia: Provincia) => {
    const comuneKey = `COM:${comune.nome}:${comune.sigla_provincia}`;
    const isSelected = value.includes(comuneKey);
    
    if (isSelected) {
      // Rimuovi comune
      onChange(value.filter(v => v !== comuneKey));
    } else {
      // Aggiungi comune e rimuovi regione e provincia (se ci sono)
      const filtered = value.filter(v => 
        v !== `REG:${provincia.regione}` && 
        !v.startsWith(`PROV:${provincia.sigla}:`)
      );
      onChange([...filtered, comuneKey]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Statistiche */}
      {stats.totale > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-lg">
          <Badge variant="secondary" className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {stats.regioni} {stats.regioni === 1 ? 'regione' : 'regioni'}
          </Badge>
          <Badge variant="secondary">
            {stats.province} {stats.province === 1 ? 'provincia' : 'province'}
          </Badge>
          <Badge variant="secondary">
            {stats.comuni} {stats.comuni === 1 ? 'comune' : 'comuni'}
          </Badge>
          <Badge variant="default" className="ml-auto">
            Totale: {stats.totale}
          </Badge>
        </div>
      )}

      {/* Barra di ricerca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cerca regione, provincia o comune..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Selettore gerarchico */}
      <ScrollArea className="h-[400px] rounded-md border p-4">
        <div className="space-y-2">
          {filteredData.map((regione) => {
            const isExpanded = expandedRegioni.has(regione.nome);
            const isSelected = isRegioneSelected(regione.nome);
            
            return (
              <div key={regione.nome} className="space-y-1">
                {/* Regione */}
                <div className="flex items-center gap-2 py-2 hover:bg-muted/50 rounded-md px-2 -mx-2">
                  <button
                    type="button"
                    onClick={() => setExpandedRegioni(toggleExpanded(expandedRegioni, regione.nome))}
                    className="p-1 hover:bg-muted rounded"
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                  
                  <Checkbox
                    id={`reg-${regione.nome}`}
                    checked={isSelected}
                    onCheckedChange={() => handleRegioneToggle(regione.nome)}
                  />
                  
                  <Label
                    htmlFor={`reg-${regione.nome}`}
                    className={cn(
                      "flex-1 cursor-pointer font-semibold",
                      isSelected && "text-primary"
                    )}
                  >
                    {regione.nome}
                  </Label>
                  
                  <Badge variant="outline" className="text-xs">
                    {regione.province.length} {regione.province.length === 1 ? 'prov.' : 'prov.'}
                  </Badge>
                </div>

                {/* Province (solo se espansa la regione) */}
                {isExpanded && (
                  <div className="ml-8 space-y-1">
                    {regione.province.map((provincia) => {
                      const isProvExpanded = expandedProvince.has(provincia.sigla);
                      const isProvSelected = isProvinciaSelected(provincia.sigla);
                      
                      return (
                        <div key={provincia.sigla} className="space-y-1">
                          {/* Provincia */}
                          <div className="flex items-center gap-2 py-1.5 hover:bg-muted/50 rounded-md px-2 -mx-2">
                            <button
                              type="button"
                              onClick={() => setExpandedProvince(toggleExpanded(expandedProvince, provincia.sigla))}
                              className="p-1 hover:bg-muted rounded"
                            >
                              {isProvExpanded ? (
                                <ChevronDown className="h-3.5 w-3.5" />
                              ) : (
                                <ChevronRight className="h-3.5 w-3.5" />
                              )}
                            </button>
                            
                            <Checkbox
                              id={`prov-${provincia.sigla}`}
                              checked={isProvSelected}
                              onCheckedChange={() => handleProvinciaToggle(provincia)}
                              disabled={isSelected}
                            />
                            
                            <Label
                              htmlFor={`prov-${provincia.sigla}`}
                              className={cn(
                                "flex-1 cursor-pointer text-sm",
                                isProvSelected && "text-primary font-medium",
                                isSelected && "opacity-50"
                              )}
                            >
                              {provincia.nome} ({provincia.sigla})
                            </Label>
                            
                            <Badge variant="outline" className="text-xs">
                              {provincia.comuni.length}
                            </Badge>
                          </div>

                          {/* Comuni (solo se espansa la provincia) */}
                          {isProvExpanded && (
                            <div className="ml-8 space-y-0.5">
                              {provincia.comuni.map((comune) => {
                                const isComuneSel = isComuneSelected(comune.nome, provincia.sigla);
                                
                                return (
                                  <div
                                    key={comune.codice_belfiore}
                                    className="flex items-center gap-2 py-1 hover:bg-muted/50 rounded-md px-2 -mx-2"
                                  >
                                    <Checkbox
                                      id={`com-${comune.codice_belfiore}`}
                                      checked={isComuneSel}
                                      onCheckedChange={() => handleComuneToggle(comune, provincia)}
                                      disabled={isSelected || isProvSelected}
                                    />
                                    
                                    <Label
                                      htmlFor={`com-${comune.codice_belfiore}`}
                                      className={cn(
                                        "flex-1 cursor-pointer text-sm",
                                        isComuneSel && "text-primary",
                                        (isSelected || isProvSelected) && "opacity-50"
                                      )}
                                    >
                                      {comune.nome}
                                    </Label>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
          
          {filteredData.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Nessun risultato trovato
            </div>
          )}
        </div>
      </ScrollArea>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
      
      {stats.totale === 0 && (
        <p className="text-sm text-muted-foreground">
          Seleziona almeno una regione, provincia o comune dove operi
        </p>
      )}
    </div>
  );
}
