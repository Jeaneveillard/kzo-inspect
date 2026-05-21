import {
  TEMPLATE_META,
  TEMPLATE_GROUPS,
  STATUS_OPTIONS,
  PRIORITY_OPTIONS,
  INSPECTION_STATUS,
  createEmptyInspection,
} from './templates.js';
import {
  loadInspections,
  upsertInspection,
  getInspection,
  deleteInspection,
  duplicateInspection,
  nextDossierNumber,
  nextInvoiceNumber,
  computeGlobalStats,
  loadProfile,
  saveProfile,
  computeStats,
  INSPECTOR_NAME,
  inspectorFieldsFromProfile,
} from './storage.js';
import { exportAllData, exportInspectionBackup, importAllData, estimateStorageUsage, formatBytes } from './backup.js';
import { initAiAssistant, openAiAssistant, updateAiAssistantContext } from './ai-assistant.js';
import { aiModelSelectMarkup, bindAiModelSelect, AI_PROVIDERS } from './ai-models.js';
import { analyzePhotoWithVision } from './ai-vision.js';
import { openImageEditor } from './image-editor.js';
import { renderSectionListRail, renderChecklistMainPane, renderChecklistToolbar } from './checklist-views.js';
import {
  CHECKLIST_FILTERS,
  sectionProgress,
  sectionStats,
  sectionListStatus,
  itemMatchesFilter,
  countPending,
  EXPERT_TYPES,
} from './checklist-utils.js';
import { renderChecklistTabContent } from './checklist-views.js';
import { openReport } from './report.js';
import { PROFESSIONAL_NARRATIVES, getNarratives } from './professional-narratives.js';
import { initRepairsModal } from './repairs-summary.js';
import { openThankYouLetter } from './thank-you-letter.js';
import {
  openReceipt,
  computeTaxes,
  normalizeReceipt,
  PAYMENT_MODES,
  PAYMENT_STATUS,
} from './receipt-inspection.js';
import { compressImage } from './image-utils.js';
import {
  applyTopBarBranding,
  resolveBranding,
  DEFAULT_LOGO_URL,
  getHeroLogoUrl,
} from './organization.js';
import {
  CIEL_OPTIONS,
  defaultVisit,
  formatVisitDateTime,
  normalizeVisit,
} from './visit.js';
import {
  FILE_CATEGORIES,
  categoryLabel,
  formatFileSize,
  listClientFiles,
  addClientFile,
  deleteClientFile,
  updateClientFileMeta,
  downloadClientFile,
  openClientFile,
} from './client-files.js';
import { initGoogleAuth, isGoogleConnected, googleAuthenticate, googleDisconnect, getGoogleToken } from './google-auth.js';
import { buildInvoiceHtml, sendInvoiceEmail, sendReceiptToSheets } from './gmail-send.js';

const main = document.getElementById('main-content');
const nav = document.getElementById('main-nav');
const toastContainer = document.getElementById('toast-container');
const confirmDialog = document.getElementById('confirm-dialog');

let route = { name: 'home' };
let autosaveTimer = null;

/** Timer d'auto-sauvegarde locale toutes les 2 minutes (démarré après le 1er save manuel) */
let localAutoSaveTimer = null;
let localAutoSaveCtx = null; // { inspection }

const LOCAL_AUTO_SAVE_INTERVAL_MS = 2 * 60 * 1000; // 2 minutes

function stopLocalAutoSave() {
  if (localAutoSaveTimer !== null) {
    clearInterval(localAutoSaveTimer);
    localAutoSaveTimer = null;
    localAutoSaveCtx = null;
  }
}

function startLocalAutoSave(inspection) {
  stopLocalAutoSave(); // éviter les doublons
  localAutoSaveCtx = { inspection };
  localAutoSaveTimer = setInterval(() => {
    if (!localAutoSaveCtx) return;
    const { inspection: insp } = localAutoSaveCtx;
    const panel = document.getElementById('inspect-main-content');
    if (panel) {
      saveCurrentTab(insp, route.tab || 'info', panel);
      upsertInspection(insp);
    }
    try {
      exportInspectionBackup(insp, loadProfile());
      toast('Auto-sauvegarde locale \u2713 (toutes les 2 min)', 'info');
    } catch (e) {
      console.warn('[KZO] Auto-sauvegarde locale échouée :', e);
    }
  }, LOCAL_AUTO_SAVE_INTERVAL_MS);
}

function navigate(name, params = {}) {
  stopLocalAutoSave(); // arrêter le timer quand on quitte le dossier
  route = { name, ...params };
  render();
  window.location.hash = encodeRoute(route);
}

function encodeRoute(r) {
  if (r.name === 'inspect' && r.id) return `inspect/${r.id}`;
  if (r.name === 'new') return 'new';
  if (r.name === 'profile') return 'profile';
  return '';
}

function parseHash() {
  const h = window.location.hash.replace(/^#/, '');
  if (h.startsWith('inspect/')) {
    return { name: 'inspect', id: h.slice(8) };
  }
  if (h === 'new') return { name: 'new' };
  if (h === 'profile') return { name: 'profile' };
  return { name: 'home' };
}

function toast(message, type = 'info') {
  const el = document.createElement('div');
  el.className = `toast toast--${type}`;
  el.textContent = message;
  toastContainer.appendChild(el);
  setTimeout(() => el.remove(), 3200);
}

function confirmAction(title, body) {
  return new Promise((resolve) => {
    document.getElementById('confirm-title').textContent = title;
    document.getElementById('confirm-body').textContent = body;
    confirmDialog.showModal();
    confirmDialog.onclose = () => {
      resolve(confirmDialog.returnValue === 'ok');
    };
  });
}

function renderTopBarSave() {
  const slot = document.getElementById('top-bar-save');
  if (!slot) return;
  if (route.name === 'inspect' && route.id) {
    slot.hidden = false;
    slot.innerHTML =
      '<button type="button" class="top-nav__link top-nav__link--save" id="btn-local-save" title="Télécharger une copie JSON du dossier sur votre ordinateur">&#x1F4BE; Sauvegarder</button>';
  } else {
    slot.hidden = true;
    slot.innerHTML = '';
  }
}

function renderNav() {
  const items = [
    { name: 'home', label: 'Accueil', hash: '' },
    { name: 'new', label: 'Nouvelle', hash: 'new' },
    { name: 'profile', label: 'Profil', hash: 'profile' },
  ];

  let breadcrumb = '';
  if (route.name === 'inspect' && route.id) {
    const insp = getInspection(route.id);
    if (insp) {
      const label = (insp.site.client || insp.site.adresse || insp.templateLabel || '').slice(0, 28);
      breadcrumb = `<span class="top-nav__breadcrumb">▸ ${escapeHtml(label)}</span>`;
    }
  }

  const repairsBtn = (route.name === 'inspect' && route.id)
    ? `<button type="button" class="btn btn--ghost btn--sm top-nav__repairs" id="nav-repairs-btn">🔧 Réparations</button>`
    : '';

  nav.innerHTML = items
    .map(
      (i) =>
        `<a href="#${i.hash}" class="top-nav__link ${route.name === i.name || (route.name === 'inspect' && i.name === 'home') ? 'is-active' : ''}" data-nav="${i.name}">${i.label}</a>`,
    )
    .join('') + breadcrumb + repairsBtn + `<a href="#" class="top-nav__link" id="nav-ai-btn">Assistant IA</a>`;

  nav.querySelectorAll('[data-nav]').forEach((a) => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      navigate(a.dataset.nav);
    });
  });
  nav.querySelector('#nav-ai-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    openAiAssistant();
  });
  nav.querySelector('#nav-repairs-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    const insp = getInspection(route.id);
    if (insp && window._openRepairsModal) window._openRepairsModal(insp);
  });
}

function render() {
  applyTopBarBranding(loadProfile());
  renderNav();
  renderTopBarSave();
  switch (route.name) {
    case 'new':
      renderNew();
      break;
    case 'inspect':
      renderInspect(route.id);
      break;
    case 'profile':
      renderProfile();
      break;
    default:
      renderHome();
  }
}

function renderDashboardStats(list) {
  const g = computeGlobalStats(list);
  return `
    <div class="dashboard-stats" role="region" aria-label="Statistiques">
      <div class="dash-stat"><strong>${g.total}</strong><span>Total</span></div>
      <div class="dash-stat dash-stat--active"><strong>${g.enCours}</strong><span>En cours</span></div>
      <div class="dash-stat dash-stat--done"><strong>${g.terminees}</strong><span>Terminées</span></div>
      <div class="dash-stat dash-stat--warn"><strong>${g.ncTotal}</strong><span>NC / à corriger</span></div>
    </div>`;
}

function renderFeatureStrip() {
  const items = [
    { icon: '🎨', label: 'Votre logo & marque' },
    { icon: '📋', label: 'BNQ & AIBQ' },
    { icon: '📷', label: 'Photos terrain' },
    { icon: '📄', label: 'Rapport PDF' },
    { icon: '📁', label: 'Dossier BV' },
    { icon: '☁️', label: 'Hors ligne' },
  ];
  return `<section class="features" aria-label="Fonctionnalités">${items
    .map(
      (f) =>
        `<article class="feature-card"><span class="feature-card__icon">${f.icon}</span><p class="feature-card__label">${f.label}</p></article>`,
    )
    .join('')}</section>`;
}

function renderHome() {
  const list = loadInspections().map((i) => {
    normalizeVisit(i);
    return i;
  });
  const filter = route.filter || 'all';
  const q = (route.q || '').toLowerCase();

  const filtered = list.filter((i) => {
    if (filter !== 'all' && i.status !== filter) return false;
    if (!q) return true;
    const hay = [
      i.site.client,
      i.site.proprietaire,
      i.site.courtier,
      i.site.adresse,
      i.site.ville,
      i.templateLabel,
      i.site.numeroDossier,
    ]
      .join(' ')
      .toLowerCase();
    return hay.includes(q);
  });

  const branding = resolveBranding(loadProfile());
  const heroLogo = getHeroLogoUrl(loadProfile());

  main.innerHTML = `
    <section class="hero">
      <div class="hero__brand">
        <img class="hero__logo" src="${heroLogo}" alt="${escapeAttr(branding.appName)}" width="280" height="80" decoding="async" />
      </div>
      <p class="hero__eyebrow">KZO Inspect · Québec</p>
      <h2 class="hero__title">Votre studio d'inspection professionnel</h2>
      <p class="hero__desc">Planifiez, inspectez et livrez des rapports AIBQ &amp; BNQ — avec votre logo, vos photos et vos dossiers clients. Plus complet qu'un logiciel réseau générique.</p>
      <div class="hero__actions">
        <button type="button" class="btn btn--primary" id="btn-new-home">+ Nouvelle inspection</button>
        <button type="button" class="btn btn--ghost" id="btn-goto-profile">Mon profil &amp; logo</button>
      </div>
    </section>

    ${renderDashboardStats(list)}
    ${renderFeatureStrip()}

    <div class="section-head">
      <h3 class="section-head__title">Mes dossiers</h3>
      <span class="page-desc">${list.length} inspection${list.length !== 1 ? 's' : ''} · ${formatBytes(estimateStorageUsage())}</span>
    </div>

    <div class="toolbar">
      <input type="search" class="input input--search" id="search-inspections" placeholder="Rechercher client, adresse, dossier…" value="${escapeAttr(route.q || '')}" />
      <select class="input" id="filter-status">
        <option value="all" ${filter === 'all' ? 'selected' : ''}>Tous les statuts</option>
        ${Object.entries(INSPECTION_STATUS)
          .map(
            ([k, v]) =>
              `<option value="${k}" ${filter === k ? 'selected' : ''}>${v.label}</option>`,
          )
          .join('')}
      </select>
    </div>

    ${
      filtered.length === 0
        ? `<div class="empty-state">
            <p class="empty-state__icon">📋</p>
            <h3>Aucune inspection</h3>
            <p>Créez une inspection : normes AIBQ et BNQ 3009-500, état des lieux, CBQ, CNESST, MAPAQ…</p>
            <button type="button" class="btn btn--primary" id="btn-new-empty">Commencer</button>
          </div>`
        : `<div class="card-grid">${filtered.map((i) => inspectionCard(i)).join('')}</div>`
    }
  `;

  document.getElementById('btn-new-home')?.addEventListener('click', () => navigate('new'));
  document.getElementById('btn-goto-profile')?.addEventListener('click', () => navigate('profile'));
  document.getElementById('btn-new-empty')?.addEventListener('click', () => navigate('new'));
  document.getElementById('search-inspections')?.addEventListener('input', (e) => {
    route.q = e.target.value;
    renderHome();
  });
  document.getElementById('filter-status')?.addEventListener('change', (e) => {
    route.filter = e.target.value;
    renderHome();
  });

  main.querySelectorAll('[data-open]').forEach((btn) => {
    btn.addEventListener('click', () => navigate('inspect', { id: btn.dataset.open }));
  });
  main.querySelectorAll('[data-duplicate]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const copy = duplicateInspection(btn.dataset.duplicate);
      if (copy) {
        toast('Inspection dupliquée', 'success');
        navigate('inspect', { id: copy.id });
      }
    });
  });
  main.querySelectorAll('[data-delete]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      if (await confirmAction('Supprimer', 'Cette inspection et ses documents seront supprimés définitivement.')) {
        await deleteInspection(btn.dataset.delete);
        toast('Inspection supprimée', 'success');
        renderHome();
      }
    });
  });
}

function inspectionCard(i) {
  const stats = computeStats(i);
  const st = INSPECTION_STATUS[i.status] ?? INSPECTION_STATUS.brouillon;
  const visitLabel = formatVisitDateTime(i);
  const dateLabel = visitLabel !== '—' ? visitLabel : formatShortDate(i.updatedAt);
  return `
    <article class="card" data-id="${i.id}">
      <div class="card__head">
        <span class="card__icon">${TEMPLATE_META[i.templateId]?.icon ?? '📋'}</span>
        <div>
          <h3 class="card__title">${escapeHtml(i.site.client || i.templateLabel)}</h3>
          <p class="card__sub">${escapeHtml(i.site.adresse || 'Adresse non renseignée')}</p>
        </div>
        <span class="badge ${st.class}">${st.label}</span>
      </div>
      <p class="card__meta">${escapeHtml(i.templateLabel)} · ${escapeHtml(dateLabel)}</p>
      <div class="progress-bar" aria-label="Progression ${stats.progress}%">
        <div class="progress-bar__fill" style="width:${stats.progress}%"></div>
      </div>
      <div class="card__actions">
        <button type="button" class="btn btn--sm btn--primary" data-open="${i.id}">Ouvrir</button>
        <button type="button" class="btn btn--sm btn--ghost" data-duplicate="${i.id}">Dupliquer</button>
        <button type="button" class="btn btn--sm btn--ghost" data-delete="${i.id}">Supprimer</button>
      </div>
    </article>`;
}

function renderNew() {
  const grouped = Object.entries(TEMPLATE_GROUPS)
    .sort((a, b) => a[1].order - b[1].order)
    .map(([groupId, groupMeta]) => {
      const templates = Object.values(TEMPLATE_META).filter(
        (t) => (t.group || 'autre') === groupId,
      );
      if (templates.length === 0) return '';
      const cards = templates
        .map(
          (t) => `
        <button type="button" class="template-card ${groupId === 'aibq-bnq' ? 'template-card--featured' : ''}" data-template="${t.id}">
          <span class="template-card__icon">${t.icon}</span>
          <h3>${escapeHtml(t.label)}</h3>
          <p class="template-card__norme">${escapeHtml(t.norme)}</p>
          <p class="template-card__desc">${escapeHtml(t.description)}</p>
        </button>`,
        )
        .join('');
      return `
        <section class="template-group">
          <h3 class="template-group__title">${escapeHtml(groupMeta.label)}</h3>
          <div class="template-grid">${cards}</div>
        </section>`;
    })
    .join('');

  main.innerHTML = `
    <button type="button" class="btn btn--ghost btn--back" id="btn-back">← Retour</button>
    <section class="page-hero-sm">
      <h2 class="page-title">Nouvelle inspection</h2>
      <p class="page-desc">Choisissez un modèle conforme aux normes québécoises — AIBQ préachat, BNQ 3009-500, et plus.</p>
    </section>
    ${grouped}
  `;

  document.getElementById('btn-back').addEventListener('click', () => navigate('home'));
  main.querySelectorAll('[data-template]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const profile = loadProfile();
      const inspection = createEmptyInspection(btn.dataset.template);
      inspection.inspector = inspectorFieldsFromProfile(profile);
      inspection.site.numeroDossier = nextDossierNumber();
      inspection.status = 'en-cours';
      upsertInspection(inspection);
      toast('Inspection créée', 'success');
      navigate('inspect', { id: inspection.id });
    });
  });
}

function renderInspect(id) {
  renderTopBarSave();
  const inspection = getInspection(id);
  if (!inspection) {
    main.innerHTML = `<div class="empty-state"><h3>Inspection introuvable</h3><button class="btn btn--primary" id="go-home">Retour</button></div>`;
    document.getElementById('go-home').onclick = () => navigate('home');
    return;
  }

  const stats = computeStats(inspection);
  const tab = route.tab || 'info';

  main.innerHTML = `
    <section class="inspect-header">
      <div style="display:flex;gap:0.5rem;align-items:center;">
        <button type="button" class="btn btn--ghost btn--back" id="btn-back">← Liste</button>
      </div>
      <div class="inspect-header__main">
        <h2 class="page-title">${escapeHtml(inspection.site.client || inspection.templateLabel)}</h2>
        <p class="page-desc">${escapeHtml(inspection.templateLabel)} — ${escapeHtml(inspection.norme)}</p>
        ${inspection.site.numeroDossier ? `<p class="page-desc">Dossier ${escapeHtml(inspection.site.numeroDossier)}</p>` : ''}
        ${inspection.visit?.date ? `<p class="page-desc page-desc--visit">📅 ${escapeHtml(formatVisitDateTime(inspection))}</p>` : ''}
        <div class="inspect-stats">
          ${stats.nonConforme > 0 ? `<span class="stat-pill stat-pill--danger">${stats.nonConforme} NC</span>` : ''}
          ${stats.aCorriger > 0 ? `<span class="stat-pill stat-pill--danger">${stats.aCorriger} à corriger</span>` : ''}
        </div>
      </div>
      <div class="progress-ring" style="--pct: ${stats.progress}" aria-label="Progression ${stats.progress}%">
        <div class="progress-ring__inner">
          ${stats.progress}<small>%</small>
        </div>
      </div>
    </section>

    <div class="inspect-layout-split" style="display: flex; gap: 2rem; align-items: flex-start; margin-top: 1rem;">
      <div class="inspect-sidebar" style="flex: 0 0 300px; position: sticky; top: 1rem; max-height: calc(100vh - 2rem); overflow-y: auto; padding-right: 1rem; border-right: 1px solid var(--border, #e2e8f0);">
        <div class="section-list-header section-list-header--rail">
          <h3 class="section-list-header__title" style="margin-bottom: 1rem; font-size: 1.1rem;">Dossier</h3>
        </div>
        <ol class="section-list section-list--rail" style="list-style: none; padding: 0; margin: 0 0 2rem 0; display: flex; flex-direction: column; gap: 0.25rem;">
          <li class="section-list__item ${tab === 'info' ? 'section-list__item--active' : ''}">
            <button type="button" class="section-list__btn tabs__btn" data-tab="info" style="text-align: left; padding: 0.5rem; width: 100%; display: flex; gap: 0.5rem; border: none; background: transparent; cursor: pointer; border-radius: 4px; ${tab === 'info' ? 'background: #e2e8f0; font-weight: bold;' : ''}">
              <span class="section-list__title">Informations générales</span>
            </button>
          </li>
          <li class="section-list__item ${tab === 'final' ? 'section-list__item--active' : ''}">
            <button type="button" class="section-list__btn tabs__btn" data-tab="final" style="text-align: left; padding: 0.5rem; width: 100%; display: flex; gap: 0.5rem; border: none; background: transparent; cursor: pointer; border-radius: 4px; ${tab === 'final' ? 'background: #e2e8f0; font-weight: bold;' : ''}">
              <span class="section-list__title">Clôture & Reçu</span>
            </button>
          </li>
        </ol>

        <div id="checklist-rail-container"></div>
      </div>

      <div class="inspect-main" style="flex: 1; min-width: 0;" id="inspect-main-content">
      </div>
    </div>

    <div class="action-bar">
      <button type="button" class="btn btn--ghost" id="btn-save">Enregistrer</button>
      <button type="button" class="btn btn--ghost" id="btn-duplicate-inspect" title="Dupliquer ce dossier">Dupliquer</button>
      <button type="button" class="btn btn--secondary" id="btn-report">Rapport PDF</button>
      <button type="button" class="btn btn--secondary" id="btn-thanks">Lettre merci</button>
      <button type="button" class="btn btn--secondary" id="btn-receipt">Reçu</button>
      <button type="button" class="btn btn--secondary" id="btn-facture">&#x1F4E7; Facture</button>
      <select class="input input--sm" id="status-select">
        ${Object.entries(INSPECTION_STATUS)
          .map(
            ([k, v]) =>
              `<option value="${k}" ${inspection.status === k ? 'selected' : ''}>${v.label}</option>`,
          )
          .join('')}
      </select>
    </div>
  `;

  const mainContent = document.getElementById('inspect-main-content');
  const railContainer = document.getElementById('checklist-rail-container');
  const sidebar = document.querySelector('.inspect-sidebar');

  railContainer.innerHTML = renderSectionListRail(inspection, route);

  if (tab === 'checklist') {
    const filter = route.checklistFilter || 'all';
    mainContent.innerHTML = renderChecklistToolbar(inspection, filter) + renderChecklistMainPane(inspection, route);
    bindChecklist(inspection, mainContent);
  } else if (tab === 'info') {
    mainContent.innerHTML = renderInfoTab(inspection);
    bindInfoForm(inspection, mainContent);
  } else {
    mainContent.innerHTML = renderFinalTab(inspection);
    bindFinal(inspection, mainContent);
  }

  bindInspectEvents(inspection, mainContent, tab);
  bindChecklist(inspection, sidebar);
  updateAiAssistantContext({ inspection });
}

function isImmoNormTemplate(templateId) {
  return templateId === 'aibq-preachat' || templateId === 'bnq-3009';
}

function renderInfoTab(i) {
  const immo = isImmoNormTemplate(i.templateId);
  const categorieBnq = i.site.categorieBnq || '';
  const v = i.visit ?? defaultVisit();
  const cielOptions = CIEL_OPTIONS.map(
    (o) =>
      `<option value="${o.value}" ${v.conditionsCiel === o.value ? 'selected' : ''}>${escapeHtml(o.label)}</option>`,
  ).join('');

  return `
    <form class="form-grid" id="form-info">
      <fieldset>
        <legend>Normes de l'inspection (visuel)</legend>
        <p class="form-hint form-hint--compact">L'inspection reste visuelle et non certifiante.</p>
        <label>Norme appliquée
          <select class="input" name="norme">
            ${[
              'Norme de pratique AIBQ (préachat résidentiel)',
              'Norme IBC (Réseau des Inspecteurs en Bâtiment Certifiés du Québec)',
              'BNQ 3009-500/2022 R1 — inspection résidentielle',
              'Code du bâtiment du Québec (CBQ)',
              'Autre norme'
            ].map(n => `<option value="${escapeAttr(n)}" ${i.norme === n ? 'selected' : ''}>${escapeHtml(n)}</option>`).join('')}
            ${!['Norme de pratique AIBQ (préachat résidentiel)', 'Norme IBC (Réseau des Inspecteurs en Bâtiment Certifiés du Québec)', 'BNQ 3009-500/2022 R1 — inspection résidentielle', 'Code du bâtiment du Québec (CBQ)', 'Autre norme'].includes(i.norme) && i.norme ? `<option value="${escapeAttr(i.norme)}" selected>${escapeHtml(i.norme)}</option>` : ''}
          </select>
        </label>
      </fieldset>
      <fieldset>
        <legend>Client et mandat</legend>
        <label>Nom du client (demandeur) *<input class="input" name="client" value="${escapeAttr(i.site.client)}" placeholder="Acheteur, propriétaire, syndicat…" required /></label>
        <label>Propriétaire / vendeur (si différent)<input class="input" name="proprietaire" value="${escapeAttr(i.site.proprietaire || '')}" /></label>
        <div class="form-row-2">
          <label>Courriel client<input class="input" type="email" name="courrielClient" value="${escapeAttr(i.site.courrielClient || '')}" /></label>
          <label>Téléphone client<input class="input" type="tel" name="telephoneClient" value="${escapeAttr(i.site.telephoneClient || '')}" /></label>
        </div>
        ${immo ? `<label>Mandat / contexte<input class="input" name="mandat" value="${escapeAttr(i.site.mandat || '')}" placeholder="Préachat, prévente, copropriété…" /></label>` : ''}
        <label>Nº de dossier<input class="input" name="numeroDossier" value="${escapeAttr(i.site.numeroDossier)}" /></label>
        <label>Type de bâtiment
          <select class="input" name="typeBatiment">
            <option value="">— Sélectionner —</option>
            ${['Unifamilial', 'Condo', 'Duplex', 'Triplex', 'Multiplex', 'Commercial', 'Autre'].map(tb => `
              <option value="${escapeAttr(tb)}" ${i.site.typeBatiment === tb ? 'selected' : ''}>${escapeHtml(tb)}</option>
            `).join('')}
          </select>
        </label>
      </fieldset>
      <fieldset class="client-files-fieldset">
        <legend>Dossier client et documents</legend>
        <p class="form-hint form-hint--compact">PDF, images, Word (.docx). Stockage local sur cet appareil (max 20 Mo / fichier).</p>
        <div id="client-files-panel" class="client-files" data-inspection-id="${escapeAttr(i.id)}">
          <p class="client-files__loading">Chargement du dossier…</p>
        </div>
      </fieldset>
      <fieldset>
        <legend>Visite d'inspection</legend>
        <div class="form-row-2">
          <label>Date d'inspection<input class="input" type="date" name="visitDate" value="${escapeAttr(v.date)}" /></label>
          <label>Heure de début<input class="input" type="time" name="heureDebut" value="${escapeAttr(v.heureDebut)}" /></label>
        </div>
        <div class="form-row-2">
          <label>Heure de fin<input class="input" type="time" name="heureFin" value="${escapeAttr(v.heureFin)}" /></label>
          <label>Conditions du ciel<select class="input" name="conditionsCiel">${cielOptions}</select></label>
        </div>
        <label>Météo / observations météo<textarea class="input" name="meteo" rows="2" placeholder="Ex. : Ciel dégagé, humidité élevée, route glacée…">${escapeHtml(v.meteo)}</textarea></label>
        <div class="form-row-2">
          <label>Température extérieure (°C)<input class="input" name="temperatureAir" value="${escapeAttr(v.temperatureAir)}" placeholder="-12" inputmode="decimal" /></label>
          <label>Précipitations<input class="input" name="precipitation" value="${escapeAttr(v.precipitation)}" placeholder="Aucune, légère, forte…" /></label>
        </div>
        <div class="form-row-2">
          <label>Vent<input class="input" name="vent" value="${escapeAttr(v.vent)}" placeholder="Calme, modéré, 40 km/h NW…" /></label>
          <label>Visibilité<input class="input" name="visibilite" value="${escapeAttr(v.visibilite)}" placeholder="Bonne, réduite…" /></label>
        </div>
        <label>Neige ou glace au sol<input class="input" name="neigeAuSol" value="${escapeAttr(v.neigeAuSol)}" placeholder="Aucune, partielle, toit enneigé non visité…" /></label>
        <label>Personnes présentes (AIBQ / BNQ art. 14.2)<textarea class="input" name="personnesPresentes" rows="2" placeholder="Client, vendeur, agent, aucune…">${escapeHtml(v.personnesPresentes)}</textarea></label>
        <button type="button" class="btn btn--ghost btn--sm" id="btn-visit-now">Horodatage maintenant</button>
      </fieldset>
      <fieldset class="cover-photo-fieldset">
        <legend>Photo de couverture — 1<sup>re</sup> page du rapport</legend>
        <p class="form-hint form-hint--compact">Grande photo de la façade ou de la propriété. Elle apparaît en page 1 du rapport PDF (format paysage visuel pleine page).</p>
        <div class="cover-photo-editor" id="cover-photo-editor">
          ${
            i.coverPhotoDataUrl
              ? `<div class="cover-photo-preview">
                  <img src="${i.coverPhotoDataUrl}" alt="Photo de couverture" class="cover-photo-preview__img" />
                  <div class="cover-photo-preview__overlay">
                    <span class="cover-photo-preview__label">Aperçu page de couverture</span>
                  </div>
                </div>`
              : `<div class="cover-photo-placeholder">
                  <span class="cover-photo-placeholder__icon">🏠</span>
                  <p>Ajoutez une photo pour une première page professionnelle</p>
                </div>`
          }
          <label class="btn btn--primary cover-photo-upload">
            📷 ${i.coverPhotoDataUrl ? 'Remplacer la photo' : 'Ajouter la photo de la maison'}
            <input type="file" accept="image/*" hidden id="cover-photo-input" />
          </label>
          ${i.coverPhotoDataUrl ? `<button type="button" class="btn btn--ghost btn--sm" id="btn-remove-cover">Retirer la photo</button>` : ''}
          <label>Légende sous la photo (optionnel)<input class="input" name="coverPhotoCaption" value="${escapeAttr(i.coverPhotoCaption || '')}" placeholder="Façade avant, vue nord-est…" /></label>
        </div>
      </fieldset>
      <fieldset>
        <legend>Site inspecté</legend>
        <label>Adresse<input class="input" name="adresse" value="${escapeAttr(i.site.adresse)}" /></label>
        <label>Ville<input class="input" name="ville" value="${escapeAttr(i.site.ville)}" /></label>
        <label>Code postal<input class="input" name="codePostal" value="${escapeAttr(i.site.codePostal)}" placeholder="H2X 1Y4" /></label>
        <div class="form-row-2">
          <label>Année de construction<input class="input" type="number" name="anneeConstruction" id="anneeConstruction" value="${escapeAttr(String(i.site.anneeConstruction || ''))}" placeholder="Ex. 1978" min="1850" max="${new Date().getFullYear()}" inputmode="numeric" /></label>
          <label>Année de rénovation majeure<input class="input" type="number" name="anneeRenovation" value="${escapeAttr(String(i.site.anneeRenovation || ''))}" placeholder="Ex. 2005" min="1850" max="${new Date().getFullYear()}" inputmode="numeric" /></label>
        </div>
        ${(() => {
          const yr = parseInt(i.site.anneeConstruction) || 0;
          if (!yr) return '';
          const alerts = [];
          if (yr < 1980) alerts.push("⚠️ <strong>Amiante probable</strong> — bardeaux amiante-ciment, plafond popcorn, tuiles 30×30, isolant vermiculite à vérifier");
          if (yr < 1975) alerts.push("⚠️ <strong>Plomb</strong> — peinture au plomb et tuyaux de plomb possibles");
          if (yr >= 1975 && yr <= 1982) alerts.push("⚠️ <strong>FUUF</strong> — mousse urée-formaldéhyde possible dans les murs (interdit 1980)");
          if (yr < 1990) alerts.push("⚠️ <strong>Mercure</strong> — thermostats à ampoule de mercure probables, <strong>BPC</strong> possible (ballasts néon)");
          if (yr >= 1985 && yr <= 2005) alerts.push("⚠️ <strong>Polybutylène (Poly-B)</strong> — tuyaux gris possible (produit retiré)");
          alerts.push("🔍 <strong>Pyrite</strong> — vérifier dalle béton (zones à risque QC indépendamment de l'année)");
          alerts.push("🔍 <strong>Radon</strong> — test recommandé si sous-sol habitable");
          return `<div style="grid-column:1/-1;padding:0.75rem 1rem;background:#fffbeb;border:1px solid #f59e0b;border-radius:8px;font-size:0.85rem;line-height:1.6">
            <strong>🏠 Bâtiment ${yr} — Éléments à vérifier selon l'année</strong><br />${alerts.join('<br />')}
          </div>`;
        })()}
        ${i.templateId === 'bnq-3009' ? `
        <label>Catégorie BNQ (§2.1)
          <select class="input" name="categorieBnq">
            <option value="">— Sélectionner —</option>
            <option value="cat1" ${categorieBnq === 'cat1' ? 'selected' : ''}>Catégorie 1 (1 à 6 logements)</option>
            <option value="cat2" ${categorieBnq === 'cat2' ? 'selected' : ''}>Catégorie 2 (7 logements et +)</option>
          </select>
        </label>` : ''}
      </fieldset>
      <fieldset>
        <legend>Inspecteur</legend>
        <label>Inspecteur<input class="input" name="nom" value="${escapeAttr(INSPECTOR_NAME)}" readonly title="Nom de l'inspecteur titulaire" /></label>
        <label>Permis / RBQ / certification<input class="input" name="permis" value="${escapeAttr(i.inspector.permis)}" /></label>
        ${immo ? `
        <label>Nº membre AIBQ<input class="input" name="membreAibq" value="${escapeAttr(i.inspector.membreAibq || '')}" placeholder="Si membre AIBQ" /></label>
        <label>Certificat inspecteur RBQ<input class="input" name="certificatRbq" value="${escapeAttr(i.inspector.certificatRbq || '')}" placeholder="Obligatoire selon règlement RBQ" /></label>` : ''}
        <label>Entreprise<input class="input" name="entreprise" value="${escapeAttr(i.inspector.entreprise)}" /></label>
        <label>Courriel<input class="input" type="email" name="courriel" value="${escapeAttr(i.inspector.courriel)}" /></label>
        <label>Téléphone<input class="input" type="tel" name="telephone" value="${escapeAttr(i.inspector.telephone)}" /></label>
      </fieldset>
    </form>`;
}

async function mountClientFilesPanel(inspection, panel) {
  const container = panel.querySelector('#client-files-panel');
  if (!container) return;

  const categoryOptions = FILE_CATEGORIES.map(
    (c) => `<option value="${c.value}">${escapeHtml(c.label)}</option>`,
  ).join('');

  const renderList = async () => {
    try {
      const files = await listClientFiles(inspection.id);
      const total = files.reduce((s, f) => s + f.size, 0);
      const listHtml =
        files.length === 0
          ? `<p class="client-files__empty">Aucun document. Ajoutez le BV, la convention, la déclaration vendeur, etc.</p>`
          : `<ul class="client-files__list">
              ${files
                .map(
                  (f) => `
                <li class="client-files__item" data-file-id="${f.id}">
                  <div class="client-files__item-head">
                    <span class="client-files__icon">${fileIcon(f.mimeType, f.name)}</span>
                    <div class="client-files__item-meta">
                      <strong class="client-files__name">${escapeHtml(f.name)}</strong>
                      <span class="client-files__tags">${escapeHtml(categoryLabel(f.category))} · ${formatFileSize(f.size)}</span>
                    </div>
                  </div>
                  <select class="input input--sm client-files__cat" data-file-cat="${f.id}">
                    ${FILE_CATEGORIES.map(
                      (c) =>
                        `<option value="${c.value}" ${f.category === c.value ? 'selected' : ''}>${escapeHtml(c.label)}</option>`,
                    ).join('')}
                  </select>
                  <input class="input input--sm client-files__note" data-file-note="${f.id}" value="${escapeAttr(f.note || '')}" placeholder="Note…" />
                  <div class="client-files__actions">
                    <button type="button" class="btn btn--sm btn--ghost" data-file-open="${f.id}">Ouvrir</button>
                    <button type="button" class="btn btn--sm btn--ghost" data-file-dl="${f.id}">Télécharger</button>
                    <button type="button" class="btn btn--sm btn--ghost btn--danger-text" data-file-del="${f.id}">Supprimer</button>
                  </div>
                </li>`,
                )
                .join('')}
            </ul>`;

      container.innerHTML = `
        <div class="client-files__upload">
          <label class="client-files__drop">
            <input type="file" id="client-file-input" multiple accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp,.heic,.xls,.xlsx,.txt,image/*,application/pdf" hidden />
            <span class="client-files__drop-text">Glissez des fichiers ici ou <u>parcourir</u></span>
          </label>
          <div class="client-files__upload-row">
            <select class="input input--sm" id="client-file-category">${categoryOptions}</select>
            <input class="input input--sm" id="client-file-note" placeholder="Note (optionnel)" />
          </div>
        </div>
        <p class="client-files__summary">${files.length} fichier${files.length !== 1 ? 's' : ''} · ${formatFileSize(total)} au total</p>
        ${listHtml}`;

      bindClientFilesEvents(inspection, container);
    } catch {
      container.innerHTML = `<p class="client-files__error">Impossible d'accéder au stockage des fichiers.</p>`;
    }
  };

  await renderList();
}

function fileIcon(mime, name) {
  if (mime?.includes('pdf') || name?.toLowerCase().endsWith('.pdf')) return '📄';
  if (mime?.startsWith('image/')) return '🖼️';
  if (mime?.includes('word') || name?.match(/\.docx?$/i)) return '📝';
  if (mime?.includes('sheet') || name?.match(/\.xlsx?$/i)) return '📊';
  return '📎';
}

function refreshClientFilesPanel(inspection) {
  const panel = document.getElementById('tab-content');
  if (panel) mountClientFilesPanel(inspection, panel);
}

function bindClientFilesEvents(inspection, container) {
  const input = container.querySelector('#client-file-input');
  const drop = container.querySelector('.client-files__drop');

  const uploadFiles = async (fileList) => {
    const category = container.querySelector('#client-file-category')?.value || 'autre';
    const note = container.querySelector('#client-file-note')?.value || '';
    let ok = 0;
    for (const file of fileList) {
      try {
        await addClientFile(inspection.id, file, { category, note });
        ok += 1;
      } catch (e) {
        toast(e.message || `Échec : ${file.name}`, 'error');
      }
    }
    if (ok) {
      toast(`${ok} fichier${ok > 1 ? 's' : ''} ajouté${ok > 1 ? 's' : ''}`, 'success');
      refreshClientFilesPanel(inspection);
    }
  };

  input?.addEventListener('change', () => {
    if (input.files?.length) uploadFiles([...input.files]);
    input.value = '';
  });

  drop?.addEventListener('dragover', (e) => {
    e.preventDefault();
    drop.classList.add('is-dragover');
  });
  drop?.addEventListener('dragleave', () => drop.classList.remove('is-dragover'));
  drop?.addEventListener('drop', (e) => {
    e.preventDefault();
    drop.classList.remove('is-dragover');
    if (e.dataTransfer?.files?.length) uploadFiles([...e.dataTransfer.files]);
  });

  container.querySelectorAll('[data-file-del]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      if (await confirmAction('Supprimer le fichier', 'Ce document sera retiré du dossier client.')) {
        await deleteClientFile(btn.dataset.fileDel);
        toast('Fichier supprimé', 'success');
        refreshClientFilesPanel(inspection);
      }
    });
  });

  container.querySelectorAll('[data-file-dl]').forEach((btn) => {
    btn.addEventListener('click', () => downloadClientFile(btn.dataset.fileDl));
  });

  container.querySelectorAll('[data-file-open]').forEach((btn) => {
    btn.addEventListener('click', () => openClientFile(btn.dataset.fileOpen));
  });

  container.querySelectorAll('[data-file-cat]').forEach((sel) => {
    sel.addEventListener('change', async () => {
      await updateClientFileMeta(sel.dataset.fileCat, { category: sel.value });
    });
  });

  container.querySelectorAll('[data-file-note]').forEach((inp) => {
    inp.addEventListener('change', async () => {
      await updateClientFileMeta(inp.dataset.fileNote, { note: inp.value });
    });
  });
}

function bindVisitNowButton(panel, inspection) {
  panel.querySelector('#btn-visit-now')?.addEventListener('click', () => {
    const now = defaultVisit();
    const form = panel.querySelector('#form-info');
    if (!form) return;
    form.visitDate.value = now.date;
    form.heureDebut.value = now.heureDebut;
    if (!form.heureFin.value) form.heureFin.value = now.heureDebut;
    scheduleAutosave(inspection, 'info', panel);
    toast('Date et heure mises à jour', 'success');
  });
}

function renderChecklistTab(i) {
  const filter = route.checklistFilter || 'all';
  const pending = countPending(i);
  const filterBtns = CHECKLIST_FILTERS.map(
    (f) =>
      `<button type="button" class="chip ${filter === f.id ? 'is-active' : ''}" data-checklist-filter="${f.id}">${f.label}</button>`,
  ).join('');

  const totalSections = i.sections.length;
  const sectionNav =
    totalSections > 6
      ? `<nav class="section-nav" aria-label="Sections de la checklist">
          ${i.sections
            .map(
              (sec, si) =>
                `<a href="#section-${sec.id}" class="section-nav__link">${si + 1}. ${escapeHtml(sec.title.replace(/^Section [IVX]+ — /, '').replace(/^Art\. [0-9.]+ — /, '').slice(0, 28))}${sec.title.length > 30 ? '…' : ''}</a>`,
            )
            .join('')}
        </nav>`
      : '';
  return `
    <div class="checklist-toolbar">
      <div class="checklist-toolbar__filters">${filterBtns}</div>
      <span class="checklist-toolbar__hint">${pending > 0 ? `${pending} point${pending > 1 ? 's' : ''} non répondu${pending > 1 ? 's' : ''}` : 'Checklist complète ✓'} · touches 1-4 sur un point</span>
    </div>
    ${sectionNav}${i.sections
    .map((sec, si) => {
      const prog = sectionProgress(sec);
      const items = sec.items
        .map((item, ii) => {
          if (!itemMatchesFilter(item, filter)) return '';
          const statusBtns = STATUS_OPTIONS.map(
            (s) =>
              `<button type="button" class="status-btn status-btn--${s.value} ${item.status === s.value ? 'is-selected' : ''}" data-status="${s.value}" data-si="${si}" data-ii="${ii}" title="${s.label}">${s.short}</button>`,
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
                      `<figure class="photo-thumb"><img src="${p}" alt="" /><button type="button" class="photo-thumb__del" data-del-photo data-si="${si}" data-ii="${ii}" data-pi="${pi}">×</button></figure>`,
                  )
                  .join('')}</div>`
              : '';
          return `
            <article class="check-item ${item.status ? `check-item--${item.status}` : ''}" data-si="${si}" data-ii="${ii}">
              <p class="check-item__label">${escapeHtml(item.label)}</p>
              <div class="check-item__status">${statusBtns}</div>
              <div class="check-item__extra">
                <select class="input input--sm" data-priority data-si="${si}" data-ii="${ii}" ${!item.status || item.status === 'conforme' || item.status === 'na' ? 'disabled' : ''}>
                  <option value="">Priorité</option>${priority}
                </select>
                <label class="btn btn--sm btn--ghost photo-btn">
                  📷 Photo
                  <input type="file" accept="image/*" hidden data-photo data-si="${si}" data-ii="${ii}" />
                </label>
              </div>
              <textarea class="input check-item__note" placeholder="Note ou référence (article, mesure)…" data-note data-si="${si}" data-ii="${ii}">${escapeHtml(item.note)}</textarea>
              ${photos}
            </article>`;
        })
        .join('');
      if (!items.trim()) return '';
      return `
        <section class="check-section" id="section-${sec.id}">
          <div class="check-section__head">
            <h3 class="check-section__title">
              <span class="check-section__index">${si + 1}/${totalSections}</span>
              ${escapeHtml(sec.title)}
              <span class="check-section__progress">${prog.pct}%</span>
            </h3>
            <button type="button" class="btn btn--ghost btn--sm" data-section-na="${si}">Tout N/A</button>
          </div>
          ${items}
        </section>`;
    })
    .join('')}`;
}

function renderExpertReferralsBlock(i) {
  if (!i.expertReferrals) i.expertReferrals = [];
  const rows = i.expertReferrals
    .map(
      (ref, idx) => `
      <div class="expert-row" data-expert-idx="${idx}">
        <select class="input input--sm" data-expert-type data-idx="${idx}">
          ${EXPERT_TYPES.map((t) => `<option value="${t.value}" ${ref.type === t.value ? 'selected' : ''}>${escapeHtml(t.label)}</option>`).join('')}
        </select>
        <input class="input input--sm" data-expert-motif data-idx="${idx}" value="${escapeAttr(ref.motif || '')}" placeholder="Motif / constat lié" />
        <label class="expert-row__urgent"><input type="checkbox" data-expert-urgent data-idx="${idx}" ${ref.urgent ? 'checked' : ''} /> Urgent</label>
        <button type="button" class="btn btn--ghost btn--sm" data-expert-del data-idx="${idx}">×</button>
      </div>`,
    )
    .join('');
  return `
    <fieldset class="expert-fieldset">
      <legend>Recommandations d'experts</legend>
      <p class="form-hint form-hint--compact">Spécialistes à consulter suite aux constats (bonne pratique BNQ).</p>
      <div id="expert-referrals-list">${rows}</div>
      <button type="button" class="btn btn--ghost btn--sm" id="btn-add-expert">+ Ajouter un spécialiste</button>
    </fieldset>`;
}

function renderFinalTab(i) {
  const profile = loadProfile();
  const r = normalizeReceipt(i, profile);
  const payModes = PAYMENT_MODES.map(
    (p) => `<option value="${p.value}" ${r.modePaiement === p.value ? 'selected' : ''}>${escapeHtml(p.label)}</option>`,
  ).join('');
  const payStatus = PAYMENT_STATUS.map(
    (p) => `<option value="${p.value}" ${r.statutPaiement === p.value ? 'selected' : ''}>${escapeHtml(p.label)}</option>`,
  ).join('');

  return `
    <form id="form-final" class="form-final">
      <fieldset class="receipt-fieldset">
        <legend>Reçu d'inspection</legend>
        <label>Nº de reçu<input class="input" name="receiptNumero" value="${escapeAttr(r.numero)}" placeholder="Auto : nº dossier ou KZO-YYYYMMDD-…" /></label>
        <label>Description du service<textarea class="input" name="receiptDescription" rows="2">${escapeHtml(r.description)}</textarea></label>
        <div class="form-row-2">
          <label>Montant avant taxes ($)<input class="input" name="montantHT" id="montant-ht" value="${escapeAttr(r.montantHT)}" inputmode="decimal" placeholder="0.00" /></label>
          <label>Date du paiement<input class="input" type="date" name="datePaiement" value="${escapeAttr(r.datePaiement)}" /></label>
        </div>
        <div class="form-row-2">
          <label>TPS ($)<input class="input" name="receiptTps" id="receipt-tps" value="${escapeAttr(r.tps)}" inputmode="decimal" /></label>
          <label>TVQ ($)<input class="input" name="receiptTvq" id="receipt-tvq" value="${escapeAttr(r.tvq)}" inputmode="decimal" /></label>
        </div>
        <label>Total ($)<input class="input" name="receiptTotal" id="receipt-total" value="${escapeAttr(r.total)}" inputmode="decimal" /></label>
        <button type="button" class="btn btn--ghost btn--sm" id="btn-calc-taxes">Calculer TPS / TVQ (Québec)</button>
        <div class="form-row-2">
          <label>Statut du paiement<select class="input" name="statutPaiement">${payStatus}</select></label>
          <label>Mode de paiement<select class="input" name="modePaiement">${payModes}</select></label>
        </div>
        <label>Note sur le reçu<input class="input" name="receiptNote" value="${escapeAttr(r.note)}" placeholder="Acompte 50 %, facture no…" /></label>
      </fieldset>

      ${renderExpertReferralsBlock(i)}

      <label class="form-block">
        Limitations de l'inspection (rapport BNQ / AIBQ)
        <textarea class="input" name="limitations" rows="4" placeholder="Éléments non inspectés, accès refusé, conditions météo limitantes…">${escapeHtml(i.limitations || '')}</textarea>
      </label>
      <label class="form-block">
        Observations générales (rapport)
        <textarea class="input" name="observations" rows="5" placeholder="Résumé, recommandations, délais de correction…">${escapeHtml(i.observations)}</textarea>
      </label>
      <label class="form-block">
        Message personnalisé — lettre de remerciement au client
        <textarea class="input" name="thankYouNote" rows="4" placeholder="Paragraphe optionnel ajouté à la lettre (sinon le message par défaut du profil est utilisé).">${escapeHtml(i.thankYouNote || '')}</textarea>
      </label>
      <div class="signature-block">
        <label>Signature du client ou responsable</label>
        <canvas id="signature-canvas" class="signature-canvas" width="400" height="160"></canvas>
        <div class="signature-actions">
          <button type="button" class="btn btn--ghost btn--sm" id="sig-clear">Effacer</button>
        </div>
      </div>
      ${
        i.signatureDataUrl
          ? `<p class="sig-preview-label">Signature enregistrée :</p><img src="${i.signatureDataUrl}" class="sig-preview" alt="Signature" />`
          : ''
      }
    </form>`;
}

function bindInspectEvents(inspection, panel, tab) {
  document.getElementById('btn-back').onclick = () => navigate('home');
  document.getElementById('btn-save').onclick = () => {
    saveCurrentTab(inspection, tab, panel);
    upsertInspection(inspection);
    toast('Enregistré', 'success');
  };
  const btnLocalSave = document.getElementById('btn-local-save');
  if (btnLocalSave) {
    btnLocalSave.onclick = () => {
      saveCurrentTab(inspection, tab, panel);
      upsertInspection(inspection);
      try {
        exportInspectionBackup(inspection, loadProfile());
        toast('Dossier sauvegardé sur votre ordinateur ✓', 'success');
        if (localAutoSaveTimer === null) {
          startLocalAutoSave(inspection);
          toast('Auto-sauvegarde locale activée (toutes les 2 min) 💾', 'info');
        }
      } catch (e) {
        toast('Impossible de télécharger la sauvegarde.', 'error');
      }
    };
  }
  document.getElementById('btn-duplicate-inspect')?.addEventListener('click', () => {
    const copy = duplicateInspection(inspection.id);
    if (copy) {
      toast('Dossier dupliqué', 'success');
      navigate('inspect', { id: copy.id });
    }
  });
  document.getElementById('btn-report').onclick = async () => {
    saveCurrentTab(inspection, tab, panel);
    upsertInspection(inspection);
    // Sauvegarde locale automatique avant génération du rapport final
    try {
      exportInspectionBackup(inspection, loadProfile());
      toast('Sauvegarde locale du dossier téléchargée', 'success');
    } catch (e) {
      console.warn('[KZO] Backup pré-rapport échoué :', e);
    }
    await openReport(inspection);
  };
  document.getElementById('btn-thanks').onclick = () => {
    saveCurrentTab(inspection, tab, panel);
    upsertInspection(inspection);
    openThankYouLetter(inspection, loadProfile());
  };
  document.getElementById('btn-receipt').onclick = () => {
    saveCurrentTab(inspection, tab, panel);
    upsertInspection(inspection);
    openReceipt(inspection, loadProfile());
  };
  document.getElementById('btn-facture')?.addEventListener('click', () => {
    saveCurrentTab(inspection, tab, panel);
    upsertInspection(inspection);
    const mainContent = document.getElementById('inspect-main-content');
    mainContent.innerHTML = renderInvoicePanel(inspection);

    document.getElementById('invoice-payment-status')?.addEventListener('change', (e) => {
      inspection.paymentStatus = e.target.value;
      upsertInspection(inspection);
    });

    document.getElementById('btn-invoice-preview')?.addEventListener('click', () => {
      const html = buildInvoiceHtml(inspection, loadProfile());
      const win = window.open('', '_blank');
      if (!win) { alert('Autorisez les fenêtres contextuelles.'); return; }
      win.document.write(html);
      win.document.close();
    });

    document.getElementById('btn-invoice-send')?.addEventListener('click', async () => {
      const to      = document.getElementById('invoice-to')?.value?.trim();
      const subject = document.getElementById('invoice-subject')?.value?.trim();
      if (!to) { toast('Saisissez le courriel du client.', 'warn'); return; }
      const btn = document.getElementById('btn-invoice-send');
      btn.disabled = true;
      btn.textContent = 'Envoi en cours...';
      try {
        const profile = loadProfile();
        const clientId = profile.googleClientId || '18973787304-0vm4pu6383jn2vni2h996i0ri62iu21s.apps.googleusercontent.com';
        await googleAuthenticate(clientId);
        const html  = buildInvoiceHtml(inspection, profile);
        const token = getGoogleToken();
        await sendInvoiceEmail(to, subject, html, token);
        inspection.invoiceSentAt = new Date().toISOString();
        upsertInspection(inspection);
        sendReceiptToSheets(inspection, profile);
        toast('Facture envoyée à ' + to, 'success');
        btn.textContent = 'Envoyée';
      } catch (err) {
        toast('Erreur : ' + err.message, 'error');
        btn.disabled = false;
        btn.textContent = 'Envoyer depuis kzoinspectpro@gmail.com';
      }
    });
  });
  document.getElementById('status-select').onchange = (e) => {
    inspection.status = e.target.value;
    if (e.target.value === 'terminee') {
      if (!inspection.completedAt) inspection.completedAt = new Date().toISOString();
      if (!inspection.invoiceNumber) {
        const prof = loadProfile();
        inspection.invoiceNumber = nextInvoiceNumber(prof);
        toast(`Facture ${inspection.invoiceNumber} générée`, 'success');
      }
    }
    if (!inspection.paymentStatus) inspection.paymentStatus = 'pending';
    scheduleAutosave(inspection, tab, panel);
  };

  main.querySelectorAll('[data-tab]').forEach((btn) => {
    btn.addEventListener('click', () => {
      saveCurrentTab(inspection, tab, panel);
      upsertInspection(inspection);
      const nextTab = btn.dataset.tab;
      if (nextTab === 'checklist' && tab !== 'checklist') {
        route.checklistView = 'list';
        route.checklistSection = null;
      }
      route.tab = nextTab;
      renderInspect(inspection.id);
    });
  });

  if (tab === 'info') bindInfoForm(inspection, panel);
  if (tab === 'checklist') bindChecklist(inspection, panel);
  if (tab === 'final') bindFinal(inspection, panel);
}

function bindReceiptCalc(panel, inspection) {
  panel.querySelector('#btn-calc-taxes')?.addEventListener('click', () => {
    const profile = loadProfile();
    const ht = panel.querySelector('#montant-ht')?.value;
    const taxes = computeTaxes(ht, profile.tauxTPS ?? 5, profile.tauxTVQ ?? 9.975);
    const tpsEl = panel.querySelector('#receipt-tps');
    const tvqEl = panel.querySelector('#receipt-tvq');
    const totalEl = panel.querySelector('#receipt-total');
    if (tpsEl) tpsEl.value = taxes.tps.toFixed(2);
    if (tvqEl) tvqEl.value = taxes.tvq.toFixed(2);
    if (totalEl) totalEl.value = taxes.total.toFixed(2);
    toast('Taxes calculées', 'success');
    scheduleAutosave(inspection, 'final', panel);
  });
}

function bindCoverPhoto(inspection, panel) {
  const input = panel.querySelector('#cover-photo-input');
  input?.addEventListener('change', async () => {
    const file = input.files?.[0];
    if (!file) return;
    try {
      inspection.coverPhotoDataUrl = await compressImage(file, 1600, 0.82);
      upsertInspection(inspection);
      toast('Photo de couverture ajoutée', 'success');
      renderInspect(inspection.id);
      route.tab = 'info';
    } catch {
      toast('Impossible de charger la photo', 'error');
    }
    input.value = '';
  });

  panel.querySelector('#btn-remove-cover')?.addEventListener('click', async () => {
    if (await confirmAction('Retirer la photo', 'La page de couverture ne sera plus incluse dans le rapport.')) {
      inspection.coverPhotoDataUrl = null;
      inspection.coverPhotoCaption = '';
      upsertInspection(inspection);
      toast('Photo retirée', 'success');
      renderInspect(inspection.id);
      route.tab = 'info';
    }
  });
}

function bindInfoForm(inspection, panel) {
  const form = panel.querySelector('#form-info');
  form?.addEventListener('input', () => scheduleAutosave(inspection, 'info', panel));
  form?.addEventListener('change', () => scheduleAutosave(inspection, 'info', panel));
  bindVisitNowButton(panel, inspection);
  bindCoverPhoto(inspection, panel);
  mountClientFilesPanel(inspection, panel);
}

function resolveItem(inspection, si, sub, ii) {
  const sec = inspection.sections?.[si];
  if (!sec) return null;
  if (sub < 0) return sec.items?.[ii] ?? null;
  return sec.subsections?.[sub]?.items?.[ii] ?? null;
}

const SECTION_EXPERT_MAP = {
  'walk-terrain': 'fondation',    'bnq-w-terrain': 'fondation',    'bat-terrain': 'fondation',
  'walk-fondations': 'fondation', 'bnq-w-fondations': 'fondation', 'bat-fondations': 'fondation',
  'aibq-v-i': 'structure',        'aibq-v-i-17': 'structure',      'aibq-v-i-18-20': 'structure',
  'walk-toiture': 'toiture',      'bnq-w-toiture': 'toiture',      'bat-toiture': 'toiture',
  'walk-facades': 'structure',    'bnq-w-facades': 'structure',     'bat-facades': 'structure',
  'walk-ouvertures': 'structure', 'bnq-w-ouvertures': 'structure',  'bat-ouvertures': 'structure',
  'walk-plomb-ext': 'plombier',   'bnq-w-plomb-ext': 'plombier',   'bat-plomb-ext': 'plombier',
  'walk-elec-ext': 'electricien', 'bnq-w-elec-ext': 'electricien', 'bat-elec-ext': 'electricien',
  'aibq-v-iv': 'plombier',        'bnq-12-3': 'plombier',
  'aibq-v-v': 'electricien',      'bnq-12-4': 'electricien',
  'aibq-v-vi': 'chauffage',       'bnq-12-5': 'chauffage',         'aibq-v-vii': 'chauffage',
  'aibq-v-viii': 'environnement', 'bnq-12-6': 'environnement',
  'aibq-v-ix': 'environnement',   'bnq-12-7': 'environnement',     'aibq-v-x': 'environnement',
  'aibq-v-xi': 'electricien',     'bnq-12-8': 'electricien',
};

function getContextId(inspection, si, sub) {
  if (sub >= 0) return inspection.sections[si]?.subsections?.[sub]?.id ?? null;
  return inspection.sections[si]?.id ?? null;
}

function autoAddExpert(inspection, contextId, motif) {
  const type = SECTION_EXPERT_MAP[contextId];
  if (!type) return;
  if (!inspection.expertReferrals) inspection.expertReferrals = [];
  const already = inspection.expertReferrals.some((r) => r.type === type && r.motif === motif);
  if (already) return;
  inspection.expertReferrals.push({ type, motif: motif || '', urgent: false });
  const label = EXPERT_TYPES.find((e) => e.value === type)?.label ?? type;
  toast(`Référence ajoutée → ${label}`, 'warn');
}

function bindChecklist(inspection, panel) {
  panel.querySelectorAll('[data-open-section]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const mainContent = document.getElementById('inspect-main-content') || document.getElementById('tab-content');
      saveCurrentTab(inspection, route.tab || 'info', mainContent);
      upsertInspection(inspection);
      sessionStorage.setItem('kzo_scroll_' + inspection.id, String(main.scrollTop));
      route.checklistView = 'section';
      route.checklistSection = +btn.dataset.openSection;
      route.tab = 'checklist';
      renderInspect(inspection.id);
    });
  });

  panel.querySelector('[data-back-sections]')?.addEventListener('click', () => {
    const savedScroll = sessionStorage.getItem('kzo_scroll_' + inspection.id);
    route.checklistView = 'list';
    route.checklistSection = null;
    renderInspect(inspection.id);
    route.tab = 'checklist';
    if (savedScroll) {
      requestAnimationFrame(() => { main.scrollTop = parseInt(savedScroll, 10); });
    }
  });

  panel.querySelector('[data-checklist-view="all"]')?.addEventListener('click', () => {
    route.checklistView = 'all';
    route.checklistSection = null;
    renderInspect(inspection.id);
    route.tab = 'checklist';
  });

  panel.querySelectorAll('[data-goto-section]').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (btn.disabled) return;
      route.checklistView = 'section';
      route.checklistSection = +btn.dataset.gotoSection;
      renderInspect(inspection.id);
      route.tab = 'checklist';
    });
  });

  panel.querySelectorAll('[data-checklist-filter]').forEach((btn) => {
    btn.addEventListener('click', () => {
      route.checklistFilter = btn.dataset.checklistFilter;
      renderInspect(inspection.id);
      route.tab = 'checklist';
    });
  });

  panel.querySelectorAll('[data-section-na]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const si = +btn.dataset.sectionNa;
      if (await confirmAction('Marquer toute la section N/A', 'Tous les points de cette section seront marqués sans objet.')) {
        const sec = inspection.sections[si];
        sec.items.forEach((it) => { it.status = 'na'; });
        (sec.subsections || []).forEach((sub) => { sub.items.forEach((it) => { it.status = 'na'; }); });
        upsertInspection(inspection);
        renderInspect(inspection.id);
        route.tab = 'checklist';
      }
    });
  });

  panel.querySelectorAll('[data-section-na-sub]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const si = +btn.dataset.sectionNaSub;
      const sub = +btn.dataset.sub;
      if (await confirmAction('Marquer la sous-section N/A', 'Tous les points de cette sous-section seront marqués sans objet.')) {
        const subsec = inspection.sections[si]?.subsections?.[sub];
        if (!subsec) return;
        subsec.items.forEach((it) => { it.status = 'na'; });
        upsertInspection(inspection);
        renderInspect(inspection.id);
        route.tab = 'checklist';
      }
    });
  });

  panel.addEventListener('keydown', (e) => {
    const el = e.target.closest('.check-item');
    if (!el || !['1', '2', '3', '4'].includes(e.key)) return;
    const map = { 1: 'conforme', 2: 'non-conforme', 3: 'a-corriger', 4: 'na' };
    const si = +el.dataset.si;
    const sub = +el.dataset.sub;
    const ii = +el.dataset.ii;
    const item = resolveItem(inspection, si, sub, ii);
    if (!item) return;
    item.status = map[e.key];
    scheduleAutosave(inspection, 'checklist', panel);
    renderInspect(inspection.id);
    route.tab = 'checklist';
  });

  panel.querySelectorAll('[data-status]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const si = +btn.dataset.si;
      const sub = +btn.dataset.sub;
      const ii = +btn.dataset.ii;
      const item = resolveItem(inspection, si, sub, ii);
      if (!item) return;
      item.status = btn.dataset.status;
      if (btn.dataset.status === 'non-conforme') {
        autoAddExpert(inspection, getContextId(inspection, si, sub), item.label || '');
      }
      scheduleAutosave(inspection, 'checklist', panel);
      route.checklistView = route.checklistView || 'section';
      route.checklistSection = route.checklistSection ?? si;
      renderInspect(inspection.id);
      route.tab = 'checklist';
    });
  });

  panel.querySelectorAll('[data-open-narratives]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const si = +btn.dataset.si;
      const sub = +btn.dataset.sub;
      const ii = +btn.dataset.ii;
      const sectionId = btn.dataset.sectionId || '';
      const status = btn.dataset.status || '';
      window._openNarrativesModal(si, sub, ii, sectionId, status);
    });
  });

  panel.querySelectorAll('[data-preset]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const si = +btn.dataset.si;
      const sub = +btn.dataset.sub;
      const ii = +btn.dataset.ii;
      const item = resolveItem(inspection, si, sub, ii);
      if (!item) return;
      if (!Array.isArray(item.selectedPresets)) item.selectedPresets = [];
      const id = btn.dataset.preset;
      const idx = item.selectedPresets.indexOf(id);
      if (idx >= 0) {
        item.selectedPresets.splice(idx, 1);
      } else {
        item.selectedPresets.push(id);
        if (item.status === 'non-conforme' || item.status === 'a-corriger') {
          autoAddExpert(inspection, getContextId(inspection, si, sub), btn.textContent?.trim() || '');
        }
      }
      scheduleAutosave(inspection, 'checklist', panel);
      renderInspect(inspection.id);
      route.tab = 'checklist';
    });
  });

  panel.querySelectorAll('[data-inspector-comment]').forEach((ta) => {
    ta.addEventListener('input', () => {
      const si = +ta.dataset.si;
      const sub = +ta.dataset.sub;
      const ii = +ta.dataset.ii;
      const item = resolveItem(inspection, si, sub, ii);
      if (!item) return;
      item.inspectorComment = ta.value;
      scheduleAutosave(inspection, 'checklist', panel);
    });
  });

  panel.querySelectorAll('[data-note]').forEach((ta) => {
    ta.addEventListener('input', () => {
      const si = +ta.dataset.si;
      const sub = +ta.dataset.sub;
      const ii = +ta.dataset.ii;
      const item = resolveItem(inspection, si, sub, ii);
      if (!item) return;
      item.note = ta.value;
      scheduleAutosave(inspection, 'checklist', panel);
    });
  });

  panel.querySelectorAll('[data-priority]').forEach((sel) => {
    sel.addEventListener('change', () => {
      const si = +sel.dataset.si;
      const sub = +sel.dataset.sub;
      const ii = +sel.dataset.ii;
      const item = resolveItem(inspection, si, sub, ii);
      if (!item) return;
      item.priority = sel.value;
      scheduleAutosave(inspection, 'checklist', panel);
    });
  });

  panel.querySelectorAll('[data-section-materiau]').forEach((sel) => {
    sel.addEventListener('change', () => {
      if (!inspection.sectionMateriau) inspection.sectionMateriau = {};
      inspection.sectionMateriau[sel.dataset.sectionId] = sel.value;
      const badge = sel.closest('.section-materiau')?.querySelector('.section-materiau__badge');
      if (badge) badge.textContent = sel.value;
      else if (sel.value) {
        const b = document.createElement('span');
        b.className = 'section-materiau__badge';
        b.textContent = sel.value;
        sel.closest('.section-materiau')?.appendChild(b);
      }
      scheduleAutosave(inspection, 'checklist', panel);
    });
  });

  panel.querySelectorAll('[data-photo]').forEach((input) => {
    input.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const si = +input.dataset.si;
      const sub = +input.dataset.sub;
      const ii = +input.dataset.ii;
      const item = resolveItem(inspection, si, sub, ii);
      if (!item) return;
      try {
        const dataUrl = await compressImage(file);
        if (!item.photos) item.photos = [];
        if (item.photos.length >= 4) {
          toast('Maximum 4 photos par point', 'warn');
          return;
        }
        item.photos.push(dataUrl);
        upsertInspection(inspection);
        renderInspect(inspection.id);
        route.tab = 'checklist';
      } catch {
        toast('Impossible de charger la photo', 'error');
      }
    });
  });

  panel.querySelectorAll('[data-del-photo]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const si = +btn.dataset.si;
      const sub = +btn.dataset.sub;
      const ii = +btn.dataset.ii;
      const pi = +btn.dataset.pi;
      const item = resolveItem(inspection, si, sub, ii);
      if (!item) return;
      item.photos.splice(pi, 1);
      upsertInspection(inspection);
      renderInspect(inspection.id);
      route.tab = 'checklist';
    });
  });

  panel.querySelectorAll('[data-edit-photo]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const si = +btn.dataset.si;
      const sub = +btn.dataset.sub;
      const ii = +btn.dataset.ii;
      const pi = +btn.dataset.pi;
      const item = resolveItem(inspection, si, sub, ii);
      if (!item) return;
      openImageEditor(item.photos[pi], (newDataUrl) => {
        item.photos[pi] = newDataUrl;
        upsertInspection(inspection);
        renderInspect(inspection.id);
        route.tab = 'checklist';
      });
    });
  });

  panel.querySelectorAll('[data-ai-photo]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const p = loadProfile();
      if (!p.aiUseCloud || !p.aiApiKey?.trim()) {
        toast("L'IA cloud n'est pas activée ou la clé API manque dans le profil.", 'warn');
        return;
      }
      const si = +btn.dataset.si;
      const sub = +btn.dataset.sub;
      const ii = +btn.dataset.ii;
      const pi = +btn.dataset.pi;
      const item = resolveItem(inspection, si, sub, ii);
      if (!item) return;
      const prevHtml = btn.innerHTML;
      btn.innerHTML = '⏳';
      btn.disabled = true;
      try {
        const ctx = {
          itemLabel: item.label,
          sectionTitle: inspection.sections[si].title,
        };
        const result = await analyzePhotoWithVision(item.photos[pi], ctx, p, item.note);
        if (result.text) {
          const base = (item.inspectorComment || '').replace(/\n*---\s*Analyse IA\s*---[\s\S]*$/i, '').trimEnd();
          item.inspectorComment = (base ? base + '\n\n' : '') + '--- Analyse IA ---\n' + result.text;
          upsertInspection(inspection);
          renderInspect(inspection.id);
          route.tab = 'checklist';
          toast("Photo analysée avec l'IA !", 'success');
        }
      } catch (err) {
        toast('Erreur IA: ' + err.message, 'error');
      } finally {
        btn.innerHTML = prevHtml;
        btn.disabled = false;
      }
    });
  });
}

function syncExpertReferralsFromPanel(inspection, panel) {
  if (!inspection.expertReferrals) inspection.expertReferrals = [];
  const rows = panel.querySelectorAll('.expert-row');
  inspection.expertReferrals = [...rows].map((row) => {
    const idx = row.dataset.expertIdx;
    return {
      type: panel.querySelector(`[data-expert-type][data-idx="${idx}"]`)?.value || 'autre',
      motif: panel.querySelector(`[data-expert-motif][data-idx="${idx}"]`)?.value || '',
      urgent: panel.querySelector(`[data-expert-urgent][data-idx="${idx}"]`)?.checked || false,
    };
  });
}

function bindExpertReferrals(inspection, panel) {
  if (!inspection.expertReferrals) inspection.expertReferrals = [];

  panel.querySelector('#btn-add-expert')?.addEventListener('click', () => {
    syncExpertReferralsFromPanel(inspection, panel);
    inspection.expertReferrals.push({ type: 'autre', motif: '', urgent: false });
    upsertInspection(inspection);
    renderInspect(inspection.id);
    route.tab = 'final';
  });

  panel.querySelectorAll('[data-expert-del]').forEach((btn) => {
    btn.addEventListener('click', () => {
      syncExpertReferralsFromPanel(inspection, panel);
      inspection.expertReferrals.splice(+btn.dataset.idx, 1);
      upsertInspection(inspection);
      renderInspect(inspection.id);
      route.tab = 'final';
    });
  });

  panel.querySelectorAll('[data-expert-type], [data-expert-motif], [data-expert-urgent]').forEach((el) => {
    el.addEventListener('change', () => {
      syncExpertReferralsFromPanel(inspection, panel);
      scheduleAutosave(inspection, 'final', panel);
    });
  });
}

function bindFinal(inspection, panel) {
  bindExpertReferrals(inspection, panel);
  bindReceiptCalc(panel, inspection);
  panel.querySelector('#form-final')?.addEventListener('input', () => {
    syncExpertReferralsFromPanel(inspection, panel);
    scheduleAutosave(inspection, 'final', panel);
  });
  panel.querySelector('#form-final')?.addEventListener('change', () => {
    syncExpertReferralsFromPanel(inspection, panel);
    scheduleAutosave(inspection, 'final', panel);
  });

  const canvas = panel.querySelector('#signature-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.strokeStyle = '#1a1a2e';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  let drawing = false;

  function pos(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const t = e.touches?.[0] ?? e;
    return {
      x: (t.clientX - rect.left) * scaleX,
      y: (t.clientY - rect.top) * scaleY,
    };
  }

  function start(e) {
    e.preventDefault();
    drawing = true;
    const p = pos(e);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  }
  function move(e) {
    if (!drawing) return;
    e.preventDefault();
    const p = pos(e);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  }
  function end() {
    drawing = false;
  }

  canvas.addEventListener('mousedown', start);
  canvas.addEventListener('mousemove', move);
  canvas.addEventListener('mouseup', end);
  canvas.addEventListener('mouseleave', end);
  canvas.addEventListener('touchstart', start, { passive: false });
  canvas.addEventListener('touchmove', move, { passive: false });
  canvas.addEventListener('touchend', end);

  panel.querySelector('#sig-clear')?.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  });

  inspection._saveSignature = () => {
    const blank = !ctx.getImageData(0, 0, canvas.width, canvas.height).data.some((v, i) => i % 4 === 3 && v > 0);
    if (!blank) inspection.signatureDataUrl = canvas.toDataURL('image/png');
  };
}

function saveCurrentTab(inspection, tab, panel) {
  if (tab === 'info' && panel.querySelector('#form-info')) {
    const fd = new FormData(panel.querySelector('#form-info'));
    if (fd.has('norme')) {
      inspection.norme = fd.get('norme') || inspection.norme;
    }
    inspection.site = {
      client: fd.get('client') || '',
      proprietaire: fd.get('proprietaire') || '',
      courtier: fd.get('courtier') || '',
      courrielClient: fd.get('courrielClient') || '',
      telephoneClient: fd.get('telephoneClient') || '',
      adresse: fd.get('adresse') || '',
      ville: fd.get('ville') || '',
      codePostal: fd.get('codePostal') || '',
      typeBatiment: fd.get('typeBatiment') || '',
      numeroDossier: fd.get('numeroDossier') || '',
      anneeConstruction: fd.get('anneeConstruction') ? parseInt(fd.get('anneeConstruction')) || '' : '',
      anneeRenovation: fd.get('anneeRenovation') ? parseInt(fd.get('anneeRenovation')) || '' : '',
      categorieBnq: fd.get('categorieBnq') || inspection.site?.categorieBnq || '',
      mandat: fd.get('mandat') || inspection.site?.mandat || '',
    };
    inspection.inspector = {
      ...inspectorFieldsFromProfile(loadProfile()),
      permis: fd.get('permis') || '',
      entreprise: fd.get('entreprise') || '',
      courriel: fd.get('courriel') || '',
      telephone: fd.get('telephone') || '',
      membreAibq: fd.get('membreAibq') || inspection.inspector?.membreAibq || '',
      certificatRbq: fd.get('certificatRbq') || inspection.inspector?.certificatRbq || '',
    };
    inspection.visit = {
      date: fd.get('visitDate') || '',
      heureDebut: fd.get('heureDebut') || '',
      heureFin: fd.get('heureFin') || '',
      conditionsCiel: fd.get('conditionsCiel') || '',
      meteo: fd.get('meteo') || '',
      temperatureAir: fd.get('temperatureAir') || '',
      precipitation: fd.get('precipitation') || '',
      vent: fd.get('vent') || '',
      visibilite: fd.get('visibilite') || '',
      neigeAuSol: fd.get('neigeAuSol') || '',
      personnesPresentes: fd.get('personnesPresentes') || '',
    };
    inspection.coverPhotoCaption = fd.get('coverPhotoCaption') || '';
  }
  if (tab === 'final' && panel.querySelector('#form-final')) {
    const fd = new FormData(panel.querySelector('#form-final'));
    inspection.limitations = fd.get('limitations') || '';
    inspection.observations = fd.get('observations') || '';
    inspection.thankYouNote = fd.get('thankYouNote') || '';
    inspection.receipt = {
      numero: fd.get('receiptNumero') || '',
      description: fd.get('receiptDescription') || '',
      montantHT: fd.get('montantHT') || '',
      tps: fd.get('receiptTps') || '',
      tvq: fd.get('receiptTvq') || '',
      total: fd.get('receiptTotal') || '',
      modePaiement: fd.get('modePaiement') || '',
      statutPaiement: fd.get('statutPaiement') || 'paye',
      datePaiement: fd.get('datePaiement') || '',
      note: fd.get('receiptNote') || '',
    };
    syncExpertReferralsFromPanel(inspection, panel);
    inspection._saveSignature?.();
  }
}

function scheduleAutosave(inspection, tab, panel) {
  clearTimeout(autosaveTimer);
  autosaveTimer = setTimeout(() => {
    saveCurrentTab(inspection, tab, panel);
    upsertInspection(inspection);
  }, 600);
}

function renderInvoicePanel(inspection) {
  const profile = loadProfile();
  const invoiceNum = inspection.invoiceNumber || '—';
  const r = normalizeReceipt(inspection, profile);
  const subtotal = parseFloat(String(r.montantHT).replace(',', '.')) || 0;
  const tpsRate = profile.tauxTPS ?? 5;
  const tvqRate = profile.tauxTVQ ?? 9.975;
  const taxes = computeTaxes(subtotal, tpsRate, tvqRate);
  const connected = isGoogleConnected();
  return `
    <section class="page-header">
      <h2 class="page-title">Facture</h2>
      ${invoiceNum !== '—' ? `<span class="badge badge--success">${escapeHtml(invoiceNum)}</span>` : '<span class="badge">Numéro assigné à la complétion</span>'}
    </section>
    <div class="form-grid">
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:1rem;">
        <div style="display:flex;justify-content:space-between;margin-bottom:0.5rem;"><span style="color:#64748b;">Client</span><strong>${escapeHtml(inspection.site?.client || '—')}</strong></div>
        <div style="display:flex;justify-content:space-between;margin-bottom:0.5rem;"><span style="color:#64748b;">Adresse</span><span>${escapeHtml([inspection.site?.adresse, inspection.site?.ville].filter(Boolean).join(', ') || '—')}</span></div>
        <hr style="margin:0.5rem 0;border:none;border-top:1px solid #e2e8f0;" />
        <div style="display:flex;justify-content:space-between;margin-bottom:0.25rem;"><span style="color:#64748b;">Sous-total</span><span>${formatMoney(taxes.subtotal)}</span></div>
        <div style="display:flex;justify-content:space-between;margin-bottom:0.25rem;"><span style="color:#64748b;">TPS (${tpsRate} %)</span><span>${formatMoney(taxes.tps)}</span></div>
        <div style="display:flex;justify-content:space-between;margin-bottom:0.25rem;"><span style="color:#64748b;">TVQ (${tvqRate} %)</span><span>${formatMoney(taxes.tvq)}</span></div>
        <div style="display:flex;justify-content:space-between;font-weight:bold;font-size:1.05rem;margin-top:0.5rem;padding-top:0.5rem;border-top:2px solid #0c3d5c;color:#0c3d5c;"><span>TOTAL</span><span>${formatMoney(taxes.total)}</span></div>
      </div>
      <label>Statut du paiement
        <select class="input" id="invoice-payment-status">
          <option value="pending" ${(inspection.paymentStatus || 'pending') === 'pending' ? 'selected' : ''}>En attente</option>
          <option value="paid"    ${inspection.paymentStatus === 'paid'    ? 'selected' : ''}>Payé</option>
          <option value="overdue" ${inspection.paymentStatus === 'overdue' ? 'selected' : ''}>En retard</option>
        </select>
      </label>
      <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:1rem;">
        <strong style="color:#1e40af;">Envoyer la facture par courriel</strong>
        <div style="margin-top:0.75rem;">
          <label style="font-size:0.85rem;color:#475569;">À (courriel du client)</label>
          <input class="input" id="invoice-to" type="email" value="${escapeAttr(inspection.site?.courrielClient || '')}" placeholder="client@exemple.com" style="margin-top:0.25rem;" />
        </div>
        <div style="margin-top:0.5rem;">
          <label style="font-size:0.85rem;color:#475569;">Sujet</label>
          <input class="input" id="invoice-subject" value="${escapeAttr('Facture ' + invoiceNum + ' — Inspection — ' + (inspection.site?.adresse || ''))}" style="margin-top:0.25rem;" />
        </div>
        <div style="display:flex;gap:0.75rem;justify-content:flex-end;margin-top:0.75rem;">
          <button type="button" class="btn btn--ghost btn--sm" id="btn-invoice-preview">Aperçu</button>
          <button type="button" class="btn btn--primary btn--sm" id="btn-invoice-send">Envoyer depuis kzoinspectpro@gmail.com</button>
        </div>
        <p style="font-size:0.78rem;color:#6b7280;margin:0.5rem 0 0;">${connected ? 'Connecté à Google' : 'Non connecté — allez dans Profil &rarr; Intégration Google'}</p>
      </div>
    </div>`;
}

function renderProfile() {
  const p = loadProfile();
  const b = resolveBranding(p);
  main.innerHTML = `
    <section class="page-header">
      <h2 class="page-title">Profil inspecteur</h2>
      <p class="page-desc">Identité KZO Inspect, coordonnées et paramètres des documents</p>
    </section>
    <form class="form-grid" id="form-profile">
      <fieldset class="branding-fieldset">
        <legend>Identité KZO Inspect — logo et en-têtes</legend>
        <p class="form-hint form-hint--compact">Votre marque sur l'application, les rapports PDF, la page de couverture, les lettres et les reçus. Mentionnez IBC seulement si vous le souhaitez (certificat).</p>
        <div class="branding-editor" id="branding-editor">
          <div class="branding-logo-preview">
            <img src="${p.brandingLogoDataUrl || DEFAULT_LOGO_URL}" alt="Logo KZO Inspect" class="branding-logo-preview__img" />
          </div>
          <label class="btn btn--primary">
            📷 ${p.brandingLogoDataUrl ? 'Remplacer votre logo' : 'Téléverser un logo personnalisé'}
            <input type="file" accept="image/*" hidden id="branding-logo-input" />
          </label>
          ${p.brandingLogoDataUrl ? `<button type="button" class="btn btn--ghost btn--sm" id="btn-remove-branding-logo">Revenir au logo KZO</button>` : ''}
        </div>
        <label>Nom affiché (application)<input class="input" name="brandingAppName" value="${escapeAttr(p.brandingAppName || b.appName)}" placeholder="KZO Inspect" /></label>
        <label>Nom d'entreprise (en-têtes PDF)<input class="input" name="brandingEntreprise" value="${escapeAttr(p.brandingEntreprise || '')}" placeholder="Sinon : nom de l'entreprise ci-dessous" /></label>
        <label>Slogan / sous-titre<input class="input" name="brandingTagline" value="${escapeAttr(p.brandingTagline || b.tagline)}" placeholder="Inspection de bâtiments au Québec" /></label>
        <label>Mention IBC (optionnel)<input class="input" name="brandingIbcMention" value="${escapeAttr(p.brandingIbcMention || '')}" placeholder="Ex. : Inspecteur certifié — Réseau IBC du Québec" /></label>
        <label>Pied de page des documents (optionnel)<textarea class="input" name="brandingFooter" rows="2" placeholder="Texte personnalisé en bas des rapports et lettres">${escapeHtml(p.brandingFooter || '')}</textarea></label>
        <label>Préfixe des nº de reçu<input class="input" name="brandingReceiptPrefix" value="${escapeAttr(p.brandingReceiptPrefix || 'KZO')}" maxlength="8" /></label>
      </fieldset>
      <label>Inspecteur titulaire<input class="input" name="nom" value="${escapeAttr(INSPECTOR_NAME)}" readonly /></label>
      <label>Nº permis RBQ / certification<input class="input" name="permis" value="${escapeAttr(p.permis)}" /></label>
      <label>Nº membre AIBQ<input class="input" name="membreAibq" value="${escapeAttr(p.membreAibq || '')}" /></label>
      <label>Certificat inspecteur RBQ<input class="input" name="certificatRbq" value="${escapeAttr(p.certificatRbq || '')}" /></label>
      <label>Entreprise<input class="input" name="entreprise" value="${escapeAttr(p.entreprise)}" /></label>
      <label>Courriel<input class="input" type="email" name="courriel" value="${escapeAttr(p.courriel)}" /></label>
      <label>Téléphone<input class="input" type="tel" name="telephone" value="${escapeAttr(p.telephone)}" /></label>
      <label>Message par défaut — lettre de remerciement
        <textarea class="input" name="messageRemerciement" rows="4" placeholder="Texte réutilisé sur chaque lettre si le dossier n'a pas de message personnalisé.">${escapeHtml(p.messageRemerciement || '')}</textarea>
      </label>
      <fieldset>
        <legend>Reçu d'inspection (défauts)</legend>
        <label>Montant habituel avant taxes ($)<input class="input" name="montantDefaut" value="${escapeAttr(p.montantDefaut || '')}" inputmode="decimal" /></label>
        <label>Description de service par défaut<input class="input" name="descriptionServiceDefaut" value="${escapeAttr(p.descriptionServiceDefaut || '')}" /></label>
        <div class="form-row-2">
          <label>Taux TPS (%)<input class="input" name="tauxTPS" value="${escapeAttr(p.tauxTPS ?? 5)}" inputmode="decimal" /></label>
          <label>Taux TVQ (%)<input class="input" name="tauxTVQ" value="${escapeAttr(p.tauxTVQ ?? 9.975)}" inputmode="decimal" /></label>
        </div>
        <label>No inscription TPS<input class="input" name="noEntrepriseTPS" value="${escapeAttr(p.noEntrepriseTPS || '')}" placeholder="123456789 RT 0001" /></label>
        <label>No inscription TVQ<input class="input" name="noEntrepriseTVQ" value="${escapeAttr(p.noEntrepriseTVQ || '')}" placeholder="1234567890 TQ 0001" /></label>
      </fieldset>
      <fieldset>
        <legend>Intelligence Artificielle</legend>
        <label class="checkbox-label">
          <input type="checkbox" name="aiUseCloud" ${p.aiUseCloud ? 'checked' : ''} />
          Activer l'assistant IA (Analyse de photos, rédaction)
        </label>
        <label>Fournisseur IA
          <select class="input" name="aiProvider" id="ai-provider-select">
            ${AI_PROVIDERS.map(prov => `<option value="${escapeAttr(prov.value)}" ${p.aiProvider === prov.value ? 'selected' : ''}>${escapeHtml(prov.label)}</option>`).join('')}
          </select>
        </label>
        <label>Clé API secrète
          <input class="input" type="password" name="aiApiKey" value="${escapeAttr(p.aiApiKey || '')}" placeholder="ex: sk-..." autocomplete="off" />
        </label>
        ${aiModelSelectMarkup(p.aiModel, p.aiProvider, escapeAttr, escapeHtml)}
      </fieldset>
      <fieldset>
        <legend>Sauvegarde et données</legend>
        <p class="form-hint form-hint--compact">Exportez régulièrement vos dossiers (recommandé avant une mise à jour). Stockage actuel : <strong>${formatBytes(estimateStorageUsage())}</strong>.</p>
        <div class="backup-actions">
          <button type="button" class="btn btn--secondary" id="btn-export-backup">Exporter tout (.json)</button>
          <label class="btn btn--ghost">
            Importer une sauvegarde
            <input type="file" accept="application/json,.json" hidden id="import-backup-input" />
          </label>
        </div>
        <p class="form-hint form-hint--compact" id="offline-hint"></p>
      </fieldset>
      <fieldset>
        <legend>Int&eacute;gration Google (Gmail &amp; Drive)</legend>
        <p class="form-hint form-hint--compact">Permet d'envoyer les factures depuis kzoinspectpro@gmail.com et de synchroniser vers Google Drive.</p>
        <label>Google Client ID
          <input class="input" name="googleClientId" value="${escapeAttr(p.googleClientId || '18973787304-0vm4pu6383jn2vni2h996i0ri62iu21s.apps.googleusercontent.com')}" placeholder="xxxxx.apps.googleusercontent.com" />
        </label>
        <label>URL webhook Google Sheets (registre des re&ccedil;us)
          <input class="input" name="sheetsWebhookUrl" value="${escapeAttr(p.sheetsWebhookUrl || 'https://script.google.com/macros/s/AKfycby6XAR9XXWCFMqFAiyF7bjK5RQZxkoclv7KLVuDwJrW2YiNzeVlHr11pfnk3U7l_Nrv/exec')}" />
        </label>
        <div id="google-connect-status" style="margin-top:0.5rem;"></div>
      </fieldset>
      <button type="submit" class="btn btn--primary">Enregistrer le profil</button>
    </form>
  `;
  bindBrandingLogo(p);
  bindBackupControls();
  bindAiModelSelect();

  // Afficher statut connexion Google + bouton connect/disconnect
  function _renderGoogleStatus() {
    const el = document.getElementById('google-connect-status');
    if (!el) return;
    const connected = isGoogleConnected();
    el.innerHTML = connected
      ? `<span style="color:#166534;">&#x2705; Connect&eacute; &agrave; Google</span> <button type="button" class="btn btn--ghost btn--sm" id="btn-google-disconnect">D&eacute;connecter</button>`
      : `<button type="button" class="btn btn--secondary btn--sm" id="btn-google-connect">&#x1F517; Connecter Google</button>`;
    document.getElementById('btn-google-connect')?.addEventListener('click', async () => {
      const clientId = document.querySelector('[name="googleClientId"]')?.value || '';
      try { await googleAuthenticate(clientId); _renderGoogleStatus(); toast('Google connecté', 'success'); }
      catch (err) { toast('Connexion Google échouée : ' + err.message, 'error'); }
    });
    document.getElementById('btn-google-disconnect')?.addEventListener('click', () => {
      googleDisconnect(); _renderGoogleStatus(); toast('Google déconnecté', 'info');
    });
  }
  _renderGoogleStatus();

  document.getElementById('form-profile').onsubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const current = loadProfile();
    saveProfile({
      ...current,
      aiUseCloud: fd.get('aiUseCloud') === 'on',
      aiProvider: fd.get('aiProvider') || 'openai',
      aiApiKey: fd.get('aiApiKey') || '',
      aiModel: fd.get('aiModel') === '__custom__' ? fd.get('aiModelCustom') : fd.get('aiModel'),
      nom: INSPECTOR_NAME,
      permis: fd.get('permis'),
      entreprise: fd.get('entreprise'),
      courriel: fd.get('courriel'),
      telephone: fd.get('telephone'),
      membreAibq: fd.get('membreAibq'),
      certificatRbq: fd.get('certificatRbq'),
      messageRemerciement: fd.get('messageRemerciement'),
      montantDefaut: fd.get('montantDefaut'),
      descriptionServiceDefaut: fd.get('descriptionServiceDefaut'),
      tauxTPS: parseFloat(fd.get('tauxTPS')) || 5,
      tauxTVQ: parseFloat(fd.get('tauxTVQ')) || 9.975,
      noEntrepriseTPS: fd.get('noEntrepriseTPS'),
      noEntrepriseTVQ: fd.get('noEntrepriseTVQ'),
      brandingAppName: fd.get('brandingAppName') || 'KZO Inspect',
      brandingTagline: fd.get('brandingTagline') || '',
      brandingEntreprise: fd.get('brandingEntreprise') || '',
      brandingFooter: fd.get('brandingFooter') || '',
      brandingIbcMention: fd.get('brandingIbcMention') || '',
      brandingReceiptPrefix: fd.get('brandingReceiptPrefix') || 'KZO',
      googleClientId:   fd.get('googleClientId')   || '',
      sheetsWebhookUrl: fd.get('sheetsWebhookUrl')  || '',
    });
    applyTopBarBranding(loadProfile());
    toast('Profil enregistré', 'success');
  };
}

function bindBrandingLogo(profile) {
  const input = document.getElementById('branding-logo-input');
  input?.addEventListener('change', async () => {
    const file = input.files?.[0];
    if (!file) return;
    try {
      const logo = await compressImage(file, 400, 0.9);
      const current = loadProfile();
      saveProfile({ ...current, brandingLogoDataUrl: logo });
      applyTopBarBranding(loadProfile());
      toast('Logo enregistré', 'success');
      renderProfile();
    } catch {
      toast('Impossible de charger le logo', 'error');
    }
    input.value = '';
  });

  document.getElementById('btn-remove-branding-logo')?.addEventListener('click', async () => {
    if (await confirmAction('Logo par défaut', 'Le logo officiel KZO Inspect sera réutilisé.')) {
      const current = loadProfile();
      saveProfile({ ...current, brandingLogoDataUrl: null });
      applyTopBarBranding(loadProfile());
      toast('Logo retiré', 'success');
      renderProfile();
    }
  });
}

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeAttr(str) {
  return escapeHtml(str).replace(/"/g, '&quot;');
}

function formatShortDate(iso) {
  return new Date(iso).toLocaleDateString('fr-CA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatMoney(n) {
  return new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD' }).format(n || 0);
}

window.addEventListener('hashchange', () => {
  route = parseHash();
  render();
});

function bindBackupControls() {
  document.getElementById('btn-export-backup')?.addEventListener('click', () => {
    const n = exportAllData();
    toast(`Sauvegarde exportée (${n} inspection${n !== 1 ? 's' : ''})`, 'success');
  });
  document.getElementById('import-backup-input')?.addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const replace = await confirmAction(
      'Mode d\'import',
      'OK = remplacer toutes les inspections. Annuler = fusionner avec les dossiers existants.',
    );
    try {
      const n = await importAllData(file, { replace });
      toast(`${n} inspection${n !== 1 ? 's' : ''} importée${n !== 1 ? 's' : ''}`, 'success');
      applyTopBarBranding(loadProfile());
      navigate('home');
    } catch (err) {
      toast(err.message || 'Import impossible', 'error');
    }
    e.target.value = '';
  });
  const hint = document.getElementById('offline-hint');
  if (hint && 'serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then(() => {
        hint.textContent = 'Mode hors ligne actif — l\'application fonctionne sans Internet après la première visite.';
      })
      .catch(() => {
        hint.textContent = 'Installez l\'app sur l\'écran d\'accueil pour une utilisation hors ligne optimale.';
      });
  }
}

function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}

window.addEventListener('kzo:storage-quota', (e) => {
  toast(e.detail?.message || 'Espace de stockage plein.', 'error');
});

function initNarrativesModal() {
  const dlg = document.createElement('dialog');
  dlg.id = 'narratives-modal';
  dlg.innerHTML = `
    <div class="nm-header">
      <span class="nm-header__title">📋 Narratifs professionnels</span>
      <span class="nm-header__ctx" id="nm-ctx"></span>
      <button type="button" class="nm-close" id="nm-close" aria-label="Fermer">×</button>
    </div>
    <div class="nm-controls">
      <input type="search" class="nm-search" id="nm-search" placeholder="Rechercher un narratif…" autocomplete="off" />
      <div class="nm-tabs" id="nm-tabs">
        <button type="button" class="nm-tab is-active" data-nm-tab="non-conforme">Non-conforme</button>
        <button type="button" class="nm-tab" data-nm-tab="a-corriger">À corriger</button>
        <button type="button" class="nm-tab" data-nm-tab="conforme">Conforme</button>
        <button type="button" class="nm-tab" data-nm-tab="">Tous</button>
      </div>
    </div>
    <div class="nm-list" id="nm-list"></div>`;
  document.body.appendChild(dlg);

  let _nmSi, _nmSub, _nmIi, _nmSectionId, _nmStatus, _nmActiveTab, _nmQuery;

  function nmEscHtml(s) {
    return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function nmRender() {
    const list = document.getElementById('nm-list');
    const tab = _nmActiveTab !== undefined ? _nmActiveTab : _nmStatus;
    const results = getNarratives(tab || null, _nmSectionId || null, _nmQuery || '');
    if (!results.length) {
      list.innerHTML = '<p class="nm-empty">Aucun narratif pour ce contexte.<br>Utilisez le champ libre ci-dessous.</p>';
      return;
    }
    list.innerHTML = results.map((n) => `
      <div class="nm-card" data-nm-id="${nmEscHtml(n.id)}">
        <div class="nm-card__title">${nmEscHtml(n.title)}</div>
        <div class="nm-card__text">${nmEscHtml(n.text)}</div>
        <div class="nm-card__actions">
          <button type="button" class="nm-expand">Voir tout</button>
          <button type="button" class="nm-insert" data-nm-insert="${nmEscHtml(n.id)}">Insérer dans champ</button>
        </div>
      </div>`).join('');
  }

  dlg.addEventListener('click', (e) => {
    const insertBtn = e.target.closest('[data-nm-insert]');
    if (insertBtn) {
      const id = insertBtn.dataset.nmInsert;
      const narrative = PROFESSIONAL_NARRATIVES.find((n) => n.id === id);
      if (!narrative) return;
      const inspection = getInspection(route.id);
      if (!inspection) return;
      const item = resolveItem(inspection, _nmSi, _nmSub, _nmIi);
      if (!item) return;
      const existing = (item.inspectorComment || '').trim();
      item.inspectorComment = existing ? existing + '\n\n' + narrative.text : narrative.text;
      const panel = document.getElementById('inspect-panel');
      const ta = panel?.querySelector(`[data-inspector-comment][data-si="${_nmSi}"][data-sub="${_nmSub}"][data-ii="${_nmIi}"]`);
      if (ta) ta.value = item.inspectorComment;
      scheduleAutosave(inspection, 'checklist', panel);
      dlg.close();
      return;
    }
    const expandBtn = e.target.closest('.nm-expand');
    if (expandBtn) {
      const textEl = expandBtn.closest('.nm-card')?.querySelector('.nm-card__text');
      if (textEl) {
        textEl.classList.toggle('is-expanded');
        expandBtn.textContent = textEl.classList.contains('is-expanded') ? 'Réduire' : 'Voir tout';
      }
      return;
    }
    const tabBtn = e.target.closest('[data-nm-tab]');
    if (tabBtn) {
      dlg.querySelectorAll('.nm-tab').forEach((b) => b.classList.remove('is-active'));
      tabBtn.classList.add('is-active');
      _nmActiveTab = tabBtn.dataset.nmTab;
      nmRender();
      return;
    }
  });

  document.getElementById('nm-close').addEventListener('click', () => dlg.close());

  document.getElementById('nm-search').addEventListener('input', (e) => {
    _nmQuery = e.target.value;
    nmRender();
  });

  window._openNarrativesModal = function(si, sub, ii, sectionId, status) {
    _nmSi = si; _nmSub = sub; _nmIi = ii;
    _nmSectionId = sectionId;
    _nmStatus = status;
    _nmActiveTab = status || 'non-conforme';
    _nmQuery = '';
    document.getElementById('nm-search').value = '';
    const activeTab = dlg.querySelector(`[data-nm-tab="${_nmActiveTab}"]`) || dlg.querySelector('[data-nm-tab="non-conforme"]');
    dlg.querySelectorAll('.nm-tab').forEach((b) => b.classList.remove('is-active'));
    if (activeTab) activeTab.classList.add('is-active');
    document.getElementById('nm-ctx').textContent = sectionId
      ? sectionId.replace(/^(walk-|bnq-w-|bnq-|aibq-v-|bat-)/, '')
      : '';
    nmRender();
    dlg.showModal();
  };
}

route = parseHash();
registerServiceWorker();
initAiAssistant();
initNarrativesModal();
initRepairsModal({ toast });
render();
window.__kzoInspectBooted = true;
if (typeof window.__kzoInspectReady === 'function') window.__kzoInspectReady();
