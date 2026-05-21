import { STATUS_OPTIONS } from './templates.js';
import { formatItemDocumentation, normalizeChecklistItem } from './quick-responses.js';
import {
  iterSectionItems,
  sectionProgress,
  sectionStats,
  formatItemLocation,
  normalizeInspectionSections,
} from './section-structure.js';

export { sectionProgress, sectionStats } from './section-structure.js';

export const CHECKLIST_FILTERS = [
  { id: 'all', label: 'Tout' },
  { id: 'pending', label: 'Non répondu' },
  { id: 'nc', label: 'NC / À corriger' },
  { id: 'photos', label: 'Avec photos' },
];

export function sectionListStatus(prog, stats) {
  if (prog.total > 0 && prog.pct === 100) return 'done';
  if (stats.nc > 0 || stats.ac > 0) return 'warn';
  if (prog.pct > 0) return 'progress';
  return 'pending';
}

export function itemMatchesFilter(item, filter) {
  if (filter === 'all') return true;
  if (filter === 'pending') return !item.status;
  if (filter === 'nc') return item.status === 'non-conforme' || item.status === 'a-corriger';
  if (filter === 'photos') return (item.photos?.length || 0) > 0;
  return true;
}

export function collectFindings(inspection) {
  normalizeInspectionSections(inspection);
  const findings = [];
  inspection.sections.forEach((sec, si) => {
    iterSectionItems(sec, (item, subIndex, ii, subsectionTitle) => {
      if (item.status === 'non-conforme' || item.status === 'a-corriger') {
        normalizeChecklistItem(item);
        findings.push({
          sectionTitle: formatItemLocation(sec.title, subsectionTitle),
          sectionIndex: si,
          subIndex,
          itemIndex: ii,
          label: item.label,
          status: item.status,
          priority: item.priority,
          note: formatItemDocumentation(item),
          selectedPresets: [...(item.selectedPresets || [])],
          inspectorComment: item.inspectorComment || '',
          photos: item.photos || [],
        });
      }
    });
  });
  return findings;
}

export function countPending(inspection) {
  normalizeInspectionSections(inspection);
  let n = 0;
  for (const sec of inspection.sections) {
    iterSectionItems(sec, (item) => {
      if (!item.status) n += 1;
    });
  }
  return n;
}

export function statusLabel(value) {
  return STATUS_OPTIONS.find((s) => s.value === value)?.label ?? '—';
}

export const EXPERT_TYPES = [
  { value: 'electricien', label: 'Électricien (maître électricien)' },
  { value: 'plombier', label: 'Plombier' },
  { value: 'chauffage', label: 'Chauffage / climatisation' },
  { value: 'toiture', label: 'Couvreur / toiture' },
  { value: 'structure', label: 'Structure / charpente' },
  { value: 'fondation', label: 'Fondation / sols' },
  { value: 'ingenieur', label: 'Ingénieur' },
  { value: 'arpenteur', label: 'Arpenteur-géomètre' },
  { value: 'environnement', label: 'Environnement / moisissures' },
  { value: 'autre', label: 'Autre spécialiste' },
];

export function expertTypeLabel(value) {
  return EXPERT_TYPES.find((e) => e.value === value)?.label ?? value;
}
