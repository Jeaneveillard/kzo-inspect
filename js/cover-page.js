import { orgLogoMarkup, resolveBranding } from './organization.js';
import { formatVisitDateTime } from './visit.js';
import { safeImgSrc } from './image-utils.js';

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function fullAddress(site) {
  const parts = [site.adresse, [site.ville, site.codePostal].filter(Boolean).join(' ')].filter(Boolean);
  return parts.join(', ') || '';
}

export function buildCoverPageHtml(inspection, profile = {}) {
  const photo = safeImgSrc(inspection.coverPhotoDataUrl);
  if (!photo) return '';

  const branding = resolveBranding(profile);
  const client = inspection.site?.client || '';
  const addr = fullAddress(inspection.site);
  const visit = formatVisitDateTime(inspection);
  const caption = (inspection.coverPhotoCaption || '').trim();
  const inspector = inspection.inspector || {};
  const coverTitle = branding.entreprise || branding.appName;

  return `
  <section class="cover-page" aria-label="Page de couverture">
    <img class="cover-page__photo" src="${photo}" alt="Photo de la propriété inspectée" />
    <div class="cover-page__shade"></div>
    <div class="cover-page__content">
      <div class="cover-page__brand">
        ${orgLogoMarkup(branding, { className: 'cover-page__logo' })}
        <div class="cover-page__brand-text">
          <span class="cover-page__app">${escapeHtml(coverTitle)}</span>
          ${branding.tagline ? `<span class="cover-page__tagline">${escapeHtml(branding.tagline)}</span>` : ''}
          ${branding.ibcMention ? `<span class="cover-page__ibc">${escapeHtml(branding.ibcMention)}</span>` : ''}
        </div>
      </div>
      <p class="cover-page__doctype">Rapport d'inspection</p>
      <h1 class="cover-page__title">${escapeHtml(client || inspection.templateLabel || 'Propriété inspectée')}</h1>
      ${addr ? `<p class="cover-page__address">${escapeHtml(addr)}</p>` : ''}
      ${inspection.site?.typeBatiment ? `<p class="cover-page__type">${escapeHtml(inspection.site.typeBatiment)}</p>` : ''}
      <div class="cover-page__meta">
        ${visit !== '—' ? `<span>${escapeHtml(visit)}</span>` : ''}
        ${inspection.site?.numeroDossier ? `<span>Dossier ${escapeHtml(inspection.site.numeroDossier)}</span>` : ''}
      </div>
      ${caption ? `<p class="cover-page__caption">${escapeHtml(caption)}</p>` : ''}
      <p class="cover-page__inspector">
        ${escapeHtml(inspector.nom || '')}${inspector.entreprise ? ` · ${escapeHtml(inspector.entreprise)}` : ''}
      </p>
    </div>
  </section>`;
}

export const COVER_PAGE_STYLES = `
  .cover-page {
    position: relative;
    width: 100%;
    min-height: 100vh;
    height: 277mm;
    overflow: hidden;
    page-break-after: always;
    break-after: page;
    margin: -24px -24px 0;
    background: #0d2137;
  }
  .cover-page__photo {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
  }
  .cover-page__shade {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      180deg,
      rgba(0, 33, 113, 0.35) 0%,
      rgba(0, 33, 113, 0.15) 35%,
      rgba(0, 20, 60, 0.55) 70%,
      rgba(0, 33, 113, 0.92) 100%
    );
  }
  .cover-page__content {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    padding: 48px 52px 56px;
    color: #fff;
    z-index: 1;
  }
  .cover-page__brand {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 28px;
  }
  .cover-page__logo {
    width: 64px;
    height: 64px;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.95);
    color: #002171;
    font-weight: 800;
    font-size: 14pt;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .cover-page__logo.org-letterhead__logo--img {
    object-fit: contain;
    padding: 6px;
  }
  .cover-page__brand-text {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .cover-page__app {
    font-size: 14pt;
    font-weight: 700;
    line-height: 1.25;
  }
  .cover-page__tagline {
    font-size: 9.5pt;
    opacity: 0.9;
    max-width: 360px;
  }
  .cover-page__ibc {
    font-size: 9pt;
    opacity: 0.85;
    font-weight: 500;
  }
  .cover-page__doctype {
    margin: 0 0 8px;
    font-size: 11pt;
    text-transform: uppercase;
    letter-spacing: 0.2em;
    opacity: 0.85;
  }
  .cover-page__title {
    margin: 0 0 12px;
    font-size: 28pt;
    font-weight: 700;
    line-height: 1.15;
    text-shadow: 0 2px 12px rgba(0, 0, 0, 0.35);
  }
  .cover-page__address {
    margin: 0 0 6px;
    font-size: 14pt;
    font-weight: 500;
    opacity: 0.95;
  }
  .cover-page__type {
    margin: 0 0 16px;
    font-size: 11pt;
    opacity: 0.8;
  }
  .cover-page__meta {
    display: flex;
    flex-wrap: wrap;
    gap: 12px 20px;
    font-size: 10pt;
    opacity: 0.9;
    margin-bottom: 12px;
  }
  .cover-page__caption {
    margin: 0 0 12px;
    font-size: 10pt;
    font-style: italic;
    opacity: 0.85;
    max-width: 480px;
  }
  .cover-page__inspector {
    margin: 0;
    font-size: 10pt;
    opacity: 0.8;
    border-top: 1px solid rgba(255, 255, 255, 0.25);
    padding-top: 14px;
  }
  @media print {
    .cover-page {
      margin: 0;
      height: 100vh;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
  }
`;
