# Facturation automatique + Gmail — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajouter numérotation automatique des factures (KZO-2026-001), envoi par Gmail API depuis kzoinspectpro@gmail.com, et registre des reçus dans Google Sheets.

**Architecture:** Deux nouveaux modules JS (google-auth.js, gmail-send.js) ajoutés dans le IIFE de bundle.js. L'OAuth2 utilise Google Identity Services (GIS) avec le Client ID existant du dossier JEC. Chaque changement de fichier source doit être répercuté dans js/bundle.js.

**Tech Stack:** Vanilla JS ES modules, Google Identity Services (GIS), Gmail API REST, Google Sheets Apps Script webhook.

---

## Fichiers touchés

| Fichier | Action |
|---|---|
| `js/google-auth.js` | CRÉER — OAuth2 GIS |
| `js/gmail-send.js` | CRÉER — Gmail API + Sheets webhook |
| `js/storage.js` | MODIFIER — nextInvoiceNumber() |
| `js/app.js` | MODIFIER — trigger numérotation, profil Google, panneau envoi |
| `js/receipt-inspection.js` | MODIFIER — afficher invoiceNumber |
| `js/bundle.js` | MODIFIER — sync manuelle de tout |
| `index.html` | MODIFIER — ajouter script GIS |

---

## Task 1 : nextInvoiceNumber dans storage.js

**Contexte :** `storage.js` gère le localStorage. La fonction génère un numéro `KZO-2026-001` et incrémente le compteur dans le profil.

**Fichiers :**
- Modifier : `js/storage.js` (après la fonction `nextDossierNumber`, vers ligne 75)
- Sync : `js/bundle.js`

- [ ] **Étape 1 : Ajouter la fonction dans js/storage.js**

Lire la fonction `nextDossierNumber` (ligne ~68) pour situer l'insertion. Ajouter juste après (après la ligne fermante `}`):

```js
export function nextInvoiceNumber(profile) {
  const year = new Date().getFullYear();
  if (!profile.invoiceYear || profile.invoiceYear !== year) {
    profile.invoiceCounter = 1;
    profile.invoiceYear = year;
  } else {
    profile.invoiceCounter = (profile.invoiceCounter || 0) + 1;
  }
  const num = String(profile.invoiceCounter).padStart(3, '0');
  saveProfile(profile);
  return `KZO-${year}-${num}`;
}
```

- [ ] **Étape 2 : Sync bundle.js**

Dans `js/bundle.js`, chercher la fonction `nextDossierNumber` (unique). Ajouter la même fonction `nextInvoiceNumber` juste après elle (sans le mot-clé `export`).

Dans bundle.js, `saveProfile` est déjà défini dans le scope — l'appel direct fonctionne.

---

## Task 2 : Créer js/google-auth.js

**Contexte :** OAuth2 via Google Identity Services. Le Client ID existant du projet JEC est `18973787304-0vm4pu6383jn2vni2h996i0ri62iu21s.apps.googleusercontent.com`. Ce module gère le token pour Gmail et Drive. Adapté de `C:\Users\jeane\Desktop\Amboul\JEC\google_drive.js`.

**Fichiers :**
- Créer : `js/google-auth.js`
- Sync : `js/bundle.js`

- [ ] **Étape 1 : Créer js/google-auth.js**

```js
// js/google-auth.js
// OAuth2 Google Identity Services — scopes gmail.send + drive.file
// Adapté de Amboul/JEC/google_drive.js

const _GA_TOKEN_KEY  = 'kzo_google_token';
const _GA_EXPIRY_KEY = 'kzo_google_expiry';
const _GA_SCOPES     = 'https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/drive.file';

let _gaTokenClient = null;
let _gaResolve     = null;
let _gaReject      = null;

export function initGoogleAuth(clientId) {
  if (typeof google === 'undefined' || !google.accounts?.oauth2) return false;
  if (!clientId) return false;
  _gaTokenClient = google.accounts.oauth2.initTokenClient({
    client_id: clientId,
    scope: _GA_SCOPES,
    callback: (response) => {
      if (response.error) {
        _gaReject?.(new Error(response.error));
      } else {
        sessionStorage.setItem(_GA_TOKEN_KEY, response.access_token);
        sessionStorage.setItem(_GA_EXPIRY_KEY, String(Date.now() + (response.expires_in - 60) * 1000));
        _gaResolve?.();
      }
      _gaResolve = null;
      _gaReject  = null;
    },
  });
  return true;
}

export function isGoogleConnected() {
  const token  = sessionStorage.getItem(_GA_TOKEN_KEY);
  const expiry = parseInt(sessionStorage.getItem(_GA_EXPIRY_KEY) || '0', 10);
  return !!token && Date.now() < expiry;
}

export function getGoogleToken() {
  return sessionStorage.getItem(_GA_TOKEN_KEY) || '';
}

export function googleAuthenticate(clientId) {
  if (!_gaTokenClient) initGoogleAuth(clientId);
  if (isGoogleConnected()) return Promise.resolve();
  if (!_gaTokenClient) {
    return Promise.reject(new Error(
      'Google Identity Services non disponible. Vérifiez votre connexion internet et rechargez la page.'
    ));
  }
  return new Promise((resolve, reject) => {
    _gaResolve = resolve;
    _gaReject  = reject;
    _gaTokenClient.requestAccessToken({ prompt: '' });
  });
}

export function googleDisconnect() {
  const token = sessionStorage.getItem(_GA_TOKEN_KEY);
  if (token && typeof google !== 'undefined') {
    google.accounts.oauth2.revoke(token, () => {});
  }
  sessionStorage.removeItem(_GA_TOKEN_KEY);
  sessionStorage.removeItem(_GA_EXPIRY_KEY);
}
```

- [ ] **Étape 2 : Ajouter dans bundle.js**

Dans `js/bundle.js`, juste avant la ligne `route = parseHash();` (fin du IIFE), insérer le bloc suivant (sans les `export`):

```js
  // js/google-auth.js
  const _GA_TOKEN_KEY  = 'kzo_google_token';
  const _GA_EXPIRY_KEY = 'kzo_google_expiry';
  const _GA_SCOPES     = 'https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/drive.file';
  let _gaTokenClient = null;
  let _gaResolve     = null;
  let _gaReject      = null;
  function initGoogleAuth(clientId) {
    if (typeof google === 'undefined' || !google.accounts?.oauth2) return false;
    if (!clientId) return false;
    _gaTokenClient = google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: _GA_SCOPES,
      callback: (response) => {
        if (response.error) { _gaReject?.(new Error(response.error)); }
        else {
          sessionStorage.setItem(_GA_TOKEN_KEY, response.access_token);
          sessionStorage.setItem(_GA_EXPIRY_KEY, String(Date.now() + (response.expires_in - 60) * 1000));
          _gaResolve?.();
        }
        _gaResolve = null; _gaReject = null;
      },
    });
    return true;
  }
  function isGoogleConnected() {
    const token  = sessionStorage.getItem(_GA_TOKEN_KEY);
    const expiry = parseInt(sessionStorage.getItem(_GA_EXPIRY_KEY) || '0', 10);
    return !!token && Date.now() < expiry;
  }
  function getGoogleToken() { return sessionStorage.getItem(_GA_TOKEN_KEY) || ''; }
  function googleAuthenticate(clientId) {
    if (!_gaTokenClient) initGoogleAuth(clientId);
    if (isGoogleConnected()) return Promise.resolve();
    if (!_gaTokenClient) return Promise.reject(new Error('Google Identity Services non disponible. Vérifiez votre connexion internet.'));
    return new Promise((resolve, reject) => {
      _gaResolve = resolve; _gaReject = reject;
      _gaTokenClient.requestAccessToken({ prompt: '' });
    });
  }
  function googleDisconnect() {
    const token = sessionStorage.getItem(_GA_TOKEN_KEY);
    if (token && typeof google !== 'undefined') google.accounts.oauth2.revoke(token, () => {});
    sessionStorage.removeItem(_GA_TOKEN_KEY);
    sessionStorage.removeItem(_GA_EXPIRY_KEY);
  }
```

---

## Task 3 : Créer js/gmail-send.js

**Contexte :** Construit le HTML de la facture (sans mention de norme), envoie via Gmail API REST, et poste les données dans Google Sheets. Dans bundle.js, les fonctions importées (`computeTaxes`, `normalizeReceipt`, `resolveBranding`, `formatVisitDateTime`) sont déjà dans le scope — pas besoin de les redéclarer.

**Fichiers :**
- Créer : `js/gmail-send.js`
- Sync : `js/bundle.js`

- [ ] **Étape 1 : Créer js/gmail-send.js**

```js
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
  // Supprimer mention de la norme dans la description
  const desc = (r.description || 'Inspection préachat résidentielle')
    .replace(/\s*[-—–]\s*(AIBQ|BNQ|IBC|CBQ|REIBH)[^,.]*/gi, '')
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

export async function sendInvoiceEmail(to, subject, htmlBody, token, fromEmail = 'me') {
  const raw = _toRfc2822Base64(fromEmail, to, subject, htmlBody);
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
```

- [ ] **Étape 2 : Ajouter dans bundle.js**

Dans `js/bundle.js`, juste après le bloc `// js/google-auth.js` ajouté à la Task 2, insérer le bloc suivant. Les fonctions `computeTaxes`, `normalizeReceipt`, `resolveBranding`, `formatVisitDateTime` sont déjà dans le scope IIFE — ne pas les redéclarer.

```js
  // js/gmail-send.js
  const _GMAIL_API = 'https://gmail.googleapis.com/gmail/v1/users/me/messages/send';
  const _DEFAULT_SHEETS_URL = 'https://script.google.com/macros/s/AKfycby6XAR9XXWCFMqFAiyF7bjK5RQZxkoclv7KLVuDwJrW2YiNzeVlHr11pfnk3U7l_Nrv/exec';
  function _esc(str) {
    return String(str ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
  function _fmt(n) {
    return new Intl.NumberFormat('fr-CA',{style:'currency',currency:'CAD'}).format(n);
  }
  function buildInvoiceHtml(inspection, profile) {
    profile = profile || {};
    const r = normalizeReceipt(inspection, profile);
    const branding = resolveBranding(profile);
    const subtotal = parseFloat(String(r.montantHT).replace(',','.')) || 0;
    const tpsRate = profile.tauxTPS ?? 5;
    const tvqRate = profile.tauxTVQ ?? 9.975;
    const taxes = computeTaxes(subtotal, tpsRate, tvqRate);
    const invoiceNum = inspection.invoiceNumber || inspection.site?.numeroDossier || '—';
    const date = new Date().toLocaleDateString('fr-CA',{year:'numeric',month:'long',day:'numeric'});
    const adresse = [inspection.site?.adresse,inspection.site?.ville].filter(Boolean).join(', ') || '—';
    const visitDate = formatVisitDateTime(inspection);
    const visitLabel = visitDate !== '—' ? ` · Visite du ${visitDate}` : '';
    const desc = (r.description || 'Inspection préachat résidentielle')
      .replace(/\s*[-—–]\s*(AIBQ|BNQ|IBC|CBQ|REIBH)[^,.]/gi,'').trim();
    return `<!DOCTYPE html><html lang="fr-CA"><head><meta charset="UTF-8"/><title>Facture ${_esc(invoiceNum)}</title></head><body style="font-family:'Segoe UI',system-ui,sans-serif;max-width:640px;margin:0 auto;padding:24px;color:#1a1a2e;background:#f8fafc;"><div style="background:#0c3d5c;color:#fff;padding:1.25rem 1.5rem;border-radius:8px 8px 0 0;display:flex;justify-content:space-between;align-items:center;"><div><div style="font-size:1.1rem;font-weight:700;letter-spacing:1px;">${_esc(branding.appName)}</div><div style="font-size:0.78rem;opacity:0.8;">${_esc(profile.nom||'Jean Eveillard Cazeau')} · Inspecteur certifié</div></div><div style="text-align:right;"><div style="font-family:monospace;font-size:1rem;font-weight:700;background:rgba(255,255,255,0.15);padding:3px 10px;border-radius:4px;">${_esc(invoiceNum)}</div><div style="font-size:0.75rem;opacity:0.8;margin-top:3px;">${_esc(date)}</div></div></div><div style="border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px;padding:1.25rem 1.5rem;background:#fff;"><div style="display:flex;justify-content:space-between;margin-bottom:1.25rem;gap:1rem;"><div><div style="font-size:0.7rem;text-transform:uppercase;color:#94a3b8;margin-bottom:3px;">Facturé à</div><div style="font-weight:600;">${_esc(inspection.site?.client||'—')}</div><div style="color:#64748b;font-size:0.85rem;">${_esc(inspection.site?.courrielClient||'')}</div><div style="color:#64748b;font-size:0.85rem;">${_esc(adresse)}</div></div><div style="text-align:right;"><div style="font-size:0.7rem;text-transform:uppercase;color:#94a3b8;margin-bottom:3px;">Inspecteur</div><div style="font-weight:600;">${_esc(profile.nom||'Jean Eveillard Cazeau')}</div><div style="color:#64748b;font-size:0.85rem;">${_esc(profile.courriel||'kzoinspectpro@gmail.com')}</div><div style="color:#64748b;font-size:0.85rem;">${_esc(profile.telephone||'')}</div></div></div><table style="width:100%;border-collapse:collapse;margin-bottom:1.25rem;font-size:0.88rem;"><thead><tr style="background:#f1f5f9;"><th style="text-align:left;padding:7px 10px;color:#475569;font-size:0.72rem;text-transform:uppercase;border:1px solid #e2e8f0;">Description</th><th style="text-align:right;padding:7px 10px;color:#475569;font-size:0.72rem;text-transform:uppercase;border:1px solid #e2e8f0;">Montant</th></tr></thead><tbody><tr><td style="padding:9px 10px;border:1px solid #e2e8f0;"><div style="font-weight:600;">${_esc(desc)}</div><div style="color:#64748b;font-size:0.8rem;">${_esc(adresse)}${_esc(visitLabel)}</div></td><td style="padding:9px 10px;text-align:right;border:1px solid #e2e8f0;">${_fmt(taxes.subtotal)}</td></tr></tbody></table><div style="display:flex;flex-direction:column;align-items:flex-end;gap:3px;margin-bottom:1.25rem;"><div style="display:flex;gap:3rem;color:#64748b;font-size:0.85rem;"><span>Sous-total</span><span>${_fmt(taxes.subtotal)}</span></div><div style="display:flex;gap:3rem;color:#64748b;font-size:0.85rem;"><span>TPS (${tpsRate} %)</span><span>${_fmt(taxes.tps)}</span></div><div style="display:flex;gap:3rem;color:#64748b;font-size:0.85rem;"><span>TVQ (${tvqRate} %)</span><span>${_fmt(taxes.tvq)}</span></div><div style="display:flex;gap:3rem;font-weight:700;font-size:1rem;color:#0c3d5c;border-top:2px solid #0c3d5c;padding-top:5px;margin-top:3px;"><span>TOTAL</span><span>${_fmt(taxes.total)}</span></div></div><div style="background:#f8fafc;border-left:3px solid #0c3d5c;padding:0.65rem 0.9rem;border-radius:0 6px 6px 0;font-size:0.85rem;color:#475569;">${_esc(profile.messageRemerciement||"Merci de votre confiance. Pour toute question, n'hésitez pas à nous contacter.")}</div><div style="margin-top:1.25rem;text-align:center;color:#94a3b8;font-size:0.72rem;border-top:1px solid #f1f5f9;padding-top:0.9rem;">${_esc(branding.appName)} · ${_esc(profile.nom||'Jean Eveillard Cazeau')} · ${_esc(profile.courriel||'kzoinspectpro@gmail.com')}</div></div></body></html>`;
  }
  function _toRfc2822Base64(from, to, subject, htmlBody) {
    const subjectB64 = btoa(unescape(encodeURIComponent(subject)));
    const msg = [`From: KZO Inspect <${from}>`,`To: ${to}`,`Subject: =?UTF-8?B?${subjectB64}?=`,'MIME-Version: 1.0','Content-Type: text/html; charset=UTF-8','',htmlBody].join('\r\n');
    return btoa(unescape(encodeURIComponent(msg))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
  }
  async function sendInvoiceEmail(to, subject, htmlBody, token) {
    const raw = _toRfc2822Base64('me', to, subject, htmlBody);
    const res = await fetch(_GMAIL_API,{method:'POST',headers:{'Authorization':`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify({raw})});
    if (!res.ok) { const err = await res.json().catch(()=>({})); throw new Error(err.error?.message||`Gmail API ${res.status}`); }
    return res.json();
  }
  function sendReceiptToSheets(inspection, profile) {
    profile = profile || {};
    const url = profile.sheetsWebhookUrl || _DEFAULT_SHEETS_URL;
    if (!url) return;
    const r = normalizeReceipt(inspection, profile);
    const subtotal = parseFloat(String(r.montantHT).replace(',','.')) || 0;
    const taxes = computeTaxes(subtotal, profile.tauxTPS ?? 5, profile.tauxTVQ ?? 9.975);
    const payload = {sheet:'Reçus',date_envoi:new Date().toLocaleDateString('fr-CA'),numero_facture:inspection.invoiceNumber||'—',client:inspection.site?.client||'',courriel_client:inspection.site?.courrielClient||'',adresse:[inspection.site?.adresse,inspection.site?.ville].filter(Boolean).join(', '),date_inspection:formatVisitDateTime(inspection),montant_ht:subtotal.toFixed(2),tps:taxes.tps.toFixed(2),tvq:taxes.tvq.toFixed(2),total:taxes.total.toFixed(2),statut_paiement:inspection.paymentStatus||'pending'};
    fetch(url,{method:'POST',mode:'no-cors',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)}).catch(e=>console.warn('[GmailSend] Sheets error:',e));
  }
```

---

## Task 4 : GIS script dans index.html

**Contexte :** Le script GIS doit être chargé avant bundle.js pour que `google.accounts` soit disponible.

**Fichiers :**
- Modifier : `index.html`

- [ ] **Étape 1 : Ajouter le script GIS**

Dans `index.html`, juste AVANT la ligne `<script src="js/bundle.js"></script>`, ajouter :

```html
  <script src="https://accounts.google.com/gsi/client" async defer></script>
```

---

## Task 5 : Trigger auto-numérotation dans app.js

**Contexte :** Quand l'inspecteur passe le statut à « Terminée », l'app assigne automatiquement un numéro de facture si ce n'est pas déjà fait. Le champ `courrielClient` existe déjà — ne pas le modifier.

**Fichiers :**
- Modifier : `js/app.js` ligne ~981 (handler `status-select` onchange)
- Sync : `js/bundle.js`

- [ ] **Étape 1 : Modifier le handler dans js/app.js**

Lire les lignes 981–987. Le code actuel :

```js
  document.getElementById('status-select').onchange = (e) => {
    inspection.status = e.target.value;
    if (e.target.value === 'terminee' && !inspection.completedAt) {
      inspection.completedAt = new Date().toISOString();
    }
    scheduleAutosave(inspection, tab, panel);
  };
```

Remplacer par :

```js
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
```

- [ ] **Étape 2 : Ajouter l'import de nextInvoiceNumber dans js/app.js**

En haut de `js/app.js`, dans le bloc d'import de `./storage.js`, ajouter `nextInvoiceNumber` à la liste :

```js
import {
  loadInspections,
  upsertInspection,
  getInspection,
  deleteInspection,
  duplicateInspection,
  nextDossierNumber,
  nextInvoiceNumber,       // ← ajouter ici
  computeGlobalStats,
  loadProfile,
  saveProfile,
  computeStats,
  INSPECTOR_NAME,
  inspectorFieldsFromProfile,
} from './storage.js';
```

- [ ] **Étape 3 : Ajouter imports google-auth et gmail-send dans js/app.js**

En bas des imports (après le dernier import), ajouter :

```js
import { initGoogleAuth, isGoogleConnected, googleAuthenticate, googleDisconnect, getGoogleToken } from './google-auth.js';
import { buildInvoiceHtml, sendInvoiceEmail, sendReceiptToSheets } from './gmail-send.js';
```

- [ ] **Étape 4 : Sync bundle.js — trigger**

Dans `js/bundle.js`, chercher le bloc du handler `status-select` (identique à l'AVANT de l'étape 1) et remplacer par l'APRÈS. Dans bundle.js, `nextInvoiceNumber`, `loadProfile`, `toast` sont déjà dans le scope.

---

## Task 6 : Section Google dans renderProfile (app.js)

**Contexte :** Ajouter un fieldset « Intégration Google » dans le profil pour configurer le Client ID et connecter/déconnecter Google.

**Fichiers :**
- Modifier : `js/app.js` — fonction `renderProfile` (~ligne 1633, juste avant `<button type="submit"`)
- Modifier : `js/app.js` — fonction qui sauvegarde le profil (chercher `form-profile submit`)
- Sync : `js/bundle.js`

- [ ] **Étape 1 : Ajouter le fieldset Google dans renderProfile**

Dans `js/app.js`, repérer la ligne `<button type="submit" class="btn btn--primary">Enregistrer le profil</button>` (~ligne 1634). Juste avant cette ligne, insérer :

```js
      <fieldset>
        <legend>Intégration Google (Gmail &amp; Drive)</legend>
        <p class="form-hint form-hint--compact">Permet d'envoyer les factures depuis kzoinspectpro@gmail.com et de synchroniser vers Google Drive.</p>
        <label>Google Client ID
          <input class="input" name="googleClientId" value="${escapeAttr(p.googleClientId || '18973787304-0vm4pu6383jn2vni2h996i0ri62iu21s.apps.googleusercontent.com')}" placeholder="xxxxx.apps.googleusercontent.com" />
        </label>
        <label>URL webhook Google Sheets (registre des reçus)
          <input class="input" name="sheetsWebhookUrl" value="${escapeAttr(p.sheetsWebhookUrl || 'https://script.google.com/macros/s/AKfycby6XAR9XXWCFMqFAiyF7bjK5RQZxkoclv7KLVuDwJrW2YiNzeVlHr11pfnk3U7l_Nrv/exec')}" />
        </label>
        <div id="google-connect-status" style="margin-top:0.5rem;"></div>
      </fieldset>
```

- [ ] **Étape 2 : Rendre le fieldset Google interactif après rendu**

Dans `js/app.js`, dans le bloc qui bind les événements du profil (chercher `form-profile` dans les addEventListener, vers ligne 1660+), ajouter après le submit handler :

```js
  // Afficher statut connexion Google + bouton
  function _renderGoogleStatus() {
    const el = document.getElementById('google-connect-status');
    if (!el) return;
    const connected = isGoogleConnected();
    el.innerHTML = connected
      ? `<span style="color:#166534;">✅ Connecté à Google</span> <button type="button" class="btn btn--ghost btn--sm" id="btn-google-disconnect">Déconnecter</button>`
      : `<button type="button" class="btn btn--secondary btn--sm" id="btn-google-connect">🔗 Connecter Google</button>`;
    document.getElementById('btn-google-connect')?.addEventListener('click', async () => {
      const clientId = document.querySelector('[name="googleClientId"]')?.value || '';
      try { await googleAuthenticate(clientId); _renderGoogleStatus(); toast('Google connecté', 'success'); }
      catch (err) { toast('Connexion Google échouée : ' + err.message, 'error'); }
    });
    document.getElementById('btn-google-disconnect')?.addEventListener('click', () => {
      googleDisconnect(); _renderGoogleStatus(); toast('Google déconnecté', 'info');
    });
  }
  _renderGoogleStatus();
```

- [ ] **Étape 3 : Sauvegarder les nouveaux champs dans le handler submit du profil**

Dans `js/app.js`, chercher le bloc qui lit les champs du formulaire profil lors du submit (chercher `form.get('permis')` ou équivalent). Ajouter la lecture des nouveaux champs :

```js
      googleClientId:    fd.get('googleClientId')    || '',
      sheetsWebhookUrl:  fd.get('sheetsWebhookUrl')  || '',
```

- [ ] **Étape 4 : Sync bundle.js**

Appliquer les mêmes modifications dans `js/bundle.js` (chercher le bloc renderProfile et son handler submit).

---

## Task 7 : Panneau envoi facture dans renderInspect (app.js)

**Contexte :** Ajouter un bouton « 📧 Facture » dans la barre d'action de l'inspection. Quand cliqué, affiche un panneau dans `mainContent` avec le résumé de la facture et le formulaire d'envoi.

**Fichiers :**
- Modifier : `js/app.js` — action-bar (~ligne 448) + `bindInspectEvents` (~ligne 960+)
- Sync : `js/bundle.js`

- [ ] **Étape 1 : Ajouter le bouton « 📧 Facture » dans l'action-bar**

Dans `js/app.js`, dans le template de `renderInspect`, chercher la ligne du bouton `btn-receipt` :

```js
      <button type="button" class="btn btn--secondary" id="btn-receipt">Reçu</button>
```

Ajouter juste après :

```js
      <button type="button" class="btn btn--secondary" id="btn-facture">📧 Facture</button>
```

- [ ] **Étape 2 : Ajouter la fonction renderInvoicePanel dans js/app.js**

Ajouter cette nouvelle fonction dans `js/app.js` (juste avant `function renderProfile`):

```js
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
          <option value="pending" ${(inspection.paymentStatus || 'pending') === 'pending' ? 'selected' : ''}>⏳ En attente</option>
          <option value="paid"    ${inspection.paymentStatus === 'paid'    ? 'selected' : ''}>✅ Payé</option>
          <option value="overdue" ${inspection.paymentStatus === 'overdue' ? 'selected' : ''}>⚠️ En retard</option>
        </select>
      </label>
      <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:1rem;">
        <strong style="color:#1e40af;">📧 Envoyer la facture par courriel</strong>
        <div style="margin-top:0.75rem;">
          <label style="font-size:0.85rem;color:#475569;">À (courriel du client)</label>
          <input class="input" id="invoice-to" type="email" value="${escapeAttr(inspection.site?.courrielClient || '')}" placeholder="client@exemple.com" style="margin-top:0.25rem;" />
        </div>
        <div style="margin-top:0.5rem;">
          <label style="font-size:0.85rem;color:#475569;">Sujet</label>
          <input class="input" id="invoice-subject" value="${escapeAttr(`Facture ${invoiceNum} — Inspection préachat — ${inspection.site?.adresse || ''}`)}" style="margin-top:0.25rem;" />
        </div>
        <div style="display:flex;gap:0.75rem;justify-content:flex-end;margin-top:0.75rem;">
          <button type="button" class="btn btn--ghost btn--sm" id="btn-invoice-preview">Aperçu</button>
          <button type="button" class="btn btn--primary btn--sm" id="btn-invoice-send" ${!connected ? '' : ''}>
            📤 Envoyer depuis kzoinspectpro@gmail.com
          </button>
        </div>
        <p style="font-size:0.78rem;color:#6b7280;margin:0.5rem 0 0;">
          ${connected ? '🔐 Connecté à Google' : '⚠️ Non connecté — <a href="#profile">Profil → Intégration Google</a>'}
        </p>
      </div>
    </div>`;
}
```

Note : `computeTaxes` et `normalizeReceipt` sont **déjà importés** dans `app.js` (ligne 47) — ne pas modifier les imports de receipt-inspection.js.

Ajouter aussi la fonction utilitaire `formatMoney` dans app.js (si pas déjà présente) :

```js
function formatMoney(n) {
  return new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD' }).format(n || 0);
}
```

- [ ] **Étape 3 : Binder le bouton btn-facture dans bindInspectEvents**

Dans `js/app.js`, dans `bindInspectEvents` (vers ligne 960+), chercher le handler `btn-receipt`. Juste après, ajouter :

```js
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
      btn.textContent = '⏳ Envoi…';
      try {
        const profile = loadProfile();
        await googleAuthenticate(profile.googleClientId || '18973787304-0vm4pu6383jn2vni2h996i0ri62iu21s.apps.googleusercontent.com');
        const html  = buildInvoiceHtml(inspection, profile);
        const token = getGoogleToken();
        await sendInvoiceEmail(to, subject, html, token);
        inspection.invoiceSentAt = new Date().toISOString();
        upsertInspection(inspection);
        sendReceiptToSheets(inspection, profile);
        toast('✅ Facture envoyée à ' + to, 'success');
        btn.textContent = '✅ Envoyée';
      } catch (err) {
        toast('❌ Erreur : ' + err.message, 'error');
        btn.disabled = false;
        btn.textContent = '📤 Envoyer depuis kzoinspectpro@gmail.com';
      }
    });
  });
```

- [ ] **Étape 4 : Sync bundle.js**

Appliquer les mêmes modifications dans `js/bundle.js`. Dans bundle.js :
- `buildInvoiceHtml`, `sendInvoiceEmail`, `sendReceiptToSheets`, `googleAuthenticate`, `getGoogleToken` sont déjà dans le scope (ajoutés tasks 2 et 3)
- `computeTaxes`, `normalizeReceipt`, `resolveBranding`, `formatVisitDateTime` sont déjà dans le scope
- Ajouter `renderInvoicePanel` et les handlers dans le bloc correspondant à app.js

---

## Task 8 : Afficher invoiceNumber dans le reçu imprimable

**Contexte :** Quand l'inspection a un `invoiceNumber`, l'utiliser comme numéro de reçu dans `buildReceiptHtml`.

**Fichiers :**
- Modifier : `js/receipt-inspection.js` — fonction `receiptNumber` (~ligne 64)
- Sync : `js/bundle.js`

- [ ] **Étape 1 : Modifier receiptNumber dans receipt-inspection.js**

La fonction actuelle (ligne 64) :

```js
function receiptNumber(inspection, profile = {}) {
  if (inspection.receipt?.numero) return inspection.receipt.numero;
  if (inspection.site?.numeroDossier) return inspection.site.numeroDossier;
  const prefix = resolveBranding(profile).receiptPrefix;
  const d = inspection.visit?.date?.replace(/-/g, '') || '';
  const short = inspection.id?.slice(0, 6).toUpperCase() || '000000';
  return `${prefix}-${d}-${short}`;
}
```

Remplacer par :

```js
function receiptNumber(inspection, profile = {}) {
  if (inspection.invoiceNumber) return inspection.invoiceNumber;
  if (inspection.receipt?.numero) return inspection.receipt.numero;
  if (inspection.site?.numeroDossier) return inspection.site.numeroDossier;
  const prefix = resolveBranding(profile).receiptPrefix;
  const d = inspection.visit?.date?.replace(/-/g, '') || '';
  const short = inspection.id?.slice(0, 6).toUpperCase() || '000000';
  return `${prefix}-${d}-${short}`;
}
```

- [ ] **Étape 2 : Sync bundle.js**

Dans `js/bundle.js`, chercher la fonction `receiptNumber` (unique) et appliquer la même modification (ajouter la ligne `if (inspection.invoiceNumber) return inspection.invoiceNumber;` en premier).

---

## Vérification finale

- [ ] Lancer l'app : `Lancer KZO Inspect.bat` → ouvrir `http://127.0.0.1:8775`
- [ ] Créer une inspection, remplir le courriel client dans Info
- [ ] Passer le statut à « Terminée » → toast `Facture KZO-2026-001 générée` doit apparaître
- [ ] Cliquer « 📧 Facture » → le panneau s'affiche avec les montants et le champ courriel pré-rempli
- [ ] Cliquer « Aperçu » → la facture HTML s'ouvre dans un nouvel onglet (sans mention AIBQ/BNQ)
- [ ] Dans Profil → Intégration Google → cliquer « 🔗 Connecter Google » → popup OAuth2 → autoriser
- [ ] Revenir au panneau Facture → cliquer « 📤 Envoyer » → vérifier réception dans kzoinspectpro@gmail.com
- [ ] Vérifier la feuille « Reçus » dans le tableur Google Sheets de kzoinspectpro@gmail.com
- [ ] `bash scripts/check-bundle.sh` → ✅
