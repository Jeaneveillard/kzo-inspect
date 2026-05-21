/**
 * Sections « visite extérieure » — ordre terrain de Jean Eveillard Cazeau
 * 1 Terrain → 2 Fondations → 3 Toiture → 4 Façades → 5 Plomberie ext. → 6 Électricité ext. → 7 Ouvertures
 */

import { createSection, createSubsection } from './section-structure.js';

export const AIBQ_VISITE_EXTERIEURE = createSection(
  'aibq-visite-ext',
  'Visite extérieure — ordre terrain',
  {
    subsections: [
      createSubsection('walk-terrain', '1. Terrain — pente et drainage', [
        '23.7 Végétation, pentes, drainage, murs de soutènement nuisibles',
        'Pente du terrain vers les fondations (éloignement de l\'eau)',
        'Évacuation des eaux de surface et regards de drainage visibles',
        'Murs de soutènement, terrasses contre le bâtiment',
        'Clôture de propriété — état général (non couverte par la norme, signalement si sécurité)',
        'Piscine / spa / bassin : présence de clôture de sécurité (Loi 33 Québec, 1,2 m min.)',
        'Margelle de piscine/spa : état des joints, fissures, stabilité',
        'Fosse septique / champ d\'épuration : localisation et accès (si non relié au réseau municipal)',
      ]),
      createSubsection('walk-fondations', '2. Fondations et parties visibles', [
        '17.1 Fondations — observation et description',
        'Semelle, vide sanitaire ou sous-sol visible depuis l\'extérieur',
        'Fissures, affaissement, infiltration au pourtour des fondations',
        'Mur de fondation / partie de mur exposée (efflorescence, dommages)',
        'Drain français : sortie visible, état, type (si observable)',
        'Membrane d\'imperméabilisation : visible ou non (noter si absence probable)',
        'Tirants d\'ancrage (mur de blocs) : présence visible et état',
      ]),
      createSubsection('walk-toiture', '3. Toiture', [
        '26.1 Revêtement de toiture — condition',
        '26.2 Gouttières, descentes, évacuation des eaux',
        '26.3 Solins (cheminée, mur, lucarne)',
        '26.4 Lanterneaux, cheminées extérieures, émergences',
        '27 Méthode d\'observation de la toiture documentée',
        '28 Exclusions : accessoires fixés, intérieur des cheminées',
        'Glace en rive / barrage de glace : traces, dommages ou conditions favorisantes (Québec)',
        'Ventilation soffite : grilles dégagées et non obstruées (visible de l\'extérieur)',
        'Âge estimé du revêtement (noter si fin de vie probable)',
      ]),
      createSubsection('walk-facades', '4. Façades extérieures', [
        '23.1 Revêtements muraux, boiseries, solins',
        '23.4 Avant-toits, fascias, sous-faces',
        'Écaillage, fissures, pourriture ou corrosion des revêtements',
      ]),
      createSubsection('walk-plomb-ext', '5. Plomberie extérieure', [
        '30.2 Robinet d\'arrêt principal — localisation (si visible à l\'extérieur)',
        '30.8 Robinets extérieurs et brise-vide',
        '30.9 Eau jaunâtre/rougeâtre dans puisards',
        '31.2-31.6 Fuites, drains, clapets, regards, puisards (extérieur)',
        'Évents de plomberie et raccords apparents sur la façade',
      ]),
      createSubsection('walk-elec-ext', '6. Électricité — branchement extérieur', [
        '37.1 Entrée de service (aérien / souterrain)',
        '37.2 Mise à la terre (borne visible)',
        '37.3 Coffret de branchement principal (extérieur si applicable)',
        'Mât, conduit, ancrage et hauteur de fils (sécurité)',
      ]),
      createSubsection('walk-ouvertures', '7. Fenêtres, portes, marches et accès', [
        '23.2 Fenêtres et portes permanentes extérieures',
        '23.3 Trottoirs, terrasses, balcons, marches, balustrades',
        '23.5 Commandes et sécurité portes de garage',
        '23.6 Porte de garage : arrêt sur obstacle à la fermeture',
        '24 Portes extérieures et garage actionnées (commande normale)',
        '25 Exclusions notées : contre-fenêtres, clôtures, géotechnique, quais',
      ]),
    ],
  },
);

export const AIBQ_STRUCTURE_APRES_EXT = createSection(
  'aibq-v-i',
  'Section I — Structure (intérieur / arts 17-22)',
  {
    subsections: [
      createSubsection('aibq-v-i-17', 'Art. 17 — Éléments structurels (intérieur)', [
        '17.2 Planchers — déformation, affaissement',
        '17.3 Murs porteurs et cloisons',
        '17.4 Colonnes et poutres',
        '17.5 Poutres et solives apparentes',
        '17.6 Plafonds structurels',
        '17.7 Toit (structure intérieure — détail aux combles si visités en fin)',
      ]),
      createSubsection('aibq-v-i-18-20', 'Arts 18-20 — Accès et méthodes', [
        '18 Piquage représentatif si détérioration (sans dommage ni risque)',
        '19 Pénétration vide sanitaire/combles si passage libre et sécuritaire',
        '20 Méthodes de visite des combles et vide sanitaire documentées',
      ]),
      createSubsection('aibq-v-i-22', 'Art. 22 — Limites', [
        '22 Pas d\'ingénierie ni avis sur capacité portante',
      ]),
    ],
  },
);

export const BNQ_VISITE_EXTERIEURE = createSection(
  'bnq-visite-ext',
  'Visite extérieure — ordre terrain (BNQ art. 12)',
  {
    subsections: [
      createSubsection('bnq-w-terrain', '1. Terrain — pente et drainage', [
        '12.2.1f Végétation, pentes, murs de soutènement, eau de surface',
        'Pente du terrain vers les fondations',
        'Drainage de surface et éloignement de l\'eau des fondations',
        'Piscine / spa / bassin : clôture de sécurité conforme (Loi 33 Québec, 1,2 m min.)',
        'Margelle de piscine/spa : état des joints, fissures, stabilité',
        'Fosse septique / champ d\'épuration : localisation visible (si applicable)',
      ]),
      createSubsection('bnq-w-fondations', '2. Fondations et composantes structurales visibles', [
        '12.1.1a Charpente et fondations',
        'Fissures, soulèvement, détérioration fondations / dalle flottante',
        'Infiltration, auréoles, efflorescence au pourtour',
        'Déplacement relatif, affaissement visible',
        'Drain français : sortie visible, état (si observable)',
        'Membrane d\'imperméabilisation visible (ou absence probable à noter)',
      ]),
      createSubsection('bnq-w-toiture', '3. Toiture', [
        '12.2.1c Toiture : couverture, drainage, solins, lucarnes, cheminée, évents',
        '12.2.1e Gouttières et descentes',
        'Couverture pentue : bardeaux, ventilation toit, glaceaux',
        'Toit plat : membrane, gravier, zones dénudées',
        'Glace en rive / barrage de glace : traces, dommages ou conditions favorisantes',
        'Ventilation soffite : grilles dégagées et non obstruées (visible de l\'extérieur)',
        'Âge estimé du revêtement (noter si fin de vie probable)',
      ]),
      createSubsection('bnq-w-facades', '4. Façades extérieures', [
        '12.2.1a Revêtements, maçonnerie, solins',
        'Détérioration revêtement : pourriture, rouille, peinture écaillée',
        'Maçonnerie : joints, briques, weep holes',
        'Infiltration : calfeutrage, solins, balcon/joist rim',
      ]),
      createSubsection('bnq-w-plomb-ext', '5. Plomberie extérieure', [
        '12.3.1c Distribution extérieure et branchement irrigation (clapet anti-retour)',
        '12.3.1d Évacuation, ventilation, drains, évents extérieurs',
        '12.3.1g Puisards, fosses, bassins de drainage',
        'Drain de garage et couvercle résistant aux charges',
      ]),
      createSubsection('bnq-w-elec-ext', '6. Électricité — branchement extérieur', [
        '12.4.1a Mât, conduit, mise à terre, boîtier de service',
        'Ancrage mât et conduit d\'entrée',
        'Liaison équipotentielle conduite métallique eau/gaz (si visible)',
        'Protection mécanique alimentation thermopompe extérieure',
        'Moyen de déconnexion près unité extérieure CVAC',
      ]),
      createSubsection('bnq-w-ouvertures', '7. Fenêtres, portes, marches et accès', [
        '12.2.1b Contre-fenêtres, moustiquaires (non accessoires saisonniers)',
        '12.2.1d Accès : entrées, terrasses, balcons, escaliers, garde-corps',
        'Fixation et stabilité des assemblages extérieurs',
        'Garde-corps : absence, hauteur, configuration',
      ]),
    ],
  },
);

export const BATIMENT_VISITE_EXTERIEURE = [
  createSubsection('bat-terrain', '1. Terrain — pente et drainage', [
    'Pente du terrain et évacuation des eaux loin des fondations',
    'Drainage de surface, regards, drain français visible',
    'Végétation et racines près des murs de fondation',
    'Piscine / spa : clôture de sécurité conforme (Loi 33 Québec)',
    'Margelle de piscine/spa : état des joints, fissures, stabilité',
    'Fosse septique / champ d\'épuration : localisation (si applicable)',
  ]),
  createSubsection('bat-fondations', '2. Fondations et parties visibles', [
    'Fondations et drainage apparent sans infiltration active',
    'Fissures ou affaissement visible au pourtour',
    'Mur de fondation / partie de mur exposée',
  ]),
  createSubsection('bat-toiture', '3. Toiture', [
    'Couverture, solins et évacuation des eaux',
    'Gouttières, descentes et émergences (cheminée, évents)',
    'Méthode d\'observation documentée (sol, échelle, drone, etc.)',
  ]),
  createSubsection('bat-facades', '4. Façades extérieures', [
    'Revêtements muraux, maçonnerie et solins',
    'Avant-toits, fascias et sous-faces',
  ]),
  createSubsection('bat-plomb-ext', '5. Plomberie extérieure', [
    'Robinets extérieurs et brise-vide',
    'Regards, puisards et évacuations extérieures',
    'Entrée d\'eau / robinet principal si visible',
  ]),
  createSubsection('bat-elec-ext', '6. Électricité — branchement extérieur', [
    'Entrée de service, mât et coffret extérieur',
    'Mise à la terre visible',
    'Thermopompe / unité extérieure — alimentation et dégagement',
  ]),
  createSubsection('bat-ouvertures', '7. Fenêtres, portes, marches et accès', [
    'Fenêtres et portes extérieures : étanchéité et fonctionnement',
    'Portes de garage : sécurité et capteurs',
    'Terrasses, balcons, escaliers et garde-corps extérieurs',
  ]),
];

export function batimentExteriorWalkSection() {
  return createSection('bat-visite-ext', 'Visite extérieure — ordre terrain', {
    subsections: BATIMENT_VISITE_EXTERIEURE,
  });
}

/** Fin de visite sur place — grenier / combles si accessible */
export const AIBQ_GRENIER = createSection(
  'aibq-grenier',
  'Grenier / combles — fin de visite (si accessible)',
  [
    'Accès au grenier : trappe, échelle, garde-corps et sécurité',
    'Si inaccessible : noter la raison (verrouillé, encombrement, risque, absence d\'échelle)',
    '19 Pénétration des combles si passage libre et sécuritaire',
    '20 Méthode de visite des combles documentée',
    '17.7 Toit — structure visible depuis les combles',
    '55 Isolation et pare-vapeur visibles (combles)',
    '57.1 Ventilation des combles',
    '59.8 Murs coupe-feu en combles (si visibles)',
    '59.9 Dégagement autour des cheminées visible depuis les combles',
    'Traces d\'humidité, condensation ou moisissure — détecteur si suspect',
  ],
);

export const BNQ_GRENIER = createSection(
  'bnq-grenier',
  'Grenier / combles — fin de visite (si accessible)',
  [
    '12.7 Combles / espace de toit : isolation, ventilation amont',
    'Accès impossible ou refusé — documenter la raison',
    'Condensation ou moisissure en espace non fini',
    'Pare-vapeur et continuité (si observable)',
    'Structure de toit / fermes visibles depuis les combles',
    'Éclairage et sécurité pendant la visite des combles',
  ],
);

export function batimentGrenierSection() {
  return createSection('bat-grenier', 'Grenier / combles — fin de visite (si accessible)', [
    'Accès au grenier : trappe, échelle, sécurité',
    'Si inaccessible : raison notée (verrou, encombrement, risque)',
    'Isolation des combles visible',
    'Ventilation des combles (évents, soffites)',
    'Structure de toit et solives — état apparent',
    'Fuites, taches ou moisissures visibles',
    'Dégagement autour cheminée / émergences si visible',
  ]);
}
