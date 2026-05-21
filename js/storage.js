import { normalizeVisit } from './visit.js';
import { normalizeInspectionItems } from './quick-responses.js';
import {
  normalizeInspectionSections,
  iterSectionItems,
  applyFieldWalkOrder,
} from './section-structure.js';
import { deleteAllClientFiles } from './client-files.js';

const STORAGE_KEY = 'inspectqc_inspections_v1';
const PROFILE_KEY = 'inspectqc_profile_v1';

/** Inspecteur titulaire — nom fixe sur tous les dossiers */
export const INSPECTOR_NAME = 'Jean Eveillard Cazeau';

export function loadInspections() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveInspections(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    if (e?.name === 'QuotaExceededError' || e?.code === 22) {
      window.dispatchEvent(new CustomEvent('kzo:storage-quota', {
        detail: { message: 'Espace de stockage plein — exportez vos données (Profil → Sauvegarde) puis réduisez les photos.' },
      }));
    }
    throw e;
  }
}

export function getInspection(id) {
  const found = loadInspections().find((i) => i.id === id) ?? null;
  if (!found) return null;
  normalizeVisit(found);
  if (!found.expertReferrals) found.expertReferrals = [];
  if (found.limitations === undefined) found.limitations = '';
  if (found.inspector) found.inspector.nom = INSPECTOR_NAME;
  normalizeInspectionItems(found);
  normalizeInspectionSections(found);
  applyFieldWalkOrder(found);
  return found;
}

export function upsertInspection(inspection) {
  normalizeVisit(inspection, { persist: true });
  const list = loadInspections();
  const idx = list.findIndex((i) => i.id === inspection.id);
  inspection.updatedAt = new Date().toISOString();
  if (idx >= 0) list[idx] = inspection;
  else list.unshift(inspection);
  saveInspections(list);
  return inspection;
}

export async function deleteInspection(id) {
  await deleteAllClientFiles(id).catch(() => {});
  const list = loadInspections().filter((i) => i.id !== id);
  saveInspections(list);
}

export function nextDossierNumber() {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const prefix = `KZO-${today}`;
  const list = loadInspections();
  const sameDay = list.filter((i) => i.site?.numeroDossier?.startsWith(prefix));
  const seq = String(sameDay.length + 1).padStart(3, '0');
  return `${prefix}-${seq}`;
}

export function nextInvoiceNumber(profile) {
  const year = new Date().getFullYear();
  if (!profile.invoiceYear || profile.invoiceYear !== year) {
    profile.invoiceCounter = 1;
    profile.invoiceYear = year;
  } else {
    profile.invoiceCounter = (profile.invoiceCounter || 0) + 1;
  }
  const num = String(profile.invoiceCounter).padStart(3, '0');
  saveProfile(profile);
  return `KZO-${year}-${num}`;
}

export function duplicateInspection(id) {
  const src = getInspection(id);
  if (!src) return null;
  const copy = JSON.parse(JSON.stringify(src));
  copy.id = crypto.randomUUID();
  copy.status = 'brouillon';
  copy.createdAt = new Date().toISOString();
  copy.updatedAt = copy.createdAt;
  copy.completedAt = null;
  copy.site = { ...copy.site, numeroDossier: nextDossierNumber(), client: copy.site.client ? `${copy.site.client} (copie)` : '' };
  copy.signatureDataUrl = null;
  if (copy.inspector) copy.inspector.nom = INSPECTOR_NAME;
  upsertInspection(copy);
  return copy;
}

export function computeGlobalStats(list) {
  let total = 0;
  let enCours = 0;
  let terminees = 0;
  let ncTotal = 0;
  for (const ins of list) {
    total += 1;
    if (ins.status === 'en-cours') enCours += 1;
    if (ins.status === 'terminee') terminees += 1;
    const s = computeStats(ins);
    ncTotal += s.nonConforme + s.aCorriger;
  }
  return { total, enCours, terminees, ncTotal };
}

export function loadProfile() {
  let profile;
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    profile = raw ? JSON.parse(raw) : defaultProfile();
  } catch {
    profile = defaultProfile();
  }
  profile.nom = INSPECTOR_NAME;
  return profile;
}

export function inspectorFieldsFromProfile(profile = loadProfile()) {
  return {
    nom: INSPECTOR_NAME,
    permis: profile.permis || '',
    entreprise: profile.entreprise || '',
    courriel: profile.courriel || '',
    telephone: profile.telephone || '',
    membreAibq: profile.membreAibq || '',
    certificatRbq: profile.certificatRbq || '',
  };
}

export function saveProfile(profile) {
  localStorage.setItem(
    PROFILE_KEY,
    JSON.stringify({ ...profile, nom: INSPECTOR_NAME }),
  );
}

function defaultProfile() {
  return {
    nom: INSPECTOR_NAME,
    permis: '',
    entreprise: '',
    courriel: '',
    telephone: '',
    membreAibq: '',
    certificatRbq: '',
    messageRemerciement: '',
    montantDefaut: '',
    descriptionServiceDefaut: 'Inspection de bâtiment d\'habitation',
    tauxTPS: 5,
    tauxTVQ: 9.975,
    noEntrepriseTPS: '',
    noEntrepriseTVQ: '',
    brandingLogoDataUrl: null,
    brandingAppName: 'KZO Inspect',
    brandingTagline: 'Inspection de bâtiments au Québec',
    brandingEntreprise: '',
    brandingFooter: '',
    brandingIbcMention: '',
    brandingReceiptPrefix: 'KZO',
    aiAssistantOpen: true,
    aiUseCloud: false,
    aiApiKey: '',
    aiProvider: 'anthropic',
    aiModel: 'claude-sonnet-4-6',
  };
}

export function computeStats(inspection) {
  let total = 0;
  let answered = 0;
  let conforme = 0;
  let nonConforme = 0;
  let aCorriger = 0;
  let na = 0;

  normalizeInspectionSections(inspection);
  for (const sec of inspection.sections) {
    iterSectionItems(sec, (item) => {
      total += 1;
      if (!item.status) return;
      answered += 1;
      if (item.status === 'conforme') conforme += 1;
      else if (item.status === 'non-conforme') nonConforme += 1;
      else if (item.status === 'a-corriger') aCorriger += 1;
      else if (item.status === 'na') na += 1;
    });
  }

  const progress = total ? Math.round((answered / total) * 100) : 0;
  const score = answered
    ? Math.round(((conforme + na) / answered) * 100)
    : null;

  return { total, answered, conforme, nonConforme, aCorriger, na, progress, score };
}
