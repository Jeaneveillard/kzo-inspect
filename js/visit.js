/** Champs et utilitaires — visite d'inspection (AIBQ art. 14.2, BNQ) */

export const CIEL_OPTIONS = [
  { value: '', label: '— Conditions —' },
  { value: 'ensoleille', label: 'Ensoleillé' },
  { value: 'nuageux', label: 'Nuageux' },
  { value: 'brume', label: 'Brume / brouillard' },
  { value: 'pluie', label: 'Pluie' },
  { value: 'neige', label: 'Neige' },
  { value: 'vent-fort', label: 'Vent fort' },
  { value: 'mixte', label: 'Mixte / variable' },
];

export function defaultVisit() {
  const now = new Date();
  const parts = new Intl.DateTimeFormat('fr-CA', {
    timeZone: 'America/Toronto',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(now);

  const get = (type) => parts.find((p) => p.type === type)?.value ?? '';
  const date = `${get('year')}-${get('month')}-${get('day')}`;

  return {
    date,
    heureDebut: `${get('hour')}:${get('minute')}`,
    heureFin: '',
    conditionsCiel: '',
    meteo: '',
    temperatureAir: '',
    precipitation: '',
    vent: '',
    visibilite: '',
    neigeAuSol: '',
    personnesPresentes: '',
  };
}

export function normalizeVisit(inspection, { persist = false } = {}) {
  const legacyMeteo = inspection.meteo ?? '';
  const legacyTemp = inspection.temperature ?? '';

  if (!inspection.visit || typeof inspection.visit !== 'object') {
    inspection.visit = defaultVisit();
  }

  const v = inspection.visit;
  if (!v.date) v.date = defaultVisit().date;
  if (!v.meteo && legacyMeteo) v.meteo = legacyMeteo;
  if (!v.temperatureAir && legacyTemp) v.temperatureAir = legacyTemp;

  if (persist) {
    delete inspection.meteo;
    delete inspection.temperature;
  }

  if (!inspection.site) inspection.site = {};
  if (inspection.site.proprietaire === undefined) inspection.site.proprietaire = '';
  if (inspection.site.courtier === undefined) inspection.site.courtier = '';
  if (inspection.site.courrielClient === undefined) inspection.site.courrielClient = '';
  if (inspection.site.telephoneClient === undefined) inspection.site.telephoneClient = '';

  return inspection;
}

export function cielLabel(value) {
  return CIEL_OPTIONS.find((o) => o.value === value)?.label ?? '';
}

export function formatVisitDateTime(inspection) {
  const v = inspection.visit;
  if (!v?.date) return '—';
  const dateStr = formatDateFr(v.date);
  const debut = v.heureDebut || '';
  const fin = v.heureFin ? ` → ${v.heureFin}` : '';
  return `${dateStr}${debut ? ` · ${debut}${fin}` : ''}`;
}

export function formatDateFr(isoDate) {
  if (!isoDate) return '—';
  const [y, m, d] = isoDate.split('-').map(Number);
  if (!y) return isoDate;
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString('fr-CA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatConditionsMeteo(inspection) {
  const v = inspection.visit ?? {};
  const parts = [];
  const ciel = cielLabel(v.conditionsCiel);
  if (ciel && ciel !== '— Conditions —') parts.push(ciel);
  if (v.meteo) parts.push(v.meteo);
  if (v.temperatureAir) parts.push(`Temp. air : ${v.temperatureAir}`);
  if (v.precipitation) parts.push(`Précip. : ${v.precipitation}`);
  if (v.vent) parts.push(`Vent : ${v.vent}`);
  if (v.visibilite) parts.push(`Visibilité : ${v.visibilite}`);
  if (v.neigeAuSol) parts.push(`Neige/glace au sol : ${v.neigeAuSol}`);
  return parts.length ? parts.join(' · ') : '—';
}
