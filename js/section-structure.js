/** Sections avec sous-sections optionnelles — points à la racine ou groupés */

export function createItems(parentId, labels) {
  return (labels || []).map((label, i) => ({
    id: `${parentId}-${i + 1}`,
    label,
    status: null,
    priority: 'mineur',
    note: '',
    selectedPresets: [],
    inspectorComment: '',
    photos: [],
  }));
}

export function createSubsection(id, title, labels) {
  return { id, title, items: createItems(id, labels) };
}

/**
 * createSection(id, title, labels[]) — liste plate (rétrocompatible)
 * createSection(id, title, { items?, subsections? })
 */
export function createSection(id, title, arg) {
  if (Array.isArray(arg)) {
    return { id, title, items: createItems(id, arg), subsections: [] };
  }
  const config = arg && typeof arg === 'object' ? arg : {};
  const subsections = (config.subsections || []).map((sub, i) => {
    if (typeof sub.items?.[0] === 'string') {
      return createSubsection(sub.id || `${id}-sub-${i + 1}`, sub.title, sub.items);
    }
    normalizeSection(sub);
    return sub;
  });
  return {
    id,
    title,
    items: createItems(id, config.items || []),
    subsections,
  };
}

export function normalizeSection(section) {
  if (!section) return section;
  if (!Array.isArray(section.items)) section.items = [];
  if (!Array.isArray(section.subsections)) section.subsections = [];
  section.subsections.forEach((sub, i) => {
    if (!sub.id) sub.id = `${section.id}-sub-${i + 1}`;
    if (!Array.isArray(sub.items)) sub.items = [];
  });
  return section;
}

export function normalizeInspectionSections(inspection) {
  inspection?.sections?.forEach(normalizeSection);
  return inspection;
}

export function sectionHasSubsections(section) {
  normalizeSection(section);
  return section.subsections.length > 0;
}

export function isInfoSection(sectionId) {
  return [
    'aibq-normes', 'bnq-normes',
    'aibq-ch1', 'aibq-ch2', 'aibq-ch3-limites', 'aibq-ch3-excl', 'aibq-ch4', 'aibq-annexe',
    'bnq-ch2', 'bnq-ch4', 'bnq-ch5', 'bnq-ch6', 'bnq-ch7', 'bnq-ch8', 'bnq-ch9', 'bnq-ch10', 'bnq-ch11'
  ].includes(sectionId);
}

export function subsectionCount(section) {
  normalizeSection(section);
  return section.subsections.length;
}

/** Groupes : points racine (subIndex -1) puis chaque sous-section */
export function getSectionItemGroups(section) {
  normalizeSection(section);
  const groups = [];
  if (section.items.length > 0) {
    groups.push({ subIndex: -1, title: null, items: section.items });
  }
  section.subsections.forEach((sub, subIndex) => {
    if (sub.items.length > 0) {
      groups.push({ subIndex, title: sub.title, items: sub.items, id: sub.id });
    }
  });
  return groups;
}

export function iterSectionItems(section, callback) {
  getSectionItemGroups(section).forEach(({ items, subIndex, title }) => {
    items.forEach((item, ii) => callback(item, subIndex, ii, title));
  });
}

export function resolveChecklistItem(inspection, si, subIndex, ii) {
  const sec = inspection.sections[si];
  normalizeSection(sec);
  const sub = Number(subIndex);
  if (sub < 0) return sec.items[ii];
  return sec.subsections[sub]?.items[ii];
}

export function parseSubIndex(value) {
  if (value === undefined || value === null || value === '') return -1;
  const n = Number(value);
  return Number.isFinite(n) ? n : -1;
}

export function itemsProgress(items, sectionId) {
  if (sectionId && isInfoSection(sectionId)) return { total: 0, answered: 0, pct: 100 };
  const total = items.length;
  if (!total) return { total: 0, answered: 0, pct: 0 };
  const answered = items.filter((it) => it.status).length;
  return { total, answered, pct: Math.round((answered / total) * 100) };
}

export function sectionProgress(section) {
  normalizeSection(section);
  if (isInfoSection(section.id)) {
    return { total: 0, answered: 0, pct: 100 };
  }
  let total = 0;
  let answered = 0;
  iterSectionItems(section, (item) => {
    total += 1;
    if (item.status) answered += 1;
  });
  return {
    total,
    answered,
    pct: total ? Math.round((answered / total) * 100) : 0,
  };
}

export function sectionStats(section) {
  normalizeSection(section);
  const stats = { pending: 0, nc: 0, ac: 0, conforme: 0, na: 0, photos: 0, total: 0 };
  if (isInfoSection(section.id)) return stats;
  iterSectionItems(section, (item) => {
    stats.total += 1;
    if (!item.status) stats.pending += 1;
    else if (item.status === 'non-conforme') stats.nc += 1;
    else if (item.status === 'a-corriger') stats.ac += 1;
    else if (item.status === 'conforme') stats.conforme += 1;
    else if (item.status === 'na') stats.na += 1;
    if ((item.photos?.length || 0) > 0) stats.photos += 1;
  });
  return stats;
}

export function markSectionAllNa(section) {
  iterSectionItems(section, (item) => {
    item.status = 'na';
  });
}

export function markSubsectionAllNa(section, subIndex) {
  const sub = Number(subIndex);
  if (sub < 0) {
    section.items.forEach((it) => {
      it.status = 'na';
    });
    return;
  }
  section.subsections[sub]?.items.forEach((it) => {
    it.status = 'na';
  });
}

export function formatItemLocation(sectionTitle, subsectionTitle) {
  if (subsectionTitle) return `${sectionTitle} — ${subsectionTitle}`;
  return sectionTitle;
}

/** Ordre de visite terrain (extérieur en premier) — gabarits AIBQ / BNQ */
const AIBQ_WALK_ORDER = [
  'aibq-ch1', 'aibq-ch2', 'aibq-ch3-limites', 'aibq-ch3-excl', 'aibq-ch4',
  'aibq-visite-ext', 'aibq-v-i',
  'aibq-v-iv', 'aibq-v-v', 'aibq-v-vi', 'aibq-v-vii', 'aibq-v-viii', 'aibq-v-ix', 'aibq-v-x', 'aibq-v-xi',
  'aibq-grenier', 'aibq-annexe',
  'aibq-v-ii', 'aibq-v-iii',
];

const BNQ_WALK_ORDER = [
  'bnq-ch2', 'bnq-ch4', 'bnq-ch5', 'bnq-ch6', 'bnq-ch7', 'bnq-ch8',
  'bnq-visite-ext',
  'bnq-12-3', 'bnq-12-4', 'bnq-12-5', 'bnq-12-6', 'bnq-12-7', 'bnq-12-8',
  'bnq-grenier', 'bnq-ch9', 'bnq-ch10', 'bnq-ch11',
  'bnq-12-1', 'bnq-12-2',
];

const BATIMENT_WALK_ORDER = [
  'bat-visite-ext', 'structure-int', 'securite', 'incendie-res', 'electrique', 'plomberie', 'bat-grenier',
  'exterieur', 'toiture', 'structure',
];

export function applyFieldWalkOrder(inspection) {
  if (!inspection?.sections?.length) return inspection;
  let order;
  if (inspection.templateId === 'aibq-preachat') order = AIBQ_WALK_ORDER;
  else if (inspection.templateId === 'bnq-3009') order = BNQ_WALK_ORDER;
  else if (inspection.templateId === 'batiment') order = BATIMENT_WALK_ORDER;
  else return inspection;

  const byId = new Map(inspection.sections.map((s) => [s.id, s]));
  const sorted = [];
  for (const id of order) {
    if (byId.has(id)) sorted.push(byId.get(id));
  }
  for (const sec of inspection.sections) {
    if (!order.includes(sec.id)) sorted.push(sec);
  }
  inspection.sections = sorted;
  return inspection;
}
