(() => {
  // js/section-structure.js
  function createItems(parentId, labels) {
    return (labels || []).map((label, i) => ({
      id: `${parentId}-${i + 1}`,
      label,
      status: null,
      priority: "mineur",
      note: "",
      selectedPresets: [],
      inspectorComment: "",
      photos: []
    }));
  }
  function createSubsection(id, title, labels) {
    return { id, title, items: createItems(id, labels) };
  }
  function createSection(id, title, arg) {
    if (Array.isArray(arg)) {
      return { id, title, items: createItems(id, arg), subsections: [] };
    }
    const config = arg && typeof arg === "object" ? arg : {};
    const subsections = (config.subsections || []).map((sub, i) => {
      if (typeof sub.items?.[0] === "string") {
        return createSubsection(sub.id || `${id}-sub-${i + 1}`, sub.title, sub.items);
      }
      normalizeSection(sub);
      return sub;
    });
    return {
      id,
      title,
      items: createItems(id, config.items || []),
      subsections
    };
  }
  function normalizeSection(section3) {
    if (!section3) return section3;
    if (!Array.isArray(section3.items)) section3.items = [];
    if (!Array.isArray(section3.subsections)) section3.subsections = [];
    section3.subsections.forEach((sub, i) => {
      if (!sub.id) sub.id = `${section3.id}-sub-${i + 1}`;
      if (!Array.isArray(sub.items)) sub.items = [];
    });
    return section3;
  }
  function normalizeInspectionSections(inspection) {
    inspection?.sections?.forEach(normalizeSection);
    return inspection;
  }
  function sectionHasSubsections(section3) {
    normalizeSection(section3);
    return section3.subsections.length > 0;
  }
  function isInfoSection(sectionId) {
    return [
      "aibq-normes",
      "bnq-normes",
      "aibq-ch1",
      "aibq-ch2",
      "aibq-ch3-limites",
      "aibq-ch3-excl",
      "aibq-ch4",
      "aibq-annexe",
      "bnq-ch2",
      "bnq-ch4",
      "bnq-ch5",
      "bnq-ch6",
      "bnq-ch7",
      "bnq-ch8",
      "bnq-ch9",
      "bnq-ch10",
      "bnq-ch11"
    ].includes(sectionId);
  }
  function subsectionCount(section3) {
    normalizeSection(section3);
    return section3.subsections.length;
  }
  function getSectionItemGroups(section3) {
    normalizeSection(section3);
    const groups = [];
    if (section3.items.length > 0) {
      groups.push({ subIndex: -1, title: null, items: section3.items });
    }
    section3.subsections.forEach((sub, subIndex) => {
      if (sub.items.length > 0) {
        groups.push({ subIndex, title: sub.title, items: sub.items, id: sub.id });
      }
    });
    return groups;
  }
  function iterSectionItems(section3, callback) {
    getSectionItemGroups(section3).forEach(({ items, subIndex, title }) => {
      items.forEach((item, ii) => callback(item, subIndex, ii, title));
    });
  }
  function itemsProgress(items, sectionId) {
    if (sectionId && isInfoSection(sectionId)) return { total: 0, answered: 0, pct: 100 };
    const total = items.length;
    if (!total) return { total: 0, answered: 0, pct: 0 };
    const answered = items.filter((it) => it.status).length;
    return { total, answered, pct: Math.round(answered / total * 100) };
  }
  function sectionProgress(section3) {
    normalizeSection(section3);
    if (isInfoSection(section3.id)) {
      return { total: 0, answered: 0, pct: 100 };
    }
    let total = 0;
    let answered = 0;
    iterSectionItems(section3, (item) => {
      total += 1;
      if (item.status) answered += 1;
    });
    return {
      total,
      answered,
      pct: total ? Math.round(answered / total * 100) : 0
    };
  }
  function sectionStats(section3) {
    normalizeSection(section3);
    const stats = { pending: 0, nc: 0, ac: 0, conforme: 0, na: 0, photos: 0, total: 0 };
    if (isInfoSection(section3.id)) return stats;
    iterSectionItems(section3, (item) => {
      stats.total += 1;
      if (!item.status) stats.pending += 1;
      else if (item.status === "non-conforme") stats.nc += 1;
      else if (item.status === "a-corriger") stats.ac += 1;
      else if (item.status === "conforme") stats.conforme += 1;
      else if (item.status === "na") stats.na += 1;
      if ((item.photos?.length || 0) > 0) stats.photos += 1;
    });
    return stats;
  }
  function formatItemLocation(sectionTitle, subsectionTitle) {
    if (subsectionTitle) return `${sectionTitle} \u2014 ${subsectionTitle}`;
    return sectionTitle;
  }
  var AIBQ_WALK_ORDER = [
    "aibq-ch1",
    "aibq-ch2",
    "aibq-ch3-limites",
    "aibq-ch3-excl",
    "aibq-ch4",
    "aibq-visite-ext",
    "aibq-v-i",
    "aibq-v-iv",
    "aibq-v-v",
    "aibq-v-vi",
    "aibq-v-vii",
    "aibq-v-viii",
    "aibq-v-ix",
    "aibq-v-x",
    "aibq-v-xi",
    "aibq-grenier",
    "aibq-annexe",
    "aibq-v-ii",
    "aibq-v-iii"
  ];
  var BNQ_WALK_ORDER = [
    "bnq-ch2",
    "bnq-ch4",
    "bnq-ch5",
    "bnq-ch6",
    "bnq-ch7",
    "bnq-ch8",
    "bnq-visite-ext",
    "bnq-12-3",
    "bnq-12-4",
    "bnq-12-5",
    "bnq-12-6",
    "bnq-12-7",
    "bnq-12-8",
    "bnq-grenier",
    "bnq-ch9",
    "bnq-ch10",
    "bnq-ch11",
    "bnq-12-1",
    "bnq-12-2"
  ];
  var BATIMENT_WALK_ORDER = [
    "bat-visite-ext",
    "structure-int",
    "securite",
    "incendie-res",
    "electrique",
    "plomberie",
    "bat-grenier",
    "exterieur",
    "toiture",
    "structure"
  ];
  function applyFieldWalkOrder(inspection) {
    if (!inspection?.sections?.length) return inspection;
    let order;
    if (inspection.templateId === "aibq-preachat") order = AIBQ_WALK_ORDER;
    else if (inspection.templateId === "bnq-3009") order = BNQ_WALK_ORDER;
    else if (inspection.templateId === "batiment") order = BATIMENT_WALK_ORDER;
    else return inspection;
    const byId = new Map(inspection.sections.map((s) => [s.id, s]));
    const sorted = [];
    for (const id of order) {
      if (byId.has(id)) sorted.push(byId.get(id));
    }
    for (const sec of inspection.sections) {
      if (!order.includes(sec.id)) sorted.push(sec);
    }
    inspection.sections = sorted;
    return inspection;
  }

  // js/field-walk-sections.js
  var AIBQ_VISITE_EXTERIEURE = createSection(
    "aibq-visite-ext",
    "Visite ext\xE9rieure \u2014 ordre terrain",
    {
      subsections: [
        createSubsection("walk-terrain", "1. Terrain \u2014 pente et drainage", [
          "23.7 V\xE9g\xE9tation, pentes, drainage, murs de sout\xE8nement nuisibles",
          "Pente du terrain vers les fondations (\xE9loignement de l'eau)",
          "\xC9vacuation des eaux de surface et regards de drainage visibles",
          "Murs de sout\xE8nement, terrasses contre le b\xE2timent",
          "Cl\xF4ture de propri\xE9t\xE9 \u2014 \xE9tat g\xE9n\xE9ral (non couverte par la norme, signalement si s\xE9curit\xE9)",
          "Piscine / spa / bassin : pr\xE9sence de cl\xF4ture de s\xE9curit\xE9 (Loi 33 Qu\xE9bec, 1,2\u202fm min.)",
          "Margelle de piscine/spa : \xE9tat des joints, fissures, stabilit\xE9",
          "Fosse septique / champ d'\xE9puration : localisation et acc\xE8s (si non reli\xE9 au r\xE9seau municipal)"
        ]),
        createSubsection("walk-fondations", "2. Fondations et parties visibles", [
          "17.1 Fondations \u2014 observation et description",
          "Semelle, vide sanitaire ou sous-sol visible depuis l'ext\xE9rieur",
          "Fissures, affaissement, infiltration au pourtour des fondations",
          "Mur de fondation / partie de mur expos\xE9e (efflorescence, dommages)",
          "Drain fran\xE7ais : sortie visible, \xE9tat, type (si observable)",
          "Membrane d'imp\xE9rm\xE9abilisation : visible ou non (noter si absence probable)",
          "Tirants d'ancrage (mur de blocs) : pr\xE9sence visible et \xE9tat"
        ]),
        createSubsection("walk-toiture", "3. Toiture", [
          "26.1 Rev\xEAtement de toiture \u2014 condition",
          "26.2 Goutti\xE8res, descentes, \xE9vacuation des eaux",
          "26.3 Solins (chemin\xE9e, mur, lucarne)",
          "26.4 Lanterneaux, chemin\xE9es ext\xE9rieures, \xE9mergences",
          "27 M\xE9thode d'observation de la toiture document\xE9e",
          "28 Exclusions : accessoires fix\xE9s, int\xE9rieur des chemin\xE9es",
          "Glace en rive / barrage de glace : traces, dommages ou conditions favorisantes (Qu\xE9bec)",
          "Ventilation soffite : grilles d\xE9gag\xE9es et non obstru\xE9es (visible de l'ext\xE9rieur)",
          "\xC2ge estim\xE9 du rev\xEAtement (noter si fin de vie probable)"
        ]),
        createSubsection("walk-facades", "4. Fa\xE7ades ext\xE9rieures", [
          "23.1 Rev\xEAtements muraux, boiseries, solins",
          "23.4 Avant-toits, fascias, sous-faces",
          "\xC9caillage, fissures, pourriture ou corrosion des rev\xEAtements"
        ]),
        createSubsection("walk-plomb-ext", "5. Plomberie ext\xE9rieure", [
          "30.2 Robinet d'arr\xEAt principal \u2014 localisation (si visible \xE0 l'ext\xE9rieur)",
          "30.8 Robinets ext\xE9rieurs et brise-vide",
          "30.9 Eau jaun\xE2tre/rouge\xE2tre dans puisards",
          "31.2-31.6 Fuites, drains, clapets, regards, puisards (ext\xE9rieur)",
          "\xC9vents de plomberie et raccords apparents sur la fa\xE7ade"
        ]),
        createSubsection("walk-elec-ext", "6. \xC9lectricit\xE9 \u2014 branchement ext\xE9rieur", [
          "37.1 Entr\xE9e de service (a\xE9rien / souterrain)",
          "37.2 Mise \xE0 la terre (borne visible)",
          "37.3 Coffret de branchement principal (ext\xE9rieur si applicable)",
          "M\xE2t, conduit, ancrage et hauteur de fils (s\xE9curit\xE9)"
        ]),
        createSubsection("walk-ouvertures", "7. Fen\xEAtres, portes, marches et acc\xE8s", [
          "23.2 Fen\xEAtres et portes permanentes ext\xE9rieures",
          "23.3 Trottoirs, terrasses, balcons, marches, balustrades",
          "23.5 Commandes et s\xE9curit\xE9 portes de garage",
          "23.6 Porte de garage : arr\xEAt sur obstacle \xE0 la fermeture",
          "24 Portes ext\xE9rieures et garage actionn\xE9es (commande normale)",
          "25 Exclusions not\xE9es : contre-fen\xEAtres, cl\xF4tures, g\xE9otechnique, quais"
        ])
      ]
    }
  );
  var AIBQ_STRUCTURE_APRES_EXT = createSection(
    "aibq-v-i",
    "Section I \u2014 Structure (int\xE9rieur / arts 17-22)",
    {
      subsections: [
        createSubsection("aibq-v-i-17", "Art. 17 \u2014 \xC9l\xE9ments structurels (int\xE9rieur)", [
          "17.2 Planchers \u2014 d\xE9formation, affaissement",
          "17.3 Murs porteurs et cloisons",
          "17.4 Colonnes et poutres",
          "17.5 Poutres et solives apparentes",
          "17.6 Plafonds structurels",
          "17.7 Toit (structure int\xE9rieure \u2014 d\xE9tail aux combles si visit\xE9s en fin)"
        ]),
        createSubsection("aibq-v-i-18-20", "Arts 18-20 \u2014 Acc\xE8s et m\xE9thodes", [
          "18 Piquage repr\xE9sentatif si d\xE9t\xE9rioration (sans dommage ni risque)",
          "19 P\xE9n\xE9tration vide sanitaire/combles si passage libre et s\xE9curitaire",
          "20 M\xE9thodes de visite des combles et vide sanitaire document\xE9es"
        ]),
        createSubsection("aibq-v-i-22", "Art. 22 \u2014 Limites", [
          "22 Pas d'ing\xE9nierie ni avis sur capacit\xE9 portante"
        ])
      ]
    }
  );
  var BNQ_VISITE_EXTERIEURE = createSection(
    "bnq-visite-ext",
    "Visite ext\xE9rieure \u2014 ordre terrain (BNQ art. 12)",
    {
      subsections: [
        createSubsection("bnq-w-terrain", "1. Terrain \u2014 pente et drainage", [
          "12.2.1f V\xE9g\xE9tation, pentes, murs de sout\xE8nement, eau de surface",
          "Pente du terrain vers les fondations",
          "Drainage de surface et \xE9loignement de l'eau des fondations",
          "Piscine / spa / bassin : cl\xF4ture de s\xE9curit\xE9 conforme (Loi 33 Qu\xE9bec, 1,2 m min.)",
          "Margelle de piscine/spa : \xE9tat des joints, fissures, stabilit\xE9",
          "Fosse septique / champ d'\xE9puration : localisation visible (si applicable)"
        ]),
        createSubsection("bnq-w-fondations", "2. Fondations et composantes structurales visibles", [
          "12.1.1a Charpente et fondations",
          "Fissures, soul\xE8vement, d\xE9t\xE9rioration fondations / dalle flottante",
          "Infiltration, aur\xE9oles, efflorescence au pourtour",
          "D\xE9placement relatif, affaissement visible",
          "Drain fran\xE7ais : sortie visible, \xE9tat (si observable)",
          "Membrane d'imp\xE9rm\xE9abilisation visible (ou absence probable \xE0 noter)"
        ]),
        createSubsection("bnq-w-toiture", "3. Toiture", [
          "12.2.1c Toiture : couverture, drainage, solins, lucarnes, chemin\xE9e, \xE9vents",
          "12.2.1e Goutti\xE8res et descentes",
          "Couverture pentue : bardeaux, ventilation toit, glaceaux",
          "Toit plat : membrane, gravier, zones d\xE9nud\xE9es",
          "Glace en rive / barrage de glace : traces, dommages ou conditions favorisantes",
          "Ventilation soffite : grilles d\xE9gag\xE9es et non obstru\xE9es (visible de l'ext\xE9rieur)",
          "\xC2ge estim\xE9 du rev\xEAtement (noter si fin de vie probable)"
        ]),
        createSubsection("bnq-w-facades", "4. Fa\xE7ades ext\xE9rieures", [
          "12.2.1a Rev\xEAtements, ma\xE7onnerie, solins",
          "D\xE9t\xE9rioration rev\xEAtement : pourriture, rouille, peinture \xE9caill\xE9e",
          "Ma\xE7onnerie : joints, briques, weep holes",
          "Infiltration : calfeutrage, solins, balcon/joist rim"
        ]),
        createSubsection("bnq-w-plomb-ext", "5. Plomberie ext\xE9rieure", [
          "12.3.1c Distribution ext\xE9rieure et branchement irrigation (clapet anti-retour)",
          "12.3.1d \xC9vacuation, ventilation, drains, \xE9vents ext\xE9rieurs",
          "12.3.1g Puisards, fosses, bassins de drainage",
          "Drain de garage et couvercle r\xE9sistant aux charges"
        ]),
        createSubsection("bnq-w-elec-ext", "6. \xC9lectricit\xE9 \u2014 branchement ext\xE9rieur", [
          "12.4.1a M\xE2t, conduit, mise \xE0 terre, bo\xEEtier de service",
          "Ancrage m\xE2t et conduit d'entr\xE9e",
          "Liaison \xE9quipotentielle conduite m\xE9tallique eau/gaz (si visible)",
          "Protection m\xE9canique alimentation thermopompe ext\xE9rieure",
          "Moyen de d\xE9connexion pr\xE8s unit\xE9 ext\xE9rieure CVAC"
        ]),
        createSubsection("bnq-w-ouvertures", "7. Fen\xEAtres, portes, marches et acc\xE8s", [
          "12.2.1b Contre-fen\xEAtres, moustiquaires (non accessoires saisonniers)",
          "12.2.1d Acc\xE8s : entr\xE9es, terrasses, balcons, escaliers, garde-corps",
          "Fixation et stabilit\xE9 des assemblages ext\xE9rieurs",
          "Garde-corps : absence, hauteur, configuration"
        ])
      ]
    }
  );
  var BATIMENT_VISITE_EXTERIEURE = [
    createSubsection("bat-terrain", "1. Terrain \u2014 pente et drainage", [
      "Pente du terrain et \xE9vacuation des eaux loin des fondations",
      "Drainage de surface, regards, drain fran\xE7ais visible",
      "V\xE9g\xE9tation et racines pr\xE8s des murs de fondation",
      "Piscine / spa : cl\xF4ture de s\xE9curit\xE9 conforme (Loi 33 Qu\xE9bec)",
      "Margelle de piscine/spa : \xE9tat des joints, fissures, stabilit\xE9",
      "Fosse septique / champ d'\xE9puration : localisation (si applicable)"
    ]),
    createSubsection("bat-fondations", "2. Fondations et parties visibles", [
      "Fondations et drainage apparent sans infiltration active",
      "Fissures ou affaissement visible au pourtour",
      "Mur de fondation / partie de mur expos\xE9e"
    ]),
    createSubsection("bat-toiture", "3. Toiture", [
      "Couverture, solins et \xE9vacuation des eaux",
      "Goutti\xE8res, descentes et \xE9mergences (chemin\xE9e, \xE9vents)",
      "M\xE9thode d'observation document\xE9e (sol, \xE9chelle, drone, etc.)"
    ]),
    createSubsection("bat-facades", "4. Fa\xE7ades ext\xE9rieures", [
      "Rev\xEAtements muraux, ma\xE7onnerie et solins",
      "Avant-toits, fascias et sous-faces"
    ]),
    createSubsection("bat-plomb-ext", "5. Plomberie ext\xE9rieure", [
      "Robinets ext\xE9rieurs et brise-vide",
      "Regards, puisards et \xE9vacuations ext\xE9rieures",
      "Entr\xE9e d'eau / robinet principal si visible"
    ]),
    createSubsection("bat-elec-ext", "6. \xC9lectricit\xE9 \u2014 branchement ext\xE9rieur", [
      "Entr\xE9e de service, m\xE2t et coffret ext\xE9rieur",
      "Mise \xE0 la terre visible",
      "Thermopompe / unit\xE9 ext\xE9rieure \u2014 alimentation et d\xE9gagement"
    ]),
    createSubsection("bat-ouvertures", "7. Fen\xEAtres, portes, marches et acc\xE8s", [
      "Fen\xEAtres et portes ext\xE9rieures : \xE9tanch\xE9it\xE9 et fonctionnement",
      "Portes de garage : s\xE9curit\xE9 et capteurs",
      "Terrasses, balcons, escaliers et garde-corps ext\xE9rieurs"
    ])
  ];
  var AIBQ_GRENIER = createSection(
    "aibq-grenier",
    "Grenier / combles \u2014 fin de visite (si accessible)",
    [
      "Acc\xE8s au grenier : trappe, \xE9chelle, garde-corps et s\xE9curit\xE9",
      "Si inaccessible : noter la raison (verrouill\xE9, encombrement, risque, absence d'\xE9chelle)",
      "19 P\xE9n\xE9tration des combles si passage libre et s\xE9curitaire",
      "20 M\xE9thode de visite des combles document\xE9e",
      "17.7 Toit \u2014 structure visible depuis les combles",
      "55 Isolation et pare-vapeur visibles (combles)",
      "57.1 Ventilation des combles",
      "59.8 Murs coupe-feu en combles (si visibles)",
      "59.9 D\xE9gagement autour des chemin\xE9es visible depuis les combles",
      "Traces d'humidit\xE9, condensation ou moisissure \u2014 d\xE9tecteur si suspect"
    ]
  );
  var BNQ_GRENIER = createSection(
    "bnq-grenier",
    "Grenier / combles \u2014 fin de visite (si accessible)",
    [
      "12.7 Combles / espace de toit : isolation, ventilation amont",
      "Acc\xE8s impossible ou refus\xE9 \u2014 documenter la raison",
      "Condensation ou moisissure en espace non fini",
      "Pare-vapeur et continuit\xE9 (si observable)",
      "Structure de toit / fermes visibles depuis les combles",
      "\xC9clairage et s\xE9curit\xE9 pendant la visite des combles"
    ]
  );
  function batimentGrenierSection() {
    return createSection("bat-grenier", "Grenier / combles \u2014 fin de visite (si accessible)", [
      "Acc\xE8s au grenier : trappe, \xE9chelle, s\xE9curit\xE9",
      "Si inaccessible : raison not\xE9e (verrou, encombrement, risque)",
      "Isolation des combles visible",
      "Ventilation des combles (\xE9vents, soffites)",
      "Structure de toit et solives \u2014 \xE9tat apparent",
      "Fuites, taches ou moisissures visibles",
      "D\xE9gagement autour chemin\xE9e / \xE9mergences si visible"
    ]);
  }

  // js/templates-aibq-bnq-full.js
  var section = createSection;
  var AIBQ_SECTIONS = [
    section("aibq-normes", "Normes de pratique", [
      "Norme de pratique AIBQ \u2014 Inspection pr\xE9achat r\xE9sidentiel"
    ]),
    AIBQ_VISITE_EXTERIEURE,
    AIBQ_STRUCTURE_APRES_EXT,
    section("aibq-v-iv", "Section IV \u2014 Plomberie (arts 29-36)", [
      "29 Chasses, robinets et robinets d'arrosage actionn\xE9s",
      "30.1 Mat\xE9riaux tuyauterie d'amen\xE9e (cuivre, PEX, galvanis\xE9, plomb \u2014 noter si plomb)",
      "30.2 Robinet d'arr\xEAt principal et localisation",
      "30.3 Mat\xE9riaux distribution int\xE9rieure (polybutyl\xE8ne Poly-B \u2014 noter si pr\xE9sent)",
      "30.4 Condition appareils et robinets int\xE9rieurs",
      "30.5 \xC9coulement efficace aux robinets",
      "30.6 Absence de raccordements nuisibles ou crois\xE9s",
      "30.7 Fuites d'eau visibles",
      "30.8 Robinets ext\xE9rieurs et brise-vide",
      "30.9 Eau jaun\xE2tre/rouge\xE2tre dans puisards",
      "31.1 Mat\xE9riaux \xE9vacuation et ventilation",
      "31.2-31.6 Fuites, drains, clapets, regards, puisards",
      "31.7 \xC9coulement efficace du syst\xE8me d'\xE9vacuation",
      "32 Chauffe-eau : capacit\xE9, ann\xE9e, \xE9nergie, soupape T&P, \xE9vacuation rigide T&P, plateau drain",
      "Chauffe-eau : anode magn\xE9sium (v\xE9rifiable si accessible), temp\xE9rature r\xE9gl\xE9e 49-60 \xB0C",
      "33 Pompes d\xE9chets, cuves \xE0 lessive, puisards \u2014 test commandes",
      "34 Fosse septique / champ d'\xE9puration : signalement si non reli\xE9 au r\xE9seau municipal",
      "35-36 Exclusions : traitement eau, qualit\xE9 eau, broyeurs"
    ]),
    section("aibq-v-v", "Section V \u2014 \xC9lectricit\xE9 (arts 37-40)", [
      "37.1 Entr\xE9e de service (a\xE9rien / souterrain)",
      "37.2 Mise \xE0 la terre",
      "37.3 Coffret de branchement principal",
      "37.4 Panneaux principal et secondaires (capacit\xE9 : 60 A / 100 A / 150 A / 200 A, protection)",
      "37.5 C\xE2bles de d\xE9rivation et compatibilit\xE9 fusibles/disjoncteurs",
      "37.6 Intensit\xE9 nominale du disjoncteur/fusible principal",
      "37.7 \xC9chantillon luminaires et interrupteurs int./ext.",
      "37.8 Polarit\xE9 et mise \xE0 la terre \u2014 \xE9chantillon de prises",
      "37.9 DDFT : fonctionnement et pr\xE9sence o\xF9 requis (SDB, cuisine, garage, ext\xE9rieur)",
      "37.10 Disjoncteurs anti-arcs (AFCI) \u2014 pr\xE9sence aux chambres",
      "Double-tap au panneau : deux fils sur un m\xEAme disjoncteur (non conforme)",
      "Circuits d\xE9di\xE9s 240 V : cuisini\xE8re, s\xE9cheuse, chauffe-eau \xE9lectrique, borne V\xC9",
      "Panneau \xE0 fusibles / Federal Pacific / Zinsco \u2014 signalement et expertise recommand\xE9e",
      "38 Ouverture coffrets/panneaux si s\xE9curitaire (raison si non)",
      "39 Pas d'outils dans panneaux ni d\xE9montage",
      "40 Exclusions : basse tension, t\xE9l\xE9phone, c\xE2ble, s\xE9curit\xE9"
    ]),
    section("aibq-v-vi", "Section VI \u2014 Chauffage (arts 41-44)", [
      "41.1 Source d'\xE9nergie et type d'\xE9quipement (gaz, mazout, \xE9lectrique, bois, bi\xE9nergie)",
      "41.2 Commandes normales et dispositifs de s\xE9curit\xE9",
      "Thermostat(s) : fonctionnement, pile (si batterie), programmable ou non",
      "Plinthe \xE9lectrique : test par pi\xE8ce habitable (chauffe ou non)",
      "41.3 Chemin\xE9es, conduits de fum\xE9e, stabilisateurs \u2014 ext\xE9rieur",
      "41.4 Distribution : conduits, tuyauterie, radiateurs, registres, filtres",
      "\xC9changeur thermique (fournaise \xE0 air) : inspection visuelle \u2014 fissures, rouille, odeur br\xFBl\xE9e",
      "Foyer / po\xEAle \xE0 bois / granules : plaque de certification ULC, d\xE9gagement, \xE9tat de la porte",
      "41.5 Source de chaleur permanente par pi\xE8ce habitable / sous-sol / vide sanitaire",
      "41.6 R\xE9servoir combustible : localisation, ann\xE9e, fuites, supports, tuyauterie",
      "42 Mise en marche par commandes normales",
      "43 Panneaux d'acc\xE8s fabricant ouverts sans outils si possible",
      "44 Exclusions : int\xE9rieur chemin\xE9es/appareils, humidificateurs, uniformit\xE9 chaleur"
    ]),
    section("aibq-v-vii", "Section VII \u2014 Climatisation / thermopompe (arts 45-49)", [
      "45 Mise en marche par commandes normales",
      "46.1 Source d'\xE9nergie et type d'\xE9quipement de refroidissement",
      "46.2 Localisation et drainage condensats",
      "47 Conduits de distribution du syst\xE8me de refroidissement",
      "48 Exclusion : appareils portatifs ou amovibles",
      "49 Exclusion : uniformit\xE9/suffisance air froid"
    ]),
    section("aibq-v-viii", "Section VIII \u2014 Int\xE9rieur (arts 50-54)", [
      "50.1 Murs, planchers, plafonds \u2014 finition et condition",
      "50.2 Marches, escaliers, balcons, balustrades int\xE9rieurs",
      "50.3 Armoires et comptoirs",
      "50.4 Fen\xEAtres et portes int\xE9rieures, quincaillerie",
      "50.5 S\xE9paration habitable / garage (coupe-feu, porte coupe-feu, joint)",
      "51 \xC9chantillon fen\xEAtres et portes int\xE9rieures actionn\xE9es",
      "52 Infiltrations, taches, condensation, moisissures \u2014 d\xE9tecteur humidit\xE9 si suspect",
      "Salle de bain : joints de silicone douche/bain \u2014 \xE9tat, d\xE9collements, moisissure",
      "Carrelage salle de bain / cuisine : fissures, d\xE9collements, joints d\xE9t\xE9rior\xE9s",
      "Bouche de chaleur / registre : pr\xE9sence et d\xE9gagement par pi\xE8ce habitable",
      "53 Exclusions : papier peint, carpettes, rideaux, \xE9lectrom\xE9nagers"
    ]),
    section("aibq-v-ix", "Section IX \u2014 Isolation (arts 55-56)", [
      "55 Isolation et pare-vapeur visibles (combles, murs, plafonds, planchers non finis)",
      "56 Exclusion : conformit\xE9, uniformit\xE9, suffisance aux normes"
    ]),
    section("aibq-v-x", "Section X \u2014 Ventilation (arts 57-58)", [
      "57.1 Ventilation combles, sous-sol, vide sanitaire",
      "57.2 Ventilateurs cuisine et salles de bain \u2014 test fonctionnement",
      "Hotte de cuisine : \xE9vacuation ext\xE9rieure (pr\xE9f\xE9rable) ou recirculation \u2014 noter le type",
      "57.3 \xC9vacuation s\xE9cheuse \u2014 extr\xE9mit\xE9 ext\xE9rieure d\xE9gag\xE9e",
      "57.4 \xC9changeur d'air (VRC/VRE) : pr\xE9sence, localisation, \xE9tat des filtres",
      "57.5 Panneaux d'acc\xE8s \xE9changeur ouverts",
      "Ventilation m\xE9canis\xE9e sous-sol si espace non fini",
      "58 Exclusion : conformit\xE9 et qualit\xE9 de l'air int\xE9rieur"
    ]),
    section("aibq-v-xi", "Section XI \u2014 S\xE9curit\xE9 des personnes (arts 59-60)", [
      "59.1 Rampes, balustrades, mains courantes",
      "59.2 \xC9l\xE9ments sous tension pr\xE8s d'une source d'eau",
      "59.3 Moyens et issues d'\xE9vacuation",
      "59.4 Acc\xE8s piscines, spas, bassins : cl\xF4ture 1,2 m min. obligatoire (Loi 33 Qu\xE9bec)",
      "59.4 Piscine : margelle \u2014 \xE9tat des joints, fissures, stabilit\xE9",
      "59.4 Piscine : dispositif de verrouillage (loquet auto-fermant \xE0 l'\xE9preuve des enfants)",
      "59.5 Paliers",
      "59.6 Fen\xEAtres \xE0 hauteur non s\xE9curitaire \u2014 risque de chute, puits anglais \xE0 couvrir",
      "Puits anglais (fen\xEAtres sous-sol) : grille de protection contre les chutes",
      "59.7 Escaliers",
      "59.8 Murs coupe-feu en combles",
      "59.9 D\xE9gagement autour des chemin\xE9es visibles",
      "60.1 D\xE9tecteurs de fum\xE9e \u2014 pr\xE9sence et emplacement (par palier, chambre)",
      "60.2 D\xE9tecteurs de monoxyde de carbone \u2014 pr\xE9sence (obligatoire si combustion ou garage)",
      "Gicleurs / sprinklers \u2014 si pr\xE9sents : \xE9tat apparent, signalement si manquants (multi)"
    ]),
    AIBQ_GRENIER,
    section("aibq-matieres-dan", "Mati\xE8res dangereuses potentielles \u2014 signalement visuel", [
      "\u26a0\ufe0f L'inspecteur ne teste pas, ne pr\xE9l\xE8ve pas et n'identifie pas avec certitude les mati\xE8res dangereuses (art. 11.4 AIBQ). Il signale les indices visuels et recommande une expertise sp\xE9cialis\xE9e.",
      createSubsection("Amiante (maisons pr\xE9-1980)"),
      "Bardeaux de toit en amiante-ciment (gris cendr\xE9, texture fibreuse)",
      "Isolant autour des tuyaux de chauffage / vapeur (enveloppe blanche ou grise effiloch\xE9e)",
      "Tuiles de plancher vinyl-amiante 30x30 cm (pattern marbre\xB4) + colle noire sous-plancher",
      "Plafond \u00abpopcorn\u00bb (texture acoustique projet\xE9e) ou dalles acoustiques en fibre",
      "Isolant en vrac dans les combles \u2014 aspect granuleux argent\xE9 (vermiculite Zonolite)",
      createSubsection("Pyrite / Pyrrhotite (sp\xE9cifique Qu\xE9bec)"),
      "Soul\xE8vement de la dalle de b\xE9ton \u2014 bosse centrale ou fissures en carte g\xE9ographique",
      "Fissures en r\xE9seau hexagonal sur la surface de la dalle \u2014 indicateur pyrite",
      "Zones affect\xE9es : Basses-Laurentides, Lanaudi\xE8re, Laurentides, Mauricie (pyrrhotite)",
      "Recommander test de sulfure au laboratoire si indices pr\xE9sents",
      createSubsection("Plomb (maisons pr\xE9-1975)"),
      "Peinture au plomb \u2014 couches superpos\xE9es \xE9caill\xE9es sur boiseries, fen\xEAtres, escaliers",
      "Tuyaux de plomb \xE0 l'entr\xE9e principale (gris fonc\xE9 mat, mall\xE9ables)",
      "Soudures au plomb sur joints de tuyaux de cuivre (avant 1986)",
      createSubsection("FUUF \u2014 Mousse ur\xE9e-formald\xE9hyde (ann\xE9es 1970-1980)"),
      "Isolant inject\xE9 dans les murs ext\xE9rieurs \u2014 aspect jaune/beige friable, odeur d'ammoniac",
      "Interdit au Canada depuis 1980 (R\xE8glement f\xE9d\xE9ral)",
      "Pr\xE9sence suspecte\xB4e : maison r\xE9nov\xE9e circa 1975-1982, parois avec petits trous bouch\xE9s",
      createSubsection("Radon"),
      "Gaz radioactif naturel \u2014 non d\xE9tectable visuellement, test requis (90 jours minimum)",
      "Zones \xE0 risque Qu\xE9bec : secteurs granitiques (Outaouais, Laurentides, Chaudi\xE8re-Appalaches)",
      "Recommander test de radon si sous-sol habitable et r\xE9gion \xE0 risque mod\xE9r\xE9 ou \xE9lev\xE9",
      createSubsection("Autres contaminants"),
      "BPC (PCBs) : ballasts de n\xE9on pr\xE9-1990, caulking dans vieux immeubles ou fen\xEAtres",
      "Mercure : thermostat \xE0 ampoule de mercure (boule argent\xE9e visible) \u2014 retrait recommand\xE9",
      "R\xE9servoir d'huile de chauffage : souterrain ou a\xE9rien \u2014 pr\xE9sence de sol contamin\xE9 ?",
      "Sol contamin\xE9 : proximit\xE9 station-service, nettoyeur, industrie \u2014 v\xE9rifier certificats",
      "Vermiculite (Zonolite) : isolant granuleux dor\xE9/argent\xE9 en combles \u2014 potentiellement amiant\xE9"
    ]),
    section("aibq-annexe", "Annexe I \u2014 Compl\xE9ments (A1 \xE0 A5)", [
      "A1 Multi-logements : toutes unit\xE9s accessibles ou \xE9chantillon (sous-sol, RDC, dernier \xE9tage)",
      "A2 Copropri\xE9t\xE9 indivise : syst\xE8mes int./ext. selon convention",
      "A3 Copropri\xE9t\xE9 divise : annexe convention + limites horizontales/verticales",
      "A3.2 Parties communes sous syndicat (si mandat)",
      "A4 Usage mixte commercial : tous espaces ou \xE9chantillon repr\xE9sentatif",
      "A5.1 Incendie multi-logements : sprinklers, alarme, g\xE9n\xE9ratrice, extincteurs, ascenseurs",
      "A5.1 \xC9clairage de s\xE9curit\xE9 et chambres \xE9lectriques (si pr\xE9sents)",
      "A5.2 Exclusions : plans, devis, fonctionnement dispositifs actifs"
    ])
  ];
  var BNQ_SECTIONS = [
    section("bnq-normes", "Normes de pratique (BNQ)", [
      "BNQ 3009-500/2022 R1 \u2014 Inspection r\xE9sidentielle"
    ]),
    section("bnq-12-2", "Art. 12.2 \u2014 Ext\xE9rieur architectural", [
      "12.2.1a Rev\xEAtements, ma\xE7onnerie, solins, portes et fen\xEAtres ext.",
      "12.2.1b Contre-fen\xEAtres, moustiquaires (non accessoires saisonniers)",
      "12.2.1c Toiture : couverture, drainage, solins, lucarnes, chemin\xE9e, \xE9vents",
      "12.2.1d Acc\xE8s : entr\xE9es, terrasses, balcons, escaliers, garde-corps",
      "12.2.1e Goutti\xE8res et descentes",
      "12.2.1f V\xE9g\xE9tation, pentes, murs de sout\xE8nement, eau de surface",
      "D\xE9t\xE9rioration rev\xEAtement : pourriture, rouille, peinture \xE9caill\xE9e",
      "Couverture pentue : bardeaux manquants, ventilation toit, glaceaux",
      "Glace en rive / barrage de glace : traces, dommages ou conditions favorisantes (Qu\xE9bec)",
      "Ventilation soffite : grilles d\xE9gag\xE9es et non obstru\xE9es (visible ext\xE9rieur)",
      "Toit plat : membrane, gravier, zones d\xE9nud\xE9es",
      "Fixation et stabilit\xE9 des assemblages ext\xE9rieurs",
      "Infiltration : calfeutrage, solins, balcon/joist rim",
      "Ma\xE7onnerie : joints, briques, weep holes",
      "Pente du terrain vers les fondations",
      "V\xE9g\xE9tation invasive ou arbres endommageant le b\xE2timent",
      "Garde-corps : absence, hauteur, configuration",
      "Piscine / spa : cl\xF4ture de s\xE9curit\xE9 1,2 m min. obligatoire (Loi 33 Qu\xE9bec)",
      "Margelle de piscine/spa : \xE9tat, fissures, joints"
    ]),
    BNQ_VISITE_EXTERIEURE,
    section("bnq-12-3", "Art. 12.3 \u2014 Syst\xE8me de plomberie", [
      "12.3.1a Alimentation int\xE9rieure \u2014 robinets et chasses actionn\xE9s",
      "12.3.1b Soupapes d'arr\xEAt \u2014 pr\xE9sence et \xE9tat (sans actionner entr\xE9e principale)",
      "12.3.1c Distribution ext\xE9rieure et branchement irrigation (clapet anti-retour)",
      "12.3.1d \xC9vacuation, ventilation, drains, \xE9vents ext\xE9rieurs",
      "12.3.1e Appareils : fuites, drainage, d\xE9t\xE9rioration",
      "12.3.1f Chauffe-eau domestique : capacit\xE9, ann\xE9e, \xE9nergie, \xE9tat",
      "12.3.1g Puisards, fosses, bassins de drainage",
      "12.3.1h Clapets anti-retour et protection eau potable",
      "Pompes de puisard et eaux us\xE9es \u2014 test commandes",
      "Fuites, corrosion, pompes d\xE9fectueuses",
      "Soupape arr\xEAt chauffe-eau, T&P, plateau drain, \xE9vacuation rigide T&P",
      "Chauffe-eau : anode magn\xE9sium (si accessible), temp\xE9rature r\xE9gl\xE9e 49-60 \xB0C",
      "Tuyaux de plomb : risque sant\xE9 \u2014 maisons pr\xE9-1975 (noter si soup\xE7on)",
      "Polybutyl\xE8ne (Poly-B) : tuyaux gris \u2014 produit retir\xE9, remplacement recommand\xE9",
      "Composants acier galvanis\xE9, eau rouge\xE2tre \u2014 corrosion interne probable",
      "Clapet anti-retour irrigation / chauffage eau chaude",
      "Drain de garage et couvercle r\xE9sistant aux charges",
      "Fosse septique / champ d'\xE9puration : signalement si non reli\xE9 au r\xE9seau municipal",
      "Cat. 2 (9+ log. ou 3 \xE9tages) : clapet anti-retour v\xE9rifi\xE9 annuellement"
    ]),
    section("bnq-12-4", "Art. 12.4 \u2014 Installation \xE9lectrique", [
      "12.4.1a M\xE2t, conduit, mise \xE0 terre, bo\xEEtier de service, panneaux",
      "12.4.1b \xC9chantillon luminaire, prise, interrupteur par pi\xE8ce",
      "12.4.1c Thermostats, bo\xEEtes de jonction, c\xE2blage visible",
      "Sans retirer couvercle du panneau \u2014 recommander CMEQ si justifi\xE9",
      "Testeur DDFT/AFCI pour protection chambres, SDB, cuisine",
      "Protection m\xE9canique alimentation thermopompe ext\xE9rieure",
      "Moyen de d\xE9connexion pr\xE8s unit\xE9 ext\xE9rieure CVAC",
      "Proximit\xE9 fils \xE9lectriques : balcon, fen\xEAtre, piscine",
      "Ancrage m\xE2t et conduit d'entr\xE9e",
      "Liaison \xE9quipotentielle conduite m\xE9tallique eau/gaz",
      "Coffret non utilis\xE9 pour entreposage",
      "Aluminium, tube Knob & Tube, panneau \xE0 fusibles \u2014 info 5 ans ou expertise",
      "Fils nus, bo\xEEtes ouvertes, polarit\xE9, prises non li\xE9es \xE0 la terre",
      "Liste des circuits au panneau",
      "DDFT pr\xE8s \xE9vier, baignoire, douche, chauffe-eau",
      "AFCI combinaison chambres / premi\xE8re prise",
      "Prises \xE0 l'\xE9preuve des enfants (TR)",
      "Prise dans armoire cuisine non conforme",
      "Humidit\xE9 ou rouille sur appareils",
      "Surchauffe ou d\xE9coloration c\xE2bles/appareils"
    ]),
    section("bnq-12-5", "Art. 12.5 \u2014 Chauffage, climatisation, ventilation", [
      "12.5.1a Chauffage et climatisation non accessoires",
      "12.5.1b Foyers, po\xEAles \xE0 bois/granules \u2014 plaque certification ULC, d\xE9gagement, porte",
      "12.5.1c R\xE9servoirs mazout / propane et tuyauterie",
      "12.5.1d \xC9vent s\xE9cheuse \u2014 extr\xE9mit\xE9 ext\xE9rieure d\xE9gag\xE9e",
      "12.5.1e Conduits de fum\xE9e visibles : pente, supports, raccords",
      "12.5.1f Air de combustion des appareils",
      "12.5.1g \xC9vacuation gaz br\xFBl\xE9s et conduits",
      "12.5.1h Tuyauterie gaz : corrosion, supports, surpression",
      "Thermostat(s) : fonctionnement, pile (batterie), programmable ou non",
      "Plinthe \xE9lectrique : test par pi\xE8ce \u2014 chauffe ou non (thermom\xE8tre IR si disponible)",
      "\xC9changeur thermique (fournaise \xE0 air) : inspection visuelle \u2014 fissures, rouille, odeur br\xFBl\xE9e",
      "Test commandes chauffage, CVAC, HRV, ventilateurs SDB/cuisine",
      "Hotte de cuisine : \xE9vacuation ext\xE9rieure (pr\xE9f\xE9rable) ou recirculation \u2014 noter le type",
      "Fonctionnement anormal : bruit, fum\xE9e, gaz",
      "Air comburant ad\xE9quat et d\xE9gag\xE9",
      "Installation ou conduits de ventilation d\xE9fectueux",
      "Absence de source de chaleur permanente pi\xE8ce habitable / sous-sol",
      "Chauffage d'appoint ou d\xE9shumidificateurs excessifs (indicateur)",
      "Drainage climatisation et accumulation de charpie s\xE9cheuse"
    ]),
    section("bnq-12-6", "Art. 12.6 \u2014 Int\xE9rieur architectural", [
      "12.6 Rev\xEAtements sol, murs, plafonds des pi\xE8ces inspect\xE9es",
      "Portes, escaliers, garde-corps int\xE9rieurs",
      "Fen\xEAtres int\xE9rieures et condensation",
      "Placards et finitions \u2014 dommages eau / moisissure",
      "Salle de bain : joints de silicone douche/bain \u2014 \xE9tat, d\xE9collements, moisissure",
      "Carrelage salle de bain / cuisine : fissures, d\xE9collements, joints d\xE9t\xE9rior\xE9s",
      "Bouche de chaleur / registre : pr\xE9sence et d\xE9gagement par pi\xE8ce habitable",
      "S\xE9paration habitable / garage : porte coupe-feu, joint coupe-feu, \xE9tanch\xE9it\xE9",
      "Pi\xE8ces et zones non accessibles list\xE9es avec raison"
    ]),
    section("bnq-12-7", "Art. 12.7 \u2014 Combles, vide sanitaire, isolation", [
      "12.7 Combles / espace de toit : isolation, ventilation amont",
      "Vide sanitaire : humidit\xE9, isolation, ventilation crois\xE9e",
      "Type d'isolation : laine min\xE9rale, cellulose, polyur\xE9thane gicl\xE9 (SPF)",
      "SPF gicl\xE9 : noter si pare-vapeur int\xE9gr\xE9 ou absent \u2014 impact ventilation",
      "Condensation ou moisissure en espace non fini",
      "Pare-vapeur et continuit\xE9 (si observable)",
      "Pont thermique (cold bridging) : visible sur la structure",
      "Acc\xE8s impossible document\xE9"
    ]),
    section("bnq-12-8", "Art. 12.8 \u2014 Syst\xE8mes de s\xE9curit\xE9", [
      "D\xE9tecteurs de fum\xE9e \u2014 emplacement et test apparent (par palier, chambre)",
      "D\xE9tecteurs de CO selon configuration du b\xE2timent (obligatoire si combustion ou garage)",
      "Extincteurs portatifs : accessibilit\xE9, inspection",
      "Piscine / spa : cl\xF4ture de s\xE9curit\xE9 1,2 m min. (Loi 33 Qu\xE9bec) \u2014 obligatoire",
      "Piscine : dispositif de verrouillage (loquet auto-fermant \xE0 l'\xE9preuve des enfants)",
      "Margelle de piscine/spa : \xE9tat joints, fissures, stabilit\xE9",
      "Puits anglais (fen\xEAtres sous-sol) : grille de protection contre les chutes",
      "Gicleurs / sprinklers si pr\xE9sents : \xE9tat apparent, \xE9tiquetage, acc\xE8s panneau",
      "\xC9clairage de secours et sorties (cat. 2 ou immeuble vis\xE9)",
      "Fa\xE7ade 5+ \xE9tages : entretien enveloppe (Code s\xE9curit\xE9) si applicable",
      "Tour de refroidissement : programme entretien (cat. 2) si applicable",
      "Garage mult\xE9tage : entretien (cat. 2) si applicable"
    ]),
    BNQ_GRENIER,
    section("bnq-matieres-dan", "Mati\xE8res dangereuses potentielles \u2014 signalement visuel", [
      "\u26a0\ufe0f L'inspecteur ne teste pas et ne pr\xE9l\xE8ve pas (BNQ section 6.4). Il signale les indices visuels et recommande un expert sp\xE9cialis\xE9.",
      createSubsection("Amiante (maisons pr\xE9-1980)"),
      "Bardeaux de toit en amiante-ciment (gris, texture fibreuse)",
      "Isolant autour des tuyaux de vapeur/chauffage (enveloppe effiloch\xE9e)",
      "Tuiles de plancher vinyle-amiante 30x30 cm (pattern marbre\xB4) + colle noire sous-plancher",
      "Plafond \u00abpopcorn\u00bb ou dalles acoustiques en fibre \u2014 inspecter visuellement",
      "Vermiculite (Zonolite) dans les combles \u2014 granuleux argent\xE9/dor\xE9 \u2014 potentiellement amiant\xE9",
      createSubsection("Pyrite / Pyrrhotite (sp\xE9cifique Qu\xE9bec)"),
      "Soul\xE8vement de dalle \u2014 bosse centrale, fissures en r\xE9seau hexagonal sur le b\xE9ton",
      "Zones \xE0 risque : Basses-Laurentides, Lanaudi\xE8re, Mauricie (pyrrhotite) \u2014 recommander test",
      createSubsection("Plomb"),
      "Peinture au plomb \u2014 \xE9caillage couches superpos\xE9es sur boiseries, fen\xEAtres (pr\xE9-1975)",
      "Tuyaux de plomb \u2014 entr\xE9e principale gris mat mall\xE9able, soudures plomb sur cuivre (pr\xE9-1986)",
      createSubsection("FUUF / Radon / Autres"),
      "FUUF (mousse ur\xE9e-formald\xE9hyde) : parois avec trous bouch\xE9s, odeur ammoniac (pr\xE9-1982)",
      "Radon : non d\xE9tectable visuellement \u2014 test 90 jours recommand\xE9 si r\xE9gion \xE0 risque",
      "Mercure : thermostats \xE0 ampoule (boule argent\xE9e) \u2014 retrait par r\xE9cup\xE9rateur recommand\xE9",
      "R\xE9servoir d'huile : sol contamin\xE9 possible \u2014 noter si r\xE9servoir apparent ou enlev\xE9",
      "BPC : ballasts n\xE9on pr\xE9-1990, caulking vieux immeubles \u2014 signaler \xE0 l'acheteur"
    ]),
    section("bnq-ch9", "Chapitre 9 \u2014 Rapport d'inspection", [
      "9.1 Format clair et compr\xE9hensible",
      "9.2 Infos essentielles : inspecteur, certificat RBQ, date, adresse",
      "9.3 Contenu par composante : d\xE9fauts, indicateurs, risques",
      "9.3 Recommandations d'information ou d'expertise pr\xE9cises (pas vagues)",
      "9.3 Ligne \xE9lectrique a\xE9rienne/souterraine, capacit\xE9 panneaux, protection circuits",
      "9.4 Signature de l'inspecteur responsable",
      "9.5 Offre de discussion des questions du demandeur"
    ]),
    section("bnq-ch10", "Chapitre 10 \u2014 Dossier d'inspection", [
      "Correspondance avec le demandeur",
      "Copie du contrat de service",
      "Preuves objectives (notes, photos, enregistrements)",
      "Copie du rapport remis",
      "Documents obtenus relatifs \xE0 l'inspection"
    ]),
    section("bnq-ch11", "Chapitre 11 \u2014 \xC9thique professionnelle", [
      "Confidentialit\xE9 des informations",
      "Autorisation \xE9crite avant remise du rapport \xE0 un tiers",
      "S\xE9curit\xE9 de l'inspecteur, du demandeur et des occupants",
      "Ne pas endommager le b\xE2timent",
      "Communication objective avec le demandeur",
      "Signaler toute situation influen\xE7ant la transaction",
      "Respecter les limites de comp\xE9tence et des moyens disponibles"
    ])
  ];

  // js/visit.js
  var CIEL_OPTIONS = [
    { value: "", label: "\u2014 Conditions \u2014" },
    { value: "ensoleille", label: "Ensoleill\xE9" },
    { value: "nuageux", label: "Nuageux" },
    { value: "brume", label: "Brume / brouillard" },
    { value: "pluie", label: "Pluie" },
    { value: "neige", label: "Neige" },
    { value: "vent-fort", label: "Vent fort" },
    { value: "mixte", label: "Mixte / variable" }
  ];
  function defaultVisit() {
    const now = /* @__PURE__ */ new Date();
    const parts = new Intl.DateTimeFormat("fr-CA", {
      timeZone: "America/Toronto",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    }).formatToParts(now);
    const get = (type) => parts.find((p) => p.type === type)?.value ?? "";
    const date = `${get("year")}-${get("month")}-${get("day")}`;
    return {
      date,
      heureDebut: `${get("hour")}:${get("minute")}`,
      heureFin: "",
      conditionsCiel: "",
      meteo: "",
      temperatureAir: "",
      precipitation: "",
      vent: "",
      visibilite: "",
      neigeAuSol: "",
      personnesPresentes: ""
    };
  }
  function normalizeVisit(inspection, { persist = false } = {}) {
    const legacyMeteo = inspection.meteo ?? "";
    const legacyTemp = inspection.temperature ?? "";
    if (!inspection.visit || typeof inspection.visit !== "object") {
      inspection.visit = defaultVisit();
    }
    const v = inspection.visit;
    if (!v.date) v.date = defaultVisit().date;
    if (!v.meteo && legacyMeteo) v.meteo = legacyMeteo;
    if (!v.temperatureAir && legacyTemp) v.temperatureAir = legacyTemp;
    if (persist) {
      delete inspection.meteo;
      delete inspection.temperature;
    }
    if (!inspection.site) inspection.site = {};
    if (inspection.site.proprietaire === void 0) inspection.site.proprietaire = "";
    if (inspection.site.courtier === void 0) inspection.site.courtier = "";
    if (inspection.site.courrielClient === void 0) inspection.site.courrielClient = "";
    if (inspection.site.telephoneClient === void 0) inspection.site.telephoneClient = "";
    return inspection;
  }
  function cielLabel(value) {
    return CIEL_OPTIONS.find((o) => o.value === value)?.label ?? "";
  }
  function formatVisitDateTime(inspection) {
    const v = inspection.visit;
    if (!v?.date) return "\u2014";
    const dateStr = formatDateFr(v.date);
    const debut = v.heureDebut || "";
    const fin = v.heureFin ? ` \u2192 ${v.heureFin}` : "";
    return `${dateStr}${debut ? ` \xB7 ${debut}${fin}` : ""}`;
  }
  function formatDateFr(isoDate) {
    if (!isoDate) return "\u2014";
    const [y, m, d] = isoDate.split("-").map(Number);
    if (!y) return isoDate;
    const dt = new Date(y, m - 1, d);
    return dt.toLocaleDateString("fr-CA", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  }
  function formatConditionsMeteo(inspection) {
    const v = inspection.visit ?? {};
    const parts = [];
    const ciel = cielLabel(v.conditionsCiel);
    if (ciel && ciel !== "\u2014 Conditions \u2014") parts.push(ciel);
    if (v.meteo) parts.push(v.meteo);
    if (v.temperatureAir) parts.push(`Temp. air : ${v.temperatureAir}`);
    if (v.precipitation) parts.push(`Pr\xE9cip. : ${v.precipitation}`);
    if (v.vent) parts.push(`Vent : ${v.vent}`);
    if (v.visibilite) parts.push(`Visibilit\xE9 : ${v.visibilite}`);
    if (v.neigeAuSol) parts.push(`Neige/glace au sol : ${v.neigeAuSol}`);
    return parts.length ? parts.join(" \xB7 ") : "\u2014";
  }

  // js/quick-responses.js
  var QUICK_RESPONSES = {
    conforme: [
      { id: "c-visuel", label: "Conforme \xE0 l'inspection visuelle" },
      { id: "c-bon-etat", label: "Bon \xE9tat g\xE9n\xE9ral" },
      { id: "c-fonctionnel", label: "Fonctionnel \u2014 entretien courant seulement" },
      { id: "c-pratiques", label: "Conforme aux pratiques courantes" },
      { id: "c-aucune", label: "Aucune anomalie visible" }
    ],
    "non-conforme": [
      { id: "nc-correction", label: "Non conforme \u2014 correction requise" },
      { id: "nc-securite", label: "S\xE9curit\xE9 compromise" },
      { id: "nc-usure", label: "Usure au-del\xE0 des limites acceptables" },
      { id: "nc-absent", label: "\xC9l\xE9ment requis absent ou non conforme au code" },
      { id: "nc-majeur", label: "D\xE9faut majeur constat\xE9" },
      { id: "nc-eau", label: "Infiltration / dommage par l'eau" }
    ],
    "a-corriger": [
      { id: "ac-surveillance", label: "Usure normale \u2014 surveillance recommand\xE9e" },
      { id: "ac-court", label: "R\xE9paration recommand\xE9e \xE0 court terme" },
      { id: "ac-entretien", label: "Entretien pr\xE9ventif sugg\xE9r\xE9" },
      { id: "ac-fissure", label: "Fissure / cycle \xE0 surveiller" },
      { id: "ac-refection", label: "R\xE9fection \xE0 pr\xE9voir (non urgent)" },
      { id: "ac-vieillissement", label: "Vieillissement normal du composant" }
    ],
    na: [
      { id: "na-inaccessible", label: "Non accessible" },
      { id: "na-non-visible", label: "Non visible / masqu\xE9" },
      { id: "na-hors-champ", label: "Hors champ d'inspection" },
      { id: "na-absent", label: "Non pr\xE9sent sur le site" },
      { id: "na-conditions", label: "Conditions emp\xEAchant l'inspection" },
      { id: "na-neige", label: "Obstruction saisonni\xE8re (neige, d\xE9bris)" }
    ]
  };
  var SECTION_PRESETS = {
    "walk-terrain": { conforme: [{ id: "terrain-c-1", label: "Pente ad\xE9quate â€” eaux s'\xE9loignent des fondations" }, { id: "terrain-c-2", label: "V\xE9g\xE9tation \xE0 distance raisonnable du b\xE2timent" }, { id: "terrain-c-3", label: "Drainage de surface fonctionnel" }, { id: "terrain-c-4", label: "Cl\xF4ture de piscine conforme â€” 1,2 m et loquet s\xE9curit\xE9" }, { id: "terrain-c-5", label: "Margelle en bon \xE9tat â€” joints intacts, surface stable" }], "non-conforme": [{ id: "terrain-nc-1", label: "Pente vers les fondations â€” infiltration probable" }, { id: "terrain-nc-2", label: "Racines endommageant la fondation" }, { id: "terrain-nc-3", label: "Mur de sout\xE8nement instable â€” risque structural" }, { id: "terrain-nc-4", label: "Cl\xF4ture de piscine absente ou non conforme â€” Loi 33 Qu\xE9bec" }, { id: "terrain-nc-5", label: "Loquet de s\xE9curit\xE9 piscine absent â€” danger enfants" }], "a-corriger": [{ id: "terrain-ac-1", label: "Remblai insuffisant le long des fondations" }, { id: "terrain-ac-2", label: "V\xE9g\xE9tation trop proche â€” \xE0 tailler" }, { id: "terrain-ac-3", label: "Regard de drainage obstru\xE9 ou absent" }, { id: "terrain-ac-4", label: "Margelle fissur\xE9e ou joints d\xE9t\xE9rior\xE9s â€” r\xE9paration \xE0 pr\xE9voir" }] },
    "bnq-w-terrain": "walk-terrain", "bat-terrain": "walk-terrain",
    "walk-fondations": { conforme: [{ id: "fond-c-1", label: "Aucune fissure significative observ\xE9e" }, { id: "fond-c-2", label: "Mur de fondation sec et intact" }, { id: "fond-c-3", label: "Aucun signe d'efflorescence ou d'infiltration" }], "non-conforme": [{ id: "fond-nc-1", label: "Fissure diagonale â€” mouvement structurel probable" }, { id: "fond-nc-2", label: "Infiltration active au mur de fondation" }, { id: "fond-nc-3", label: "Efflorescence importante â€” humidit\xE9 chronique" }, { id: "fond-nc-4", label: "Affaissement ou d\xE9placement visible" }], "a-corriger": [{ id: "fond-ac-1", label: "Fissures fines â€” cycle gel-d\xE9gel \xE0 surveiller" }, { id: "fond-ac-2", label: "Efflorescence l\xE9g\xE8re â€” drainage \xE0 am\xE9liorer" }, { id: "fond-ac-3", label: "Joints de mortier d\xE9grad\xE9s â€” repointing requis" }] },
    "bnq-w-fondations": "walk-fondations", "bat-fondations": "walk-fondations",
    "walk-toiture": { conforme: [{ id: "toit-c-1", label: "Rev\xEAtement en bon \xE9tat apparent" }, { id: "toit-c-2", label: "Goutti\xE8res et descentes fonctionnelles" }, { id: "toit-c-3", label: "Solins \xE9tanches â€” aucun d\xE9collement" }, { id: "toit-c-4", label: "Chemin\xE9e et \xE9mergences en bon \xE9tat" }, { id: "toit-c-5", label: "Soffites d\xE9gag\xE9s â€” ventilation ad\xE9quate visible" }], "non-conforme": [{ id: "toit-nc-1", label: "Bardeaux manquants, soulev\xE9s ou granulats absents" }, { id: "toit-nc-2", label: "Solin d\xE9coll\xE9 â€” infiltration probable" }, { id: "toit-nc-3", label: "Membrane endommag\xE9e (toit plat)" }, { id: "toit-nc-4", label: "Dommage structurel apparent â€” intervention urgente" }, { id: "toit-nc-5", label: "Soffites obstru\xE9s â€” risque de condensation en comble" }], "a-corriger": [{ id: "toit-ac-1", label: "Toiture en fin de vie â€” remplacement \xE0 planifier" }, { id: "toit-ac-2", label: "Goutti\xE8res obstru\xE9es ou mal fix\xE9es" }, { id: "toit-ac-3", label: "Calfeutrage d'\xE9mergence \xE0 refaire" }, { id: "toit-ac-4", label: "Traces de glace en rive â€” am\xE9liorer l'isolation et la ventilation" }] },
    "bnq-w-toiture": "walk-toiture", "bat-toiture": "walk-toiture",
    "walk-facades": { conforme: [{ id: "facade-c-1", label: "Rev\xEAtement mural sans fissure significative" }, { id: "facade-c-2", label: "Boiseries et fascias en bon \xE9tat" }, { id: "facade-c-3", label: "Calfeutrage des ouvertures en bon \xE9tat" }], "non-conforme": [{ id: "facade-nc-1", label: "Pourriture visible au rev\xEAtement ou boiseries" }, { id: "facade-nc-2", label: "Fissures ouvertes â€” infiltration probable" }, { id: "facade-nc-3", label: "Lambris bomb\xE9 ou mal fix\xE9 â€” d\xE9tachement possible" }], "a-corriger": [{ id: "facade-ac-1", label: "Peinture \xE9caill\xE9e â€” entretien pr\xE9ventif requis" }, { id: "facade-ac-2", label: "Calfeutrage fen\xEAtres \xE0 refaire" }, { id: "facade-ac-3", label: "Fascia ou sous-face \xE0 repeindre ou remplacer" }] },
    "bnq-w-facades": "walk-facades", "bat-facades": "walk-facades",
    "walk-ouvertures": { conforme: [{ id: "ouv-c-1", label: "Fen\xEAtres en bon \xE9tat â€” joint et ch\xE2ssis intacts" }, { id: "ouv-c-2", label: "Portes ext\xE9rieures fonctionnelles et \xE9tanches" }, { id: "ouv-c-3", label: "Garde-corps conformes et stables" }, { id: "ouv-c-4", label: "Marches et paliers en bon \xE9tat" }], "non-conforme": [{ id: "ouv-nc-1", label: "Garde-corps absent ou hauteur insuffisante â€” chute" }, { id: "ouv-nc-2", label: "Marches dangereuses â€” risque de tr\xE9bucher" }, { id: "ouv-nc-3", label: "Porte de garage : arr\xEAt sur obstacle non fonctionnel" }], "a-corriger": [{ id: "ouv-ac-1", label: "Condensation entre vitrages â€” scellant d\xE9ficient" }, { id: "ouv-ac-2", label: "Fen\xEAtre difficile \xE0 op\xE9rer â€” ajustement requis" }, { id: "ouv-ac-3", label: "Joint de seuil \xE0 remplacer" }] },
    "bnq-w-ouvertures": "walk-ouvertures", "bat-ouvertures": "walk-ouvertures",
    "walk-plomb-ext": { conforme: [{ id: "plomb-ext-c-1", label: "Robinet ext\xE9rieur fonctionnel â€” brise-vide pr\xE9sent" }, { id: "plomb-ext-c-2", label: "\xC9vents de plomberie d\xE9gag\xE9s" }, { id: "plomb-ext-c-3", label: "Aucune fuite visible en ext\xE9rieur" }], "non-conforme": [{ id: "plomb-ext-nc-1", label: "Brise-vide absent sur robinet ext\xE9rieur" }, { id: "plomb-ext-nc-2", label: "Fuite visible \xE0 la tuyauterie ext\xE9rieure" }], "a-corriger": [{ id: "plomb-ext-ac-1", label: "Robinet ext\xE9rieur difficile \xE0 op\xE9rer" }, { id: "plomb-ext-ac-2", label: "\xC9vent de plomberie partiellement obstru\xE9" }] },
    "bnq-w-plomb-ext": "walk-plomb-ext", "bat-plomb-ext": "walk-plomb-ext",
    "walk-elec-ext": { conforme: [{ id: "elec-ext-c-1", label: "Entr\xE9e de service en bon \xE9tat et bien ancr\xE9e" }, { id: "elec-ext-c-2", label: "Mise \xE0 la terre visible et connect\xE9e" }, { id: "elec-ext-c-3", label: "Coffret ext\xE9rieur ferm\xE9 et en bon \xE9tat" }], "non-conforme": [{ id: "elec-ext-nc-1", label: "M\xE2t d'entr\xE9e mal ancr\xE9 â€” risque structural" }, { id: "elec-ext-nc-2", label: "C\xE2blage d\xE9nud\xE9 ou mal prot\xE9g\xE9 \xE0 l'entr\xE9e" }, { id: "elec-ext-nc-3", label: "Hauteur des fils insuffisante â€” s\xE9curit\xE9" }], "a-corriger": [{ id: "elec-ext-ac-1", label: "Conduit d'entr\xE9e \xE0 res\xE9curiser" }, { id: "elec-ext-ac-2", label: "Coffret \xE0 inspecter par \xE9lectricien certifi\xE9" }] },
    "bnq-w-elec-ext": "walk-elec-ext", "bat-elec-ext": "walk-elec-ext",
    "aibq-v-i-17": { conforme: [{ id: "struct-c-1", label: "Structure apparente sans d\xE9formation notable" }, { id: "struct-c-2", label: "Planchers de niveau â€” aucun affaissement" }, { id: "struct-c-3", label: "Poutres et solives sans signe de d\xE9gradation" }], "non-conforme": [{ id: "struct-nc-1", label: "Affaissement de plancher â€” intervention structurale" }, { id: "struct-nc-2", label: "Pourriture ou dommage par eau \xE0 la structure" }, { id: "struct-nc-3", label: "Fissure structurelle active â€” expert requis" }], "a-corriger": [{ id: "struct-ac-1", label: "Craquement excessif au plancher" }, { id: "struct-ac-2", label: "Plafond l\xE9g\xE8rement d\xE9form\xE9 â€” surveillance" }, { id: "struct-ac-3", label: "Humidit\xE9 sur la structure â€” source \xE0 identifier" }] },
    "aibq-v-i": "aibq-v-i-17",
    "aibq-v-iv": { conforme: [{ id: "plomb-c-1", label: "Tuyauterie en bon \xE9tat â€” aucune fuite visible" }, { id: "plomb-c-2", label: "Chauffe-eau fonctionnel â€” soupape T&P en place" }, { id: "plomb-c-3", label: "Robinet d'arr\xEAt principal rep\xE9r\xE9 et op\xE9rationnel" }, { id: "plomb-c-4", label: "\xC9vacuation efficace â€” aucun refoulement" }, { id: "plomb-c-5", label: "Temp\xE9rature eau chaude dans les limites (49-60 \xB0C)" }], "non-conforme": [{ id: "plomb-nc-1", label: "Fuite active \xE0 la tuyauterie" }, { id: "plomb-nc-2", label: "Soupape T&P absente ou obstru\xE9e â€” surpression" }, { id: "plomb-nc-3", label: "Tuyauterie en polybutyl\xE8ne (Poly-B) â€” remplacement requis" }, { id: "plomb-nc-4", label: "Refoulement au drain â€” obstruction d'\xE9gout" }, { id: "plomb-nc-5", label: "Tuyaux de plomb suspect\xE9s â€” test et remplacement recommand\xE9s" }], "a-corriger": [{ id: "plomb-ac-1", label: "Chauffe-eau en fin de vie estim\xE9e" }, { id: "plomb-ac-2", label: "Tuyauterie en galvanis\xE9 â€” remplacement \xE0 planifier" }, { id: "plomb-ac-3", label: "Pression d'eau faible â€” v\xE9rification recommand\xE9e" }, { id: "plomb-ac-4", label: "Odeur d'\xE9gout â€” joint \xE0 inspecter" }, { id: "plomb-ac-5", label: "Anode chauffe-eau â€” entretien pr\xE9ventif recommand\xE9" }] },
    "bnq-12-3": "aibq-v-iv",
    "aibq-v-v": { conforme: [{ id: "elec-c-1", label: "Panneau en bon \xE9tat â€” circuits identifi\xE9s" }, { id: "elec-c-2", label: "C\xE2blage apparent conforme â€” aucun fil d\xE9nud\xE9" }, { id: "elec-c-3", label: "DDFT fonctionnels aux zones humides" }, { id: "elec-c-4", label: "Amp\xE9rage panneau ad\xE9quat (100 A ou plus)" }, { id: "elec-c-5", label: "Circuits d\xE9di\xE9s 240 V pr\xE9sents (cuisini\xE8re, s\xE9cheuse)" }], "non-conforme": [{ id: "elec-nc-1", label: "Surprotection au panneau â€” fusible surdimensionn\xE9" }, { id: "elec-nc-2", label: "C\xE2blage aluminium â€” inspection CMEQ recommand\xE9e" }, { id: "elec-nc-3", label: "Panneau Federal Pacific / Zinsco â€” remplacement" }, { id: "elec-nc-4", label: "Fil d\xE9nud\xE9 ou bo\xEEte de jonction ouverte â€” danger" }, { id: "elec-nc-5", label: "Double-tap au panneau â€” non conforme, correction requise" }], "a-corriger": [{ id: "elec-ac-1", label: "Liste des circuits absente ou incompl\xE8te" }, { id: "elec-ac-2", label: "Prise non mise \xE0 la terre en zone humide" }, { id: "elec-ac-3", label: "Disjoncteurs difficiles \xE0 manoeuvrer â€” usure" }, { id: "elec-ac-4", label: "Panneau 60 A â€” mise \xE0 niveau recommand\xE9e selon usage" }] },
    "bnq-12-4": "aibq-v-v",
    "aibq-v-vi": { conforme: [{ id: "chauf-c-1", label: "Syst\xE8me fonctionnel aux commandes normales" }, { id: "chauf-c-2", label: "Filtres en bon \xE9tat â€” entretien r\xE9cent" }, { id: "chauf-c-3", label: "Conduits de distribution sans fuite apparente" }, { id: "chauf-c-4", label: "Thermostat fonctionnel â€” r\xE9ponse correcte au r\xE9glage" }, { id: "chauf-c-5", label: "Foyer / po\xEAle : plaque certification pr\xE9sente et conforme" }], "non-conforme": [{ id: "chauf-nc-1", label: "Syst\xE8me non fonctionnel â€” intervention requise" }, { id: "chauf-nc-2", label: "Conduit de fum\xE9e d\xE9coll\xE9 â€” risque CO" }, { id: "chauf-nc-3", label: "Tuyauterie de gaz corrÐ¾Ð´\xE9e â€” inspection gazi\xE8re" }, { id: "chauf-nc-4", label: "\xC9changeur thermique suspect â€” fissure ou odeur br\xFBl\xE9e" }, { id: "chauf-nc-5", label: "Foyer / po\xEAle sans plaque de certification â€” non conforme" }], "a-corriger": [{ id: "chauf-ac-1", label: "Filtre \xE0 remplacer" }, { id: "chauf-ac-2", label: "Chaudi\xE8re ou fournaise en fin de vie estim\xE9e" }, { id: "chauf-ac-3", label: "Bruit anormal au d\xE9marrage â€” inspection recommand\xE9e" }, { id: "chauf-ac-4", label: "D\xE9tecteur CO absent â€” installation obligatoire" }, { id: "chauf-ac-5", label: "Plinthe \xE9lectrique d\xE9faillante dans une pi\xE8ce" }, { id: "chauf-ac-6", label: "Thermostat â€” pile \xE0 remplacer ou recalibrage recommand\xE9" }] },
    "bnq-12-5": "aibq-v-vi",
    "aibq-v-vii": { conforme: [{ id: "clim-c-1", label: "Thermopompe fonctionnelle aux commandes normales" }, { id: "clim-c-2", label: "Drainage des condensats en place" }, { id: "clim-c-3", label: "Unit\xE9 ext\xE9rieure en bon \xE9tat g\xE9n\xE9ral" }], "non-conforme": [{ id: "clim-nc-1", label: "Syst\xE8me non fonctionnel â€” intervention requise" }, { id: "clim-nc-2", label: "Drainage condensats absent ou obstru\xE9" }], "a-corriger": [{ id: "clim-ac-1", label: "Unit\xE9 ext\xE9rieure en fin de vie estim\xE9e" }, { id: "clim-ac-2", label: "Entretien annuel recommand\xE9" }] },
    "aibq-v-viii": { conforme: [{ id: "int-c-1", label: "Finitions en bon \xE9tat g\xE9n\xE9ral" }, { id: "int-c-2", label: "Portes et fen\xEAtres int\xE9rieures fonctionnelles" }, { id: "int-c-3", label: "Escaliers et garde-corps stables" }, { id: "int-c-4", label: "Aucune tache d'humidit\xE9 visible" }, { id: "int-c-5", label: "Joints de silicone douche/bain intacts â€” aucune moisissure" }, { id: "int-c-6", label: "Carrelage en bon \xE9tat â€” joints et tuiles intacts" }], "non-conforme": [{ id: "int-nc-1", label: "Taches d'humidit\xE9 actives â€” infiltration en cours" }, { id: "int-nc-2", label: "Moisissure visible â€” investigation requise" }, { id: "int-nc-3", label: "Garde-corps int\xE9rieur d\xE9ficient â€” risque de chute" }, { id: "int-nc-4", label: "Joint silicone douche absent ou d\xE9coll\xE9 â€” infiltration probable" }], "a-corriger": [{ id: "int-ac-1", label: "Taches d'humidit\xE9 anciennes â€” surveillance" }, { id: "int-ac-2", label: "Plancher craquant excessivement" }, { id: "int-ac-3", label: "Porte int\xE9rieure difficile \xE0 fermer" }, { id: "int-ac-4", label: "Joints silicone \xE0 refaire dans la salle de bain" }, { id: "int-ac-5", label: "Carrelage d\xE9coll\xE9 ou joint fissur\xE9 â€” r\xE9paration \xE0 pr\xE9voir" }] },
    "bnq-12-6": "aibq-v-viii",
    "aibq-v-ix": { conforme: [{ id: "iso-c-1", label: "Isolation visible en quantit\xE9 ad\xE9quate" }, { id: "iso-c-2", label: "Pare-vapeur visible et intact" }, { id: "iso-c-3", label: "Aucun signe de moisissure \xE0 l'isolant" }], "non-conforme": [{ id: "iso-nc-1", label: "Isolation absente dans zone accessible" }, { id: "iso-nc-2", label: "Pare-vapeur absent â€” condensation probable" }, { id: "iso-nc-3", label: "Moisissure sur l'isolant â€” humidit\xE9 chronique" }], "a-corriger": [{ id: "iso-ac-1", label: "Isolation \xE0 compl\xE9ter dans certaines zones" }, { id: "iso-ac-2", label: "Pont thermique apparent â€” \xE0 corriger" }, { id: "iso-ac-3", label: "Taches sur la structure â€” source \xE0 identifier" }] },
    "bnq-12-7": "aibq-v-ix",
    "aibq-v-x": { conforme: [{ id: "vent-c-1", label: "Ventilation de comble ad\xE9quate â€” \xE9vents d\xE9gag\xE9s" }, { id: "vent-c-2", label: "Ventilateurs salle de bain et cuisine fonctionnels" }, { id: "vent-c-3", label: "\xC9changeur d'air pr\xE9sent et accessible" }], "non-conforme": [{ id: "vent-nc-1", label: "\xC9vent de s\xE9cheuse obstru\xE9 â€” risque d'incendie" }, { id: "vent-nc-2", label: "Ventilateur de salle de bain non fonctionnel" }, { id: "vent-nc-3", label: "Ventilation de comble insuffisante" }], "a-corriger": [{ id: "vent-ac-1", label: "\xC9changeur d'air \xE0 entretenir â€” filtres \xE0 changer" }, { id: "vent-ac-2", label: "Ventilateur de cuisine \xE9vacuant dans le comble" }, { id: "vent-ac-3", label: "\xC9vent partiellement obstru\xE9" }] },
    "aibq-v-xi": { conforme: [{ id: "secu-c-1", label: "D\xE9tecteurs de fum\xE9e pr\xE9sents visuellement" }, { id: "secu-c-2", label: "D\xE9tecteurs CO pr\xE9sents aux zones requises" }, { id: "secu-c-3", label: "Garde-corps et rampes conformes en hauteur" }, { id: "secu-c-4", label: "Issues d'\xE9vacuation d\xE9gag\xE9es" }, { id: "secu-c-5", label: "Cl\xF4ture de piscine conforme â€” 1,2 m et loquet s\xE9curit\xE9" }, { id: "secu-c-6", label: "Puits anglais : grille de protection en place" }], "non-conforme": [{ id: "secu-nc-1", label: "D\xE9tecteur de fum\xE9e absent â€” zone requise" }, { id: "secu-nc-2", label: "D\xE9tecteur CO absent â€” installation obligatoire" }, { id: "secu-nc-3", label: "Garde-corps d\xE9ficient â€” risque de chute grave" }, { id: "secu-nc-4", label: "Cl\xF4ture de piscine absente ou non conforme â€” Loi 33 Qu\xE9bec" }, { id: "secu-nc-5", label: "Puits anglais sans grille â€” risque de chute" }], "a-corriger": [{ id: "secu-ac-1", label: "D\xE9tecteurs > 10 ans â€” remplacement recommand\xE9" }, { id: "secu-ac-2", label: "Rampe d'escalier \xE0 s\xE9curiser" }, { id: "secu-ac-3", label: "Hauteur de garde-corps \xE0 v\xE9rifier" }, { id: "secu-ac-4", label: "Margelle de piscine fissur\xE9e â€” r\xE9paration \xE0 pr\xE9voir" }] },
    "bnq-12-8": "aibq-v-xi",
    "aibq-matieres-dan": { conforme: [{ id: "md-c-1", label: "Aucun indice visuel de mati\xE8re dangereuse observ\xE9" }, { id: "md-c-2", label: "Isolation combles : fibre de verre ou cellulose (non amiant\xE9 probable)" }, { id: "md-c-3", label: "Dalle en b\xE9ton sans fissure en r\xE9seau â€” pyrite non suspect\xE9e" }], "non-conforme": [{ id: "md-nc-1", label: "Isolant en vrac granuleux argent\xE9 (vermiculite/Zonolite) â€” test amiante recommand\xE9" }, { id: "md-nc-2", label: "Plafond popcorn / tuiles acoustiques â€” analyse amiante recommand\xE9e" }, { id: "md-nc-3", label: "Dalle soulev\xE9e / fissures en r\xE9seau â€” test pyrite recommand\xE9" }, { id: "md-nc-4", label: "Tuyaux de plomb suspect\xE9s â€” analyse et remplacement recommand\xE9s" }, { id: "md-nc-5", label: "Isolant en mousse jaune/beige dans les murs â€” FUUF possible (pr\xE9-1982)" }, { id: "md-nc-6", label: "R\xE9servoir d'huile pr\xE9sent â€” risque de contamination du sol" }, { id: "md-nc-7", label: "Thermostat \xE0 ampoule de mercure â€” retrait par r\xE9cup\xE9rateur recommand\xE9" }], "a-corriger": [{ id: "md-ac-1", label: "Test de radon recommand\xE9 â€” r\xE9gion \xE0 risque mod\xE9r\xE9 \xE0 \xE9lev\xE9" }, { id: "md-ac-2", label: "Peinture \xE9caill\xE9e sur boiseries pr\xE9-1975 â€” test plomb recommand\xE9" }, { id: "md-ac-3", label: "BPC possible (ballasts n\xE9on pr\xE9-1990) â€” signaler \xE0 l'acheteur" }] },
    "bnq-matieres-dan": "aibq-matieres-dan"
  };
  function resolveSection(sectionId) {
    const entry = SECTION_PRESETS[sectionId];
    if (typeof entry === "string") return SECTION_PRESETS[entry] ?? null;
    return entry ?? null;
  }
  var PRESET_INDEX = /* @__PURE__ */ new Map();
  for (const list of Object.values(QUICK_RESPONSES)) {
    for (const p of list) PRESET_INDEX.set(p.id, p.label);
  }
  for (const entry of Object.values(SECTION_PRESETS)) {
    if (entry && typeof entry === "object") {
      for (const list of Object.values(entry)) {
        for (const p of list) PRESET_INDEX.set(p.id, p.label);
      }
    }
  }
  function getPresetsForStatus(status, sectionId) {
    if (!status) return [];
    const global2 = QUICK_RESPONSES[status] ?? [];
    if (!sectionId) return global2;
    const ctx = resolveSection(sectionId);
    const contextual = ctx?.[status] ?? [];
    return [...contextual, ...global2];
  }
  function presetLabel(id) {
    return PRESET_INDEX.get(id) ?? id;
  }
  function normalizeChecklistItem(item) {
    if (!item) return item;
    if (!Array.isArray(item.selectedPresets)) item.selectedPresets = [];
    if (item.inspectorComment == null) {
      item.inspectorComment = item.selectedPresets.length === 0 && item.note ? String(item.note) : "";
    }
    if (!item.note) item.note = "";
    return item;
  }
  function normalizeInspectionItems(inspection) {
    normalizeInspectionSections(inspection);
    inspection?.sections?.forEach((sec) => {
      iterSectionItems(sec, (item) => normalizeChecklistItem(item));
    });
    return inspection;
  }
  function formatItemDocumentation(item) {
    normalizeChecklistItem(item);
    const presets = (item.selectedPresets || []).map(presetLabel).filter(Boolean).join(" \xB7 ");
    const comment = (item.inspectorComment || "").trim();
    const parts = [];
    if (presets) parts.push(presets);
    if (comment) parts.push(comment);
    return parts.join("\n\n");
  }
  function hasItemDocumentation(item) {
    normalizeChecklistItem(item);
    return (item.selectedPresets?.length ?? 0) > 0 || Boolean((item.inspectorComment || "").trim());
  }

  // js/client-files.js
  var FILE_CATEGORIES = [
    { value: "bv", label: "Bon de visite (BV)" },
    { value: "convention", label: "Convention de service" },
    { value: "declaration", label: "D\xE9claration du vendeur" },
    { value: "mandat", label: "Mandat / autorisation" },
    { value: "plan", label: "Plans, certificats, \xE9tudes" },
    { value: "rbq", label: "RBQ / permis / assurance" },
    { value: "courtier", label: "Documents courtier" },
    { value: "photo-doc", label: "Photos documentaires" },
    { value: "autre", label: "Autre" }
  ];
  var DB_NAME = "kzo_inspect_files_v1";
  var STORE = "blobs";
  var MAX_FILE_BYTES = 20 * 1024 * 1024;
  var ALLOWED_EXTENSIONS = /\.(pdf|doc|docx|xls|xlsx|png|jpg|jpeg|webp|gif|txt|csv|mp4|mov|heic)$/i;
  var BLOCKED_EXTENSIONS = /\.(html|htm|svg|xml|xhtml|js|mjs|ts|json|exe|bat|sh|php|py)$/i;
  var dbPromise = null;
  function openDb() {
    if (!dbPromise) {
      dbPromise = new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, 1);
        req.onerror = () => reject(req.error);
        req.onsuccess = () => resolve(req.result);
        req.onupgradeneeded = (e) => {
          const db = e.target.result;
          if (!db.objectStoreNames.contains(STORE)) {
            const store = db.createObjectStore(STORE, { keyPath: "id" });
            store.createIndex("inspectionId", "inspectionId", { unique: false });
          }
        };
      });
    }
    return dbPromise;
  }
  function categoryLabel(value) {
    return FILE_CATEGORIES.find((c) => c.value === value)?.label ?? value;
  }
  function formatFileSize(bytes) {
    if (!bytes) return "0 o";
    if (bytes < 1024) return `${bytes} o`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
  }
  async function listClientFiles(inspectionId) {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const store = tx.objectStore(STORE);
      const index = store.index("inspectionId");
      const req = index.getAll(inspectionId);
      req.onsuccess = () => {
        const rows = (req.result ?? []).map(({ id, inspectionId: iid, name, category, mimeType, size, uploadedAt, note }) => ({
          id,
          inspectionId: iid,
          name,
          category,
          mimeType,
          size,
          uploadedAt,
          note
        }));
        rows.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
        resolve(rows);
      };
      req.onerror = () => reject(req.error);
    });
  }
  async function getClientFileBlob(fileId) {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).get(fileId);
      req.onsuccess = () => {
        const row = req.result;
        if (!row) resolve(null);
        else resolve({ meta: row, blob: row.blob });
      };
      req.onerror = () => reject(req.error);
    });
  }
  async function addClientFile(inspectionId, file, { category = "autre", note = "" } = {}) {
    if (file.size > MAX_FILE_BYTES) {
      throw new Error(`Fichier trop volumineux (max ${formatFileSize(MAX_FILE_BYTES)}).`);
    }
    const fileName = file.name || "";
    if (BLOCKED_EXTENSIONS.test(fileName)) {
      throw new Error(`Type de fichier non autoris\xE9 : ${fileName}`);
    }
    if (!ALLOWED_EXTENSIONS.test(fileName)) {
      throw new Error(`Extension non reconnue : ${fileName}`);
    }
    const id = crypto.randomUUID();
    const record = {
      id,
      inspectionId,
      name: file.name,
      category,
      mimeType: file.type || "application/octet-stream",
      size: file.size,
      uploadedAt: (/* @__PURE__ */ new Date()).toISOString(),
      note,
      blob: file
    };
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put(record);
      tx.oncomplete = () => resolve({
        id,
        inspectionId,
        name: record.name,
        category: record.category,
        mimeType: record.mimeType,
        size: record.size,
        uploadedAt: record.uploadedAt,
        note: record.note
      });
      tx.onerror = () => reject(tx.error);
    });
  }
  async function updateClientFileMeta(fileId, { category, note }) {
    const db = await openDb();
    const existing = await getClientFileBlob(fileId);
    if (!existing) throw new Error("Fichier introuvable");
    const record = {
      ...existing.meta,
      category: category ?? existing.meta.category,
      note: note ?? existing.meta.note,
      blob: existing.blob
    };
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put(record);
      tx.oncomplete = () => resolve(record);
      tx.onerror = () => reject(tx.error);
    });
  }
  async function deleteClientFile(fileId) {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).delete(fileId);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }
  async function deleteAllClientFiles(inspectionId) {
    const files = await listClientFiles(inspectionId);
    await Promise.all(files.map((f) => deleteClientFile(f.id)));
  }
  async function downloadClientFile(fileId) {
    const data = await getClientFileBlob(fileId);
    if (!data) return;
    const url = URL.createObjectURL(data.blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = data.meta.name;
    a.click();
    URL.revokeObjectURL(url);
  }
  async function openClientFile(fileId) {
    const data = await getClientFileBlob(fileId);
    if (!data) return;
    const url = URL.createObjectURL(data.blob);
    window.open(url, "_blank");
    setTimeout(() => URL.revokeObjectURL(url), 6e4);
  }

  // js/storage.js
  var STORAGE_KEY = "inspectqc_inspections_v1";
  var PROFILE_KEY = "inspectqc_profile_v1";
  var INSPECTOR_NAME = "Jean Eveillard Cazeau";
  function loadInspections() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
  function saveInspections(list) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      if (e?.name === "QuotaExceededError" || e?.code === 22) {
        window.dispatchEvent(new CustomEvent("kzo:storage-quota", {
          detail: { message: "Espace de stockage plein â€” exportez vos donn\xE9es (Profil â†’ Sauvegarde) puis r\xE9duisez les photos." }
        }));
      }
      throw e;
    }
  }
  function getInspection(id) {
    const found = loadInspections().find((i) => i.id === id) ?? null;
    if (!found) return null;
    normalizeVisit(found);
    if (!found.expertReferrals) found.expertReferrals = [];
    if (found.limitations === void 0) found.limitations = "";
    if (found.inspector) found.inspector.nom = INSPECTOR_NAME;
    normalizeInspectionItems(found);
    normalizeInspectionSections(found);
    applyFieldWalkOrder(found);
    return found;
  }
  function upsertInspection(inspection) {
    normalizeVisit(inspection, { persist: true });
    const list = loadInspections();
    const idx = list.findIndex((i) => i.id === inspection.id);
    inspection.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    if (idx >= 0) list[idx] = inspection;
    else list.unshift(inspection);
    saveInspections(list);
    return inspection;
  }
  async function deleteInspection(id) {
    await deleteAllClientFiles(id).catch(() => {
    });
    const list = loadInspections().filter((i) => i.id !== id);
    saveInspections(list);
  }
  function nextDossierNumber() {
    const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10).replace(/-/g, "");
    const prefix = `KZO-${today}`;
    const list = loadInspections();
    const sameDay = list.filter((i) => i.site?.numeroDossier?.startsWith(prefix));
    const seq = String(sameDay.length + 1).padStart(3, "0");
    return `${prefix}-${seq}`;
  }
  function nextInvoiceNumber(profile) {
    const year = (/* @__PURE__ */ new Date()).getFullYear();
    if (!profile.invoiceYear || profile.invoiceYear !== year) {
      profile.invoiceCounter = 1;
      profile.invoiceYear = year;
    } else {
      profile.invoiceCounter = (profile.invoiceCounter || 0) + 1;
    }
    const num = String(profile.invoiceCounter).padStart(3, "0");
    saveProfile(profile);
    return `KZO-${year}-${num}`;
  }
  function duplicateInspection(id) {
    const src = getInspection(id);
    if (!src) return null;
    const copy = JSON.parse(JSON.stringify(src));
    copy.id = crypto.randomUUID();
    copy.status = "brouillon";
    copy.createdAt = (/* @__PURE__ */ new Date()).toISOString();
    copy.updatedAt = copy.createdAt;
    copy.completedAt = null;
    copy.site = { ...copy.site, numeroDossier: nextDossierNumber(), client: copy.site.client ? `${copy.site.client} (copie)` : "" };
    copy.signatureDataUrl = null;
    if (copy.inspector) copy.inspector.nom = INSPECTOR_NAME;
    upsertInspection(copy);
    return copy;
  }
  function computeGlobalStats(list) {
    let total = 0;
    let enCours = 0;
    let terminees = 0;
    let ncTotal = 0;
    for (const ins of list) {
      total += 1;
      if (ins.status === "en-cours") enCours += 1;
      if (ins.status === "terminee") terminees += 1;
      const s = computeStats(ins);
      ncTotal += s.nonConforme + s.aCorriger;
    }
    return { total, enCours, terminees, ncTotal };
  }
  function loadProfile() {
    let profile;
    try {
      const raw = localStorage.getItem(PROFILE_KEY);
      profile = raw ? JSON.parse(raw) : defaultProfile();
    } catch {
      profile = defaultProfile();
    }
    profile.nom = INSPECTOR_NAME;
    return profile;
  }
  function inspectorFieldsFromProfile(profile = loadProfile()) {
    return {
      nom: INSPECTOR_NAME,
      permis: profile.permis || "",
      entreprise: profile.entreprise || "",
      courriel: profile.courriel || "",
      telephone: profile.telephone || "",
      membreAibq: profile.membreAibq || "",
      certificatRbq: profile.certificatRbq || ""
    };
  }
  function saveProfile(profile) {
    localStorage.setItem(
      PROFILE_KEY,
      JSON.stringify({ ...profile, nom: INSPECTOR_NAME })
    );
  }
  function defaultProfile() {
    return {
      nom: INSPECTOR_NAME,
      permis: "",
      entreprise: "",
      courriel: "",
      telephone: "",
      membreAibq: "",
      certificatRbq: "",
      messageRemerciement: "",
      montantDefaut: "",
      descriptionServiceDefaut: "Inspection de b\xE2timent d'habitation",
      tauxTPS: 5,
      tauxTVQ: 9.975,
      noEntrepriseTPS: "",
      noEntrepriseTVQ: "",
      brandingLogoDataUrl: null,
      brandingAppName: "KZO Inspect",
      brandingTagline: "Inspection de b\xE2timents au Qu\xE9bec",
      brandingEntreprise: "",
      brandingFooter: "",
      brandingIbcMention: "",
      brandingReceiptPrefix: "KZO",
      aiAssistantOpen: true,
      aiUseCloud: false,
      aiApiKey: "",
      aiProvider: "anthropic",
      aiModel: "claude-sonnet-4-6"
    };
  }
  function computeStats(inspection) {
    let total = 0;
    let answered = 0;
    let conforme = 0;
    let nonConforme = 0;
    let aCorriger = 0;
    let na = 0;
    normalizeInspectionSections(inspection);
    for (const sec of inspection.sections) {
      iterSectionItems(sec, (item) => {
        total += 1;
        if (!item.status) return;
        answered += 1;
        if (item.status === "conforme") conforme += 1;
        else if (item.status === "non-conforme") nonConforme += 1;
        else if (item.status === "a-corriger") aCorriger += 1;
        else if (item.status === "na") na += 1;
      });
    }
    const progress = total ? Math.round(answered / total * 100) : 0;
    const score = answered ? Math.round((conforme + na) / answered * 100) : null;
    return { total, answered, conforme, nonConforme, aCorriger, na, progress, score };
  }

  // js/templates.js
  var TEMPLATE_META = {
    "etat-lieux": {
      id: "etat-lieux",
      label: "\xC9tat des lieux",
      norme: "R\xE9gie du logement / usage courant",
      icon: "\u{1F3E0}",
      description: "Entr\xE9e/sortie de bail, inventaire pi\xE8ce par pi\xE8ce, preuves photographiques.",
      group: "autre"
    },
    batiment: {
      id: "batiment",
      label: "B\xE2timent r\xE9sidentiel",
      norme: "Code du b\xE2timent du Qu\xE9bec (CBQ)",
      icon: "\u{1F3D7}\uFE0F",
      description: "Structure, s\xE9curit\xE9 incendie, sorties, garde-corps, d\xE9tecteurs.",
      group: "autre"
    },
    cnesst: {
      id: "cnesst",
      label: "SST \u2014 chantier / atelier",
      norme: "Loi sur la SST, CNESST",
      icon: "\u26D1\uFE0F",
      description: "Pr\xE9vention, signalisation, EPI, \xE9chafaudages, \xE9lectricit\xE9 temporaire.",
      group: "autre"
    },
    mapaq: {
      id: "mapaq",
      label: "Alimentaire",
      norme: "R\xE8glement MAPAQ / Loi sur les aliments",
      icon: "\u{1F37D}\uFE0F",
      description: "Cha\xEEne du froid, hygi\xE8ne, contamination crois\xE9e, tra\xE7abilit\xE9.",
      group: "autre"
    },
    incendie: {
      id: "incendie",
      label: "S\xE9curit\xE9 incendie",
      norme: "CNPI / municipalit\xE9",
      icon: "\u{1F525}",
      description: "Issues, extincteurs, alarmes, plans d'\xE9vacuation, compartimentage.",
      group: "autre"
    },
    "aibq-preachat": {
      id: "aibq-preachat",
      label: "Inspection pr\xE9achat AIBQ",
      norme: "Norme de pratique AIBQ (pr\xE9achat r\xE9sidentiel)",
      icon: "\u{1F3E1}",
      description: "Norme compl\xE8te : chapitres I \xE0 V, 11 syst\xE8mes, rapport, annexe I (arts 1-60).",
      group: "aibq-bnq",
      reference: "aibq.qc.ca \u2014 Norme de pratique inspection pr\xE9achat"
    },
    "bnq-3009": {
      id: "bnq-3009",
      label: "Transaction immobili\xE8re BNQ",
      norme: "BNQ 3009-500/2022 R1 \u2014 inspection r\xE9sidentielle",
      icon: "\u{1F4D0}",
      description: "Norme compl\xE8te : ch. 2 \xE0 12, processus, \xE9thique, dossier et art. 12.1 \xE0 12.8.",
      group: "aibq-bnq",
      reference: "bnq.qc.ca \u2014 B\xE2timent d'habitation, transaction immobili\xE8re"
    },
    custom: {
      id: "custom",
      label: "Liste personnalis\xE9e",
      norme: "\xC0 d\xE9finir",
      icon: "\u270F\uFE0F",
      description: "Cr\xE9ez vos propres sections et points de contr\xF4le.",
      group: "autre"
    }
  };
  var TEMPLATE_GROUPS = {
    "aibq-bnq": { label: "AIBQ & BNQ (inspection immobili\xE8re)", order: 0 },
    autre: { label: "Autres inspections", order: 1 }
  };
  var STATUS_OPTIONS = [
    { value: "conforme", label: "Conforme", short: "C" },
    { value: "non-conforme", label: "Non conforme", short: "NC" },
    { value: "a-corriger", label: "\xC0 corriger", short: "AC" },
    { value: "na", label: "S.O. / N/A", short: "N/A" }
  ];
  var PRIORITY_OPTIONS = [
    { value: "critique", label: "Critique" },
    { value: "majeur", label: "Majeur" },
    { value: "mineur", label: "Mineur" }
  ];
  var INSPECTION_STATUS = {
    brouillon: { label: "Brouillon", class: "badge--draft" },
    "en-cours": { label: "En cours", class: "badge--progress" },
    terminee: { label: "Termin\xE9e", class: "badge--done" },
    archivee: { label: "Archiv\xE9e", class: "badge--archived" }
  };
  function section2(id, title, items) {
    return {
      id,
      title,
      items: items.map((label, i) => ({
        id: `${id}-${i + 1}`,
        label,
        status: null,
        priority: "mineur",
        note: "",
        selectedPresets: [],
        inspectorComment: "",
        photos: []
      }))
    };
  }
  var TEMPLATES = {
    "etat-lieux": {
      sections: [
        section2("edl-general", "Informations g\xE9n\xE9rales", [
          "Type de constat : entr\xE9e ou sortie",
          "Nombre de pi\xE8ces inspect\xE9es",
          "Relev\xE9 des compteurs (\xE9lectricit\xE9, gaz, eau)",
          "Cl\xE9s et t\xE9l\xE9commandes remises (nombre et type)",
          "Bo\xEEte aux lettres et interphone",
          "Signalisation et num\xE9ro de porte"
        ]),
        section2("edl-entree", "Entr\xE9e et corridors", [
          "Porte d'entr\xE9e : \xE9tat, serrure, cl\xE9, seuil",
          "Murs : \xE9tat de la peinture, trous, fissures, taches",
          "Plafond : fissures, taches d'eau, peinture \xE9caill\xE9e",
          "Plancher : rev\xEAtement, usure, dommages",
          "Prises \xE9lectriques et interrupteurs fonctionnels",
          "\xC9clairage : plafonnier, appliques",
          "D\xE9tecteur de fum\xE9e pr\xE9sent et fonctionnel"
        ]),
        section2("edl-salon", "Salon / S\xE9jour", [
          "Murs : peinture, papier peint, fissures, trous",
          "Plafond : \xE9tat g\xE9n\xE9ral, traces d'humidit\xE9",
          "Plancher : parquet, tapis, carrelage \u2014 \xE9tat",
          "Fen\xEAtres : vitrage, m\xE9canisme, \xE9tanch\xE9it\xE9, moustiquaire",
          "Stores, rideaux ou toiles (si inclus)",
          "Prises \xE9lectriques, interrupteurs, c\xE2ble/t\xE9l\xE9phone",
          "Chauffage : plinthes, radiateur, calorif\xE8re \u2014 \xE9tat",
          "Portes int\xE9rieures : \xE9tat, poign\xE9e, fermeture"
        ]),
        section2("edl-cuisine", "Cuisine", [
          "Comptoirs et dosseret : fissures, taches, br\xFBlures",
          "Armoires et tiroirs : \xE9tat, charni\xE8res, poign\xE9es",
          "\xC9vier et robinetterie : \xE9tat, d\xE9bit, drainage",
          "Cuisini\xE8re / four : \xE9tat et fonctionnement",
          "R\xE9frig\xE9rateur : \xE9tat, joints, fonctionnement",
          "Lave-vaisselle (si inclus) : \xE9tat et fonctionnement",
          "Hotte de ventilation : fonctionnement, filtre",
          "Plancher : rev\xEAtement, taches, usure",
          "Murs et plafond : \xE9tat de la peinture",
          "Prises GFCI et interrupteurs",
          "Fen\xEAtre : vitrage, m\xE9canisme"
        ]),
        section2("edl-sdb", "Salle de bain principale", [
          "Toilette : \xE9tat, chasse d'eau, si\xE8ge, base",
          "Lavabo et robinetterie : \xE9tat, d\xE9bit, drainage",
          "Baignoire ou douche : \xE9tat, joints, robinets",
          "Carrelage mural et plancher : joints, fissures",
          "Ventilateur d'extraction : fonctionnement",
          "Miroir et armoire \xE0 pharmacie",
          "Porte-serviette, crochets, accessoires",
          "Traces d'humidit\xE9, moisissure, d\xE9g\xE2t d'eau",
          "Plancher : \xE9tat du rev\xEAtement"
        ]),
        section2("edl-sdb2", "Salle de bain secondaire (si applicable)", [
          "Toilette, lavabo, douche/bain : \xE9tat complet",
          "Carrelage, joints et \xE9tanch\xE9it\xE9",
          "Ventilation et traces d'humidit\xE9",
          "Accessoires et miroir"
        ]),
        section2("edl-chambre1", "Chambre principale", [
          "Murs : peinture, trous, fissures",
          "Plafond : \xE9tat, traces d'eau",
          "Plancher : \xE9tat du rev\xEAtement",
          "Fen\xEAtres : vitrage, m\xE9canisme, stores",
          "Garde-robe / placard : tablettes, tringle, porte",
          "Prises \xE9lectriques et interrupteurs",
          "Chauffage : \xE9tat de l'appareil",
          "Porte : \xE9tat, poign\xE9e, fermeture"
        ]),
        section2("edl-chambre2", "Chambre 2", [
          "Murs, plafond, plancher : \xE9tat g\xE9n\xE9ral",
          "Fen\xEAtres et stores",
          "Garde-robe / placard",
          "Prises, interrupteurs, chauffage"
        ]),
        section2("edl-chambre3", "Chambre 3 (si applicable)", [
          "Murs, plafond, plancher : \xE9tat g\xE9n\xE9ral",
          "Fen\xEAtres et stores",
          "Garde-robe / placard",
          "Prises, interrupteurs, chauffage"
        ]),
        section2("edl-buanderie", "Buanderie / rangement", [
          "Laveuse et s\xE9cheuse (si incluses) : \xE9tat",
          "Raccordements eau chaude/froide et drainage",
          "\xC9vent de s\xE9cheuse : \xE9tat et raccordement",
          "Plancher et murs : \xE9tat",
          "\xC9clairage et prises"
        ]),
        section2("edl-sous-sol", "Sous-sol (si applicable)", [
          "Murs et plancher : fissures, taches d'eau",
          "Fen\xEAtres de sous-sol : \xE9tat et fonctionnement",
          "Traces d'humidit\xE9 ou d'infiltration",
          "Chauffe-eau : \xE9tat visible",
          "Panneau \xE9lectrique : \xE9tat visible",
          "Pompe de puisard (si applicable)"
        ]),
        section2("edl-exterieur", "Ext\xE9rieur et parties communes", [
          "Balcon / terrasse : \xE9tat du plancher, garde-corps",
          "Porte-patio ou porte arri\xE8re : \xE9tat, serrure",
          "Escalier ext\xE9rieur : \xE9tat, mains courantes",
          "Stationnement : num\xE9ro, \xE9tat",
          "Rangement ext\xE9rieur / cabanon (si applicable)",
          "Bo\xEEte aux lettres et sonnette"
        ]),
        section2("edl-conclusion", "Conclusion et signatures", [
          "R\xE9sum\xE9 des anomalies constat\xE9es",
          "Photos jointes au dossier",
          "Signature du locataire sortant (si sortie)",
          "Signature du locataire entrant (si entr\xE9e)",
          "Signature du propri\xE9taire / repr\xE9sentant"
        ])
      ]
    },
    batiment: {
      sections: [
        section2("bat-terrain", "Terrain et environnement", [
          "Pente du terrain : drainage loin des fondations",
          "Trottoirs, all\xE9es et aires pav\xE9es : \xE9tat",
          "V\xE9g\xE9tation : arbres proches du b\xE2timent, racines",
          "Murs de sout\xE8nement : \xE9tat, inclinaison",
          "Cl\xF4tures et portails : \xE9tat et s\xE9curit\xE9",
          "\xC9clairage ext\xE9rieur et signalisation d'adresse",
          "Stationnement : drainage et \xE9tat de surface"
        ]),
        section2("bat-fondations", "Fondations", [
          "Type de fondation (b\xE9ton coul\xE9, blocs, pierre)",
          "Fissures visibles : emplacement, largeur, orientation",
          "Signes d'infiltration ou d'efflorescence",
          "Imperm\xE9abilisation visible ou absence",
          "Drain de fondation : regard visible ou signes de d\xE9ficience",
          "Vide sanitaire : acc\xE8s, humidit\xE9, ventilation"
        ]),
        section2("bat-structure", "Structure et charpente", [
          "Murs porteurs : d\xE9formations, fissures significatives",
          "Poutre principale : \xE9tat, port\xE9e, supports",
          "Colonnes de soutien : aplomb, corrosion, base",
          "Planchers : affaissement, rebondissement, craquement",
          "Charpente de toit visible : \xE9tat des fermes ou chevrons",
          "Linteaux au-dessus des ouvertures : fissures"
        ]),
        section2("bat-exterieur", "Rev\xEAtement ext\xE9rieur", [
          "Parement (brique, vinyle, bois, fibrociment) : \xE9tat",
          "Solins : fen\xEAtres, murs, chemin\xE9e",
          "Calfeutrage : joints fen\xEAtres, portes, raccords",
          "Avant-toits, fascias, soffites : \xE9tat",
          "Portes ext\xE9rieures : \xE9tat, \xE9tanch\xE9it\xE9, seuil",
          "Garage : porte, m\xE9canisme, coupe-feu",
          "Fen\xEAtres ext\xE9rieures : cadres, scellants, \xE9tat"
        ]),
        section2("bat-toiture", "Toiture", [
          "Type de couverture (bardeaux, membrane, t\xF4le)",
          "\xC9tat du rev\xEAtement : \xE2ge estim\xE9, usure",
          "Solins et scellants aux jonctions",
          "Goutti\xE8res et descentes pluviales",
          "Chemin\xE9e(s) : chapeau, ma\xE7onnerie, solin",
          "\xC9vents de plomberie et ventilation",
          "Lucarnes et puits de lumi\xE8re",
          "M\xE9thode d'observation document\xE9e"
        ]),
        section2("bat-plomberie", "Plomberie", [
          "Entr\xE9e d'eau principale et robinet d'arr\xEAt",
          "Type de tuyauterie (cuivre, PVC, PEX, galvanis\xE9)",
          "Pression et d\xE9bit aux robinets",
          "Chauffe-eau : type, \xE2ge, capacit\xE9, soupape T&P",
          "Toilettes : fonctionnement, \xE9tanch\xE9it\xE9 \xE0 la base",
          "\xC9viers, lavabos, bains : drainage, fuites",
          "Pompe de puisard : \xE9tat, fonctionnement",
          "Clapet anti-retour (si visible)",
          "Ventilation plomberie (\xE9vents)",
          "Robinets ext\xE9rieurs et brise-vide"
        ]),
        section2("bat-electrique", "\xC9lectricit\xE9", [
          "Entr\xE9e de service : a\xE9rien ou souterrain, m\xE2t",
          "Panneau principal : capacit\xE9, \xE9tat, \xE9tiquetage",
          "Panneaux secondaires (si applicable)",
          "Mise \xE0 la terre : borne visible",
          "C\xE2blage : type (Romex, BX, Knob & Tube)",
          "Prises DDFT/GFCI : SDB, cuisine, ext\xE9rieur",
          "Prises AFCI (chambres si applicable)",
          "Interrupteurs et luminaires : \xE9chantillon",
          "Bo\xEEtes de jonction : couvertes et accessibles",
          "Fils d'aluminium (si pr\xE9sents) : connexions"
        ]),
        section2("bat-chauffage", "Chauffage et climatisation", [
          "Syst\xE8me principal : type, \xE9nergie, \xE2ge estim\xE9",
          "Fonctionnement par commandes normales",
          "Distribution : conduits, plinthes, radiateurs",
          "Thermostat : type et fonctionnement",
          "Climatiseur central : unit\xE9 ext\xE9rieure, drain",
          "Thermopompe (si applicable) : \xE9tat",
          "R\xE9servoir de combustible : \xE9tat, supports",
          "Chemin\xE9e : conduit de fum\xE9e, d\xE9gagement",
          "Foyer / po\xEAle \xE0 bois : plaque, d\xE9gagement"
        ]),
        section2("bat-ventilation", "Ventilation et isolation", [
          "\xC9changeur d'air / VRC : \xE9tat, fonctionnement",
          "Ventilateurs de salle de bain : fonctionnement",
          "Hotte de cuisine : \xE9vacuation",
          "\xC9vent de s\xE9cheuse : raccordement, longueur",
          "Isolation combles : type, \xE9paisseur estim\xE9e",
          "Pare-vapeur visible (si observable)",
          "Ventilation des combles : soffites, \xE9vents de toit",
          "Ventilation vide sanitaire (si applicable)"
        ]),
        section2("bat-interieur", "Int\xE9rieur", [
          "Murs, plafonds et planchers : \xE9tat par pi\xE8ce",
          "Portes int\xE9rieures : \xE9tat, fonctionnement",
          "Escaliers int\xE9rieurs : marches, contremarches",
          "Garde-corps et mains courantes",
          "Fen\xEAtres : \xE9tat, m\xE9canismes, condensation",
          "Armoires et comptoirs : cuisine, SDB",
          "Traces d'infiltration, moisissure, condensation"
        ]),
        section2("bat-securite", "S\xE9curit\xE9 des occupants", [
          "D\xE9tecteurs de fum\xE9e : pr\xE9sence, emplacement",
          "D\xE9tecteurs de CO : si combustion ou garage",
          "Garde-corps : hauteur, espacement, solidit\xE9",
          "Issues de secours : nombre, d\xE9gagement",
          "\xC9clairage de secours (si applicable)",
          "S\xE9paration coupe-feu garage-habitation",
          "Fen\xEAtre de sortie au sous-sol (chambre)"
        ]),
        batimentGrenierSection()
      ]
    },
    cnesst: {
      sections: [
        section2("sst-admin", "Administration et documentation SST", [
          "Programme de pr\xE9vention disponible et \xE0 jour",
          "Registre des accidents et incidents tenu",
          "Comit\xE9 SST ou d\xE9l\xE9gu\xE9 d\xE9sign\xE9 et identifi\xE9",
          "Plan d'urgence affich\xE9 avec num\xE9ros (911, CSST, poison)",
          "Formation SIMDUT / mati\xE8res dangereuses \xE0 jour",
          "Registre de formation des travailleurs",
          "Affichage des droits et obligations (LSST)",
          "Proc\xE9dure de cadenassage document\xE9e"
        ]),
        section2("sst-chantier", "Organisation du chantier", [
          "P\xE9rim\xE8tre de s\xE9curit\xE9 balis\xE9 et signal\xE9",
          "Acc\xE8s contr\xF4l\xE9 : barri\xE8res, gardien, registre",
          "S\xE9paration pi\xE9tons / v\xE9hicules / \xE9quipements lourds",
          "Ordre, propret\xE9 et rangement des mat\xE9riaux",
          "\xC9clairage ad\xE9quat des zones de travail",
          "Signalisation routi\xE8re si voie publique",
          "Toilettes et eau potable accessibles",
          "Trousse de premiers soins compl\xE8te et accessible"
        ]),
        section2("sst-epi", "\xC9quipements de protection individuelle", [
          "Casque de s\xE9curit\xE9 : \xE9tat et port obligatoire",
          "Lunettes ou visi\xE8re de protection",
          "Gants adapt\xE9s au type de t\xE2che",
          "Chaussures de s\xE9curit\xE9 \xE0 embout d'acier",
          "Protection auditive si bruit > 85 dB",
          "Protection respiratoire si poussi\xE8res / solvants",
          "V\xEAtements haute visibilit\xE9",
          "Harnais de s\xE9curit\xE9 si travail en hauteur > 3 m"
        ]),
        section2("sst-hauteur", "Travail en hauteur", [
          "\xC9chafaudage mont\xE9 par personne comp\xE9tente",
          "Garde-corps et plinthes sur toutes plateformes",
          "Plancher complet et s\xE9curis\xE9",
          "\xC9chelles : angle 4:1, d\xE9passe de 1 m, pieds cal\xE9s",
          "Lignes de vie et ancrages conformes",
          "Filets de s\xE9curit\xE9 (si applicable)",
          "Ouvertures dans plancher prot\xE9g\xE9es",
          "Toit plat : protection p\xE9rim\xE9trique"
        ]),
        section2("sst-electrique", "\xC9lectricit\xE9 et cadenassage", [
          "C\xE2bles temporaires prot\xE9g\xE9s et signal\xE9s",
          "Panneaux temporaires accessibles et d\xE9gag\xE9s",
          "Disjoncteurs et GFCI fonctionnels",
          "Outils \xE0 double isolation ou avec GFCI",
          "Proc\xE9dure de cadenassage appliqu\xE9e",
          "Cadenas personnels et \xE9tiquettes",
          "Distances de s\xE9curit\xE9 lignes \xE9lectriques"
        ]),
        section2("sst-excavation", "Excavation et tranch\xE9es", [
          "\xC9tan\xE7onnement ou talutage conforme",
          "D\xE9tection des services souterrains (Info-Excavation)",
          "Acc\xE8s et sortie de la tranch\xE9e (\xE9chelle / rampe)",
          "Mat\xE9riaux entrepos\xE9s \xE0 1.2 m du bord",
          "Surveillance de l'atmosph\xE8re (si applicable)",
          "Pompage de l'eau si accumulation"
        ]),
        section2("sst-materiaux", "Manutention et entreposage", [
          "Empilage stable et s\xE9curitaire",
          "All\xE9es d\xE9gag\xE9es pour circulation",
          "Utilisation correcte des aides m\xE9caniques",
          "Mati\xE8res dangereuses entrepos\xE9es selon SIMDUT",
          "Bonbonnes de gaz arrim\xE9es et capuchonn\xE9es",
          "Conteneurs de d\xE9chets identifi\xE9s"
        ])
      ]
    },
    mapaq: {
      sections: [
        section2("map-general", "Informations de l'\xE9tablissement", [
          "Permis MAPAQ valide et affich\xE9",
          "Responsable hygi\xE8ne d\xE9sign\xE9",
          "Plan de nettoyage et d\xE9sinfection document\xE9",
          "Programme de lutte antiparasitaire actif",
          "Registre des temp\xE9ratures tenu quotidiennement",
          "Formation en hygi\xE8ne et salubrit\xE9 du personnel"
        ]),
        section2("map-personnel", "Hygi\xE8ne du personnel", [
          "Lavabo pour lavage des mains : savon, eau chaude, essuie-mains",
          "Lavage des mains pratiqu\xE9 avant manipulation",
          "Tenue propre et adapt\xE9e (tablier, filet, gants)",
          "Cheveux retenus et couverts",
          "Bijoux limit\xE9s selon politique",
          "Absence de sympt\xF4mes infectieux",
          "Couvre-plaies \xE9tanches et color\xE9s sur blessures",
          "Interdiction de manger dans les zones de pr\xE9paration"
        ]),
        section2("map-reception", "R\xE9ception et entreposage", [
          "V\xE9rification de la temp\xE9rature \xE0 la r\xE9ception",
          "V\xE9rification des dates de p\xE9remption",
          "Int\xE9grit\xE9 des emballages v\xE9rifi\xE9e",
          "Entreposage au sol interdit (tablettes sur\xE9lev\xE9es)",
          "Rotation des stocks (FIFO \u2014 Premier entr\xE9, premier sorti)",
          "S\xE9paration des produits crus et pr\xEAts-\xE0-manger",
          "Produits chimiques entrepos\xE9s s\xE9par\xE9ment",
          "Identification et datation des produits ouverts"
        ]),
        section2("map-froid", "Cha\xEEne du froid", [
          "R\xE9frig\xE9rateur \u2264 4 \xB0C \u2014 thermom\xE8tre visible",
          "Cong\xE9lateur \u2264 -18 \xB0C \u2014 thermom\xE8tre visible",
          "Chambre froide : temp\xE9rature conforme et enregistr\xE9e",
          "Thermom\xE8tres \xE9talonn\xE9s et document\xE9s",
          "Maintien du froid lors du transport",
          "D\xE9cong\xE9lation au r\xE9frig\xE9rateur ou eau froide courante",
          "Aliments chauds maintenus \u2265 60 \xB0C",
          "Refroidissement rapide (60 \xB0C \xE0 4 \xB0C en \u2264 6 h)"
        ]),
        section2("map-preparation", "Pr\xE9paration des aliments", [
          "Surfaces de travail propres et d\xE9sinfect\xE9es",
          "Planches \xE0 d\xE9couper cod\xE9es par couleur",
          "Ustensiles nettoy\xE9s entre les utilisations",
          "Pr\xE9vention de la contamination crois\xE9e",
          "Cuisson \xE0 temp\xE9rature interne s\xE9curitaire",
          "Thermom\xE8tre \xE0 sonde utilis\xE9 et \xE9talonn\xE9",
          "Manipulation minimale des aliments pr\xEAts-\xE0-manger"
        ]),
        section2("map-nettoyage", "Nettoyage et salubrit\xE9", [
          "Plan de nettoyage affich\xE9 et suivi",
          "Produits de nettoyage homologu\xE9s et identifi\xE9s",
          "D\xE9sinfection des surfaces de contact alimentaire",
          "Lavage de vaisselle : temp\xE9rature et d\xE9tergent",
          "Poubelles avec couvercle et vid\xE9es r\xE9guli\xE8rement",
          "Planchers, murs, plafonds propres et en bon \xE9tat",
          "Ventilation ad\xE9quate et filtres propres",
          "Absence de moisissure ou accumulation de graisse"
        ]),
        section2("map-parasites", "Lutte antiparasitaire", [
          "Programme de lutte document\xE9",
          "Aucun signe de rongeurs, insectes ou oiseaux",
          "Portes et fen\xEAtres munies de moustiquaires",
          "Ouvertures ext\xE9rieures scell\xE9es",
          "Pi\xE8ges install\xE9s et v\xE9rifi\xE9s r\xE9guli\xE8rement",
          "Registre des interventions de l'exterminateur"
        ]),
        section2("map-tracabilite", "Tra\xE7abilit\xE9 et rappel", [
          "Registre des fournisseurs et lots",
          "\xC9tiquetage des allerg\xE8nes conforme",
          "Proc\xE9dure de rappel connue et document\xE9e",
          "Coordonn\xE9es des fournisseurs accessibles",
          "Registre des plaintes clients"
        ])
      ]
    },
    incendie: {
      sections: [
        section2("inc-general", "Informations g\xE9n\xE9rales", [
          "Type de b\xE2timent et usage principal",
          "Nombre d'\xE9tages et superficie",
          "Nombre d'occupants maximal",
          "Classification du b\xE2timent selon CNPI",
          "Date de construction et r\xE9novations majeures",
          "Rapport d'inspection pr\xE9c\xE9dent (si disponible)"
        ]),
        section2("inc-issues", "Issues et moyens d'\xE9vacuation", [
          "Nombre d'issues de secours conforme au code",
          "Portes de sortie d\xE9verrouillables sans cl\xE9",
          "Couloirs et escaliers d\xE9gag\xE9s d'obstacles",
          "Largeur minimale des corridors respect\xE9e",
          "\xC9clairage de secours fonctionnel (test)",
          "Signalisation EXIT / SORTIE visible et \xE9clair\xE9e",
          "Plans d'\xE9vacuation affich\xE9s \xE0 chaque \xE9tage",
          "Exercice d'\xE9vacuation r\xE9alis\xE9 (date)"
        ]),
        section2("inc-detection", "D\xE9tection et alarme", [
          "Syst\xE8me d'alarme incendie : type et fabricant",
          "Panneau de contr\xF4le : sans trouble actif",
          "Avertisseurs de fum\xE9e : emplacement et test",
          "D\xE9tecteurs de chaleur (si requis)",
          "Avertisseurs manuels accessibles et identifi\xE9s",
          "Test annuel du syst\xE8me par technicien certifi\xE9",
          "Rapport de v\xE9rification annuelle disponible",
          "Batteries de secours charg\xE9es"
        ]),
        section2("inc-extincteurs", "Extincteurs portatifs", [
          "Emplacement visible, signalis\xE9 et accessible",
          "Hauteur d'installation conforme (max 1.5 m)",
          "Inspection mensuelle document\xE9e",
          "Entretien annuel par technicien certifi\xE9",
          "Type adapt\xE9 au risque (A, B, C, K)",
          "Charge et scell\xE9 intacts",
          "Distance de parcours maximale respect\xE9e",
          "\xC9tiquette d'inspection \xE0 jour"
        ]),
        section2("inc-sprinklers", "Gicleurs automatiques (si applicable)", [
          "T\xEAtes de gicleurs non obstru\xE9es (min 46 cm)",
          "Vanne principale ouverte et cadenass\xE9e",
          "Pression d'eau ad\xE9quate",
          "Test de d\xE9bit annuel document\xE9",
          "Gicleurs de remplacement disponibles",
          "Chauffage ad\xE9quat pour \xE9viter le gel"
        ]),
        section2("inc-compartimentage", "Compartimentage et s\xE9parations", [
          "Portes coupe-feu \xE0 fermeture automatique",
          "Joints et quincaillerie coupe-feu intacts",
          "Travers\xE9es de conduits et c\xE2bles obtur\xE9es",
          "S\xE9paration garage / habitation conforme",
          "Cage d'escalier : portes, murs int\xE9grit\xE9",
          "Cloisons coupe-feu entre logements",
          "Vide de construction non contamin\xE9"
        ]),
        section2("inc-equipements", "\xC9quipements sp\xE9ciaux", [
          "G\xE9n\xE9ratrice de secours : \xE9tat et carburant",
          "Ascenseurs : rappel pompiers fonctionnel",
          "Colonnes s\xE8ches / montantes (si applicable)",
          "Raccord pompier accessible",
          "Chambre \xE9lectrique : acc\xE8s et d\xE9gagement",
          "Salle des machines : ventilation",
          "\xC9clairage de secours dans escaliers"
        ]),
        section2("inc-risques", "Risques particuliers", [
          "Entreposage de mati\xE8res dangereuses",
          "Bonbonnes de propane / gaz : entreposage",
          "Accumulation de mat\xE9riaux combustibles",
          "Installations de cuisson commerciale",
          "Syst\xE8me d'extinction de cuisine (type K)",
          "Fumoir ou zone fumeur : conformit\xE9"
        ])
      ]
    },
    "aibq-preachat": { sections: AIBQ_SECTIONS },
    "bnq-3009": { sections: BNQ_SECTIONS },
    custom: {
      sections: [
        section2("section-1", "Section 1", [
          "Point de contr\xF4le 1",
          "Point de contr\xF4le 2",
          "Point de contr\xF4le 3"
        ])
      ]
    }
  };
  function cloneTemplate(templateId) {
    const raw = TEMPLATES[templateId] ?? TEMPLATES.custom;
    return JSON.parse(JSON.stringify(raw));
  }
  function createEmptyInspection(templateId) {
    const meta = TEMPLATE_META[templateId] ?? TEMPLATE_META.custom;
    const cloned = cloneTemplate(templateId);
    return {
      id: crypto.randomUUID(),
      templateId,
      templateLabel: meta.label,
      norme: meta.norme,
      status: "brouillon",
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
      completedAt: null,
      site: {
        client: "",
        proprietaire: "",
        courtier: "",
        courrielClient: "",
        telephoneClient: "",
        adresse: "",
        ville: "",
        codePostal: "",
        typeBatiment: "",
        numeroDossier: "",
        categorieBnq: "",
        mandat: ""
      },
      visit: defaultVisit(),
      inspector: {
        nom: INSPECTOR_NAME,
        permis: "",
        entreprise: "",
        courriel: "",
        telephone: "",
        membreAibq: "",
        certificatRbq: ""
      },
      observations: "",
      thankYouNote: "",
      receipt: null,
      coverPhotoDataUrl: null,
      coverPhotoCaption: "",
      limitations: "",
      expertReferrals: [],
      signatureDataUrl: null,
      sections: cloned.sections
    };
  }

  // js/backup.js
  var EXPORT_VERSION = 1;
  var SAFE_PROFILE_KEYS = [
    "inspectorName", "inspectorTitle", "inspectorCert", "inspectorPhone",
    "inspectorEmail", "inspectorAddress", "inspectorCity", "inspectorProvince",
    "inspectorPostal", "firmName", "firmPhone", "firmEmail", "firmAddress",
    "brandingLogoDataUrl", "signatureDataUrl", "coverPhotoDataUrl",
    "reportHeaderColor", "reportFooterText", "language", "currency",
    "taxRate", "defaultTemplate", "aiUseCloud", "aiModel", "aiProvider",
    "aiApiKey", "googleClientId", "sheetsWebhookUrl"
  ];
  function isValidDataUrl(value) {
    if (!value) return true;
    return /^data:image\/(jpeg|jpg|png|webp|gif);base64,[A-Za-z0-9+/=]+$/.test(value);
  }
  function sanitizeInspection(ins) {
    if (!ins || typeof ins !== "object") return ins;
    const urlFields = ["signatureDataUrl", "coverPhotoDataUrl", "heroPhotoUrl"];
    for (const field of urlFields) {
      if (ins[field] && !isValidDataUrl(ins[field])) {
        console.warn(`[Security] ${field} invalide dans inspection ${ins.id} — ignor\xE9`);
        ins[field] = "";
      }
    }
    return ins;
  }
  function exportAllData() {
    const safeProfile2 = { ...loadProfile() };
    delete safeProfile2.aiApiKey;
    const payload = {
      version: EXPORT_VERSION,
      exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
      app: "KZO Inspect",
      profile: safeProfile2,
      inspections: loadInspections()
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const stamp = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
    a.href = url;
    a.download = `kzo-inspect-sauvegarde-${stamp}.json`;
    a.click();
    URL.revokeObjectURL(url);
    return payload.inspections.length;
  }
  function exportInspectionBackup(inspection, profile) {
    if (!inspection?.id) return;
    profile = profile || loadProfile();
    // Fix I-4 : exclure aiApiKey du profil export\u00e9
    const safeProfile3 = { ...profile };
    delete safeProfile3.aiApiKey;
    const stamp = (/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-").slice(0, 19);
    const clientSlug = (inspection.site?.client || "sans-client")
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40)
      .toLowerCase();
    const dossier = inspection.site?.numeroDossier || "sans-dossier";
    const payload = {
      version: EXPORT_VERSION,
      exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
      app: "KZO Inspect",
      type: "inspection-backup",
      profile: safeProfile3,
      inspections: [inspection]
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kzo-dossier-${dossier}-${clientSlug}-${stamp}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
  async function importAllData(file, { replace = false } = {}) {
    const text = await file.text();
    const data = JSON.parse(text);
    if (!data.inspections || !Array.isArray(data.inspections)) {
      throw new Error("Fichier invalide : inspections manquantes.");
    }
    // Fix C-6 : validation du profil importé — liste blanche + data URLs
    if (data.profile && typeof data.profile === "object") {
      const safeProfile4 = {};
      for (const key of SAFE_PROFILE_KEYS) {
        if (key in data.profile) safeProfile4[key] = data.profile[key];
      }
      const profileUrlFields = ["brandingLogoDataUrl", "signatureDataUrl", "coverPhotoDataUrl"];
      for (const field of profileUrlFields) {
        if (safeProfile4[field] && !isValidDataUrl(safeProfile4[field])) {
          console.warn(`[Security] Champ profil ${field} invalide ignor\xE9 \xE0 l'import`);
          delete safeProfile4[field];
        }
      }
      if (!safeProfile4.aiApiKey) {
        const currentProfile2 = loadProfile();
        if (currentProfile2.aiApiKey) safeProfile4.aiApiKey = currentProfile2.aiApiKey;
      }
      saveProfile(safeProfile4);
    }
    // Fix C-6 : valider les data URLs dans chaque inspection importée
    const sanitizedInspections = data.inspections.map(sanitizeInspection);
    if (replace) {
      saveInspections(sanitizedInspections);
    } else {
      const existing = loadInspections();
      const byId = new Map(existing.map((i) => [i.id, i]));
      for (const ins of sanitizedInspections) {
        if (ins?.id) byId.set(ins.id, ins);
      }
      saveInspections([...byId.values()]);
    }
    return data.inspections.length;
  }
  function estimateStorageUsage() {
    let bytes = 0;
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k?.startsWith("inspectqc_")) {
          bytes += (localStorage.getItem(k)?.length || 0) * 2;
        }
      }
    } catch {
    }
    return bytes;
  }
  function formatBytes(n) {
    if (n < 1024) return `${n} o`;
    if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} Ko`;
    return `${(n / (1024 * 1024)).toFixed(1)} Mo`;
  }

  // js/image-utils.js
  function compressImage(file, maxW = 1200, quality = 0.72) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          let { width, height } = img;
          if (width > maxW) {
            height = height * maxW / width;
            width = maxW;
          }
          const c = document.createElement("canvas");
          c.width = width;
          c.height = height;
          c.getContext("2d").drawImage(img, 0, 0, width, height);
          resolve(c.toDataURL("image/jpeg", quality));
        };
        img.onerror = reject;
        img.src = reader.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
  function shrinkDataUrl(dataUrl, maxW = 1280, quality = 0.78) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxW) {
          height = height * maxW / width;
          width = maxW;
        }
        const c = document.createElement("canvas");
        c.width = width;
        c.height = height;
        c.getContext("2d").drawImage(img, 0, 0, width, height);
        resolve(c.toDataURL("image/jpeg", quality));
      };
      img.onerror = () => reject(new Error("Image illisible"));
      img.src = dataUrl;
    });
  }
  function safeImgSrc(value) {
    if (!value || typeof value !== "string") return "";
    if (/^data:image\/(jpeg|jpg|png|webp|gif);base64,[A-Za-z0-9+/=]+$/.test(value)) return value;
    if (/^\.\/assets\/[a-zA-Z0-9._/-]+\.(png|jpg|jpeg|webp|gif|ico)$/.test(value)) return value;
    if (/^https:\/\/[a-zA-Z0-9.-]+\.(googleapis\.com|googleusercontent\.com)\//.test(value)) return value;
    console.warn("[Security] safeImgSrc: URL rejet\xE9e :", value.substring(0, 80));
    return "";
  }

  // js/ai-models.js
  var AI_PROVIDERS = [
    { value: "openai", label: "OpenAI (GPT-4o, GPT-4.1)" },
    { value: "anthropic", label: "Anthropic (Claude 4)" },
    { value: "gemini", label: "Google Gemini (2.0/2.5)" },
    { value: "xai", label: "xAI (Grok)" }
  ];
  var AI_MODEL_OPTIONS = [
    { value: "gpt-4o-mini", label: "GPT-4o mini", hint: "Rapide et \xE9conomique (OpenAI)", provider: "openai" },
    { value: "gpt-4o", label: "GPT-4o", hint: "\xC9quilibre qualit\xE9 / vision (OpenAI)", provider: "openai" },
    { value: "gpt-4.1-mini", label: "GPT-4.1 mini", hint: "Derni\xE8re g\xE9n\xE9ration, compact", provider: "openai" },
    { value: "gpt-4.1", label: "GPT-4.1", hint: "Derni\xE8re g\xE9n\xE9ration, plus pr\xE9cis", provider: "openai" },
    { value: "o4-mini", label: "o4-mini", hint: "Raisonnement l\xE9ger", provider: "openai" },
    { value: "o3-mini", label: "o3-mini", hint: "Raisonnement avanc\xE9", provider: "openai" },
    { value: "claude-sonnet-4-6", label: "Claude Sonnet 4.6", hint: "Recommand\xE9 â€” inspection, vision, rapports", provider: "anthropic" },
    { value: "claude-opus-4-6", label: "Claude Opus 4.6", hint: "Maximum de qualit\xE9 (Claude 4)", provider: "anthropic" },
    { value: "claude-haiku-4-5-20251001", label: "Claude Haiku 4.5", hint: "Rapide et \xE9conomique (Claude 4)", provider: "anthropic" },
    { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash", hint: "Rapide, vision incluse (Google)", provider: "gemini" },
    { value: "gemini-2.0-flash", label: "Gemini 2.0 Flash", hint: "Ultra rapide, vision incluse (Google)", provider: "gemini" },
    { value: "gemini-2.5-pro", label: "Gemini 2.5 Pro", hint: "Tr\xE8s puissant pour le raisonnement", provider: "gemini" },
    { value: "grok-vision-beta", label: "Grok Vision", hint: "Analyse d'image par xAI", provider: "xai" }
  ];
  function normalizeAiModel(value) {
    const v = String(value ?? "").trim();
    return v || "gpt-4o-mini";
  }
  function isKnownAiModel(value) {
    const v = normalizeAiModel(value);
    return AI_MODEL_OPTIONS.some((m) => m.value === v);
  }
  function aiModelSelectMarkup(currentModel, currentProvider, escapeAttr2, escapeHtml10) {
    const current = normalizeAiModel(currentModel);
    const provider = currentProvider || "openai";
    const known = isKnownAiModel(current);
    const options = AI_MODEL_OPTIONS.filter((m) => m.provider === provider).map((m) => {
      const label = m.hint ? `${m.label} \u2014 ${m.hint}` : m.label;
      return `<option value="${escapeAttr2(m.value)}" ${current === m.value ? "selected" : ""}>${escapeHtml10(label)}</option>`;
    }).join("");
    return `
    <label id="ai-model-label">Mod\xE8le
      <select class="input" name="aiModel" id="ai-model-select">
        ${options}
        <option value="__custom__" ${!known ? "selected" : ""}>Autre mod\xE8le (saisie manuelle)\u2026</option>
      </select>
    </label>
    <label id="ai-model-custom-wrap" class="ai-model-custom" ${known ? "hidden" : ""}>
      Identifiant du mod\xE8le personnalis\xE9
      <input class="input" type="text" name="aiModelCustom" id="ai-model-custom" value="${escapeAttr2(known ? "" : current)}" placeholder="Identifiant API" autocomplete="off" />
    </label>
    <p class="form-hint form-hint--compact" id="ai-model-hint">${escapeHtml10(modelHintLabel(current))}</p>`;
  }
  function modelHintLabel(modelId) {
    const known = AI_MODEL_OPTIONS.find((m) => m.value === modelId);
    if (known) return `Mod\xE8le actif : ${known.label}. ${known.hint || ""}`;
    return `Mod\xE8le actif : ${modelId}`;
  }
  function bindAiModelSelect() {
    const select = document.getElementById("ai-model-select");
    const customWrap = document.getElementById("ai-model-custom-wrap");
    const customInput = document.getElementById("ai-model-custom");
    const hint = document.getElementById("ai-model-hint");
    if (!select || !customWrap) return;
    const sync = () => {
      const isCustom = select.value === "__custom__";
      customWrap.hidden = !isCustom;
      if (isCustom) customInput?.focus();
      const model = isCustom ? normalizeAiModel(customInput?.value) : normalizeAiModel(select.value);
      if (hint) hint.textContent = modelHintLabel(model);
    };
    select.addEventListener("change", sync);
    customInput?.addEventListener("input", sync);
    const providerSelect = document.getElementById("ai-provider-select");
    if (providerSelect) {
      providerSelect.addEventListener("change", () => {
        const p = providerSelect.value;
        const opts = AI_MODEL_OPTIONS.filter((m) => m.provider === p).map((m) => {
          const label = m.hint ? `${m.label} \u2014 ${m.hint}` : m.label;
          return `<option value="${m.value}">${label}</option>`;
        }).join("");
        select.innerHTML = opts + `<option value="__custom__">Autre mod\xE8le (saisie manuelle)\u2026</option>`;
        sync();
      });
    }
    sync();
  }

  // js/ai-knowledge.js
  var QUICK_PROMPTS = [
    { id: "help-point", label: "Aide sur ce point" },
    { id: "nc-ac", label: "NC vs \xE0 corriger ?" },
    { id: "presets", label: "R\xE9ponses rapides" },
    { id: "na", label: "Quand mettre N/A ?" },
    { id: "report", label: "Pr\xE9parer le rapport" },
    { id: "app", label: "Utiliser l'app" },
    { id: "analyze-photo", label: "Analyser une photo" }
  ];
  var STATUS_HELP = {
    conforme: "**Conforme (C)** : \xE9l\xE9ment observ\xE9 conforme \xE0 l'inspection visuelle du jour, sans anomalie significative. Utilisez une r\xE9ponse rapide (\xAB Conforme \xE0 l'inspection visuelle \xBB, \xAB Bon \xE9tat g\xE9n\xE9ral \xBB) et ajoutez un commentaire seulement si utile au rapport.",
    "non-conforme": "**Non conforme (NC)** : anomalie importante, risque s\xE9curitaire ou non-conformit\xE9 claire au code / \xE0 la norme. Documentez avec photos, priorit\xE9 (critique/majeur/mineur) et commentaire inspecteur. Recommandez un expert si hors champ de comp\xE9tence.",
    "a-corriger": "**\xC0 corriger (AC)** : d\xE9faut ou usure \xE0 surveiller ou corriger, sans urgence imm\xE9diate comme une NC majeure. Id\xE9al pour entretien pr\xE9ventif, fissures \xE0 surveiller, vieillissement normal.",
    na: "**S.O. / N/A** : point non inspect\xE9 (inaccessible, masqu\xE9, hors champ, conditions). Choisissez une r\xE9ponse rapide (\xAB Non accessible \xBB, \xAB Hors champ d'inspection \xBB) et pr\xE9cisez pourquoi dans le commentaire \u2014 c'est essentiel pour limiter votre responsabilit\xE9 au rapport."
  };
  function buildContextSummary(ctx) {
    if (!ctx?.inspection) {
      if (ctx?.route === "profile") return "Page profil \u2014 param\xE8tres inspecteur et sauvegarde.";
      if (ctx?.route === "new") return "Cr\xE9ation d'une nouvelle inspection.";
      return "Tableau de bord \u2014 liste des dossiers.";
    }
    const i = ctx.inspection;
    const lines = [
      `Dossier : ${i.client || "Sans nom"}`,
      `Mod\xE8le : ${i.templateLabel} (${i.norme})`,
      `Progression : ${i.progress}% \u2014 ${i.answered}/${i.total} points`
    ];
    if (i.nc > 0 || i.ac > 0) {
      lines.push(`Constats : ${i.nc} NC, ${i.ac} \xE0 corriger`);
    }
    if (ctx.tab) lines.push(`Onglet actif : ${ctx.tabLabel || ctx.tab}`);
    if (ctx.sectionTitle) lines.push(`Section : ${ctx.sectionTitle}`);
    if (ctx.itemLabel) lines.push(`Point : ${ctx.itemLabel}`);
    if (ctx.itemStatus) lines.push(`Statut actuel : ${ctx.itemStatus}`);
    return lines.join("\n");
  }
  function matchAny(text, patterns) {
    return patterns.some((p) => typeof p === "string" ? text.includes(p) : p.test(text));
  }
  function answerLocally(question, ctx) {
    const q = (question || "").toLowerCase().normalize("NFD").replace(/\p{M}/gu, "");
    const ctxText = buildContextSummary(ctx).toLowerCase();
    if (matchAny(q, ["nc", "non conforme", "a corriger", "ac", "difference", "diff\xE9rence", "vs"])) {
      return `**NC vs \xE0 corriger**

${STATUS_HELP["non-conforme"]}

${STATUS_HELP["a-corriger"]}

En cas de doute sur un point critique (\xE9lectricit\xE9, gaz, structure), documentez et recommandez un expert sp\xE9cialis\xE9.`;
    }
    if (matchAny(q, ["reponse rapide", "r\xE9ponse rapide", "pastille", "preset"])) {
      return `**R\xE9ponses rapides**

1. Choisissez d'abord le **statut** (C, NC, AC, N/A).
2. Touchez une ou plusieurs **pastilles** pour les formulations courantes.
3. Compl\xE9tez avec votre **commentaire inspecteur** (mesures, articles, contexte).

Les deux apparaissent s\xE9par\xE9ment dans le rapport PDF.`;
    }
    if (matchAny(q, ["n/a", "na", "sans objet", "inaccessible", "hors champ"])) {
      return `**Quand utiliser N/A**

${STATUS_HELP.na}

Ne marquez pas \xAB conforme \xBB par d\xE9faut sur un \xE9l\xE9ment non vu.`;
    }
    if (matchAny(q, ["conforme", " statut c", /^c$/])) {
      return STATUS_HELP.conforme;
    }
    if (matchAny(q, ["rapport", "pdf", "synthese", "synth\xE8se", "limitation"])) {
      return `**Rapport et cl\xF4ture**

- Onglet **Cl\xF4ture** : limitations, observations g\xE9n\xE9rales, experts recommand\xE9s, signature.
- Bouton **Rapport PDF** : couverture, synth\xE8se des NC/AC, sections d\xE9taill\xE9es.
- V\xE9rifiez les points **NC/AC** avec photos et commentaires avant d'envoyer au client.

${ctx?.inspection?.nc ? `Ce dossier a actuellement **${ctx.inspection.nc} NC** et **${ctx.inspection.ac} \xE0 corriger** \u2014 relisez la synth\xE8se.` : ""}`;
    }
    if (matchAny(q, ["anomal", "fissure", "infiltr", "moisiss", "defaut", "d\xE9faut", "analyser photo", "analyse photo", "vision"])) {
      return `**Analyse de photos (anomalies)**

1. Ajoutez une photo au point (\u{1F4F7}) ou ouvrez l'assistant \u2192 **\u{1F4F7} Photo**.
2. Dans **Profil**, activez le **mode cloud** et entrez une cl\xE9 API (OpenAI, Anthropic Claude, Google Gemini ou xAI).
3. Mod\xE8les recommand\xE9s\u00a0: **Claude Sonnet 4.6** (Anthropic), **GPT-4o** (OpenAI), **Gemini 2.0 Flash** (Google).

L'IA d\xE9crit les signes visibles, sugg\xE8re un statut (C/NC/AC) et des formulations \u2014 **vous validez** sur le terrain. Ce n'est pas un certificat de conformit\xE9.`;
    }
    if (matchAny(q, ["photo", "image"])) {
      return "**Photos**\n\nJusqu'\xE0 **4 photos par point** (bouton \u{1F4F7}). Indispensables pour les NC. La photo de **couverture** se configure dans l'onglet Informations.";
    }
    if (matchAny(q, ["section", "liste", "checklist", "point"])) {
      if (ctx?.sectionTitle) {
        return `**Section en cours : ${ctx.sectionTitle}**

Parcourez chaque point un par un : statut \u2192 r\xE9ponses rapides \u2192 commentaire si n\xE9cessaire \u2192 photo pour les anomalies.

${ctx.pendingInSection ? `Il reste **${ctx.pendingInSection} point(s)** non r\xE9pondu(s) dans cette section.` : "Cette section semble compl\xE8te \u2014 v\xE9rifiez le filtre \xAB Non r\xE9pondu \xBB."}`;
      }
      return `**Checklist**

La **visite ext\xE9rieure** suit votre ordre terrain : **1 terrain/pente \u2192 2 fondations \u2192 3 toiture \u2192 4 fa\xE7ades \u2192 5 plomberie ext. \u2192 6 \xE9lectricit\xE9 ext. \u2192 7 fen\xEAtres, portes et marches**, puis l'int\xE9rieur \u2014 **fin dans le grenier / combles** si accessible. Une section peut contenir des **sous-sections** (ex. art. 17, 18-20). Ouvrez une section, parcourez les sous-sections et les points, utilisez **Pr\xE9c./Suiv.** entre les sections.`;
    }
    if (matchAny(q, ["aibq", "bnq", "norme", "preachat", "3009"])) {
      const norm = ctx?.inspection?.norme || "AIBQ / BNQ";
      return `**Norme (${norm})**

Inspection **visuelle non invasive**. Vous d\xE9crivez l'\xE9tat observ\xE9, les limitations et les recommandations \u2014 sans garantir l'avenir ni certifier la conformit\xE9 au code complet. Mentionnez les \xE9l\xE9ments non accessibles et les expertises sugg\xE9r\xE9es (\xE9lectricien, couvreur, etc.) dans Cl\xF4ture.`;
    }
    if (matchAny(q, ["app", "kzo", "utiliser", "lancer", "serveur", "8775"])) {
      return "**Utiliser KZO Inspect**\n\nLancez via **Lancer KZO Inspect.command** (port 8775). Ne double-cliquez pas sur index.html seul.\n\nRaccourcis checklist : touches **1\u20134** = statuts. Filtres : NC, non r\xE9pondu, avec photos.";
    }
    if (matchAny(q, ["expert", "electricien", "plombier", "referr"])) {
      return "**Experts recommand\xE9s**\n\nDans l'onglet **Cl\xF4ture**, section \xAB Recommandations d'experts \xBB : type de sp\xE9cialiste, motif, urgence. Ils apparaissent dans le rapport pour le suivi client.";
    }
    if (matchAny(q, ["aide", "help", "difficult", "bloqu", "comment"])) {
      if (ctx?.itemLabel) {
        return `**Point : ${ctx.itemLabel}**

${ctx.itemStatus ? `Statut actuel : ${ctx.itemStatus}.` : "Aucun statut choisi encore."}

**Conseil** : d\xE9crivez ce que vous voyez (ou ne voyez pas). Si non inspect\xE9 \u2192 N/A + raison. Si doute s\xE9curit\xE9 \u2192 NC + photo + expert.

Posez une question pr\xE9cise (ex. \xAB fissure fondation \xBB, \xAB toiture \xBB, \xAB NC ou AC \xBB).`;
      }
      if (ctx?.sectionTitle) {
        return `Vous \xEAtes dans **${ctx.sectionTitle}**. D\xE9crivez le point qui vous pose probl\xE8me ou utilisez les boutons rapides ci-dessus.`;
      }
      return "Je peux vous aider sur : statuts NC/AC, r\xE9ponses rapides, N/A, rapport, photos, normes AIBQ/BNQ. D\xE9crivez votre difficult\xE9 ou touchez une suggestion.";
    }
    if (ctx?.itemLabel && (q.length < 30 || ctxText.includes(q.slice(0, 12)))) {
      return `Pour **\xAB ${ctx.itemLabel} \xBB** :

1. Statut adapt\xE9 (C / NC / AC / N/A)
2. R\xE9ponses rapides coh\xE9rentes
3. Commentaire avec faits observ\xE9s (pas d'opinion non fond\xE9e)
4. Photos si anomalie

Question plus pr\xE9cise ? (ex. \xAB est-ce une NC ? \xBB, \xAB texte pour N/A \xBB)`;
    }
    return `Je n'ai pas de r\xE9ponse exacte hors ligne pour cela.

**Contexte actuel :**
${buildContextSummary(ctx)}

Reformulez (ex. NC vs AC, N/A, rapport) ou activez l'**assistant cloud** dans Profil avec une cl\xE9 OpenAI pour des r\xE9ponses plus d\xE9taill\xE9es.`;
  }
  function formatAssistantMarkdown(text) {
    const escaped = String(text ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
    return escaped
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\n/g, "<br />");
  }

  // js/ai-vision.js
  function canAnalyzePhotos(profile) {
    return Boolean(profile?.aiUseCloud && (profile?.aiApiKey || "").trim());
  }
  function parseDataUrl(dataUrl) {
    const m = String(dataUrl).match(/^data:(image\/[a-z+]+);base64,(.+)$/i);
    if (!m) throw new Error("Format d'image invalide");
    return { mime: m[1], base64: m[2] };
  }
  function buildPhotoAnalysisPrompt(ctx, userNote = "") {
    const lines = [
      "Analyse cette photo prise lors d'une **inspection visuelle de b\xE2timent au Qu\xE9bec** (pratiques AIBQ / BNQ).",
      "Tu assistes l'inspecteur Jean Eveillard Cazeau \u2014 **ne remplace pas** son jugement professionnel.",
      "",
      "**Contexte dossier :**",
      buildContextSummary(ctx)
    ];
    if (ctx?.itemLabel) lines.push(`
**Point de checklist vis\xE9 :** ${ctx.itemLabel}`);
    if (ctx?.sectionTitle) lines.push(`**Section :** ${ctx.sectionTitle}`);
    if (userNote?.trim()) lines.push(`
**Note de l'inspecteur :** ${userNote.trim()}`);
    lines.push(
      "",
      "Structure ta r\xE9ponse en fran\xE7ais canadien :",
      "1. **Ce que l'on voit** \u2014 description factuelle",
      "2. **Anomalies ou signes pr\xE9occupants** \u2014 liste \xE0 puces (gravit\xE9 : mineure / majeure / s\xE9curit\xE9)",
      "3. **Statut sugg\xE9r\xE9** \u2014 C, NC, AC ou N/A avec justification courte",
      "4. **Formulations rapport** \u2014 2 \xE0 4 phrases pour le commentaire inspecteur",
      "5. **Priorit\xE9** \u2014 si NC/AC : critique, majeur ou mineur",
      "6. **Limites** \u2014 ce qu'une photo seule ne permet pas de conclure ; expert \xE0 recommander si pertinent",
      "",
      "Ne invente pas de mesures ni d'articles de code pr\xE9cis si non visibles. Rappelle que l'inspection reste visuelle et non certifiante."
    );
    return lines.join("\n");
  }
  async function analyzePhotoWithVision(imageDataUrl, ctx, profile, userNote = "") {
    const key = (profile.aiApiKey || "").trim();
    if (!key) throw new Error("NO_KEY");
    if (!profile.aiUseCloud) throw new Error("CLOUD_OFF");
    const shrunk = await shrinkDataUrl(imageDataUrl, 1280, 0.8);
    const { mime, base64 } = parseDataUrl(shrunk);
    const model = profile.aiModel || "gpt-4o-mini";
    const provider = profile.aiProvider || "openai";
    const prompt = buildPhotoAnalysisPrompt(ctx, userNote);
    const system = `Tu es l'assistant vision de KZO Inspect \u2014 inspection de b\xE2timents au Qu\xE9bec.
Tu rep\xE8res des anomalies *visibles* sur les photos : infiltration, fissures, corrosion, d\xE9fauts \xE9lectriques apparents, pourriture, moisissure, garde-corps, etc.
Tu ne certifies pas la conformit\xE9 au Code du b\xE2timent. Tu sugg\xE8res des statuts et formulations pour le rapport.`;
    let text = "";
    if (provider === "gemini") {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": key },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: system }] },
          contents: [
            {
              role: "user",
              parts: [
                { text: prompt },
                { inline_data: { mime_type: mime, data: base64 } }
              ]
            }
          ],
          generationConfig: { temperature: 0.35, maxOutputTokens: 1100 }
        })
      });
      if (!res.ok) throw new Error(`Erreur API Gemini (${res.status})`);
      const data = await res.json();
      text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    } else if (provider === "anthropic") {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": key,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true"
        },
        body: JSON.stringify({
          model,
          system,
          temperature: 0.35,
          max_tokens: 1100,
          messages: [
            {
              role: "user",
              content: [
                { type: "image", source: { type: "base64", media_type: mime, data: base64 } },
                { type: "text", text: prompt }
              ]
            }
          ]
        })
      });
      if (!res.ok) throw new Error(`Erreur API Anthropic (${res.status})`);
      const data = await res.json();
      text = data.content?.[0]?.text;
    } else {
      const baseUrl = provider === "xai" ? "https://api.x.ai/v1/chat/completions" : "https://api.openai.com/v1/chat/completions";
      const res = await fetch(baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`
        },
        body: JSON.stringify({
          model,
          temperature: 0.35,
          max_tokens: 1100,
          messages: [
            { role: "system", content: system },
            {
              role: "user",
              content: [
                { type: "text", text: prompt },
                { type: "image_url", image_url: { url: `data:${mime};base64,${base64}`, detail: "high" } }
              ]
            }
          ]
        })
      });
      if (!res.ok) throw new Error(`Erreur API ${provider} (${res.status})`);
      const data = await res.json();
      text = data.choices?.[0]?.message?.content;
    }
    if (!text) throw new Error("R\xE9ponse vide de l'API");
    return { text: text.trim(), model };
  }

  // js/ai-assistant.js
  var HISTORY_KEY = "kzo_ai_chat_history";
  var PANEL_OPEN_KEY = "kzo_ai_panel_open";
  var MAX_HISTORY = 40;
  var panelOpen = false;
  var busy = false;
  var getContextFn = () => ({});
  function escapeHtml(str) {
    return String(str ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function loadHistory() {
    try {
      const raw = sessionStorage.getItem(HISTORY_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
  function saveHistory(messages) {
    sessionStorage.setItem(HISTORY_KEY, JSON.stringify(messages.slice(-MAX_HISTORY)));
  }
  function loadPanelOpenState() {
    try {
      const stored = sessionStorage.getItem(PANEL_OPEN_KEY);
      if (stored === "0") return false;
      if (stored === "1") return true;
    } catch {
    }
    const profile = loadProfile();
    return profile.aiAssistantOpen !== false;
  }
  function savePanelOpenState(open) {
    try {
      sessionStorage.setItem(PANEL_OPEN_KEY, open ? "1" : "0");
    } catch {
    }
  }
  function getWelcomeMessage() {
    return {
      role: "assistant",
      html: formatAssistantMarkdown(
        "Bonjour, je suis l'**assistant KZO Inspect**.\n\nJe vous aide sur les statuts, les r\xE9ponses rapides, le rapport AIBQ/BNQ et **l'analyse de photos** pour rep\xE9rer des anomalies visibles (mode cloud).\n\nUtilisez **\u{1F4F7} Photo** ci-dessous, le bouton **\u2726** sur une photo de checklist, ou d\xE9crivez votre question."
      )
    };
  }
  function renderMessages(container, messages) {
    container.innerHTML = messages.map((m) => {
      const isUser = m.role === "user";
      const thumb = m.imageThumb ? `<p class="ai-msg__photo"><img src="${m.imageThumb}" alt="Photo analys\xE9e" /></p>` : "";
      const body = isUser ? escapeHtml(m.text) : m.html || formatAssistantMarkdown(m.text);
      return `<div class="ai-msg ai-msg--${isUser ? "user" : "bot"}"><div class="ai-msg__bubble">${thumb}${body}</div></div>`;
    }).join("");
    container.scrollTop = container.scrollHeight;
  }
  function setBusy(isOn) {
    busy = isOn;
    const send = document.getElementById("ai-send");
    const input = document.getElementById("ai-input");
    const photoBtn = document.getElementById("ai-photo-label");
    if (send) send.disabled = isOn;
    if (input) input.disabled = isOn;
    if (photoBtn) photoBtn.classList.toggle("is-disabled", isOn);
    document.getElementById("ai-typing")?.toggleAttribute("hidden", !isOn);
  }
  async function askCloud(question, ctx, profile) {
    const key = (profile.aiApiKey || "").trim();
    if (!key) throw new Error("NO_KEY");
    const provider = profile.aiProvider || "openai";
    const model = normalizeAiModel(profile.aiModel);
    const system = `Tu es l'assistant d'inspection KZO Inspect pour Jean Eveillard Cazeau, inspecteur au Qu\xE9bec.
R\xE9ponds en fran\xE7ais canadien, concis, professionnel. Contexte inspection visuelle AIBQ/BNQ \u2014 pas de garantie l\xE9gale.
Ne invente pas de mesures ou de codes; sugg\xE8re un expert si hors champ.
Contexte dossier:
${buildContextSummary(ctx)}`;
    let text = "";
    if (provider === "anthropic") {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
        body: JSON.stringify({ model, system, temperature: 0.4, max_tokens: 700, messages: [{ role: "user", content: question }] })
      });
      if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.error?.message || `Erreur API Anthropic (${res.status})`); }
      const data = await res.json();
      text = data.content?.[0]?.text;
    } else if (provider === "gemini") {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": key },
        body: JSON.stringify({ system_instruction: { parts: [{ text: system }] }, contents: [{ role: "user", parts: [{ text: question }] }], generationConfig: { temperature: 0.4, maxOutputTokens: 700 } })
      });
      if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.error?.message || `Erreur API Gemini (${res.status})`); }
      const data = await res.json();
      text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    } else {
      const baseUrl = provider === "xai" ? "https://api.x.ai/v1/chat/completions" : "https://api.openai.com/v1/chat/completions";
      const res = await fetch(baseUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
        body: JSON.stringify({ model, temperature: 0.4, max_tokens: 700, messages: [{ role: "system", content: system }, { role: "user", content: question }] })
      });
      if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.error?.message || `Erreur API ${provider} (${res.status})`); }
      const data = await res.json();
      text = data.choices?.[0]?.message?.content;
    }
    if (!text) throw new Error("R\xE9ponse vide de l'API");
    return text.trim();
  }
  function promptForQuick(id, ctx) {
    const map = {
      "help-point": ctx.itemLabel ? `J'ai besoin d'aide pour le point : ${ctx.itemLabel}` : ctx.sectionTitle ? `Comment inspecter la section : ${ctx.sectionTitle} ?` : "Comment aborder les points de cette checklist ?",
      "nc-ac": "Quelle est la diff\xE9rence entre non conforme et \xE0 corriger ?",
      presets: "Comment utiliser les r\xE9ponses rapides et le commentaire inspecteur ?",
      na: "Quand dois-je utiliser N/A et quoi \xE9crire ?",
      report: "Comment pr\xE9parer un bon rapport pour le client ?",
      app: "Comment utiliser KZO Inspect efficacement ?",
      "analyze-photo": "Comment analyser une photo pour d\xE9tecter les anomalies visibles ?"
    };
    return map[id] || id;
  }
  async function submitPhotoAnalysis(imageDataUrl, ctxOverride = {}, userNote = "") {
    if (!imageDataUrl || busy) return;
    const profile = loadProfile();
    if (!canAnalyzePhotos(profile)) {
      ensureAiAssistant(getContextFn);
      togglePanel(true);
      const messagesEl2 = document.getElementById("ai-messages");
      let messages2 = loadHistory();
      const offline = "**Analyse photo \u2014 mode cloud requis**\n\nActivez **Utiliser OpenAI (mode cloud)** et une **cl\xE9 API** dans **Profil**. Utilisez un mod\xE8le **vision** : **GPT-4o mini** ou **GPT-4o** (recommand\xE9).\n\nL'analyse d'images n\xE9cessite Internet et n'est pas disponible hors ligne.";
      messages2.push({
        role: "assistant",
        text: offline,
        html: formatAssistantMarkdown(offline)
      });
      saveHistory(messages2);
      renderMessages(messagesEl2, messages2);
      return;
    }
    ensureAiAssistant(getContextFn);
    togglePanel(true);
    const ctx = { ...getContextFn(), ...ctxOverride };
    const label = ctx.itemLabel ? ` \u2014 ${ctx.itemLabel}` : "";
    let thumb = imageDataUrl;
    try {
      thumb = await shrinkDataUrl(imageDataUrl, 320, 0.7);
    } catch {
    }
    const messagesEl = document.getElementById("ai-messages");
    let messages = loadHistory();
    messages.push({
      role: "user",
      text: `Analyse de photo${label}${userNote ? ` \u2014 ${userNote}` : ""}`,
      imageThumb: thumb
    });
    renderMessages(messagesEl, messages);
    saveHistory(messages);
    setBusy(true);
    const typing = document.getElementById("ai-typing");
    if (typing) typing.textContent = "Analyse de la photo\u2026";
    try {
      const { text, model } = await analyzePhotoWithVision(imageDataUrl, ctx, profile, userNote);
      const header = `*Analyse vision (${model}) \u2014 aide \xE0 la d\xE9cision, pas un certificat de conformit\xE9.*

`;
      messages.push({
        role: "assistant",
        text: header + text,
        html: formatAssistantMarkdown(header + text)
      });
    } catch (e) {
      const errText = `**Analyse photo impossible** : ${e.message}

V\xE9rifiez la cl\xE9 API, le mod\xE8le (GPT-4o mini recommand\xE9) et la connexion Internet.`;
      messages.push({
        role: "assistant",
        text: errText,
        html: formatAssistantMarkdown(errText)
      });
    }
    saveHistory(messages);
    renderMessages(messagesEl, messages);
    setBusy(false);
    if (typing) typing.textContent = "R\xE9flexion\u2026";
  }
  async function submitQuestion(question) {
    const q = (question || "").trim();
    if (!q || busy) return;
    if (q.toLowerCase().includes("analyser") && q.toLowerCase().includes("photo")) {
      const profile2 = loadProfile();
      if (!canAnalyzePhotos(profile2)) {
        const messagesEl2 = document.getElementById("ai-messages");
        let messages2 = loadHistory();
        messages2.push({ role: "user", text: q });
        const reply = answerLocally(q, getContextFn());
        messages2.push({ role: "assistant", text: reply, html: formatAssistantMarkdown(reply) });
        saveHistory(messages2);
        renderMessages(messagesEl2, messages2);
        return;
      }
      document.getElementById("ai-photo-input")?.click();
      return;
    }
    const messagesEl = document.getElementById("ai-messages");
    let messages = loadHistory();
    messages.push({ role: "user", text: q });
    renderMessages(messagesEl, messages);
    saveHistory(messages);
    setBusy(true);
    const profile = loadProfile();
    const ctx = getContextFn();
    let replyText;
    try {
      if (profile.aiUseCloud && profile.aiApiKey?.trim()) {
        replyText = await askCloud(q, ctx, profile);
      } else {
        replyText = answerLocally(q, ctx);
      }
    } catch (e) {
      if (e.message === "NO_KEY") {
        replyText = answerLocally(q, ctx);
      } else {
        replyText = `**Mode cloud indisponible** (${e.message}).

${answerLocally(q, ctx)}`;
      }
    }
    messages.push({
      role: "assistant",
      text: replyText,
      html: formatAssistantMarkdown(replyText)
    });
    saveHistory(messages);
    renderMessages(messagesEl, messages);
    setBusy(false);
    const input = document.getElementById("ai-input");
    if (input) input.value = "";
  }
  function syncPanelDom() {
    const root = document.getElementById("ai-assistant-root");
    const panel = document.getElementById("ai-panel");
    const fab = document.getElementById("ai-fab");
    panel?.classList.toggle("is-open", panelOpen);
    fab?.classList.toggle("is-open", panelOpen);
    root?.classList.toggle("is-panel-open", panelOpen);
    fab?.setAttribute("aria-expanded", String(panelOpen));
    fab?.setAttribute("aria-label", panelOpen ? "R\xE9duire l'assistant IA" : "Ouvrir l'assistant IA");
    document.body.classList.toggle("ai-panel-open", panelOpen);
  }
  function togglePanel(force) {
    panelOpen = force !== void 0 ? force : !panelOpen;
    savePanelOpenState(panelOpen);
    syncPanelDom();
    if (panelOpen) {
      document.getElementById("ai-input")?.focus();
      updateContextBadge();
    }
  }
  function updateContextBadge() {
    const el = document.getElementById("ai-context-badge");
    if (!el) return;
    const ctx = getContextFn();
    if (ctx.inspection) {
      el.textContent = ctx.itemLabel ? `Point : ${ctx.itemLabel.slice(0, 42)}${ctx.itemLabel.length > 42 ? "\u2026" : ""}` : ctx.sectionTitle ? `Section : ${ctx.sectionTitle.slice(0, 40)}${ctx.sectionTitle.length > 40 ? "\u2026" : ""}` : `${ctx.inspection.client || "Dossier"} \u2014 ${ctx.inspection.progress}%`;
    } else {
      el.textContent = "Aide g\xE9n\xE9rale \xB7 analyse photo (cloud)";
    }
  }
  function bindPanelEvents() {
    document.getElementById("ai-fab")?.addEventListener("click", () => togglePanel());
    document.getElementById("ai-close")?.addEventListener("click", () => togglePanel(false));
    document.getElementById("ai-minimize")?.addEventListener("click", () => togglePanel(false));
    document.getElementById("ai-send")?.addEventListener("click", () => {
      submitQuestion(document.getElementById("ai-input")?.value);
    });
    document.getElementById("ai-input")?.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        submitQuestion(e.target.value);
      }
    });
    document.getElementById("ai-clear")?.addEventListener("click", () => {
      const welcome = getWelcomeMessage();
      saveHistory([welcome]);
      renderMessages(document.getElementById("ai-messages"), [welcome]);
    });
    document.getElementById("ai-photo-input")?.addEventListener("change", async (e) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (!file) return;
      try {
        const dataUrl = await compressImage(file, 1280, 0.78);
        await submitPhotoAnalysis(dataUrl, getContextFn(), "");
      } catch {
        const reader = new FileReader();
        reader.onload = () => submitPhotoAnalysis(reader.result, getContextFn(), "");
        reader.readAsDataURL(file);
      }
    });
    document.getElementById("ai-quick-prompts")?.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-ai-prompt]");
      if (!btn) return;
      const id = btn.dataset.aiPrompt;
      if (id === "analyze-photo") {
        const profile = loadProfile();
        if (canAnalyzePhotos(profile)) {
          document.getElementById("ai-photo-input")?.click();
        } else {
          submitQuestion(promptForQuick(id, getContextFn()));
        }
        return;
      }
      submitQuestion(promptForQuick(id, getContextFn()));
    });
  }
  function mountUi() {
    if (document.getElementById("ai-assistant-root")) return;
    const root = document.createElement("div");
    root.id = "ai-assistant-root";
    root.innerHTML = `
    <button type="button" class="ai-fab" id="ai-fab" aria-label="Ouvrir l'assistant IA" aria-expanded="false" title="Assistant IA \u2014 toujours disponible">
      <span class="ai-fab__icon" aria-hidden="true">\u2726</span>
      <span class="ai-fab__label">Aide</span>
    </button>
    <div class="ai-panel" id="ai-panel" role="dialog" aria-label="Assistant KZO Inspect" aria-modal="false">
      <header class="ai-panel__head">
        <div>
          <h2 class="ai-panel__title">Assistant KZO</h2>
          <p class="ai-panel__sub" id="ai-context-badge">Aide inspection</p>
        </div>
        <div class="ai-panel__head-actions">
          <button type="button" class="ai-panel__minimize" id="ai-minimize" title="R\xE9duire">\u2212</button>
          <button type="button" class="ai-panel__close" id="ai-close" aria-label="Fermer">\xD7</button>
        </div>
      </header>
      <div class="ai-messages" id="ai-messages"></div>
      <p class="ai-typing" id="ai-typing" hidden>R\xE9flexion\u2026</p>
      <div class="ai-quick" id="ai-quick-prompts">
        ${QUICK_PROMPTS.map(
      (p) => `<button type="button" class="ai-quick__btn" data-ai-prompt="${p.id}">${escapeHtml(p.label)}</button>`
    ).join("")}
      </div>
      <footer class="ai-panel__foot">
        <textarea class="input ai-input" id="ai-input" rows="2" placeholder="Question ou contexte pour la photo\u2026"></textarea>
        <div class="ai-panel__actions">
          <label class="btn btn--ghost btn--sm ai-photo-upload" id="ai-photo-label" title="Analyser une photo (anomalies)">
            \u{1F4F7} Photo
            <input type="file" accept="image/*" hidden id="ai-photo-input" />
          </label>
          <button type="button" class="btn btn--ghost btn--sm" id="ai-clear">Effacer</button>
          <button type="button" class="btn btn--primary btn--sm" id="ai-send">Envoyer</button>
        </div>
      </footer>
    </div>
  `;
    document.body.appendChild(root);
    const history = loadHistory();
    const welcome = history.length ? history : [getWelcomeMessage()];
    if (!history.length) saveHistory(welcome);
    renderMessages(document.getElementById("ai-messages"), welcome);
    bindPanelEvents();
    panelOpen = loadPanelOpenState();
    syncPanelDom();
  }
  function initAiAssistant({ getContext } = {}) {
    if (getContext) getContextFn = getContext;
    mountUi();
    updateAiAssistantContext(getContextFn());
  }
  function ensureAiAssistant(getContext) {
    if (getContext) getContextFn = getContext;
    mountUi();
    updateAiAssistantContext(getContextFn());
  }
  function updateAiAssistantContext(ctx) {
    if (ctx && typeof ctx === "object") {
      const prev = getContextFn;
      getContextFn = () => ({ ...prev(), ...ctx });
    }
    updateContextBadge();
  }
  function openAiAssistant() {
    ensureAiAssistant(getContextFn);
    togglePanel(true);
  }

  // js/image-editor.js
  function openImageEditor(originalDataUrl, onSave) {
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.background = "rgba(0,0,0,0.85)";
    overlay.style.zIndex = "9999";
    overlay.style.display = "flex";
    overlay.style.flexDirection = "column";
    overlay.style.alignItems = "center";
    overlay.style.padding = "1rem";
    const toolbar = document.createElement("div");
    toolbar.style.display = "flex";
    toolbar.style.gap = "0.5rem";
    toolbar.style.marginBottom = "1rem";
    toolbar.style.background = "#fff";
    toolbar.style.padding = "0.5rem";
    toolbar.style.borderRadius = "8px";
    toolbar.style.flexWrap = "wrap";
    let currentColor = "red";
    let currentTool = "freehand";
    const btnStyle = "padding: 0.5rem 1rem; cursor: pointer; border: 1px solid #ccc; border-radius: 4px; background: #f8fafc; font-weight: bold;";
    const btnFreehand = document.createElement("button");
    btnFreehand.textContent = "\u270F\uFE0F Dessin";
    btnFreehand.style.cssText = btnStyle + " background: #e2e8f0;";
    const btnArrow = document.createElement("button");
    btnArrow.textContent = "\u2197\uFE0F Fl\xE8che";
    btnArrow.style.cssText = btnStyle;
    const btnCircle = document.createElement("button");
    btnCircle.textContent = "\u2B55 Cercle";
    btnCircle.style.cssText = btnStyle;
    const colorRed = document.createElement("button");
    colorRed.style.cssText = "width: 32px; height: 32px; border-radius: 50%; border: 3px solid #000; background: red; cursor: pointer;";
    const colorYellow = document.createElement("button");
    colorYellow.style.cssText = "width: 32px; height: 32px; border-radius: 50%; border: 1px solid #ccc; background: yellow; cursor: pointer;";
    const colorBlue = document.createElement("button");
    colorBlue.style.cssText = "width: 32px; height: 32px; border-radius: 50%; border: 1px solid #ccc; background: blue; cursor: pointer;";
    const btnCancel = document.createElement("button");
    btnCancel.textContent = "Annuler";
    btnCancel.style.cssText = btnStyle;
    const btnSave = document.createElement("button");
    btnSave.textContent = "\u{1F4BE} Enregistrer";
    btnSave.style.cssText = btnStyle + " background: #22c55e; color: white; border: none;";
    toolbar.append(btnFreehand, btnArrow, btnCircle, colorRed, colorYellow, colorBlue, btnCancel, btnSave);
    const canvasContainer = document.createElement("div");
    canvasContainer.style.flex = "1";
    canvasContainer.style.position = "relative";
    canvasContainer.style.maxWidth = "100%";
    canvasContainer.style.overflow = "hidden";
    canvasContainer.style.display = "flex";
    canvasContainer.style.alignItems = "center";
    canvasContainer.style.justifyContent = "center";
    const canvas = document.createElement("canvas");
    canvas.style.maxWidth = "100%";
    canvas.style.maxHeight = "100%";
    canvas.style.objectFit = "contain";
    canvas.style.cursor = "crosshair";
    canvasContainer.append(canvas);
    overlay.append(toolbar, canvasContainer);
    document.body.appendChild(overlay);
    const ctx = canvas.getContext("2d");
    const img = new Image();
    let isDrawing = false;
    let startX = 0, startY = 0;
    let snapshot = null;
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
    };
    img.onerror = () => {
      overlay.remove();
      alert("Impossible de charger la photo pour annotation.");
    };
    img.src = originalDataUrl;
    function setTool(t, btn) {
      currentTool = t;
      btnFreehand.style.background = "#f8fafc";
      btnArrow.style.background = "#f8fafc";
      btnCircle.style.background = "#f8fafc";
      btn.style.background = "#e2e8f0";
    }
    function setColor(c, btn) {
      currentColor = c;
      colorRed.style.border = "1px solid #ccc";
      colorYellow.style.border = "1px solid #ccc";
      colorBlue.style.border = "1px solid #ccc";
      btn.style.border = "3px solid #000";
    }
    btnFreehand.onclick = () => setTool("freehand", btnFreehand);
    btnArrow.onclick = () => setTool("arrow", btnArrow);
    btnCircle.onclick = () => setTool("circle", btnCircle);
    colorRed.onclick = () => setColor("red", colorRed);
    colorYellow.onclick = () => setColor("yellow", colorYellow);
    colorBlue.onclick = () => setColor("blue", colorBlue);
    function getPos(e) {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
      };
    }
    function drawArrow(context, fromx, fromy, tox, toy) {
      const headlen = 20;
      const dx = tox - fromx;
      const dy = toy - fromy;
      const angle = Math.atan2(dy, dx);
      context.beginPath();
      context.moveTo(fromx, fromy);
      context.lineTo(tox, toy);
      context.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
      context.moveTo(tox, toy);
      context.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen * Math.sin(angle + Math.PI / 6));
      context.stroke();
    }
    function drawCircle(context, x, y, radius) {
      context.beginPath();
      context.arc(x, y, radius, 0, 2 * Math.PI);
      context.stroke();
    }
    function startPosition(e) {
      isDrawing = true;
      const pos = getPos(e);
      startX = pos.x;
      startY = pos.y;
      snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
      ctx.lineWidth = Math.max(4, canvas.width / 150);
      ctx.lineCap = "round";
      ctx.strokeStyle = currentColor;
      if (currentTool === "freehand") {
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        draw(e);
      }
    }
    function endPosition() {
      isDrawing = false;
      ctx.beginPath();
    }
    function draw(e) {
      if (!isDrawing) return;
      e.preventDefault();
      const pos = getPos(e);
      if (currentTool === "freehand") {
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
      } else if (currentTool === "arrow") {
        ctx.putImageData(snapshot, 0, 0);
        drawArrow(ctx, startX, startY, pos.x, pos.y);
      } else if (currentTool === "circle") {
        ctx.putImageData(snapshot, 0, 0);
        const radius = Math.sqrt(Math.pow(pos.x - startX, 2) + Math.pow(pos.y - startY, 2));
        drawCircle(ctx, startX, startY, radius);
      }
    }
    canvas.addEventListener("mousedown", startPosition);
    canvas.addEventListener("mouseup", endPosition);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("touchstart", startPosition, { passive: false });
    canvas.addEventListener("touchend", endPosition);
    canvas.addEventListener("touchmove", draw, { passive: false });
    btnCancel.onclick = () => {
      document.body.removeChild(overlay);
    };
    btnSave.onclick = () => {
      const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
      document.body.removeChild(overlay);
      onSave(dataUrl);
    };
  }

  // js/checklist-utils.js
  var CHECKLIST_FILTERS = [
    { id: "all", label: "Tout" },
    { id: "pending", label: "Non r\xE9pondu" },
    { id: "nc", label: "NC / \xC0 corriger" },
    { id: "photos", label: "Avec photos" }
  ];
  function sectionListStatus(prog, stats) {
    if (prog.total > 0 && prog.pct === 100) return "done";
    if (stats.nc > 0 || stats.ac > 0) return "warn";
    if (prog.pct > 0) return "progress";
    return "pending";
  }
  function itemMatchesFilter(item, filter) {
    if (filter === "all") return true;
    if (filter === "pending") return !item.status;
    if (filter === "nc") return item.status === "non-conforme" || item.status === "a-corriger";
    if (filter === "photos") return (item.photos?.length || 0) > 0;
    return true;
  }
  function collectFindings(inspection) {
    normalizeInspectionSections(inspection);
    const findings = [];
    inspection.sections.forEach((sec, si) => {
      iterSectionItems(sec, (item, subIndex, ii, subsectionTitle) => {
        if (item.status === "non-conforme" || item.status === "a-corriger") {
          normalizeChecklistItem(item);
          findings.push({
            sectionTitle: formatItemLocation(sec.title, subsectionTitle),
            sectionIndex: si,
            subIndex,
            itemIndex: ii,
            label: item.label,
            status: item.status,
            priority: item.priority,
            note: formatItemDocumentation(item),
            selectedPresets: [...item.selectedPresets || []],
            inspectorComment: item.inspectorComment || "",
            photos: item.photos || []
          });
        }
      });
    });
    return findings;
  }
  function countPending(inspection) {
    normalizeInspectionSections(inspection);
    let n = 0;
    for (const sec of inspection.sections) {
      iterSectionItems(sec, (item) => {
        if (!item.status) n += 1;
      });
    }
    return n;
  }
  function statusLabel(value) {
    return STATUS_OPTIONS.find((s) => s.value === value)?.label ?? "\u2014";
  }
  var EXPERT_TYPES = [
    { value: "electricien", label: "\xC9lectricien (ma\xEEtre \xE9lectricien)" },
    { value: "plombier", label: "Plombier" },
    { value: "chauffage", label: "Chauffage / climatisation" },
    { value: "toiture", label: "Couvreur / toiture" },
    { value: "structure", label: "Structure / charpente" },
    { value: "fondation", label: "Fondation / sols" },
    { value: "ingenieur", label: "Ing\xE9nieur" },
    { value: "arpenteur", label: "Arpenteur-g\xE9om\xE8tre" },
    { value: "environnement", label: "Environnement / moisissures" },
    { value: "autre", label: "Autre sp\xE9cialiste" }
  ];
  function expertTypeLabel(value) {
    return EXPERT_TYPES.find((e) => e.value === value)?.label ?? value;
  }

  // js/checklist-views.js
  function escapeHtml2(str) {
    return String(str ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function stripNumbering(text) {
    return String(text || "").replace(/^(?:Art\.\s*)?\d+(?:\.\d+)*[a-z]?\.?\s*[-â€”â€“:]*\s*/i, "");
  }
  function itemCoords(si, subIndex, ii) {
    return `data-si="${si}" data-sub="${subIndex}" data-ii="${ii}"`;
  }
  function renderChecklistToolbar(i, filter) {
    const pending = countPending(i);
    const filterBtns = CHECKLIST_FILTERS.map(
      (f) => `<button type="button" class="chip ${filter === f.id ? "is-active" : ""}" data-checklist-filter="${f.id}">${f.label}</button>`
    ).join("");
    return `
    <div class="checklist-toolbar">
      <div class="checklist-toolbar__filters">${filterBtns}</div>
      <span class="checklist-toolbar__hint">${pending > 0 ? `${pending} point${pending > 1 ? "s" : ""} en attente` : "Checklist compl\xE8te \u2713"} \xB7 Touchez <strong>C</strong> (conforme) <strong>NC</strong> (non-conforme) <strong>AC</strong> (\xE0 corriger) <strong>N/A</strong>, puis choisissez une pastille.</span>
    </div>`;
  }
  /**
   * professional-narratives.js
   * Bibliothèque de narratifs professionnels pour KZO Inspect
   * Français québécois — voix impersonnelle — structure : localisation → observation → implication → action
   * ≥ 130 entrées couvrant 17 sections (NC, AC, C)
   */

  const PROFESSIONAL_NARRATIVES = [

    // ─────────────────────────────────────────────────────────────────────────────
    // TERRAIN
    // ─────────────────────────────────────────────────────────────────────────────

    {
      id: 'pn-terrain-nc-drainage-verso',
      sectionIds: ['walk-terrain', 'bnq-w-terrain', 'bat-terrain'],
      status: 'non-conforme',
      title: 'Drainage insuffisant — contre-pente vers le bâtiment',
      text: "Il a été observé que le terrain présente une pente inverse qui dirige les eaux de surface vers le bâtiment plutôt que de les en éloigner. Cette condition favorise l'accumulation d'eau au pourtour des fondations et augmente significativement le risque d'infiltration. Un tel drainage déficient peut contribuer à la dégradation progressive des matériaux en contact avec le sol. La correction de la pente et la mise en place d'un système de drainage adéquat sont recommandées dans les meilleurs délais.",
    },
    {
      id: 'pn-terrain-nc-excavation-maison',
      sectionIds: ['walk-terrain', 'bnq-w-terrain', 'bat-terrain'],
      status: 'non-conforme',
      title: 'Sol en contact direct avec les éléments de bois',
      text: "L'inspection révèle que des éléments de bois de charpente ou de finition sont en contact direct avec le sol ou à une distance insuffisante de celui-ci. Cette situation expose les matériaux ligneux à une humidité persistante favorisant la pourriture et les infestations d'insectes xylophages. Une telle condition compromet l'intégrité des éléments concernés à moyen terme. Un dégagement adéquat entre le sol et toute pièce de bois est requis.",
    },
    {
      id: 'pn-terrain-nc-erosion-talus',
      sectionIds: ['walk-terrain', 'bnq-w-terrain', 'bat-terrain'],
      status: 'non-conforme',
      title: 'Érosion active du talus — risque de glissement',
      text: "Il a été constaté que le talus adjacent au bâtiment présente des signes d'érosion active, notamment des ravinements et un déchaussement du couvert végétal. Cette instabilité du sol peut progresser et mettre en péril la stabilité des fondations lors de pluies abondantes ou de cycles de gel. Un talus non stabilisé représente un risque potentiel pour la structure et pour la sécurité des occupants. Une évaluation par un professionnel compétent est fortement recommandée.",
    },
    {
      id: 'pn-terrain-nc-eau-stagnante',
      sectionIds: ['walk-terrain', 'bnq-w-terrain', 'bat-terrain'],
      status: 'non-conforme',
      title: 'Eau stagnante au pourtour — drainage défaillant',
      text: "Des zones d'eau stagnante ont été observées à proximité immédiate du bâtiment, indiquant une capacité de drainage insuffisante du terrain. Cette condition génère une saturation chronique du sol en bordure des fondations et favorise les infiltrations d'eau dans la sous-structure. La présence d'eau stagnante de façon récurrente peut également indiquer un drain français obstrué ou absent. Une vérification du système de drainage souterrain et une correction du nivellement de surface sont recommandées.",
    },
    {
      id: 'pn-terrain-nc-vegetation-envahissante',
      sectionIds: ['walk-terrain', 'bnq-w-terrain', 'bat-terrain'],
      status: 'non-conforme',
      title: 'Végétation envahissante — racines menaçant les fondations',
      text: "Il a été observé que des arbres ou arbustes à fort enracinement sont implantés à proximité immédiate du bâtiment. Les systèmes racinaires de ces végétaux peuvent exercer des pressions mécaniques sur les fondations et les conduites souterraines, ou encore s'y infiltrer au fil du temps. Cette condition est susceptible de causer des dommages structuraux et hydrauliques progressifs. L'abattage ou le recépage des végétaux à risque et une inspection des conduites enterrées sont recommandés.",
    },
    {
      id: 'pn-terrain-ac-pente-faible',
      sectionIds: ['walk-terrain', 'bnq-w-terrain', 'bat-terrain'],
      status: 'a-corriger',
      title: 'Pente insuffisante — amélioration du nivellement requise',
      text: "Le terrain présente une pente insuffisante au pourtour du bâtiment, sans constituer une contre-pente franche. Bien que les eaux de surface ne semblent pas stagner activement au moment de l'inspection, cette condition limite l'évacuation rapide des eaux lors de pluies importantes. Un nivellement correctif visant à établir une pente minimale de 5 % sur au moins 1,5 m autour du bâtiment est recommandé.",
    },
    {
      id: 'pn-terrain-ac-arbres-proches',
      sectionIds: ['walk-terrain', 'bnq-w-terrain', 'bat-terrain'],
      status: 'a-corriger',
      title: 'Arbres à surveiller — distance réduite du bâtiment',
      text: "Des arbres matures sont implantés à une distance réduite du bâtiment. Au moment de l'inspection, aucun dommage n'est observable sur les fondations ou les conduites. Toutefois, la proximité de ces végétaux constitue un facteur de risque à surveiller dans le temps. Un suivi régulier et une inspection des conduites enterrées tous les trois à cinq ans sont recommandés.",
    },
    {
      id: 'pn-terrain-ac-sol-remblai',
      sectionIds: ['walk-terrain', 'bnq-w-terrain', 'bat-terrain'],
      status: 'a-corriger',
      title: 'Remblai récent non compacté — tassement différentiel à surveiller',
      text: "Il a été observé qu'un remblai récent a été effectué en bordure du bâtiment. Ce type de sol non consolidé est sujet au tassement différentiel dans les premières années suivant les travaux. Une surveillance de la pente résultante et un réajustement du nivellement après la première ou la deuxième saison sont recommandés.",
    },
    {
      id: 'pn-terrain-c-1',
      sectionIds: ['walk-terrain', 'bnq-w-terrain', 'bat-terrain'],
      status: 'conforme',
      title: 'Terrain bien drainé — aucune anomalie notable',
      text: "L'inspection du terrain révèle une pente générale adéquate permettant l'évacuation des eaux de surface à l'écart du bâtiment. Aucun signe de stagnation, d'érosion active ou de végétation envahissante n'a été observé au moment de l'inspection. L'état du terrain est jugé satisfaisant.",
    },
    {
      id: 'pn-terrain-c-2',
      sectionIds: ['walk-terrain', 'bnq-w-terrain', 'bat-terrain'],
      status: 'conforme',
      title: 'Aménagement paysager — aucun risque observé',
      text: "Le terrain est bien entretenu et présente un aménagement paysager compatible avec la protection du bâtiment. Les végétaux sont maintenus à une distance raisonnable des fondations et la couverture végétale stabilise efficacement le sol. Aucune intervention n'est requise dans l'immédiat.",
    },

    // ─────────────────────────────────────────────────────────────────────────────
    // FONDATIONS
    // ─────────────────────────────────────────────────────────────────────────────

    {
      id: 'pn-fond-nc-fissure-diag',
      sectionIds: ['walk-fondations', 'bnq-w-fondations', 'bat-fondations'],
      status: 'non-conforme',
      title: 'Fissure diagonale — mouvement structurel',
      text: "Il a été observé lors de l'inspection visuelle que le mur de fondation présente des fissures diagonales significatives, caractéristiques d'un mouvement structurel différentiel. Ce type de fissuration indique généralement un tassement inégal du sol porteur ou une défaillance progressive des appuis. Une telle condition peut compromettre l'intégrité de la structure du bâtiment si elle n'est pas traitée. Une évaluation par un ingénieur en structure est recommandée avant toute conclusion de transaction.",
    },
    {
      id: 'pn-fond-nc-infiltration-active',
      sectionIds: ['walk-fondations', 'bnq-w-fondations', 'bat-fondations'],
      status: 'non-conforme',
      title: "Infiltration active d'eau — traces humides au sous-sol",
      text: "L'inspection révèle la présence de traces d'infiltration active d'eau à travers les parois de fondation, visibles sous forme d'efflorescence, de taches d'humidité ou de ruissellement ponctuel. Cette condition indique une défaillance de l'imperméabilisation ou du drainage extérieur de la fondation. Si elle n'est pas traitée, l'infiltration chronique peut causer des dommages aux matériaux intérieurs et créer des conditions propices au développement de moisissures. Une investigation de la source d'eau et une correction du système de drainage sont recommandées.",
    },
    {
      id: 'pn-fond-nc-decollement-parement',
      sectionIds: ['walk-fondations', 'bnq-w-fondations', 'bat-fondations'],
      status: 'non-conforme',
      title: 'Décollement du parement — défaillance du revêtement',
      text: "Il a été observé que le parement ou le revêtement appliqué sur le mur de fondation présente des zones de décollement, de gonflement ou d'écaillage marqué. Cette détérioration indique que le revêtement ne remplit plus son rôle protecteur et que la paroi sous-jacente est exposée aux infiltrations. Une vérification de l'état du béton ou de la maçonnerie sous-jacente et la réfection du revêtement protecteur sont recommandées.",
    },
    {
      id: 'pn-fond-nc-effondrement-pied',
      sectionIds: ['walk-fondations', 'bnq-w-fondations', 'bat-fondations'],
      status: 'non-conforme',
      title: 'Désintégration du béton — pied de fondation friable',
      text: "Le pied de la fondation présente une désintégration avancée du béton, manifestée par une friabilité notable, des zones creuses et la mise à nu des armatures dans certains secteurs. Cette dégradation compromet directement la capacité portante de la fondation et constitue une condition structurale sérieuse. Une évaluation par un ingénieur en structure et des travaux de réparation ou de consolidation sont requis sans délai.",
    },
    {
      id: 'pn-fond-nc-mur-hors-plomb',
      sectionIds: ['walk-fondations', 'bnq-w-fondations', 'bat-fondations'],
      status: 'non-conforme',
      title: "Mur de fondation hors d'aplomb — déformation structurale",
      text: "Il a été observé que le mur de fondation présente une déformation notable, se traduisant par une inclinaison ou un bombement visible hors de son plan d'aplomb vertical. Ce type de déformation peut indiquer une poussée latérale du sol combinée à une résistance insuffisante de la paroi. Une telle condition requiert une évaluation structurale urgente par un ingénieur compétent afin de déterminer la stabilité résiduelle et les mesures correctives appropriées.",
    },
    {
      id: 'pn-fond-ac-fissures-fines',
      sectionIds: ['walk-fondations', 'bnq-w-fondations', 'bat-fondations'],
      status: 'a-corriger',
      title: 'Fissures fines — cycle gel-dégel à surveiller',
      text: "De fines fissures sont présentes sur le mur de fondation, dont la morphologie est compatible avec les cycles de gel et de dégel répétés caractéristiques du climat québécois. Ces fissures ne présentent pas de signe de mouvement actif au moment de l'inspection, mais elles constituent un point de surveillance important. Un calfeutrage préventif avec un produit élastomère approprié et un suivi annuel sont recommandés.",
    },
    {
      id: 'pn-fond-ac-efflorescence',
      sectionIds: ['walk-fondations', 'bnq-w-fondations', 'bat-fondations'],
      status: 'a-corriger',
      title: "Efflorescence — traces de migration d'humidité ancienne",
      text: "Des dépôts blanchâtres d'efflorescence sont visibles sur la surface de la fondation, indiquant des épisodes passés de migration d'eau à travers la paroi. Au moment de l'inspection, la surface semble sèche et aucune infiltration active n'est détectée. Ces marques témoignent néanmoins d'une histoire hydrique à surveiller. Un colmatage des zones poreuses et une vérification du drainage extérieur lors de la prochaine saison des pluies sont recommandés.",
    },
    {
      id: 'pn-fond-ac-drain-inconnue',
      sectionIds: ['walk-fondations', 'bnq-w-fondations', 'bat-fondations'],
      status: 'a-corriger',
      title: 'Drain de fondation — état non vérifiable',
      text: "La présence et l'état fonctionnel du drain de fondation périphérique n'ont pas pu être confirmés visuellement lors de l'inspection. Cette incertitude constitue un facteur de risque à considérer, particulièrement pour les bâtiments situés en sol argileux ou à nappe phréatique élevée. Une inspection par caméra du drain périphérique est recommandée afin d'en confirmer l'état et la fonctionnalité.",
    },
    {
      id: 'pn-fond-c-1',
      sectionIds: ['walk-fondations', 'bnq-w-fondations', 'bat-fondations'],
      status: 'conforme',
      title: 'Fondation intacte — aucune anomalie visible',
      text: "L'inspection visuelle du mur de fondation accessible ne révèle aucune fissure significative, aucun signe d'infiltration active et aucune déformation notable. La surface est sèche et les joints sont en bon état apparent. Aucune intervention n'est requise dans l'immédiat.",
    },
    {
      id: 'pn-fond-c-2',
      sectionIds: ['walk-fondations', 'bnq-w-fondations', 'bat-fondations'],
      status: 'conforme',
      title: 'Fondation récente — état satisfaisant',
      text: "La fondation inspectée présente un état général satisfaisant, sans fissure notable, sans signe d'humidité active et sans déformation apparente. La construction semble récente et les matériaux sont en bon état. Aucune action corrective n'est nécessaire dans l'immédiat.",
    },

    // ─────────────────────────────────────────────────────────────────────────────
    // TOITURE
    // ─────────────────────────────────────────────────────────────────────────────

    {
      id: 'pn-toiture-nc-bardeau-fin-vie',
      sectionIds: ['walk-toiture', 'bnq-w-toiture', 'bat-toiture'],
      status: 'non-conforme',
      title: 'Bardeaux en fin de vie — remplacement requis',
      text: "L'inspection de la toiture révèle que les bardeaux d'asphalte sont en fin de vie utile, présentant un granulage important, des bords recourbés et des zones de fragilisation multiples. Cette condition indique que l'étanchéité de la toiture n'est plus assurée de façon fiable et que le risque d'infiltration lors de pluies ou de dégels est élevé. Le remplacement complet du revêtement de couverture est recommandé dans un délai rapproché.",
    },
    {
      id: 'pn-toiture-nc-membrane-dechirée',
      sectionIds: ['walk-toiture', 'bnq-w-toiture', 'bat-toiture'],
      status: 'non-conforme',
      title: 'Membrane déchirée — infiltration potentielle',
      text: "Il a été observé que la membrane de toiture présente des déchirures, des décollements ou des perforations dans plusieurs zones. Ces ouvertures constituent des points d'entrée directe pour l'eau lors des précipitations. Des infiltrations actives peuvent déjà être en cours sans être encore visibles à l'intérieur. Une réfection immédiate des zones endommagées ou un remplacement complet de la membrane est requis.",
    },
    {
      id: 'pn-toiture-nc-solin-defaillant',
      sectionIds: ['walk-toiture', 'bnq-w-toiture', 'bat-toiture'],
      status: 'non-conforme',
      title: 'Solins défaillants — jonctions non étanches',
      text: "Les solins de raccordement autour des cheminées, lucarnes et autres pénétrations de toiture présentent des défaillances notables, notamment des décollements, des oxydations avancées ou des joints d'étanchéité dégradés. Ces zones sont parmi les plus susceptibles de générer des infiltrations d'eau. Des travaux de réfection ou de remplacement des solins défaillants sont requis pour assurer l'étanchéité de l'enveloppe.",
    },
    {
      id: 'pn-toiture-nc-affaissement',
      sectionIds: ['walk-toiture', 'bnq-w-toiture', 'bat-toiture'],
      status: 'non-conforme',
      title: 'Affaissement de la toiture — problème structurel',
      text: "L'inspection de la toiture révèle un affaissement visible de la surface de couverture, indiquant une défaillance probable de la charpente ou des pannes sous-jacentes. Ce type de déformation peut être lié à une surcharge, à la pourriture des éléments de bois ou à une déficience de conception. Une évaluation par un professionnel compétent est requise afin de déterminer l'étendue du problème structurel et les travaux de correction nécessaires.",
    },
    {
      id: 'pn-toiture-nc-gouttiere-absente',
      sectionIds: ['walk-toiture', 'bnq-w-toiture', 'bat-toiture'],
      status: 'non-conforme',
      title: 'Gouttières absentes ou obstruées — eau non drainée',
      text: "Les gouttières sont absentes, décrochées ou obstruées sur une partie ou la totalité du pourtour du toit. Cette situation entraîne un déversement des eaux de ruissellement directement en pied de mur, contribuant à la saturation du sol adjacent aux fondations et à la détérioration des matériaux de finition. L'installation ou la remise en état complète du système de gouttières et de descentes pluviales est recommandée.",
    },
    {
      id: 'pn-toiture-ac-bardeau-age',
      sectionIds: ['walk-toiture', 'bnq-w-toiture', 'bat-toiture'],
      status: 'a-corriger',
      title: 'Bardeaux vieillissants — remplacement à planifier',
      text: "Les bardeaux présentent des signes de vieillissement avancé, incluant une perte partielle de granules et quelques zones de fragilisation. Bien que l'étanchéité semble encore assurée au moment de l'inspection, la durée de vie résiduelle est estimée comme limitée. La planification du remplacement à court ou moyen terme est conseillée afin d'éviter des infiltrations prématurées.",
    },
    {
      id: 'pn-toiture-ac-mousse-lichen',
      sectionIds: ['walk-toiture', 'bnq-w-toiture', 'bat-toiture'],
      status: 'a-corriger',
      title: "Mousse et lichen — rétention d'humidité",
      text: "Une croissance de mousse et de lichen est observée sur une portion de la surface de couverture. Ces végétaux retiennent l'humidité au contact des bardeaux et accélèrent leur dégradation en perturbant leur adhérence et leur capacité d'évacuation de l'eau. Un traitement biocide approprié et un nettoyage doux sont recommandés pour prolonger la durée de vie du revêtement.",
    },
    {
      id: 'pn-toiture-ac-ventilation-insuffisante',
      sectionIds: ['walk-toiture', 'bnq-w-toiture', 'bat-toiture'],
      status: 'a-corriger',
      title: 'Ventilation de comble insuffisante — condensation à risque',
      text: "L'inspection révèle une ventilation insuffisante de l'espace de comble, pouvant se manifester par un nombre insuffisant d'évents ou un obstruction partielle des ouvertures existantes. Une ventilation inadéquate favorise l'accumulation de condensation et de givre en saison froide, ce qui peut endommager la charpente et le revêtement intérieur. Une vérification et une mise à niveau du système de ventilation du comble sont recommandées.",
    },
    {
      id: 'pn-toiture-c-1',
      sectionIds: ['walk-toiture', 'bnq-w-toiture', 'bat-toiture'],
      status: 'conforme',
      title: 'Toiture en bon état — aucune anomalie détectée',
      text: "L'inspection visuelle de la toiture n'a révélé aucune anomalie significative. Les bardeaux sont en bon état, les solins sont bien fixés et étanches, et les gouttières sont fonctionnelles. Aucune intervention corrective n'est requise dans l'immédiat.",
    },
    {
      id: 'pn-toiture-c-2',
      sectionIds: ['walk-toiture', 'bnq-w-toiture', 'bat-toiture'],
      status: 'conforme',
      title: 'Toiture récente — installation soignée',
      text: "La toiture a été refaite récemment et présente un état général excellent. Les matériaux de couverture sont neufs, les solins sont bien intégrés et les raccords de pénétration sont étanchéifiés correctement. Le système de drainage est complet et opérationnel. Aucune action corrective n'est nécessaire.",
    },

    // ─────────────────────────────────────────────────────────────────────────────
    // FAÇADES
    // ─────────────────────────────────────────────────────────────────────────────

    {
      id: 'pn-facades-nc-clin-pourri',
      sectionIds: ['walk-facades', 'bnq-w-facades', 'bat-facades'],
      status: 'non-conforme',
      title: 'Revêtement de bois pourri — dégradation avancée',
      text: "Il a été observé que le revêtement extérieur en bois présente des zones de pourriture avancée, se manifestant par un bois mou, friable et décoloré. Cette condition indique une exposition prolongée à l'humidité, souvent attribuable à un manque d'entretien ou à un défaut d'étanchéité. Le remplacement des sections affectées et la correction des causes sous-jacentes d'infiltration d'humidité sont requis.",
    },
    {
      id: 'pn-facades-nc-brique-dejointe',
      sectionIds: ['walk-facades', 'bnq-w-facades', 'bat-facades'],
      status: 'non-conforme',
      title: 'Maçonnerie déjointoyée — eau pénètre dans les joints',
      text: "L'inspection révèle que les joints de maçonnerie sont érodés, manquants ou décollés sur des sections importantes de la façade. Les joints de mortier défaillants constituent des voies d'infiltration directe pour l'eau de pluie. Si cette condition n'est pas traitée, la dégradation peut s'étendre à la maçonnerie elle-même et affecter les éléments de structure adjacents. Des travaux de rejointoiement sont requis.",
    },
    {
      id: 'pn-facades-nc-bardage-decolle',
      sectionIds: ['walk-facades', 'bnq-w-facades', 'bat-facades'],
      status: 'non-conforme',
      title: 'Bardage décollé — infiltration derrière le revêtement',
      text: "Il a été observé que le bardage extérieur présente des sections décollées ou mal fixées, créant des ouvertures qui permettent à l'eau, au vent et aux insectes de pénétrer derrière le revêtement. Cette condition peut générer des dommages importants aux composantes structurales masquées. La remise en état du bardage et une vérification de l'état des matériaux de protection sous-jacents sont recommandées.",
    },
    {
      id: 'pn-facades-nc-fenetre-solin',
      sectionIds: ['walk-facades', 'bnq-w-facades', 'bat-facades'],
      status: 'non-conforme',
      title: 'Solins de fenêtres absents ou défaillants',
      text: "L'inspection révèle que les solins de tête et de base des ouvertures sont absents ou en mauvais état sur plusieurs fenêtres. Cette condition favorise l'infiltration d'eau au pourtour des cadres, pouvant causer des dommages aux linteaux, aux murs intérieurs et aux revêtements de plancher. La correction des solins défaillants et une vérification de l'état des éléments de structure adjacents sont requises.",
    },
    {
      id: 'pn-facades-nc-stucco-fissure',
      sectionIds: ['walk-facades', 'bnq-w-facades', 'bat-facades'],
      status: 'non-conforme',
      title: "Crépi fissuré — voies d'infiltration multiples",
      text: "Le revêtement de crépi appliqué sur la façade présente de nombreuses fissures, dont certaines traversantes. Ces fissures constituent autant de points d'entrée pour l'eau de pluie, particulièrement lors de pluies battantes accompagnées de vent. Une réfection des fissures ou un remplacement partiel du crépi avec application d'un produit élastomère est recommandé.",
    },
    {
      id: 'pn-facades-ac-peinture-ecaillee',
      sectionIds: ['walk-facades', 'bnq-w-facades', 'bat-facades'],
      status: 'a-corriger',
      title: 'Peinture écaillée — protection dégradée',
      text: "La peinture extérieure présente des zones d'écaillage, de cloquage et de décollement. Bien que la dégradation soit principalement esthétique au stade actuel, elle réduit la protection du support contre l'humidité et accélère la détérioration des matériaux sous-jacents. Un ponçage, un apprêtage et une application de nouvelle peinture extérieure adaptée sont recommandés lors de la prochaine saison propice.",
    },
    {
      id: 'pn-facades-ac-joint-calfeutrage',
      sectionIds: ['walk-facades', 'bnq-w-facades', 'bat-facades'],
      status: 'a-corriger',
      title: 'Calfeutrage dégradé — étanchéité à renouveler',
      text: "Les joints de calfeutrage autour des ouvertures et aux jonctions des matériaux de revêtement présentent des signes de vieillissement, notamment des craquelures, des décollements et des zones manquantes. Ces joints constituent la première ligne de défense contre l'infiltration d'eau. Le remplacement du calfeutrage dégradé avec un produit élastomère de qualité est recommandé.",
    },
    {
      id: 'pn-facades-ac-brique-effritement',
      sectionIds: ['walk-facades', 'bnq-w-facades', 'bat-facades'],
      status: 'a-corriger',
      title: 'Briques effritement — dégradation superficielle',
      text: "Quelques briques présentent un effritement de surface, probablement dû aux cycles de gel-dégel répétés. Cette dégradation est limitée et superficielle au moment de l'inspection, mais elle doit être surveillée annuellement car elle peut progresser et nécessiter un remplacement des briques affectées. Un traitement imperméabilisant peut être envisagé comme mesure préventive.",
    },
    {
      id: 'pn-facades-c-1',
      sectionIds: ['walk-facades', 'bnq-w-facades', 'bat-facades'],
      status: 'conforme',
      title: 'Façade en bon état — aucune anomalie notable',
      text: "L'inspection visuelle de la façade ne révèle aucune anomalie significative. Le revêtement extérieur est intact, bien fixé et en bon état apparent. Les joints de calfeutrage sont souples et adhérents. Aucune intervention corrective n'est requise dans l'immédiat.",
    },

    // ─────────────────────────────────────────────────────────────────────────────
    // OUVERTURES
    // ─────────────────────────────────────────────────────────────────────────────

    {
      id: 'pn-ouv-nc-fenetre-condensation',
      sectionIds: ['walk-ouvertures', 'bnq-w-ouvertures', 'bat-ouvertures'],
      status: 'non-conforme',
      title: 'Fenêtres à double vitrage défaillant — condensation intérieure',
      text: "Il a été observé que plusieurs fenêtres à double ou triple vitrage présentent une condensation visible entre les vitrages, indiquant une rupture du scellement périphérique du vitrage isolant. Cette condition compromet la performance thermique de la fenêtre et peut générer des infiltrations d'air et d'humidité. Le remplacement des unités de vitrage défaillantes est recommandé.",
    },
    {
      id: 'pn-ouv-nc-porte-ext-defaillante',
      sectionIds: ['walk-ouvertures', 'bnq-w-ouvertures', 'bat-ouvertures'],
      status: 'non-conforme',
      title: 'Porte extérieure — étanchéité défaillante',
      text: "L'inspection de la porte extérieure révèle des défaillances notables de l'étanchéité, notamment des coupe-froid absents ou détériorés, un seuil inadéquat ou une déformation du cadre empêchant une fermeture hermétique. Ces conditions permettent le passage d'air froid, d'eau et d'insectes à travers l'enveloppe du bâtiment. La correction des coupe-froid, du seuil et du cadre est recommandée.",
    },
    {
      id: 'pn-ouv-nc-fenetre-ouverture-bloquee',
      sectionIds: ['walk-ouvertures', 'bnq-w-ouvertures', 'bat-ouvertures'],
      status: 'non-conforme',
      title: "Fenêtres condamnées — voie d'évacuation bloquée",
      text: "Il a été observé que certaines fenêtres ont été condamnées ou scellées de façon permanente. Dans les pièces servant de chambres à coucher ou pouvant servir d'espace de vie, cela peut représenter une problématique de sécurité en cas d'urgence nécessitant une évacuation. La restauration de l'ouvrabilité des fenêtres ou la mise en place d'une autre issue conforme est recommandée.",
    },
    {
      id: 'pn-ouv-nc-cadre-pourri',
      sectionIds: ['walk-ouvertures', 'bnq-w-ouvertures', 'bat-ouvertures'],
      status: 'non-conforme',
      title: 'Cadres de bois pourris — remplacement requis',
      text: "L'inspection révèle que les cadres de bois de plusieurs fenêtres ou portes présentent une pourriture avancée, particulièrement aux angles inférieurs et aux appuis. Cette dégradation compromet l'étanchéité de l'assemblage et la fixation des vitrages. Le remplacement des cadres affectés ou des unités complètes est requis.",
    },
    {
      id: 'pn-ouv-ac-vitrage-simple',
      sectionIds: ['walk-ouvertures', 'bnq-w-ouvertures', 'bat-ouvertures'],
      status: 'a-corriger',
      title: 'Fenêtres à simple vitrage — performance thermique faible',
      text: "Les fenêtres inspectées sont à simple vitrage, ce qui génère une perte thermique significative et favorise la condensation sur les vitrages en saison froide. Cette condition entraîne un inconfort des occupants et une surconsommation d'énergie de chauffage. Le remplacement progressif des fenêtres à simple vitrage par des unités à double ou triple vitrage à faible émissivité est recommandé.",
    },
    {
      id: 'pn-ouv-ac-calfeutrage-fenetre',
      sectionIds: ['walk-ouvertures', 'bnq-w-ouvertures', 'bat-ouvertures'],
      status: 'a-corriger',
      title: 'Calfeutrage des fenêtres à refaire',
      text: "Le calfeutrage périphérique de plusieurs fenêtres est craquelé, décollé ou absent sur des sections. Cette condition entraîne des infiltrations d'air et potentiellement d'eau aux pourtours des cadres. Le renouvellement du calfeutrage avec un produit élastomère de qualité extérieure est recommandé lors de la prochaine saison favorable.",
    },
    {
      id: 'pn-ouv-c-1',
      sectionIds: ['walk-ouvertures', 'bnq-w-ouvertures', 'bat-ouvertures'],
      status: 'conforme',
      title: 'Fenêtres et portes en bon état',
      text: "L'inspection des fenêtres et des portes extérieures ne révèle aucune anomalie significative. Les vitrages sont intacts, les cadres sont en bon état et les coupe-froid sont présents et fonctionnels. L'étanchéité de l'enveloppe aux ouvertures est jugée satisfaisante.",
    },

    // ─────────────────────────────────────────────────────────────────────────────
    // PLOMBERIE EXTÉRIEURE
    // ─────────────────────────────────────────────────────────────────────────────

    {
      id: 'pn-plomb-ext-nc-robinet-exterieur',
      sectionIds: ['walk-plomb-ext', 'bnq-w-plomb-ext', 'bat-plomb-ext'],
      status: 'non-conforme',
      title: 'Robinet extérieur défaillant — risque de gel',
      text: "Le robinet d'arrosage extérieur est de type standard et n'est pas muni d'un mécanisme antiretour ni d'un dispositif protégé contre le gel. Ce type d'installation est susceptible de causer des bris de tuyauterie lors des périodes de gel si la vidange n'est pas effectuée. Le remplacement par un robinet antigel à arbre long et l'installation d'un clapet antiretour sont recommandés.",
    },
    {
      id: 'pn-plomb-ext-nc-descente-pluviale-defaillante',
      sectionIds: ['walk-plomb-ext', 'bnq-w-plomb-ext', 'bat-plomb-ext'],
      status: 'non-conforme',
      title: 'Descentes pluviales déversant en fondation',
      text: "Il a été observé que les descentes pluviales déversent les eaux de toiture directement au pied des fondations sans diffuseur ni raccord de déviation. Cette condition concentre un volume important d'eau au point le plus critique de l'enveloppe. Des diffuseurs de sortie ou des prolongements rigides éloignant l'eau d'au moins 1,5 m du bâtiment sont requis.",
    },
    {
      id: 'pn-plomb-ext-nc-drains-surface-obstrues',
      sectionIds: ['walk-plomb-ext', 'bnq-w-plomb-ext', 'bat-plomb-ext'],
      status: 'non-conforme',
      title: "Drains de surface obstrués — accumulation d'eau",
      text: "Les drains de surface en cour ou autour des entrées sont obstrués par des débris ou de la terre. Cette condition empêche l'évacuation normale des eaux de pluie et favorise leur accumulation et leur infiltration. Le nettoyage et la remise en état de tous les drains extérieurs sont requis.",
    },
    {
      id: 'pn-plomb-ext-ac-tuyau-rouille',
      sectionIds: ['walk-plomb-ext', 'bnq-w-plomb-ext', 'bat-plomb-ext'],
      status: 'a-corriger',
      title: 'Tuyauterie extérieure oxydée — surveillance recommandée',
      text: "Les tuyaux métalliques apparents à l'extérieur du bâtiment présentent une oxydation superficielle. Aucune fuite active n'est détectée au moment de l'inspection, mais l'avancement de la corrosion pourrait mener à des perforations à terme. Une inspection annuelle et l'application d'une protection anticorrosion ou le remplacement des sections affectées à terme sont recommandés.",
    },
    {
      id: 'pn-plomb-ext-ac-gouttiere-mal-dirigee',
      sectionIds: ['walk-plomb-ext', 'bnq-w-plomb-ext', 'bat-plomb-ext'],
      status: 'a-corriger',
      title: 'Gouttières mal inclinées — évacuation inefficace',
      text: "L'inclinaison des gouttières est insuffisante par endroits, provoquant une stagnation d'eau et le développement de mousses. Cette condition favorise la corrosion prématurée des gouttières et réduit leur efficacité lors de fortes pluies. Un réajustement de la pente des gouttières afin d'assurer un écoulement continu vers les descentes est recommandé.",
    },
    {
      id: 'pn-plomb-ext-c-1',
      sectionIds: ['walk-plomb-ext', 'bnq-w-plomb-ext', 'bat-plomb-ext'],
      status: 'conforme',
      title: 'Plomberie extérieure fonctionnelle — aucune anomalie',
      text: "L'inspection de la plomberie extérieure ne révèle aucune anomalie significative. Les descentes pluviales sont bien fixées et évacuent les eaux loin du bâtiment. Les robinets extérieurs sont fonctionnels et adaptés au climat. Aucune intervention n'est requise dans l'immédiat.",
    },

    // ─────────────────────────────────────────────────────────────────────────────
    // ÉLECTRICITÉ EXTÉRIEURE
    // ─────────────────────────────────────────────────────────────────────────────

    {
      id: 'pn-elec-ext-nc-entree-service-defaillante',
      sectionIds: ['walk-elec-ext', 'bnq-w-elec-ext', 'bat-elec-ext'],
      status: 'non-conforme',
      title: 'Entrée de service électrique non conforme',
      text: "L'entrée de service électrique présente des défaillances notables, notamment une entrée de câble non étanchéifiée, une gaine isolante détériorée ou une tuyauterie de service endommagée. Ces conditions peuvent permettre l'infiltration d'eau dans le panneau électrique et créer des risques d'arc électrique. Une mise en conformité par un électricien licencié est requise sans délai.",
    },
    {
      id: 'pn-elec-ext-nc-luminaire-ext-defaillant',
      sectionIds: ['walk-elec-ext', 'bnq-w-elec-ext', 'bat-elec-ext'],
      status: 'non-conforme',
      title: "Luminaires extérieurs non étanches — risque d'électrocution",
      text: "Des luminaires extérieurs ne sont pas adaptés aux conditions climatiques extérieures, présentant des carcasses fissurées ou des installations non homologuées pour usage extérieur. Cette situation présente un risque d'électrocution et d'incendie, particulièrement en présence d'humidité. Le remplacement par des appareils certifiés pour usage extérieur et une vérification du câblage associé sont requis.",
    },
    {
      id: 'pn-elec-ext-nc-prise-ext-sans-capot',
      sectionIds: ['walk-elec-ext', 'bnq-w-elec-ext', 'bat-elec-ext'],
      status: 'non-conforme',
      title: 'Prises extérieures sans protection adéquate',
      text: "Les prises de courant extérieures sont dépourvues de couvercle étanche ou de boîtier d'intempérie adéquat. Une prise non protégée à l'extérieur expose les conducteurs à l'humidité et augmente significativement le risque de court-circuit et d'électrocution. L'installation de couvercles d'intempérie certifiés et la vérification de la protection par disjoncteur différentiel sont requises.",
    },
    {
      id: 'pn-elec-ext-ac-fils-aeriens-vieux',
      sectionIds: ['walk-elec-ext', 'bnq-w-elec-ext', 'bat-elec-ext'],
      status: 'a-corriger',
      title: "Fils aériens vieillissants — inspection par l'électricien",
      text: "Les fils de branchement aériens entre le poteau de distribution et le bâtiment semblent présenter un vieillissement de leur gaine isolante. La responsabilité du câblage entre le poteau et le compteur relève du distributeur d'électricité, mais la section entre le compteur et le panneau devrait être vérifiée par un électricien. Une inspection par un professionnel qualifié est recommandée.",
    },
    {
      id: 'pn-elec-ext-ac-coffret',
      sectionIds: ['walk-elec-ext', 'bnq-w-elec-ext', 'bat-elec-ext'],
      status: 'a-corriger',
      title: 'Coffret extérieur à inspecter par électricien',
      text: "Le coffret électrique extérieur présente des signes d'usure ou de corrosion qui justifient une inspection approfondie par un électricien qualifié. Une défaillance du coffret peut entraîner une coupure de courant, un arc électrique ou une infiltration d'eau sur les composants, aggravant les risques de court-circuit. Une vérification de l'étanchéité et de l'état des composants internes est recommandée afin de prévenir toute défaillance.",
    },
    {
      id: 'pn-elec-ext-c-1',
      sectionIds: ['walk-elec-ext', 'bnq-w-elec-ext', 'bat-elec-ext'],
      status: 'conforme',
      title: 'Électricité extérieure — état satisfaisant',
      text: "L'inspection des composantes électriques extérieures ne révèle aucune anomalie notable. L'entrée de service est étanchéifiée, les luminaires et prises extérieures sont conformes à l'usage extérieur. Aucune intervention corrective n'est requise dans l'immédiat.",
    },

    // ─────────────────────────────────────────────────────────────────────────────
    // STRUCTURE INTÉRIEURE
    // ─────────────────────────────────────────────────────────────────────────────

    {
      id: 'pn-struct-nc-solive-pourrie',
      sectionIds: ['aibq-v-i', 'aibq-v-i-17', 'bnq-12-2'],
      status: 'non-conforme',
      title: 'Solives pourries — plancher affaibli',
      text: "L'inspection du vide sanitaire ou du sous-sol révèle que des solives de plancher présentent une pourriture avancée, caractérisée par un bois mou, décoloré et friable au toucher. Cette condition compromet la capacité portante du plancher et représente un risque pour la sécurité des occupants. Une évaluation par un ingénieur en structure et le remplacement ou le renforcement des solives affectées sont requis.",
    },
    {
      id: 'pn-struct-nc-poutre-flexion',
      sectionIds: ['aibq-v-i', 'aibq-v-i-17', 'bnq-12-2'],
      status: 'non-conforme',
      title: 'Poutre principale fléchie — déflexion excessive',
      text: "Une déflexion excessive a été observée sur la poutre principale du plancher, indiquant un affaiblissement de l'élément porteur. Cette condition peut être liée à une sous-dimensionnement d'origine, à une dégradation des matériaux ou à une modification non autorisée de la structure. Une évaluation structurale par un ingénieur est requise afin de déterminer les mesures correctives appropriées.",
    },
    {
      id: 'pn-struct-nc-poteau-appui-defaillant',
      sectionIds: ['aibq-v-i', 'aibq-v-i-17', 'bnq-12-2'],
      status: 'non-conforme',
      title: "Poteau d'appui instable — base inadéquate",
      text: "Il a été observé qu'un ou plusieurs poteaux d'appui reposent sur des bases inadéquates, présentent des signes de mouvement ou ne sont pas correctement fixés à la poutre qu'ils supportent. Cette condition peut causer un mouvement différentiel de la structure et compromettre l'intégrité de l'ensemble. Des travaux de correction et une vérification structurale sont requis.",
    },
    {
      id: 'pn-struct-nc-mur-porteur-modifie',
      sectionIds: ['aibq-v-i', 'aibq-v-i-17', 'bnq-12-2'],
      status: 'non-conforme',
      title: 'Mur porteur modifié sans linteau adéquat',
      text: "Il a été observé qu'une ouverture a été pratiquée dans ce qui semble être un mur porteur, sans qu'un linteau de dimensions adéquates ait été installé pour reprendre les charges. Cette modification non conforme peut entraîner un fléchissement du plancher supérieur ou une déformation de la structure. Une évaluation structurale par un ingénieur est fortement recommandée.",
    },
    {
      id: 'pn-struct-ac-plancher-mou',
      sectionIds: ['aibq-v-i', 'aibq-v-i-17', 'bnq-12-2'],
      status: 'a-corriger',
      title: 'Plancher souple — renforcement à envisager',
      text: "Le plancher présente une souplesse notable lors de la marche, sans qu'une déflexion structurale dangereuse soit observée au moment de l'inspection. Cette condition peut indiquer des solives insuffisamment dimensionnées pour la portée ou un sous-plancher dégradé. Une vérification par-dessous et un renforcement par blocage ou ajout de solives peuvent être envisagés.",
    },
    {
      id: 'pn-struct-ac-moisissure-charpente',
      sectionIds: ['aibq-v-i', 'aibq-v-i-17', 'bnq-12-2'],
      status: 'a-corriger',
      title: 'Moisissures sur charpente — humidité excessive',
      text: "Des traces de moisissures sont visibles sur les éléments de charpente dans le vide sanitaire ou le sous-sol. Cette condition indique un niveau d'humidité trop élevé dans cet espace, potentiellement dû à un drainage inadéquat, à une ventilation insuffisante ou à une vapeur remontant du sol. Une investigation de la source d'humidité et un assainissement de l'espace sont recommandés.",
    },
    {
      id: 'pn-struct-c-1',
      sectionIds: ['aibq-v-i', 'aibq-v-i-17', 'bnq-12-2'],
      status: 'conforme',
      title: 'Structure intérieure — état satisfaisant',
      text: "L'inspection visuelle des éléments de structure accessibles ne révèle aucune anomalie significative. Les solives, poutres et poteaux d'appui sont en bon état apparent, sans déflexion excessive ni signe de dégradation. Aucune intervention corrective n'est requise dans l'immédiat.",
    },

    // ─────────────────────────────────────────────────────────────────────────────
    // PLOMBERIE INTÉRIEURE
    // ─────────────────────────────────────────────────────────────────────────────

    {
      id: 'pn-plomb-int-nc-tuyau-plomb',
      sectionIds: ['aibq-v-iv', 'bnq-12-3'],
      status: 'non-conforme',
      title: 'Tuyauterie en plomb — contamination potentielle',
      text: "Il a été observé que la distribution d'eau potable comporte des sections de tuyauterie en plomb. Ce matériau, utilisé couramment jusqu'aux années 1970, peut relarguer du plomb dans l'eau consommée, représentant un risque pour la santé des occupants, particulièrement pour les enfants et les femmes enceintes. Une analyse de l'eau et le remplacement de l'ensemble des conduites en plomb sont fortement recommandés.",
    },
    {
      id: 'pn-plomb-int-nc-chauffe-eau-rouille',
      sectionIds: ['aibq-v-iv', 'bnq-12-3'],
      status: 'non-conforme',
      title: 'Chauffe-eau rouillé — remplacement requis',
      text: "Le chauffe-eau présente des signes de corrosion avancée sur la cuve ou les raccords, ainsi que des traces d'oxydation ou d'humidité à sa base. Ces signes indiquent une durée de vie résiduelle très limitée et un risque de défaillance avec inondation potentielle. Le remplacement immédiat du chauffe-eau est recommandé.",
    },
    {
      id: 'pn-plomb-int-nc-fuite-active',
      sectionIds: ['aibq-v-iv', 'bnq-12-3'],
      status: 'non-conforme',
      title: 'Fuite active dans la tuyauterie — intervention urgente',
      text: "Une fuite active a été détectée dans la tuyauterie de distribution ou d'évacuation lors de l'inspection. Cette condition cause des dommages progressifs aux matériaux adjacents et peut engendrer le développement de moisissures si elle n'est pas corrigée rapidement. Une intervention plombier pour localiser précisément et réparer la fuite est requise sans délai.",
    },
    {
      id: 'pn-plomb-int-nc-soupape-manquante',
      sectionIds: ['aibq-v-iv', 'bnq-12-3'],
      status: 'non-conforme',
      title: 'Soupape de sécurité manquante sur chauffe-eau',
      text: "Le chauffe-eau n'est pas équipé d'une soupape de sécurité température-pression fonctionnelle ou le tuyau de décharge de cette soupape est absent ou incorrectement installé. Cette soupape est un dispositif de sécurité essentiel prévenant l'explosion du réservoir en cas de surchauffe. L'installation ou la remise en état de ce dispositif est requise immédiatement.",
    },
    {
      id: 'pn-plomb-int-ac-pression-eau-elevee',
      sectionIds: ['aibq-v-iv', 'bnq-12-3'],
      status: 'a-corriger',
      title: "Pression d'eau élevée — usure prématurée des équipements",
      text: "La pression d'eau mesurée à l'inspection est supérieure à 550 kPa (80 psi), ce qui dépasse la plage recommandée pour les installations résidentielles. Une pression excessive accélère l'usure des robinetteries, des raccords et des appareils, et augmente le risque de fuite. L'installation d'un réducteur de pression sur l'entrée d'eau principale est recommandée.",
    },
    {
      id: 'pn-plomb-int-ac-chauffe-eau-vieux',
      sectionIds: ['aibq-v-iv', 'bnq-12-3'],
      status: 'a-corriger',
      title: 'Chauffe-eau vieillissant — remplacement à planifier',
      text: "Le chauffe-eau est âgé de plus de 10 ans et approche la fin de sa durée de vie utile estimée. Aucune défaillance n'est observée au moment de l'inspection, mais la probabilité de bris augmente significativement avec l'âge de l'appareil. La planification du remplacement préventif est recommandée afin d'éviter une panne et les dommages par eau qui pourraient en résulter.",
    },
    {
      id: 'pn-plomb-int-ac-evacuation-lente',
      sectionIds: ['aibq-v-iv', 'bnq-12-3'],
      status: 'a-corriger',
      title: 'Évacuation lente — obstruction partielle',
      text: "Un écoulement lent a été constaté dans une ou plusieurs évacuations lors des tests d'usage. Cette condition indique une obstruction partielle des conduites, pouvant être due à une accumulation de résidus ou à un dépôt calcaire. Un débouchage et, si la condition persiste, une inspection par caméra des conduites sont recommandés.",
    },
    {
      id: 'pn-plomb-int-c-1',
      sectionIds: ['aibq-v-iv', 'bnq-12-3'],
      status: 'conforme',
      title: 'Plomberie intérieure — fonctionnelle, aucune anomalie',
      text: "L'inspection de la plomberie intérieure ne révèle aucune anomalie significative. La tuyauterie visible est en bon état, les appareils sanitaires fonctionnent normalement et aucune trace de fuite ou d'humidité anormale n'a été détectée. Le chauffe-eau est en bon état apparent. Aucune intervention n'est requise dans l'immédiat.",
    },
    {
      id: 'pn-plomb-int-c-2',
      sectionIds: ['aibq-v-iv', 'bnq-12-3'],
      status: 'conforme',
      title: 'Tuyauterie récemment rénovée — état satisfaisant',
      text: "La tuyauterie a été remplacée récemment avec des matériaux conformes aux pratiques actuelles. Les raccords sont propres, sans trace d'humidité ou de corrosion. L'écoulement de toutes les évacuations testées est satisfaisant. Aucune intervention n'est nécessaire.",
    },

    // ─────────────────────────────────────────────────────────────────────────────
    // ÉLECTRICITÉ INTÉRIEURE
    // ─────────────────────────────────────────────────────────────────────────────

    {
      id: 'pn-elec-int-nc-panneau-surcharge',
      sectionIds: ['aibq-v-v', 'bnq-12-4'],
      status: 'non-conforme',
      title: 'Panneau électrique surchargé — disjoncteurs multiples',
      text: "Le panneau de distribution électrique présente des signes de surcharge, notamment des doubles disjoncteurs sur des circuits conçus pour un seul, des fils multiples sur une même borne ou l'utilisation de la capacité maximale sans marge de sécurité. Cette condition représente un risque incendie sérieux. Une évaluation par un électricien licencié et une mise à niveau du panneau sont requises.",
    },
    {
      id: 'pn-elec-int-nc-filage-aluminium',
      sectionIds: ['aibq-v-v', 'bnq-12-4'],
      status: 'non-conforme',
      title: 'Câblage en aluminium 15-20A — risque incendie',
      text: "Le câblage des circuits de 15 et 20 ampères est de type aluminium, ce qui présente des risques d'incendie documentés liés à l'oxydation et au desserrement des connexions aux interrupteurs et prises de courant. Une vérification et une mise en conformité de toutes les connexions avec des dispositifs homologués pour aluminium (méthode CO/ALR ou dispositifs AFCI) sont requises par un électricien.",
    },
    {
      id: 'pn-elec-int-nc-sans-mise-a-terre',
      sectionIds: ['aibq-v-v', 'bnq-12-4'],
      status: 'non-conforme',
      title: 'Système électrique sans mise à la terre',
      text: "L'installation électrique est de type non mis à la terre, caractéristique des bâtiments construits avant les années 1970. L'absence de mise à la terre expose les appareils électroniques aux surtensions et représente un risque de choc électrique. Une mise à niveau progressive du système, incluant l'installation de prises de courant avec protection intégrée ou la mise à la terre complète, est recommandée.",
    },
    {
      id: 'pn-elec-int-nc-disjoncteur-defaillant',
      sectionIds: ['aibq-v-v', 'bnq-12-4'],
      status: 'non-conforme',
      title: 'Disjoncteur défaillant ou fusible inadapté',
      text: "Il a été observé que le panneau de distribution comporte des disjoncteurs défaillants (ne déclenchant pas au test), des fusibles de calibre inadapté aux conducteurs protégés, ou des positions vides non obturées. Ces conditions compromettent la protection des circuits contre les surcharges et représentent un risque incendie. Une inspection et une mise en conformité par un électricien sont requises.",
    },
    {
      id: 'pn-elec-int-ac-prises-non-polarisees',
      sectionIds: ['aibq-v-v', 'bnq-12-4'],
      status: 'a-corriger',
      title: 'Prises non polarisées — mise à niveau recommandée',
      text: "Les prises de courant dans certaines pièces sont de type non polarisé à deux broches, sans mise à la terre. Bien que ces prises ne soient pas nécessairement non conformes dans un bâtiment de l'époque, leur remplacement progressif par des prises à trois broches avec protection différentielle est recommandé, notamment dans les pièces humides.",
    },
    {
      id: 'pn-elec-int-ac-eclairage-salle-bain',
      sectionIds: ['aibq-v-v', 'bnq-12-4'],
      status: 'a-corriger',
      title: 'Éclairage salle de bain — protection différentielle absente',
      text: "Les prises et points d'éclairage dans les salles de bain ne sont pas tous protégés par un disjoncteur différentiel de fuite à la terre (GFCI). Une telle protection est requise dans les zones humides afin de prévenir les risques d'électrocution. L'installation de dispositifs GFCI par un électricien qualifié est recommandée.",
    },
    {
      id: 'pn-elec-int-c-1',
      sectionIds: ['aibq-v-v', 'bnq-12-4'],
      status: 'conforme',
      title: 'Électricité intérieure — état satisfaisant',
      text: "L'inspection du système électrique intérieur ne révèle aucune anomalie majeure. Le panneau de distribution est propre, les disjoncteurs sont bien calibrés et fonctionnels, et le câblage visible est en bon état. Aucune intervention corrective n'est requise dans l'immédiat.",
    },

    // ─────────────────────────────────────────────────────────────────────────────
    // CHAUFFAGE
    // ─────────────────────────────────────────────────────────────────────────────

    {
      id: 'pn-chauf-nc-fournaise-vieille',
      sectionIds: ['aibq-v-vi', 'bnq-12-5'],
      status: 'non-conforme',
      title: 'Système de chauffage en fin de vie — remplacement requis',
      text: "Le système de chauffage inspecté est âgé et présente des signes de vieillissement avancé, notamment une corrosion notable sur le corps ou l'échangeur de chaleur, des bruits de fonctionnement anormaux et une efficacité thermique probablement très réduite. La durée de vie résiduelle de cet appareil est jugée limitée. Le remplacement par un équipement à haute efficacité est recommandé dans les meilleurs délais.",
    },
    {
      id: 'pn-chauf-nc-echangeur-fissure',
      sectionIds: ['aibq-v-vi', 'bnq-12-5'],
      status: 'non-conforme',
      title: 'Échangeur de chaleur fissuré — risque de monoxyde de carbone',
      text: "Des indices compatibles avec un échangeur de chaleur fissuré ont été observés lors de l'inspection du système de chauffage à air pulsé. Un échangeur défaillant peut permettre l'introduction de gaz de combustion dans l'air distribué, créant un risque d'empoisonnement au monoxyde de carbone. Une inspection approfondie par un technicien spécialisé et le remplacement de l'appareil si la fissure est confirmée sont requis sans délai.",
    },
    {
      id: 'pn-chauf-nc-conduit-combustion-defaillant',
      sectionIds: ['aibq-v-vi', 'bnq-12-5'],
      status: 'non-conforme',
      title: 'Conduit de combustion défaillant — gaz non évacués',
      text: "Il a été observé que le conduit d'évacuation des gaz de combustion présente des joints décrochés, des sections déformées ou des perforations. Cette condition peut entraîner le refoulement de monoxyde de carbone dans les espaces de vie. Des travaux de correction par un technicien qualifié sont requis immédiatement et l'appareil devrait être mis hors service jusqu'à la réparation.",
    },
    {
      id: 'pn-chauf-ac-entretien-requis',
      sectionIds: ['aibq-v-vi', 'bnq-12-5'],
      status: 'a-corriger',
      title: 'Système de chauffage — entretien annuel requis',
      text: "Le système de chauffage ne présente pas d'anomalie structurale visible, mais aucune trace d'entretien préventif récent n'a pu être constatée. Les appareils à combustion requièrent un entretien annuel par un technicien certifié pour maintenir leur efficacité et leur sécurité d'opération. Un contrat d'entretien annuel est fortement recommandé.",
    },
    {
      id: 'pn-chauf-ac-filtre-encombre',
      sectionIds: ['aibq-v-vi', 'bnq-12-5'],
      status: 'a-corriger',
      title: 'Filtre à air obstrué — efficacité réduite',
      text: "Le filtre du système de chauffage à air pulsé est fortement encombré de poussières et de débris, réduisant significativement le débit d'air et l'efficacité de l'appareil. Un filtre obstrué peut également entraîner une surchauffe de l'échangeur. Le remplacement du filtre et la mise en place d'un calendrier de remplacement régulier (aux 1 à 3 mois selon le type) sont recommandés.",
    },
    {
      id: 'pn-chauf-ac-radiateurs-inegaux',
      sectionIds: ['aibq-v-vi', 'bnq-12-5'],
      status: 'a-corriger',
      title: 'Distribution de chaleur inégale — équilibrage requis',
      text: "Il a été observé que la distribution de chaleur est inégale entre les pièces, certaines zones étant significativement moins chauffées que d'autres. Cette condition peut indiquer un déséquilibre du réseau de distribution, des registres mal positionnés ou des pertes thermiques localisées. Un équilibrage du système par un technicien qualifié est recommandé.",
    },
    {
      id: 'pn-chauf-c-1',
      sectionIds: ['aibq-v-vi', 'bnq-12-5'],
      status: 'conforme',
      title: 'Chauffage en bon état de fonctionnement',
      text: "L'inspection du système de chauffage révèle un appareil en bon état, fonctionnant correctement lors des tests effectués. Les conduits visibles sont intègres et la distribution de chaleur semble uniforme. Aucune anomalie n'a été détectée lors de l'inspection.",
    },

    // ─────────────────────────────────────────────────────────────────────────────
    // CLIMATISATION
    // ─────────────────────────────────────────────────────────────────────────────

    {
      id: 'pn-clim-nc-condenseur-corrosion',
      sectionIds: ['aibq-v-vii'],
      status: 'non-conforme',
      title: 'Condenseur extérieur — corrosion avancée',
      text: "L'unité de condensation extérieure du système de climatisation présente une corrosion avancée sur le châssis, les ailettes et les raccords réfrigérants. Cette dégradation réduit l'efficacité du système et indique une durée de vie résiduelle limitée. Une évaluation par un technicien en réfrigération et le remplacement de l'unité si la réparation n'est pas économiquement justifiée sont recommandés.",
    },
    {
      id: 'pn-clim-nc-fuite-refrigerant',
      sectionIds: ['aibq-v-vii'],
      status: 'non-conforme',
      title: 'Fuite de réfrigérant probable — système inefficace',
      text: "Des indices de fuite de fluide réfrigérant ont été observés lors de l'inspection, notamment des traces d'huile sur les raccords, le givrage de la ligne de suction ou un fonctionnement anormalement prolongé du compresseur. Une fuite de réfrigérant compromet le fonctionnement du système et peut entraîner la défaillance du compresseur. Une vérification par un technicien certifié est requise.",
    },
    {
      id: 'pn-clim-nc-ligne-refrigerant-non-isolee',
      sectionIds: ['aibq-v-vii'],
      status: 'non-conforme',
      title: 'Lignes réfrigérantes non isolées — condensation',
      text: "Les lignes réfrigérantes reliant l'unité intérieure et extérieure présentent des sections sans isolant ou avec un isolant dégradé. Sans isolation adéquate, la condensation s'accumule sur les lignes froides et peut causer des dommages par humidité aux matériaux environnants. La repose d'un isolant adéquat sur l'ensemble des lignes réfrigérantes est recommandée.",
    },
    {
      id: 'pn-clim-ac-entretien-requis',
      sectionIds: ['aibq-v-vii'],
      status: 'a-corriger',
      title: 'Climatisation — entretien annuel recommandé',
      text: "Le système de climatisation ne présente pas de défaillance apparente, mais les ailettes du condenseur sont partiellement obstruées et aucun entretien récent n'est documenté. Un nettoyage des ailettes et un entretien préventif annuel par un technicien qualifié sont recommandés pour maintenir l'efficacité et la durée de vie du système.",
    },
    {
      id: 'pn-clim-ac-age-systeme',
      sectionIds: ['aibq-v-vii'],
      status: 'a-corriger',
      title: 'Climatisation vieillissante — remplacement à planifier',
      text: "Le système de climatisation est âgé de plus de 12 ans et approche la fin de sa durée de vie utile estimée. Aucune défaillance n'est observée au moment de l'inspection, mais la probabilité de panne augmente avec l'âge. La planification du remplacement préventif par un système à haute efficacité est recommandée.",
    },
    {
      id: 'pn-clim-c-1',
      sectionIds: ['aibq-v-vii'],
      status: 'conforme',
      title: 'Climatisation — fonctionnelle, aucune anomalie',
      text: "L'inspection du système de climatisation révèle un appareil en bon état de fonctionnement. Les unités intérieure et extérieure sont bien entretenues, les lignes réfrigérantes sont isolées et l'appareil démarrait normalement lors du test. Aucune intervention n'est requise dans l'immédiat.",
    },

    // ─────────────────────────────────────────────────────────────────────────────
    // INTÉRIEUR
    // ─────────────────────────────────────────────────────────────────────────────

    {
      id: 'pn-int-nc-moisissure-visible',
      sectionIds: ['aibq-v-viii', 'bnq-12-6'],
      status: 'non-conforme',
      title: "Moisissures visibles — problème de qualité de l'air",
      text: "Des moisissures visibles ont été observées sur les parois intérieures, notamment dans la salle de bain, la cuisine ou les espaces confinés. La présence de moisissures indique une source d'humidité persistante et représente un risque potentiel pour la santé des occupants, particulièrement pour les personnes sensibles ou immunodéprimées. L'identification et la correction de la source d'humidité, suivies d'une décontamination par un professionnel, sont requises.",
    },
    {
      id: 'pn-int-nc-plancher-affaisse',
      sectionIds: ['aibq-v-viii', 'bnq-12-6'],
      status: 'non-conforme',
      title: 'Plancher affaissé — anomalie structurale',
      text: "L'inspection révèle un affaissement notable du plancher dans une ou plusieurs zones, perceptible visuellement et à la marche. Cette condition peut indiquer une défaillance des éléments porteurs sous-jacents, une dégradation du sous-plancher ou un mouvement des fondations. Une investigation de la cause sous-jacente et une évaluation structurale sont requises avant toute correction.",
    },
    {
      id: 'pn-int-nc-porte-coinced',
      sectionIds: ['aibq-v-viii', 'bnq-12-6'],
      status: 'non-conforme',
      title: 'Portes coincées — mouvement de structure ou humidité',
      text: "Plusieurs portes intérieures ne fonctionnent pas correctement, présentant des difficultés d'ouverture, de fermeture ou de verrouillage. La disposition et le motif des portes touchées suggèrent un mouvement de structure ou une humidité excessive plutôt qu'une simple déformation des cadres. Une évaluation de la cause sous-jacente par un professionnel compétent est recommandée.",
    },
    {
      id: 'pn-int-nc-plafond-infiltration',
      sectionIds: ['aibq-v-viii', 'bnq-12-6'],
      status: 'non-conforme',
      title: "Taches d'infiltration au plafond — source active",
      text: "Des taches d'humidité et des zones de délaminage sont observées au plafond de plusieurs pièces. Ces marques indiquent des épisodes d'infiltration d'eau, dont la source doit être identifiée et corrigée. Les taches récentes ou progressives suggèrent une infiltration active, ce qui nécessite une investigation urgente pour prévenir des dommages structuraux et le développement de moisissures.",
    },
    {
      id: 'pn-int-ac-revetement-use',
      sectionIds: ['aibq-v-viii', 'bnq-12-6'],
      status: 'a-corriger',
      title: 'Revêtements intérieurs — usure normale à prévoir',
      text: "Les revêtements de sol et de mur présentent des signes d'usure normaux pour l'âge du bâtiment. Quelques sections montrent des écaillages ou des fissures superficielles qui ne compromettent pas l'intégrité de l'enveloppe mais méritent une attention lors d'une prochaine rénovation. Aucune action corrective urgente n'est requise.",
    },
    {
      id: 'pn-int-ac-escalier-rampe',
      sectionIds: ['aibq-v-viii', 'bnq-12-6'],
      status: 'a-corriger',
      title: "Rampe d'escalier instable — sécurité à améliorer",
      text: "La rampe ou la main courante de l'escalier intérieur présente un jeu notable et n'est pas solidement fixée à la structure. Bien qu'une chute ne soit pas imminente, cette condition représente un risque de sécurité, particulièrement pour les personnes âgées et les enfants. Le renforcement ou le remplacement des fixations de la rampe est recommandé.",
    },
    {
      id: 'pn-int-c-1',
      sectionIds: ['aibq-v-viii', 'bnq-12-6'],
      status: 'conforme',
      title: 'Intérieur — état général satisfaisant',
      text: "L'inspection des espaces intérieurs ne révèle aucune anomalie significative affectant l'intégrité de la structure ou l'habitabilité du bâtiment. Les revêtements sont en état correct, les ouvrants fonctionnent normalement et aucune trace d'infiltration active n'a été observée. L'état intérieur est jugé satisfaisant.",
    },
    {
      id: 'pn-int-c-2',
      sectionIds: ['aibq-v-viii', 'bnq-12-6'],
      status: 'conforme',
      title: 'Intérieur rénové — finitions récentes, bon état',
      text: "L'intérieur du bâtiment a fait l'objet de rénovations récentes qui ont substantiellement amélioré l'état des finitions. Les murs, plafonds et planchers sont en bon état et aucune infiltration ni déformation n'a été observée. Aucune intervention n'est requise dans l'immédiat.",
    },

    // ─────────────────────────────────────────────────────────────────────────────
    // ISOLATION / COMBLES
    // ─────────────────────────────────────────────────────────────────────────────

    {
      id: 'pn-isol-nc-isolation-nulle',
      sectionIds: ['aibq-v-ix', 'bnq-12-7'],
      status: 'non-conforme',
      title: 'Isolation absente dans les combles — pertes thermiques majeures',
      text: "L'inspection du comble révèle une isolation absente ou vestigiale, ce qui entraîne des pertes thermiques importantes à travers la toiture. Cette condition génère une surconsommation d'énergie significative et peut favoriser la formation de glace en bordure de toit en hiver. L'installation d'une isolation adéquate dans le comble est fortement recommandée.",
    },
    {
      id: 'pn-isol-nc-pare-vapeur-manquant',
      sectionIds: ['aibq-v-ix', 'bnq-12-7'],
      status: 'non-conforme',
      title: "Pare-vapeur absent — condensation dans l'isolant",
      text: "Il a été observé que l'installation d'isolation dans les combles ou les murs est réalisée sans pare-vapeur adéquat du côté chaud. En l'absence de cette barrière, la vapeur d'eau migre dans l'isolant et se condense au contact des surfaces froides, réduisant l'efficacité de l'isolation et favorisant la pourriture des éléments de bois. L'installation d'un pare-vapeur conforme est recommandée lors de toute rénovation thermique.",
    },
    {
      id: 'pn-isol-nc-isolation-endommagee',
      sectionIds: ['aibq-v-ix', 'bnq-12-7'],
      status: 'non-conforme',
      title: 'Isolant endommagé — performances insuffisantes',
      text: "L'isolant thermique dans le comble présente des zones de tassement, d'humidité ou d'infestation qui réduisent significativement ses performances. Un isolant mouillé ou comprimé perd une grande partie de sa valeur isolante. Un remplacement de l'isolant endommagé, après correction de la cause d'humidité, est requis.",
    },
    {
      id: 'pn-isol-ac-isolation-insuffisante',
      sectionIds: ['aibq-v-ix', 'bnq-12-7'],
      status: 'a-corriger',
      title: 'Isolation insuffisante — rehaussement recommandé',
      text: "L'épaisseur d'isolation dans le comble est inférieure aux valeurs recommandées pour le climat de la région. Bien qu'une isolation soit présente, ses performances thermiques sont limitées. L'ajout d'une couche d'isolant en soufflage ou en panneau est recommandé afin d'améliorer l'efficacité énergétique du bâtiment et de réduire les coûts de chauffage.",
    },
    {
      id: 'pn-isol-ac-ponts-thermiques',
      sectionIds: ['aibq-v-ix', 'bnq-12-7'],
      status: 'a-corriger',
      title: 'Ponts thermiques identifiés — zones de déperdition',
      text: "Des ponts thermiques ont été identifiés aux jonctions de la structure, notamment aux sablières et aux murs pignons. Ces zones de déperdition localisée réduisent l'efficacité globale de l'enveloppe thermique. L'ajout d'un isolant rigide ou d'un coupe-froid à ces emplacements est recommandé lors d'une prochaine rénovation.",
    },
    {
      id: 'pn-isol-c-1',
      sectionIds: ['aibq-v-ix', 'bnq-12-7'],
      status: 'conforme',
      title: 'Isolation — épaisseur adéquate, bon état',
      text: "L'inspection du comble révèle une isolation en bon état, d'épaisseur adéquate et uniformément répartie. L'isolant est sec, exempt de signes d'infestation et correctement installé. La performance thermique de la toiture est jugée satisfaisante.",
    },

    // ─────────────────────────────────────────────────────────────────────────────
    // VENTILATION
    // ─────────────────────────────────────────────────────────────────────────────

    {
      id: 'pn-vent-nc-vmr-absente',
      sectionIds: ['aibq-v-x'],
      status: 'non-conforme',
      title: 'Ventilation mécanique contrôlée absente',
      text: "Aucun système de ventilation mécanique contrôlée n'a été identifié dans le bâtiment. En l'absence de ce système, le renouvellement de l'air intérieur dépend uniquement des infiltrations et de l'ouverture des fenêtres, ce qui est insuffisant pour maintenir une qualité d'air intérieure acceptable dans un bâtiment bien isolé. L'installation d'un système de ventilation adapté est recommandée.",
    },
    {
      id: 'pn-vent-nc-hotte-recirculation',
      sectionIds: ['aibq-v-x'],
      status: 'non-conforme',
      title: 'Hotte de cuisine en recirculation — évacuation absente',
      text: "La hotte de cuisine fonctionne en mode recirculation et n'est pas raccordée à un conduit d'évacuation vers l'extérieur. Cette configuration ne permet pas d'évacuer l'humidité et les contaminants générés par la cuisson, contribuant à leur accumulation dans l'air intérieur. L'installation d'un conduit d'évacuation extérieure est recommandée.",
    },
    {
      id: 'pn-vent-nc-salle-bain-non-evacuee',
      sectionIds: ['aibq-v-x'],
      status: 'non-conforme',
      title: 'Ventilation salle de bain évacuant dans le comble',
      text: "Il a été observé que le conduit d'extraction de la salle de bain est raccordé dans l'espace de comble plutôt que d'être évacué vers l'extérieur. Cette installation introduit une importante charge d'humidité dans le comble, favorisant la condensation sur la charpente et le développement de moisissures. La prolongation du conduit jusqu'à l'extérieur est requise.",
    },
    {
      id: 'pn-vent-ac-echangeur-entretien',
      sectionIds: ['aibq-v-x'],
      status: 'a-corriger',
      title: 'Échangeur de chaleur — entretien requis',
      text: "L'échangeur de chaleur ou le ventilateur récupérateur d'énergie présent dans le bâtiment ne présente pas de défaillance visible mais semble ne pas avoir été entretenu depuis plusieurs années. Un nettoyage des filtres, des plaques d'échange et des conduits est recommandé afin de maintenir les performances du système et la qualité de l'air intérieur.",
    },
    {
      id: 'pn-vent-ac-humidite-elevee',
      sectionIds: ['aibq-v-x'],
      status: 'a-corriger',
      title: 'Humidité relative élevée — risque de condensation',
      text: "Le taux d'humidité relative mesuré à l'intérieur du bâtiment est élevé par rapport aux conditions extérieures, pouvant indiquer une ventilation insuffisante ou des sources d'humidité non maîtrisées. Une humidité excessive favorise la condensation sur les vitrages et les surfaces froides, et peut à terme favoriser le développement de moisissures. Une vérification du système de ventilation et des sources d'humidité est recommandée.",
    },
    {
      id: 'pn-vent-c-1',
      sectionIds: ['aibq-v-x'],
      status: 'conforme',
      title: 'Ventilation — système fonctionnel et adéquat',
      text: "L'inspection du système de ventilation ne révèle aucune anomalie notable. Les extracteurs de salle de bain et la hotte de cuisine sont évacués vers l'extérieur. Le système de ventilation mécanique contrôlée fonctionne normalement. La qualité de ventilation est jugée satisfaisante.",
    },

    // ─────────────────────────────────────────────────────────────────────────────
    // SÉCURITÉ
    // ─────────────────────────────────────────────────────────────────────────────

    {
      id: 'pn-secu-nc-detecteur-fumee-absent',
      sectionIds: ['aibq-v-xi', 'bnq-12-8'],
      status: 'non-conforme',
      title: 'Détecteurs de fumée absents ou hors service',
      text: "L'inspection révèle l'absence de détecteurs de fumée dans les zones requises du bâtiment, ou des appareils présents mais défaillants (batterie absente, dispositif déconnecté). La présence de détecteurs de fumée fonctionnels dans chaque niveau du bâtiment et dans ou à proximité des chambres à coucher est une exigence de sécurité fondamentale. L'installation ou le remplacement de détecteurs de fumée est requis immédiatement.",
    },
    {
      id: 'pn-secu-nc-detecteur-co-absent',
      sectionIds: ['aibq-v-xi', 'bnq-12-8'],
      status: 'non-conforme',
      title: 'Détecteur de monoxyde de carbone absent',
      text: "Aucun détecteur de monoxyde de carbone fonctionnel n'a été identifié dans le bâtiment, bien que celui-ci soit équipé d'appareils à combustion. En l'absence de ce détecteur, une fuite de CO peut passer inaperçue avec des conséquences potentiellement mortelles. L'installation d'un ou plusieurs détecteurs de CO certifiés, à proximité des chambres à coucher, est requise.",
    },
    {
      id: 'pn-secu-nc-garde-corps-defaillant',
      sectionIds: ['aibq-v-xi', 'bnq-12-8'],
      status: 'non-conforme',
      title: 'Garde-corps insuffisant — risque de chute',
      text: "Le garde-corps protégeant un escalier, un balcon ou une mezzanine présente une hauteur insuffisante, des barreaux espacés de façon excessive, ou il est instable. Cette condition représente un risque de chute grave, particulièrement pour les enfants. La mise en conformité du garde-corps en matière de hauteur, d'espacement et de fixation est requise.",
    },
    {
      id: 'pn-secu-nc-marche-escalier-dangereuse',
      sectionIds: ['aibq-v-xi', 'bnq-12-8'],
      status: 'non-conforme',
      title: 'Escalier non conforme — risque de chute',
      text: "L'escalier présente des irrégularités de hauteur ou de profondeur des marches, une largeur insuffisante ou une main courante inadéquate. Ces conditions augmentent significativement le risque de chute, particulièrement pour les personnes âgées, les enfants et les visiteurs non familiers avec l'espace. Des travaux de mise en conformité sont recommandés.",
    },
    {
      id: 'pn-secu-nc-panneau-electrique-accessible',
      sectionIds: ['aibq-v-xi', 'bnq-12-8'],
      status: 'non-conforme',
      title: 'Panneau électrique obstrué ou non accessible',
      text: "Le panneau de distribution électrique est obstrué par un meuble, du rangement ou un autre obstacle qui empêche un accès libre et immédiat en cas d'urgence. Un dégagement de 1 m minimum devant le panneau est requis pour permettre une intervention sécuritaire. La libération de l'espace devant le panneau est requise.",
    },
    {
      id: 'pn-secu-ac-extincteur-absent',
      sectionIds: ['aibq-v-xi', 'bnq-12-8'],
      status: 'a-corriger',
      title: 'Extincteur portatif recommandé',
      text: "Aucun extincteur portatif n'a été observé dans le bâtiment, notamment à proximité de la cuisine. Bien qu'il ne s'agisse pas d'une exigence réglementaire dans toutes les configurations résidentielles, la présence d'un extincteur à poudre ou à base d'eau dans la cuisine et dans l'espace mécanique constitue une mesure de sécurité recommandée.",
    },
    {
      id: 'pn-secu-ac-eclairage-urgence',
      sectionIds: ['aibq-v-xi', 'bnq-12-8'],
      status: 'a-corriger',
      title: "Éclairage des voies d'évacuation — amélioration suggérée",
      text: "L'éclairage des voies d'évacuation, notamment l'escalier principal et les issues, est insuffisant pour permettre une évacuation sécuritaire en cas de panne de courant. L'ajout de veilleuses avec batterie de secours ou d'appareils d'éclairage d'urgence dans ces zones est recommandé.",
    },
    {
      id: 'pn-secu-c-1',
      sectionIds: ['aibq-v-xi', 'bnq-12-8'],
      status: 'conforme',
      title: 'Sécurité — dispositifs présents et fonctionnels',
      text: "L'inspection des dispositifs de sécurité révèle la présence de détecteurs de fumée fonctionnels à chaque niveau, d'un détecteur de monoxyde de carbone et de garde-corps en bon état. Les voies d'évacuation sont dégagées et accessibles. L'état général des éléments de sécurité inspecté est satisfaisant.",
    },

    // ─────────────────────────────────────────────────────────────────────────────
    // MATIÈRES DANGEREUSES
    // ─────────────────────────────────────────────────────────────────────────────

    {
      id: 'pn-matdan-nc-amiante-suspect',
      sectionIds: ['aibq-matieres-dan', 'bnq-matieres-dan'],
      status: 'non-conforme',
      title: "Matériaux suspects contenant de l'amiante",
      text: "Il a été identifié lors de l'inspection la présence de matériaux susceptibles de contenir de l'amiante, notamment des dalles de vinyle-amiante, un revêtement d'isolation de tuyauterie ou un revêtement de toiture de type chrysotile. La manipulation ou la perturbation de ces matériaux sans précaution représente un risque pour la santé. Une analyse par un laboratoire accrédité est recommandée avant tout travaux dans les zones concernées.",
    },
    {
      id: 'pn-matdan-nc-peinture-plomb',
      sectionIds: ['aibq-matieres-dan', 'bnq-matieres-dan'],
      status: 'non-conforme',
      title: 'Peinture au plomb probable — bâtiment ancien',
      text: "Le bâtiment étant construit avant 1980, il est probable que des couches de peinture au plomb soient présentes sous les couches de peinture actuelles, particulièrement sur les boiseries et les surfaces d'impact. La présence de peinture écaillée ou de poussière dans ces zones représente un risque d'intoxication, particulièrement pour les jeunes enfants. Des précautions particulières doivent être observées lors de tout travaux générant de la poussière ou des débris de peinture.",
    },
    {
      id: 'pn-matdan-nc-huile-chauffage-reservoir',
      sectionIds: ['aibq-matieres-dan', 'bnq-matieres-dan'],
      status: 'non-conforme',
      title: 'Réservoir à mazout — contamination potentielle',
      text: "Un réservoir à mazout (ancienne ou actuelle installation) a été identifié sur la propriété. La présence de ce type de réservoir, qu'il soit hors sol ou enterré, représente un risque de contamination du sol et des eaux souterraines en cas de fuite passée ou future. Une investigation de l'état du réservoir et du sol environnant par un spécialiste en environnement est recommandée.",
    },
    {
      id: 'pn-matdan-nc-moisissure-etendue',
      sectionIds: ['aibq-matieres-dan', 'bnq-matieres-dan'],
      status: 'non-conforme',
      title: 'Contamination fongique étendue — décontamination requise',
      text: "Une contamination fongique étendue a été observée dans le bâtiment, affectant des surfaces supérieures à environ 1 m². Cette condition nécessite une intervention de décontamination par un professionnel qualifié suivant un protocole approprié. La source d'humidité doit être corrigée préalablement et de façon permanente avant d'entreprendre les travaux d'assainissement.",
    },
    {
      id: 'pn-matdan-ac-uree-formaldehyde',
      sectionIds: ['aibq-matieres-dan', 'bnq-matieres-dan'],
      status: 'a-corriger',
      title: "Isolant d'urée-formaldéhyde possible — vérification recommandée",
      text: "Le bâtiment est construit à une époque où l'isolant d'urée-formaldéhyde (ICUF) a pu être utilisé dans les cavités de murs. Bien qu'aucune odeur caractéristique ni confirmation visuelle n'ait été possible lors de l'inspection, une vérification par prélèvement de cavité murale peut être envisagée si les occupants manifestent des problèmes respiratoires inexpliqués.",
    },
    {
      id: 'pn-matdan-ac-radon-recommandation',
      sectionIds: ['aibq-matieres-dan', 'bnq-matieres-dan'],
      status: 'a-corriger',
      title: 'Radon — test recommandé',
      text: "La propriété est située dans une zone où la présence de radon dans les sous-sols est possible selon les données géologiques régionales. Bien que la détection du radon soit hors de la portée de l'inspection visuelle, un test de radon à long terme est recommandé. Si la concentration dépasse 200 Bq/m³, des mesures de mitigation sont disponibles et efficaces.",
    },
    {
      id: 'pn-matdan-c-1',
      sectionIds: ['aibq-matieres-dan', 'bnq-matieres-dan'],
      status: 'conforme',
      title: "Aucun matériau dangereux identifié — limites d'inspection",
      text: "Aucun matériau dangereux évident n'a été identifié lors de l'inspection visuelle dans les zones accessibles. Cette évaluation se limite à ce qui est observable à l'oeil nu et ne remplace pas une analyse en laboratoire. Pour un bâtiment de plus de 30 ans, des tests spécifiques peuvent être envisagés si des travaux de rénovation sont planifiés.",
    },

    // ─────────────────────────────────────────────────────────────────────────────
    // NARRATIFS SUPPLÉMENTAIRES
    // ─────────────────────────────────────────────────────────────────────────────

    {
      id: 'pn-fond-nc-humidite-mur-bloc',
      sectionIds: ['walk-fondations', 'bnq-w-fondations', 'bat-fondations'],
      status: 'non-conforme',
      title: 'Bloc de béton saturé — porosité structurelle',
      text: "L'inspection révèle que les blocs de béton constituant le mur de fondation présentent une saturation en eau visible, avec des suintements actifs à travers les parois. Les fondations en blocs de béton non traités sont particulièrement sujettes à ce type d'infiltration en raison de la porosité inhérente au matériau. Une imperméabilisation extérieure et l'installation d'un drain de pied de mur sont recommandés pour corriger cette condition.",
    },
    {
      id: 'pn-toiture-nc-bardeau-manquant',
      sectionIds: ['walk-toiture', 'bnq-w-toiture', 'bat-toiture'],
      status: 'non-conforme',
      title: "Bardeaux manquants — zones d'infiltration directe",
      text: "Plusieurs bardeaux sont absents ou arrachés sur la surface de couverture, exposant le papier feutre ou le pontage directement aux intempéries. Ces ouvertures constituent des points d'infiltration directe lors de chaque précipitation. Des correctifs immédiats sont requis pour prévenir des dommages progressifs à la charpente et aux finitions intérieures.",
    },
    {
      id: 'pn-elec-int-nc-boite-junction-ouverte',
      sectionIds: ['aibq-v-v', 'bnq-12-4'],
      status: 'non-conforme',
      title: 'Boîte de jonction accessible non couverte',
      text: "Il a été observé que des boîtes de jonction électrique sont dépourvues de leur couvercle, exposant les conducteurs et les raccords. Cette situation représente un risque de contact accidentel avec des pièces sous tension et un risque d'arc électrique. L'installation immédiate de couvercles appropriés sur toutes les boîtes de jonction est requise.",
    },
    {
      id: 'pn-chauf-nc-thermostat-defaillant',
      sectionIds: ['aibq-v-vi', 'bnq-12-5'],
      status: 'non-conforme',
      title: 'Thermostat défaillant — contrôle de chauffe impossible',
      text: "Le thermostat de contrôle du système de chauffage ne fonctionne pas correctement, soit en ne répondant pas aux commandes, soit en maintenant le système en fonctionnement continu ou éteint sans régulation. Cette défaillance entraîne un inconfort thermique et une surconsommation d'énergie. Le remplacement du thermostat par un modèle compatible est recommandé.",
    },
    {
      id: 'pn-plomb-int-nc-siphon-absent',
      sectionIds: ['aibq-v-iv', 'bnq-12-3'],
      status: 'non-conforme',
      title: "Siphon absent ou défaillant — odeurs de gaz d'égout",
      text: "Il a été observé que certaines évacuations sont dépourvues de siphon ou que le siphon en place est défaillant, permettant aux gaz d'égout de remonter dans les espaces habitables. Les gaz d'égout contiennent des composés malodorants et potentiellement toxiques. L'installation ou le remplacement des siphons défaillants est requis immédiatement.",
    },
    {
      id: 'pn-int-nc-soussol-humide',
      sectionIds: ['aibq-v-viii', 'bnq-12-6'],
      status: 'non-conforme',
      title: 'Sous-sol chroniquement humide — conditions insalubres',
      text: "Le sous-sol présente des signes d'humidité chronique importants, notamment des efflorescences sur les murs, un plancher mouillé et une odeur de moisissure prononcée. Cette condition rend l'espace de sous-sol impropre à tout usage d'habitation ou d'entreposage de matériaux sensibles à l'humidité. Une investigation de la source d'humidité et la mise en place d'un système de drainage intérieur ou extérieur sont recommandées.",
    },
    {
      id: 'pn-facades-nc-coin-pourri',
      sectionIds: ['walk-facades', 'bnq-w-facades', 'bat-facades'],
      status: 'non-conforme',
      title: 'Coin de mur dégradé — jonction en décomposition',
      text: "La jonction d'angle entre deux façades présente une dégradation avancée des matériaux, avec une pourriture visible du revêtement et des éléments de structure adjacents. Cette zone est particulièrement vulnérable aux infiltrations en raison de sa géométrie et de l'accumulation d'eau à cet endroit. Le remplacement des matériaux endommagés et la pose d'un calfeutrage d'angle renforcé sont requis.",
    },
    {
      id: 'pn-vent-nc-ventilateur-sdb-brise',
      sectionIds: ['aibq-v-x'],
      status: 'non-conforme',
      title: 'Ventilateur de salle de bain hors service',
      text: "Le ventilateur d'extraction de la salle de bain est hors service ou fonctionne avec un débit insuffisant pour évacuer l'humidité générée par les usages quotidiens. Sans extraction adéquate, l'humidité s'accumule sur les surfaces, favorisant la croissance de moisissures et la dégradation des matériaux. Le remplacement ou la réparation du ventilateur est requis.",
    },

  ];

  /**
   * Filtre les narratifs professionnels selon le statut, la section et une requête textuelle.
   * @param {string|null} status   - 'conforme' | 'non-conforme' | 'a-corriger' | null pour tous
   * @param {string|null} sectionId - ID de section | null pour toutes
   * @param {string}      query    - Texte de recherche libre (optionnel)
   * @returns {Array}              - Narratifs correspondants
   */
  function getNarratives(status, sectionId, query = '') {
    let results = PROFESSIONAL_NARRATIVES;
    if (status) results = results.filter((n) => n.status === status);
    if (sectionId) results = results.filter((n) => n.sectionIds.includes(sectionId));
    if (query && query.trim()) {
      const q = query.trim().toLowerCase();
      results = results.filter(
        (n) => n.title.toLowerCase().includes(q) || n.text.toLowerCase().includes(q),
      );
    }
    return results;
  }

  function renderQuickResponsesBlock(item, si, subIndex, ii, contextId) {
    normalizeChecklistItem(item);
    const coords = itemCoords(si, subIndex, ii);
    const selected = new Set(item.selectedPresets || []);
    const status = item.status;
    const presets = getPresetsForStatus(status, contextId);
    const chips = status ? presets.map(
      (p) => `<button type="button" class="preset-chip ${selected.has(p.id) ? "is-selected" : ""}" data-preset="${p.id}" ${coords} title="Ajouter ou retirer">${escapeHtml2(p.label)}</button>`
    ).join("") : `<p class="preset-hint preset-hint--step">\u2460 Touchez d'abord <strong>C</strong>, <strong>NC</strong>, <strong>AC</strong> ou <strong>N/A</strong> ci-dessus \u2014 les pastilles apparaissent ici.</p>`;
    return `
    <div class="check-item__presets">
      <span class="check-item__presets-label">R\xE9ponses rapides</span>
      <div class="preset-chips" role="group" aria-label="R\xE9ponses pr\xE9d\xE9finies">${chips}</div>
      <label class="check-item__comment-label" style="display:flex;align-items:center;gap:0.5rem;"><span>Commentaire inspecteur</span><button type="button" class="btn btn--ghost btn--sm narratives-trigger" data-open-narratives data-si="${si}" data-sub="${subIndex}" data-ii="${ii}" data-section-id="${escapeHtml2(contextId || '')}" data-status="${escapeHtml2(item.status || '')}">&#x1F4CB; Narratifs</button></label>
      <textarea class="input check-item__inspector-comment" placeholder="Vos observations, mesures, r\xE9f\xE9rences d'articles\u2026" data-inspector-comment ${coords} rows="2">${escapeHtml2(item.inspectorComment)}</textarea>
    </div>`;
  }
  function renderChecklistItem(item, si, subIndex, ii, filter, sec, subId) {
    if (!itemMatchesFilter(item, filter)) return "";
    normalizeChecklistItem(item);
    const coords = itemCoords(si, subIndex, ii);
    const contextId = subId || sec?.id;
    if (sec && isInfoSection(sec.id)) {
      return `
      <article class="check-item check-item--info" ${coords}>
        <p class="check-item__label check-item__label--info">
          <svg class="check-item__info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          ${escapeHtml2(stripNumbering(item.label))}
        </p>
      </article>`;
    }
    const statusBtns = STATUS_OPTIONS.map(
      (s) => `<button type="button" class="status-btn status-btn--${s.value} ${item.status === s.value ? "is-selected" : ""}" data-status="${s.value}" ${coords} title="${s.label}">${s.short}</button>`
    ).join("");
    const priority = PRIORITY_OPTIONS.map(
      (p) => `<option value="${p.value}" ${item.priority === p.value ? "selected" : ""}>${p.label}</option>`
    ).join("");
    const photos = item.photos?.length > 0 ? `<div class="photo-strip">${item.photos.map(
      (p, pi) => `<figure class="photo-thumb">
                 <img src="${p}" alt="" />
                 <div class="photo-thumb__actions">
                   <button type="button" class="btn-photo-action" title="Analyser avec l'IA" data-ai-photo ${coords} data-pi="${pi}">\u{1F916}</button>
                   <button type="button" class="btn-photo-action" title="Dessiner / \xC9diter" data-edit-photo ${coords} data-pi="${pi}">\u270F\uFE0F</button>
                   <button type="button" class="btn-photo-action photo-thumb__del" title="Supprimer" data-del-photo ${coords} data-pi="${pi}">\xD7</button>
                 </div>
               </figure>`
    ).join("")}</div>` : "";
    return `
    <article class="check-item ${item.status ? `check-item--${item.status}` : ""}" ${coords}>
      <p class="check-item__label">${escapeHtml2(stripNumbering(item.label))}</p>
      <div class="check-item__status">${statusBtns}</div>
      <div class="check-item__extra">
        <select class="input input--sm" data-priority ${coords} ${!item.status || item.status === "conforme" || item.status === "na" ? "disabled" : ""}>
          <option value="">Priorit\xE9</option>${priority}
        </select>
        <label class="btn btn--sm btn--ghost photo-btn">
          \u{1F4F7} Photo
          <input type="file" accept="image/*" hidden data-photo ${coords} />
        </label>
      </div>
      ${renderQuickResponsesBlock(item, si, subIndex, ii, contextId)}
      ${photos}
    </article>`;
  }
  var SECTION_MATERIAL_OPTIONS = (() => {
    const m = {
      "walk-toiture": { label: "Type de rev\xEAtement de toiture", options: ["Bardeau d'asphalte (3 tabs)", "Bardeau d'asphalte (architectural / dimensionnel)", "M\xE9tal â€” acier ou aluminium", "Ardoise naturelle", "Tuile b\xE9ton ou terre cuite", "Cuivre", "Bardeau de c\xE8dre / bois", "EPDM (toit plat â€” caoutchouc)", "TPO / PVC (toit plat â€” membrane)", "Gravier-bitume / asphalte (toit plat)", "Polyur\xE9thane gicl\xE9 (toit plat)", "Mixte ou inconnu"] },
      "walk-fondations": { label: "Type de fondation", options: ["B\xE9ton coul\xE9 monolithique", "Blocs de b\xE9ton", "Pierre naturelle (ma\xE7onnerie)", "Brique", "Dalle flottante (b\xE9ton sur terre)", "Poteaux viss\xE9s", "Bois trait\xE9 (crawl space)", "Mixte ou inconnu"] },
      "walk-facades": { label: "Type de rev\xEAtement ext\xE9rieur", options: ["Vinyle", "Aluminium", "Brique", "Pierre naturelle ou artificielle", "Stucco", "Bardeau de c\xE8dre", "B\xE9ton fibr\xE9 (Hardie Plank / Artisan)", "Bois", "Panneau composite (Trespa, etc.)", "Mixte ou inconnu"] },
      "walk-plomb-ext": { label: "Entr\xE9e d'eau principale", options: ["Cuivre", "PEX", "PVC / CPVC", "Acier galvanis\xE9", "Plomb (\xE0 signaler)", "Inconnu / non visible"] },
      "aibq-v-iv": { label: "Mat\xE9riaux tuyaux d'amen\xE9e", options: ["Cuivre", "PEX (rouge/bleu/blanc)", "PVC / CPVC", "Acier galvanis\xE9", "Plomb â€” \xE0 signaler imp\xE9rativement", "Polybutyl\xE8ne â€” Poly-B (gris) â€” \xE0 signaler", "Mixte", "Inconnu"] },
      "aibq-v-v": { label: "Amp\xE9rage panneau principal", options: ["60 A â€” mise \xE0 niveau recommand\xE9e", "100 A", "125 A", "150 A", "200 A", "Panneau \xE0 fusibles (100 A)", "Panneau \xE0 fusibles (60 A ou moins)", "Federal Pacific / Zinsco"] },
      "aibq-v-vi": { label: "Source de chauffage principale", options: ["\xC9lectrique â€” plinthes", "\xC9lectrique â€” convecteurs", "Gaz naturel â€” fournaise \xE0 air forc\xE9", "Gaz naturel â€” chaudi\xE8re \xE0 eau chaude", "Mazout â€” fournaise \xE0 air forc\xE9", "Mazout â€” chaudi\xE8re \xE0 eau chaude", "Propane", "Thermopompe centrale", "Bois / po\xEAle \xE0 bois", "Granules (pellets)", "Bi\xE9nergie", "G\xE9othermie", "Mixte"] },
      "aibq-v-vii": { label: "Syst\xE8me de climatisation", options: ["Thermopompe centrale (ducted)", "Thermopompe murale (mini-split)", "Climatiseur central", "Climatiseur de fen\xEAtre (portatif)", "Absent"] },
      "aibq-v-ix": { label: "Type d'isolation visible (combles)", options: ["Laine de verre souffl\xE9e", "Cellulose souffl\xE9e", "Polyur\xE9thane gicl\xE9 (SPF)", "Laine min\xE9rale (roche)", "Polystyr\xE8ne expans\xE9 (EPS â€” blanc)", "Polyisocyanurate (jaune / rose)", "Vermiculite (Zonolite) â€” potentiellement amiant\xE9", "FUUF â€” mousse ur\xE9e-formald\xE9hyde", "Fibre de verre en nattes", "Mixte ou inconnu"] },
      "aibq-v-viii": { label: "Rev\xEAtement de plancher principal", options: ["Bois franc", "Bois d'ing\xE9nierie", "Stratifi\xE9 (laminate)", "C\xE9ramique / porcelaine", "Vinyle (LVP / LVT)", "Tapis", "B\xE9ton poli ou peint", "Mixte"] }
    };
    const aliases = [["bnq-w-toiture","walk-toiture"],["bat-toiture","walk-toiture"],["bnq-w-fondations","walk-fondations"],["bat-fondations","walk-fondations"],["bnq-w-facades","walk-facades"],["bat-facades","walk-facades"],["bnq-w-plomb-ext","walk-plomb-ext"],["bat-plomb-ext","walk-plomb-ext"],["bnq-12-3","aibq-v-iv"],["bnq-12-4","aibq-v-v"],["bnq-12-5","aibq-v-vi"],["bnq-12-7","aibq-v-ix"],["bnq-12-6","aibq-v-viii"]];
    aliases.forEach(([k, v]) => { m[k] = m[v]; });
    return m;
  })();
  function renderSectionContent(sec, si, filter, inspection) {
    normalizeSection(sec);
    const groups = getSectionItemGroups(sec);
    if (!groups.length) {
      return '<p class="section-list__empty">Aucun point dans cette section.</p>';
    }
    const matDef = SECTION_MATERIAL_OPTIONS[sec.id];
    const selectedMat = inspection?.sectionMateriau?.[sec.id] || "";
    const materiauBlock = matDef ? `
      <div class="section-materiau">
        <label class="section-materiau__label">${escapeHtml2(matDef.label)}</label>
        <select class="input input--sm section-materiau__select" data-section-materiau="${si}" data-section-id="${escapeHtml2(sec.id)}">
          <option value="">â€” S\xE9lectionner â€”</option>
          ${matDef.options.map((o) => `<option value="${escapeHtml2(o)}" ${selectedMat === o ? "selected" : ""}>${escapeHtml2(o)}</option>`).join("")}
        </select>
        ${selectedMat ? `<span class="section-materiau__badge">${escapeHtml2(selectedMat)}</span>` : ""}
      </div>` : "";
    return materiauBlock + groups.map(({ subIndex, title, items, id }) => {
      const itemsHtml = items.map((item, ii) => renderChecklistItem(item, si, subIndex, ii, filter, sec, id)).join("");
      if (!itemsHtml.trim()) return "";
      if (subIndex >= 0 && title) {
        const subProg = itemsProgress(items);
        return `
          <div class="check-subsection" id="subsection-${id || `${sec.id}-${subIndex}`}">
            <div class="check-subsection__head">
              <h4 class="check-subsection__title">${escapeHtml2(title)}</h4>
              <span class="check-subsection__progress">${subProg.answered}/${subProg.total} \xB7 ${subProg.pct}%</span>
              <button type="button" class="btn btn--ghost btn--sm" data-section-na-sub="${si}" data-sub="${subIndex}">Tout N/A</button>
            </div>
            ${itemsHtml}
          </div>`;
      }
      return itemsHtml;
    }).join("");
  }
  function sectionListRows(i, activeSi) {
    return i.sections.map((sec, si) => {
      normalizeSection(sec);
      const prog = sectionProgress(sec);
      const st = sectionStats(sec);
      const state = sectionListStatus(prog, st);
      const subs = subsectionCount(sec);
      const meta = [
        subs > 0 ? `${subs} sous-s.` : "",
        `${prog.pct}%`,
        st.pending ? `${st.pending} \xE0 faire` : "",
        st.nc ? `${st.nc} NC` : ""
      ].filter(Boolean).join(" \xB7 ");
      const active = activeSi === si ? " section-list__item--active" : "";
      const stateIcon = state === "done"
        ? `<span class="section-list__icon section-list__icon--done" aria-label="Compl\xE8te">✓</span>`
        : state === "warn"
        ? `<span class="section-list__icon section-list__icon--warn" aria-label="D\xE9fauts">●</span>`
        : "";
      return `
        <li class="section-list__item section-list__item--${state}${active}">
          <button type="button" class="section-list__btn ${activeSi === si ? "section-list__btn--active" : ""}" data-open-section="${si}" aria-current="${activeSi === si ? "true" : "false"}">
            <span class="section-list__num" aria-hidden="true">${si + 1}.</span>
            <span class="section-list__body">
              <span class="section-list__title">${escapeHtml2(stripNumbering(sec.title))}</span>
            </span>
            ${stateIcon}
          </button>
        </li>`;
    }).join("");
  }
  function renderSectionListRail(i, route2) {
    const activeSi = route2.checklistView === "section" && route2.checklistSection != null && !Number.isNaN(+route2.checklistSection) ? +route2.checklistSection : null;
    return `
    <div class="section-list-header section-list-header--rail">
      <h3 class="section-list-header__title" style="margin-bottom: 1rem; font-size: 1.1rem;">Sections</h3>
    </div>
    <ol class="section-list section-list--rail" aria-label="Sections de la checklist" style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.25rem;">
      ${sectionListRows(i, activeSi)}
    </ol>`;
  }
  function renderSectionDetailPane(i, si, filter) {
    const sec = i.sections[si];
    normalizeSection(sec);
    const prog = sectionProgress(sec);
    const totalSections = i.sections.length;
    const content = renderSectionContent(sec, si, filter, i);
    const empty = !content.trim() || content.includes("section-list__empty") ? `<p class="section-list__empty">Aucun point ne correspond au filtre dans cette section.</p>` : content;
    const subsHint = sectionHasSubsections(sec) ? `<p class="section-subsections-hint">${subsectionCount(sec)} sous-section${subsectionCount(sec) > 1 ? "s" : ""} dans cette section</p>` : "";
    return `
    <div class="section-detail-nav">
      <div class="section-detail-nav__jump">
        <button type="button" class="btn btn--ghost btn--sm" data-goto-section="${si - 1}" ${si <= 0 ? "disabled" : ""}>\u2039 Pr\xE9c.</button>
        <span class="section-detail-nav__pos">${si + 1} / ${totalSections}</span>
        <button type="button" class="btn btn--ghost btn--sm" data-goto-section="${si + 1}" ${si >= totalSections - 1 ? "disabled" : ""}>Suiv. \u203A</button>
      </div>
    </div>
    <section class="check-section check-section--solo" id="section-${sec.id}">
      <div class="check-section__head">
        <h3 class="check-section__title">
          <span class="check-section__index">${si + 1}/${totalSections}</span>
          ${escapeHtml2(stripNumbering(sec.title))}
          <span class="check-section__progress">${prog.pct}%</span>
        </h3>
        <button type="button" class="btn btn--ghost btn--sm" data-section-na="${si}">Tout N/A (section)</button>
      </div>
      ${subsHint}
      ${empty}
    </section>`;
  }
  function renderChecklistAllPane(i, filter) {
    const totalSections = i.sections.length;
    return `
    <div class="section-list-header section-list-header--pane">
      <p class="section-list-header__desc">Vue compl\xE8te \u2014 ${totalSections} sections</p>
    </div>
    ${i.sections.map((sec, si) => {
      normalizeSection(sec);
      const prog = sectionProgress(sec);
      const content = renderSectionContent(sec, si, filter, i);
      if (!content.trim() || content.includes("section-list__empty")) return "";
      return `
          <section class="check-section" id="section-${sec.id}">
            <div class="check-section__head">
              <h3 class="check-section__title">
                <span class="check-section__index">${si + 1}/${totalSections}</span>
                ${escapeHtml2(stripNumbering(sec.title))}
                <span class="check-section__progress">${prog.pct}%</span>
              </h3>
              <button type="button" class="btn btn--ghost btn--sm" data-open-section="${si}">Ouvrir</button>
              <button type="button" class="btn btn--ghost btn--sm" data-section-na="${si}">Tout N/A</button>
            </div>
            ${content}
          </section>`;
    }).join("")}`;
  }
  function renderChecklistMainPane(i, route2) {
    const filter = route2.checklistFilter || "all";
    const view = route2.checklistView || "section";
    const si = route2.checklistSection;
    if (view === "all") {
      return renderChecklistAllPane(i, filter);
    }
    if (view === "section" && si != null && i.sections[si]) {
      return renderSectionDetailPane(i, si, filter);
    }
    return `<div class="checklist-main-placeholder"><p>S\xE9lectionnez une section dans la liste \xE0 gauche pour commencer l'inspection.</p></div>`;
  }

  // js/organization.js
  var DEFAULT_LOGO_URL = "./assets/logo-full.png";
  var KZO_WORDMARK_URL = "./assets/kzo-inspect-logo.png";
  function getHeroLogoUrl(profile = {}) {
    const b = resolveBranding(profile);
    return b.logoIsCustom ? b.logoDataUrl : KZO_WORDMARK_URL;
  }
  var DEFAULT_BRANDING = {
    appName: "KZO Inspect",
    tagline: "Inspection de b\xE2timents au Qu\xE9bec",
    entreprise: "",
    logoDataUrl: null,
    footerText: "",
    ibcMention: "",
    receiptPrefix: "KZO"
  };
  function resolveBranding(profile = {}) {
    return {
      appName: (profile.brandingAppName || DEFAULT_BRANDING.appName).trim() || DEFAULT_BRANDING.appName,
      tagline: (profile.brandingTagline ?? DEFAULT_BRANDING.tagline).trim(),
      entreprise: (profile.brandingEntreprise || profile.entreprise || "").trim(),
      logoDataUrl: profile.brandingLogoDataUrl || DEFAULT_LOGO_URL,
      logoIsCustom: Boolean(profile.brandingLogoDataUrl),
      footerText: (profile.brandingFooter || "").trim(),
      ibcMention: (profile.brandingIbcMention || "").trim(),
      receiptPrefix: (profile.brandingReceiptPrefix || DEFAULT_BRANDING.receiptPrefix).trim() || "KZO"
    };
  }
  function escapeHtml3(str) {
    return String(str ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function logoInitials(branding) {
    const name = branding.entreprise || branding.appName || "KZO";
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 3).toUpperCase();
  }
  function orgLogoMarkup(branding, { className = "org-letterhead__logo" } = {}) {
    const src = safeImgSrc(branding.logoDataUrl) || DEFAULT_LOGO_URL;
    if (src) {
      return `<img class="${className} org-letterhead__logo--img" src="${src}" alt="${escapeHtml3(branding.appName)}" />`;
    }
    return `<span class="${className}" aria-hidden="true">${escapeHtml3(logoInitials(branding))}</span>`;
  }
  function orgLetterheadHtml(branding, options = {}) {
    const b = branding?.appName ? branding : resolveBranding(branding);
    const { compact = false } = options;
    const title = b.entreprise || b.appName;
    const subtitle = b.entreprise && b.appName !== b.entreprise ? b.appName : "";
    const tagline = b.tagline || "";
    return `
    <div class="org-letterhead ibc-letterhead ${compact ? "org-letterhead--compact" : ""}">
      <div class="org-letterhead__mark ibc-letterhead__mark">
        ${orgLogoMarkup(b)}
        <div>
          <p class="org-letterhead__title ibc-letterhead__network">${escapeHtml3(title)}</p>
          ${subtitle ? `<p class="org-letterhead__app ibc-letterhead__app">${escapeHtml3(subtitle)}</p>` : ""}
          ${tagline ? `<p class="org-letterhead__tagline ibc-letterhead__tagline">${escapeHtml3(tagline)}</p>` : ""}
          ${b.ibcMention ? `<p class="org-letterhead__ibc">${escapeHtml3(b.ibcMention)}</p>` : ""}
        </div>
      </div>
    </div>`;
  }
  function orgFooterHtml(branding) {
    const b = branding?.appName ? branding : resolveBranding(branding);
    const lines = [];
    if (b.footerText) lines.push(escapeHtml3(b.footerText));
    else {
      const who = b.entreprise || b.appName;
      lines.push(`<strong>${escapeHtml3(who)}</strong>`);
      if (b.tagline) lines.push(escapeHtml3(b.tagline));
    }
    if (b.ibcMention && !b.footerText?.includes(b.ibcMention)) {
      lines.push(escapeHtml3(b.ibcMention));
    }
    return `<footer class="org-footer ibc-footer">${lines.join("<br />")}</footer>`;
  }
  var ORG_LETTERHEAD_STYLES = `
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
  function applyTopBarBranding(profile = {}) {
    const b = resolveBranding(profile);
    const logoEl = document.querySelector(".top-bar__logo");
    const titleEl = document.querySelector(".top-bar__title");
    const subtitleEl = document.querySelector(".top-bar__subtitle");
    if (!logoEl || !titleEl || !subtitleEl) return;
    titleEl.textContent = b.appName;
    const subParts = [b.entreprise && b.entreprise !== b.appName ? b.entreprise : null, b.tagline, b.ibcMention].filter(Boolean);
    subtitleEl.textContent = subParts.join(" \xB7 ") || b.tagline || DEFAULT_BRANDING.tagline;
    const logoSrc = safeImgSrc(b.logoDataUrl) || DEFAULT_LOGO_URL;
    logoEl.innerHTML = `<img src="${logoSrc}" alt="${escapeHtml3(b.appName)}" class="top-bar__logo-img" width="48" height="48" decoding="async" />`;
    logoEl.classList.toggle("top-bar__logo--custom", Boolean(b.logoIsCustom));
    logoEl.classList.toggle("top-bar__logo--default", !b.logoIsCustom);
  }

  // js/cover-page.js
  function escapeHtml4(str) {
    return String(str ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function fullAddress(site) {
    const parts = [site.adresse, [site.ville, site.codePostal].filter(Boolean).join(" ")].filter(Boolean);
    return parts.join(", ") || "";
  }
  function buildCoverPageHtml(inspection, profile = {}) {
    const photo = safeImgSrc(inspection.coverPhotoDataUrl);
    if (!photo) return "";
    const branding = resolveBranding(profile);
    const client = inspection.site?.client || "";
    const addr = fullAddress(inspection.site);
    const visit = formatVisitDateTime(inspection);
    const caption = (inspection.coverPhotoCaption || "").trim();
    const inspector = inspection.inspector || {};
    const coverTitle = branding.entreprise || branding.appName;
    return `
  <section class="cover-page" aria-label="Page de couverture">
    <img class="cover-page__photo" src="${photo}" alt="Photo de la propri\xE9t\xE9 inspect\xE9e" />
    <div class="cover-page__shade"></div>
    <div class="cover-page__content">
      <div class="cover-page__brand">
        ${orgLogoMarkup(branding, { className: "cover-page__logo" })}
        <div class="cover-page__brand-text">
          <span class="cover-page__app">${escapeHtml4(coverTitle)}</span>
          ${branding.tagline ? `<span class="cover-page__tagline">${escapeHtml4(branding.tagline)}</span>` : ""}
          ${branding.ibcMention ? `<span class="cover-page__ibc">${escapeHtml4(branding.ibcMention)}</span>` : ""}
        </div>
      </div>
      <p class="cover-page__doctype">Rapport d'inspection</p>
      <h1 class="cover-page__title">${escapeHtml4(client || inspection.templateLabel || "Propri\xE9t\xE9 inspect\xE9e")}</h1>
      ${addr ? `<p class="cover-page__address">${escapeHtml4(addr)}</p>` : ""}
      ${inspection.site?.typeBatiment ? `<p class="cover-page__type">${escapeHtml4(inspection.site.typeBatiment)}</p>` : ""}
      <div class="cover-page__meta">
        ${visit !== "\u2014" ? `<span>${escapeHtml4(visit)}</span>` : ""}
        ${inspection.site?.numeroDossier ? `<span>Dossier ${escapeHtml4(inspection.site.numeroDossier)}</span>` : ""}
      </div>
      ${caption ? `<p class="cover-page__caption">${escapeHtml4(caption)}</p>` : ""}
      <p class="cover-page__inspector">
        ${escapeHtml4(inspector.nom || "")}${inspector.entreprise ? ` \xB7 ${escapeHtml4(inspector.entreprise)}` : ""}
      </p>
    </div>
  </section>`;
  }
  var COVER_PAGE_STYLES = `
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

  // js/report-summary.js
  function escapeHtml5(str) {
    return String(str ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  var PRIORITY_LABELS = {
    haute: "Priorit\xE9 haute",
    moyenne: "Priorit\xE9 moyenne",
    basse: "Priorit\xE9 basse"
  };
  function buildFindingsSummaryHtml(inspection) {
    const findings = collectFindings(inspection);
    if (!findings.length) {
      return `<h2>Synth\xE8se des constats importants</h2>
      <p class="findings-none">Aucun point non conforme ou \xE0 corriger relev\xE9 au moment du rapport.</p>`;
    }
    const rows = findings.map((f) => {
      const photos = f.photos.length > 0 ? `<div class="report-photos">${f.photos.map((p) => `<img src="${p}" alt="" class="report-photo" />`).join("")}</div>` : "";
      const pri = f.priority ? `<span class="report-priority">${escapeHtml5(PRIORITY_LABELS[f.priority] || f.priority)}</span>` : "";
      return `
        <tr class="report-row report-row--${escapeHtml5(f.status)}">
          <td>${escapeHtml5(f.sectionTitle)}</td>
          <td>${escapeHtml5(f.label)}</td>
          <td><span class="report-status">${escapeHtml5(statusLabel(f.status))}</span> ${pri}</td>
        </tr>
        ${f.note || f.inspectorComment || f.selectedPresets?.length || photos ? `<tr><td colspan="3">${f.inspectorComment ? `<p class="report-note"><strong>Commentaire :</strong> ${escapeHtml5(f.inspectorComment)}</p>` : f.note ? `<p class="report-note">${escapeHtml5(f.note)}</p>` : ""}${photos}</td></tr>` : ""}`;
    }).join("");
    return `
    <h2>Synth\xE8se des constats importants</h2>
    <p class="findings-intro">${findings.length} point${findings.length > 1 ? "s" : ""} non conforme${findings.length > 1 ? "s" : ""} ou \xE0 corriger \u2014 \xE0 traiter en priorit\xE9.</p>
    <table class="report-table findings-table">
      <thead><tr><th>Section</th><th>Point</th><th>R\xE9sultat</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
  }
  function buildLimitationsHtml(inspection) {
    const text = (inspection.limitations || "").trim();
    if (!text) return "";
    return `<h2>Limitations de l'inspection</h2>
    <p class="limitations-block">${escapeHtml5(text).replace(/\n/g, "<br />")}</p>`;
  }
  function buildExpertReferralsReportHtml(inspection) {
    const refs = inspection.expertReferrals || [];
    if (!refs.length) return "";
    const rows = refs.map(
      (r) => `<tr>
          <td>${escapeHtml5(expertTypeLabel(r.type))}</td>
          <td>${escapeHtml5(r.motif || "\u2014")}</td>
          <td>${r.urgent ? "Oui" : "Non"}</td>
        </tr>`
    ).join("");
    return `
    <h2>Recommandations d'experts (suivi)</h2>
    <p class="findings-intro">Selon les constats, consultation d'un sp\xE9cialiste recommand\xE9e (BNQ / bonne pratique).</p>
    <table class="report-table">
      <thead><tr><th>Sp\xE9cialiste</th><th>Motif</th><th>Urgent</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
  }
  var FINDINGS_REPORT_STYLES = `
  .findings-intro { font-size: 10pt; color: #444; margin: 0 0 12px; }
  .findings-none { color: #2e7d32; background: #e8f5e9; padding: 12px; border-radius: 8px; }
  .findings-table { margin-bottom: 24px; }
  .limitations-block { background: #f5f7fa; padding: 12px 14px; border-left: 4px solid #0d47a1; font-size: 10pt; }
  @media print {
    .findings-table { page-break-inside: auto; }
    h2 { page-break-after: avoid; }
  }
`;

  // js/norm-texts.js
  ﻿/** Pages normatives préliminaires du rapport (résumés professionnels). */

  function escapeHtml5(str) {
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
        `<p>Inspection selon la norme BNQ 3009-500 : <strong>${escapeHtml5(norm)}</strong>.</p>`,
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
      normPage('Cadre normatif', `<p>Inspection selon : <strong>${escapeHtml5(norm)}</strong>.</p>`, 'report-norms'),
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

  function countNormPages(norm) {
    return resolveNormPageList(norm).length;
  }

  function getNormPagesHtml(norm) {
    return resolveNormPageList(norm).join('') + `
      <div class="no-print" style="margin:12px;padding:12px;background:#fff3cd;border-radius:8px;font-size:9pt;">
        <strong>Administrateur KZO :</strong> modifiez <code>js/norm-texts.js</code> pour le texte officiel complet.
      </div>`;
  }

  // js/receipt-inspection.js
  function escapeHtml6(str) {
    return String(str ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function fullAddress2(site) {
    const parts = [site.adresse, [site.ville, site.codePostal].filter(Boolean).join(" ")].filter(Boolean);
    return parts.join(", ") || "\u2014";
  }
  function formatMoney(value) {
    const n = parseFloat(String(value).replace(",", "."));
    if (Number.isNaN(n)) return "\u2014";
    return new Intl.NumberFormat("fr-CA", { style: "currency", currency: "CAD" }).format(n);
  }
  function parseAmount(value) {
    const n = parseFloat(String(value ?? "").replace(",", "."));
    return Number.isNaN(n) ? 0 : n;
  }
  function computeTaxes(subtotal, tpsRate = 5, tvqRate = 9.975) {
    const base = parseAmount(subtotal);
    const tps = Math.round(base * (tpsRate / 100) * 100) / 100;
    const tvq = Math.round((base + tps) * (tvqRate / 100) * 100) / 100;
    const total = Math.round((base + tps + tvq) * 100) / 100;
    return { subtotal: base, tps, tvq, total };
  }
  var PAYMENT_MODES = [
    { value: "", label: "\u2014 Mode \u2014" },
    { value: "comptant", label: "Comptant" },
    { value: "cheque", label: "Ch\xE8que" },
    { value: "virement", label: "Virement / Interac" },
    { value: "carte", label: "Carte de cr\xE9dit / d\xE9bit" },
    { value: "autre", label: "Autre" }
  ];
  var PAYMENT_STATUS = [
    { value: "paye", label: "Pay\xE9 en totalit\xE9" },
    { value: "acompte", label: "Acompte re\xE7u" },
    { value: "en-attente", label: "Paiement en attente" }
  ];
  function paymentModeLabel(v) {
    return PAYMENT_MODES.find((p) => p.value === v)?.label ?? v ?? "\u2014";
  }
  function paymentStatusLabel(v) {
    return PAYMENT_STATUS.find((p) => p.value === v)?.label ?? v ?? "\u2014";
  }
  function receiptNumber(inspection, profile = {}) {
    if (inspection.invoiceNumber) return inspection.invoiceNumber;
    if (inspection.receipt?.numero) return inspection.receipt.numero;
    if (inspection.site?.numeroDossier) return inspection.site.numeroDossier;
    const prefix = resolveBranding(profile).receiptPrefix;
    const d = inspection.visit?.date?.replace(/-/g, "") || "";
    const short = inspection.id?.slice(0, 6).toUpperCase() || "000000";
    return `${prefix}-${d}-${short}`;
  }
  function defaultReceipt(inspection, profile = {}) {
    const subtotal = profile.montantDefaut || "";
    const taxes = computeTaxes(subtotal, profile.tauxTPS ?? 5, profile.tauxTVQ ?? 9.975);
    return {
      numero: "",
      description: inspection.templateLabel ? `Inspection \u2014 ${inspection.templateLabel}` : profile.descriptionServiceDefaut || "Inspection de b\xE2timent d'habitation",
      montantHT: subtotal ? String(subtotal) : "",
      tps: taxes.tps ? String(taxes.tps) : "",
      tvq: taxes.tvq ? String(taxes.tvq) : "",
      total: taxes.total ? String(taxes.total) : "",
      modePaiement: "",
      statutPaiement: "paye",
      datePaiement: inspection.visit?.date || "",
      note: ""
    };
  }
  function normalizeReceipt(inspection, profile = {}) {
    if (!inspection.receipt || typeof inspection.receipt !== "object") {
      inspection.receipt = defaultReceipt(inspection, profile);
    }
    return inspection.receipt;
  }
  function buildReceiptHtml(inspection, profile = {}) {
    const branding = resolveBranding(profile);
    const r = normalizeReceipt(inspection, profile);
    const client = inspection.site?.client || "Client";
    const siteLine = fullAddress2(inspection.site);
    const visitLine = formatVisitDateTime(inspection);
    const inspector = inspection.inspector || {};
    const num = receiptNumber(inspection, profile);
    const subtotal = parseAmount(r.montantHT);
    const tpsRate = profile.tauxTPS ?? 5;
    const tvqRate = profile.tauxTVQ ?? 9.975;
    const tps = r.tps !== "" ? parseAmount(r.tps) : computeTaxes(subtotal, tpsRate, tvqRate).tps;
    const tvq = r.tvq !== "" ? parseAmount(r.tvq) : computeTaxes(subtotal, tpsRate, tvqRate).tvq;
    const total = r.total !== "" ? parseAmount(r.total) : Math.round((subtotal + tps + tvq) * 100) / 100;
    return `<!DOCTYPE html>
<html lang="fr-CA">
<head>
  <meta charset="UTF-8" />
  <title>Re\xE7u d'inspection \u2014 ${escapeHtml6(num)}</title>
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
  <p class="no-print">Re\xE7u d'inspection \u2014 Imprimez ou enregistrez en PDF.</p>

  ${orgLetterheadHtml(branding, { compact: true })}

  <h1 class="receipt-title">RE\xC7U D'INSPECTION</h1>
  <p style="text-align:center;margin:0 0 20px;color:#444;">N\xBA <strong>${escapeHtml6(num)}</strong></p>

  <div class="receipt-meta">
    <div class="meta-box">
      <h3>\xC9mis \xE0</h3>
      <p><strong>${escapeHtml6(client)}</strong></p>
      ${inspection.site.courrielClient ? `<p>${escapeHtml6(inspection.site.courrielClient)}</p>` : ""}
      ${inspection.site.telephoneClient ? `<p>${escapeHtml6(inspection.site.telephoneClient)}</p>` : ""}
      ${siteLine !== "\u2014" ? `<p>${escapeHtml6(siteLine)}</p>` : ""}
    </div>
    <div class="meta-box">
      <h3>\xC9mis par</h3>
      <p><strong>${escapeHtml6(inspector.nom || "\u2014")}</strong></p>
      <p>${escapeHtml6(inspector.entreprise || "")}</p>
      <p>${escapeHtml6([inspector.courriel, inspector.telephone].filter(Boolean).join(" \xB7 "))}</p>
      ${inspector.permis ? `<p class="muted">Permis : ${escapeHtml6(inspector.permis)}</p>` : ""}
      ${inspector.certificatRbq ? `<p class="muted">Certificat RBQ : ${escapeHtml6(inspector.certificatRbq)}</p>` : ""}
      ${branding.ibcMention ? `<p class="muted">${escapeHtml6(branding.ibcMention)}</p>` : ""}
      <p style="margin-top:8px"><strong>Date du re\xE7u :</strong> ${escapeHtml6(r.datePaiement ? formatDateFr(r.datePaiement) : formatLetterDate(inspection))}</p>
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
          <strong>${escapeHtml6(r.description)}</strong>
          ${siteLine !== "\u2014" ? `<br /><span class="muted">${escapeHtml6(siteLine)}</span>` : ""}
          ${visitLine !== "\u2014" ? `<br /><span class="muted">Date de service : ${escapeHtml6(visitLine)}</span>` : ""}
        </td>
        <td class="col-rate">\u2014</td>
        <td class="col-amount">${formatMoney(subtotal)}</td>
      </tr>
      <tr class="row-subtotal">
        <td class="col-label">Sous-total avant taxes</td>
        <td class="col-rate"></td>
        <td class="col-amount">${formatMoney(subtotal)}</td>
      </tr>
      <tr class="row-tax">
        <td class="col-label">TPS (Taxe sur les produits et services)
          <span class="formula">= Sous-total \xD7 ${tpsRate} %</span>
        </td>
        <td class="col-rate">${tpsRate} %</td>
        <td class="col-amount">${formatMoney(tps)}</td>
      </tr>
      <tr class="row-tax">
        <td class="col-label">TVQ (Taxe de vente du Qu\xE9bec)
          <span class="formula">= (Sous-total + TPS) \xD7 ${tvqRate} %</span>
        </td>
        <td class="col-rate">${tvqRate} %</td>
        <td class="col-amount">${formatMoney(tvq)}</td>
      </tr>
      <tr class="row-total">
        <td class="col-label">TOTAL \xC0 PAYER</td>
        <td class="col-rate"></td>
        <td class="col-amount">${formatMoney(total)}</td>
      </tr>
    </tbody>
  </table>

  <div class="payment-box">
    <p><strong>Paiement :</strong> ${escapeHtml6(paymentStatusLabel(r.statutPaiement))}</p>
    <p><strong>Mode :</strong> ${escapeHtml6(paymentModeLabel(r.modePaiement) || "\u2014")}</p>
    ${r.note ? `<p><strong>Note :</strong> ${escapeHtml6(r.note)}</p>` : ""}
  </div>

  ${profile.noEntrepriseTPS || profile.noEntrepriseTVQ ? `<p class="legal">` + (profile.noEntrepriseTPS ? `No TPS : ${escapeHtml6(profile.noEntrepriseTPS)}. ` : "") + (profile.noEntrepriseTVQ ? `No TVQ : ${escapeHtml6(profile.noEntrepriseTVQ)}.` : "") + `</p>` : ""}

  <p class="legal">
    Ce re\xE7u confirme la prestation de services d'inspection en b\xE2timent par
    <strong>${escapeHtml6(inspector.nom || branding.entreprise || branding.appName)}</strong>.
    Il ne remplace pas le rapport d'inspection d\xE9taill\xE9 remis s\xE9par\xE9ment.
    Conservez ce document pour vos dossiers comptables.
  </p>

  ${orgFooterHtml(branding)}

  <script>window.onload = () => window.print();<\/script>
</body>
</html>`;
  }
  function formatLetterDate(inspection) {
    const d = inspection.visit?.date;
    if (d) return formatDateFr(d);
    return (/* @__PURE__ */ new Date()).toLocaleDateString("fr-CA", { year: "numeric", month: "long", day: "numeric" });
  }
  function openReceipt(inspection, profile = {}) {
    normalizeReceipt(inspection, profile);
    const html = buildReceiptHtml(inspection, profile);
    const win = window.open("", "_blank");
    if (!win) {
      alert("Autorisez les fen\xEAtres contextuelles pour ouvrir le re\xE7u.");
      return;
    }
    win.document.write(html);
    win.document.close();
  }

  // js/report-layout.js
  /**
   * Pagination du rapport PDF — volume minimum garanti (40 pages).
   */

  const MIN_REPORT_PAGES = 40;

  const REPORT_PAGINATION_STYLES = `
    .report-print-page {
      position: relative;
      min-height: 248mm;
      padding: 14mm 16mm 22mm;
      page-break-after: always;
      break-after: page;
      box-sizing: border-box;
    }
    /* Ne pas utiliser :last-child — la dernière page d'un bloc section annulait le saut entre sections. */
    .report-print-page--closing { page-break-after: auto; break-after: auto; }
    .report-section-block {
      display: block;
    }
    .report-print-page--section {
      /* sections se suivent sans saut de page force */
    }
    .report-print-page__footer {
      position: absolute;
      left: 16mm;
      right: 16mm;
      bottom: 10mm;
      font-size: 8pt;
      color: #78909c;
      border-top: 1px solid #e0e0e0;
      padding-top: 6px;
      display: flex;
      justify-content: space-between;
    }
    .report-print-page__head {
      margin: 0 0 12px;
      padding-bottom: 8px;
      border-bottom: 2px solid #0d47a1;
    }
    .report-print-page__head h2 {
      margin: 0;
      font-size: 13pt;
      color: #0d47a1;
      border: none;
      padding: 0;
    }
    .report-print-page__head p { margin: 4px 0 0; font-size: 9pt; color: #546e7a; }
    .report-toc { list-style: none; padding: 0; margin: 16px 0; }
    .report-toc li {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      padding: 6px 0;
      border-bottom: 1px dotted #cfd8dc;
      font-size: 10.5pt;
    }
    .report-toc__dots { flex: 1; border-bottom: 1px dotted #b0bec5; margin-bottom: 4px; min-width: 24px; }
    .report-toc a { color: #0d47a1; text-decoration: none; }
    .report-toc a:hover { text-decoration: underline; }
    .report-toc__page { font-variant-numeric: tabular-nums; min-width: 2.5em; text-align: right; color: #37474f; }
    .report-toc__item--level-2 { padding-left: 18px; font-size: 9.5pt; color: #546e7a; }
    .report-toc__meta { margin: 0 0 20px; font-size: 10.5pt; color: #546e7a; line-height: 1.5; }
    .report-toc__meta strong { color: #1a1a2e; }
    .report-item-page__label { font-size: 12pt; font-weight: 600; margin: 0 0 10px; color: #1a1a2e; }
    .report-item-page__status {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 10pt;
      font-weight: 600;
      margin-bottom: 12px;
    }
    .report-item-page__status--conforme { background: #e8f5e9; color: #2e7d32; }
    .report-item-page__status--non-conforme { background: #ffebee; color: #c62828; }
    .report-item-page__status--a-corriger { background: #fff8e1; color: #f57f17; }
    .report-item-page__status--na { background: #eceff1; color: #546e7a; }
    .report-item-page__body { font-size: 10.5pt; line-height: 1.55; color: #37474f; }
    .report-item-page__photos { margin-top: 16px; }
    .report-item-page__photo {
      width: 100%;
      max-height: 165mm;
      object-fit: contain;
      border: 1px solid #cfd8dc;
      border-radius: 6px;
      margin-bottom: 10px;
    }
    .report-photo-page__img {
      width: 100%;
      max-height: 210mm;
      object-fit: contain;
      border-radius: 6px;
      border: 1px solid #cfd8dc;
    }
    .report-photo-page__caption { margin-top: 10px; font-size: 10pt; color: #546e7a; }
    .report-compact-table { width: 100%; border-collapse: collapse; font-size: 9.5pt; margin-top: 8px; }
    .report-compact-table th, .report-compact-table td {
      border: 1px solid #ddd;
      padding: 6px 8px;
      text-align: left;
      vertical-align: top;
    }
    .report-compact-table th { background: #f5f7fa; }
    .report-appendix-prose { font-size: 10.5pt; line-height: 1.6; color: #37474f; }
    .report-appendix-prose h3 { font-size: 11pt; color: #0d47a1; margin: 16px 0 8px; }
    .report-appendix-prose p { margin: 0 0 10px; }
    .report-appendix-prose ul { margin: 0 0 12px; padding-left: 20px; }
    .report-ident-block { font-size: 10.5pt; line-height: 1.55; }
    .report-ident-block dl { display: grid; grid-template-columns: 140px 1fr; gap: 4px 16px; margin: 0 0 12px; }
    .report-ident-block dt { font-weight: 600; color: #546e7a; }
    .report-ident-block dd { margin: 0; }
    @media print {
      .report-print-page {
        min-height: 248mm;
        page-break-after: always;
        break-after: page;
        page-break-inside: avoid;
        break-inside: avoid;
      }
      .report-section-block {
        page-break-before: always;
        break-before: page;
      }
      .report-print-page--section {
        page-break-before: always;
        break-before: page;
      }
      .report-photo-page__img { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  `;

  const APPENDIX_PAGES = [
    {
      title: 'Glossaire — terminologie courante',
      body: `<p>Ce glossaire facilite la lecture du rapport selon les usages professionnels au Québec.</p>
        <h3>Structure et enveloppe</h3>
        <ul>
          <li><strong>Efflorescence</strong> — dépôts de sels minéraux en surface, souvent signe d'humidité.</li>
          <li><strong>Larmier</strong> — saillie horizontale au-dessus d'une ouverture pour éloigner l'eau du mur.</li>
          <li><strong>Solive de rive</strong> — pièce de bois en bout de plancher, en appui sur le mur extérieur.</li>
        </ul>
        <h3>Plomberie et électricité</h3>
        <ul>
          <li><strong>Poly-B</strong> — tuyauterie en polybutylène (gris), sujette à défaillance aux raccords.</li>
          <li><strong>GFCI / DDFT</strong> — dispositif différentiel pour prises à risque.</li>
        </ul>`,
    },
    {
      title: 'Responsabilités de l\'inspecteur et du client',
      body: `<p>L'inspection est une <strong>évaluation visuelle non invasive</strong> à une date donnée. Elle ne constitue pas une garantie ni une certification au Code du bâtiment.</p>
        <h3>Rôle de l'inspecteur</h3>
        <ul>
          <li>Observer les composantes accessibles et documenter les constats visibles.</li>
          <li>Signaler les limitations d'accès ou de visibilité.</li>
          <li>Recommander des expertises spécialisées lorsque requis.</li>
        </ul>`,
    },
    {
      title: 'Références normatives (Québec)',
      body: `<p>Cadre applicable : REIBH, BNQ 3009-500, norme AIBQ, CNB / CCQ. Les citations de code sont indicatives.</p>`,
    },
    {
      title: 'Méthodologie d\'inspection visuelle',
      body: `<p>Démarche systématique : extérieur, toiture, enveloppe, systèmes intérieurs accessibles sans démolition.</p>
        <ul>
          <li>Observation visuelle et essais légers non destructifs lorsque permis.</li>
          <li>Documentation photographique des constats significatifs.</li>
        </ul>`,
    },
    {
      title: 'Limitations générales',
      body: `<p>Mobilier, neige, végétation, obscurité ou accès restreint peuvent limiter la portée des constats. Les défauts latents demeurent hors portée d'une visite ponctuelle.</p>`,
    },
    {
      title: 'Grille de sévérité',
      body: `<p><strong>C</strong> conforme · <strong>NC</strong> non conforme · <strong>AC</strong> à corriger · <strong>N/A</strong> sans objet. Priorité : mineure, majeure, critique.</p>`,
    },
    {
      title: 'Entretien préventif',
      body: `<ul>
          <li>Nettoyer gouttières printemps et automne.</li>
          <li>Vérifier scellants et étanchéité des ouvertures.</li>
          <li>Surveiller humidité au sous-sol.</li>
          <li>Tester détecteurs de fumée et CO semestriellement.</li>
        </ul>`,
    },
    {
      title: 'Suivi post-inspection',
      body: `<p>Les constats NC/AC devraient faire l'objet d'estimations par entrepreneurs licenciés (RBQ) ou professionnels membres de leur ordre.</p>`,
    },
  ];

  function pageFooter(pageNum, dossier) {
    return `<div class="report-print-page__footer">
      <span>Dossier ${escapeHtml(dossier || '—')}</span>
      <span>Page ${pageNum} · rapport ≥ ${MIN_REPORT_PAGES} pages</span>
    </div>`;
  }

  function statusClass(status) {
    if (status === 'conforme') return 'conforme';
    if (status === 'non-conforme') return 'non-conforme';
    if (status === 'a-corriger') return 'a-corriger';
    return 'na';
  }

  function itemDocumentationHtml(item) {
    normalizeChecklistItem(item);
    const blocks = [];
    const presets = (item.selectedPresets || []).map((id) => presetLabel(id)).filter(Boolean);
    if (presets.length) {
      blocks.push(`<p><strong>Réponses rapides :</strong> ${escapeHtml(presets.join(' · '))}</p>`);
    }
    const comment = (item.inspectorComment || item.note || '').trim();
    if (comment) {
      blocks.push(`<p><strong>Commentaire inspecteur :</strong> ${escapeHtml(comment).replace(/\n/g, '<br />')}</p>`);
    }
    return blocks.join('');
  }

  function estimateReportPages(inspection, { normPages = 10, hasCover = false } = {}) {
    let pages = hasCover ? 1 : 0;
    pages += normPages + 1 + 3 + APPENDIX_PAGES.length;
    for (const sec of inspection.sections || []) {
      if (isInfoSection(sec.id)) continue;
      pages += 1;
      iterSectionItems(sec, (item) => {
        if (item.status) pages += 1;
        pages += item.photos?.length || 0;
      });
    }
    return pages + 2;
  }

  /** Calcule les numéros de page pour chaque chapitre (même ordre que le PDF généré). */
  function buildReportOutline(inspection, { hasCover = false, normPageCount = 10 } = {}) {
    const entries = [];
    let p = 1;

    if (hasCover) {
      entries.push({ id: 'report-cover', label: 'Page de couverture', page: p++, level: 0 });
    }
    entries.push({ id: 'report-toc', label: 'Table des matières', page: p++, level: 0 });
    entries.push({ id: 'report-norms', label: 'Normes et cadre d\'inspection', page: p, level: 0 });
    p += normPageCount;

    entries.push({ id: 'report-intro-id', label: 'Identification du mandat', page: p++, level: 0 });
    entries.push({ id: 'report-intro-visit', label: 'Visite et site inspecté', page: p++, level: 0 });
    entries.push({ id: 'report-intro-summary', label: 'Synthèse des constats', page: p++, level: 0 });

    const forceAllItems = estimateReportPages(inspection, { hasCover, normPages: normPageCount }) < MIN_REPORT_PAGES;
    let photoAnnexPage = null;

    for (const sec of inspection.sections || []) {
      if (isInfoSection(sec.id)) continue;
      normalizeSection(sec);
      entries.push({ id: `report-sec-${sec.id}`, label: stripNumbering(sec.title), page: p++, level: 1 });

      const compactConforme = [];
      const compactNa = [];

      iterSectionItems(sec, (item) => {
        if (!item.status) {
          if (forceAllItems) p += 1;
          return;
        }
        const documented =
          hasItemDocumentation(item) ||
          (item.photos?.length > 0) ||
          item.status === 'non-conforme' ||
          item.status === 'a-corriger';

        if (documented || forceAllItems) {
          p += 1;
          const photoCount = item.photos?.length || 0;
          if (photoCount && photoAnnexPage === null) photoAnnexPage = p;
          p += photoCount;
        } else if (item.status === 'conforme') {
          compactConforme.push(item);
        } else {
          compactNa.push(item);
        }
      });

      const chunkSize = forceAllItems ? 4 : 8;
      p += Math.ceil(compactConforme.length / chunkSize) + Math.ceil(compactNa.length / chunkSize);
    }

    if (photoAnnexPage !== null) {
      entries.push({ id: 'report-photos', label: 'Annexe photographique', page: photoAnnexPage, level: 0 });
    }

    entries.push({ id: 'report-appendix', label: 'Annexes techniques et glossaire', page: p, level: 0 });
    p += APPENDIX_PAGES.length;
    entries.push({ id: 'report-closing', label: 'Signature et reçu', page: p, level: 0 });

    return entries;
  }

  function buildTableOfContentsHtml(inspection, outline = []) {
    const client = inspection.site?.client || inspection.templateLabel || 'Propriété inspectée';
    const addr = [inspection.site?.adresse, inspection.site?.ville].filter(Boolean).join(', ');
    const dossier = inspection.site?.numeroDossier || '—';

    const rows = outline
      .filter((e) => e.id !== 'report-toc' && e.id !== 'report-cover')
      .map((e) => {
        const levelClass = e.level === 2 ? ' report-toc__item--level-2' : '';
        const labelHtml = e.id
          ? `<a href="#${escapeHtml(e.id)}">${escapeHtml(e.label)}</a>`
          : escapeHtml(e.label);
        return `<li class="report-toc__item${levelClass}">
          <span class="report-toc__label">${labelHtml}</span>
          <span class="report-toc__dots"></span>
          <span class="report-toc__page">${e.page}</span>
        </li>`;
      })
      .join('');

    return `
    <div id="report-toc" class="report-print-page report-print-page--toc">
      <div class="report-print-page__head">
        <h2>Table des matières</h2>
        <p>Rapport d'inspection — navigation par chapitre</p>
      </div>
      <p class="report-toc__meta">
        <strong>${escapeHtml(client)}</strong><br />
        ${addr ? `${escapeHtml(addr)}<br />` : ''}
        Dossier <strong>${escapeHtml(dossier)}</strong>
      </p>
      <ol class="report-toc">${rows}</ol>
      <p class="report-toc__meta" style="margin-top:24px;font-size:9pt;">
        Les numéros de page correspondent au PDF imprimé. Cliquez un titre pour accéder au chapitre (lecteur PDF).
      </p>
    </div>`;
  }

  function buildItemDetailPage(sec, item, subTitle, pageNum, dossier, statusLabelFn) {
    const status = item.status || 'pending';
    const photos =
      item.photos?.length > 0
        ? `<div class="report-item-page__photos">${item.photos
            .map((p) => `<img class="report-item-page__photo" src="${p}" alt="Photo du constat" />`)
            .join('')}</div>`
        : '';
    const doc = itemDocumentationHtml(item);
    return `
    <div class="report-print-page report-print-page--item">
      <div class="report-print-page__head">
        <h2>${escapeHtml(stripNumbering(sec.title))}</h2>
        ${subTitle ? `<p>${escapeHtml(stripNumbering(subTitle))}</p>` : ''}
      </div>
      <p class="report-item-page__label">${escapeHtml(stripNumbering(item.label))}</p>
      <span class="report-item-page__status report-item-page__status--${statusClass(status)}">${escapeHtml(statusLabelFn(status))}</span>
      ${item.priority && status !== 'conforme' && status !== 'na' ? `<p><strong>Priorité :</strong> ${escapeHtml(item.priority)}</p>` : ''}
      <div class="report-item-page__body">${doc || '<p>Aucune note complémentaire.</p>'}</div>
      ${photos}
      ${pageFooter(pageNum, dossier)}
    </div>`;
  }

  function buildCompactItemsPage(sec, items, subTitle, pageNum, dossier, statusLabelFn) {
    const rows = items
      .map(
        (item) =>
          `<tr><td>${escapeHtml(stripNumbering(item.label))}</td><td>${escapeHtml(statusLabelFn(item.status))}</td></tr>`,
      )
      .join('');
    return `
    <div class="report-print-page report-print-page--compact">
      <div class="report-print-page__head">
        <h2>${escapeHtml(stripNumbering(sec.title))}</h2>
        <p>${subTitle ? `${escapeHtml(stripNumbering(subTitle))} — ` : ''}points conformes / S.O.</p>
      </div>
      <table class="report-compact-table"><thead><tr><th>Point</th><th>Résultat</th></tr></thead><tbody>${rows}</tbody></table>
      ${pageFooter(pageNum, dossier)}
    </div>`;
  }

  function buildSectionIntroPage(sec, pageNum, dossier) {
    return `
    <div id="report-sec-${escapeHtml(sec.id)}" class="report-print-page report-print-page--section">
      <div class="report-print-page__head">
        <h2>${escapeHtml(stripNumbering(sec.title))}</h2>
        <p>Détail des constats — section suivante</p>
      </div>
      <p class="report-appendix-prose">Les points évalués de cette section sont documentés aux pages suivantes. Les constats non conformes ou à corriger font l'objet d'une fiche détaillée; les points conformes ou sans objet sont regroupés en fin de section.</p>
      ${pageFooter(pageNum, dossier)}
    </div>`;
  }

  function buildPhotoAnnexPage(sec, item, photoSrc, photoIndex, pageNum, dossier) {
    const photoId = photoIndex === 0 ? ' id="report-photos"' : '';
    return `
    <div${photoId} class="report-print-page report-print-page--photo">
      <div class="report-print-page__head">
        <h2>Annexe photographique</h2>
        <p>${escapeHtml(stripNumbering(sec.title))}</p>
      </div>
      <img class="report-photo-page__img" src="${photoSrc}" alt="Photo ${photoIndex + 1}" />
      <p class="report-photo-page__caption">${escapeHtml(stripNumbering(item.label))} — photo ${photoIndex + 1}</p>
      ${pageFooter(pageNum, dossier)}
    </div>`;
  }

  function buildStandardAppendixPagesHtml(startPageNum, dossier) {
    let html = '';
    let pageNum = startPageNum;
    for (const chunk of APPENDIX_PAGES) {
      const appendixId = pageNum === startPageNum ? ' id="report-appendix"' : '';
      html += `
      <div${appendixId} class="report-print-page report-print-page--appendix">
        <div class="report-print-page__head"><h2>${escapeHtml(chunk.title)}</h2></div>
        <div class="report-appendix-prose">${chunk.body}</div>
        ${pageFooter(pageNum++, dossier)}
      </div>`;
    }
    return { html, nextPageNum: pageNum };
  }

  function buildPaddingPagesHtml(count, startPageNum, dossier) {
    let html = '';
    for (let i = 0; i < count; i++) {
      const chunk = APPENDIX_PAGES[i % APPENDIX_PAGES.length];
      const pageNum = startPageNum + i;
      html += `
      <div class="report-print-page report-print-page--padding">
        <div class="report-print-page__head"><h2>${escapeHtml(chunk.title)} (suite)</h2></div>
        <div class="report-appendix-prose">${chunk.body}
          <p><em>Document complémentaire — page ${pageNum} du rapport d'inspection.</em></p>
        </div>
        ${pageFooter(pageNum, dossier)}
      </div>`;
    }
    return html;
  }

  function buildPaginatedSectionsHtml(inspection, statusLabelFn, startPageNum) {
    const dossier = inspection.site?.numeroDossier;
    let pageNum = startPageNum;
    let html = '';
    const forceAllItems = estimateReportPages(inspection, { hasCover: !!inspection.coverPhotoDataUrl }) < MIN_REPORT_PAGES;

    for (const sec of inspection.sections || []) {
      if (isInfoSection(sec.id)) continue;
      normalizeSection(sec);
      html += '<div class="report-section-block">';
      html += buildSectionIntroPage(sec, pageNum++, dossier);

      const compactConforme = [];
      const compactNa = [];

      iterSectionItems(sec, (item, _subIndex, _ii, subTitle) => {
        if (!item.status) {
          if (forceAllItems) {
            html += buildItemDetailPage(sec, { ...item, status: 'na' }, subTitle, pageNum++, dossier, statusLabelFn);
          }
          return;
        }
        const documented =
          hasItemDocumentation(item) ||
          (item.photos?.length > 0) ||
          item.status === 'non-conforme' ||
          item.status === 'a-corriger';

        if (documented || forceAllItems) {
          html += buildItemDetailPage(sec, item, subTitle, pageNum++, dossier, statusLabelFn);
          (item.photos || []).forEach((photoSrc, pi) => {
            html += buildPhotoAnnexPage(sec, item, photoSrc, pi, pageNum++, dossier);
          });
        } else if (item.status === 'conforme') {
          compactConforme.push(item);
        } else {
          compactNa.push(item);
        }
      });

      const chunkSize = forceAllItems ? 4 : 8;
      for (let i = 0; i < compactConforme.length; i += chunkSize) {
        html += buildCompactItemsPage(sec, compactConforme.slice(i, i + chunkSize), null, pageNum++, dossier, statusLabelFn);
      }
      for (let i = 0; i < compactNa.length; i += chunkSize) {
        html += buildCompactItemsPage(sec, compactNa.slice(i, i + chunkSize), 'Sans objet', pageNum++, dossier, statusLabelFn);
      }
      html += '</div>';
    }

    return { html, nextPageNum: pageNum };
  }

  // js/report.js
  function statusLabel2(value) {
    return STATUS_OPTIONS.find((s) => s.value === value)?.label ?? "\u2014";
  }
  function escapeHtml7(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function stripNumbering2(text) {
    return String(text || '').replace(/^(?:Art\.\s*)?\d+(?:\.\d+)*[a-z]?\.?\s*[-—–:]*\s*/i, '');
  }

  function formatMoneyReport(value) {
    const n = parseFloat(String(value).replace(',', '.'));
    if (Number.isNaN(n)) return '—';
    return new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD' }).format(n);
  }

  function buildReceiptForReport(inspection, profile = {}) {
    const r = normalizeReceipt(inspection, profile);
    const subtotal = parseFloat(String(r.montantHT ?? '').replace(',', '.')) || 0;
    if (subtotal <= 0) return ''; // pas de reçu si pas de montant

    const tpsRate = profile.tauxTPS ?? 5;
    const tvqRate = profile.tauxTVQ ?? 9.975;
    const taxes = computeTaxes(subtotal, tpsRate, tvqRate);

    return `
    <div style="page-break-before:always;"></div>
    <h2>Reçu d'inspection</h2>
    <table style="width:100%;border-collapse:collapse;margin:12px 0;font-size:10pt;">
      <thead>
        <tr>
          <th style="border:1px solid #b0bec5;padding:8px 12px;background:#e3edf7;text-align:left;font-size:9pt;color:#0d47a1;text-transform:uppercase;width:55%;">Description</th>
          <th style="border:1px solid #b0bec5;padding:8px 12px;background:#e3edf7;text-align:center;font-size:9pt;color:#0d47a1;text-transform:uppercase;width:15%;">Taux</th>
          <th style="border:1px solid #b0bec5;padding:8px 12px;background:#e3edf7;text-align:right;font-size:9pt;color:#0d47a1;text-transform:uppercase;width:30%;">Montant</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="border:1px solid #b0bec5;padding:8px 12px;"><strong>${escapeHtml7(r.description)}</strong></td>
          <td style="border:1px solid #b0bec5;padding:8px 12px;text-align:center;">—</td>
          <td style="border:1px solid #b0bec5;padding:8px 12px;text-align:right;">${formatMoneyReport(subtotal)}</td>
        </tr>
        <tr>
          <td style="border:1px solid #b0bec5;padding:8px 12px;background:#f5f9fc;font-weight:600;">Sous-total avant taxes</td>
          <td style="border:1px solid #b0bec5;padding:8px 12px;background:#f5f9fc;"></td>
          <td style="border:1px solid #b0bec5;padding:8px 12px;background:#f5f9fc;text-align:right;font-weight:600;">${formatMoneyReport(subtotal)}</td>
        </tr>
        <tr>
          <td style="border:1px solid #b0bec5;padding:8px 12px;background:#fafafa;color:#455a64;">TPS <span style="font-family:monospace;font-size:8pt;color:#90a4ae;">(= Sous-total × ${tpsRate} %)</span></td>
          <td style="border:1px solid #b0bec5;padding:8px 12px;background:#fafafa;text-align:center;color:#455a64;">${tpsRate} %</td>
          <td style="border:1px solid #b0bec5;padding:8px 12px;background:#fafafa;text-align:right;color:#455a64;">${formatMoneyReport(taxes.tps)}</td>
        </tr>
        <tr>
          <td style="border:1px solid #b0bec5;padding:8px 12px;background:#fafafa;color:#455a64;">TVQ <span style="font-family:monospace;font-size:8pt;color:#90a4ae;">(= (Sous-total + TPS) × ${tvqRate} %)</span></td>
          <td style="border:1px solid #b0bec5;padding:8px 12px;background:#fafafa;text-align:center;color:#455a64;">${tvqRate} %</td>
          <td style="border:1px solid #b0bec5;padding:8px 12px;background:#fafafa;text-align:right;color:#455a64;">${formatMoneyReport(taxes.tvq)}</td>
        </tr>
        <tr>
          <td style="border:1px solid #b0bec5;padding:8px 12px;background:#0d47a1;color:#fff;font-weight:800;font-size:12pt;">TOTAL</td>
          <td style="border:1px solid #b0bec5;padding:8px 12px;background:#0d47a1;"></td>
          <td style="border:1px solid #b0bec5;padding:8px 12px;background:#0d47a1;color:#fff;font-weight:800;font-size:12pt;text-align:right;">${formatMoneyReport(taxes.total)}</td>
        </tr>
      </tbody>
    </table>
    ${r.note ? `<p style="font-size:9pt;color:#666;"><strong>Note :</strong> ${escapeHtml7(r.note)}</p>` : ''}
    ${profile.noEntrepriseTPS ? `<p style="font-size:8pt;color:#666;">No TPS : ${escapeHtml7(profile.noEntrepriseTPS)}</p>` : ''}
    ${profile.noEntrepriseTVQ ? `<p style="font-size:8pt;color:#666;">No TVQ : ${escapeHtml7(profile.noEntrepriseTVQ)}</p>` : ''}
    `;
  }

  function buildIntroPagesHtml(inspection, clientFiles, stats, statusMeta, profile, branding) {
    const dossier = inspection.site?.numeroDossier;
    const page1 = `
    <div id="report-intro-id" class="report-print-page">
      ${orgLetterheadHtml(branding, { compact: true })}
      <header>
        <h1>Rapport d'inspection</h1>
        <p><strong>${escapeHtml7(inspection.templateLabel)}</strong> — ${escapeHtml7(inspection.norme)}</p>
        <p>Statut : ${escapeHtml7(statusMeta.label)} · Dossier ${escapeHtml7(dossier || '—')}</p>
        ${inspection.site.mandat ? `<p>Mandat : ${escapeHtml7(inspection.site.mandat)}</p>` : ''}
      </header>
      ${normDisclaimer(inspection.templateId)}
      <h2>Client</h2>
      <dl class="meta-grid">
        <dt>Nom du client</dt><dd>${escapeHtml7(inspection.site.client)}</dd>
        ${inspection.site.proprietaire ? `<dt>Propriétaire / vendeur</dt><dd>${escapeHtml7(inspection.site.proprietaire)}</dd>` : ''}
        ${inspection.site.courtier ? `<dt>Courtier</dt><dd>${escapeHtml7(inspection.site.courtier)}</dd>` : ''}
      </dl>
      <div class="report-print-page__footer"><span>Dossier ${escapeHtml7(dossier || '—')}</span><span>Identification</span></div>
    </div>`;

    const page2 = `
    <div id="report-intro-visit" class="report-print-page">
      <h2>Visite et site inspecté</h2>
      <dl class="meta-grid">
        <dt>Date</dt><dd>${escapeHtml7(formatVisitDateTime(inspection))}</dd>
        <dt>Conditions</dt><dd>${escapeHtml7(formatConditionsMeteo(inspection))}</dd>
        <dt>Adresse</dt><dd>${escapeHtml7(inspection.site.adresse)}, ${escapeHtml7(inspection.site.ville)}</dd>
        <dt>Type</dt><dd>${escapeHtml7(inspection.site.typeBatiment)}</dd>
      </dl>
      <h2>Inspecteur</h2>
      <dl class="meta-grid">
        <dt>Nom</dt><dd>${escapeHtml7(inspection.inspector.nom)}</dd>
        <dt>Permis</dt><dd>${escapeHtml7(inspection.inspector.permis)}</dd>
        <dt>Contact</dt><dd>${escapeHtml7(inspection.inspector.courriel)} · ${escapeHtml7(inspection.inspector.telephone)}</dd>
      </dl>
      ${clientFilesReportHtml(clientFiles)}
      <div class="report-print-page__footer"><span>Dossier ${escapeHtml7(dossier || '—')}</span><span>Visite</span></div>
    </div>`;

    const page3 = `
    <div id="report-intro-summary" class="report-print-page">
      <h2>Synthèse</h2>
      <div class="summary">
        <div class="summary-box"><strong>${stats.progress}%</strong> Complété</div>
        <div class="summary-box"><strong>${stats.nonConforme}</strong> Non conformes</div>
        <div class="summary-box"><strong>${stats.aCorriger}</strong> À corriger</div>
      </div>
      ${buildFindingsSummaryHtml(inspection)}
      ${buildLimitationsHtml(inspection)}
      ${buildExpertReferralsReportHtml(inspection)}
      ${inspection.observations ? `<h2>Observations générales</h2><p>${escapeHtml7(inspection.observations).replace(/\n/g, '<br>')}</p>` : ''}
      <div class="report-print-page__footer"><span>Dossier ${escapeHtml7(dossier || '—')}</span><span>Synthèse</span></div>
    </div>`;

    return page1 + page2 + page3;
  }


  function formatDate(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('fr-CA', {
      dateStyle: 'long',
      timeStyle: 'short',
    });
  }

  function categorieBnqLabel(value) {
    if (value === 'cat1') return 'Catégorie 1 (1 à 6 logements privés)';
    if (value === 'cat2') return 'Catégorie 2 (7 logements privés et plus)';
    return '';
  }

  function normDisclaimer(templateId) {
    if (templateId === 'aibq-preachat') {
      return `<p class="disclaimer"><strong>Avis AIBQ :</strong> Inspection visuelle non invasive selon la norme de pratique AIBQ (préachat). Ne constitue pas une garantie, une certification CBQ ni une expertise d'ingénieur. Les éléments non visibles ou accessibles ne sont pas couverts.</p>`;
    }
    if (templateId === 'bnq-3009') {
      return `<p class="disclaimer"><strong>Avis BNQ 3009-500 :</strong> Inspection conforme aux pratiques de la norme pour une transaction immobilière. Ne certifie pas la conformité aux codes ou règlements. Limitations inhérentes (annexe A). Expertises spécialisées recommandées lorsque requis.</p>`;
    }
    return '';
  }

  function clientFilesReportHtml(files) {
    if (!files?.length) {
      return `<h2>Dossier client (documents)</h2><p>Aucun document joint (BV, convention, etc.).</p>`;
    }
    const rows = files
      .map(
        (f) =>
          `<tr><td>${escapeHtml7(f.name)}</td><td>${escapeHtml7(categoryLabel(f.category))}</td><td>${formatFileSize(f.size)}</td><td>${escapeHtml7(f.note || '—')}</td></tr>`,
      )
      .join('');
    return `<h2>Dossier client (documents)</h2>
      <table class="report-table">
        <thead><tr><th>Fichier</th><th>Type</th><th>Taille</th><th>Note</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <p style="font-size:9pt;color:#666;">Fichiers conservés dans KZO Inspect sur l'appareil de l'inspecteur.</p>`;
  }

  function buildReportHtml(inspection, clientFiles = [], profile = {}) {
    const branding = resolveBranding(profile);
    const stats = computeStats(inspection);
    const statusMeta = INSPECTION_STATUS[inspection.status] ?? INSPECTION_STATUS.brouillon;
    const hasCover = !!inspection.coverPhotoDataUrl;
    const dossier = inspection.site?.numeroDossier;

    const normPageCount = countNormPages(inspection.norme);
    const outline = buildReportOutline(inspection, { hasCover, normPageCount });
    const tocHtml = buildTableOfContentsHtml(inspection, outline);

    let startPage = (hasCover ? 1 : 0) + 1 + normPageCount + 3;
    const introHtml = buildIntroPagesHtml(inspection, clientFiles, stats, statusMeta, profile, branding);

    const { html: sectionsHtml, nextPageNum } = buildPaginatedSectionsHtml(inspection, statusLabel2, startPage);
    const appendix = buildStandardAppendixPagesHtml(nextPageNum, dossier);
    let pageNum = appendix.nextPageNum;
    let paddingHtml = '';
    if (pageNum - 1 < MIN_REPORT_PAGES) {
      paddingHtml = buildPaddingPagesHtml(MIN_REPORT_PAGES - (pageNum - 1), pageNum, dossier);
      pageNum += MIN_REPORT_PAGES - (pageNum - 1);
    }

    const closingHtml = `
    <div class="report-print-page report-print-page--closing">
      ${inspection.signatureDataUrl ? `<h2>Signature</h2><img class="signature" src="${safeImgSrc(inspection.signatureDataUrl)}" alt="Signature" />` : ''}
      ${buildReceiptForReport(inspection, profile)}
      ${orgFooterHtml(branding)}
      <footer class="footer">
        Document généré par ${escapeHtml7(branding.appName)} le ${formatDate(new Date().toISOString())}.
        Rapport structuré — minimum ${MIN_REPORT_PAGES} pages.
      </footer>
      <div class="report-print-page__footer"><span>Dossier ${escapeHtml7(dossier || '—')}</span><span>Clôture</span></div>
    </div>`;

    const estPages = estimateReportPages(inspection, { hasCover });

    return `<!DOCTYPE html>
  <html lang="fr-CA">
  <head>
    <meta charset="UTF-8" />
    <title>Rapport — ${escapeHtml7(inspection.site.client || inspection.templateLabel)}</title>
    <style>
      * { box-sizing: border-box; }
      body { font-family: "Segoe UI", system-ui, sans-serif; color: #1a1a2e; margin: 0; padding: 24px; font-size: 11pt; }
      h1 { font-size: 20pt; margin: 0 0 4px; color: #0d47a1; }
      h2 { font-size: 13pt; margin: 24px 0 8px; border-bottom: 2px solid #0d47a1; padding-bottom: 4px; }
      h3 { font-size: 12pt; margin: 16px 0 8px; color: #333; }
      .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 24px; margin: 16px 0; }
      .meta-grid dt { font-weight: 600; color: #555; }
      .meta-grid dd { margin: 0 0 8px; }
      .summary { display: flex; gap: 16px; flex-wrap: wrap; margin: 16px 0; }
      .summary-box { border: 1px solid #ddd; border-radius: 8px; padding: 12px 16px; min-width: 120px; }
      .summary-box strong { display: block; font-size: 18pt; color: #0d47a1; }
      .report-table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
      .report-table th, .report-table td { border: 1px solid #ddd; padding: 8px; text-align: left; vertical-align: top; }
      .report-table th { background: #f5f7fa; }
      .report-row--non-conforme td { background: #ffebee; }
      .report-row--a-corriger td { background: #fff8e1; }
      .report-note { margin: 4px 0; font-size: 10pt; color: #444; }
      .report-photos { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
      .report-photo { max-width: 160px; max-height: 120px; object-fit: cover; border-radius: 4px; border: 1px solid #ccc; }
      .signature { max-width: 280px; border: 1px solid #ccc; margin-top: 8px; }
      .footer { margin-top: 32px; font-size: 9pt; color: #777; border-top: 1px solid #eee; padding-top: 12px; }
      .disclaimer { background: #fff8e1; border-left: 4px solid #f9a825; padding: 10px 12px; font-size: 9pt; margin: 12px 0; }
      ${ORG_LETTERHEAD_STYLES}
      ${COVER_PAGE_STYLES}
      ${FINDINGS_REPORT_STYLES}
      ${REPORT_PAGINATION_STYLES}
      @media print { body { padding: 0; } .no-print { display: none; } }
    </style>
  </head>
  <body>
    <p class="no-print" style="background:#e3f2fd;padding:12px;border-radius:8px;margin:12px;">
      Rapport KZO Inspect — <strong>Imprimer</strong> ou <strong>Enregistrer en PDF</strong>.
      Volume cible : <strong>≥ ${MIN_REPORT_PAGES} pages</strong> (estimé ~${estPages} pages).
    </p>
    ${buildCoverPageHtml(inspection, profile)}
    ${tocHtml}
    ${getNormPagesHtml(inspection.norme)}
    ${introHtml}
    ${sectionsHtml}
    ${appendix.html}
    ${paddingHtml}
    ${closingHtml}
    <script>window.onload = () => window.print();</script>
  </body>
  </html>`;
  }

  async function openReport(inspection, profile = loadProfile()) {
    const clientFiles = await listClientFiles(inspection.id).catch(() => []);
    const html = buildReportHtml(inspection, clientFiles, profile);
    const win = window.open('', '_blank');
    if (!win) {
      alert('Autorisez les fenêtres contextuelles pour générer le rapport PDF.');
      return;
    }
    win.document.write(html);
    win.document.close();
  }

  // js/thank-you-letter.js
  function escapeHtml8(str) {
    return String(str ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function clientSalutation(clientName) {
    const n = (clientName || "").trim();
    if (!n) return "Madame, Monsieur,";
    if (n.includes(" et ")) return `Chers ${n},`;
    return `Cher(e) ${n},`;
  }
  function formatLetterDate2(inspection) {
    const d = inspection.visit?.date;
    if (d) return formatDateFr(d);
    return (/* @__PURE__ */ new Date()).toLocaleDateString("fr-CA", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  }
  function fullAddress3(site) {
    const parts = [site.adresse, [site.ville, site.codePostal].filter(Boolean).join(" ")].filter(Boolean);
    return parts.join(", ") || "\u2014";
  }
  function buildThankYouLetterHtml(inspection, profile = {}) {
    const branding = resolveBranding(profile);
    const client = inspection.site?.client || "Client";
    const signatory = branding.entreprise || branding.appName;
    const siteLine = fullAddress3(inspection.site);
    const visitLine = formatVisitDateTime(inspection);
    const inspector = inspection.inspector || {};
    const customProfile = (profile.messageRemerciement || "").trim();
    const customInspection = (inspection.thankYouNote || "").trim();
    const customBlock = customInspection || customProfile;
    const inspectorBlock = [
      inspector.nom,
      inspector.entreprise,
      [inspector.courriel, inspector.telephone].filter(Boolean).join(" \xB7 "),
      inspector.permis ? `Permis / certification : ${inspector.permis}` : "",
      inspector.certificatRbq ? `Certificat RBQ : ${inspector.certificatRbq}` : ""
    ].filter(Boolean).map((line) => escapeHtml8(line)).join("<br />");
    return `<!DOCTYPE html>
<html lang="fr-CA">
<head>
  <meta charset="UTF-8" />
  <title>Lettre de remerciement \u2014 ${escapeHtml8(client)}</title>
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
  <p class="no-print">Lettre de remerciement \u2014 Imprimez ou enregistrez en PDF depuis votre navigateur.</p>

  ${orgLetterheadHtml(branding)}

  <p class="letter-date">${escapeHtml8(formatLetterDate2(inspection))}</p>

  <div class="letter-address">
    <strong>${escapeHtml8(client)}</strong><br />
    ${siteLine !== "\u2014" ? escapeHtml8(siteLine) : ""}
  </div>

  <p class="letter-subject">Objet : Remerciements et suivi \u2014 Inspection de votre propri\xE9t\xE9</p>

  <div class="letter-body">
    <p>${clientSalutation(client)}</p>

    <p>
      C'est avec un r\xE9el plaisir que je vous adresse cette lettre \xE0 la suite de
      l'inspection${siteLine !== "\u2014" ? ` de la propri\xE9t\xE9 situ\xE9e au <strong>${escapeHtml8(siteLine)}</strong>` : " de votre propri\xE9t\xE9"}.
      Je tiens \xE0 vous exprimer ma sinc\xE8re gratitude pour la confiance que vous m'avez accord\xE9e
      en choisissant <strong>${escapeHtml8(signatory)}</strong> pour vous accompagner dans cette \xE9tape
      importante de votre projet immobilier.
    </p>

    ${visitLine !== "\u2014" ? `<p>L'inspection a eu lieu le <strong>${escapeHtml8(visitLine)}</strong>. J'ai pris soin
           d'examiner attentivement l'ensemble des composantes accessibles du b\xE2timent afin de vous offrir
           un portrait clair et objectif de son \xE9tat au moment de la visite.</p>` : `<p>J'ai pris soin d'examiner attentivement l'ensemble des composantes accessibles du b\xE2timent
           afin de vous offrir un portrait clair et objectif de son \xE9tat.</p>`}

    <div class="letter-highlight">
      <h4>\u{1F4CB} Votre rapport d'inspection</h4>
      <ul>
        <li>Votre rapport d\xE9taill\xE9 vous a \xE9t\xE9 remis (ou le sera sous peu).</li>
        <li>Il contient une description des syst\xE8mes inspect\xE9s, des observations et des recommandations.</li>
        <li>Les photos prises lors de la visite documentent les constats importants.</li>
        <li>N'h\xE9sitez pas \xE0 me contacter si certains points n\xE9cessitent des \xE9claircissements.</li>
      </ul>
    </div>

    ${customBlock ? `<div class="letter-custom"><p style="margin:0">${escapeHtml8(customBlock).replace(/\n/g, "<br />")}</p></div>` : ""}

    <p>
      Mon engagement va au-del\xE0 de la remise du rapport. Je reste disponible pour r\xE9pondre
      \xE0 toutes vos questions, vous accompagner dans la compr\xE9hension des constats ou vous
      orienter vers des professionnels qualifi\xE9s si certains \xE9l\xE9ments requi\xE8rent une
      expertise approfondie.
    </p>

    <p>
      Votre satisfaction est au c\u0153ur de ma pratique professionnelle. Si vous \xEAtes satisfait(e)
      du service re\xE7u, une recommandation \xE0 vos proches ou un t\xE9moignage serait grandement
      appr\xE9ci\xE9 \u2014 c'est la plus belle marque de confiance qu'un client puisse offrir.
    </p>

    <p>
      Je vous souhaite le meilleur dans la poursuite de votre projet et vous prie
      d'agr\xE9er l'expression de ma consid\xE9ration distingu\xE9e.
    </p>
  </div>

  <div class="letter-signature">
    <p><strong>${escapeHtml8(inspector.nom || "_________________________")}</strong></p>
    ${inspectorBlock ? `<p>${inspectorBlock}</p>` : ""}
    ${branding.ibcMention ? `<p style="margin-top:12px;font-size:10pt;color:#0d47a1;">${escapeHtml8(branding.ibcMention)}</p>` : '<p style="margin-top:12px;font-size:10pt;color:#0d47a1;">Inspecteur en b\xE2timent certifi\xE9 \u2014 Qu\xE9bec</p>'}
  </div>

  ${orgFooterHtml(branding)}

  <script>window.onload = () => window.print();<\/script>
</body>
</html>`;
  }
  function openThankYouLetter(inspection, profile) {
    const html = buildThankYouLetterHtml(inspection, profile);
    const win = window.open("", "_blank");
    if (!win) {
      alert("Autorisez les fen\xEAtres contextuelles pour ouvrir la lettre de remerciement.");
      return;
    }
    win.document.write(html);
    win.document.close();
  }

  // js/app.js
  var main = document.getElementById("main-content");
  var nav = document.getElementById("main-nav");
  var toastContainer = document.getElementById("toast-container");
  var confirmDialog = document.getElementById("confirm-dialog");
  var route = { name: "home" };
  var autosaveTimer = null;
  var _currentInspection = null;
  var _currentTab = null;
  // Auto-sauvegarde locale (2 min aprÃ¨s 1er save manuel)
  var localAutoSaveTimer = null;
  var localAutoSaveCtx = null;
  var LOCAL_AUTO_SAVE_INTERVAL_MS = 2 * 60 * 1000;
  function stopLocalAutoSave() {
    if (localAutoSaveTimer !== null) {
      clearInterval(localAutoSaveTimer);
      localAutoSaveTimer = null;
      localAutoSaveCtx = null;
    }
  }
  function startLocalAutoSave(inspection) {
    stopLocalAutoSave();
    localAutoSaveCtx = { inspection };
    localAutoSaveTimer = setInterval(() => {
      if (!localAutoSaveCtx) return;
      const { inspection: insp } = localAutoSaveCtx;
      const panel = document.getElementById("inspect-main-content");
      if (panel) {
        saveCurrentTab(insp, route.tab || "info", panel);
        upsertInspection(insp);
      }
      try {
        exportInspectionBackup(insp, loadProfile());
        toast("Auto-sauvegarde locale \u2713 (toutes les 2 min)", "info");
      } catch (e) {
        console.warn("[KZO] Auto-sauvegarde locale Ã©chouÃ©e :", e);
      }
    }, LOCAL_AUTO_SAVE_INTERVAL_MS);
  }
  function flushAutosave() {
    if (autosaveTimer) {
      clearTimeout(autosaveTimer);
      autosaveTimer = null;
    }
    if (_currentInspection && _currentTab) {
      const panel = document.getElementById("inspect-main-content");
      if (panel) {
        saveCurrentTab(_currentInspection, _currentTab, panel);
        upsertInspection(_currentInspection);
      }
    }
  }
  function navigate(name, params = {}) {
    flushAutosave();
    stopLocalAutoSave(); // arrÃªter le timer local quand on quitte le dossier
    route = { name, ...params };
    render();
    window.location.hash = encodeRoute(route);
  }
  function encodeRoute(r) {
    if (r.name === "inspect" && r.id) return `inspect/${r.id}`;
    if (r.name === "new") return "new";
    if (r.name === "profile") return "profile";
    return "";
  }
  function parseHash() {
    const h = window.location.hash.replace(/^#/, "");
    if (h.startsWith("inspect/")) {
      return { name: "inspect", id: h.slice(8) };
    }
    if (h === "new") return { name: "new" };
    if (h === "profile") return { name: "profile" };
    return { name: "home" };
  }
  function toast(message, type = "info") {
    const el = document.createElement("div");
    el.className = `toast toast--${type}`;
    el.textContent = message;
    toastContainer.appendChild(el);
    setTimeout(() => el.remove(), 3200);
  }
  function confirmAction(title, body) {
    return new Promise((resolve) => {
      document.getElementById("confirm-title").textContent = title;
      document.getElementById("confirm-body").textContent = body;
      confirmDialog.showModal();
      confirmDialog.onclose = () => {
        resolve(confirmDialog.returnValue === "ok");
      };
    });
  }
  function renderTopBarSave() {
    const slot = document.getElementById("top-bar-save");
    if (!slot) return;
    if (route.name === "inspect" && route.id) {
      slot.hidden = false;
      slot.innerHTML = '<button type="button" class="top-nav__link top-nav__link--save" id="btn-local-save" title="T\xE9l\xE9charger une copie JSON du dossier sur votre ordinateur">&#x1F4BE; Sauvegarder</button>';
    } else {
      slot.hidden = true;
      slot.innerHTML = "";
    }
  }
  const REPAIR_PRIORITY_ORDER = { critique: 0, majeur: 1, mineur: 2 };
  const REPAIR_PRIORITY_EMOJI  = { critique: "🔴", majeur: "🟠", mineur: "🟡" };
  const REPAIR_LABEL_RE = /^(?:Art\.\s*)?\d+(?:\.\d+)*[a-z]?\.?\s*[-—–:]*\s*/i;

  function getRepairItems(inspection) {
    if (!inspection?.sections) return [];
    const items = [];
    inspection.sections.forEach((sec) => {
      iterSectionItems(sec, (item) => {
        if (item.status !== "non-conforme" && item.status !== "a-corriger") return;
        const presets = (item.selectedPresets || []).map(presetLabel).filter(Boolean);
        const comment = (item.inspectorComment || "").trim();
        if (!presets.length && !comment) return;
        items.push({
          sectionTitle: sec.title || "",
          label: item.label || "",
          status: item.status,
          priority: item.priority || "",
          presets,
          comment,
        });
      });
    });
    items.sort((a, b) => (REPAIR_PRIORITY_ORDER[a.priority] ?? 3) - (REPAIR_PRIORITY_ORDER[b.priority] ?? 3));
    return items;
  }

  function formatRepairItem(item) {
    const statusLabel   = item.status === "non-conforme" ? "NC" : "AC";
    const priorityLabel = item.priority ? item.priority.toUpperCase() : "—";
    const labelClean    = item.label.replace(REPAIR_LABEL_RE, "");
    const lines = ["[" + statusLabel + " - " + priorityLabel + "] " + item.sectionTitle];
    if (item.presets.length && item.comment) {
      lines.push(labelClean + " : " + item.presets.join(" \xB7 "));
      lines.push(item.comment);
    } else if (item.presets.length) {
      lines.push(labelClean + " : " + item.presets.join(" \xB7 "));
    } else {
      lines.push(labelClean + " : " + item.comment);
    }
    return lines.join("\n");
  }

  function renderNav() {
    const items = [
      { name: "home", label: "Accueil", hash: "" },
      { name: "new", label: "Nouvelle", hash: "new" },
      { name: "profile", label: "Profil", hash: "profile" }
    ];

    let breadcrumb = "";
    if (route.name === "inspect" && route.id) {
      const insp = getInspection(route.id);
      if (insp) {
        const label = (insp.site.client || insp.site.adresse || insp.templateLabel || "").slice(0, 28);
        breadcrumb = `<span class="top-nav__breadcrumb">â–¸ ${escapeHtml9(label)}</span>`;
      }
    }

    const repairsBtn = (route.name === "inspect" && route.id)
      ? `<button type="button" class="btn btn--ghost btn--sm top-nav__repairs" id="nav-repairs-btn">🔧 R\xE9parations</button>`
      : "";

    nav.innerHTML = items.map(
      (i) => `<a href="#${i.hash}" class="top-nav__link ${route.name === i.name || route.name === "inspect" && i.name === "home" ? "is-active" : ""}" data-nav="${i.name}">${i.label}</a>`
    ).join("") + breadcrumb + repairsBtn + `<a href="#" class="top-nav__link" id="nav-ai-btn">Assistant IA</a>`;

    nav.querySelectorAll("[data-nav]").forEach((a) => {
      a.addEventListener("click", (e) => {
        e.preventDefault();
        navigate(a.dataset.nav);
      });
    });
    nav.querySelector("#nav-ai-btn")?.addEventListener("click", (e) => {
      e.preventDefault();
      openAiAssistant();
    });
    nav.querySelector("#nav-repairs-btn")?.addEventListener("click", (e) => {
      e.preventDefault();
      const insp = getInspection(route.id);
      if (insp && window._openRepairsModal) window._openRepairsModal(insp);
    });
  }
  function render() {
    applyTopBarBranding(loadProfile());
    renderNav();
    renderTopBarSave();
    switch (route.name) {
      case "new":
        renderNew();
        break;
      case "inspect":
        renderInspect(route.id);
        break;
      case "profile":
        renderProfile();
        break;
      default:
        renderHome();
    }
  }
  function renderDashboardStats(list) {
    const g = computeGlobalStats(list);
    return `
    <div class="dashboard-stats" role="region" aria-label="Statistiques">
      <div class="dash-stat"><strong>${g.total}</strong><span>Total</span></div>
      <div class="dash-stat dash-stat--active"><strong>${g.enCours}</strong><span>En cours</span></div>
      <div class="dash-stat dash-stat--done"><strong>${g.terminees}</strong><span>Termin\xE9es</span></div>
      <div class="dash-stat dash-stat--warn"><strong>${g.ncTotal}</strong><span>NC / \xE0 corriger</span></div>
    </div>`;
  }
  function openNormsModal() {
    const normes = [
      { id: "bnq", label: "BNQ 3009-500", file: "assets/SOD_3009-500_EN_R2022.pdf" },
      { id: "aibq", label: "AIBQ", file: "assets/normes-de-pratique-pour-linspection-de-batiments AIBQ.pdf" },
      { id: "internachi", label: "InterNACHI", file: "assets/normes-de-pratique-pour-linspection-de-batiments INTERNACHI.pdf" },
      { id: "ibc", label: "IBC", file: "assets/normes-de-pratique-pour-linspection-de-batiments-r-ibc.pdf" }
    ];
    let activeTab = 0;
    const overlay = document.createElement("div");
    overlay.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:9000;display:flex;flex-direction:column;";
    function renderTabs() {
      overlay.innerHTML = `
        <div style="background:#0c3d5c;color:white;padding:0.75rem 1rem;display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap;flex-shrink:0;">
          <strong style="margin-right:auto;">Normes de pratique</strong>
          ${normes.map((n, i) => `<button data-tab="${i}" style="padding:4px 12px;border-radius:20px;border:none;cursor:pointer;font-size:0.85rem;background:${i === activeTab ? "white" : "rgba(255,255,255,0.2)"};color:${i === activeTab ? "#0c3d5c" : "white"};font-weight:${i === activeTab ? "bold" : "normal"}">${n.label}</button>`).join("")}
          <button id="close-normes" style="margin-left:0.5rem;background:none;border:none;color:white;font-size:1.8rem;cursor:pointer;line-height:1;padding:0 4px;">&times;</button>
        </div>
        <iframe src="${normes[activeTab].file}" style="flex:1;border:none;width:100%;" title="${normes[activeTab].label}"></iframe>
      `;
      overlay.querySelectorAll("[data-tab]").forEach((btn) => {
        btn.addEventListener("click", () => { activeTab = +btn.dataset.tab; renderTabs(); });
      });
      overlay.querySelector("#close-normes").addEventListener("click", () => overlay.remove());
    }
    renderTabs();
    document.body.appendChild(overlay);
  }
  function handleFeatureCard(action) {
    const inspections = loadInspections();
    const last = inspections[0] || null;
    switch (action) {
      case "logo":
        navigate("profile");
        break;
      case "normes":
        openNormsModal();
        break;
      case "photos":
        if (last) navigate("inspect", { id: last.id, tab: "checklist" });
        else toast("Aucune inspection \u2014 cr\xE9ez-en une d'abord.", "info");
        break;
      case "rapport":
        if (last) navigate("inspect", { id: last.id, tab: "final" });
        else toast("Aucune inspection \u2014 cr\xE9ez-en une d'abord.", "info");
        break;
      case "dossier":
        if (last) navigate("inspect", { id: last.id, tab: "info" });
        else toast("Aucune inspection \u2014 cr\xE9ez-en une d'abord.", "info");
        break;
      case "offline":
        toast("KZO Inspect fonctionne hors ligne \u2014 vos donn\xE9es sont sauvegard\xE9es localement sur cet appareil.", "info");
        break;
    }
  }
  function renderFeatureStrip() {
    const items = [
      { icon: "\u{1F3A8}", label: "Votre logo & marque", action: "logo" },
      { icon: "\u{1F4CB}", label: "BNQ & AIBQ", action: "normes" },
      { icon: "\u{1F4F7}", label: "Photos terrain", action: "photos" },
      { icon: "\u{1F4C4}", label: "Rapport PDF", action: "rapport" },
      { icon: "\u{1F4C1}", label: "Dossier BV", action: "dossier" },
      { icon: "\u2601\uFE0F", label: "Hors ligne", action: "offline" }
    ];
    return `<section class="features" aria-label="Fonctionnalit\xE9s">${items.map(
      (f) => `<article class="feature-card" data-feature="${f.action}" role="button" tabindex="0"><span class="feature-card__icon">${f.icon}</span><p class="feature-card__label">${f.label}</p></article>`
    ).join("")}</section>`;
  }
  function renderHome() {
    const list = loadInspections().map((i) => {
      normalizeVisit(i);
      return i;
    });
    const filter = route.filter || "all";
    const q = (route.q || "").toLowerCase();
    const filtered = list.filter((i) => {
      if (filter !== "all" && i.status !== filter) return false;
      if (!q) return true;
      const hay = [
        i.site.client,
        i.site.proprietaire,
        i.site.courtier,
        i.site.adresse,
        i.site.ville,
        i.templateLabel,
        i.site.numeroDossier
      ].join(" ").toLowerCase();
      return hay.includes(q);
    });
    const branding = resolveBranding(loadProfile());
    const heroLogo = getHeroLogoUrl(loadProfile());
    main.innerHTML = `
    <section class="hero">
      <div class="hero__brand">
        <img class="hero__logo" src="${heroLogo}" alt="${escapeAttr(branding.appName)}" width="280" height="80" decoding="async" />
      </div>
      <p class="hero__eyebrow">KZO Inspect \xB7 Qu\xE9bec</p>
      <h2 class="hero__title">Votre studio d'inspection professionnel</h2>
      <p class="hero__desc">Planifiez, inspectez et livrez des rapports AIBQ &amp; BNQ \u2014 avec votre logo, vos photos et vos dossiers clients. Plus complet qu'un logiciel r\xE9seau g\xE9n\xE9rique.</p>
      <div class="hero__actions">
        <button type="button" class="btn btn--primary" id="btn-new-home">+ Nouvelle inspection</button>
        <button type="button" class="btn btn--ghost" id="btn-goto-profile">Mon profil &amp; logo</button>
      </div>
    </section>

    ${renderDashboardStats(list)}
    ${renderFeatureStrip()}

    <div class="section-head">
      <h3 class="section-head__title">Mes dossiers</h3>
      <span class="page-desc">${list.length} inspection${list.length !== 1 ? "s" : ""} \xB7 ${formatBytes(estimateStorageUsage())}</span>
    </div>

    <div class="toolbar">
      <input type="search" class="input input--search" id="search-inspections" placeholder="Rechercher client, adresse, dossier\u2026" value="${escapeAttr(route.q || "")}" />
      <select class="input" id="filter-status">
        <option value="all" ${filter === "all" ? "selected" : ""}>Tous les statuts</option>
        ${Object.entries(INSPECTION_STATUS).map(
      ([k, v]) => `<option value="${k}" ${filter === k ? "selected" : ""}>${v.label}</option>`
    ).join("")}
      </select>
    </div>

    ${filtered.length === 0 ? `<div class="empty-state">
            <p class="empty-state__icon">\u{1F4CB}</p>
            <h3>Aucune inspection</h3>
            <p>Cr\xE9ez une inspection : normes AIBQ et BNQ 3009-500, \xE9tat des lieux, CBQ, CNESST, MAPAQ\u2026</p>
            <button type="button" class="btn btn--primary" id="btn-new-empty">Commencer</button>
          </div>` : `<div class="card-grid">${filtered.map((i) => inspectionCard(i)).join("")}</div>`}
  `;
    document.getElementById("btn-new-home")?.addEventListener("click", () => navigate("new"));
    document.getElementById("btn-goto-profile")?.addEventListener("click", () => navigate("profile"));
    document.getElementById("btn-new-empty")?.addEventListener("click", () => navigate("new"));
    document.getElementById("search-inspections")?.addEventListener("input", (e) => {
      route.q = e.target.value;
      renderHome();
    });
    document.getElementById("filter-status")?.addEventListener("change", (e) => {
      route.filter = e.target.value;
      renderHome();
    });
    main.querySelectorAll("[data-open]").forEach((btn) => {
      btn.addEventListener("click", () => navigate("inspect", { id: btn.dataset.open }));
    });
    main.querySelectorAll("[data-duplicate]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const copy = duplicateInspection(btn.dataset.duplicate);
        if (copy) {
          toast("Inspection dupliqu\xE9e", "success");
          navigate("inspect", { id: copy.id });
        }
      });
    });
    main.querySelectorAll("[data-delete]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        if (await confirmAction("Supprimer", "Cette inspection et ses documents seront supprim\xE9s d\xE9finitivement.")) {
          await deleteInspection(btn.dataset.delete);
          toast("Inspection supprim\xE9e", "success");
          renderHome();
        }
      });
    });
    main.querySelectorAll("[data-feature]").forEach((card) => {
      card.addEventListener("click", () => handleFeatureCard(card.dataset.feature));
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleFeatureCard(card.dataset.feature); }
      });
    });
  }
  function inspectionCard(i) {
    const stats = computeStats(i);
    const st = INSPECTION_STATUS[i.status] ?? INSPECTION_STATUS.brouillon;
    const visitLabel = formatVisitDateTime(i);
    const dateLabel = visitLabel !== "\u2014" ? visitLabel : formatShortDate(i.updatedAt);
    return `
    <article class="card" data-id="${i.id}">
      <div class="card__head">
        <span class="card__icon">${TEMPLATE_META[i.templateId]?.icon ?? "\u{1F4CB}"}</span>
        <div>
          <h3 class="card__title">${escapeHtml9(i.site.client || i.templateLabel)}</h3>
          <p class="card__sub">${escapeHtml9(i.site.adresse || "Adresse non renseign\xE9e")}</p>
        </div>
        <span class="badge ${st.class}">${st.label}</span>
      </div>
      <p class="card__meta">${escapeHtml9(i.templateLabel)} \xB7 ${escapeHtml9(dateLabel)}</p>
      <div class="progress-bar" aria-label="Progression ${stats.progress}%">
        <div class="progress-bar__fill" style="width:${stats.progress}%"></div>
      </div>
      <div class="card__actions">
        <button type="button" class="btn btn--sm btn--primary" data-open="${i.id}">Ouvrir</button>
        <button type="button" class="btn btn--sm btn--ghost" data-duplicate="${i.id}">Dupliquer</button>
        <button type="button" class="btn btn--sm btn--ghost" data-delete="${i.id}">Supprimer</button>
      </div>
    </article>`;
  }
  function renderNew() {
    const grouped = Object.entries(TEMPLATE_GROUPS).sort((a, b) => a[1].order - b[1].order).map(([groupId, groupMeta]) => {
      const templates = Object.values(TEMPLATE_META).filter(
        (t) => (t.group || "autre") === groupId
      );
      if (templates.length === 0) return "";
      const cards = templates.map(
        (t) => `
        <button type="button" class="template-card ${groupId === "aibq-bnq" ? "template-card--featured" : ""}" data-template="${t.id}">
          <span class="template-card__icon">${t.icon}</span>
          <h3>${escapeHtml9(t.label)}</h3>
          <p class="template-card__norme">${escapeHtml9(t.norme)}</p>
          <p class="template-card__desc">${escapeHtml9(t.description)}</p>
        </button>`
      ).join("");
      return `
        <section class="template-group">
          <h3 class="template-group__title">${escapeHtml9(groupMeta.label)}</h3>
          <div class="template-grid">${cards}</div>
        </section>`;
    }).join("");
    main.innerHTML = `
    <button type="button" class="btn btn--ghost btn--back" id="btn-back">\u2190 Retour</button>
    <section class="page-hero-sm">
      <h2 class="page-title">Nouvelle inspection</h2>
      <p class="page-desc">Choisissez un mod\xE8le conforme aux normes qu\xE9b\xE9coises \u2014 AIBQ pr\xE9achat, BNQ 3009-500, et plus.</p>
    </section>
    ${grouped}
  `;
    document.getElementById("btn-back").addEventListener("click", () => navigate("home"));
    main.querySelectorAll("[data-template]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const profile = loadProfile();
        const inspection = createEmptyInspection(btn.dataset.template);
        inspection.inspector = inspectorFieldsFromProfile(profile);
        inspection.site.numeroDossier = nextDossierNumber();
        inspection.status = "en-cours";
        upsertInspection(inspection);
        toast("Inspection cr\xE9\xE9e", "success");
        navigate("inspect", { id: inspection.id });
      });
    });
  }
  function renderInspect(id) {
    renderTopBarSave();
    const inspection = getInspection(id);
    if (!inspection) {
      main.innerHTML = `<div class="empty-state"><h3>Inspection introuvable</h3><button class="btn btn--primary" id="go-home">Retour</button></div>`;
      document.getElementById("go-home").onclick = () => navigate("home");
      return;
    }
    const stats = computeStats(inspection);
    const tab = route.tab || "info";
    main.innerHTML = `
    <section class="inspect-header">
      <div style="display:flex;gap:0.5rem;align-items:center;">
        <button type="button" class="btn btn--ghost btn--back" id="btn-back">\u2190 Liste</button>
      </div>
      <div class="inspect-header__main">
        <h2 class="page-title">${escapeHtml9(inspection.site.client || inspection.templateLabel)}</h2>
        <p class="page-desc">${escapeHtml9(inspection.templateLabel)} \u2014 ${escapeHtml9(inspection.norme)}</p>
        ${inspection.site.numeroDossier ? `<p class="page-desc">Dossier ${escapeHtml9(inspection.site.numeroDossier)}</p>` : ""}
        ${inspection.visit?.date ? `<p class="page-desc page-desc--visit">\u{1F4C5} ${escapeHtml9(formatVisitDateTime(inspection))}</p>` : ""}
        <div class="inspect-stats">
          ${stats.nonConforme > 0 ? `<span class="stat-pill stat-pill--danger">${stats.nonConforme} NC</span>` : ""}
          ${stats.aCorriger > 0 ? `<span class="stat-pill stat-pill--danger">${stats.aCorriger} \xE0 corriger</span>` : ""}
        </div>
      </div>
      <div class="progress-ring" style="--pct: ${stats.progress}" aria-label="Progression ${stats.progress}%">
        <div class="progress-ring__inner">
          ${stats.progress}<small>%</small>
        </div>
      </div>
    </section>

    <div class="inspect-layout-split" style="display: flex; gap: 2rem; align-items: flex-start; margin-top: 1rem;">
      <div class="inspect-sidebar" style="flex: 0 0 300px; position: sticky; top: 1rem; max-height: calc(100vh - 2rem); overflow-y: auto; padding-right: 1rem; border-right: 1px solid var(--border, #e2e8f0);">
        <div class="section-list-header section-list-header--rail">
          <h3 class="section-list-header__title" style="margin-bottom: 1rem; font-size: 1.1rem;">Dossier</h3>
        </div>
        <ol class="section-list section-list--rail" style="list-style: none; padding: 0; margin: 0 0 2rem 0; display: flex; flex-direction: column; gap: 0.25rem;">
          <li class="section-list__item ${tab === "info" ? "section-list__item--active" : ""}">
            <button type="button" class="section-list__btn tabs__btn" data-tab="info" style="text-align: left; padding: 0.5rem; width: 100%; display: flex; gap: 0.5rem; border: none; background: transparent; cursor: pointer; border-radius: 4px; ${tab === "info" ? "background: #e2e8f0; font-weight: bold;" : ""}">
              <span class="section-list__title">Informations g\xE9n\xE9rales</span>
            </button>
          </li>
          <li class="section-list__item ${tab === "final" ? "section-list__item--active" : ""}">
            <button type="button" class="section-list__btn tabs__btn" data-tab="final" style="text-align: left; padding: 0.5rem; width: 100%; display: flex; gap: 0.5rem; border: none; background: transparent; cursor: pointer; border-radius: 4px; ${tab === "final" ? "background: #e2e8f0; font-weight: bold;" : ""}">
              <span class="section-list__title">Cl\xF4ture & Re\xE7u</span>
            </button>
          </li>
        </ol>

        <div id="checklist-rail-container"></div>
      </div>

      <div class="inspect-main" style="flex: 1; min-width: 0;" id="inspect-main-content">
      </div>
    </div>

    <div class="action-bar">
      <button type="button" class="btn btn--ghost" id="btn-save">Enregistrer</button>
      <button type="button" class="btn btn--ghost" id="btn-duplicate-inspect" title="Dupliquer ce dossier">Dupliquer</button>
      <button type="button" class="btn btn--secondary" id="btn-report">Rapport PDF</button>
      <button type="button" class="btn btn--secondary" id="btn-thanks">Lettre merci</button>
      <button type="button" class="btn btn--secondary" id="btn-receipt">Re\xE7u</button>
      <button type="button" class="btn btn--secondary" id="btn-facture">&#x1F4E7; Facture</button>
      <select class="input input--sm" id="status-select">
        ${Object.entries(INSPECTION_STATUS).map(
      ([k, v]) => `<option value="${k}" ${inspection.status === k ? "selected" : ""}>${v.label}</option>`
    ).join("")}
      </select>
    </div>
  `;
    const mainContent = document.getElementById("inspect-main-content");
    const railContainer = document.getElementById("checklist-rail-container");
    const sidebar = document.querySelector(".inspect-sidebar");
    railContainer.innerHTML = renderSectionListRail(inspection, route);
    if (tab === "checklist") {
      const filter = route.checklistFilter || "all";
      mainContent.innerHTML = renderChecklistToolbar(inspection, filter) + renderChecklistMainPane(inspection, route);
      bindChecklist(inspection, mainContent);
    } else if (tab === "info") {
      mainContent.innerHTML = renderInfoTab(inspection);
      bindInfoForm(inspection, mainContent);
    } else {
      mainContent.innerHTML = renderFinalTab(inspection);
      bindFinal(inspection, mainContent);
    }
    bindInspectEvents(inspection, mainContent, tab);
    bindChecklist(inspection, sidebar);
    updateAiAssistantContext({ inspection });
  }
  function isImmoNormTemplate(templateId) {
    return templateId === "aibq-preachat" || templateId === "bnq-3009";
  }
  function renderInfoTab(i) {
    const immo = isImmoNormTemplate(i.templateId);
    const categorieBnq = i.site.categorieBnq || "";
    const v = i.visit ?? defaultVisit();
    const cielOptions = CIEL_OPTIONS.map(
      (o) => `<option value="${o.value}" ${v.conditionsCiel === o.value ? "selected" : ""}>${escapeHtml9(o.label)}</option>`
    ).join("");
    return `
    <form class="form-grid" id="form-info">
      <fieldset>
        <legend>Normes de l'inspection (visuel)</legend>
        <p class="form-hint form-hint--compact">L'inspection reste visuelle et non certifiante.</p>
        <label>Norme appliqu\xE9e
          <select class="input" name="norme">
            ${[
      "Norme de pratique AIBQ (pr\xE9achat r\xE9sidentiel)",
      "Norme IBC (R\xE9seau des Inspecteurs en B\xE2timent Certifi\xE9s du Qu\xE9bec)",
      "BNQ 3009-500/2022 R1 \u2014 inspection r\xE9sidentielle",
      "Code du b\xE2timent du Qu\xE9bec (CBQ)",
      "Autre norme"
    ].map((n) => `<option value="${escapeAttr(n)}" ${i.norme === n ? "selected" : ""}>${escapeHtml9(n)}</option>`).join("")}
            ${!["Norme de pratique AIBQ (pr\xE9achat r\xE9sidentiel)", "Norme IBC (R\xE9seau des Inspecteurs en B\xE2timent Certifi\xE9s du Qu\xE9bec)", "BNQ 3009-500/2022 R1 \u2014 inspection r\xE9sidentielle", "Code du b\xE2timent du Qu\xE9bec (CBQ)", "Autre norme"].includes(i.norme) && i.norme ? `<option value="${escapeAttr(i.norme)}" selected>${escapeHtml9(i.norme)}</option>` : ""}
          </select>
        </label>
      </fieldset>
      <fieldset>
        <legend>Client et mandat</legend>
        <label>Nom du client (demandeur) *<input class="input" name="client" value="${escapeAttr(i.site.client)}" placeholder="Acheteur, propri\xE9taire, syndicat\u2026" required /></label>
        <label>Propri\xE9taire / vendeur (si diff\xE9rent)<input class="input" name="proprietaire" value="${escapeAttr(i.site.proprietaire || "")}" /></label>
        <div class="form-row-2">
          <label>Courriel client<input class="input" type="email" name="courrielClient" value="${escapeAttr(i.site.courrielClient || "")}" /></label>
          <label>T\xE9l\xE9phone client<input class="input" type="tel" name="telephoneClient" value="${escapeAttr(i.site.telephoneClient || "")}" /></label>
        </div>
        ${immo ? `<label>Mandat / contexte<input class="input" name="mandat" value="${escapeAttr(i.site.mandat || "")}" placeholder="Pr\xE9achat, pr\xE9vente, copropri\xE9t\xE9\u2026" /></label>` : ""}
        <label>N\xBA de dossier<input class="input" name="numeroDossier" value="${escapeAttr(i.site.numeroDossier)}" /></label>
        <label>Type de b\xE2timent
          <select class="input" name="typeBatiment">
            <option value="">\u2014 S\xE9lectionner \u2014</option>
            ${["Unifamilial", "Condo", "Duplex", "Triplex", "Multiplex", "Commercial", "Autre"].map((tb) => `
              <option value="${escapeAttr(tb)}" ${i.site.typeBatiment === tb ? "selected" : ""}>${escapeHtml9(tb)}</option>
            `).join("")}
          </select>
        </label>
      </fieldset>
      <fieldset class="client-files-fieldset">
        <legend>Dossier client et documents</legend>
        <p class="form-hint form-hint--compact">PDF, images, Word (.docx). Stockage local sur cet appareil (max 20 Mo / fichier).</p>
        <div id="client-files-panel" class="client-files" data-inspection-id="${escapeAttr(i.id)}">
          <p class="client-files__loading">Chargement du dossier\u2026</p>
        </div>
      </fieldset>
      <fieldset>
        <legend>Visite d'inspection</legend>
        <div class="form-row-2">
          <label>Date d'inspection<input class="input" type="date" name="visitDate" value="${escapeAttr(v.date)}" /></label>
          <label>Heure de d\xE9but<input class="input" type="time" name="heureDebut" value="${escapeAttr(v.heureDebut)}" /></label>
        </div>
        <div class="form-row-2">
          <label>Heure de fin<input class="input" type="time" name="heureFin" value="${escapeAttr(v.heureFin)}" /></label>
          <label>Conditions du ciel<select class="input" name="conditionsCiel">${cielOptions}</select></label>
        </div>
        <label>M\xE9t\xE9o / observations m\xE9t\xE9o<textarea class="input" name="meteo" rows="2" placeholder="Ex. : Ciel d\xE9gag\xE9, humidit\xE9 \xE9lev\xE9e, route glac\xE9e\u2026">${escapeHtml9(v.meteo)}</textarea></label>
        <div class="form-row-2">
          <label>Temp\xE9rature ext\xE9rieure (\xB0C)<input class="input" name="temperatureAir" value="${escapeAttr(v.temperatureAir)}" placeholder="-12" inputmode="decimal" /></label>
          <label>Pr\xE9cipitations<input class="input" name="precipitation" value="${escapeAttr(v.precipitation)}" placeholder="Aucune, l\xE9g\xE8re, forte\u2026" /></label>
        </div>
        <div class="form-row-2">
          <label>Vent<input class="input" name="vent" value="${escapeAttr(v.vent)}" placeholder="Calme, mod\xE9r\xE9, 40 km/h NW\u2026" /></label>
          <label>Visibilit\xE9<input class="input" name="visibilite" value="${escapeAttr(v.visibilite)}" placeholder="Bonne, r\xE9duite\u2026" /></label>
        </div>
        <label>Neige ou glace au sol<input class="input" name="neigeAuSol" value="${escapeAttr(v.neigeAuSol)}" placeholder="Aucune, partielle, toit enneig\xE9 non visit\xE9\u2026" /></label>
        <label>Personnes pr\xE9sentes (AIBQ / BNQ art. 14.2)<textarea class="input" name="personnesPresentes" rows="2" placeholder="Client, vendeur, agent, aucune\u2026">${escapeHtml9(v.personnesPresentes)}</textarea></label>
        <button type="button" class="btn btn--ghost btn--sm" id="btn-visit-now">Horodatage maintenant</button>
      </fieldset>
      <fieldset class="cover-photo-fieldset">
        <legend>Photo de couverture \u2014 1<sup>re</sup> page du rapport</legend>
        <p class="form-hint form-hint--compact">Grande photo de la fa\xE7ade ou de la propri\xE9t\xE9. Elle appara\xEEt en page 1 du rapport PDF (format paysage visuel pleine page).</p>
        <div class="cover-photo-editor" id="cover-photo-editor">
          ${i.coverPhotoDataUrl ? `<div class="cover-photo-preview">
                  <img src="${safeImgSrc(i.coverPhotoDataUrl)}" alt="Photo de couverture" class="cover-photo-preview__img" />
                  <div class="cover-photo-preview__overlay">
                    <span class="cover-photo-preview__label">Aper\xE7u page de couverture</span>
                  </div>
                </div>` : `<div class="cover-photo-placeholder">
                  <span class="cover-photo-placeholder__icon">\u{1F3E0}</span>
                  <p>Ajoutez une photo pour une premi\xE8re page professionnelle</p>
                </div>`}
          <label class="btn btn--primary cover-photo-upload">
            \u{1F4F7} ${i.coverPhotoDataUrl ? "Remplacer la photo" : "Ajouter la photo de la maison"}
            <input type="file" accept="image/*" hidden id="cover-photo-input" />
          </label>
          ${i.coverPhotoDataUrl ? `<button type="button" class="btn btn--ghost btn--sm" id="btn-remove-cover">Retirer la photo</button>` : ""}
          <label>L\xE9gende sous la photo (optionnel)<input class="input" name="coverPhotoCaption" value="${escapeAttr(i.coverPhotoCaption || "")}" placeholder="Fa\xE7ade avant, vue nord-est\u2026" /></label>
        </div>
      </fieldset>
      <fieldset>
        <legend>Site inspect\xE9</legend>
        <label>Adresse<input class="input" name="adresse" value="${escapeAttr(i.site.adresse)}" /></label>
        <label>Ville<input class="input" name="ville" value="${escapeAttr(i.site.ville)}" /></label>
        <label>Code postal<input class="input" name="codePostal" value="${escapeAttr(i.site.codePostal)}" placeholder="H2X 1Y4" /></label>
        <div class="form-row-2">
          <label>Ann\xE9e de construction<input class="input" type="number" name="anneeConstruction" id="anneeConstruction" value="${escapeAttr(String(i.site.anneeConstruction || ""))}" placeholder="Ex. 1978" min="1850" max="${new Date().getFullYear()}" inputmode="numeric" /></label>
          <label>Ann\xE9e de r\xE9novation majeure<input class="input" type="number" name="anneeRenovation" value="${escapeAttr(String(i.site.anneeRenovation || ""))}" placeholder="Ex. 2005" min="1850" max="${new Date().getFullYear()}" inputmode="numeric" /></label>
        </div>
        ${(() => {
          const yr = parseInt(i.site.anneeConstruction) || 0;
          if (!yr) return "";
          const alerts = [];
          if (yr < 1980) alerts.push("âš ï¸ <strong>Amiante probable</strong> â€” bardeaux amiante-ciment, plafond popcorn, tuiles 30\xD730, isolant vermiculite \xE0 v\xE9rifier");
          if (yr < 1975) alerts.push("âš ï¸ <strong>Plomb</strong> â€” peinture au plomb et tuyaux de plomb possibles");
          if (yr >= 1975 && yr <= 1982) alerts.push("âš ï¸ <strong>FUUF</strong> â€” mousse ur\xE9e-formald\xE9hyde possible dans les murs (interdit 1980)");
          if (yr < 1990) alerts.push("âš ï¸ <strong>Mercure</strong> â€” thermostats \xE0 ampoule de mercure probables, <strong>BPC</strong> possible (ballasts n\xE9on)");
          if (yr >= 1985 && yr <= 2005) alerts.push("âš ï¸ <strong>Polybutyl\xE8ne (Poly-B)</strong> â€” tuyaux gris possible (produit retir\xE9)");
          alerts.push("ðŸ” <strong>Pyrite</strong> â€” v\xE9rifier dalle b\xE9ton (zones \xE0 risque QC ind\xE9pendamment de l'ann\xE9e)");
          alerts.push("ðŸ” <strong>Radon</strong> â€” test recommand\xE9 si sous-sol habitable");
          return `<div class="form-alert form-alert--warn" style="grid-column:1/-1;padding:0.75rem 1rem;background:#fffbeb;border:1px solid #f59e0b;border-radius:8px;font-size:0.85rem;line-height:1.6">
            <strong>ðŸ  B\xE2timent ${yr} â€” \xC9l\xE9ments \xE0 v\xE9rifier selon l'ann\xE9e</strong><br />${alerts.join("<br />")}
          </div>`;
        })()}
        ${i.templateId === "bnq-3009" ? `
        <label>Cat\xE9gorie BNQ (\xA72.1)
          <select class="input" name="categorieBnq">
            <option value="">\u2014 S\xE9lectionner \u2014</option>
            <option value="cat1" ${categorieBnq === "cat1" ? "selected" : ""}>Cat\xE9gorie 1 (1 \xE0 6 logements)</option>
            <option value="cat2" ${categorieBnq === "cat2" ? "selected" : ""}>Cat\xE9gorie 2 (7 logements et +)</option>
          </select>
        </label>` : ""}
      </fieldset>
      <fieldset>
        <legend>Inspecteur</legend>
        <label>Inspecteur<input class="input" name="nom" value="${escapeAttr(INSPECTOR_NAME)}" readonly title="Nom de l'inspecteur titulaire" /></label>
        <label>Permis / RBQ / certification<input class="input" name="permis" value="${escapeAttr(i.inspector.permis)}" /></label>
        ${immo ? `
        <label>N\xBA membre AIBQ<input class="input" name="membreAibq" value="${escapeAttr(i.inspector.membreAibq || "")}" placeholder="Si membre AIBQ" /></label>
        <label>Certificat inspecteur RBQ<input class="input" name="certificatRbq" value="${escapeAttr(i.inspector.certificatRbq || "")}" placeholder="Obligatoire selon r\xE8glement RBQ" /></label>` : ""}
        <label>Entreprise<input class="input" name="entreprise" value="${escapeAttr(i.inspector.entreprise)}" /></label>
        <label>Courriel<input class="input" type="email" name="courriel" value="${escapeAttr(i.inspector.courriel)}" /></label>
        <label>T\xE9l\xE9phone<input class="input" type="tel" name="telephone" value="${escapeAttr(i.inspector.telephone)}" /></label>
      </fieldset>
    </form>`;
  }
  async function mountClientFilesPanel(inspection, panel) {
    const container = panel.querySelector("#client-files-panel");
    if (!container) return;
    const categoryOptions = FILE_CATEGORIES.map(
      (c) => `<option value="${c.value}">${escapeHtml9(c.label)}</option>`
    ).join("");
    const renderList = async () => {
      try {
        const files = await listClientFiles(inspection.id);
        const total = files.reduce((s, f) => s + f.size, 0);
        const listHtml = files.length === 0 ? `<p class="client-files__empty">Aucun document. Ajoutez le BV, la convention, la d\xE9claration vendeur, etc.</p>` : `<ul class="client-files__list">
              ${files.map(
          (f) => `
                <li class="client-files__item" data-file-id="${f.id}">
                  <div class="client-files__item-head">
                    <span class="client-files__icon">${fileIcon(f.mimeType, f.name)}</span>
                    <div class="client-files__item-meta">
                      <strong class="client-files__name">${escapeHtml9(f.name)}</strong>
                      <span class="client-files__tags">${escapeHtml9(categoryLabel(f.category))} \xB7 ${formatFileSize(f.size)}</span>
                    </div>
                  </div>
                  <select class="input input--sm client-files__cat" data-file-cat="${f.id}">
                    ${FILE_CATEGORIES.map(
            (c) => `<option value="${c.value}" ${f.category === c.value ? "selected" : ""}>${escapeHtml9(c.label)}</option>`
          ).join("")}
                  </select>
                  <input class="input input--sm client-files__note" data-file-note="${f.id}" value="${escapeAttr(f.note || "")}" placeholder="Note\u2026" />
                  <div class="client-files__actions">
                    <button type="button" class="btn btn--sm btn--ghost" data-file-open="${f.id}">Ouvrir</button>
                    <button type="button" class="btn btn--sm btn--ghost" data-file-dl="${f.id}">T\xE9l\xE9charger</button>
                    <button type="button" class="btn btn--sm btn--ghost btn--danger-text" data-file-del="${f.id}">Supprimer</button>
                  </div>
                </li>`
        ).join("")}
            </ul>`;
        container.innerHTML = `
        <div class="client-files__upload">
          <label class="client-files__drop">
            <input type="file" id="client-file-input" multiple accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp,.heic,.xls,.xlsx,.txt,image/*,application/pdf" hidden />
            <span class="client-files__drop-text">Glissez des fichiers ici ou <u>parcourir</u></span>
          </label>
          <div class="client-files__upload-row">
            <select class="input input--sm" id="client-file-category">${categoryOptions}</select>
            <input class="input input--sm" id="client-file-note" placeholder="Note (optionnel)" />
          </div>
        </div>
        <p class="client-files__summary">${files.length} fichier${files.length !== 1 ? "s" : ""} \xB7 ${formatFileSize(total)} au total</p>
        ${listHtml}`;
        bindClientFilesEvents(inspection, container);
      } catch {
        container.innerHTML = `<p class="client-files__error">Impossible d'acc\xE9der au stockage des fichiers.</p>`;
      }
    };
    await renderList();
  }
  function fileIcon(mime, name) {
    if (mime?.includes("pdf") || name?.toLowerCase().endsWith(".pdf")) return "\u{1F4C4}";
    if (mime?.startsWith("image/")) return "\u{1F5BC}\uFE0F";
    if (mime?.includes("word") || name?.match(/\.docx?$/i)) return "\u{1F4DD}";
    if (mime?.includes("sheet") || name?.match(/\.xlsx?$/i)) return "\u{1F4CA}";
    return "\u{1F4CE}";
  }
  function refreshClientFilesPanel(inspection) {
    const panel = document.getElementById("tab-content");
    if (panel) mountClientFilesPanel(inspection, panel);
  }
  function bindClientFilesEvents(inspection, container) {
    const input = container.querySelector("#client-file-input");
    const drop = container.querySelector(".client-files__drop");
    const uploadFiles = async (fileList) => {
      const category = container.querySelector("#client-file-category")?.value || "autre";
      const note = container.querySelector("#client-file-note")?.value || "";
      let ok = 0;
      for (const file of fileList) {
        try {
          await addClientFile(inspection.id, file, { category, note });
          ok += 1;
        } catch (e) {
          toast(e.message || `\xC9chec : ${file.name}`, "error");
        }
      }
      if (ok) {
        toast(`${ok} fichier${ok > 1 ? "s" : ""} ajout\xE9${ok > 1 ? "s" : ""}`, "success");
        refreshClientFilesPanel(inspection);
      }
    };
    input?.addEventListener("change", () => {
      if (input.files?.length) uploadFiles([...input.files]);
      input.value = "";
    });
    drop?.addEventListener("dragover", (e) => {
      e.preventDefault();
      drop.classList.add("is-dragover");
    });
    drop?.addEventListener("dragleave", () => drop.classList.remove("is-dragover"));
    drop?.addEventListener("drop", (e) => {
      e.preventDefault();
      drop.classList.remove("is-dragover");
      if (e.dataTransfer?.files?.length) uploadFiles([...e.dataTransfer.files]);
    });
    container.querySelectorAll("[data-file-del]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        if (await confirmAction("Supprimer le fichier", "Ce document sera retir\xE9 du dossier client.")) {
          await deleteClientFile(btn.dataset.fileDel);
          toast("Fichier supprim\xE9", "success");
          refreshClientFilesPanel(inspection);
        }
      });
    });
    container.querySelectorAll("[data-file-dl]").forEach((btn) => {
      btn.addEventListener("click", () => downloadClientFile(btn.dataset.fileDl));
    });
    container.querySelectorAll("[data-file-open]").forEach((btn) => {
      btn.addEventListener("click", () => openClientFile(btn.dataset.fileOpen));
    });
    container.querySelectorAll("[data-file-cat]").forEach((sel) => {
      sel.addEventListener("change", async () => {
        await updateClientFileMeta(sel.dataset.fileCat, { category: sel.value });
      });
    });
    container.querySelectorAll("[data-file-note]").forEach((inp) => {
      inp.addEventListener("change", async () => {
        await updateClientFileMeta(inp.dataset.fileNote, { note: inp.value });
      });
    });
  }
  function bindVisitNowButton(panel, inspection) {
    panel.querySelector("#btn-visit-now")?.addEventListener("click", () => {
      const now = defaultVisit();
      const form = panel.querySelector("#form-info");
      if (!form) return;
      form.visitDate.value = now.date;
      form.heureDebut.value = now.heureDebut;
      if (!form.heureFin.value) form.heureFin.value = now.heureDebut;
      scheduleAutosave(inspection, "info", panel);
      toast("Date et heure mises \xE0 jour", "success");
    });
  }
  function renderExpertReferralsBlock(i) {
    if (!i.expertReferrals) i.expertReferrals = [];
    const rows = i.expertReferrals.map(
      (ref, idx) => `
      <div class="expert-row" data-expert-idx="${idx}">
        <select class="input input--sm" data-expert-type data-idx="${idx}">
          ${EXPERT_TYPES.map((t) => `<option value="${t.value}" ${ref.type === t.value ? "selected" : ""}>${escapeHtml9(t.label)}</option>`).join("")}
        </select>
        <input class="input input--sm" data-expert-motif data-idx="${idx}" value="${escapeAttr(ref.motif || "")}" placeholder="Motif / constat li\xE9" />
        <label class="expert-row__urgent"><input type="checkbox" data-expert-urgent data-idx="${idx}" ${ref.urgent ? "checked" : ""} /> Urgent</label>
        <button type="button" class="btn btn--ghost btn--sm" data-expert-del data-idx="${idx}">\xD7</button>
      </div>`
    ).join("");
    return `
    <fieldset class="expert-fieldset">
      <legend>Recommandations d'experts</legend>
      <p class="form-hint form-hint--compact">Sp\xE9cialistes \xE0 consulter suite aux constats (bonne pratique BNQ).</p>
      <div id="expert-referrals-list">${rows}</div>
      <button type="button" class="btn btn--ghost btn--sm" id="btn-add-expert">+ Ajouter un sp\xE9cialiste</button>
    </fieldset>`;
  }
  function renderFinalTab(i) {
    const profile = loadProfile();
    const r = normalizeReceipt(i, profile);
    const payModes = PAYMENT_MODES.map(
      (p) => `<option value="${p.value}" ${r.modePaiement === p.value ? "selected" : ""}>${escapeHtml9(p.label)}</option>`
    ).join("");
    const payStatus = PAYMENT_STATUS.map(
      (p) => `<option value="${p.value}" ${r.statutPaiement === p.value ? "selected" : ""}>${escapeHtml9(p.label)}</option>`
    ).join("");
    return `
    <form id="form-final" class="form-final">
      <fieldset class="receipt-fieldset">
        <legend>Re\xE7u d'inspection</legend>
        <label>N\xBA de re\xE7u<input class="input" name="receiptNumero" value="${escapeAttr(r.numero)}" placeholder="Auto : n\xBA dossier ou KZO-YYYYMMDD-\u2026" /></label>
        <label>Description du service<textarea class="input" name="receiptDescription" rows="2">${escapeHtml9(r.description)}</textarea></label>
        <div class="form-row-2">
          <label>Montant avant taxes ($)<input class="input" name="montantHT" id="montant-ht" value="${escapeAttr(r.montantHT)}" inputmode="decimal" placeholder="0.00" /></label>
          <label>Date du paiement<input class="input" type="date" name="datePaiement" value="${escapeAttr(r.datePaiement)}" /></label>
        </div>
        <div class="form-row-2">
          <label>TPS ($)<input class="input" name="receiptTps" id="receipt-tps" value="${escapeAttr(r.tps)}" inputmode="decimal" /></label>
          <label>TVQ ($)<input class="input" name="receiptTvq" id="receipt-tvq" value="${escapeAttr(r.tvq)}" inputmode="decimal" /></label>
        </div>
        <label>Total ($)<input class="input" name="receiptTotal" id="receipt-total" value="${escapeAttr(r.total)}" inputmode="decimal" /></label>
        <button type="button" class="btn btn--ghost btn--sm" id="btn-calc-taxes">Calculer TPS / TVQ (Qu\xE9bec)</button>
        <div class="form-row-2">
          <label>Statut du paiement<select class="input" name="statutPaiement">${payStatus}</select></label>
          <label>Mode de paiement<select class="input" name="modePaiement">${payModes}</select></label>
        </div>
        <label>Note sur le re\xE7u<input class="input" name="receiptNote" value="${escapeAttr(r.note)}" placeholder="Acompte 50 %, facture no\u2026" /></label>
      </fieldset>

      ${renderExpertReferralsBlock(i)}

      <label class="form-block">
        Limitations de l'inspection (rapport BNQ / AIBQ)
        <textarea class="input" name="limitations" rows="4" placeholder="\xC9l\xE9ments non inspect\xE9s, acc\xE8s refus\xE9, conditions m\xE9t\xE9o limitantes\u2026">${escapeHtml9(i.limitations || "")}</textarea>
      </label>
      <label class="form-block">
        Observations g\xE9n\xE9rales (rapport)
        <textarea class="input" name="observations" rows="5" placeholder="R\xE9sum\xE9, recommandations, d\xE9lais de correction\u2026">${escapeHtml9(i.observations)}</textarea>
      </label>
      <label class="form-block">
        Message personnalis\xE9 \u2014 lettre de remerciement au client
        <textarea class="input" name="thankYouNote" rows="4" placeholder="Paragraphe optionnel ajout\xE9 \xE0 la lettre (sinon le message par d\xE9faut du profil est utilis\xE9).">${escapeHtml9(i.thankYouNote || "")}</textarea>
      </label>
      <div class="signature-block">
        <label>Signature du client ou responsable</label>
        <canvas id="signature-canvas" class="signature-canvas" width="400" height="160"></canvas>
        <div class="signature-actions">
          <button type="button" class="btn btn--ghost btn--sm" id="sig-clear">Effacer</button>
        </div>
      </div>
      ${i.signatureDataUrl ? `<p class="sig-preview-label">Signature enregistr\xE9e :</p><img src="${safeImgSrc(i.signatureDataUrl)}" class="sig-preview" alt="Signature" />` : ""}
    </form>`;
  }
  function bindInspectEvents(inspection, panel, tab) {
    document.getElementById("btn-back").onclick = () => navigate("home");
    document.getElementById("btn-save").onclick = () => {
      saveCurrentTab(inspection, tab, panel);
      upsertInspection(inspection);
      toast("Enregistr\xE9", "success");
    };
    const btnLocalSave = document.getElementById("btn-local-save");
    if (btnLocalSave) {
      btnLocalSave.onclick = () => {
        saveCurrentTab(inspection, tab, panel);
        upsertInspection(inspection);
        try {
          exportInspectionBackup(inspection, loadProfile());
          toast("Dossier sauvegard\xE9 sur votre ordinateur \u2713", "success");
          if (localAutoSaveTimer === null) {
            startLocalAutoSave(inspection);
            toast("Auto-sauvegarde locale activ\xE9e (toutes les 2 min) \uD83D\uDCBE", "info");
          }
        } catch (e) {
          toast("Impossible de t\xE9l\xE9charger la sauvegarde.", "error");
        }
      };
    }
    document.getElementById("btn-duplicate-inspect")?.addEventListener("click", () => {
      const copy = duplicateInspection(inspection.id);
      if (copy) {
        toast("Dossier dupliqu\xE9", "success");
        navigate("inspect", { id: copy.id });
      }
    });
    document.getElementById("btn-report").onclick = async () => {
      saveCurrentTab(inspection, tab, panel);
      upsertInspection(inspection);
      // Sauvegarde locale automatique avant gÃ©nÃ©ration du rapport final
      try {
        exportInspectionBackup(inspection, loadProfile());
        toast("Sauvegarde locale du dossier t\xE9l\xE9charg\xE9e", "success");
      } catch (e) {
        console.warn("[KZO] Backup pr\xE9-rapport \xE9chou\xE9 :", e);
      }
      await openReport(inspection);
    };
    document.getElementById("btn-thanks").onclick = () => {
      saveCurrentTab(inspection, tab, panel);
      upsertInspection(inspection);
      openThankYouLetter(inspection, loadProfile());
    };
    document.getElementById("btn-receipt").onclick = () => {
      saveCurrentTab(inspection, tab, panel);
      upsertInspection(inspection);
      openReceipt(inspection, loadProfile());
    };
    document.getElementById("btn-facture")?.addEventListener("click", () => {
      saveCurrentTab(inspection, tab, panel);
      upsertInspection(inspection);
      const mainContent = document.getElementById("inspect-main-content");
      mainContent.innerHTML = renderInvoicePanel(inspection);

      document.getElementById("invoice-payment-status")?.addEventListener("change", (e) => {
        inspection.paymentStatus = e.target.value;
        upsertInspection(inspection);
      });

      document.getElementById("btn-invoice-preview")?.addEventListener("click", () => {
        const html = buildInvoiceHtml(inspection, loadProfile());
        const win = window.open("", "_blank");
        if (!win) { alert("Autorisez les fen\xEAtres contextuelles."); return; }
        win.document.write(html);
        win.document.close();
      });

      document.getElementById("btn-invoice-send")?.addEventListener("click", async () => {
        const to      = document.getElementById("invoice-to")?.value?.trim();
        const subject = document.getElementById("invoice-subject")?.value?.trim();
        if (!to) { toast("Saisissez le courriel du client.", "warn"); return; }
        const btn = document.getElementById("btn-invoice-send");
        btn.disabled = true;
        btn.textContent = "Envoi en cours...";
        try {
          const profile = loadProfile();
          const clientId = profile.googleClientId || "18973787304-0vm4pu6383jn2vni2h996i0ri62iu21s.apps.googleusercontent.com";
          await googleAuthenticate(clientId);
          const html  = buildInvoiceHtml(inspection, profile);
          const token = getGoogleToken();
          await sendInvoiceEmail(to, subject, html, token);
          inspection.invoiceSentAt = (/* @__PURE__ */ new Date()).toISOString();
          upsertInspection(inspection);
          sendReceiptToSheets(inspection, profile);
          toast("Facture envoy\xE9e \xE0 " + to, "success");
          btn.textContent = "Envoy\xE9e";
        } catch (err) {
          toast("Erreur : " + err.message, "error");
          btn.disabled = false;
          btn.textContent = "Envoyer depuis kzoinspectpro@gmail.com";
        }
      });
    });
    document.getElementById("status-select").onchange = (e) => {
      inspection.status = e.target.value;
      if (e.target.value === "terminee") {
        if (!inspection.completedAt) inspection.completedAt = (/* @__PURE__ */ new Date()).toISOString();
        if (!inspection.invoiceNumber) {
          const prof = loadProfile();
          inspection.invoiceNumber = nextInvoiceNumber(prof);
          toast(`Facture ${inspection.invoiceNumber} gÃ©nÃ©rÃ©e`, "success");
        }
      }
      if (!inspection.paymentStatus) inspection.paymentStatus = "pending";
      scheduleAutosave(inspection, tab, panel);
    };
    main.querySelectorAll("[data-tab]").forEach((btn) => {
      btn.addEventListener("click", () => {
        saveCurrentTab(inspection, tab, panel);
        upsertInspection(inspection);
        const nextTab = btn.dataset.tab;
        if (nextTab === "checklist" && tab !== "checklist") {
          route.checklistView = "list";
          route.checklistSection = null;
        }
        route.tab = nextTab;
        renderInspect(inspection.id);
      });
    });
    if (tab === "info") bindInfoForm(inspection, panel);
    if (tab === "checklist") bindChecklist(inspection, panel);
    if (tab === "final") bindFinal(inspection, panel);
  }
  function bindReceiptCalc(panel, inspection) {
    panel.querySelector("#btn-calc-taxes")?.addEventListener("click", () => {
      const profile = loadProfile();
      const ht = panel.querySelector("#montant-ht")?.value;
      const taxes = computeTaxes(ht, profile.tauxTPS ?? 5, profile.tauxTVQ ?? 9.975);
      const tpsEl = panel.querySelector("#receipt-tps");
      const tvqEl = panel.querySelector("#receipt-tvq");
      const totalEl = panel.querySelector("#receipt-total");
      if (tpsEl) tpsEl.value = taxes.tps.toFixed(2);
      if (tvqEl) tvqEl.value = taxes.tvq.toFixed(2);
      if (totalEl) totalEl.value = taxes.total.toFixed(2);
      toast("Taxes calcul\xE9es", "success");
      scheduleAutosave(inspection, "final", panel);
    });
  }
  function bindCoverPhoto(inspection, panel) {
    const input = panel.querySelector("#cover-photo-input");
    input?.addEventListener("change", async () => {
      const file = input.files?.[0];
      if (!file) return;
      try {
        inspection.coverPhotoDataUrl = await compressImage(file, 1600, 0.82);
        upsertInspection(inspection);
        toast("Photo de couverture ajout\xE9e", "success");
        renderInspect(inspection.id);
        route.tab = "info";
      } catch {
        toast("Impossible de charger la photo", "error");
      }
      input.value = "";
    });
    panel.querySelector("#btn-remove-cover")?.addEventListener("click", async () => {
      if (await confirmAction("Retirer la photo", "La page de couverture ne sera plus incluse dans le rapport.")) {
        inspection.coverPhotoDataUrl = null;
        inspection.coverPhotoCaption = "";
        upsertInspection(inspection);
        toast("Photo retir\xE9e", "success");
        renderInspect(inspection.id);
        route.tab = "info";
      }
    });
  }
  function bindInfoForm(inspection, panel) {
    const form = panel.querySelector("#form-info");
    form?.addEventListener("input", () => scheduleAutosave(inspection, "info", panel));
    form?.addEventListener("change", () => scheduleAutosave(inspection, "info", panel));
    bindVisitNowButton(panel, inspection);
    bindCoverPhoto(inspection, panel);
    mountClientFilesPanel(inspection, panel);
  }
  function resolveItem(inspection, si, sub, ii) {
    const sec = inspection.sections?.[si];
    if (!sec) return null;
    if (sub < 0) return sec.items?.[ii] ?? null;
    return sec.subsections?.[sub]?.items?.[ii] ?? null;
  }
  function getContextId(inspection, si, sub) {
    if (sub >= 0) return inspection.sections[si]?.subsections?.[sub]?.id ?? null;
    return inspection.sections[si]?.id ?? null;
  }
  const SECTION_EXPERT_MAP = {
    "walk-terrain": "fondation", "bnq-w-terrain": "fondation", "bat-terrain": "fondation",
    "walk-fondations": "fondation", "bnq-w-fondations": "fondation", "bat-fondations": "fondation",
    "aibq-v-i": "structure", "aibq-v-i-17": "structure", "aibq-v-i-18-20": "structure",
    "walk-toiture": "toiture", "bnq-w-toiture": "toiture", "bat-toiture": "toiture",
    "walk-facades": "structure", "bnq-w-facades": "structure", "bat-facades": "structure",
    "walk-ouvertures": "structure", "bnq-w-ouvertures": "structure", "bat-ouvertures": "structure",
    "walk-plomb-ext": "plombier", "bnq-w-plomb-ext": "plombier", "bat-plomb-ext": "plombier",
    "walk-elec-ext": "electricien", "bnq-w-elec-ext": "electricien", "bat-elec-ext": "electricien",
    "aibq-v-iv": "plombier", "bnq-12-3": "plombier",
    "aibq-v-v": "electricien", "bnq-12-4": "electricien",
    "aibq-v-vi": "chauffage", "bnq-12-5": "chauffage", "aibq-v-vii": "chauffage",
    "aibq-v-viii": "environnement", "bnq-12-6": "environnement",
    "aibq-v-ix": "environnement", "bnq-12-7": "environnement", "aibq-v-x": "environnement",
    "aibq-v-xi": "electricien", "bnq-12-8": "electricien"
  };
  function autoAddExpert(inspection, contextId, motif) {
    const type = SECTION_EXPERT_MAP[contextId];
    if (!type) return;
    if (!inspection.expertReferrals) inspection.expertReferrals = [];
    const already = inspection.expertReferrals.some((r) => r.type === type && r.motif === motif);
    if (already) return;
    inspection.expertReferrals.push({ type, motif: motif || "", urgent: false });
    const label = EXPERT_TYPES.find((e) => e.value === type)?.label ?? type;
    toast(`R\xE9f\xE9rence ajout\xE9e â†’ ${label}`, "warn");
  }
  function bindChecklist(inspection, panel) {
    panel.querySelectorAll("[data-open-section]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const mainContent = document.getElementById("inspect-main-content") || document.getElementById("tab-content");
        saveCurrentTab(inspection, route.tab || "info", mainContent);
        upsertInspection(inspection);
        sessionStorage.setItem("kzo_scroll_" + inspection.id, String(main.scrollTop));
        route.checklistView = "section";
        route.checklistSection = +btn.dataset.openSection;
        route.tab = "checklist";
        renderInspect(inspection.id);
      });
    });
    panel.querySelector("[data-back-sections]")?.addEventListener("click", () => {
      const savedScroll = sessionStorage.getItem("kzo_scroll_" + inspection.id);
      route.checklistView = "list";
      route.checklistSection = null;
      renderInspect(inspection.id);
      route.tab = "checklist";
      if (savedScroll) {
        requestAnimationFrame(() => { main.scrollTop = parseInt(savedScroll, 10); });
      }
    });
    panel.querySelector('[data-checklist-view="all"]')?.addEventListener("click", () => {
      route.checklistView = "all";
      route.checklistSection = null;
      renderInspect(inspection.id);
      route.tab = "checklist";
    });
    panel.querySelectorAll("[data-goto-section]").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (btn.disabled) return;
        route.checklistView = "section";
        route.checklistSection = +btn.dataset.gotoSection;
        renderInspect(inspection.id);
        route.tab = "checklist";
      });
    });
    panel.querySelectorAll("[data-checklist-filter]").forEach((btn) => {
      btn.addEventListener("click", () => {
        route.checklistFilter = btn.dataset.checklistFilter;
        renderInspect(inspection.id);
        route.tab = "checklist";
      });
    });
    panel.querySelectorAll("[data-section-na]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const si = +btn.dataset.sectionNa;
        if (await confirmAction("Marquer toute la section N/A", "Tous les points de cette section seront marqu\xE9s sans objet.")) {
          const sec = inspection.sections[si];
          sec.items.forEach((it) => { it.status = "na"; });
          (sec.subsections || []).forEach((sub) => { sub.items.forEach((it) => { it.status = "na"; }); });
          upsertInspection(inspection);
          renderInspect(inspection.id);
          route.tab = "checklist";
        }
      });
    });
    panel.querySelectorAll("[data-section-na-sub]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const si = +btn.dataset.sectionNaSub;
        const sub = +btn.dataset.sub;
        if (await confirmAction("Marquer la sous-section N/A", "Tous les points de cette sous-section seront marqu\xE9s sans objet.")) {
          const subsec = inspection.sections[si]?.subsections?.[sub];
          if (subsec) subsec.items.forEach((it) => { it.status = "na"; });
          upsertInspection(inspection);
          renderInspect(inspection.id);
          route.tab = "checklist";
        }
      });
    });
    panel.addEventListener("keydown", (e) => {
      const el = e.target.closest(".check-item");
      if (!el || !["1", "2", "3", "4"].includes(e.key)) return;
      const map = { 1: "conforme", 2: "non-conforme", 3: "a-corriger", 4: "na" };
      const si = +el.dataset.si;
      const sub = +el.dataset.sub;
      const ii = +el.dataset.ii;
      const item = resolveItem(inspection, si, sub, ii);
      if (!item) return;
      item.status = map[e.key];
      scheduleAutosave(inspection, "checklist", panel);
      renderInspect(inspection.id);
      route.tab = "checklist";
    });
    panel.querySelectorAll("[data-status]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const si = +btn.dataset.si;
        const sub = +btn.dataset.sub;
        const ii = +btn.dataset.ii;
        const item = resolveItem(inspection, si, sub, ii);
        if (!item) return;
        item.status = btn.dataset.status;
        if (btn.dataset.status === "non-conforme") {
          autoAddExpert(inspection, getContextId(inspection, si, sub), item.label || "");
        }
        scheduleAutosave(inspection, "checklist", panel);
        route.checklistView = route.checklistView || "section";
        route.checklistSection = route.checklistSection ?? si;
        renderInspect(inspection.id);
        route.tab = "checklist";
      });
    });
    panel.querySelectorAll("[data-open-narratives]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const si = +btn.dataset.si;
        const sub = +btn.dataset.sub;
        const ii = +btn.dataset.ii;
        const sectionId = btn.dataset.sectionId || "";
        const status = btn.dataset.status || "";
        if (window._openNarrativesModal) window._openNarrativesModal(si, sub, ii, sectionId, status, inspection);
      });
    });
    panel.querySelectorAll("[data-preset]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const si = +btn.dataset.si;
        const sub = +btn.dataset.sub;
        const ii = +btn.dataset.ii;
        const item = resolveItem(inspection, si, sub, ii);
        if (!item) return;
        if (!Array.isArray(item.selectedPresets)) item.selectedPresets = [];
        const id = btn.dataset.preset;
        const idx = item.selectedPresets.indexOf(id);
        if (idx >= 0) {
          item.selectedPresets.splice(idx, 1);
        } else {
          item.selectedPresets.push(id);
          if (item.status === "non-conforme" || item.status === "a-corriger") {
            autoAddExpert(inspection, getContextId(inspection, si, sub), btn.textContent?.trim() || "");
          }
        }
        scheduleAutosave(inspection, "checklist", panel);
        renderInspect(inspection.id);
        route.tab = "checklist";
      });
    });
    panel.querySelectorAll("[data-inspector-comment]").forEach((ta) => {
      ta.addEventListener("input", () => {
        const si = +ta.dataset.si;
        const sub = +ta.dataset.sub;
        const ii = +ta.dataset.ii;
        const item = resolveItem(inspection, si, sub, ii);
        if (!item) return;
        item.inspectorComment = ta.value;
        scheduleAutosave(inspection, "checklist", panel);
      });
    });
    panel.querySelectorAll("[data-note]").forEach((ta) => {
      ta.addEventListener("input", () => {
        const si = +ta.dataset.si;
        const sub = +ta.dataset.sub;
        const ii = +ta.dataset.ii;
        const item = resolveItem(inspection, si, sub, ii);
        if (!item) return;
        item.note = ta.value;
        scheduleAutosave(inspection, "checklist", panel);
      });
    });
    panel.querySelectorAll("[data-priority]").forEach((sel) => {
      sel.addEventListener("change", () => {
        const si = +sel.dataset.si;
        const sub = +sel.dataset.sub;
        const ii = +sel.dataset.ii;
        const item = resolveItem(inspection, si, sub, ii);
        if (!item) return;
        item.priority = sel.value;
        scheduleAutosave(inspection, "checklist", panel);
      });
    });
    panel.querySelectorAll("[data-section-materiau]").forEach((sel) => {
      sel.addEventListener("change", () => {
        if (!inspection.sectionMateriau) inspection.sectionMateriau = {};
        inspection.sectionMateriau[sel.dataset.sectionId] = sel.value;
        const badge = sel.closest(".section-materiau")?.querySelector(".section-materiau__badge");
        if (badge) badge.textContent = sel.value;
        else if (sel.value) {
          const b = document.createElement("span");
          b.className = "section-materiau__badge";
          b.textContent = sel.value;
          sel.closest(".section-materiau")?.appendChild(b);
        }
        scheduleAutosave(inspection, "checklist", panel);
      });
    });
    panel.querySelectorAll("[data-photo]").forEach((input) => {
      input.addEventListener("change", async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const si = +input.dataset.si;
        const sub = +input.dataset.sub;
        const ii = +input.dataset.ii;
        const item = resolveItem(inspection, si, sub, ii);
        if (!item) return;
        try {
          const dataUrl = await compressImage(file);
          if (!item.photos) item.photos = [];
          if (item.photos.length >= 4) { toast("Maximum 4 photos par point", "warn"); return; }
          item.photos.push(dataUrl);
          upsertInspection(inspection);
          renderInspect(inspection.id);
          route.tab = "checklist";
        } catch {
          toast("Impossible de charger la photo", "error");
        }
      });
    });
    panel.querySelectorAll("[data-del-photo]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const si = +btn.dataset.si;
        const sub = +btn.dataset.sub;
        const ii = +btn.dataset.ii;
        const pi = +btn.dataset.pi;
        const item = resolveItem(inspection, si, sub, ii);
        if (!item) return;
        item.photos.splice(pi, 1);
        upsertInspection(inspection);
        renderInspect(inspection.id);
        route.tab = "checklist";
      });
    });
    panel.querySelectorAll("[data-edit-photo]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const si = +btn.dataset.si;
        const sub = +btn.dataset.sub;
        const ii = +btn.dataset.ii;
        const pi = +btn.dataset.pi;
        const item = resolveItem(inspection, si, sub, ii);
        if (!item) return;
        openImageEditor(item.photos[pi], (newDataUrl) => {
          item.photos[pi] = newDataUrl;
          upsertInspection(inspection);
          renderInspect(inspection.id);
          route.tab = "checklist";
        });
      });
    });
    panel.querySelectorAll("[data-ai-photo]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const p = loadProfile();
        if (!p.aiUseCloud || !p.aiApiKey?.trim()) {
          toast("L'IA cloud n'est pas activ\xE9e ou la cl\xE9 API manque dans le profil.", "warn");
          return;
        }
        const si = +btn.dataset.si;
        const sub = +btn.dataset.sub;
        const ii = +btn.dataset.ii;
        const pi = +btn.dataset.pi;
        const item = resolveItem(inspection, si, sub, ii);
        if (!item) return;
        const prevHtml = btn.innerHTML;
        btn.innerHTML = "\u23F3";
        btn.disabled = true;
        try {
          const ctx = { itemLabel: item.label, sectionTitle: inspection.sections[si]?.title };
          const result = await analyzePhotoWithVision(item.photos[pi], ctx, p, item.note);
          if (result.text) {
            const base = (item.inspectorComment || "").replace(/\n*---\s*Analyse IA\s*---[\s\S]*$/i, "").trimEnd();
            item.inspectorComment = (base ? base + "\n\n" : "") + "--- Analyse IA ---\n" + result.text;
            upsertInspection(inspection);
            renderInspect(inspection.id);
            route.tab = "checklist";
            toast("Photo analys\xE9e avec l'IA !", "success");
          }
        } catch (err) {
          toast("Erreur IA: " + err.message, "error");
        } finally {
          btn.innerHTML = prevHtml;
          btn.disabled = false;
        }
      });
    });
  }
  function syncExpertReferralsFromPanel(inspection, panel) {
    if (!inspection.expertReferrals) inspection.expertReferrals = [];
    const rows = panel.querySelectorAll(".expert-row");
    inspection.expertReferrals = [...rows].map((row) => {
      const idx = row.dataset.expertIdx;
      return {
        type: panel.querySelector(`[data-expert-type][data-idx="${idx}"]`)?.value || "autre",
        motif: panel.querySelector(`[data-expert-motif][data-idx="${idx}"]`)?.value || "",
        urgent: panel.querySelector(`[data-expert-urgent][data-idx="${idx}"]`)?.checked || false
      };
    });
  }
  function bindExpertReferrals(inspection, panel) {
    if (!inspection.expertReferrals) inspection.expertReferrals = [];
    panel.querySelector("#btn-add-expert")?.addEventListener("click", () => {
      syncExpertReferralsFromPanel(inspection, panel);
      inspection.expertReferrals.push({ type: "autre", motif: "", urgent: false });
      upsertInspection(inspection);
      renderInspect(inspection.id);
      route.tab = "final";
    });
    panel.querySelectorAll("[data-expert-del]").forEach((btn) => {
      btn.addEventListener("click", () => {
        syncExpertReferralsFromPanel(inspection, panel);
        inspection.expertReferrals.splice(+btn.dataset.idx, 1);
        upsertInspection(inspection);
        renderInspect(inspection.id);
        route.tab = "final";
      });
    });
    panel.querySelectorAll("[data-expert-type], [data-expert-motif], [data-expert-urgent]").forEach((el) => {
      el.addEventListener("change", () => {
        syncExpertReferralsFromPanel(inspection, panel);
        scheduleAutosave(inspection, "final", panel);
      });
    });
  }
  function bindFinal(inspection, panel) {
    bindExpertReferrals(inspection, panel);
    bindReceiptCalc(panel, inspection);
    panel.querySelector("#form-final")?.addEventListener("input", () => {
      syncExpertReferralsFromPanel(inspection, panel);
      scheduleAutosave(inspection, "final", panel);
    });
    panel.querySelector("#form-final")?.addEventListener("change", () => {
      syncExpertReferralsFromPanel(inspection, panel);
      scheduleAutosave(inspection, "final", panel);
    });
    const canvas = panel.querySelector("#signature-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.strokeStyle = "#1a1a2e";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    let drawing = false;
    function pos(e) {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const t = e.touches?.[0] ?? e;
      return {
        x: (t.clientX - rect.left) * scaleX,
        y: (t.clientY - rect.top) * scaleY
      };
    }
    function start(e) {
      e.preventDefault();
      drawing = true;
      const p = pos(e);
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
    }
    function move(e) {
      if (!drawing) return;
      e.preventDefault();
      const p = pos(e);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    }
    function end() {
      drawing = false;
    }
    canvas.addEventListener("mousedown", start);
    canvas.addEventListener("mousemove", move);
    canvas.addEventListener("mouseup", end);
    canvas.addEventListener("mouseleave", end);
    canvas.addEventListener("touchstart", start, { passive: false });
    canvas.addEventListener("touchmove", move, { passive: false });
    canvas.addEventListener("touchend", end);
    panel.querySelector("#sig-clear")?.addEventListener("click", () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    });
    inspection._saveSignature = () => {
      const blank = !ctx.getImageData(0, 0, canvas.width, canvas.height).data.some((v, i) => i % 4 === 3 && v > 0);
      if (!blank) inspection.signatureDataUrl = canvas.toDataURL("image/png");
    };
  }
  function saveCurrentTab(inspection, tab, panel) {
    if (tab === "info" && panel.querySelector("#form-info")) {
      const fd = new FormData(panel.querySelector("#form-info"));
      if (fd.has("norme")) {
        inspection.norme = fd.get("norme") || inspection.norme;
      }
      inspection.site = {
        client: fd.get("client") || "",
        proprietaire: fd.get("proprietaire") || "",
        courtier: fd.get("courtier") || "",
        courrielClient: fd.get("courrielClient") || "",
        telephoneClient: fd.get("telephoneClient") || "",
        adresse: fd.get("adresse") || "",
        ville: fd.get("ville") || "",
        codePostal: fd.get("codePostal") || "",
        typeBatiment: fd.get("typeBatiment") || "",
        numeroDossier: fd.get("numeroDossier") || "",
        anneeConstruction: fd.get("anneeConstruction") ? parseInt(fd.get("anneeConstruction")) || "" : "",
        anneeRenovation: fd.get("anneeRenovation") ? parseInt(fd.get("anneeRenovation")) || "" : "",
        categorieBnq: fd.get("categorieBnq") || inspection.site?.categorieBnq || "",
        mandat: fd.get("mandat") || inspection.site?.mandat || ""
      };
      inspection.inspector = {
        ...inspectorFieldsFromProfile(loadProfile()),
        permis: fd.get("permis") || "",
        entreprise: fd.get("entreprise") || "",
        courriel: fd.get("courriel") || "",
        telephone: fd.get("telephone") || "",
        membreAibq: fd.get("membreAibq") || inspection.inspector?.membreAibq || "",
        certificatRbq: fd.get("certificatRbq") || inspection.inspector?.certificatRbq || ""
      };
      inspection.visit = {
        date: fd.get("visitDate") || "",
        heureDebut: fd.get("heureDebut") || "",
        heureFin: fd.get("heureFin") || "",
        conditionsCiel: fd.get("conditionsCiel") || "",
        meteo: fd.get("meteo") || "",
        temperatureAir: fd.get("temperatureAir") || "",
        precipitation: fd.get("precipitation") || "",
        vent: fd.get("vent") || "",
        visibilite: fd.get("visibilite") || "",
        neigeAuSol: fd.get("neigeAuSol") || "",
        personnesPresentes: fd.get("personnesPresentes") || ""
      };
      inspection.coverPhotoCaption = fd.get("coverPhotoCaption") || "";
    }
    if (tab === "final" && panel.querySelector("#form-final")) {
      const fd = new FormData(panel.querySelector("#form-final"));
      inspection.limitations = fd.get("limitations") || "";
      inspection.observations = fd.get("observations") || "";
      inspection.thankYouNote = fd.get("thankYouNote") || "";
      inspection.receipt = {
        numero: fd.get("receiptNumero") || "",
        description: fd.get("receiptDescription") || "",
        montantHT: fd.get("montantHT") || "",
        tps: fd.get("receiptTps") || "",
        tvq: fd.get("receiptTvq") || "",
        total: fd.get("receiptTotal") || "",
        modePaiement: fd.get("modePaiement") || "",
        statutPaiement: fd.get("statutPaiement") || "paye",
        datePaiement: fd.get("datePaiement") || "",
        note: fd.get("receiptNote") || ""
      };
      syncExpertReferralsFromPanel(inspection, panel);
      inspection._saveSignature?.();
    }
  }
  function scheduleAutosave(inspection, tab, panel) {
    clearTimeout(autosaveTimer);
    autosaveTimer = setTimeout(() => {
      saveCurrentTab(inspection, tab, panel);
      upsertInspection(inspection);
    }, 600);
  }
  function renderInvoicePanel(inspection) {
    const profile = loadProfile();
    const invoiceNum = inspection.invoiceNumber || "â€”";
    const r = normalizeReceipt(inspection, profile);
    const subtotal = parseFloat(String(r.montantHT).replace(",", ".")) || 0;
    const tpsRate = profile.tauxTPS ?? 5;
    const tvqRate = profile.tauxTVQ ?? 9.975;
    const taxes = computeTaxes(subtotal, tpsRate, tvqRate);
    const connected = isGoogleConnected();
    return `
    <section class="page-header">
      <h2 class="page-title">Facture</h2>
      ${invoiceNum !== "â€”" ? `<span class="badge badge--success">${escapeHtml(invoiceNum)}</span>` : '<span class="badge">Num\xE9ro assign\xE9 \xE0 la compl\xE9tion</span>'}
    </section>
    <div class="form-grid">
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:1rem;">
        <div style="display:flex;justify-content:space-between;margin-bottom:0.5rem;"><span style="color:#64748b;">Client</span><strong>${escapeHtml(inspection.site?.client || "â€”")}</strong></div>
        <div style="display:flex;justify-content:space-between;margin-bottom:0.5rem;"><span style="color:#64748b;">Adresse</span><span>${escapeHtml([inspection.site?.adresse, inspection.site?.ville].filter(Boolean).join(", ") || "â€”")}</span></div>
        <hr style="margin:0.5rem 0;border:none;border-top:1px solid #e2e8f0;" />
        <div style="display:flex;justify-content:space-between;margin-bottom:0.25rem;"><span style="color:#64748b;">Sous-total</span><span>${formatMoney(taxes.subtotal)}</span></div>
        <div style="display:flex;justify-content:space-between;margin-bottom:0.25rem;"><span style="color:#64748b;">TPS (${tpsRate} %)</span><span>${formatMoney(taxes.tps)}</span></div>
        <div style="display:flex;justify-content:space-between;margin-bottom:0.25rem;"><span style="color:#64748b;">TVQ (${tvqRate} %)</span><span>${formatMoney(taxes.tvq)}</span></div>
        <div style="display:flex;justify-content:space-between;font-weight:bold;font-size:1.05rem;margin-top:0.5rem;padding-top:0.5rem;border-top:2px solid #0c3d5c;color:#0c3d5c;"><span>TOTAL</span><span>${formatMoney(taxes.total)}</span></div>
      </div>
      <label>Statut du paiement
        <select class="input" id="invoice-payment-status">
          <option value="pending" ${(inspection.paymentStatus || "pending") === "pending" ? "selected" : ""}>En attente</option>
          <option value="paid"    ${inspection.paymentStatus === "paid"    ? "selected" : ""}>Pay\xE9</option>
          <option value="overdue" ${inspection.paymentStatus === "overdue" ? "selected" : ""}>En retard</option>
        </select>
      </label>
      <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:1rem;">
        <strong style="color:#1e40af;">Envoyer la facture par courriel</strong>
        <div style="margin-top:0.75rem;">
          <label style="font-size:0.85rem;color:#475569;">\xC0 (courriel du client)</label>
          <input class="input" id="invoice-to" type="email" value="${escapeAttr(inspection.site?.courrielClient || "")}" placeholder="client@exemple.com" style="margin-top:0.25rem;" />
        </div>
        <div style="margin-top:0.5rem;">
          <label style="font-size:0.85rem;color:#475569;">Sujet</label>
          <input class="input" id="invoice-subject" value="${escapeAttr("Facture " + invoiceNum + " â€” Inspection â€” " + (inspection.site?.adresse || ""))}" style="margin-top:0.25rem;" />
        </div>
        <div style="display:flex;gap:0.75rem;justify-content:flex-end;margin-top:0.75rem;">
          <button type="button" class="btn btn--ghost btn--sm" id="btn-invoice-preview">Aper\xE7u</button>
          <button type="button" class="btn btn--primary btn--sm" id="btn-invoice-send">Envoyer depuis kzoinspectpro@gmail.com</button>
        </div>
        <p style="font-size:0.78rem;color:#6b7280;margin:0.5rem 0 0;">${connected ? "Connect\xE9 \xE0 Google" : "Non connect\xE9 â€” allez dans Profil &rarr; Int\xE9gration Google"}</p>
      </div>
    </div>`;
  }
  function renderProfile() {
    const p = loadProfile();
    const b = resolveBranding(p);
    main.innerHTML = `
    <section class="page-header">
      <h2 class="page-title">Profil inspecteur</h2>
      <p class="page-desc">Identit\xE9 KZO Inspect, coordonn\xE9es et param\xE8tres des documents</p>
    </section>
    <form class="form-grid" id="form-profile">
      <fieldset class="branding-fieldset">
        <legend>Identit\xE9 KZO Inspect \u2014 logo et en-t\xEAtes</legend>
        <p class="form-hint form-hint--compact">Votre marque sur l'application, les rapports PDF, la page de couverture, les lettres et les re\xE7us. Mentionnez IBC seulement si vous le souhaitez (certificat).</p>
        <div class="branding-editor" id="branding-editor">
          <div class="branding-logo-preview">
            <img src="${safeImgSrc(p.brandingLogoDataUrl) || DEFAULT_LOGO_URL}" alt="Logo KZO Inspect" class="branding-logo-preview__img" />
          </div>
          <label class="btn btn--primary">
            \u{1F4F7} ${p.brandingLogoDataUrl ? "Remplacer votre logo" : "T\xE9l\xE9verser un logo personnalis\xE9"}
            <input type="file" accept="image/*" hidden id="branding-logo-input" />
          </label>
          ${p.brandingLogoDataUrl ? `<button type="button" class="btn btn--ghost btn--sm" id="btn-remove-branding-logo">Revenir au logo KZO</button>` : ""}
        </div>
        <label>Nom affich\xE9 (application)<input class="input" name="brandingAppName" value="${escapeAttr(p.brandingAppName || b.appName)}" placeholder="KZO Inspect" /></label>
        <label>Nom d'entreprise (en-t\xEAtes PDF)<input class="input" name="brandingEntreprise" value="${escapeAttr(p.brandingEntreprise || "")}" placeholder="Sinon : nom de l'entreprise ci-dessous" /></label>
        <label>Slogan / sous-titre<input class="input" name="brandingTagline" value="${escapeAttr(p.brandingTagline || b.tagline)}" placeholder="Inspection de b\xE2timents au Qu\xE9bec" /></label>
        <label>Mention IBC (optionnel)<input class="input" name="brandingIbcMention" value="${escapeAttr(p.brandingIbcMention || "")}" placeholder="Ex. : Inspecteur certifi\xE9 \u2014 R\xE9seau IBC du Qu\xE9bec" /></label>
        <label>Pied de page des documents (optionnel)<textarea class="input" name="brandingFooter" rows="2" placeholder="Texte personnalis\xE9 en bas des rapports et lettres">${escapeHtml9(p.brandingFooter || "")}</textarea></label>
        <label>Pr\xE9fixe des n\xBA de re\xE7u<input class="input" name="brandingReceiptPrefix" value="${escapeAttr(p.brandingReceiptPrefix || "KZO")}" maxlength="8" /></label>
      </fieldset>
      <label>Inspecteur titulaire<input class="input" name="nom" value="${escapeAttr(INSPECTOR_NAME)}" readonly /></label>
      <label>N\xBA permis RBQ / certification<input class="input" name="permis" value="${escapeAttr(p.permis)}" /></label>
      <label>N\xBA membre AIBQ<input class="input" name="membreAibq" value="${escapeAttr(p.membreAibq || "")}" /></label>
      <label>Certificat inspecteur RBQ<input class="input" name="certificatRbq" value="${escapeAttr(p.certificatRbq || "")}" /></label>
      <label>Entreprise<input class="input" name="entreprise" value="${escapeAttr(p.entreprise)}" /></label>
      <label>Courriel<input class="input" type="email" name="courriel" value="${escapeAttr(p.courriel)}" /></label>
      <label>T\xE9l\xE9phone<input class="input" type="tel" name="telephone" value="${escapeAttr(p.telephone)}" /></label>
      <label>Message par d\xE9faut \u2014 lettre de remerciement
        <textarea class="input" name="messageRemerciement" rows="4" placeholder="Texte r\xE9utilis\xE9 sur chaque lettre si le dossier n'a pas de message personnalis\xE9.">${escapeHtml9(p.messageRemerciement || "")}</textarea>
      </label>
      <fieldset>
        <legend>Re\xE7u d'inspection (d\xE9fauts)</legend>
        <label>Montant habituel avant taxes ($)<input class="input" name="montantDefaut" value="${escapeAttr(p.montantDefaut || "")}" inputmode="decimal" /></label>
        <label>Description de service par d\xE9faut<input class="input" name="descriptionServiceDefaut" value="${escapeAttr(p.descriptionServiceDefaut || "")}" /></label>
        <div class="form-row-2">
          <label>Taux TPS (%)<input class="input" name="tauxTPS" value="${escapeAttr(p.tauxTPS ?? 5)}" inputmode="decimal" /></label>
          <label>Taux TVQ (%)<input class="input" name="tauxTVQ" value="${escapeAttr(p.tauxTVQ ?? 9.975)}" inputmode="decimal" /></label>
        </div>
        <label>No inscription TPS<input class="input" name="noEntrepriseTPS" value="${escapeAttr(p.noEntrepriseTPS || "")}" placeholder="123456789 RT 0001" /></label>
        <label>No inscription TVQ<input class="input" name="noEntrepriseTVQ" value="${escapeAttr(p.noEntrepriseTVQ || "")}" placeholder="1234567890 TQ 0001" /></label>
      </fieldset>
      <fieldset>
        <legend>Intelligence Artificielle</legend>
        <label class="checkbox-label">
          <input type="checkbox" name="aiUseCloud" ${p.aiUseCloud ? "checked" : ""} />
          Activer l'assistant IA (Analyse de photos, r\xE9daction)
        </label>
        <label>Fournisseur IA
          <select class="input" name="aiProvider" id="ai-provider-select">
            ${AI_PROVIDERS.map((prov) => `<option value="${escapeAttr(prov.value)}" ${p.aiProvider === prov.value ? "selected" : ""}>${escapeHtml9(prov.label)}</option>`).join("")}
          </select>
        </label>
        <label>Cl\xE9 API secr\xE8te
          <input class="input" type="password" name="aiApiKey" value="${escapeAttr(p.aiApiKey || "")}" placeholder="ex: sk-..." autocomplete="off" />
          <p class="input-hint input-hint--warn" style="font-size:0.78rem;color:#c62828;margin-top:4px;">
            &#x26A0; Votre cl\xE9 API est stock\xE9e localement. Ne partagez jamais votre fichier de sauvegarde.
          </p>
        </label>
        ${aiModelSelectMarkup(p.aiModel, p.aiProvider, escapeAttr, escapeHtml9)}
      </fieldset>
      <fieldset>
        <legend>Sauvegarde et donn\xE9es</legend>
        <p class="form-hint form-hint--compact">Exportez r\xE9guli\xE8rement vos dossiers (recommand\xE9 avant une mise \xE0 jour). Stockage actuel : <strong>${formatBytes(estimateStorageUsage())}</strong>.</p>
        <div class="backup-actions">
          <button type="button" class="btn btn--secondary" id="btn-export-backup">Exporter tout (.json)</button>
          <label class="btn btn--ghost">
            Importer une sauvegarde
            <input type="file" accept="application/json,.json" hidden id="import-backup-input" />
          </label>
        </div>
        <p class="form-hint form-hint--compact" id="offline-hint"></p>
      </fieldset>
      <fieldset>
        <legend>Int&eacute;gration Google (Gmail &amp; Drive)</legend>
        <p class="form-hint form-hint--compact">Permet d'envoyer les factures depuis kzoinspectpro@gmail.com et de synchroniser vers Google Drive.</p>
        <label>Google Client ID
          <input class="input" name="googleClientId" value="${escapeAttr(p.googleClientId || '18973787304-0vm4pu6383jn2vni2h996i0ri62iu21s.apps.googleusercontent.com')}" placeholder="xxxxx.apps.googleusercontent.com" />
        </label>
        <label>URL webhook Google Sheets (registre des re&ccedil;us)
          <input class="input" name="sheetsWebhookUrl" value="${escapeAttr(p.sheetsWebhookUrl || 'https://script.google.com/macros/s/AKfycby6XAR9XXWCFMqFAiyF7bjK5RQZxkoclv7KLVuDwJrW2YiNzeVlHr11pfnk3U7l_Nrv/exec')}" />
        </label>
        <div id="google-connect-status" style="margin-top:0.5rem;"></div>
      </fieldset>
      <button type="submit" class="btn btn--primary">Enregistrer le profil</button>
    </form>
  `;
    bindBrandingLogo(p);
    bindBackupControls();
    bindAiModelSelect();
    function _renderGoogleStatus() {
      const el = document.getElementById("google-connect-status");
      if (!el) return;
      const connected = isGoogleConnected();
      el.innerHTML = connected
        ? `<span style="color:#166534;">&#x2705; Connect&eacute; &agrave; Google</span> <button type="button" class="btn btn--ghost btn--sm" id="btn-google-disconnect">D&eacute;connecter</button>`
        : `<button type="button" class="btn btn--secondary btn--sm" id="btn-google-connect">&#x1F517; Connecter Google</button>`;
      document.getElementById("btn-google-connect")?.addEventListener("click", async () => {
        const clientId = document.querySelector('[name="googleClientId"]')?.value || "";
        try { await googleAuthenticate(clientId); _renderGoogleStatus(); toast("Google connect\xE9", "success"); }
        catch (err) { toast("Connexion Google \xE9chou\xE9e : " + err.message, "error"); }
      });
      document.getElementById("btn-google-disconnect")?.addEventListener("click", () => {
        googleDisconnect(); _renderGoogleStatus(); toast("Google d\xE9connect\xE9", "info");
      });
    }
    _renderGoogleStatus();
    document.getElementById("form-profile").onsubmit = (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const current = loadProfile();
      saveProfile({
        ...current,
        aiUseCloud: fd.get("aiUseCloud") === "on",
        aiProvider: fd.get("aiProvider") || "openai",
        aiApiKey: fd.get("aiApiKey") || "",
        aiModel: fd.get("aiModel") === "__custom__" ? fd.get("aiModelCustom") : fd.get("aiModel"),
        nom: INSPECTOR_NAME,
        permis: fd.get("permis"),
        entreprise: fd.get("entreprise"),
        courriel: fd.get("courriel"),
        telephone: fd.get("telephone"),
        membreAibq: fd.get("membreAibq"),
        certificatRbq: fd.get("certificatRbq"),
        messageRemerciement: fd.get("messageRemerciement"),
        montantDefaut: fd.get("montantDefaut"),
        descriptionServiceDefaut: fd.get("descriptionServiceDefaut"),
        tauxTPS: parseFloat(fd.get("tauxTPS")) || 5,
        tauxTVQ: parseFloat(fd.get("tauxTVQ")) || 9.975,
        noEntrepriseTPS: fd.get("noEntrepriseTPS"),
        noEntrepriseTVQ: fd.get("noEntrepriseTVQ"),
        brandingAppName: fd.get("brandingAppName") || "KZO Inspect",
        brandingTagline: fd.get("brandingTagline") || "",
        brandingEntreprise: fd.get("brandingEntreprise") || "",
        brandingFooter: fd.get("brandingFooter") || "",
        brandingIbcMention: fd.get("brandingIbcMention") || "",
        brandingReceiptPrefix: fd.get("brandingReceiptPrefix") || "KZO",
        googleClientId:   fd.get("googleClientId")   || "",
        sheetsWebhookUrl: fd.get("sheetsWebhookUrl")  || ""
      });
      applyTopBarBranding(loadProfile());
      toast("Profil enregistr\xE9", "success");
    };
  }
  function bindBrandingLogo(profile) {
    const input = document.getElementById("branding-logo-input");
    input?.addEventListener("change", async () => {
      const file = input.files?.[0];
      if (!file) return;
      try {
        const logo = await compressImage(file, 400, 0.9);
        const current = loadProfile();
        saveProfile({ ...current, brandingLogoDataUrl: logo });
        applyTopBarBranding(loadProfile());
        toast("Logo enregistr\xE9", "success");
        renderProfile();
      } catch {
        toast("Impossible de charger le logo", "error");
      }
      input.value = "";
    });
    document.getElementById("btn-remove-branding-logo")?.addEventListener("click", async () => {
      if (await confirmAction("Logo par d\xE9faut", "Le logo officiel KZO Inspect sera r\xE9utilis\xE9.")) {
        const current = loadProfile();
        saveProfile({ ...current, brandingLogoDataUrl: null });
        applyTopBarBranding(loadProfile());
        toast("Logo retir\xE9", "success");
        renderProfile();
      }
    });
  }
  function escapeHtml9(str) {
    return String(str ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function escapeAttr(str) {
    return escapeHtml9(str).replace(/"/g, "&quot;");
  }
  function formatShortDate(iso) {
    return new Date(iso).toLocaleDateString("fr-CA", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  }
  window.addEventListener("hashchange", () => {
    route = parseHash();
    render();
  });
  function bindBackupControls() {
    document.getElementById("btn-export-backup")?.addEventListener("click", () => {
      const n = exportAllData();
      toast(`Sauvegarde export\xE9e (${n} inspection${n !== 1 ? "s" : ""})`, "success");
    });
    document.getElementById("import-backup-input")?.addEventListener("change", async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const replace = await confirmAction(
        "Mode d'import",
        "OK = remplacer toutes les inspections. Annuler = fusionner avec les dossiers existants."
      );
      try {
        const n = await importAllData(file, { replace });
        toast(`${n} inspection${n !== 1 ? "s" : ""} import\xE9e${n !== 1 ? "s" : ""}`, "success");
        applyTopBarBranding(loadProfile());
        navigate("home");
      } catch (err) {
        toast(err.message || "Import impossible", "error");
      }
      e.target.value = "";
    });
    const hint = document.getElementById("offline-hint");
    if (hint && "serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then(() => {
        hint.textContent = "Mode hors ligne actif \u2014 l'application fonctionne sans Internet apr\xE8s la premi\xE8re visite.";
      }).catch(() => {
        hint.textContent = "Installez l'app sur l'\xE9cran d'accueil pour une utilisation hors ligne optimale.";
      });
    }
  }
  function registerServiceWorker() {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("./sw.js").catch(() => {
    });
  }
  window.addEventListener("kzo:storage-quota", (e) => {
    toast(e.detail?.message || "Espace de stockage plein.", "error");
  });
  // js/gmail-send.js
  const _GMAIL_API = 'https://gmail.googleapis.com/gmail/v1/users/me/messages/send';
  const _DEFAULT_SHEETS_URL = 'https://script.google.com/macros/s/AKfycby6XAR9XXWCFMqFAiyF7bjK5RQZxkoclv7KLVuDwJrW2YiNzeVlHr11pfnk3U7l_Nrv/exec';
  function _esc(str) { return String(str ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function _fmt(n) { return new Intl.NumberFormat('fr-CA',{style:'currency',currency:'CAD'}).format(n); }
  function buildInvoiceHtml(inspection, profile) {
    profile = profile || {};
    const r = normalizeReceipt(inspection, profile);
    const branding = resolveBranding(profile);
    const subtotal = parseFloat(String(r.montantHT).replace(',','.')) || 0;
    const tpsRate = profile.tauxTPS ?? 5;
    const tvqRate = profile.tauxTVQ ?? 9.975;
    const taxes = computeTaxes(subtotal, tpsRate, tvqRate);
    const invoiceNum = inspection.invoiceNumber || inspection.site?.numeroDossier || 'â€”';
    const date = new Date().toLocaleDateString('fr-CA',{year:'numeric',month:'long',day:'numeric'});
    const adresse = [inspection.site?.adresse,inspection.site?.ville].filter(Boolean).join(', ') || 'â€”';
    const visitDate = formatVisitDateTime(inspection);
    const visitLabel = visitDate !== 'â€”' ? ` Â· Visite du ${visitDate}` : '';
    const desc = (r.description || 'Inspection prÃ©achat rÃ©sidentielle').replace(/\s*[-â€”â€“]\s*(AIBQ|BNQ|IBC|CBQ|REIBH)[^,.]/gi,'').trim();
    return `<!DOCTYPE html><html lang="fr-CA"><head><meta charset="UTF-8"/><title>Facture ${_esc(invoiceNum)}</title></head><body style="font-family:'Segoe UI',system-ui,sans-serif;max-width:640px;margin:0 auto;padding:24px;color:#1a1a2e;background:#f8fafc;"><div style="background:#0c3d5c;color:#fff;padding:1.25rem 1.5rem;border-radius:8px 8px 0 0;display:flex;justify-content:space-between;align-items:center;"><div><div style="font-size:1.1rem;font-weight:700;letter-spacing:1px;">${_esc(branding.appName)}</div><div style="font-size:0.78rem;opacity:0.8;">${_esc(profile.nom||'Jean Eveillard Cazeau')} Â· Inspecteur certifiÃ©</div></div><div style="text-align:right;"><div style="font-family:monospace;font-size:1rem;font-weight:700;background:rgba(255,255,255,0.15);padding:3px 10px;border-radius:4px;">${_esc(invoiceNum)}</div><div style="font-size:0.75rem;opacity:0.8;margin-top:3px;">${_esc(date)}</div></div></div><div style="border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px;padding:1.25rem 1.5rem;background:#fff;"><div style="display:flex;justify-content:space-between;margin-bottom:1.25rem;gap:1rem;"><div><div style="font-size:0.7rem;text-transform:uppercase;color:#94a3b8;margin-bottom:3px;">FacturÃ© Ã </div><div style="font-weight:600;">${_esc(inspection.site?.client||'â€”')}</div><div style="color:#64748b;font-size:0.85rem;">${_esc(inspection.site?.courrielClient||'')}</div><div style="color:#64748b;font-size:0.85rem;">${_esc(adresse)}</div></div><div style="text-align:right;"><div style="font-size:0.7rem;text-transform:uppercase;color:#94a3b8;margin-bottom:3px;">Inspecteur</div><div style="font-weight:600;">${_esc(profile.nom||'Jean Eveillard Cazeau')}</div><div style="color:#64748b;font-size:0.85rem;">${_esc(profile.courriel||'kzoinspectpro@gmail.com')}</div><div style="color:#64748b;font-size:0.85rem;">${_esc(profile.telephone||'')}</div></div></div><table style="width:100%;border-collapse:collapse;margin-bottom:1.25rem;font-size:0.88rem;"><thead><tr style="background:#f1f5f9;"><th style="text-align:left;padding:7px 10px;color:#475569;font-size:0.72rem;text-transform:uppercase;border:1px solid #e2e8f0;">Description</th><th style="text-align:right;padding:7px 10px;color:#475569;font-size:0.72rem;text-transform:uppercase;border:1px solid #e2e8f0;">Montant</th></tr></thead><tbody><tr><td style="padding:9px 10px;border:1px solid #e2e8f0;"><div style="font-weight:600;">${_esc(desc)}</div><div style="color:#64748b;font-size:0.8rem;">${_esc(adresse)}${_esc(visitLabel)}</div></td><td style="padding:9px 10px;text-align:right;border:1px solid #e2e8f0;">${_fmt(taxes.subtotal)}</td></tr></tbody></table><div style="display:flex;flex-direction:column;align-items:flex-end;gap:3px;margin-bottom:1.25rem;"><div style="display:flex;gap:3rem;color:#64748b;font-size:0.85rem;"><span>Sous-total</span><span>${_fmt(taxes.subtotal)}</span></div><div style="display:flex;gap:3rem;color:#64748b;font-size:0.85rem;"><span>TPS (${tpsRate} %)</span><span>${_fmt(taxes.tps)}</span></div><div style="display:flex;gap:3rem;color:#64748b;font-size:0.85rem;"><span>TVQ (${tvqRate} %)</span><span>${_fmt(taxes.tvq)}</span></div><div style="display:flex;gap:3rem;font-weight:700;font-size:1rem;color:#0c3d5c;border-top:2px solid #0c3d5c;padding-top:5px;margin-top:3px;"><span>TOTAL</span><span>${_fmt(taxes.total)}</span></div></div><div style="background:#f8fafc;border-left:3px solid #0c3d5c;padding:0.65rem 0.9rem;border-radius:0 6px 6px 0;font-size:0.85rem;color:#475569;">${_esc(profile.messageRemerciement||"Merci de votre confiance. Pour toute question, n'hÃ©sitez pas Ã  nous contacter.")}</div><div style="margin-top:1.25rem;text-align:center;color:#94a3b8;font-size:0.72rem;border-top:1px solid #f1f5f9;padding-top:0.9rem;">${_esc(branding.appName)} Â· ${_esc(profile.nom||'Jean Eveillard Cazeau')} Â· ${_esc(profile.courriel||'kzoinspectpro@gmail.com')}</div></div></body></html>`;
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
    const payload = {sheet:'ReÃ§us',date_envoi:new Date().toLocaleDateString('fr-CA'),numero_facture:inspection.invoiceNumber||'â€”',client:inspection.site?.client||'',courriel_client:inspection.site?.courrielClient||'',adresse:[inspection.site?.adresse,inspection.site?.ville].filter(Boolean).join(', '),date_inspection:formatVisitDateTime(inspection),montant_ht:subtotal.toFixed(2),tps:taxes.tps.toFixed(2),tvq:taxes.tvq.toFixed(2),total:taxes.total.toFixed(2),statut_paiement:inspection.paymentStatus||'pending'};
    fetch(url,{method:'POST',mode:'no-cors',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)}).catch(e=>console.warn('[GmailSend] Sheets error:',e));
  }
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
    if (!_gaTokenClient) return Promise.reject(new Error('Google Identity Services non disponible. VÃ©rifiez votre connexion internet.'));
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
  function initNarrativesModal() {
    const dlg = document.createElement('dialog');
    dlg.id = 'narratives-modal';
    dlg.innerHTML = `
      <div class="nm-header">
        <span class="nm-header__title">&#x1F4CB; Narratifs professionnels</span>
        <span class="nm-header__ctx" id="nm-ctx"></span>
        <button type="button" class="nm-close" id="nm-close" aria-label="Fermer">\xD7</button>
      </div>
      <div class="nm-controls">
        <input type="search" class="nm-search" id="nm-search" placeholder="Rechercher un narratif…" autocomplete="off" />
        <div class="nm-tabs" id="nm-tabs">
          <button type="button" class="nm-tab is-active" data-nm-tab="non-conforme">Non-conforme</button>
          <button type="button" class="nm-tab" data-nm-tab="a-corriger">\xC0 corriger</button>
          <button type="button" class="nm-tab" data-nm-tab="conforme">Conforme</button>
          <button type="button" class="nm-tab" data-nm-tab="">Tous</button>
        </div>
      </div>
      <div class="nm-list" id="nm-list"></div>`;
    document.body.appendChild(dlg);

    let _nmSi, _nmSub, _nmIi, _nmSectionId, _nmStatus, _nmActiveTab, _nmQuery, _nmInspection;

    function nmEscHtml(s) {
      return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function nmRender() {
      const list = document.getElementById('nm-list');
      const tab = _nmActiveTab !== undefined ? _nmActiveTab : _nmStatus;
      const results = getNarratives(tab || null, _nmSectionId || null, _nmQuery || '');
      if (!results.length) {
        list.innerHTML = '<p class="nm-empty">Aucun narratif pour ce contexte.<br>Utilisez le champ libre ci-dessous.</p>';
        return;
      }
      list.innerHTML = results.map((n) => `
        <div class="nm-card" data-nm-id="${nmEscHtml(n.id)}">
          <div class="nm-card__title">${nmEscHtml(n.title)}</div>
          <div class="nm-card__text">${nmEscHtml(n.text)}</div>
          <div class="nm-card__actions">
            <button type="button" class="nm-expand">Voir tout</button>
            <button type="button" class="nm-insert">Ins\xE9rer dans champ</button>
          </div>
        </div>`).join('');

      // Listeners directs sur chaque carte après rendu
      list.querySelectorAll('.nm-card').forEach((card, idx) => {
        const n = results[idx];
        const insertBtn = card.querySelector('.nm-insert');
        const expandBtn = card.querySelector('.nm-expand');
        if (insertBtn) {
          insertBtn.addEventListener('click', () => {
            try {
              const inspection = _nmInspection || getInspection(route.id);
              if (inspection) {
                const item = resolveItem(inspection, _nmSi, _nmSub, _nmIi);
                if (item) {
                  const existing = (item.inspectorComment || '').trim();
                  item.inspectorComment = existing ? existing + '\n\n' + n.text : n.text;
                  const panel = document.getElementById('inspect-panel');
                  const ta = panel && panel.querySelector('[data-inspector-comment][data-si="' + _nmSi + '"][data-sub="' + _nmSub + '"][data-ii="' + _nmIi + '"]');
                  if (ta) ta.value = item.inspectorComment;
                  scheduleAutosave(inspection, 'checklist', panel);
                }
              }
            } catch(err) {
              console.error('[Narratifs] Erreur insertion:', err);
            }
            const modal = document.getElementById('narratives-modal');
            if (modal) modal.close();
          });
        }
        if (expandBtn) {
          expandBtn.addEventListener('click', () => {
            const textEl = card.querySelector('.nm-card__text');
            if (textEl) {
              textEl.classList.toggle('is-expanded');
              expandBtn.textContent = textEl.classList.contains('is-expanded') ? 'R\xE9duire' : 'Voir tout';
            }
          });
        }
      });
    }

    dlg.addEventListener('click', (e) => {
      const tabBtn = e.target.closest('[data-nm-tab]');
      if (tabBtn) {
        dlg.querySelectorAll('.nm-tab').forEach((b) => b.classList.remove('is-active'));
        tabBtn.classList.add('is-active');
        _nmActiveTab = tabBtn.dataset.nmTab;
        nmRender();
      }
    });

    document.getElementById('nm-close').addEventListener('click', () => dlg.close());

    document.getElementById('nm-search').addEventListener('input', (e) => {
      _nmQuery = e.target.value;
      nmRender();
    });

    window._openNarrativesModal = function(si, sub, ii, sectionId, status, inspectionRef) {
      _nmSi = si; _nmSub = sub; _nmIi = ii;
      _nmSectionId = sectionId;
      _nmStatus = status;
      _nmInspection = inspectionRef || null;
      _nmActiveTab = status || 'non-conforme';
      _nmQuery = '';
      document.getElementById('nm-search').value = '';
      const activeTab = dlg.querySelector(`[data-nm-tab="${_nmActiveTab}"]`) || dlg.querySelector('[data-nm-tab="non-conforme"]');
      dlg.querySelectorAll('.nm-tab').forEach((b) => b.classList.remove('is-active'));
      if (activeTab) activeTab.classList.add('is-active');
      document.getElementById('nm-ctx').textContent = sectionId
        ? sectionId.replace(/^(walk-|bnq-w-|bnq-|aibq-v-|bat-)/, '')
        : '';
      nmRender();
      dlg.showModal();
    };
  }

  function initRepairsModal() {
    function rmEscHtml(s) {
      return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
    }
    const dlg = document.createElement("dialog");
    dlg.id = "repairs-modal";
    dlg.innerHTML = '<div class="rm-header"><span class="rm-header__title">🔧 Sommaire des R\xE9parations</span><span class="rm-header__count" id="rm-count"></span><button type="button" class="rm-close" id="rm-close" aria-label="Fermer">\xD7</button></div><div class="rm-list" id="rm-list"></div><div class="rm-footer"><button type="button" class="btn btn--ghost" id="rm-cancel">Fermer</button><button type="button" class="btn btn--primary" id="rm-copy">📋 Copier le r\xE9sum\xE9</button></div>';
    document.body.appendChild(dlg);

    document.getElementById("rm-close").addEventListener("click",  () => dlg.close());
    document.getElementById("rm-cancel").addEventListener("click", () => dlg.close());

    document.getElementById("rm-copy").addEventListener("click", () => {
      const checked = dlg.querySelectorAll(".rm-item__check:checked");
      if (!checked.length) { toast("Aucun item s\xE9lectionn\xE9.", "warn"); return; }
      const text = Array.from(checked).map((cb) => cb.dataset.rmText).join("\n\n");
      navigator.clipboard.writeText(text)
        .then(() => { toast("✓ R\xE9sum\xE9 copi\xE9 !", "success"); dlg.close(); })
        .catch(() => toast("Erreur de copie — r\xE9essayez.", "error"));
    });

    window._openRepairsModal = function(inspection) {
      const items = getRepairItems(inspection);
      const list  = document.getElementById("rm-list");
      const count = document.getElementById("rm-count");
      const nc = items.filter((i) => i.status === "non-conforme").length;
      const ac = items.filter((i) => i.status === "a-corriger").length;
      count.textContent = items.length
        ? items.length + " d\xE9faut" + (items.length !== 1 ? "s" : "") + " \xB7 " + nc + " NC \xB7 " + ac + " AC"
        : "";
      if (!items.length) {
        list.innerHTML = '<p class="rm-empty">Aucun d\xE9faut NC ou AC document\xE9 dans cette inspection.</p>';
        dlg.showModal();
        return;
      }
      list.innerHTML = items.map((item) => {
        const statusLabel   = item.status === "non-conforme" ? "NC" : "AC";
        const priorityLabel = item.priority ? item.priority.toUpperCase() : "—";
        const emoji         = REPAIR_PRIORITY_EMOJI[item.priority] || "⚪";
        const labelClean    = item.label.replace(REPAIR_LABEL_RE, "");
        const preview       = item.presets.length
          ? item.presets[0]
          : item.comment.substring(0, 70) + (item.comment.length > 70 ? "…" : "");
        const text = formatRepairItem(item);
        const safePriority = ['critique','majeur','mineur'].includes(item.priority) ? item.priority : 'none';
        return '<label class="rm-item"><input type="checkbox" class="rm-item__check" checked data-rm-text="' + rmEscHtml(text) + '" /><div class="rm-item__body"><span class="rm-item__badge rm-item__badge--' + safePriority + '">' + emoji + " " + statusLabel + " - " + priorityLabel + '</span><span class="rm-item__section">' + rmEscHtml(item.sectionTitle) + '</span><span class="rm-item__label">' + rmEscHtml(labelClean) + " : " + rmEscHtml(preview) + "</span></div></label>";
      }).join("");
      dlg.showModal();
    };
  }

  route = parseHash();
  registerServiceWorker();
  initAiAssistant();
  initNarrativesModal();
  initRepairsModal();
  render();
  window.__kzoInspectBooted = true;
  if (typeof window.__kzoInspectReady === "function") window.__kzoInspectReady();
})();
