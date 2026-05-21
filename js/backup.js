import { loadInspections, saveInspections, loadProfile, saveProfile } from './storage.js';

const EXPORT_VERSION = 1;

// Liste blanche des champs de profil acceptés à l'import
const SAFE_PROFILE_KEYS = [
  'inspectorName', 'inspectorTitle', 'inspectorCert', 'inspectorPhone',
  'inspectorEmail', 'inspectorAddress', 'inspectorCity', 'inspectorProvince',
  'inspectorPostal', 'firmName', 'firmPhone', 'firmEmail', 'firmAddress',
  'brandingLogoDataUrl', 'signatureDataUrl', 'coverPhotoDataUrl',
  'reportHeaderColor', 'reportFooterText', 'language', 'currency',
  'taxRate', 'defaultTemplate', 'aiUseCloud', 'aiModel', 'aiProvider',
  'aiApiKey', 'googleClientId', 'sheetsWebhookUrl',
];

// Validation des data URLs : doit être data:image/... ou vide
function isValidDataUrl(value) {
  if (!value) return true;
  return /^data:image\/(jpeg|jpg|png|webp|gif);base64,[A-Za-z0-9+/=]+$/.test(value);
}

// Assainissement des data URLs d'une inspection importée
function sanitizeInspection(ins) {
  if (!ins || typeof ins !== 'object') return ins;
  const urlFields = ['signatureDataUrl', 'coverPhotoDataUrl', 'heroPhotoUrl'];
  for (const field of urlFields) {
    if (ins[field] && !isValidDataUrl(ins[field])) {
      console.warn(`[Security] ${field} invalide dans inspection ${ins.id} — ignoré`);
      ins[field] = '';
    }
  }
  return ins;
}

/**
 * Sauvegarde locale d'un seul dossier d'inspection (JSON).
 * Appelée automatiquement avant la génération du rapport final
 * pour éviter toute perte de données avant l'envoi vers Google Drive.
 */
export function exportInspectionBackup(inspection, profile = loadProfile()) {
  if (!inspection?.id) return;
  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const clientSlug = (inspection.site?.client || 'sans-client')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40)
    .toLowerCase();
  const dossier = inspection.site?.numeroDossier || 'sans-dossier';
  // Fix I-4 : exclure aiApiKey du profil export\u00e9
  const safeProfile = { ...profile };
  delete safeProfile.aiApiKey;
  const payload = {
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    app: 'KZO Inspect',
    type: 'inspection-backup',
    profile: safeProfile,
    inspections: [inspection],
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `kzo-dossier-${dossier}-${clientSlug}-${stamp}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportAllData() {
  // Fix I-4 : exclure aiApiKey du profil exporté
  const safeProfile = { ...loadProfile() };
  delete safeProfile.aiApiKey;
  const payload = {
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    app: 'KZO Inspect',
    profile: safeProfile,
    inspections: loadInspections(),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const stamp = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `kzo-inspect-sauvegarde-${stamp}.json`;
  a.click();
  URL.revokeObjectURL(url);
  return payload.inspections.length;
}

export async function importAllData(file, { replace = false } = {}) {
  const text = await file.text();
  const data = JSON.parse(text);
  if (!data.inspections || !Array.isArray(data.inspections)) {
    throw new Error('Fichier invalide : inspections manquantes.');
  }

  // Fix C-6 : validation du profil importé — liste blanche + data URLs
  if (data.profile && typeof data.profile === 'object') {
    const safeProfile = {};
    for (const key of SAFE_PROFILE_KEYS) {
      if (key in data.profile) safeProfile[key] = data.profile[key];
    }
    // Valider les data URLs du profil
    const profileUrlFields = ['brandingLogoDataUrl', 'signatureDataUrl', 'coverPhotoDataUrl'];
    for (const field of profileUrlFields) {
      if (safeProfile[field] && !isValidDataUrl(safeProfile[field])) {
        console.warn(`[Security] Champ profil ${field} invalide ignoré à l'import`);
        delete safeProfile[field];
      }
    }
    // Préserver la clé API existante si absente du fichier importé
    if (!safeProfile.aiApiKey) {
      const currentProfile = loadProfile();
      if (currentProfile.aiApiKey) safeProfile.aiApiKey = currentProfile.aiApiKey;
    }
    saveProfile(safeProfile);
  }

  // Fix C-6 : valider les data URLs dans chaque inspection importée
  const sanitizedInspections = data.inspections.map(sanitizeInspection);

  if (replace) {
    saveInspections(sanitizedInspections);
  } else {
    const existing = loadInspections();
    const byId = new Map(existing.map((i) => [i.id, i]));
    for (const ins of sanitizedInspections) {
      if (ins?.id) byId.set(ins.id, ins);
    }
    saveInspections([...byId.values()]);
  }
  return data.inspections.length;
}

export function estimateStorageUsage() {
  let bytes = 0;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith('inspectqc_')) {
        bytes += (localStorage.getItem(k)?.length || 0) * 2;
      }
    }
  } catch {
    /* ignore */
  }
  return bytes;
}

export function formatBytes(n) {
  if (n < 1024) return `${n} o`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} Ko`;
  return `${(n / (1024 * 1024)).toFixed(1)} Mo`;
}
