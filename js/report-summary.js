import { collectFindings, statusLabel, expertTypeLabel } from './checklist-utils.js';

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const PRIORITY_LABELS = {
  haute: 'Priorité haute',
  moyenne: 'Priorité moyenne',
  basse: 'Priorité basse',
};

export function buildFindingsSummaryHtml(inspection) {
  const findings = collectFindings(inspection);
  if (!findings.length) {
    return `<h2>Synthèse des constats importants</h2>
      <p class="findings-none">Aucun point non conforme ou à corriger relevé au moment du rapport.</p>`;
  }

  const rows = findings
    .map((f) => {
      const photos =
        f.photos.length > 0
          ? `<div class="report-photos">${f.photos.map((p) => `<img src="${p}" alt="" class="report-photo" />`).join('')}</div>`
          : '';
      const pri = f.priority ? `<span class="report-priority">${escapeHtml(PRIORITY_LABELS[f.priority] || f.priority)}</span>` : '';
      return `
        <tr class="report-row report-row--${escapeHtml(f.status)}">
          <td>${escapeHtml(f.sectionTitle)}</td>
          <td>${escapeHtml(f.label)}</td>
          <td><span class="report-status">${escapeHtml(statusLabel(f.status))}</span> ${pri}</td>
        </tr>
        ${f.note || f.inspectorComment || (f.selectedPresets?.length) || photos ? `<tr><td colspan="3">${
          f.inspectorComment
            ? `<p class="report-note"><strong>Commentaire :</strong> ${escapeHtml(f.inspectorComment)}</p>`
            : f.note
              ? `<p class="report-note">${escapeHtml(f.note)}</p>`
              : ''
        }${photos}</td></tr>` : ''}`;
    })
    .join('');

  return `
    <h2>Synthèse des constats importants</h2>
    <p class="findings-intro">${findings.length} point${findings.length > 1 ? 's' : ''} non conforme${findings.length > 1 ? 's' : ''} ou à corriger — à traiter en priorité.</p>
    <table class="report-table findings-table">
      <thead><tr><th>Section</th><th>Point</th><th>Résultat</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
}

export function buildLimitationsHtml(inspection) {
  const text = (inspection.limitations || '').trim();
  if (!text) return '';
  return `<h2>Limitations de l'inspection</h2>
    <p class="limitations-block">${escapeHtml(text).replace(/\n/g, '<br />')}</p>`;
}

export function buildExpertReferralsReportHtml(inspection) {
  const refs = inspection.expertReferrals || [];
  if (!refs.length) return '';
  const normName = String(inspection.norme || '').toUpperCase();
  const normRef = normName.includes('AIBQ')
    ? 'art. 3 norme de pratique AIBQ'
    : normName.includes('BNQ')
      ? 'BNQ 3009-500 section 7'
      : 'bonne pratique professionnelle';
  const rows = refs
    .map(
      (r) =>
        `<tr>
          <td>${escapeHtml(expertTypeLabel(r.type))}</td>
          <td>${escapeHtml(r.motif || '—')}</td>
          <td>${r.urgent ? 'Oui' : 'Non'}</td>
        </tr>`,
    )
    .join('');
  return `
    <h2>Recommandations d'experts (suivi)</h2>
    <p class="findings-intro">Selon les constats, consultation d'un spécialiste recommandée (${normRef}).</p>
    <table class="report-table">
      <thead><tr><th>Spécialiste</th><th>Motif</th><th>Urgent</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
}

export const FINDINGS_REPORT_STYLES = `
  .findings-intro { font-size: 10pt; color: #444; margin: 0 0 12px; }
  .findings-none { color: #2e7d32; background: #e8f5e9; padding: 12px; border-radius: 8px; }
  .findings-table { margin-bottom: 24px; }
  .limitations-block { background: #f5f7fa; padding: 12px 14px; border-left: 4px solid #0d47a1; font-size: 10pt; }
  @media print {
    .findings-table { page-break-inside: auto; }
    h2 { page-break-after: avoid; }
  }
`;
