// js/gmail-send.js
import { computeTaxes, normalizeReceipt } from './receipt-inspection.js';
import { resolveBranding } from './organization.js';
import { formatVisitDateTime } from './visit.js';

const _GMAIL_API = 'https://gmail.googleapis.com/gmail/v1/users/me/messages/send';
const _DEFAULT_SHEETS_URL = 'https://script.google.com/macros/s/AKfycby6XAR9XXWCFMqFAiyF7bjK5RQZxkoclv7KLVuDwJrW2YiNzeVlHr11pfnk3U7l_Nrv/exec';

function _esc(str) {
  return String(str ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function _fmt(n) {
  return new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD' }).format(n);
}

export function buildInvoiceHtml(inspection, profile = {}) {
  const r          = normalizeReceipt(inspection, profile);
  const branding   = resolveBranding(profile);
  const subtotal   = parseFloat(String(r.montantHT).replace(',', '.')) || 0;
  const tpsRate    = profile.tauxTPS ?? 5;
  const tvqRate    = profile.tauxTVQ ?? 9.975;
  const taxes      = computeTaxes(subtotal, tpsRate, tvqRate);
  const invoiceNum = inspection.invoiceNumber || inspection.site?.numeroDossier || '—';
  const date       = new Date().toLocaleDateString('fr-CA', { year: 'numeric', month: 'long', day: 'numeric' });
  const adresse    = [inspection.site?.adresse, inspection.site?.ville].filter(Boolean).join(', ') || '—';
  const visitDate  = formatVisitDateTime(inspection);
  const visitLabel = visitDate !== '—' ? ` · Visite du ${visitDate}` : '';
  const desc = (r.description || 'Inspection préachat résidentielle')
    .replace(/\s*[-—–]\s*(AIBQ|BNQ|IBC|CBQ|REIBH)[^,.]/gi, '')
    .trim();

  return `<!DOCTYPE html>
<html lang="fr-CA">
<head><meta charset="UTF-8"/><title>Facture ${_esc(invoiceNum)}</title></head>
<body style="font-family:'Segoe UI',system-ui,sans-serif;max-width:640px;margin:0 auto;padding:24px;color:#1a1a2e;background:#f8fafc;">
<div style="background:#0c3d5c;color:#fff;padding:1.25rem 1.5rem;border-radius:8px 8px 0 0;display:flex;justify-content:space-between;align-items:center;">
  <div>
    <div style="font-size:1.1rem;font-weight:700;letter-spacing:1px;">${_esc(branding.appName)}</div>
    <div style="font-size:0.78rem;opacity:0.8;">${_esc(profile.nom || 'Jean Eveillard Cazeau')} · Inspecteur certifié</div>
  </div>
  <div style="text-align:right;">
    <div style="font-family:monospace;font-size:1rem;font-weight:700;background:rgba(255,255,255,0.15);padding:3px 10px;border-radius:4px;">${_esc(invoiceNum)}</div>
    <div style="font-size:0.75rem;opacity:0.8;margin-top:3px;">${_esc(date)}</div>
  </div>
</div>
<div style="border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px;padding:1.25rem 1.5rem;background:#fff;">
  <div style="display:flex;justify-content:space-between;margin-bottom:1.25rem;gap:1rem;">
    <div>
      <div style="font-size:0.7rem;text-transform:uppercase;color:#94a3b8;margin-bottom:3px;">Facturé à</div>
      <div style="font-weight:600;">${_esc(inspection.site?.client || '—')}</div>
      <div style="color:#64748b;font-size:0.85rem;">${_esc(inspection.site?.courrielClient || '')}</div>
      <div style="color:#64748b;font-size:0.85rem;">${_esc(adresse)}</div>
    </div>
    <div style="text-align:right;">
      <div style="font-size:0.7rem;text-transform:uppercase;color:#94a3b8;margin-bottom:3px;">Inspecteur</div>
      <div style="font-weight:600;">${_esc(profile.nom || 'Jean Eveillard Cazeau')}</div>
      <div style="color:#64748b;font-size:0.85rem;">${_esc(profile.courriel || 'kzoinspectpro@gmail.com')}</div>
      <div style="color:#64748b;font-size:0.85rem;">${_esc(profile.telephone || '')}</div>
    </div>
  </div>
  <table style="width:100%;border-collapse:collapse;margin-bottom:1.25rem;font-size:0.88rem;">
    <thead><tr style="background:#f1f5f9;">
      <th style="text-align:left;padding:7px 10px;color:#475569;font-size:0.72rem;text-transform:uppercase;border:1px solid #e2e8f0;">Description</th>
      <th style="text-align:right;padding:7px 10px;color:#475569;font-size:0.72rem;text-transform:uppercase;border:1px solid #e2e8f0;">Montant</th>
    </tr></thead>
    <tbody><tr>
      <td style="padding:9px 10px;border:1px solid #e2e8f0;">
        <div style="font-weight:600;">${_esc(desc)}</div>
        <div style="color:#64748b;font-size:0.8rem;">${_esc(adresse)}${_esc(visitLabel)}</div>
      </td>
      <td style="padding:9px 10px;text-align:right;border:1px solid #e2e8f0;">${_fmt(taxes.subtotal)}</td>
    </tr></tbody>
  </table>
  <div style="display:flex;flex-direction:column;align-items:flex-end;gap:3px;margin-bottom:1.25rem;">
    <div style="display:flex;gap:3rem;color:#64748b;font-size:0.85rem;"><span>Sous-total</span><span>${_fmt(taxes.subtotal)}</span></div>
    <div style="display:flex;gap:3rem;color:#64748b;font-size:0.85rem;"><span>TPS (${tpsRate} %)</span><span>${_fmt(taxes.tps)}</span></div>
    <div style="display:flex;gap:3rem;color:#64748b;font-size:0.85rem;"><span>TVQ (${tvqRate} %)</span><span>${_fmt(taxes.tvq)}</span></div>
    <div style="display:flex;gap:3rem;font-weight:700;font-size:1rem;color:#0c3d5c;border-top:2px solid #0c3d5c;padding-top:5px;margin-top:3px;"><span>TOTAL</span><span>${_fmt(taxes.total)}</span></div>
  </div>
  <div style="background:#f8fafc;border-left:3px solid #0c3d5c;padding:0.65rem 0.9rem;border-radius:0 6px 6px 0;font-size:0.85rem;color:#475569;">
    ${_esc(profile.messageRemerciement || "Merci de votre confiance. Pour toute question, n'hésitez pas à nous contacter.")}
  </div>
  <div style="margin-top:1.25rem;text-align:center;color:#94a3b8;font-size:0.72rem;border-top:1px solid #f1f5f9;padding-top:0.9rem;">
    ${_esc(branding.appName)} · ${_esc(profile.nom || 'Jean Eveillard Cazeau')} · ${_esc(profile.courriel || 'kzoinspectpro@gmail.com')}
  </div>
</div>
</body></html>`;
}

function _toRfc2822Base64(from, to, subject, htmlBody) {
  const subjectB64 = btoa(unescape(encodeURIComponent(subject)));
  const msg = [
    `From: KZO Inspect <${from}>`,
    `To: ${to}`,
    `Subject: =?UTF-8?B?${subjectB64}?=`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=UTF-8',
    '',
    htmlBody,
  ].join('\r\n');
  return btoa(unescape(encodeURIComponent(msg)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function sendInvoiceEmail(to, subject, htmlBody, token) {
  const raw = _toRfc2822Base64('me', to, subject, htmlBody);
  const res = await fetch(_GMAIL_API, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ raw }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Gmail API ${res.status}`);
  }
  return res.json();
}

export function sendReceiptToSheets(inspection, profile = {}) {
  const url = profile.sheetsWebhookUrl || _DEFAULT_SHEETS_URL;
  if (!url) return;
  const r       = normalizeReceipt(inspection, profile);
  const subtotal = parseFloat(String(r.montantHT).replace(',', '.')) || 0;
  const taxes   = computeTaxes(subtotal, profile.tauxTPS ?? 5, profile.tauxTVQ ?? 9.975);
  const payload = {
    sheet:            'Reçus',
    date_envoi:       new Date().toLocaleDateString('fr-CA'),
    numero_facture:   inspection.invoiceNumber || '—',
    client:           inspection.site?.client || '',
    courriel_client:  inspection.site?.courrielClient || '',
    adresse:          [inspection.site?.adresse, inspection.site?.ville].filter(Boolean).join(', '),
    date_inspection:  formatVisitDateTime(inspection),
    montant_ht:       subtotal.toFixed(2),
    tps:              taxes.tps.toFixed(2),
    tvq:              taxes.tvq.toFixed(2),
    total:            taxes.total.toFixed(2),
    statut_paiement:  inspection.paymentStatus || 'pending',
  };
  fetch(url, {
    method: 'POST', mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).catch((e) => console.warn('[GmailSend] Sheets webhook error:', e));
}
