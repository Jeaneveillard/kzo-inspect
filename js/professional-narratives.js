/**
 * professional-narratives.js
 * Bibliothèque de narratifs professionnels pour KZO Inspect
 * Français québécois — voix impersonnelle — structure : localisation → observation → implication → action
 * ≥ 130 entrées couvrant 17 sections (NC, AC, C)
 */

export const PROFESSIONAL_NARRATIVES = [

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
    title: 'Infiltration active d\'eau — traces humides au sous-sol',
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
    title: 'Mur de fondation hors d\'aplomb — déformation structurale',
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
    title: 'Efflorescence — traces de migration d\'humidité ancienne',
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
    title: 'Mousse et lichen — rétention d\'humidité',
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
    title: 'Crépi fissuré — voies d\'infiltration multiples',
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
    title: 'Fenêtres condamnées — voie d\'évacuation bloquée',
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
    title: 'Drains de surface obstrués — accumulation d\'eau',
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
    title: 'Luminaires extérieurs non étanches — risque d\'électrocution',
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
    title: 'Fils aériens vieillissants — inspection par l\'électricien',
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
    title: 'Poteau d\'appui instable — base inadéquate',
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
    title: 'Pression d\'eau élevée — usure prématurée des équipements',
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
    title: 'Moisissures visibles — problème de qualité de l\'air',
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
    title: 'Taches d\'infiltration au plafond — source active',
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
    title: 'Rampe d\'escalier instable — sécurité à améliorer',
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
    title: 'Pare-vapeur absent — condensation dans l\'isolant',
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
    title: 'Éclairage des voies d\'évacuation — amélioration suggérée',
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
    title: 'Matériaux suspects contenant de l\'amiante',
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
    title: 'Isolant d\'urée-formaldéhyde possible — vérification recommandée',
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
    title: 'Aucun matériau dangereux identifié — limites d\'inspection',
    text: "Aucun matériau dangereux évident n'a été identifié lors de l'inspection visuelle dans les zones accessibles. Cette évaluation se limite à ce qui est observable à l'oeil nu et ne remplace pas une analyse en laboratoire. Pour un bâtiment de plus de 30 ans, des tests spécifiques peuvent être envisagés si des travaux de rénovation sont planifiés.",
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // NARRATIFS SUPPLÉMENTAIRES — couvrir ≥ 130 entrées
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
    title: 'Bardeaux manquants — zones d\'infiltration directe',
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
    title: 'Siphon absent ou défaillant — odeurs de gaz d\'égout',
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

// ─────────────────────────────────────────────────────────────────────────────
// Fonction de recherche
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Filtre les narratifs professionnels selon le statut, la section et une requête textuelle.
 *
 * @param {string|null} status   - 'conforme' | 'non-conforme' | 'a-corriger' | null pour tous
 * @param {string|null} sectionId - ID de section (ex: 'walk-fondations') | null pour toutes
 * @param {string}      query    - Texte de recherche libre (optionnel)
 * @returns {Array}              - Narratifs correspondants
 */
export function getNarratives(status, sectionId, query = '') {
  let results = PROFESSIONAL_NARRATIVES;
  if (status) results = results.filter((n) => n.status === status);
  if (sectionId) {
    const bySectionId = results.filter((n) => n.sectionIds.includes(sectionId));
    if (bySectionId.length > 0) results = bySectionId;
    // Repli : si aucun narratif pour cette section, afficher tous ceux du statut
  }
  if (query && query.trim()) {
    const q = query.trim().toLowerCase();
    results = results.filter(
      (n) => n.title.toLowerCase().includes(q) || n.text.toLowerCase().includes(q),
    );
  }
  return results;
}
