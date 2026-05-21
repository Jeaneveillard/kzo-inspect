import {
  orgLetterheadHtml,
  orgFooterHtml,
  resolveBranding,
  ORG_LETTERHEAD_STYLES,
} from './organization.js';
import { formatVisitDateTime, formatDateFr } from './visit.js';

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function fullAddress(site) {
  const parts = [site.adresse, [site.ville, site.codePostal].filter(Boolean).join(' ')].filter(Boolean);
  return parts.join(', ') || '—';
}

function formatMoney(value) {
  const n = parseFloat(String(value).replace(',', '.'));
  if (Number.isNaN(n)) return '—';
  return new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD' }).format(n);
}

function parseAmount(value) {
  const n = parseFloat(String(value ?? '').replace(',', '.'));
  return Number.isNaN(n) ? 0 : n;
}

export function computeTaxes(subtotal, tpsRate = 5, tvqRate = 9.975) {
  const base = parseAmount(subtotal);
  const tps = Math.round(base * (tpsRate / 100) * 100) / 100;
  const tvq = Math.round((base + tps) * (tvqRate / 100) * 100) / 100;
  const total = Math.round((base + tps + tvq) * 100) / 100;
  return { subtotal: base, tps, tvq, total };
}

export const PAYMENT_MODES = [
  { value: '', label: '— Mode —' },
  { value: 'comptant', label: 'Comptant' },
  { value: 'cheque', label: 'Chèque' },
  { value: 'virement', label: 'Virement / Interac' },
  { value: 'carte', label: 'Carte de crédit / débit' },
  { value: 'autre', label: 'Autre' },
];

export const PAYMENT_STATUS = [
  { value: 'paye', label: 'Payé en totalité' },
  { value: 'acompte', label: 'Acompte reçu' },
  { value: 'en-attente', label: 'Paiement en attente' },
];

function paymentModeLabel(v) {
  return PAYMENT_MODES.find((p) => p.value === v)?.label ?? v ?? '—';
}

function paymentStatusLabel(v) {
  return PAYMENT_STATUS.find((p) => p.value === v)?.label ?? v ?? '—';
}

function receiptNumber(inspection, profile = {}) {
  if (inspection.invoiceNumber) return inspection.invoiceNumber;
  if (inspection.receipt?.numero) return inspection.receipt.numero;
  if (inspection.site?.numeroDossier) return inspection.site.numeroDossier;
  const prefix = resolveBranding(profile).receiptPrefix;
  const d = inspection.visit?.date?.replace(/-/g, '') || '';
  const short = inspection.id?.slice(0, 6).toUpperCase() || '000000';
  return `${prefix}-${d}-${short}`;
}

export function defaultReceipt(inspection, profile = {}) {
  const subtotal = profile.montantDefaut || '';
  const taxes = computeTaxes(subtotal, profile.tauxTPS ?? 5, profile.tauxTVQ ?? 9.975);
  return {
    numero: '',
    description: inspection.templateLabel
      ? `Inspection — ${inspection.templateLabel}`
      : profile.descriptionServiceDefaut || 'Inspection de bâtiment d\'habitation',
    montantHT: subtotal ? String(subtotal) : '',
    tps: taxes.tps ? String(taxes.tps) : '',
    tvq: taxes.tvq ? String(taxes.tvq) : '',
    total: taxes.total ? String(taxes.total) : '',
    modePaiement: '',
    statutPaiement: 'paye',
    datePaiement: inspection.visit?.date || '',
    note: '',
  };
}

export function normalizeReceipt(inspection, profile = {}) {
  if (!inspection.receipt || typeof inspection.receipt !== 'object') {
    inspection.receipt = defaultReceipt(inspection, profile);
  }
  return inspection.receipt;
}

export function buildReceiptHtml(inspection, profile = {}) {
  const branding = resolveBranding(profile);
  const r = normalizeReceipt(inspection, profile);
  const client = inspection.site?.client || 'Client';
  const siteLine = fullAddress(inspection.site);
  const visitLine = formatVisitDateTime(inspection);
  const inspector = inspection.inspector || {};
  const num = receiptNumber(inspection, profile);
  const subtotal = parseAmount(r.montantHT);
  const tpsRate = profile.tauxTPS ?? 5;
  const tvqRate = profile.tauxTVQ ?? 9.975;
  const tps = r.tps !== '' ? parseAmount(r.tps) : computeTaxes(subtotal, tpsRate, tvqRate).tps;
  const tvq = r.tvq !== '' ? parseAmount(r.tvq) : computeTaxes(subtotal, tpsRate, tvqRate).tvq;
  const total =
    r.total !== '' ? parseAmount(r.total) : Math.round((subtotal + tps + tvq) * 100) / 100;

  return `<!DOCTYPE html>
<html lang="fr-CA">
<head>
  <meta charset="UTF-8" />
  <title>Reçu d'inspection — ${escapeHtml(num)}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: "Segoe UI", system-ui, sans-serif;
      color: #1a1a2e;
      max-width: 820px;
      margin: 0 auto;
      padding: 32px 40px;
      font-size: 10.5pt;
      line-height: 1.45;
    }
    ${ORG_LETTERHEAD_STYLES}
    .receipt-title {
      text-align: center;
      font-size: 18pt;
      font-weight: 700;
      color: #0d47a1;
      margin: 16px 0 8px;
      letter-spacing: 0.05em;
    }
    .receipt-meta {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 24px;
    }
    .meta-box h3 { margin: 0 0 8px; font-size: 9pt; text-transform: uppercase; color: #0d47a1; }
    .meta-box p { margin: 0 0 4px; }
    .muted { color: #666; font-size: 9pt; }

    /* ---- Format tableur ---- */
    .spreadsheet {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0 0;
      font-size: 10pt;
    }
    .spreadsheet th,
    .spreadsheet td {
      border: 1px solid #b0bec5;
      padding: 8px 12px;
      text-align: left;
    }
    .spreadsheet th {
      background: #e3edf7;
      font-weight: 700;
      font-size: 9pt;
      text-transform: uppercase;
      color: #0d47a1;
      letter-spacing: 0.03em;
    }
    .spreadsheet .col-label { width: 55%; }
    .spreadsheet .col-rate  { width: 15%; text-align: center; }
    .spreadsheet .col-amount { width: 30%; text-align: right; font-variant-numeric: tabular-nums; }
    .spreadsheet .row-subtotal td { background: #f5f9fc; font-weight: 600; }
    .spreadsheet .row-tax td { background: #fafafa; color: #455a64; }
    .spreadsheet .row-total td {
      background: #0d47a1;
      color: #fff;
      font-weight: 800;
      font-size: 12pt;
      letter-spacing: 0.02em;
    }
    .spreadsheet .formula {
      font-family: "Consolas", "Courier New", monospace;
      font-size: 8pt;
      color: #90a4ae;
      display: block;
      margin-top: 2px;
    }

    .payment-box {
      margin-top: 20px;
      padding: 14px;
      background: #f5f9fc;
      border-radius: 8px;
      border: 1px solid #d8e0ea;
    }
    .payment-box strong { color: #0d47a1; }
    .legal { font-size: 8pt; color: #666; margin-top: 20px; }
    .no-print { background: #e3f2fd; padding: 12px; border-radius: 8px; margin-bottom: 20px; font-size: 10pt; }
    @media print { body { padding: 20px; } .no-print { display: none; } }
  </style>
</head>
<body>
  <p class="no-print">Reçu d'inspection — Imprimez ou enregistrez en PDF.</p>

  ${orgLetterheadHtml(branding, { compact: true })}

  <h1 class="receipt-title">REÇU D'INSPECTION</h1>
  <p style="text-align:center;margin:0 0 20px;color:#444;">Nº <strong>${escapeHtml(num)}</strong></p>

  <div class="receipt-meta">
    <div class="meta-box">
      <h3>Émis à</h3>
      <p><strong>${escapeHtml(client)}</strong></p>
      ${inspection.site.courrielClient ? `<p>${escapeHtml(inspection.site.courrielClient)}</p>` : ''}
      ${inspection.site.telephoneClient ? `<p>${escapeHtml(inspection.site.telephoneClient)}</p>` : ''}
      ${siteLine !== '—' ? `<p>${escapeHtml(siteLine)}</p>` : ''}
    </div>
    <div class="meta-box">
      <h3>Émis par</h3>
      <p><strong>${escapeHtml(inspector.nom || '—')}</strong></p>
      <p>${escapeHtml(inspector.entreprise || '')}</p>
      <p>${escapeHtml([inspector.courriel, inspector.telephone].filter(Boolean).join(' · '))}</p>
      ${inspector.permis ? `<p class="muted">Permis : ${escapeHtml(inspector.permis)}</p>` : ''}
      ${inspector.certificatRbq ? `<p class="muted">Certificat RBQ : ${escapeHtml(inspector.certificatRbq)}</p>` : ''}
      ${branding.ibcMention ? `<p class="muted">${escapeHtml(branding.ibcMention)}</p>` : ''}
      <p style="margin-top:8px"><strong>Date du reçu :</strong> ${escapeHtml(r.datePaiement ? formatDateFr(r.datePaiement) : formatLetterDate(inspection))}</p>
    </div>
  </div>

  <table class="spreadsheet">
    <thead>
      <tr>
        <th class="col-label">Description</th>
        <th class="col-rate">Taux</th>
        <th class="col-amount">Montant</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="col-label">
          <strong>${escapeHtml(r.description)}</strong>
          ${siteLine !== '—' ? `<br /><span class="muted">${escapeHtml(siteLine)}</span>` : ''}
          ${visitLine !== '—' ? `<br /><span class="muted">Date de service : ${escapeHtml(visitLine)}</span>` : ''}
        </td>
        <td class="col-rate">—</td>
        <td class="col-amount">${formatMoney(subtotal)}</td>
      </tr>
      <tr class="row-subtotal">
        <td class="col-label">Sous-total avant taxes</td>
        <td class="col-rate"></td>
        <td class="col-amount">${formatMoney(subtotal)}</td>
      </tr>
      <tr class="row-tax">
        <td class="col-label">TPS (Taxe sur les produits et services)
          <span class="formula">= Sous-total × ${tpsRate} %</span>
        </td>
        <td class="col-rate">${tpsRate} %</td>
        <td class="col-amount">${formatMoney(tps)}</td>
      </tr>
      <tr class="row-tax">
        <td class="col-label">TVQ (Taxe de vente du Québec)
          <span class="formula">= (Sous-total + TPS) × ${tvqRate} %</span>
        </td>
        <td class="col-rate">${tvqRate} %</td>
        <td class="col-amount">${formatMoney(tvq)}</td>
      </tr>
      <tr class="row-total">
        <td class="col-label">TOTAL À PAYER</td>
        <td class="col-rate"></td>
        <td class="col-amount">${formatMoney(total)}</td>
      </tr>
    </tbody>
  </table>

  <div class="payment-box">
    <p><strong>Paiement :</strong> ${escapeHtml(paymentStatusLabel(r.statutPaiement))}</p>
    <p><strong>Mode :</strong> ${escapeHtml(paymentModeLabel(r.modePaiement) || '—')}</p>
    ${r.note ? `<p><strong>Note :</strong> ${escapeHtml(r.note)}</p>` : ''}
  </div>

  ${
    profile.noEntrepriseTPS || profile.noEntrepriseTVQ
      ? `<p class="legal">`
        + (profile.noEntrepriseTPS ? `No TPS : ${escapeHtml(profile.noEntrepriseTPS)}. ` : '')
        + (profile.noEntrepriseTVQ ? `No TVQ : ${escapeHtml(profile.noEntrepriseTVQ)}.` : '')
        + `</p>`
      : ''
  }

  <p class="legal">
    Ce reçu confirme la prestation de services d'inspection en bâtiment par
    <strong>${escapeHtml(inspector.nom || branding.entreprise || branding.appName)}</strong>.
    Il ne remplace pas le rapport d'inspection détaillé remis séparément.
    Conservez ce document pour vos dossiers comptables.
  </p>

  ${orgFooterHtml(branding)}

  <script>window.onload = () => window.print();</script>
</body>
</html>`;
}

function formatLetterDate(inspection) {
  const d = inspection.visit?.date;
  if (d) return formatDateFr(d);
  return new Date().toLocaleDateString('fr-CA', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function openReceipt(inspection, profile = {}) {
  normalizeReceipt(inspection, profile);
  const html = buildReceiptHtml(inspection, profile);
  const win = window.open('', '_blank');
  if (!win) {
    alert('Autorisez les fenêtres contextuelles pour ouvrir le reçu.');
    return;
  }
  win.document.write(html);
  win.document.close();
}
