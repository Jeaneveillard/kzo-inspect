/** Base de connaissances locale — assistant hors ligne KZO Inspect */

export const QUICK_PROMPTS = [
  { id: 'help-point', label: 'Aide sur ce point' },
  { id: 'nc-ac', label: 'NC vs à corriger ?' },
  { id: 'presets', label: 'Réponses rapides' },
  { id: 'na', label: 'Quand mettre N/A ?' },
  { id: 'report', label: 'Préparer le rapport' },
  { id: 'app', label: 'Utiliser l\'app' },
  { id: 'analyze-photo', label: 'Analyser une photo' },
];

const STATUS_HELP = {
  conforme:
    '**Conforme (C)** : élément observé conforme à l\'inspection visuelle du jour, sans anomalie significative. Utilisez une réponse rapide (« Conforme à l\'inspection visuelle », « Bon état général ») et ajoutez un commentaire seulement si utile au rapport.',
  'non-conforme':
    '**Non conforme (NC)** : anomalie importante, risque sécuritaire ou non-conformité claire au code / à la norme. Documentez avec photos, priorité (critique/majeur/mineur) et commentaire inspecteur. Recommandez un expert si hors champ de compétence.',
  'a-corriger':
    '**À corriger (AC)** : défaut ou usure à surveiller ou corriger, sans urgence immédiate comme une NC majeure. Idéal pour entretien préventif, fissures à surveiller, vieillissement normal.',
  na: '**S.O. / N/A** : point non inspecté (inaccessible, masqué, hors champ, conditions). Choisissez une réponse rapide (« Non accessible », « Hors champ d\'inspection ») et précisez pourquoi dans le commentaire — c\'est essentiel pour limiter votre responsabilité au rapport.',
};

export function buildContextSummary(ctx) {
  if (!ctx?.inspection) {
    if (ctx?.route === 'profile') return 'Page profil — paramètres inspecteur et sauvegarde.';
    if (ctx?.route === 'new') return 'Création d\'une nouvelle inspection.';
    return 'Tableau de bord — liste des dossiers.';
  }
  const i = ctx.inspection;
  const lines = [
    `Dossier : ${i.client || 'Sans nom'}`,
    `Modèle : ${i.templateLabel} (${i.norme})`,
    `Progression : ${i.progress}% — ${i.answered}/${i.total} points`,
  ];
  if (i.nc > 0 || i.ac > 0) {
    lines.push(`Constats : ${i.nc} NC, ${i.ac} à corriger`);
  }
  if (ctx.tab) lines.push(`Onglet actif : ${ctx.tabLabel || ctx.tab}`);
  if (ctx.sectionTitle) lines.push(`Section : ${ctx.sectionTitle}`);
  if (ctx.itemLabel) lines.push(`Point : ${ctx.itemLabel}`);
  if (ctx.itemStatus) lines.push(`Statut actuel : ${ctx.itemStatus}`);
  return lines.join('\n');
}

function matchAny(text, patterns) {
  return patterns.some((p) => (typeof p === 'string' ? text.includes(p) : p.test(text)));
}

export function answerLocally(question, ctx) {
  const q = (question || '').toLowerCase().normalize('NFD').replace(/\p{M}/gu, '');
  const ctxText = buildContextSummary(ctx).toLowerCase();

  if (matchAny(q, ['nc', 'non conforme', 'a corriger', 'ac', 'difference', 'différence', 'vs'])) {
    return `**NC vs à corriger**\n\n${STATUS_HELP['non-conforme']}\n\n${STATUS_HELP['a-corriger']}\n\nEn cas de doute sur un point critique (électricité, gaz, structure), documentez et recommandez un expert spécialisé.`;
  }

  if (matchAny(q, ['reponse rapide', 'réponse rapide', 'pastille', 'preset'])) {
    return `**Réponses rapides**\n\n1. Choisissez d'abord le **statut** (C, NC, AC, N/A).\n2. Touchez une ou plusieurs **pastilles** pour les formulations courantes.\n3. Complétez avec votre **commentaire inspecteur** (mesures, articles, contexte).\n\nLes deux apparaissent séparément dans le rapport PDF.`;
  }

  if (matchAny(q, ['n/a', 'na', 'sans objet', 'inaccessible', 'hors champ'])) {
    return `**Quand utiliser N/A**\n\n${STATUS_HELP.na}\n\nNe marquez pas « conforme » par défaut sur un élément non vu.`;
  }

  if (matchAny(q, ['conforme', ' statut c', /^c$/])) {
    return STATUS_HELP.conforme;
  }

  if (matchAny(q, ['rapport', 'pdf', 'synthese', 'synthèse', 'limitation'])) {
    return `**Rapport et clôture**\n\n- Onglet **Clôture** : limitations, observations générales, experts recommandés, signature.\n- Bouton **Rapport PDF** : couverture, synthèse des NC/AC, sections détaillées.\n- Vérifiez les points **NC/AC** avec photos et commentaires avant d'envoyer au client.\n\n${ctx?.inspection?.nc ? `Ce dossier a actuellement **${ctx.inspection.nc} NC** et **${ctx.inspection.ac} à corriger** — relisez la synthèse.` : ''}`;
  }


  if (matchAny(q, ['anomal', 'fissure', 'infiltr', 'moisiss', 'defaut', 'défaut', 'analyser photo', 'analyse photo', 'vision'])) {
    return `**Analyse de photos (anomalies)**\n\n1. Ajoutez une photo au point (📷) ou ouvrez l'assistant → **📷 Photo**.\n2. Dans **Profil**, activez le **mode cloud** et entrez une clé API (OpenAI, Anthropic Claude, Google Gemini ou xAI).\n3. Modèles recommandés : **Claude Sonnet 4.6** (Anthropic), **GPT-4o** (OpenAI), **Gemini 2.0 Flash** (Google).\n\nL'IA décrit les signes visibles, suggère un statut (C/NC/AC) et des formulations — **vous validez** sur le terrain. Ce n'est pas un certificat de conformité.`;
  }

  if (matchAny(q, ['photo', 'image'])) {
    return '**Photos**\n\nJusqu\'à **4 photos par point** (bouton 📷). Indispensables pour les NC. La photo de **couverture** se configure dans l\'onglet Informations.';
  }

  if (matchAny(q, ['section', 'liste', 'checklist', 'point'])) {
    if (ctx?.sectionTitle) {
      return `**Section en cours : ${ctx.sectionTitle}**\n\nParcourez chaque point un par un : statut → réponses rapides → commentaire si nécessaire → photo pour les anomalies.\n\n${ctx.pendingInSection ? `Il reste **${ctx.pendingInSection} point(s)** non répondu(s) dans cette section.` : 'Cette section semble complète — vérifiez le filtre « Non répondu ».'}`;
    }
    return `**Checklist**\n\nLa **visite extérieure** suit votre ordre terrain : **1 terrain/pente → 2 fondations → 3 toiture → 4 façades → 5 plomberie ext. → 6 électricité ext. → 7 fenêtres, portes et marches**, puis l'intérieur — **fin dans le grenier / combles** si accessible. Une section peut contenir des **sous-sections** (ex. art. 17, 18-20). Ouvrez une section, parcourez les sous-sections et les points, utilisez **Préc./Suiv.** entre les sections.`;
  }

  if (matchAny(q, ['aibq', 'bnq', 'norme', 'preachat', '3009'])) {
    const norm = ctx?.inspection?.norme || 'AIBQ / BNQ';
    return `**Norme (${norm})**\n\nInspection **visuelle non invasive**. Vous décrivez l'état observé, les limitations et les recommandations — sans garantir l'avenir ni certifier la conformité au code complet. Mentionnez les éléments non accessibles et les expertises suggérées (électricien, couvreur, etc.) dans Clôture.`;
  }

  if (matchAny(q, ['app', 'kzo', 'utiliser', 'lancer', 'serveur', '8775'])) {
    return '**Utiliser KZO Inspect**\n\nLancez via **Lancer KZO Inspect.command** (port 8775). Ne double-cliquez pas sur index.html seul.\n\nRaccourcis checklist : touches **1–4** = statuts. Filtres : NC, non répondu, avec photos.';
  }

  if (matchAny(q, ['expert', 'electricien', 'plombier', 'referr'])) {
    return '**Experts recommandés**\n\nDans l\'onglet **Clôture**, section « Recommandations d\'experts » : type de spécialiste, motif, urgence. Ils apparaissent dans le rapport pour le suivi client.';
  }

  if (matchAny(q, ['aide', 'help', 'difficult', 'bloqu', 'comment'])) {
    if (ctx?.itemLabel) {
      return `**Point : ${ctx.itemLabel}**\n\n${ctx.itemStatus ? `Statut actuel : ${ctx.itemStatus}.` : 'Aucun statut choisi encore.'}\n\n**Conseil** : décrivez ce que vous voyez (ou ne voyez pas). Si non inspecté → N/A + raison. Si doute sécurité → NC + photo + expert.\n\nPosez une question précise (ex. « fissure fondation », « toiture », « NC ou AC »).`;
    }
    if (ctx?.sectionTitle) {
      return `Vous êtes dans **${ctx.sectionTitle}**. Décrivez le point qui vous pose problème ou utilisez les boutons rapides ci-dessus.`;
    }
    return 'Je peux vous aider sur : statuts NC/AC, réponses rapides, N/A, rapport, photos, normes AIBQ/BNQ. Décrivez votre difficulté ou touchez une suggestion.';
  }

  if (ctx?.itemLabel && (q.length < 30 || ctxText.includes(q.slice(0, 12)))) {
    return `Pour **« ${ctx.itemLabel} »** :\n\n1. Statut adapté (C / NC / AC / N/A)\n2. Réponses rapides cohérentes\n3. Commentaire avec faits observés (pas d'opinion non fondée)\n4. Photos si anomalie\n\nQuestion plus précise ? (ex. « est-ce une NC ? », « texte pour N/A »)`;
  }

  return `Je n'ai pas de réponse exacte hors ligne pour cela.\n\n**Contexte actuel :**\n${buildContextSummary(ctx)}\n\nReformulez (ex. NC vs AC, N/A, rapport) ou activez l'**assistant cloud** dans Profil avec une clé OpenAI pour des réponses plus détaillées.`;
}

export function formatAssistantMarkdown(text) {
  const escaped = String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
  return escaped
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br />');
}
