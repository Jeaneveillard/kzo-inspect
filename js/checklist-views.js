import { STATUS_OPTIONS, PRIORITY_OPTIONS } from './templates.js';
import {
  getPresetsForStatus,
  normalizeChecklistItem,
} from './quick-responses.js';
import {
  CHECKLIST_FILTERS,
  sectionProgress,
  sectionStats,
  sectionListStatus,
  itemMatchesFilter,
  countPending,
} from './checklist-utils.js';
import {
  getSectionItemGroups,
  itemsProgress,
  sectionHasSubsections,
  subsectionCount,
  normalizeSection,
  isInfoSection,
} from './section-structure.js';

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const _matBase = {
  'walk-toiture': {
    label: 'Type de revêtement de toiture',
    options: [
      'Bardeau d\'asphalte (3 tabs)',
      'Bardeau d\'asphalte (architectural / dimensionnel)',
      'Métal — acier ou aluminium',
      'Ardoise naturelle',
      'Tuile béton ou terre cuite',
      'Cuivre',
      'Bardeau de cèdre / bois',
      'EPDM (toit plat — caoutchouc)',
      'TPO / PVC (toit plat — membrane)',
      'Gravier-bitume / asphalte (toit plat)',
      'Polyuréthane giclé (toit plat)',
      'Mixte ou inconnu',
    ],
  },
  'walk-fondations': {
    label: 'Type de fondation',
    options: [
      'Béton coulé monolithique',
      'Blocs de béton',
      'Pierre naturelle (maçonnerie)',
      'Brique',
      'Dalle flottante (béton sur terre)',
      'Poteaux vissés',
      'Bois traité (crawl space)',
      'Mixte ou inconnu',
    ],
  },
  'walk-facades': {
    label: 'Type de revêtement extérieur',
    options: [
      'Vinyle',
      'Aluminium',
      'Brique',
      'Pierre naturelle ou artificielle',
      'Stucco',
      'Bardeau de cèdre',
      'Béton fibré (Hardie Plank / Artisan)',
      'Bois',
      'Panneau composite (Trespa, etc.)',
      'Mixte ou inconnu',
    ],
  },
  'walk-plomb-ext': {
    label: 'Entrée d\'eau principale',
    options: [
      'Cuivre',
      'PEX',
      'PVC / CPVC',
      'Acier galvanisé',
      'Plomb (à signaler)',
      'Inconnu / non visible',
    ],
  },
  'aibq-v-iv': {
    label: 'Matériaux tuyaux d\'amenée',
    options: [
      'Cuivre',
      'PEX (rouge/bleu/blanc)',
      'PVC / CPVC',
      'Acier galvanisé',
      'Plomb — à signaler impérativement',
      'Polybutylène — Poly-B (gris) — à signaler',
      'Mixte',
      'Inconnu',
    ],
  },
  'aibq-v-v': {
    label: 'Ampérage panneau principal',
    options: [
      '60 A — mise à niveau recommandée',
      '100 A',
      '125 A',
      '150 A',
      '200 A',
      'Panneau à fusibles (100 A)',
      'Panneau à fusibles (60 A ou moins)',
      'Federal Pacific / Zinsco',
    ],
  },
  'aibq-v-vi': {
    label: 'Source de chauffage principale',
    options: [
      'Électrique — plinthes',
      'Électrique — convecteurs',
      'Gaz naturel — fournaise à air forcé',
      'Gaz naturel — chaudière à eau chaude',
      'Mazout — fournaise à air forcé',
      'Mazout — chaudière à eau chaude',
      'Propane',
      'Thermopompe centrale',
      'Bois / poêle à bois',
      'Granules (pellets)',
      'Biénergie',
      'Géothermie',
      'Mixte',
    ],
  },
  'aibq-v-vii': {
    label: 'Système de climatisation',
    options: [
      'Thermopompe centrale (ducted)',
      'Thermopompe murale (mini-split)',
      'Climatiseur central',
      'Climatiseur de fenêtre (portatif)',
      'Absent',
    ],
  },
  'aibq-v-ix': {
    label: 'Type d\'isolation visible (combles)',
    options: [
      'Laine de verre soufflée',
      'Cellulose soufflée',
      'Polyuréthane giclé (SPF)',
      'Laine minérale (roche)',
      'Polystyrène expansé (EPS — blanc)',
      'Polyisocyanurate (jaune / rose)',
      'Vermiculite (Zonolite) — potentiellement amianté',
      'FUUF — mousse urée-formaldéhyde',
      'Fibre de verre en nattes',
      'Mixte ou inconnu',
    ],
  },
  'aibq-v-viii': {
    label: 'Revêtement de plancher principal',
    options: [
      'Bois franc',
      'Bois d\'ingénierie',
      'Stratifié (laminate)',
      'Céramique / porcelaine',
      'Vinyle (LVP / LVT)',
      'Tapis',
      'Béton poli ou peint',
      'Mixte',
    ],
  },
};

_matBase['bnq-w-toiture']    = _matBase['walk-toiture'];
_matBase['bat-toiture']      = _matBase['walk-toiture'];
_matBase['bnq-w-fondations'] = _matBase['walk-fondations'];
_matBase['bat-fondations']   = _matBase['walk-fondations'];
_matBase['bnq-w-facades']    = _matBase['walk-facades'];
_matBase['bat-facades']      = _matBase['walk-facades'];
_matBase['bnq-w-plomb-ext']  = _matBase['walk-plomb-ext'];
_matBase['bat-plomb-ext']    = _matBase['walk-plomb-ext'];
_matBase['bnq-12-3']         = _matBase['aibq-v-iv'];
_matBase['bnq-12-4']         = _matBase['aibq-v-v'];
_matBase['bnq-12-5']         = _matBase['aibq-v-vi'];
_matBase['bnq-12-7']         = _matBase['aibq-v-ix'];
_matBase['bnq-12-6']         = _matBase['aibq-v-viii'];

export const SECTION_MATERIAL_OPTIONS = _matBase;

export function stripNumbering(text) {
  return String(text || '').replace(/^(?:Art\.\s*)?\d+(?:\.\d+)*[a-z]?\.?\s*[-—–:]*\s*/i, '');
}

function itemCoords(si, subIndex, ii) {
  return `data-si="${si}" data-sub="${subIndex}" data-ii="${ii}"`;
}

export function renderChecklistToolbar(i, filter) {
  const pending = countPending(i);
  const filterBtns = CHECKLIST_FILTERS.map(
    (f) =>
      `<button type="button" class="chip ${filter === f.id ? 'is-active' : ''}" data-checklist-filter="${f.id}">${f.label}</button>`,
  ).join('');
  return `
    <div class="checklist-toolbar">
      <div class="checklist-toolbar__filters">${filterBtns}</div>
      <span class="checklist-toolbar__hint">${pending > 0 ? `${pending} point${pending > 1 ? 's' : ''} en attente` : 'Checklist complète ✓'} · Touchez <strong>C</strong> (conforme) <strong>NC</strong> (non-conforme) <strong>AC</strong> (à corriger) <strong>N/A</strong>, puis choisissez une pastille.</span>
    </div>`;
}

function renderQuickResponsesBlock(item, si, subIndex, ii, contextId) {
  normalizeChecklistItem(item);
  const coords = itemCoords(si, subIndex, ii);
  const selected = new Set(item.selectedPresets || []);
  const status = item.status;
  const presets = getPresetsForStatus(status, contextId);
  const chips = status
    ? presets
        .map(
          (p) =>
            `<button type="button" class="preset-chip ${selected.has(p.id) ? 'is-selected' : ''}" data-preset="${p.id}" ${coords} title="Ajouter ou retirer">${escapeHtml(p.label)}</button>`,
        )
        .join('')
    : `<p class="preset-hint preset-hint--step">① Touchez d'abord <strong>C</strong>, <strong>NC</strong>, <strong>AC</strong> ou <strong>N/A</strong> ci-dessus — les pastilles apparaissent ici.</p>`;

  return `
    <div class="check-item__presets">
      <span class="check-item__presets-label">Réponses rapides</span>
      <div class="preset-chips" role="group" aria-label="Réponses prédéfinies">${chips}</div>
      <label class="check-item__comment-label" style="display:flex;align-items:center;gap:0.5rem;">
        <span>Commentaire inspecteur</span>
        <button type="button" class="btn btn--ghost btn--sm narratives-trigger"
          data-open-narratives
          data-si="${si}" data-sub="${subIndex}" data-ii="${ii}"
          data-section-id="${escapeHtml(contextId || '')}"
          data-status="${escapeHtml(item.status || '')}">📋 Narratifs</button>
      </label>
      <textarea class="input check-item__inspector-comment" placeholder="Vos observations, mesures, références d'articles…" data-inspector-comment ${coords} rows="2">${escapeHtml(item.inspectorComment)}</textarea>
    </div>`;
}

function renderChecklistItem(item, si, subIndex, ii, filter, sec, subId) {
  if (!itemMatchesFilter(item, filter)) return '';
  normalizeChecklistItem(item);
  const coords = itemCoords(si, subIndex, ii);
  const contextId = subId || sec?.id;
  
  if (sec && isInfoSection(sec.id)) {
    return `
      <article class="check-item check-item--info" ${coords}>
        <p class="check-item__label check-item__label--info">
          <svg class="check-item__info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          ${escapeHtml(stripNumbering(item.label))}
        </p>
      </article>`;
  }

  const statusBtns = STATUS_OPTIONS.map(
    (s) =>
      `<button type="button" class="status-btn status-btn--${s.value} ${item.status === s.value ? 'is-selected' : ''}" data-status="${s.value}" ${coords} title="${s.label}">${s.short}</button>`,
  ).join('');
  const priority = PRIORITY_OPTIONS.map(
    (p) =>
      `<option value="${p.value}" ${item.priority === p.value ? 'selected' : ''}>${p.label}</option>`,
  ).join('');
  const photos =
    item.photos?.length > 0
      ? `<div class="photo-strip">${item.photos
          .map(
            (p, pi) =>
              `<figure class="photo-thumb">
                 <img src="${p}" alt="" />
                 <div class="photo-thumb__actions">
                   <button type="button" class="btn-photo-action" title="Analyser avec l'IA" data-ai-photo ${coords} data-pi="${pi}">🤖</button>
                   <button type="button" class="btn-photo-action" title="Dessiner / Éditer" data-edit-photo ${coords} data-pi="${pi}">✏️</button>
                   <button type="button" class="btn-photo-action photo-thumb__del" title="Supprimer" data-del-photo ${coords} data-pi="${pi}">×</button>
                 </div>
               </figure>`,
          )
          .join('')}</div>`
      : '';
  return `
    <article class="check-item ${item.status ? `check-item--${item.status}` : ''}" ${coords}>
      <p class="check-item__label">${escapeHtml(stripNumbering(item.label))}</p>
      <div class="check-item__status">${statusBtns}</div>
      <div class="check-item__extra">
        <select class="input input--sm" data-priority ${coords} ${!item.status || item.status === 'conforme' || item.status === 'na' ? 'disabled' : ''}>
          <option value="">Priorité</option>${priority}
        </select>
        <label class="btn btn--sm btn--ghost photo-btn">
          📷 Photo
          <input type="file" accept="image/*" hidden data-photo ${coords} />
        </label>
      </div>
      ${renderQuickResponsesBlock(item, si, subIndex, ii, contextId)}
      ${photos}
    </article>`;
}

export function renderSectionContent(sec, si, filter, inspection) {
  normalizeSection(sec);
  const groups = getSectionItemGroups(sec);
  if (!groups.length) {
    return '<p class="section-list__empty">Aucun point dans cette section.</p>';
  }

  const matDef = SECTION_MATERIAL_OPTIONS[sec.id];
  const selectedMat = inspection?.sectionMateriau?.[sec.id] || '';
  const materiauBlock = matDef ? `
    <div class="section-materiau">
      <label class="section-materiau__label">${escapeHtml(matDef.label)}</label>
      <select class="input input--sm section-materiau__select" data-section-materiau="${si}" data-section-id="${escapeHtml(sec.id)}">
        <option value="">— Sélectionner —</option>
        ${matDef.options.map((o) => `<option value="${escapeHtml(o)}" ${selectedMat === o ? 'selected' : ''}>${escapeHtml(o)}</option>`).join('')}
      </select>
      ${selectedMat ? `<span class="section-materiau__badge">${escapeHtml(selectedMat)}</span>` : ''}
    </div>` : '';

  return materiauBlock + groups
    .map(({ subIndex, title, items, id }) => {
      const itemsHtml = items
        .map((item, ii) => renderChecklistItem(item, si, subIndex, ii, filter, sec, id))
        .join('');
      if (!itemsHtml.trim()) return '';

      if (subIndex >= 0 && title) {
        const subProg = itemsProgress(items);
        return `
          <div class="check-subsection" id="subsection-${id || `${sec.id}-${subIndex}`}">
            <div class="check-subsection__head">
              <h4 class="check-subsection__title">${escapeHtml(title)}</h4>
              <span class="check-subsection__progress">${subProg.answered}/${subProg.total} · ${subProg.pct}%</span>
              <button type="button" class="btn btn--ghost btn--sm" data-section-na-sub="${si}" data-sub="${subIndex}">Tout N/A</button>
            </div>
            ${itemsHtml}
          </div>`;
      }
      return itemsHtml;
    })
    .join('');
}

function sectionListRows(i, activeSi) {
  return i.sections
    .map((sec, si) => {
      normalizeSection(sec);
      const prog = sectionProgress(sec);
      const st = sectionStats(sec);
      const state = sectionListStatus(prog, st);
      const subs = subsectionCount(sec);
      const meta = [
        subs > 0 ? `${subs} sous-s.` : '',
        `${prog.pct}%`,
        st.pending ? `${st.pending} à faire` : '',
        st.nc ? `${st.nc} NC` : '',
      ]
        .filter(Boolean)
        .join(' · ');
      const active = activeSi === si ? ' section-list__item--active' : '';
      return `
        <li class="section-list__item section-list__item--${state}${active}">
          <button type="button" class="section-list__btn ${activeSi === si ? 'section-list__btn--active' : ''}" data-open-section="${si}" aria-current="${activeSi === si ? 'true' : 'false'}">
            <span class="section-list__num" aria-hidden="true">${si + 1}.</span>
            <span class="section-list__body">
              <span class="section-list__title">${escapeHtml(stripNumbering(sec.title))}</span>
            </span>
          </button>
        </li>`;
    })
    .join('');
}

/** Rail gauche : sections toujours visibles. */
export function renderSectionListRail(i, route) {
  const activeSi =
    route.checklistView === 'section' && route.checklistSection != null && !Number.isNaN(+route.checklistSection)
      ? +route.checklistSection
      : null;
  return `
    <div class="section-list-header section-list-header--rail">
      <h3 class="section-list-header__title" style="margin-bottom: 1rem; font-size: 1.1rem;">Sections</h3>
    </div>
    <ol class="section-list section-list--rail" aria-label="Sections de la checklist" style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.25rem;">
      ${sectionListRows(i, activeSi)}
    </ol>`;
}

export function renderSectionListView(i, filter) {
  const totalSections = i.sections.length;
  const rows = sectionListRows(i, null);

  return `
    ${renderChecklistToolbar(i, filter)}
    <div class="section-list-header">
      <h3 class="section-list-header__title">Sections à inspecter</h3>
      <p class="section-list-header__desc">${totalSections} section${totalSections > 1 ? 's' : ''} — l'inspection commence par l'<strong>extérieur</strong>, puis la toiture. Une section peut contenir des sous-sections. Touchez une ligne pour ouvrir.</p>
      <button type="button" class="btn btn--ghost btn--sm" data-checklist-view="all">Vue défilante (tout afficher)</button>
    </div>
    <ol class="section-list" aria-label="Liste des sections à inspecter">
      ${rows}
    </ol>`;
}

export function renderSectionDetailPane(i, si, filter) {
  const sec = i.sections[si];
  normalizeSection(sec);
  const prog = sectionProgress(sec);
  const totalSections = i.sections.length;
  const content = renderSectionContent(sec, si, filter, i);
  const empty =
    !content.trim() || content.includes('section-list__empty')
      ? `<p class="section-list__empty">Aucun point ne correspond au filtre dans cette section.</p>`
      : content;
  const subsHint = sectionHasSubsections(sec)
    ? `<p class="section-subsections-hint">${subsectionCount(sec)} sous-section${subsectionCount(sec) > 1 ? 's' : ''} dans cette section</p>`
    : '';

  return `
    <div class="section-detail-nav">
      <div class="section-detail-nav__jump">
        <button type="button" class="btn btn--ghost btn--sm" data-goto-section="${si - 1}" ${si <= 0 ? 'disabled' : ''}>‹ Préc.</button>
        <span class="section-detail-nav__pos">${si + 1} / ${totalSections}</span>
        <button type="button" class="btn btn--ghost btn--sm" data-goto-section="${si + 1}" ${si >= totalSections - 1 ? 'disabled' : ''}>Suiv. ›</button>
      </div>
    </div>
    <section class="check-section check-section--solo" id="section-${sec.id}">
      <div class="check-section__head">
        <h3 class="check-section__title">
          <span class="check-section__index">${si + 1}/${totalSections}</span>
          ${escapeHtml(stripNumbering(sec.title))}
          <span class="check-section__progress">${prog.pct}%</span>
        </h3>
        <button type="button" class="btn btn--ghost btn--sm" data-section-na="${si}">Tout N/A (section)</button>
      </div>
      ${subsHint}
      ${empty}
    </section>`;
}

export function renderSectionDetailView(i, si, filter) {
  return `${renderChecklistToolbar(i, filter)}${renderSectionDetailPane(i, si, filter)}`;
}

export function renderChecklistAllPane(i, filter) {
  const totalSections = i.sections.length;
  return `
    <div class="section-list-header section-list-header--pane">
      <p class="section-list-header__desc">Vue complète — ${totalSections} sections</p>
    </div>
    ${i.sections
      .map((sec, si) => {
        normalizeSection(sec);
        const prog = sectionProgress(sec);
        const content = renderSectionContent(sec, si, filter, i);
        if (!content.trim() || content.includes('section-list__empty')) return '';
        return `
          <section class="check-section" id="section-${sec.id}">
            <div class="check-section__head">
              <h3 class="check-section__title">
                <span class="check-section__index">${si + 1}/${totalSections}</span>
                ${escapeHtml(stripNumbering(sec.title))}
                <span class="check-section__progress">${prog.pct}%</span>
              </h3>
              <button type="button" class="btn btn--ghost btn--sm" data-open-section="${si}">Ouvrir</button>
              <button type="button" class="btn btn--ghost btn--sm" data-section-na="${si}">Tout N/A</button>
            </div>
            ${content}
          </section>`;
      })
      .join('')}`;
}

export function renderChecklistAllSectionsView(i, filter) {
  return `${renderChecklistToolbar(i, filter)}${renderChecklistAllPane(i, filter)}`;
}

/** Panneau principal checklist (détail section ou vue complète). */
export function renderChecklistMainPane(i, route) {
  const filter = route.checklistFilter || 'all';
  const view = route.checklistView || 'section';
  const si = route.checklistSection;

  if (view === 'all') {
    return renderChecklistAllPane(i, filter);
  }
  if (view === 'section' && si != null && i.sections[si]) {
    return renderSectionDetailPane(i, si, filter);
  }
  return `<div class="checklist-main-placeholder"><p>Sélectionnez une section dans la liste à gauche pour commencer l'inspection.</p></div>`;
}

export function renderChecklistTabContent(i, route) {
  const filter = route.checklistFilter || 'all';
  const view = route.checklistView || 'list';
  const si = route.checklistSection;

  return `
    <div class="checklist-split" style="display: flex; gap: 2rem; align-items: flex-start; margin-top: 1rem;">
      <div class="checklist-split__rail" style="flex: 0 0 300px; position: sticky; top: 1rem; max-height: 80vh; overflow-y: auto; padding-right: 1rem; border-right: 1px solid var(--border, #e2e8f0);">
        ${renderSectionListRail(i, route)}
      </div>
      <div class="checklist-split__main" style="flex: 1; min-width: 0;">
        ${renderChecklistToolbar(i, filter)}
        ${renderChecklistMainPane(i, route)}
      </div>
    </div>
  `;
}
