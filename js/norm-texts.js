/** Pages normatives préliminaires du rapport (résumés professionnels). */

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function normPage(title, body, id = '') {
  const idAttr = id ? ` id="${id}"` : '';
  return `
  <div${idAttr} class="report-print-page norm-pages">
    <div class="report-print-page__head"><h2>${title}</h2></div>
    <div class="report-appendix-prose">${body}</div>
  </div>`;
}

function aibqPages() {
  return [
    normPage(
      'Norme AIBQ — Nature et portée',
      `<p>L'inspection préachat résidentielle est réalisée selon la norme de pratique de l'Association des inspecteurs en bâtiments du Québec (AIBQ).</p>
      <h3>Objectifs</h3>
      <ul>
        <li>Identifier les défauts apparents des systèmes couverts par la norme.</li>
        <li>Documenter les conditions d'accès et de visibilité.</li>
        <li>Recommander des expertises complémentaires lorsque requis.</li>
      </ul>`,
      'report-norms',
    ),
    normPage('Norme AIBQ — Inspection visuelle', `<p>Examen visuel non invasif des composantes accessibles, sans démolition.</p>`),
    normPage('Norme AIBQ — Systèmes couverts', `<p>Extérieur, toiture, enveloppe, plomberie, électricité, chauffage, climatisation, intérieur, isolation, ventilation, sécurité.</p>`),
    normPage('Norme AIBQ — Exclusions', `<p>Tests destructifs, excavation, amiante, plomb, radon et conformité au Code exclus sauf mention.</p>`),
    normPage('REIBH — Cadre réglementaire', `<p>Cadre REIBH et obligations déontologiques de l'inspecteur titulaire du mandat.</p>`),
  ];
}

function bnqPages(norm) {
  return [
    normPage(
      'BNQ 3009-500 — Portée',
      `<p>Inspection selon la norme BNQ 3009-500 : <strong>${escapeHtml(norm)}</strong>.</p>`,
      'report-norms',
    ),
    normPage('BNQ — Processus et éthique', `<p>Impartialité et documentation objective des constats.</p>`),
    normPage('BNQ — Limitations (annexe A)', `<p>Limitations d'accessibilité, végétation, neige, zones verrouillées.</p>`),
    normPage('BNQ — Catégories de bâtiments', `<p>Catégorie de bâtiment déclarée dans le mandat.</p>`),
    normPage('BNQ — Rapport et suivi', `<p>Document de référence pour la transaction immobilière.</p>`),
  ];
}

function genericPages(norm) {
  return [
    normPage('Cadre normatif', `<p>Inspection selon : <strong>${escapeHtml(norm)}</strong>.</p>`, 'report-norms'),
    normPage('Limitations', `<p>Inspection visuelle ponctuelle, non invasive.</p>`),
    normPage('Responsabilités', `<p>Expertises complémentaires par professionnels qualifiés.</p>`),
    normPage('Systèmes inspectés', `<p>Composantes accessibles au moment de la visite.</p>`),
    normPage('Exclusions', `<p>Tests de laboratoire et démolition exclus.</p>`),
  ];
}

function resolveNormPageList(norm) {
  const normName = String(norm || '').toUpperCase();
  if (normName.includes('AIBQ')) return [...aibqPages(), ...bnqPages(norm).slice(0, 5)];
  if (normName.includes('BNQ')) return bnqPages(norm);
  return genericPages(norm);
}

export function countNormPages(norm) {
  return resolveNormPageList(norm).length;
}

export function getNormPagesHtml(norm) {
  return resolveNormPageList(norm).join('') + `
    <div class="no-print" style="margin:12px;padding:12px;background:#fff3cd;border-radius:8px;font-size:9pt;">
      <strong>Administrateur KZO :</strong> modifiez <code>js/norm-texts.js</code> pour le texte officiel complet.
    </div>`;
}
