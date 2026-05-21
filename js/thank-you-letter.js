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

function clientSalutation(clientName) {
  const n = (clientName || '').trim();
  if (!n) return 'Madame, Monsieur,';
  if (n.includes(' et ')) return `Chers ${n},`;
  return `Cher(e) ${n},`;
}

function formatLetterDate(inspection) {
  const d = inspection.visit?.date;
  if (d) return formatDateFr(d);
  return new Date().toLocaleDateString('fr-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function fullAddress(site) {
  const parts = [site.adresse, [site.ville, site.codePostal].filter(Boolean).join(' ')].filter(Boolean);
  return parts.join(', ') || '—';
}

export function buildThankYouLetterHtml(inspection, profile = {}) {
  const branding = resolveBranding(profile);
  const client = inspection.site?.client || 'Client';
  const signatory = branding.entreprise || branding.appName;
  const siteLine = fullAddress(inspection.site);
  const visitLine = formatVisitDateTime(inspection);
  const inspector = inspection.inspector || {};
  const customProfile = (profile.messageRemerciement || '').trim();
  const customInspection = (inspection.thankYouNote || '').trim();
  const customBlock = customInspection || customProfile;

  const inspectorBlock = [
    inspector.nom,
    inspector.entreprise,
    [inspector.courriel, inspector.telephone].filter(Boolean).join(' · '),
    inspector.permis ? `Permis / certification : ${inspector.permis}` : '',
    inspector.certificatRbq ? `Certificat RBQ : ${inspector.certificatRbq}` : '',
  ]
    .filter(Boolean)
    .map((line) => escapeHtml(line))
    .join('<br />');

  return `<!DOCTYPE html>
<html lang="fr-CA">
<head>
  <meta charset="UTF-8" />
  <title>Lettre de remerciement — ${escapeHtml(client)}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: "Segoe UI", Georgia, serif;
      color: #1a1a2e;
      max-width: 720px;
      margin: 0 auto;
      padding: 40px 48px;
      font-size: 11.5pt;
      line-height: 1.65;
    }
    ${ORG_LETTERHEAD_STYLES}
    .org-letterhead { padding-bottom: 16px; margin-bottom: 28px; }
    .letter-date { text-align: right; margin-bottom: 24px; color: #444; }
    .letter-address { margin-bottom: 28px; }
    .letter-subject {
      font-weight: 700;
      margin-bottom: 20px;
      color: #0d47a1;
      border-bottom: 2px solid #e3edf7;
      padding-bottom: 8px;
    }
    .letter-body p { margin: 0 0 14px; text-align: justify; }
    .letter-custom {
      margin: 18px 0;
      padding: 14px 18px;
      background: #f5f9fc;
      border-left: 4px solid #0d47a1;
      font-style: italic;
    }
    .letter-highlight {
      margin: 20px 0;
      padding: 16px 20px;
      background: linear-gradient(135deg, #f8fbff, #eef5fc);
      border-radius: 10px;
      border: 1px solid #cfe0f0;
    }
    .letter-highlight h4 {
      margin: 0 0 8px;
      color: #0d47a1;
      font-size: 10.5pt;
    }
    .letter-highlight ul {
      margin: 0;
      padding-left: 18px;
    }
    .letter-highlight li {
      margin-bottom: 4px;
      font-size: 10.5pt;
    }
    .letter-signature { margin-top: 32px; }
    .org-footer { margin-top: 40px; }
    .no-print {
      background: #e3f2fd;
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 24px;
      font-family: system-ui, sans-serif;
      font-size: 10pt;
    }
    @media print {
      body { padding: 24px; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <p class="no-print">Lettre de remerciement — Imprimez ou enregistrez en PDF depuis votre navigateur.</p>

  ${orgLetterheadHtml(branding)}

  <p class="letter-date">${escapeHtml(formatLetterDate(inspection))}</p>

  <div class="letter-address">
    <strong>${escapeHtml(client)}</strong><br />
    ${siteLine !== '—' ? escapeHtml(siteLine) : ''}
  </div>

  <p class="letter-subject">Objet : Remerciements et suivi — Inspection de votre propriété</p>

  <div class="letter-body">
    <p>${clientSalutation(client)}</p>

    <p>
      C'est avec un réel plaisir que je vous adresse cette lettre à la suite de
      l'inspection${siteLine !== '—' ? ` de la propriété située au <strong>${escapeHtml(siteLine)}</strong>` : ' de votre propriété'}.
      Je tiens à vous exprimer ma sincère gratitude pour la confiance que vous m'avez accordée
      en choisissant <strong>${escapeHtml(signatory)}</strong> pour vous accompagner dans cette étape
      importante de votre projet immobilier.
    </p>

    ${
      visitLine !== '—'
        ? `<p>L'inspection a eu lieu le <strong>${escapeHtml(visitLine)}</strong>. J'ai pris soin
           d'examiner attentivement l'ensemble des composantes accessibles du bâtiment afin de vous offrir
           un portrait clair et objectif de son état au moment de la visite.</p>`
        : `<p>J'ai pris soin d'examiner attentivement l'ensemble des composantes accessibles du bâtiment
           afin de vous offrir un portrait clair et objectif de son état.</p>`
    }

    <div class="letter-highlight">
      <h4>📋 Votre rapport d'inspection</h4>
      <ul>
        <li>Votre rapport détaillé vous a été remis (ou le sera sous peu).</li>
        <li>Il contient une description des systèmes inspectés, des observations et des recommandations.</li>
        <li>Les photos prises lors de la visite documentent les constats importants.</li>
        <li>N'hésitez pas à me contacter si certains points nécessitent des éclaircissements.</li>
      </ul>
    </div>

    ${
      customBlock
        ? `<div class="letter-custom"><p style="margin:0">${escapeHtml(customBlock).replace(/\n/g, '<br />')}</p></div>`
        : ''
    }

    <p>
      Mon engagement va au-delà de la remise du rapport. Je reste disponible pour répondre
      à toutes vos questions, vous accompagner dans la compréhension des constats ou vous
      orienter vers des professionnels qualifiés si certains éléments requièrent une
      expertise approfondie.
    </p>

    <p>
      Votre satisfaction est au cœur de ma pratique professionnelle. Si vous êtes satisfait(e)
      du service reçu, une recommandation à vos proches ou un témoignage serait grandement
      apprécié — c'est la plus belle marque de confiance qu'un client puisse offrir.
    </p>

    <p>
      Je vous souhaite le meilleur dans la poursuite de votre projet et vous prie
      d'agréer l'expression de ma considération distinguée.
    </p>
  </div>

  <div class="letter-signature">
    <p><strong>${escapeHtml(inspector.nom || '_________________________')}</strong></p>
    ${inspectorBlock ? `<p>${inspectorBlock}</p>` : ''}
    ${
      branding.ibcMention
        ? `<p style="margin-top:12px;font-size:10pt;color:#0d47a1;">${escapeHtml(branding.ibcMention)}</p>`
        : '<p style="margin-top:12px;font-size:10pt;color:#0d47a1;">Inspecteur en bâtiment certifié — Québec</p>'
    }
  </div>

  ${orgFooterHtml(branding)}

  <script>window.onload = () => window.print();</script>
</body>
</html>`;
}

export function openThankYouLetter(inspection, profile) {
  const html = buildThankYouLetterHtml(inspection, profile);
  const win = window.open('', '_blank');
  if (!win) {
    alert('Autorisez les fenêtres contextuelles pour ouvrir la lettre de remerciement.');
    return;
  }
  win.document.write(html);
  win.document.close();
}
