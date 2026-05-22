import { STATUS_OPTIONS, INSPECTION_STATUS } from './templates.js';
import { computeStats } from './storage.js';
import {
  formatItemDocumentation,
  hasItemDocumentation,
  presetLabel,
  normalizeChecklistItem,
} from './quick-responses.js';
import {
  getSectionItemGroups,
  normalizeSection,
} from './section-structure.js';
import {
  formatVisitDateTime,
  formatConditionsMeteo,
  cielLabel,
} from './visit.js';
import { listClientFiles, categoryLabel, formatFileSize } from './client-files.js';
import { loadProfile } from './storage.js';
import {
  orgLetterheadHtml,
  orgFooterHtml,
  resolveBranding,
  ORG_LETTERHEAD_STYLES,
} from './organization.js';
import { buildCoverPageHtml, COVER_PAGE_STYLES } from './cover-page.js';
import {
  buildFindingsSummaryHtml,
  buildLimitationsHtml,
  buildExpertReferralsReportHtml,
  FINDINGS_REPORT_STYLES,
} from './report-summary.js';
import { getNormPagesHtml, countNormPages } from './norm-texts.js';
import { normalizeReceipt, computeTaxes } from './receipt-inspection.js';
import {
  MIN_REPORT_PAGES,
  REPORT_PAGINATION_STYLES,
  estimateReportPages,
  buildTableOfContentsHtml,
  buildReportOutline,
  buildPaginatedSectionsHtml,
  buildStandardAppendixPagesHtml,
  buildPaddingPagesHtml,
} from './report-layout.js';

function statusLabel(value) {
  return STATUS_OPTIONS.find((s) => s.value === value)?.label ?? '—';
}

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

function formatMoneyReport(value) {
  const n = parseFloat(String(value).replace(',', '.'));
  if (Number.isNaN(n)) return '—';
  return new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD' }).format(n);
}

function buildReceiptForReport(inspection, profile = {}) {
  const r = normalizeReceipt(inspection, profile);
  const subtotal = parseFloat(String(r.montantHT ?? '').replace(',', '.')) || 0;
  if (subtotal <= 0) return ''; // pas de reçu si pas de montant

  const tpsRate = profile.tauxTPS ?? 5;
  const tvqRate = profile.tauxTVQ ?? 9.975;
  const taxes = computeTaxes(subtotal, tpsRate, tvqRate);

  return `
  <div style="page-break-before:always;"></div>
  <h2>Reçu d'inspection</h2>
  <table style="width:100%;border-collapse:collapse;margin:12px 0;font-size:10pt;">
    <thead>
      <tr>
        <th style="border:1px solid #b0bec5;padding:8px 12px;background:#e3edf7;text-align:left;font-size:9pt;color:#0d47a1;text-transform:uppercase;width:55%;">Description</th>
        <th style="border:1px solid #b0bec5;padding:8px 12px;background:#e3edf7;text-align:center;font-size:9pt;color:#0d47a1;text-transform:uppercase;width:15%;">Taux</th>
        <th style="border:1px solid #b0bec5;padding:8px 12px;background:#e3edf7;text-align:right;font-size:9pt;color:#0d47a1;text-transform:uppercase;width:30%;">Montant</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="border:1px solid #b0bec5;padding:8px 12px;"><strong>${escapeHtml(r.description)}</strong></td>
        <td style="border:1px solid #b0bec5;padding:8px 12px;text-align:center;">—</td>
        <td style="border:1px solid #b0bec5;padding:8px 12px;text-align:right;">${formatMoneyReport(subtotal)}</td>
      </tr>
      <tr>
        <td style="border:1px solid #b0bec5;padding:8px 12px;background:#f5f9fc;font-weight:600;">Sous-total avant taxes</td>
        <td style="border:1px solid #b0bec5;padding:8px 12px;background:#f5f9fc;"></td>
        <td style="border:1px solid #b0bec5;padding:8px 12px;background:#f5f9fc;text-align:right;font-weight:600;">${formatMoneyReport(subtotal)}</td>
      </tr>
      <tr>
        <td style="border:1px solid #b0bec5;padding:8px 12px;background:#fafafa;color:#455a64;">TPS <span style="font-family:monospace;font-size:8pt;color:#90a4ae;">(= Sous-total × ${tpsRate} %)</span></td>
        <td style="border:1px solid #b0bec5;padding:8px 12px;background:#fafafa;text-align:center;color:#455a64;">${tpsRate} %</td>
        <td style="border:1px solid #b0bec5;padding:8px 12px;background:#fafafa;text-align:right;color:#455a64;">${formatMoneyReport(taxes.tps)}</td>
      </tr>
      <tr>
        <td style="border:1px solid #b0bec5;padding:8px 12px;background:#fafafa;color:#455a64;">TVQ <span style="font-family:monospace;font-size:8pt;color:#90a4ae;">(= (Sous-total + TPS) × ${tvqRate} %)</span></td>
        <td style="border:1px solid #b0bec5;padding:8px 12px;background:#fafafa;text-align:center;color:#455a64;">${tvqRate} %</td>
        <td style="border:1px solid #b0bec5;padding:8px 12px;background:#fafafa;text-align:right;color:#455a64;">${formatMoneyReport(taxes.tvq)}</td>
      </tr>
      <tr>
        <td style="border:1px solid #b0bec5;padding:8px 12px;background:#0d47a1;color:#fff;font-weight:800;font-size:12pt;">TOTAL</td>
        <td style="border:1px solid #b0bec5;padding:8px 12px;background:#0d47a1;"></td>
        <td style="border:1px solid #b0bec5;padding:8px 12px;background:#0d47a1;color:#fff;font-weight:800;font-size:12pt;text-align:right;">${formatMoneyReport(taxes.total)}</td>
      </tr>
    </tbody>
  </table>
  ${r.note ? `<p style="font-size:9pt;color:#666;"><strong>Note :</strong> ${escapeHtml(r.note)}</p>` : ''}
  ${profile.noEntrepriseTPS ? `<p style="font-size:8pt;color:#666;">No TPS : ${escapeHtml(profile.noEntrepriseTPS)}</p>` : ''}
  ${profile.noEntrepriseTVQ ? `<p style="font-size:8pt;color:#666;">No TVQ : ${escapeHtml(profile.noEntrepriseTVQ)}</p>` : ''}
  `;
}

function renderReportItemRows(item) {
  normalizeChecklistItem(item);
  const photos =
    item.photos?.length > 0
      ? `<div class="report-photos">${item.photos
          .map((p) => `<img src="${p}" alt="Photo" class="report-photo" />`)
          .join('')}</div>`
      : '';
  let note = '';
  if (hasItemDocumentation(item)) {
    const presetLines = (item.selectedPresets || []).map((id) => presetLabel(id)).filter(Boolean);
    const comment = (item.inspectorComment || '').trim();
    const blocks = [];
    if (presetLines.length) {
      blocks.push(`<p class="report-note"><strong>Réponses rapides :</strong> ${escapeHtml(presetLines.join(' · '))}</p>`);
    }
    if (comment) {
      blocks.push(`<p class="report-note"><strong>Commentaire inspecteur :</strong> ${escapeHtml(comment).replace(/\n/g, '<br />')}</p>`);
    }
    if (!blocks.length) {
      blocks.push(`<p class="report-note"><strong>Note :</strong> ${escapeHtml(formatItemDocumentation(item)).replace(/\n/g, '<br />')}</p>`);
    }
    note = blocks.join('');
  } else if (item.note) {
    note = `<p class="report-note"><strong>Note :</strong> ${escapeHtml(item.note)}</p>`;
  }
  const priority =
    item.status && item.status !== 'conforme' && item.status !== 'na'
      ? `<span class="report-priority">${escapeHtml(item.priority)}</span>`
      : '';
  return `
    <tr class="report-row report-row--${escapeHtml(item.status || 'pending')}">
      <td>${escapeHtml(stripNumbering(item.label))}</td>
      <td><span class="report-status">${statusLabel(item.status)}</span> ${priority}</td>
    </tr>
    ${note || photos ? `<tr><td colspan="2">${note}${photos}</td></tr>` : ''}`;
}

function buildIntroPagesHtml(inspection, clientFiles, stats, statusMeta, profile, branding) {
  const dossier = inspection.site?.numeroDossier;
  const page1 = `
  <div id="report-intro-id" class="report-print-page">
    ${orgLetterheadHtml(branding, { compact: true })}
    <header>
      <h1>Rapport d'inspection</h1>
      <p><strong>${escapeHtml(inspection.templateLabel)}</strong> — ${escapeHtml(inspection.norme)}</p>
      <p>Statut : ${escapeHtml(statusMeta.label)} · Dossier ${escapeHtml(dossier || '—')}</p>
      ${inspection.site.mandat ? `<p>Mandat : ${escapeHtml(inspection.site.mandat)}</p>` : ''}
    </header>
    ${normDisclaimer(inspection.templateId)}
    <h2>Client</h2>
    <dl class="meta-grid">
      <dt>Nom du client</dt><dd>${escapeHtml(inspection.site.client)}</dd>
      ${inspection.site.proprietaire ? `<dt>Propriétaire / vendeur</dt><dd>${escapeHtml(inspection.site.proprietaire)}</dd>` : ''}
      ${inspection.site.courtier ? `<dt>Courtier</dt><dd>${escapeHtml(inspection.site.courtier)}</dd>` : ''}
    </dl>
    <div class="report-print-page__footer"><span>Dossier ${escapeHtml(dossier || '—')}</span><span>Identification</span></div>
  </div>`;

  const page2 = `
  <div id="report-intro-visit" class="report-print-page">
    <h2>Visite et site inspecté</h2>
    <dl class="meta-grid">
      <dt>Date</dt><dd>${escapeHtml(formatVisitDateTime(inspection))}</dd>
      <dt>Conditions</dt><dd>${escapeHtml(formatConditionsMeteo(inspection))}</dd>
      <dt>Adresse</dt><dd>${escapeHtml(inspection.site.adresse)}, ${escapeHtml(inspection.site.ville)}</dd>
      <dt>Type</dt><dd>${escapeHtml(inspection.site.typeBatiment)}</dd>
    </dl>
    ${buildLocationMapHtml(inspection.site)}
    <h2>Inspecteur</h2>
    <dl class="meta-grid">
      <dt>Nom</dt><dd>${escapeHtml(inspection.inspector.nom)}</dd>
      <dt>Permis</dt><dd>${escapeHtml(inspection.inspector.permis)}</dd>
      <dt>Contact</dt><dd>${escapeHtml(inspection.inspector.courriel)} · ${escapeHtml(inspection.inspector.telephone)}</dd>
    </dl>
    ${clientFilesReportHtml(clientFiles)}
    <div class="report-print-page__footer"><span>Dossier ${escapeHtml(dossier || '—')}</span><span>Visite</span></div>
  </div>`;

  const page3 = `
  <div id="report-intro-summary" class="report-print-page">
    <h2>Synthèse</h2>
    <div class="summary">
      <div class="summary-box"><strong>${stats.progress}%</strong> Complété</div>
      <div class="summary-box"><strong>${stats.nonConforme}</strong> Non conformes</div>
      <div class="summary-box"><strong>${stats.aCorriger}</strong> À corriger</div>
    </div>
    ${buildFindingsSummaryHtml(inspection)}
    ${buildLimitationsHtml(inspection)}
    ${buildExpertReferralsReportHtml(inspection)}
    ${inspection.observations ? `<h2>Observations générales</h2><p>${escapeHtml(inspection.observations).replace(/\n/g, '<br>')}</p>` : ''}
    <div class="report-print-page__footer"><span>Dossier ${escapeHtml(dossier || '—')}</span><span>Synthèse</span></div>
  </div>`;

  return page1 + page2 + page3;
}


function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('fr-CA', {
    dateStyle: 'long',
    timeStyle: 'short',
  });
}

function categorieBnqLabel(value) {
  if (value === 'cat1') return 'Catégorie 1 (1 à 6 logements privés)';
  if (value === 'cat2') return 'Catégorie 2 (7 logements privés et plus)';
  return '';
}

function normDisclaimer(templateId) {
  if (templateId === 'aibq-preachat') {
    return `<p class="disclaimer"><strong>Avis AIBQ :</strong> Inspection visuelle non invasive selon la norme de pratique AIBQ (préachat). Ne constitue pas une garantie, une certification CBQ ni une expertise d'ingénieur. Les éléments non visibles ou accessibles ne sont pas couverts.</p>`;
  }
  if (templateId === 'bnq-3009') {
    return `<p class="disclaimer"><strong>Avis BNQ 3009-500 :</strong> Inspection conforme aux pratiques de la norme pour une transaction immobilière. Ne certifie pas la conformité aux codes ou règlements. Limitations inhérentes (annexe A). Expertises spécialisées recommandées lorsque requis.</p>`;
  }
  return '';
}

function buildLocationMapHtml(site) {
  const addr = [site.adresse, site.ville, site.codePostal, 'Québec, Canada']
    .filter(Boolean).join(', ');
  if (!site.adresse && !site.ville) return '';
  const encoded = encodeURIComponent(addr);
  const mapsLink = 'https://www.google.com/maps?q=' + encoded;
  const embedUrl = 'https://maps.google.com/maps?q=' + encoded + '&output=embed&hl=fr';
  return `
  <div class="report-location">
    <h2>Localisation du bâtiment</h2>
    <iframe
      class="report-location__map"
      src="${embedUrl}"
      width="100%"
      height="210"
      style="border:1px solid #ddd;border-radius:6px;display:block;margin-bottom:4px;"
      loading="eager"
      referrerpolicy="no-referrer-when-downgrade"
    ></iframe>
    <p style="font-size:8pt;color:#888;margin:0;">
      <a href="${mapsLink}" style="color:#0d47a1;">${escapeHtml(addr)}</a>
    </p>
  </div>`;
}

function clientFilesReportHtml(files) {
  if (!files?.length) {
    return `<h2>Dossier client (documents)</h2><p>Aucun document joint (BV, convention, etc.).</p>`;
  }
  const rows = files
    .map(
      (f) =>
        `<tr><td>${escapeHtml(f.name)}</td><td>${escapeHtml(categoryLabel(f.category))}</td><td>${formatFileSize(f.size)}</td><td>${escapeHtml(f.note || '—')}</td></tr>`,
    )
    .join('');
  return `<h2>Dossier client (documents)</h2>
    <table class="report-table">
      <thead><tr><th>Fichier</th><th>Type</th><th>Taille</th><th>Note</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <p style="font-size:9pt;color:#666;">Fichiers conservés dans KZO Inspect sur l'appareil de l'inspecteur.</p>`;
}

export function buildReportHtml(inspection, clientFiles = [], profile = {}) {
  const branding = resolveBranding(profile);
  const stats = computeStats(inspection);
  const statusMeta = INSPECTION_STATUS[inspection.status] ?? INSPECTION_STATUS.brouillon;
  const hasCover = !!inspection.coverPhotoDataUrl;
  const dossier = inspection.site?.numeroDossier;

  const normPageCount = countNormPages(inspection.norme);
  const outline = buildReportOutline(inspection, { hasCover, normPageCount });
  const tocHtml = buildTableOfContentsHtml(inspection, outline);

  let startPage = (hasCover ? 1 : 0) + 1 + normPageCount + 3;
  const introHtml = buildIntroPagesHtml(inspection, clientFiles, stats, statusMeta, profile, branding);

  const { html: sectionsHtml, nextPageNum } = buildPaginatedSectionsHtml(inspection, statusLabel, startPage);
  const appendix = buildStandardAppendixPagesHtml(nextPageNum, dossier);
  let pageNum = appendix.nextPageNum;
  let paddingHtml = '';
  if (pageNum - 1 < MIN_REPORT_PAGES) {
    paddingHtml = buildPaddingPagesHtml(MIN_REPORT_PAGES - (pageNum - 1), pageNum, dossier);
    pageNum += MIN_REPORT_PAGES - (pageNum - 1);
  }

  const closingHtml = `
  <div class="report-print-page report-print-page--closing">
    ${inspection.signatureDataUrl ? `<h2>Signature</h2><img class="signature" src="${inspection.signatureDataUrl}" alt="Signature" />` : ''}
    ${buildReceiptForReport(inspection, profile)}
    ${orgFooterHtml(branding)}
    <footer class="footer">
      Document généré par ${escapeHtml(branding.appName)} le ${formatDate(new Date().toISOString())}.
      Rapport structuré — minimum ${MIN_REPORT_PAGES} pages.
    </footer>
    <div class="report-print-page__footer"><span>Dossier ${escapeHtml(dossier || '—')}</span><span>Clôture</span></div>
  </div>`;

  const estPages = estimateReportPages(inspection, { hasCover });

  return `<!DOCTYPE html>
<html lang="fr-CA">
<head>
  <meta charset="UTF-8" />
  <title>Rapport — ${escapeHtml(inspection.site.client || inspection.templateLabel)}</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: "Segoe UI", system-ui, sans-serif; color: #1a1a2e; margin: 0; padding: 24px; font-size: 11pt; }
    h1 { font-size: 20pt; margin: 0 0 4px; color: #0d47a1; }
    h2 { font-size: 13pt; margin: 24px 0 8px; border-bottom: 2px solid #0d47a1; padding-bottom: 4px; }
    h3 { font-size: 12pt; margin: 16px 0 8px; color: #333; }
    .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 24px; margin: 16px 0; }
    .meta-grid dt { font-weight: 600; color: #555; }
    .meta-grid dd { margin: 0 0 8px; }
    .summary { display: flex; gap: 16px; flex-wrap: wrap; margin: 16px 0; }
    .summary-box { border: 1px solid #ddd; border-radius: 8px; padding: 12px 16px; min-width: 120px; }
    .summary-box strong { display: block; font-size: 18pt; color: #0d47a1; }
    .report-table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
    .report-table th, .report-table td { border: 1px solid #ddd; padding: 8px; text-align: left; vertical-align: top; }
    .report-table th { background: #f5f7fa; }
    .report-row--non-conforme td { background: #ffebee; }
    .report-row--a-corriger td { background: #fff8e1; }
    .report-note { margin: 4px 0; font-size: 10pt; color: #444; }
    .report-photos { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
    .report-photo { max-width: 160px; max-height: 120px; object-fit: cover; border-radius: 4px; border: 1px solid #ccc; }
    .signature { max-width: 280px; border: 1px solid #ccc; margin-top: 8px; }
    .footer { margin-top: 32px; font-size: 9pt; color: #777; border-top: 1px solid #eee; padding-top: 12px; }
    .disclaimer { background: #fff8e1; border-left: 4px solid #f9a825; padding: 10px 12px; font-size: 9pt; margin: 12px 0; }
    ${ORG_LETTERHEAD_STYLES}
    ${COVER_PAGE_STYLES}
    ${FINDINGS_REPORT_STYLES}
    ${REPORT_PAGINATION_STYLES}
    @media print { body { padding: 0; } .no-print { display: none; } }
  </style>
</head>
<body>
  <p class="no-print" style="background:#e3f2fd;padding:12px;border-radius:8px;margin:12px;">
    Rapport KZO Inspect — <strong>Imprimer</strong> ou <strong>Enregistrer en PDF</strong>.
    Volume cible : <strong>≥ ${MIN_REPORT_PAGES} pages</strong> (estimé ~${estPages} pages).
  </p>
  ${buildCoverPageHtml(inspection, profile)}
  ${tocHtml}
  ${getNormPagesHtml(inspection.norme)}
  ${introHtml}
  ${sectionsHtml}
  ${appendix.html}
  ${paddingHtml}
  ${closingHtml}
  <script>
    window.onload = function() {
      var mapIframe = document.querySelector('.report-location__map');
      if (mapIframe) {
        var printed = false;
        var doPrint = function() { if (!printed) { printed = true; window.print(); } };
        mapIframe.addEventListener('load', doPrint);
        setTimeout(doPrint, 3000);
      } else {
        window.print();
      }
    };
  </script>
</body>
</html>`;
}

export async function openReport(inspection, profile = loadProfile()) {
  const clientFiles = await listClientFiles(inspection.id).catch(() => []);
  const html = buildReportHtml(inspection, clientFiles, profile);
  const win = window.open('', '_blank');
  if (!win) {
    alert('Autorisez les fenêtres contextuelles pour générer le rapport PDF.');
    return;
  }
  win.document.write(html);
  win.document.close();
}
