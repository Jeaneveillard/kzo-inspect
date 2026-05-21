/** Réponses prédéfinies par statut — sélection rapide + commentaire libre séparé */

import { normalizeInspectionSections, iterSectionItems } from './section-structure.js';

export const QUICK_RESPONSES = {
  conforme: [
    { id: 'c-visuel', label: 'Conforme à l\'inspection visuelle' },
    { id: 'c-bon-etat', label: 'Bon état général' },
    { id: 'c-fonctionnel', label: 'Fonctionnel — entretien courant seulement' },
    { id: 'c-pratiques', label: 'Conforme aux pratiques courantes' },
    { id: 'c-aucune', label: 'Aucune anomalie visible' },
  ],
  'non-conforme': [
    { id: 'nc-correction', label: 'Non conforme — correction requise' },
    { id: 'nc-securite', label: 'Sécurité compromise' },
    { id: 'nc-usure', label: 'Usure au-delà des limites acceptables' },
    { id: 'nc-absent', label: 'Élément requis absent ou non conforme au code' },
    { id: 'nc-majeur', label: 'Défaut majeur constaté' },
    { id: 'nc-eau', label: 'Infiltration / dommage par l\'eau' },
  ],
  'a-corriger': [
    { id: 'ac-surveillance', label: 'Usure normale — surveillance recommandée' },
    { id: 'ac-court', label: 'Réparation recommandée à court terme' },
    { id: 'ac-entretien', label: 'Entretien préventif suggéré' },
    { id: 'ac-fissure', label: 'Fissure / cycle à surveiller' },
    { id: 'ac-refection', label: 'Réfection à prévoir (non urgent)' },
    { id: 'ac-vieillissement', label: 'Vieillissement normal du composant' },
  ],
  na: [
    { id: 'na-inaccessible', label: 'Non accessible' },
    { id: 'na-non-visible', label: 'Non visible / masqué' },
    { id: 'na-hors-champ', label: 'Hors champ d\'inspection' },
    { id: 'na-absent', label: 'Non présent sur le site' },
    { id: 'na-conditions', label: 'Conditions empêchant l\'inspection' },
    { id: 'na-neige', label: 'Obstruction saisonnière (neige, débris)' },
  ],
};

/** Pré-réponses contextuelles par section / sous-section */
export const SECTION_PRESETS = {

  /* ── Terrain ─────────────────────────────────────────────────── */
  'walk-terrain': {
    conforme: [
      { id: 'terrain-c-1', label: 'Pente adéquate — eaux s\'éloignent des fondations' },
      { id: 'terrain-c-2', label: 'Végétation à distance raisonnable du bâtiment' },
      { id: 'terrain-c-3', label: 'Drainage de surface fonctionnel' },
      { id: 'terrain-c-4', label: 'Clôture de piscine conforme — 1,2 m et loquet sécurité' },
      { id: 'terrain-c-5', label: 'Margelle en bon état — joints intacts, surface stable' },
    ],
    'non-conforme': [
      { id: 'terrain-nc-1', label: 'Pente vers les fondations — infiltration probable' },
      { id: 'terrain-nc-2', label: 'Racines endommageant la fondation' },
      { id: 'terrain-nc-3', label: 'Mur de soutènement instable — risque structural' },
      { id: 'terrain-nc-4', label: 'Clôture de piscine absente ou non conforme — Loi 33 Québec' },
      { id: 'terrain-nc-5', label: 'Loquet de sécurité piscine absent — danger enfants' },
    ],
    'a-corriger': [
      { id: 'terrain-ac-1', label: 'Remblai insuffisant le long des fondations' },
      { id: 'terrain-ac-2', label: 'Végétation trop proche — à tailler' },
      { id: 'terrain-ac-3', label: 'Regard de drainage obstrué ou absent' },
      { id: 'terrain-ac-4', label: 'Margelle fissurée ou joints détériorés — réparation à prévoir' },
    ],
  },
  'bnq-w-terrain': 'walk-terrain',
  'bat-terrain':   'walk-terrain',

  /* ── Fondations ──────────────────────────────────────────────── */
  'walk-fondations': {
    conforme: [
      { id: 'fond-c-1', label: 'Aucune fissure significative observée' },
      { id: 'fond-c-2', label: 'Mur de fondation sec et intact' },
      { id: 'fond-c-3', label: 'Aucun signe d\'efflorescence ou d\'infiltration' },
    ],
    'non-conforme': [
      { id: 'fond-nc-1', label: 'Fissure diagonale — mouvement structurel probable' },
      { id: 'fond-nc-2', label: 'Infiltration active au mur de fondation' },
      { id: 'fond-nc-3', label: 'Efflorescence importante — humidité chronique' },
      { id: 'fond-nc-4', label: 'Affaissement ou déplacement visible' },
    ],
    'a-corriger': [
      { id: 'fond-ac-1', label: 'Fissures fines — cycle gel-dégel à surveiller' },
      { id: 'fond-ac-2', label: 'Efflorescence légère — drainage à améliorer' },
      { id: 'fond-ac-3', label: 'Joints de mortier dégradés — repointing requis' },
    ],
  },
  'bnq-w-fondations': 'walk-fondations',
  'bat-fondations':   'walk-fondations',

  /* ── Toiture ─────────────────────────────────────────────────── */
  'walk-toiture': {
    conforme: [
      { id: 'toit-c-1', label: 'Revêtement en bon état apparent' },
      { id: 'toit-c-2', label: 'Gouttières et descentes fonctionnelles' },
      { id: 'toit-c-3', label: 'Solins étanches — aucun décollement' },
      { id: 'toit-c-4', label: 'Cheminée et émergences en bon état' },
      { id: 'toit-c-5', label: 'Soffites dégagés — ventilation adéquate visible' },
    ],
    'non-conforme': [
      { id: 'toit-nc-1', label: 'Bardeaux manquants, soulevés ou granulats absents' },
      { id: 'toit-nc-2', label: 'Solin décollé — infiltration probable' },
      { id: 'toit-nc-3', label: 'Membrane endommagée (toit plat)' },
      { id: 'toit-nc-4', label: 'Dommage structurel apparent — intervention urgente' },
      { id: 'toit-nc-5', label: 'Soffites obstrués — risque de condensation en comble' },
    ],
    'a-corriger': [
      { id: 'toit-ac-1', label: 'Toiture en fin de vie — remplacement à planifier' },
      { id: 'toit-ac-2', label: 'Gouttières obstruées ou mal fixées' },
      { id: 'toit-ac-3', label: 'Calfeutrage d\'émergence à refaire' },
      { id: 'toit-ac-4', label: 'Traces de glace en rive — améliorer l\'isolation et la ventilation' },
    ],
  },
  'bnq-w-toiture': 'walk-toiture',
  'bat-toiture':   'walk-toiture',

  /* ── Façades ─────────────────────────────────────────────────── */
  'walk-facades': {
    conforme: [
      { id: 'facade-c-1', label: 'Revêtement mural sans fissure significative' },
      { id: 'facade-c-2', label: 'Boiseries et fascias en bon état' },
      { id: 'facade-c-3', label: 'Calfeutrage des ouvertures en bon état' },
    ],
    'non-conforme': [
      { id: 'facade-nc-1', label: 'Pourriture visible au revêtement ou boiseries' },
      { id: 'facade-nc-2', label: 'Fissures ouvertes — infiltration probable' },
      { id: 'facade-nc-3', label: 'Lambris bombé ou mal fixé — détachement possible' },
    ],
    'a-corriger': [
      { id: 'facade-ac-1', label: 'Peinture écaillée — entretien préventif requis' },
      { id: 'facade-ac-2', label: 'Calfeutrage fenêtres à refaire' },
      { id: 'facade-ac-3', label: 'Fascia ou sous-face à repeindre ou remplacer' },
    ],
  },
  'bnq-w-facades': 'walk-facades',
  'bat-facades':   'walk-facades',

  /* ── Fenêtres, portes, marches ───────────────────────────────── */
  'walk-ouvertures': {
    conforme: [
      { id: 'ouv-c-1', label: 'Fenêtres en bon état — joint et châssis intacts' },
      { id: 'ouv-c-2', label: 'Portes extérieures fonctionnelles et étanches' },
      { id: 'ouv-c-3', label: 'Garde-corps conformes et stables' },
      { id: 'ouv-c-4', label: 'Marches et paliers en bon état' },
    ],
    'non-conforme': [
      { id: 'ouv-nc-1', label: 'Garde-corps absent ou hauteur insuffisante — chute' },
      { id: 'ouv-nc-2', label: 'Marches dangereuses — risque de trébucher' },
      { id: 'ouv-nc-3', label: 'Porte de garage : arrêt sur obstacle non fonctionnel' },
    ],
    'a-corriger': [
      { id: 'ouv-ac-1', label: 'Condensation entre vitrages — scellant déficient' },
      { id: 'ouv-ac-2', label: 'Fenêtre difficile à opérer — ajustement requis' },
      { id: 'ouv-ac-3', label: 'Joint de seuil à remplacer' },
    ],
  },
  'bnq-w-ouvertures': 'walk-ouvertures',
  'bat-ouvertures':   'walk-ouvertures',

  /* ── Plomberie extérieure ────────────────────────────────────── */
  'walk-plomb-ext': {
    conforme: [
      { id: 'plomb-ext-c-1', label: 'Robinet extérieur fonctionnel — brise-vide présent' },
      { id: 'plomb-ext-c-2', label: 'Évents de plomberie dégagés' },
      { id: 'plomb-ext-c-3', label: 'Aucune fuite visible en extérieur' },
    ],
    'non-conforme': [
      { id: 'plomb-ext-nc-1', label: 'Brise-vide absent sur robinet extérieur' },
      { id: 'plomb-ext-nc-2', label: 'Fuite visible à la tuyauterie extérieure' },
    ],
    'a-corriger': [
      { id: 'plomb-ext-ac-1', label: 'Robinet extérieur difficile à opérer' },
      { id: 'plomb-ext-ac-2', label: 'Évent de plomberie partiellement obstrué' },
    ],
  },
  'bnq-w-plomb-ext': 'walk-plomb-ext',
  'bat-plomb-ext':   'walk-plomb-ext',

  /* ── Électricité extérieure ──────────────────────────────────── */
  'walk-elec-ext': {
    conforme: [
      { id: 'elec-ext-c-1', label: 'Entrée de service en bon état et bien ancrée' },
      { id: 'elec-ext-c-2', label: 'Mise à la terre visible et connectée' },
      { id: 'elec-ext-c-3', label: 'Coffret extérieur fermé et en bon état' },
    ],
    'non-conforme': [
      { id: 'elec-ext-nc-1', label: 'Mât d\'entrée mal ancré — risque structural' },
      { id: 'elec-ext-nc-2', label: 'Câblage dénudé ou mal protégé à l\'entrée' },
      { id: 'elec-ext-nc-3', label: 'Hauteur des fils insuffisante — sécurité' },
    ],
    'a-corriger': [
      { id: 'elec-ext-ac-1', label: 'Conduit d\'entrée à resécuriser' },
      { id: 'elec-ext-ac-2', label: 'Coffret à inspecter par électricien certifié' },
    ],
  },
  'bnq-w-elec-ext': 'walk-elec-ext',
  'bat-elec-ext':   'walk-elec-ext',

  /* ── Structure (intérieur) ───────────────────────────────────── */
  'aibq-v-i-17': {
    conforme: [
      { id: 'struct-c-1', label: 'Structure apparente sans déformation notable' },
      { id: 'struct-c-2', label: 'Planchers de niveau — aucun affaissement' },
      { id: 'struct-c-3', label: 'Poutres et solives sans signe de dégradation' },
    ],
    'non-conforme': [
      { id: 'struct-nc-1', label: 'Affaissement de plancher — intervention structurale' },
      { id: 'struct-nc-2', label: 'Pourriture ou dommage par eau à la structure' },
      { id: 'struct-nc-3', label: 'Fissure structurelle active — expert requis' },
    ],
    'a-corriger': [
      { id: 'struct-ac-1', label: 'Craquement excessif au plancher' },
      { id: 'struct-ac-2', label: 'Plafond légèrement déformé — surveillance' },
      { id: 'struct-ac-3', label: 'Humidité sur la structure — source à identifier' },
    ],
  },
  'aibq-v-i': 'aibq-v-i-17',

  /* ── Plomberie (intérieur) ───────────────────────────────────── */
  'aibq-v-iv': {
    conforme: [
      { id: 'plomb-c-1', label: 'Tuyauterie en bon état — aucune fuite visible' },
      { id: 'plomb-c-2', label: 'Chauffe-eau fonctionnel — soupape T&P en place' },
      { id: 'plomb-c-3', label: 'Robinet d\'arrêt principal repéré et opérationnel' },
      { id: 'plomb-c-4', label: 'Évacuation efficace — aucun refoulement' },
      { id: 'plomb-c-5', label: 'Température eau chaude dans les limites (49-60 °C)' },
    ],
    'non-conforme': [
      { id: 'plomb-nc-1', label: 'Fuite active à la tuyauterie' },
      { id: 'plomb-nc-2', label: 'Soupape T&P absente ou obstruée — surpression' },
      { id: 'plomb-nc-3', label: 'Tuyauterie en polybutylène (Poly-B) — remplacement requis' },
      { id: 'plomb-nc-4', label: 'Refoulement au drain — obstruction d\'égout' },
      { id: 'plomb-nc-5', label: 'Tuyaux de plomb suspectés — test et remplacement recommandés' },
    ],
    'a-corriger': [
      { id: 'plomb-ac-1', label: 'Chauffe-eau en fin de vie estimée' },
      { id: 'plomb-ac-2', label: 'Tuyauterie en galvanisé — remplacement à planifier' },
      { id: 'plomb-ac-3', label: 'Pression d\'eau faible — vérification recommandée' },
      { id: 'plomb-ac-4', label: 'Odeur d\'égout — joint à inspecter' },
      { id: 'plomb-ac-5', label: 'Anode chauffe-eau — entretien préventif recommandé' },
    ],
  },
  'bnq-12-3': 'aibq-v-iv',

  /* ── Électricité (intérieur) ─────────────────────────────────── */
  'aibq-v-v': {
    conforme: [
      { id: 'elec-c-1', label: 'Panneau en bon état — circuits identifiés' },
      { id: 'elec-c-2', label: 'Câblage apparent conforme — aucun fil dénudé' },
      { id: 'elec-c-3', label: 'DDFT fonctionnels aux zones humides' },
      { id: 'elec-c-4', label: 'Ampérage panneau adéquat (100 A ou plus)' },
      { id: 'elec-c-5', label: 'Circuits dédiés 240 V présents (cuisinière, sécheuse)' },
    ],
    'non-conforme': [
      { id: 'elec-nc-1', label: 'Surprotection au panneau — fusible surdimensionné' },
      { id: 'elec-nc-2', label: 'Câblage aluminium — inspection CMEQ recommandée' },
      { id: 'elec-nc-3', label: 'Panneau Federal Pacific / Zinsco — remplacement' },
      { id: 'elec-nc-4', label: 'Fil dénudé ou boîte de jonction ouverte — danger' },
      { id: 'elec-nc-5', label: 'Double-tap au panneau — non conforme, correction requise' },
    ],
    'a-corriger': [
      { id: 'elec-ac-1', label: 'Liste des circuits absente ou incomplète' },
      { id: 'elec-ac-2', label: 'Prise non mise à la terre en zone humide' },
      { id: 'elec-ac-3', label: 'Disjoncteurs difficiles à manœuvrer — usure' },
      { id: 'elec-ac-4', label: 'Panneau 60 A — mise à niveau recommandée selon usage' },
    ],
  },
  'bnq-12-4': 'aibq-v-v',

  /* ── Chauffage ───────────────────────────────────────────────── */
  'aibq-v-vi': {
    conforme: [
      { id: 'chauf-c-1', label: 'Système fonctionnel aux commandes normales' },
      { id: 'chauf-c-2', label: 'Filtres en bon état — entretien récent' },
      { id: 'chauf-c-3', label: 'Conduits de distribution sans fuite apparente' },
      { id: 'chauf-c-4', label: 'Thermostat fonctionnel — réponse correcte au réglage' },
      { id: 'chauf-c-5', label: 'Foyer / poêle : plaque certification présente et conforme' },
    ],
    'non-conforme': [
      { id: 'chauf-nc-1', label: 'Système non fonctionnel — intervention requise' },
      { id: 'chauf-nc-2', label: 'Conduit de fumée décollé — risque CO' },
      { id: 'chauf-nc-3', label: 'Tuyauterie de gaz corrodée — inspection gazière' },
      { id: 'chauf-nc-4', label: 'Échangeur thermique suspect — fissure ou odeur brûlée' },
      { id: 'chauf-nc-5', label: 'Foyer / poêle sans plaque de certification — non conforme' },
    ],
    'a-corriger': [
      { id: 'chauf-ac-1', label: 'Filtre à remplacer' },
      { id: 'chauf-ac-2', label: 'Chaudière ou fournaise en fin de vie estimée' },
      { id: 'chauf-ac-3', label: 'Bruit anormal au démarrage — inspection recommandée' },
      { id: 'chauf-ac-4', label: 'Détecteur CO absent — installation obligatoire' },
      { id: 'chauf-ac-5', label: 'Plinthe électrique défaillante dans une pièce' },
      { id: 'chauf-ac-6', label: 'Thermostat — pile à remplacer ou recalibrage recommandé' },
    ],
  },
  'bnq-12-5': 'aibq-v-vi',

  /* ── Climatisation / thermopompe ─────────────────────────────── */
  'aibq-v-vii': {
    conforme: [
      { id: 'clim-c-1', label: 'Thermopompe fonctionnelle aux commandes normales' },
      { id: 'clim-c-2', label: 'Drainage des condensats en place' },
      { id: 'clim-c-3', label: 'Unité extérieure en bon état général' },
    ],
    'non-conforme': [
      { id: 'clim-nc-1', label: 'Système non fonctionnel — intervention requise' },
      { id: 'clim-nc-2', label: 'Drainage condensats absent ou obstrué' },
    ],
    'a-corriger': [
      { id: 'clim-ac-1', label: 'Unité extérieure en fin de vie estimée' },
      { id: 'clim-ac-2', label: 'Entretien annuel recommandé' },
    ],
  },

  /* ── Intérieur architectural ─────────────────────────────────── */
  'aibq-v-viii': {
    conforme: [
      { id: 'int-c-1', label: 'Finitions en bon état général' },
      { id: 'int-c-2', label: 'Portes et fenêtres intérieures fonctionnelles' },
      { id: 'int-c-3', label: 'Escaliers et garde-corps stables' },
      { id: 'int-c-4', label: 'Aucune tache d\'humidité visible' },
      { id: 'int-c-5', label: 'Joints de silicone douche/bain intacts — aucune moisissure' },
      { id: 'int-c-6', label: 'Carrelage en bon état — joints et tuiles intacts' },
    ],
    'non-conforme': [
      { id: 'int-nc-1', label: 'Taches d\'humidité actives — infiltration en cours' },
      { id: 'int-nc-2', label: 'Moisissure visible — investigation requise' },
      { id: 'int-nc-3', label: 'Garde-corps intérieur déficient — risque de chute' },
      { id: 'int-nc-4', label: 'Joint silicone douche absent ou décollé — infiltration probable' },
    ],
    'a-corriger': [
      { id: 'int-ac-1', label: 'Taches d\'humidité anciennes — surveillance' },
      { id: 'int-ac-2', label: 'Plancher craquant excessivement' },
      { id: 'int-ac-3', label: 'Porte intérieure difficile à fermer' },
      { id: 'int-ac-4', label: 'Joints silicone à refaire dans la salle de bain' },
      { id: 'int-ac-5', label: 'Carrelage décollé ou joint fissuré — réparation à prévoir' },
    ],
  },
  'bnq-12-6': 'aibq-v-viii',

  /* ── Isolation / combles / vide sanitaire ────────────────────── */
  'aibq-v-ix': {
    conforme: [
      { id: 'iso-c-1', label: 'Isolation visible en quantité adéquate' },
      { id: 'iso-c-2', label: 'Pare-vapeur visible et intact' },
      { id: 'iso-c-3', label: 'Aucun signe de moisissure à l\'isolant' },
    ],
    'non-conforme': [
      { id: 'iso-nc-1', label: 'Isolation absente dans zone accessible' },
      { id: 'iso-nc-2', label: 'Pare-vapeur absent — condensation probable' },
      { id: 'iso-nc-3', label: 'Moisissure sur l\'isolant — humidité chronique' },
    ],
    'a-corriger': [
      { id: 'iso-ac-1', label: 'Isolation à compléter dans certaines zones' },
      { id: 'iso-ac-2', label: 'Pont thermique apparent — à corriger' },
      { id: 'iso-ac-3', label: 'Taches sur la structure — source à identifier' },
    ],
  },
  'bnq-12-7': 'aibq-v-ix',

  /* ── Ventilation ─────────────────────────────────────────────── */
  'aibq-v-x': {
    conforme: [
      { id: 'vent-c-1', label: 'Ventilation de comble adéquate — évents dégagés' },
      { id: 'vent-c-2', label: 'Ventilateurs salle de bain et cuisine fonctionnels' },
      { id: 'vent-c-3', label: 'Échangeur d\'air présent et accessible' },
    ],
    'non-conforme': [
      { id: 'vent-nc-1', label: 'Évent de sécheuse obstrué — risque d\'incendie' },
      { id: 'vent-nc-2', label: 'Ventilateur de salle de bain non fonctionnel' },
      { id: 'vent-nc-3', label: 'Ventilation de comble insuffisante' },
    ],
    'a-corriger': [
      { id: 'vent-ac-1', label: 'Échangeur d\'air à entretenir — filtres à changer' },
      { id: 'vent-ac-2', label: 'Ventilateur de cuisine évacuant dans le comble' },
      { id: 'vent-ac-3', label: 'Évent partiellement obstrué' },
    ],
  },

  /* ── Sécurité des personnes ──────────────────────────────────── */
  'aibq-v-xi': {
    conforme: [
      { id: 'secu-c-1', label: 'Détecteurs de fumée présents visuellement' },
      { id: 'secu-c-2', label: 'Détecteurs CO présents aux zones requises' },
      { id: 'secu-c-3', label: 'Garde-corps et rampes conformes en hauteur' },
      { id: 'secu-c-4', label: 'Issues d\'évacuation dégagées' },
      { id: 'secu-c-5', label: 'Clôture de piscine conforme — 1,2 m et loquet sécurité' },
      { id: 'secu-c-6', label: 'Puits anglais : grille de protection en place' },
    ],
    'non-conforme': [
      { id: 'secu-nc-1', label: 'Détecteur de fumée absent — zone requise' },
      { id: 'secu-nc-2', label: 'Détecteur CO absent — installation obligatoire' },
      { id: 'secu-nc-3', label: 'Garde-corps déficient — risque de chute grave' },
      { id: 'secu-nc-4', label: 'Clôture de piscine absente ou non conforme — Loi 33 Québec' },
      { id: 'secu-nc-5', label: 'Puits anglais sans grille — risque de chute' },
    ],
    'a-corriger': [
      { id: 'secu-ac-1', label: 'Détecteurs > 10 ans — remplacement recommandé' },
      { id: 'secu-ac-2', label: 'Rampe d\'escalier à sécuriser' },
      { id: 'secu-ac-3', label: 'Hauteur de garde-corps à vérifier' },
      { id: 'secu-ac-4', label: 'Margelle de piscine fissurée — réparation à prévoir' },
    ],
  },
  'bnq-12-8': 'aibq-v-xi',
};

  /* ── Matières dangereuses ───────────────────────────────────── */
  'aibq-matieres-dan': {
    conforme: [
      { id: 'md-c-1', label: 'Aucun indice visuel de matière dangereuse observé' },
      { id: 'md-c-2', label: 'Isolation combles : fibre de verre ou cellulose (non amianté probable)' },
      { id: 'md-c-3', label: 'Dalle en béton sans fissure en réseau — pyrite non suspectée' },
    ],
    'non-conforme': [
      { id: 'md-nc-1', label: 'Isolant en vrac granuleux argenté (vermiculite/Zonolite) — test amiante recommandé' },
      { id: 'md-nc-2', label: 'Plafond popcorn / tuiles acoustiques — analyse amiante recommandée' },
      { id: 'md-nc-3', label: 'Dalle soulevée / fissures en réseau — test pyrite recommandé' },
      { id: 'md-nc-4', label: 'Tuyaux de plomb suspectés — analyse et remplacement recommandés' },
      { id: 'md-nc-5', label: 'Isolant en mousse jaune/beige dans les murs — FUUF possible (pré-1982)' },
      { id: 'md-nc-6', label: 'Réservoir d\'huile présent — risque de contamination du sol' },
      { id: 'md-nc-7', label: 'Thermostat à ampoule de mercure — retrait par récupérateur recommandé' },
    ],
    'a-corriger': [
      { id: 'md-ac-1', label: 'Test de radon recommandé — région à risque modéré à élevé' },
      { id: 'md-ac-2', label: 'Peinture écaillée sur boiseries pré-1975 — test plomb recommandé' },
      { id: 'md-ac-3', label: 'BPC possible (ballasts néon pré-1990) — signaler à l\'acheteur' },
    ],
  },
  'bnq-matieres-dan': 'aibq-matieres-dan',

/** Résout un alias de section (chaîne de référence) */
function resolveSection(sectionId) {
  const entry = SECTION_PRESETS[sectionId];
  if (typeof entry === 'string') return SECTION_PRESETS[entry] ?? null;
  return entry ?? null;
}

const PRESET_INDEX = new Map();
for (const list of Object.values(QUICK_RESPONSES)) {
  for (const p of list) PRESET_INDEX.set(p.id, p.label);
}
for (const entry of Object.values(SECTION_PRESETS)) {
  if (typeof entry === 'object' && entry !== null) {
    for (const list of Object.values(entry)) {
      for (const p of list) PRESET_INDEX.set(p.id, p.label);
    }
  }
}

export function getPresetsForStatus(status, sectionId) {
  if (!status) return [];
  const global = QUICK_RESPONSES[status] ?? [];
  if (!sectionId) return global;
  const ctx = resolveSection(sectionId);
  const contextual = ctx?.[status] ?? [];
  return [...contextual, ...global];
}

export function presetLabel(id) {
  return PRESET_INDEX.get(id) ?? id;
}

export function normalizeChecklistItem(item) {
  if (!item) return item;
  if (!Array.isArray(item.selectedPresets)) item.selectedPresets = [];
  if (item.inspectorComment == null) {
    item.inspectorComment =
      item.selectedPresets.length === 0 && item.note ? String(item.note) : '';
  }
  if (!item.note) item.note = '';
  return item;
}

export function normalizeInspectionItems(inspection) {
  normalizeInspectionSections(inspection);
  inspection?.sections?.forEach((sec) => {
    iterSectionItems(sec, (item) => normalizeChecklistItem(item));
  });
  return inspection;
}

export function formatItemDocumentation(item) {
  normalizeChecklistItem(item);
  const presets = (item.selectedPresets || [])
    .map(presetLabel)
    .filter(Boolean)
    .join(' · ');
  const comment = (item.inspectorComment || '').trim();
  const parts = [];
  if (presets) parts.push(presets);
  if (comment) parts.push(comment);
  return parts.join('\n\n');
}

export function hasItemDocumentation(item) {
  normalizeChecklistItem(item);
  return (
    (item.selectedPresets?.length ?? 0) > 0 || Boolean((item.inspectorComment || '').trim())
  );
}
