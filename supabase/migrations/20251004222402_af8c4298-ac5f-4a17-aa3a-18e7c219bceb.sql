-- Backfill città dai lead esistenti estraendo da user_contact.indirizzo
-- Popola solo il campo citta (lasciando cap e regione NULL per i vecchi lead)

UPDATE leads
SET citta = (
  CASE
    WHEN user_contact->>'indirizzo' ILIKE '%milano%' THEN 'Milano'
    WHEN user_contact->>'indirizzo' ILIKE '%roma%' THEN 'Roma'
    WHEN user_contact->>'indirizzo' ILIKE '%napoli%' THEN 'Napoli'
    WHEN user_contact->>'indirizzo' ILIKE '%torino%' THEN 'Torino'
    WHEN user_contact->>'indirizzo' ILIKE '%palermo%' THEN 'Palermo'
    WHEN user_contact->>'indirizzo' ILIKE '%genova%' THEN 'Genova'
    WHEN user_contact->>'indirizzo' ILIKE '%bologna%' THEN 'Bologna'
    WHEN user_contact->>'indirizzo' ILIKE '%firenze%' THEN 'Firenze'
    WHEN user_contact->>'indirizzo' ILIKE '%bari%' THEN 'Bari'
    WHEN user_contact->>'indirizzo' ILIKE '%catania%' THEN 'Catania'
    WHEN user_contact->>'indirizzo' ILIKE '%verona%' THEN 'Verona'
    WHEN user_contact->>'indirizzo' ILIKE '%venezia%' THEN 'Venezia'
    WHEN user_contact->>'indirizzo' ILIKE '%messina%' THEN 'Messina'
    WHEN user_contact->>'indirizzo' ILIKE '%padova%' THEN 'Padova'
    WHEN user_contact->>'indirizzo' ILIKE '%trieste%' THEN 'Trieste'
    WHEN user_contact->>'indirizzo' ILIKE '%taranto%' THEN 'Taranto'
    WHEN user_contact->>'indirizzo' ILIKE '%brescia%' THEN 'Brescia'
    WHEN user_contact->>'indirizzo' ILIKE '%parma%' THEN 'Parma'
    WHEN user_contact->>'indirizzo' ILIKE '%modena%' THEN 'Modena'
    WHEN user_contact->>'indirizzo' ILIKE '%reggio calabria%' THEN 'Reggio Calabria'
    WHEN user_contact->>'indirizzo' ILIKE '%reggio emilia%' THEN 'Reggio Emilia'
    WHEN user_contact->>'indirizzo' ILIKE '%perugia%' THEN 'Perugia'
    WHEN user_contact->>'indirizzo' ILIKE '%livorno%' THEN 'Livorno'
    WHEN user_contact->>'indirizzo' ILIKE '%cagliari%' THEN 'Cagliari'
    WHEN user_contact->>'indirizzo' ILIKE '%arezzo%' THEN 'Arezzo'
    WHEN user_contact->>'indirizzo' ILIKE '%teramo%' THEN 'Teramo'
    WHEN user_contact->>'indirizzo' ILIKE '%latina%' THEN 'Latina'
    WHEN user_contact->>'indirizzo' ILIKE '%sassari%' THEN 'Sassari'
    WHEN user_contact->>'indirizzo' ILIKE '%pescara%' THEN 'Pescara'
    WHEN user_contact->>'indirizzo' ILIKE '%bergamo%' THEN 'Bergamo'
    WHEN user_contact->>'indirizzo' ILIKE '%trento%' THEN 'Trento'
    WHEN user_contact->>'indirizzo' ILIKE '%vicenza%' THEN 'Vicenza'
    WHEN user_contact->>'indirizzo' ILIKE '%treviso%' THEN 'Treviso'
    WHEN user_contact->>'indirizzo' ILIKE '%ferrara%' THEN 'Ferrara'
    WHEN user_contact->>'indirizzo' ILIKE '%ravenna%' THEN 'Ravenna'
    WHEN user_contact->>'indirizzo' ILIKE '%rimini%' THEN 'Rimini'
    WHEN user_contact->>'indirizzo' ILIKE '%salerno%' THEN 'Salerno'
    WHEN user_contact->>'indirizzo' ILIKE '%foggia%' THEN 'Foggia'
    WHEN user_contact->>'indirizzo' ILIKE '%ancona%' THEN 'Ancona'
    WHEN user_contact->>'indirizzo' ILIKE '%bolzano%' THEN 'Bolzano'
    WHEN user_contact->>'indirizzo' ILIKE '%novara%' THEN 'Novara'
    WHEN user_contact->>'indirizzo' ILIKE '%piacenza%' THEN 'Piacenza'
    WHEN user_contact->>'indirizzo' ILIKE '%lecce%' THEN 'Lecce'
    WHEN user_contact->>'indirizzo' ILIKE '%siena%' THEN 'Siena'
    WHEN user_contact->>'indirizzo' ILIKE '%udine%' THEN 'Udine'
    WHEN user_contact->>'indirizzo' ILIKE '%como%' THEN 'Como'
    WHEN user_contact->>'indirizzo' ILIKE '%la spezia%' THEN 'La Spezia'
    WHEN user_contact->>'indirizzo' ILIKE '%pisa%' THEN 'Pisa'
    WHEN user_contact->>'indirizzo' ILIKE '%lucca%' THEN 'Lucca'
    WHEN user_contact->>'indirizzo' ILIKE '%brindisi%' THEN 'Brindisi'
    ELSE NULL
  END
)
WHERE user_contact IS NOT NULL
AND citta IS NULL
AND user_contact->>'indirizzo' IS NOT NULL;