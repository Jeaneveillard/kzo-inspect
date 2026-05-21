/**
 * Pagination du rapport PDF — volume minimum garanti (40 pages).
 */

import { isInfoSection, iterSectionItems, normalizeSection } from './section-structure.js';
import { hasItemDocumentation, normalizeChecklistItem, presetLabel } from './quick-responses.js';

export const MIN_REPORT_PAGES = 40;

export const REPORT_PAGINATION_STYLES = `
  .report-print-page {
    position: relative;
    min-height: 248mm;
    padding: 14mm 16mm 22mm;
    page-break-after: always;
    break-after: page;
    box-sizing: border-box;
  }
  /* Ne pas utiliser :last-child — la dernière page d'un bloc section annulait le saut entre sections. */
  .report-print-page--closing { page-break-after: auto; break-after: auto; }
  .report-section-block {
    display: block;
    page-break-before: always;
    break-before: page;
  }
  .report-print-page--section {
    page-break-before: always;
    break-before: page;
  }
  .report-print-page__footer {
    position: absolute;
    left: 16mm;
    right: 16mm;
    bottom: 10mm;
    font-size: 8pt;
    color: #78909c;
    border-top: 1px solid #e0e0e0;
    padding-top: 6px;
    display: flex;
    justify-content: space-between;
  }
  .report-print-page__head {
    margin: 0 0 12px;
    padding-bottom: 8px;
    border-bottom: 2px solid #0d47a1;
  }
  .report-print-page__head h2 {
    margin: 0;
    font-size: 13pt;
    color: #0d47a1;
    border: none;
    padding: 0;
  }
  .report-print-page__head p { margin: 4px 0 0; font-size: 9pt; color: #546e7a; }
  .report-toc { list-style: none; padding: 0; margin: 16px 0; }
  .report-toc li {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    padding: 6px 0;
    border-bottom: 1px dotted #cfd8dc;
    font-size: 10.5pt;
  }
  .report-toc__dots { flex: 1; border-bottom: 1px dotted #b0bec5; margin-bottom: 4px; min-width: 24px; }
  .report-toc a { color: #0d47a1; text-decoration: none; }
  .report-toc a:hover { text-decoration: underline; }
  .report-toc__page { font-variant-numeric: tabular-nums; min-width: 2.5em; text-align: right; color: #37474f; }
  .report-toc__item--level-2 { padding-left: 18px; font-size: 9.5pt; color: #546e7a; }
  .report-toc__meta { margin: 0 0 20px; font-size: 10.5pt; color: #546e7a; line-height: 1.5; }
  .report-toc__meta strong { color: #1a1a2e; }
  .report-item-page__label { font-size: 12pt; font-weight: 600; margin: 0 0 10px; color: #1a1a2e; }
  .report-item-page__status {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 4px;
    font-size: 10pt;
    font-weight: 600;
    margin-bottom: 12px;
  }
  .report-item-page__status--conforme { background: #e8f5e9; color: #2e7d32; }
  .report-item-page__status--non-conforme { background: #ffebee; color: #c62828; }
  .report-item-page__status--a-corriger { background: #fff8e1; color: #f57f17; }
  .report-item-page__status--na { background: #eceff1; color: #546e7a; }
  .report-item-page__body { font-size: 10.5pt; line-height: 1.55; color: #37474f; }
  .report-item-page__photos { margin-top: 16px; }
  .report-item-page__photo {
    width: 100%;
    max-height: 165mm;
    object-fit: contain;
    border: 1px solid #cfd8dc;
    border-radius: 6px;
    margin-bottom: 10px;
  }
  .report-photo-page__img {
    width: 100%;
    max-height: 210mm;
    object-fit: contain;
    border-radius: 6px;
    border: 1px solid #cfd8dc;
  }
  .report-photo-page__caption { margin-top: 10px; font-size: 10pt; color: #546e7a; }
  .report-compact-table { width: 100%; border-collapse: collapse; font-size: 9.5pt; margin-top: 8px; }
  .report-compact-table th, .report-compact-table td {
    border: 1px solid #ddd;
    padding: 6px 8px;
    text-align: left;
    vertical-align: top;
  }
  .report-compact-table th { background: #f5f7fa; }
  .report-appendix-prose { font-size: 10.5pt; line-height: 1.6; color: #37474f; }
  .report-appendix-prose h3 { font-size: 11pt; color: #0d47a1; margin: 16px 0 8px; }
  .report-appendix-prose p { margin: 0 0 10px; }
  .report-appendix-prose ul { margin: 0 0 12px; padding-left: 20px; }
  .report-ident-block { font-size: 10.5pt; line-height: 1.55; }
  .report-ident-block dl { display: grid; grid-template-columns: 140px 1fr; gap: 4px 16px; margin: 0 0 12px; }
  .report-ident-block dt { font-weight: 600; color: #546e7a; }
  .report-ident-block dd { margin: 0; }
  @media print {
    .report-print-page {
      min-height: 248mm;
      page-break-after: always;
      break-after: page;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .report-section-block {
      display: block;
    }
    .report-print-page--section {
      /* sections se suivent sans saut de page forcé */
    }
    .report-photo-page__img { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
`;

const APPENDIX_PAGES = [
  {
    title: 'Glossaire — terminologie courante',
    body: `<p>Ce glossaire facilite la lecture du rapport selon les usages professionnels au Québec.</p>
      <h3>Structure et enveloppe</h3>
      <ul>
        <li><strong>Efflorescence</strong> — dépôts de sels minéraux en surface, souvent signe d'humidité.</li>
        <li><strong>Larmier</strong> — saillie horizontale au-dessus d'une ouverture pour éloigner l'eau du mur.</li>
        <li><strong>Solive de rive</strong> — pièce de bois en bout de plancher, en appui sur le mur extérieur.</li>
      </ul>
      <h3>Plomberie et électricité</h3>
      <ul>
        <li><strong>Poly-B</strong> — tuyauterie en polybutylène (gris), sujette à défaillance aux raccords.</li>
        <li><strong>GFCI / DDFT</strong> — dispositif différentiel pour prises à risque.</li>
      </ul>`,
  },
  {
    title: 'Responsabilités de l\'inspecteur et du client',
    body: `<p>L'inspection est une <strong>évaluation visuelle non invasive</strong> à une date donnée. Elle ne constitue pas une garantie ni une certification au Code du bâtiment.</p>
      <h3>Rôle de l'inspecteur</h3>
      <ul>
        <li>Observer les composantes accessibles et documenter les constats visibles.</li>
        <li>Signaler les limitations d'accès ou de visibilité.</li>
        <li>Recommander des expertises spécialisées lorsque requis.</li>
      </ul>`,
  },
  {
    title: 'Références normatives (Québec)',
    body: `<p>Cadre applicable : REIBH, BNQ 3009-500, norme AIBQ, CNB / CCQ. Les citations de code sont indicatives.</p>`,
  },
  {
    title: 'Méthodologie d\'inspection visuelle',
    body: `<p>Démarche systématique : extérieur, toiture, enveloppe, systèmes intérieurs accessibles sans démolition.</p>
      <ul>
        <li>Observation visuelle et essais légers non destructifs lorsque permis.</li>
        <li>Documentation photographique des constats significatifs.</li>
      </ul>`,
  },
  {
    title: 'Limitations générales',
    body: `<p>Mobilier, neige, végétation, obscurité ou accès restreint peuvent limiter la portée des constats. Les défauts latents demeurent hors portée d'une visite ponctuelle.</p>`,
  },
  {
    title: 'Grille de sévérité',
    body: `<p><strong>C</strong> conforme · <strong>NC</strong> non conforme · <strong>AC</strong> à corriger · <strong>N/A</strong> sans objet. Priorité : mineure, majeure, critique.</p>`,
  },
  {
    title: 'Entretien préventif',
    body: `<ul>
        <li>Nettoyer gouttières printemps et automne.</li>
        <li>Vérifier scellants et étanchéité des ouvertures.</li>
        <li>Surveiller humidité au sous-sol.</li>
        <li>Tester détecteurs de fumée et CO semestriellement.</li>
      </ul>`,
  },
  {
    title: 'Suivi post-inspection',
    body: `<p>Les constats NC/AC devraient faire l'objet d'estimations par entrepreneurs licenciés (RBQ) ou professionnels membres de leur ordre.</p>`,
  },
];

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function stripNumbering(text) {
  return String(text || '').replace(/^(?:Art\.\s*)?\d+(?:\.\d+)*[a-z]?\.?\s*[-—–:]*\s*/i, '');
}

function pageFooter(pageNum, dossier) {
  return `<div class="report-print-page__footer">
    <span>Dossier ${escapeHtml(dossier || '—')}</span>
    <span>Page ${pageNum} · rapport ≥ ${MIN_REPORT_PAGES} pages</span>
  </div>`;
}

function statusClass(status) {
  if (status === 'conforme') return 'conforme';
  if (status === 'non-conforme') return 'non-conforme';
  if (status === 'a-corriger') return 'a-corriger';
  return 'na';
}

function itemDocumentationHtml(item) {
  normalizeChecklistItem(item);
  const blocks = [];
  const presets = (item.selectedPresets || []).map((id) => presetLabel(id)).filter(Boolean);
  if (presets.length) {
    blocks.push(`<p><strong>Réponses rapides :</strong> ${escapeHtml(presets.join(' · '))}</p>`);
  }
  const comment = (item.inspectorComment || item.note || '').trim();
  if (comment) {
    blocks.push(`<p><strong>Commentaire inspecteur :</strong> ${escapeHtml(comment).replace(/\n/g, '<br />')}</p>`);
  }
  return blocks.join('');
}

export function estimateReportPages(inspection, { normPages = 10, hasCover = false } = {}) {
  let pages = hasCover ? 1 : 0;
  pages += normPages + 1 + 3 + APPENDIX_PAGES.length;
  for (const sec of inspection.sections || []) {
    if (isInfoSection(sec.id)) continue;
    pages += 1;
    iterSectionItems(sec, (item) => {
      if (item.status) pages += 1;
      pages += item.photos?.length || 0;
    });
  }
  return pages + 2;
}

/** Calcule les numéros de page pour chaque chapitre (même ordre que le PDF généré). */
export function buildReportOutline(inspection, { hasCover = false, normPageCount = 10 } = {}) {
  const entries = [];
  let p = 1;

  if (hasCover) {
    entries.push({ id: 'report-cover', label: 'Page de couverture', page: p++, level: 0 });
  }
  entries.push({ id: 'report-toc', label: 'Table des matières', page: p++, level: 0 });
  entries.push({ id: 'report-norms', label: 'Normes et cadre d\'inspection', page: p, level: 0 });
  p += normPageCount;

  entries.push({ id: 'report-intro-id', label: 'Identification du mandat', page: p++, level: 0 });
  entries.push({ id: 'report-intro-visit', label: 'Visite et site inspecté', page: p++, level: 0 });
  entries.push({ id: 'report-intro-summary', label: 'Synthèse des constats', page: p++, level: 0 });

  const forceAllItems = estimateReportPages(inspection, { hasCover, normPages: normPageCount }) < MIN_REPORT_PAGES;
  let photoAnnexPage = null;

  for (const sec of inspection.sections || []) {
    if (isInfoSection(sec.id)) continue;
    normalizeSection(sec);
    entries.push({ id: `report-sec-${sec.id}`, label: stripNumbering(sec.title), page: p++, level: 1 });

    const compactConforme = [];
    const compactNa = [];

    iterSectionItems(sec, (item) => {
      if (!item.status) {
        if (forceAllItems) p += 1;
        return;
      }
      const documented =
        hasItemDocumentation(item) ||
        (item.photos?.length > 0) ||
        item.status === 'non-conforme' ||
        item.status === 'a-corriger';

      if (documented || forceAllItems) {
        p += 1;
        const photoCount = item.photos?.length || 0;
        if (photoCount && photoAnnexPage === null) photoAnnexPage = p;
        p += photoCount;
      } else if (item.status === 'conforme') {
        compactConforme.push(item);
      } else {
        compactNa.push(item);
      }
    });

    const chunkSize = forceAllItems ? 4 : 8;
    p += Math.ceil(compactConforme.length / chunkSize) + Math.ceil(compactNa.length / chunkSize);
  }

  if (photoAnnexPage !== null) {
    entries.push({ id: 'report-photos', label: 'Annexe photographique', page: photoAnnexPage, level: 0 });
  }

  entries.push({ id: 'report-appendix', label: 'Annexes techniques et glossaire', page: p, level: 0 });
  p += APPENDIX_PAGES.length;
  entries.push({ id: 'report-closing', label: 'Signature et reçu', page: p, level: 0 });

  return entries;
}

export function buildTableOfContentsHtml(inspection, outline = []) {
  const client = inspection.site?.client || inspection.templateLabel || 'Propriété inspectée';
  const addr = [inspection.site?.adresse, inspection.site?.ville].filter(Boolean).join(', ');
  const dossier = inspection.site?.numeroDossier || '—';

  const rows = outline
    .filter((e) => e.id !== 'report-toc' && e.id !== 'report-cover')
    .map((e) => {
      const levelClass = e.level === 2 ? ' report-toc__item--level-2' : '';
      const labelHtml = e.id
        ? `<a href="#${escapeHtml(e.id)}">${escapeHtml(e.label)}</a>`
        : escapeHtml(e.label);
      return `<li class="report-toc__item${levelClass}">
        <span class="report-toc__label">${labelHtml}</span>
        <span class="report-toc__dots"></span>
        <span class="report-toc__page">${e.page}</span>
      </li>`;
    })
    .join('');

  return `
  <div id="report-toc" class="report-print-page report-print-page--toc">
    <div class="report-print-page__head">
      <h2>Table des matières</h2>
      <p>Rapport d'inspection — navigation par chapitre</p>
    </div>
    <p class="report-toc__meta">
      <strong>${escapeHtml(client)}</strong><br />
      ${addr ? `${escapeHtml(addr)}<br />` : ''}
      Dossier <strong>${escapeHtml(dossier)}</strong>
    </p>
    <ol class="report-toc">${rows}</ol>
    <p class="report-toc__meta" style="margin-top:24px;font-size:9pt;">
      Les numéros de page correspondent au PDF imprimé. Cliquez un titre pour accéder au chapitre (lecteur PDF).
    </p>
  </div>`;
}

function buildItemDetailPage(sec, item, subTitle, pageNum, dossier, statusLabelFn) {
  const status = item.status || 'pending';
  const photos =
    item.photos?.length > 0
      ? `<div class="report-item-page__photos">${item.photos
          .map((p) => `<img class="report-item-page__photo" src="${p}" alt="Photo du constat" />`)
          .join('')}</div>`
      : '';
  const doc = itemDocumentationHtml(item);
  return `
  <div class="report-print-page report-print-page--item">
    <div class="report-print-page__head">
      <h2>${escapeHtml(stripNumbering(sec.title))}</h2>
      ${subTitle ? `<p>${escapeHtml(stripNumbering(subTitle))}</p>` : ''}
    </div>
    <p class="report-item-page__label">${escapeHtml(stripNumbering(item.label))}</p>
    <span class="report-item-page__status report-item-page__status--${statusClass(status)}">${escapeHtml(statusLabelFn(status))}</span>
    ${item.priority && status !== 'conforme' && status !== 'na' ? `<p><strong>Priorité :</strong> ${escapeHtml(item.priority)}</p>` : ''}
    <div class="report-item-page__body">${doc || '<p>Aucune note complémentaire.</p>'}</div>
    ${photos}
    ${pageFooter(pageNum, dossier)}
  </div>`;
}

function buildCompactItemsPage(sec, items, subTitle, pageNum, dossier, statusLabelFn) {
  const rows = items
    .map(
      (item) =>
        `<tr><td>${escapeHtml(stripNumbering(item.label))}</td><td>${escapeHtml(statusLabelFn(item.status))}</td></tr>`,
    )
    .join('');
  return `
  <div class="report-print-page report-print-page--compact">
    <div class="report-print-page__head">
      <h2>${escapeHtml(stripNumbering(sec.title))}</h2>
      <p>${subTitle ? `${escapeHtml(stripNumbering(subTitle))} — ` : ''}points conformes / S.O.</p>
    </div>
    <table class="report-compact-table"><thead><tr><th>Point</th><th>Résultat</th></tr></thead><tbody>${rows}</tbody></table>
    ${pageFooter(pageNum, dossier)}
  </div>`;
}

function buildSectionIntroPage(sec, pageNum, dossier) {
  return `
  <div id="report-sec-${escapeHtml(sec.id)}" class="report-print-page report-print-page--section">
    <div class="report-print-page__head">
      <h2>${escapeHtml(stripNumbering(sec.title))}</h2>
      <p>Détail des constats — section suivante</p>
    </div>
    <p class="report-appendix-prose">Les points évalués de cette section sont documentés aux pages suivantes. Les constats non conformes ou à corriger font l'objet d'une fiche détaillée; les points conformes ou sans objet sont regroupés en fin de section.</p>
    ${pageFooter(pageNum, dossier)}
  </div>`;
}

function buildPhotoAnnexPage(sec, item, photoSrc, photoIndex, pageNum, dossier) {
  const photoId = photoIndex === 0 ? ' id="report-photos"' : '';
  return `
  <div${photoId} class="report-print-page report-print-page--photo">
    <div class="report-print-page__head">
      <h2>Annexe photographique</h2>
      <p>${escapeHtml(stripNumbering(sec.title))}</p>
    </div>
    <img class="report-photo-page__img" src="${photoSrc}" alt="Photo ${photoIndex + 1}" />
    <p class="report-photo-page__caption">${escapeHtml(stripNumbering(item.label))} — photo ${photoIndex + 1}</p>
    ${pageFooter(pageNum, dossier)}
  </div>`;
}

export function buildStandardAppendixPagesHtml(startPageNum, dossier) {
  let html = '';
  let pageNum = startPageNum;
  for (const chunk of APPENDIX_PAGES) {
    const appendixId = pageNum === startPageNum ? ' id="report-appendix"' : '';
    html += `
    <div${appendixId} class="report-print-page report-print-page--appendix">
      <div class="report-print-page__head"><h2>${escapeHtml(chunk.title)}</h2></div>
      <div class="report-appendix-prose">${chunk.body}</div>
      ${pageFooter(pageNum++, dossier)}
    </div>`;
  }
  return { html, nextPageNum: pageNum };
}

export function buildPaddingPagesHtml(count, startPageNum, dossier) {
  let html = '';
  for (let i = 0; i < count; i++) {
    const chunk = APPENDIX_PAGES[i % APPENDIX_PAGES.length];
    const pageNum = startPageNum + i;
    html += `
    <div class="report-print-page report-print-page--padding">
      <div class="report-print-page__head"><h2>${escapeHtml(chunk.title)} (suite)</h2></div>
      <div class="report-appendix-prose">${chunk.body}
        <p><em>Document complémentaire — page ${pageNum} du rapport d'inspection.</em></p>
      </div>
      ${pageFooter(pageNum, dossier)}
    </div>`;
  }
  return html;
}

export function buildPaginatedSectionsHtml(inspection, statusLabelFn, startPageNum) {
  const dossier = inspection.site?.numeroDossier;
  let pageNum = startPageNum;
  let html = '';
  const forceAllItems = estimateReportPages(inspection, { hasCover: !!inspection.coverPhotoDataUrl }) < MIN_REPORT_PAGES;

  for (const sec of inspection.sections || []) {
    if (isInfoSection(sec.id)) continue;
    normalizeSection(sec);
    html += '<div class="report-section-block">';
    html += buildSectionIntroPage(sec, pageNum++, dossier);

    const compactConforme = [];
    const compactNa = [];

    iterSectionItems(sec, (item, _subIndex, _ii, subTitle) => {
      if (!item.status) {
        if (forceAllItems) {
          html += buildItemDetailPage(sec, { ...item, status: 'na' }, subTitle, pageNum++, dossier, statusLabelFn);
        }
        return;
      }
      const documented =
        hasItemDocumentation(item) ||
        (item.photos?.length > 0) ||
        item.status === 'non-conforme' ||
        item.status === 'a-corriger';

      if (documented || forceAllItems) {
        html += buildItemDetailPage(sec, item, subTitle, pageNum++, dossier, statusLabelFn);
        (item.photos || []).forEach((photoSrc, pi) => {
          html += buildPhotoAnnexPage(sec, item, photoSrc, pi, pageNum++, dossier);
        });
      } else if (item.status === 'conforme') {
        compactConforme.push(item);
      } else {
        compactNa.push(item);
      }
    });

    const chunkSize = forceAllItems ? 4 : 8;
    for (let i = 0; i < compactConforme.length; i += chunkSize) {
      html += buildCompactItemsPage(sec, compactConforme.slice(i, i + chunkSize), null, pageNum++, dossier, statusLabelFn);
    }
    for (let i = 0; i < compactNa.length; i += chunkSize) {
      html += buildCompactItemsPage(sec, compactNa.slice(i, i + chunkSize), 'Sans objet', pageNum++, dossier, statusLabelFn);
    }
    html += '</div>';
  }

  return { html, nextPageNum: pageNum };
}
