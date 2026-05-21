/** Identité KZO Inspect — personnalisable dans le profil */

import { safeImgSrc } from './image-utils.js';

export const DEFAULT_LOGO_URL = './assets/logo-full.png';
/** Logo horizontal pour l'accueil et les grands en-têtes */
export const KZO_WORDMARK_URL = './assets/kzo-inspect-logo.png';

export function getHeroLogoUrl(profile = {}) {
  const b = resolveBranding(profile);
  return b.logoIsCustom ? b.logoDataUrl : KZO_WORDMARK_URL;
}

export const DEFAULT_BRANDING = {
  appName: 'KZO Inspect',
  tagline: 'Inspection de bâtiments au Québec',
  entreprise: '',
  logoDataUrl: null,
  footerText: '',
  ibcMention: '',
  receiptPrefix: 'KZO',
};

export function resolveBranding(profile = {}) {
  return {
    appName: (profile.brandingAppName || DEFAULT_BRANDING.appName).trim() || DEFAULT_BRANDING.appName,
    tagline: (profile.brandingTagline ?? DEFAULT_BRANDING.tagline).trim(),
    entreprise: (profile.brandingEntreprise || profile.entreprise || '').trim(),
    logoDataUrl: profile.brandingLogoDataUrl || DEFAULT_LOGO_URL,
    logoIsCustom: Boolean(profile.brandingLogoDataUrl),
    footerText: (profile.brandingFooter || '').trim(),
    ibcMention: (profile.brandingIbcMention || '').trim(),
    receiptPrefix: (profile.brandingReceiptPrefix || DEFAULT_BRANDING.receiptPrefix).trim() || 'KZO',
  };
}

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function logoInitials(branding) {
  const name = branding.entreprise || branding.appName || 'KZO';
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 3).toUpperCase();
}

export function orgLogoMarkup(branding, { className = 'org-letterhead__logo' } = {}) {
  const src = safeImgSrc(branding.logoDataUrl) || DEFAULT_LOGO_URL;
  if (src) {
    return `<img class="${className} org-letterhead__logo--img" src="${src}" alt="${escapeHtml(branding.appName)}" />`;
  }
  return `<span class="${className}" aria-hidden="true">${escapeHtml(logoInitials(branding))}</span>`;
}

export function orgLetterheadHtml(branding, options = {}) {
  const b = branding?.appName ? branding : resolveBranding(branding);
  const { compact = false } = options;
  const title = b.entreprise || b.appName;
  const subtitle = b.entreprise && b.appName !== b.entreprise ? b.appName : '';
  const tagline = b.tagline || '';

  return `
    <div class="org-letterhead ibc-letterhead ${compact ? 'org-letterhead--compact' : ''}">
      <div class="org-letterhead__mark ibc-letterhead__mark">
        ${orgLogoMarkup(b)}
        <div>
          <p class="org-letterhead__title ibc-letterhead__network">${escapeHtml(title)}</p>
          ${subtitle ? `<p class="org-letterhead__app ibc-letterhead__app">${escapeHtml(subtitle)}</p>` : ''}
          ${tagline ? `<p class="org-letterhead__tagline ibc-letterhead__tagline">${escapeHtml(tagline)}</p>` : ''}
          ${b.ibcMention ? `<p class="org-letterhead__ibc">${escapeHtml(b.ibcMention)}</p>` : ''}
        </div>
      </div>
    </div>`;
}

export function orgFooterHtml(branding) {
  const b = branding?.appName ? branding : resolveBranding(branding);
  const lines = [];
  if (b.footerText) lines.push(escapeHtml(b.footerText));
  else {
    const who = b.entreprise || b.appName;
    lines.push(`<strong>${escapeHtml(who)}</strong>`);
    if (b.tagline) lines.push(escapeHtml(b.tagline));
  }
  if (b.ibcMention && !b.footerText?.includes(b.ibcMention)) {
    lines.push(escapeHtml(b.ibcMention));
  }
  return `<footer class="org-footer ibc-footer">${lines.join('<br />')}</footer>`;
}

export const ORG_LETTERHEAD_STYLES = `
  .org-letterhead, .ibc-letterhead {
    border-bottom: 3px solid #0d47a1;
    padding-bottom: 12px;
    margin-bottom: 20px;
  }
  .org-letterhead__mark, .ibc-letterhead__mark {
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .org-letterhead__logo, .ibc-letterhead__logo {
    flex-shrink: 0;
    width: 52px;
    height: 52px;
    background: linear-gradient(135deg, #002171, #0d47a1);
    color: #fff;
    font-weight: 800;
    font-size: 11pt;
    border-radius: 8px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    letter-spacing: -0.5px;
  }
  .org-letterhead__logo--img, .ibc-letterhead__logo--img {
    object-fit: contain;
    background: #fff;
    border: 1px solid #e0e6ed;
    padding: 4px;
  }
  .org-letterhead__title, .ibc-letterhead__network {
    margin: 0;
    font-size: 12pt;
    font-weight: 700;
    color: #0d47a1;
    line-height: 1.3;
  }
  .org-letterhead__tagline, .ibc-letterhead__tagline {
    margin: 4px 0 0;
    font-size: 8.5pt;
    color: #666;
  }
  .org-letterhead__app, .ibc-letterhead__app {
    margin: 2px 0 0;
    font-size: 9pt;
    color: #444;
    font-weight: 600;
  }
  .org-letterhead__ibc {
    margin: 6px 0 0;
    font-size: 8.5pt;
    color: #1565c0;
    font-weight: 500;
  }
  .org-footer, .ibc-footer {
    margin-top: 24px;
    padding-top: 12px;
    border-top: 1px solid #ddd;
    font-size: 8pt;
    color: #666;
    text-align: center;
    line-height: 1.5;
  }
`;

export function applyTopBarBranding(profile = {}) {
  const b = resolveBranding(profile);
  const logoEl = document.querySelector('.top-bar__logo');
  const titleEl = document.querySelector('.top-bar__title');
  const subtitleEl = document.querySelector('.top-bar__subtitle');
  if (!logoEl || !titleEl || !subtitleEl) return;

  titleEl.textContent = b.appName;
  const subParts = [b.entreprise && b.entreprise !== b.appName ? b.entreprise : null, b.tagline, b.ibcMention].filter(Boolean);
  subtitleEl.textContent = subParts.join(' · ') || b.tagline || DEFAULT_BRANDING.tagline;

  const logoSrc = safeImgSrc(b.logoDataUrl) || DEFAULT_LOGO_URL;
  logoEl.innerHTML = `<img src="${logoSrc}" alt="${escapeHtml(b.appName)}" class="top-bar__logo-img" width="48" height="48" decoding="async" />`;
  logoEl.classList.toggle('top-bar__logo--custom', Boolean(b.logoIsCustom));
  logoEl.classList.toggle('top-bar__logo--default', !b.logoIsCustom);
}
