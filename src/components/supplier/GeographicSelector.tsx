import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { regioni } from "@/data/italianMunicipalities";

interface Props {
  value: string[];
  onChange: (v: string[]) => void;
}

export function GeographicSelector({ value, onChange }: Props) {
  const [openRegions, setOpenRegions] = useState<string[]>([]);
  const [openProvinces, setOpenProvinces] = useState<string[]>([]);

  const toggle = (key: string) => {
    if (value.includes(key)) {
      onChange(value.filter(v => v !== key));
    } else {
      onChange([...value, key]);
    }
  };

  const toggleOpen = (
    key: string,
    list: string[],
    setList: (v: string[]) => void
  ) => {
    setList(
      list.includes(key)
        ? list.filter(k => k !== key)
        : [...list, key]
    );
  };

  return (
    <div className="space-y-4 border rounded-md p-4 max-h-[400px] overflow-auto">

      {regioni.map(region => (
        <div key={region.nome}>
          {/* REGION */}
          <div
            className="flex items-center gap-2 font-medium cursor-pointer"
            onClick={() =>
              toggleOpen(region.nome, openRegions, setOpenRegions)
            }
          >
            ▶ {region.nome}
          </div>

          {/* PROVINCES */}
          {openRegions.includes(region.nome) && (
            <div className="pl-4 mt-2 space-y-2">
              {region.province.map(prov => {
                const provKey = `PROV:${prov.sigla}:${prov.nome}`;

                return (
                  <div key={prov.sigla}>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={value.includes(provKey)}
                        onCheckedChange={() => toggle(provKey)}
                      />
                      <span
                        className="cursor-pointer"
                        onClick={() =>
                          toggleOpen(prov.sigla, openProvinces, setOpenProvinces)
                        }
                      >
                        {prov.nome} ({prov.sigla})
                      </span>
                    </div>

                    {/* CITIES */}
                    {openProvinces.includes(prov.sigla) && (
                      <div className="pl-6 mt-1 space-y-1">
                        {prov.comuni.map(com => {
                          const cityKey = `COM:${com.nome}:${prov.sigla}`;

                          return (
                            <div
                              key={com.codice_belfiore}
                              className="flex items-center gap-2"
                            >
                              <Checkbox
                                checked={value.includes(cityKey)}
                                onCheckedChange={() => toggle(cityKey)}
                              />
                              <span>{com.nome}</span>
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
      ))}
    </div>
  );
}
