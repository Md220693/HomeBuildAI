// Dati geografici italiani - Regioni, Province e Comuni
// Generato da gi_comuni_nazioni_cf.json (solo comuni attivi)

import comuniData from './gi_comuni_nazioni_cf.json';

// Mapping Sigla Provincia → Regione
export const provinciaToRegione: Record<string, string> = {
  // Piemonte
  'TO': 'Piemonte', 'VC': 'Piemonte', 'NO': 'Piemonte', 'CN': 'Piemonte',
  'AT': 'Piemonte', 'AL': 'Piemonte', 'BI': 'Piemonte', 'VB': 'Piemonte',
  
  // Valle d'Aosta
  'AO': "Valle d'Aosta",
  
  // Lombardia
  'VA': 'Lombardia', 'CO': 'Lombardia', 'SO': 'Lombardia', 'MI': 'Lombardia',
  'BG': 'Lombardia', 'BS': 'Lombardia', 'PV': 'Lombardia', 'CR': 'Lombardia',
  'MN': 'Lombardia', 'LC': 'Lombardia', 'LO': 'Lombardia', 'MB': 'Lombardia',
  
  // Trentino-Alto Adige
  'BZ': 'Trentino-Alto Adige', 'TN': 'Trentino-Alto Adige',
  
  // Veneto
  'VR': 'Veneto', 'VI': 'Veneto', 'BL': 'Veneto', 'TV': 'Veneto',
  'VE': 'Veneto', 'PD': 'Veneto', 'RO': 'Veneto',
  
  // Friuli-Venezia Giulia
  'UD': 'Friuli-Venezia Giulia', 'GO': 'Friuli-Venezia Giulia',
  'TS': 'Friuli-Venezia Giulia', 'PN': 'Friuli-Venezia Giulia',
  
  // Liguria
  'IM': 'Liguria', 'SV': 'Liguria', 'GE': 'Liguria', 'SP': 'Liguria',
  
  // Emilia-Romagna
  'PC': 'Emilia-Romagna', 'PR': 'Emilia-Romagna', 'RE': 'Emilia-Romagna',
  'MO': 'Emilia-Romagna', 'BO': 'Emilia-Romagna', 'FE': 'Emilia-Romagna',
  'RA': 'Emilia-Romagna', 'FC': 'Emilia-Romagna', 'RN': 'Emilia-Romagna',
  
  // Toscana
  'MS': 'Toscana', 'LU': 'Toscana', 'PT': 'Toscana', 'FI': 'Toscana',
  'LI': 'Toscana', 'PI': 'Toscana', 'AR': 'Toscana', 'SI': 'Toscana',
  'GR': 'Toscana', 'PO': 'Toscana',
  
  // Umbria
  'PG': 'Umbria', 'TR': 'Umbria',
  
  // Marche
  'PU': 'Marche', 'AN': 'Marche', 'MC': 'Marche', 'AP': 'Marche', 'FM': 'Marche',
  
  // Lazio
  'VT': 'Lazio', 'RI': 'Lazio', 'RM': 'Lazio', 'LT': 'Lazio', 'FR': 'Lazio',
  
  // Abruzzo
  'AQ': 'Abruzzo', 'TE': 'Abruzzo', 'PE': 'Abruzzo', 'CH': 'Abruzzo',
  
  // Molise
  'CB': 'Molise', 'IS': 'Molise',
  
  // Campania
  'CE': 'Campania', 'BN': 'Campania', 'NA': 'Campania', 'AV': 'Campania', 'SA': 'Campania',
  
  // Puglia
  'FG': 'Puglia', 'BA': 'Puglia', 'TA': 'Puglia', 'BR': 'Puglia', 'LE': 'Puglia', 'BT': 'Puglia',
  
  // Basilicata
  'PZ': 'Basilicata', 'MT': 'Basilicata',
  
  // Calabria
  'CS': 'Calabria', 'CZ': 'Calabria', 'RC': 'Calabria', 'KR': 'Calabria', 'VV': 'Calabria',
  
  // Sicilia
  'TP': 'Sicilia', 'PA': 'Sicilia', 'ME': 'Sicilia', 'AG': 'Sicilia',
  'CL': 'Sicilia', 'EN': 'Sicilia', 'CT': 'Sicilia', 'RG': 'Sicilia', 'SR': 'Sicilia',
  
  // Sardegna
  'SS': 'Sardegna', 'NU': 'Sardegna', 'CA': 'Sardegna', 'OR': 'Sardegna',
  'OT': 'Sardegna', 'OG': 'Sardegna', 'VS': 'Sardegna', 'CI': 'Sardegna', 'SU': 'Sardegna'
};

// Nomi completi delle province
export const provinceNames: Record<string, string> = {
  'AG': 'Agrigento', 'AL': 'Alessandria', 'AN': 'Ancona', 'AO': 'Aosta', 'AP': 'Ascoli Piceno',
  'AQ': "L'Aquila", 'AR': 'Arezzo', 'AT': 'Asti', 'AV': 'Avellino', 'BA': 'Bari',
  'BG': 'Bergamo', 'BI': 'Biella', 'BL': 'Belluno', 'BN': 'Benevento', 'BO': 'Bologna',
  'BR': 'Brindisi', 'BS': 'Brescia', 'BT': 'Barletta-Andria-Trani', 'BZ': 'Bolzano', 'CA': 'Cagliari',
  'CB': 'Campobasso', 'CE': 'Caserta', 'CH': 'Chieti', 'CI': 'Carbonia-Iglesias', 'CL': 'Caltanissetta',
  'CN': 'Cuneo', 'CO': 'Como', 'CR': 'Cremona', 'CS': 'Cosenza', 'CT': 'Catania',
  'CZ': 'Catanzaro', 'EN': 'Enna', 'FC': 'Forlì-Cesena', 'FE': 'Ferrara', 'FG': 'Foggia',
  'FI': 'Firenze', 'FM': 'Fermo', 'FR': 'Frosinone', 'GE': 'Genova', 'GO': 'Gorizia',
  'GR': 'Grosseto', 'IM': 'Imperia', 'IS': 'Isernia', 'KR': 'Crotone', 'LC': 'Lecco',
  'LE': 'Lecce', 'LI': 'Livorno', 'LO': 'Lodi', 'LT': 'Latina', 'LU': 'Lucca',
  'MB': 'Monza e della Brianza', 'MC': 'Macerata', 'ME': 'Messina', 'MI': 'Milano', 'MN': 'Mantova',
  'MO': 'Modena', 'MS': 'Massa-Carrara', 'MT': 'Matera', 'NA': 'Napoli', 'NO': 'Novara',
  'NU': 'Nuoro', 'OG': 'Ogliastra', 'OR': 'Oristano', 'OT': 'Olbia-Tempio', 'PA': 'Palermo',
  'PC': 'Piacenza', 'PD': 'Padova', 'PE': 'Pescara', 'PG': 'Perugia', 'PI': 'Pisa',
  'PN': 'Pordenone', 'PO': 'Prato', 'PR': 'Parma', 'PT': 'Pistoia', 'PU': 'Pesaro e Urbino',
  'PV': 'Pavia', 'PZ': 'Potenza', 'RA': 'Ravenna', 'RC': 'Reggio Calabria', 'RE': 'Reggio Emilia',
  'RG': 'Ragusa', 'RI': 'Rieti', 'RM': 'Roma', 'RN': 'Rimini', 'RO': 'Rovigo',
  'SA': 'Salerno', 'SI': 'Siena', 'SO': 'Sondrio', 'SP': 'La Spezia', 'SR': 'Siracusa',
  'SS': 'Sassari', 'SU': 'Sud Sardegna', 'SV': 'Savona', 'TA': 'Taranto', 'TE': 'Teramo',
  'TN': 'Trento', 'TO': 'Torino', 'TP': 'Trapani', 'TR': 'Terni', 'TS': 'Trieste',
  'TV': 'Treviso', 'UD': 'Udine', 'VA': 'Varese', 'VB': 'Verbano-Cusio-Ossola', 'VC': 'Vercelli',
  'VE': 'Venezia', 'VI': 'Vicenza', 'VR': 'Verona', 'VS': 'Medio Campidano', 'VT': 'Viterbo', 'VV': 'Vibo Valentia'
};

export interface Comune {
  nome: string;
  sigla_provincia: string;
  codice_belfiore: string;
}

export interface Provincia {
  sigla: string;
  nome: string;
  regione: string;
  comuni: Comune[];
}

export interface Regione {
  nome: string;
  province: Provincia[];
}

// Processa i dati JSON e crea la struttura gerarchica
function processGeoData(): Regione[] {
  // Filtra solo comuni attivi (data_fine_validita === null)
  const comuniAttivi = (comuniData as any[]).filter(c => c.data_fine_validita === null);
  
  // Raggruppa per provincia
  const comuniPerProvincia: Record<string, Comune[]> = {};
  
  comuniAttivi.forEach(comune => {
    const sigla = comune.sigla_provincia;
    if (!comuniPerProvincia[sigla]) {
      comuniPerProvincia[sigla] = [];
    }
    
    comuniPerProvincia[sigla].push({
      nome: comune.denominazione_ita,
      sigla_provincia: sigla,
      codice_belfiore: comune.codice_belfiore
    });
  });
  
  // Ordina comuni alfabeticamente
  Object.keys(comuniPerProvincia).forEach(sigla => {
    comuniPerProvincia[sigla].sort((a, b) => a.nome.localeCompare(b.nome));
  });
  
  // Crea struttura province
  const province: Provincia[] = Object.keys(comuniPerProvincia)
    .filter(sigla => provinciaToRegione[sigla]) // Solo province italiane valide
    .map(sigla => ({
      sigla,
      nome: provinceNames[sigla] || sigla,
      regione: provinciaToRegione[sigla],
      comuni: comuniPerProvincia[sigla]
    }))
    .sort((a, b) => a.nome.localeCompare(b.nome));
  
  // Raggruppa per regione
  const regioniMap: Record<string, Provincia[]> = {};
  
  province.forEach(provincia => {
    if (!regioniMap[provincia.regione]) {
      regioniMap[provincia.regione] = [];
    }
    regioniMap[provincia.regione].push(provincia);
  });
  
  // Crea array finale di regioni
  const regioni: Regione[] = Object.keys(regioniMap)
    .sort()
    .map(nomeRegione => ({
      nome: nomeRegione,
      province: regioniMap[nomeRegione]
    }));
  
  return regioni;
}

// Esporta i dati processati
export const regioni = processGeoData();

// Funzioni helper
export function getRegioniList(): string[] {
  return regioni.map(r => r.nome);
}

export function getProvinceByRegione(nomeRegione: string): Provincia[] {
  const regione = regioni.find(r => r.nome === nomeRegione);
  return regione?.province || [];
}

export function getComuniByProvincia(siglaProvincia: string): Comune[] {
  for (const regione of regioni) {
    const provincia = regione.province.find(p => p.sigla === siglaProvincia);
    if (provincia) return provincia.comuni;
  }
  return [];
}

export function searchComuni(query: string): Comune[] {
  const lowerQuery = query.toLowerCase();
  const results: Comune[] = [];
  
  regioni.forEach(regione => {
    regione.province.forEach(provincia => {
      provincia.comuni.forEach(comune => {
        if (comune.nome.toLowerCase().includes(lowerQuery)) {
          results.push(comune);
        }
      });
    });
  });
  
  return results.slice(0, 50); // Limita a 50 risultati
}

// Funzioni per il formato zona_operativa
export function parseZonaOperativa(zonaString: string): { tipo: 'regione' | 'provincia' | 'comune', valore: string, extra?: string } | null {
  if (zonaString.startsWith('REG:')) {
    return { tipo: 'regione', valore: zonaString.substring(4) };
  } else if (zonaString.startsWith('PROV:')) {
    const parts = zonaString.substring(5).split(':');
    return { tipo: 'provincia', valore: parts[0], extra: parts[1] };
  } else if (zonaString.startsWith('COM:')) {
    const parts = zonaString.substring(4).split(':');
    return { tipo: 'comune', valore: parts[0], extra: parts[1] };
  }
  return null;
}

export function formatZonaOperativaDisplay(zone: string[]): string {
  const parsed = zone.map(z => parseZonaOperativa(z)).filter(Boolean);
  
  const regioni = parsed.filter(p => p?.tipo === 'regione').map(p => p!.valore);
  const province = parsed.filter(p => p?.tipo === 'provincia').map(p => `${p!.extra} (${p!.valore})`);
  const comuni = parsed.filter(p => p?.tipo === 'comune').map(p => p!.valore);
  
  const parts: string[] = [];
  
  if (regioni.length > 0) {
    parts.push(regioni.length === 1 ? regioni[0] : `${regioni.length} regioni`);
  }
  if (province.length > 0) {
    parts.push(province.length === 1 ? `Provincia di ${province[0]}` : `${province.length} province`);
  }
  if (comuni.length > 0) {
    parts.push(comuni.length <= 3 ? comuni.join(', ') : `${comuni.length} comuni`);
  }
  
  return parts.join(' • ');
}
