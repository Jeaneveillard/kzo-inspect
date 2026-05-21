# Bibliothèque de narratifs professionnels — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajouter une bibliothèque de ~136 narratifs professionnels longs accessibles via une modale `<dialog>` déclenchée depuis chaque item de checklist, avec insertion par append dans le commentaire inspecteur.

**Architecture:** Nouveau fichier `js/professional-narratives.js` (données + filtre), bouton déclencheur dans `checklist-views.js`, modale initialisée une fois dans `app.js`, CSS dans `app.css`. Tout reflété dans `bundle.js`.

**Tech Stack:** Vanilla JS ES modules, HTML `<dialog>` natif, CSS variables existantes, localStorage existant — aucune dépendance externe.

---

## Fichiers touchés

| Fichier | Action |
|---|---|
| `js/professional-narratives.js` | Créer |
| `css/app.css` | Modifier — ajouter styles modal |
| `js/checklist-views.js` | Modifier — bouton déclencheur |
| `js/app.js` | Modifier — init modale + handlers |
| `js/bundle.js` | Modifier — refléter tous les changements |

---

## Task 1 : Créer `js/professional-narratives.js`

**Files:**
- Create: `js/professional-narratives.js`

- [ ] **Step 1 : Écrire le fichier complet**

```js
export const PROFESSIONAL_NARRATIVES = [

  /* ── TERRAIN ─────────────────────────────────────────────────────── */
  {
    id: 'pn-terrain-nc-pente',
    sectionIds: ['walk-terrain', 'bnq-w-terrain', 'bat-terrain'],
    status: 'non-conforme',
    title: 'Pente dirigée vers les fondations',
    text: "La pente du terrain adjacent au bâtiment oriente les eaux de ruissellement vers les fondations plutôt qu'à l'écart de celles-ci. Cette condition constitue un facteur aggravant pour la pression hydrostatique et les risques d'infiltration au niveau des murs de fondation. Un remodelage du terrain ou la mise en place d'un système de drainage approprié est nécessaire afin de rediriger les eaux de surface.",
  },
  {
    id: 'pn-terrain-nc-soutenement',
    sectionIds: ['walk-terrain', 'bnq-w-terrain', 'bat-terrain'],
    status: 'non-conforme',
    title: 'Mur de soutènement instable',
    text: "Le mur de soutènement présente des signes de déplacement ou d'instabilité, observable par une inclinaison hors de l'axe vertical ou des fissures importantes. Cette condition représente un risque pour la sécurité des personnes et peut également compromettre la stabilité du terrain adjacent au bâtiment. Une évaluation par un professionnel qualifié est requise afin de déterminer les travaux de stabilisation nécessaires.",
  },
  {
    id: 'pn-terrain-nc-cloture-piscine',
    sectionIds: ['walk-terrain', 'bnq-w-terrain', 'bat-terrain'],
    status: 'non-conforme',
    title: 'Clôture piscine absente ou non conforme',
    text: "La clôture entourant le bassin de la piscine ne satisfait pas aux exigences réglementaires en vigueur concernant la protection des jeunes enfants. Des lacunes ont été relevées au niveau de la hauteur, de l'espacement des barreaux ou du mécanisme de fermeture automatique. Une mise en conformité de la clôture est requise afin d'assurer la sécurité des personnes, en particulier des jeunes enfants.",
  },
  {
    id: 'pn-terrain-ac-remblai',
    sectionIds: ['walk-terrain', 'bnq-w-terrain', 'bat-terrain'],
    status: 'a-corriger',
    title: 'Remblai insuffisant le long des fondations',
    text: "Le remblai de sol longeant les murs de fondation est insuffisant ou a subi un tassement, réduisant l'effet de drainage de surface qui devrait normalement éloigner les eaux du bâtiment. Un apport de sol et un remodelage de la pente sont recommandés afin d'optimiser le drainage périmétrique.",
  },
  {
    id: 'pn-terrain-ac-vegetation',
    sectionIds: ['walk-terrain', 'bnq-w-terrain', 'bat-terrain'],
    status: 'a-corriger',
    title: 'Végétation trop proche des fondations',
    text: "Des végétaux sont plantés à une distance insuffisante des fondations, ce qui peut entraîner une pression exercée par les racines sur les murs de fondation et favoriser le maintien de l'humidité au sol adjacent. L'élagage ou le déplacement des végétaux concernés est recommandé.",
  },
  {
    id: 'pn-terrain-ac-regard',
    sectionIds: ['walk-terrain', 'bnq-w-terrain', 'bat-terrain'],
    status: 'a-corriger',
    title: 'Regard de drainage obstrué',
    text: "Le regard de drainage de surface est partiellement obstrué, ce qui réduit son efficacité à évacuer les eaux de ruissellement. Un nettoyage du regard et une vérification de l'état du réseau de drainage de surface sont recommandés.",
  },
  {
    id: 'pn-terrain-c-1',
    sectionIds: ['walk-terrain', 'bnq-w-terrain', 'bat-terrain'],
    status: 'conforme',
    title: 'Terrain bien drainé, pente adéquate',
    text: "La pente générale du terrain assure une évacuation adéquate des eaux de ruissellement à l'écart du bâtiment. Aucun signe d'accumulation d'eau ou de saturation du sol adjacent aux fondations n'a été observé au moment de l'inspection. L'aménagement paysager est maintenu à une distance raisonnable des murs. L'état actuel est satisfaisant.",
  },

  /* ── FONDATIONS ───────────────────────────────────────────────────── */
  {
    id: 'pn-fond-nc-fissure-diag',
    sectionIds: ['walk-fondations', 'bnq-w-fondations', 'bat-fondations'],
    status: 'non-conforme',
    title: 'Fissure diagonale — mouvement structurel',
    text: "Il a été observé lors de l'inspection visuelle que le mur de fondation présente des fissures diagonales significatives, caractéristiques d'un mouvement structurel différentiel. Ce type de fissuration indique généralement un tassement inégal du sol porteur ou une défaillance progressive des appuis. Une telle condition peut compromettre l'intégrité de la structure du bâtiment si elle n'est pas traitée. Une évaluation par un ingénieur en structure est recommandée avant toute conclusion de transaction.",
  },
  {
    id: 'pn-fond-nc-infiltration',
    sectionIds: ['walk-fondations', 'bnq-w-fondations', 'bat-fondations'],
    status: 'non-conforme',
    title: 'Infiltration active au mur de fondation',
    text: "L'inspection révèle la présence d'infiltration d'eau active au niveau du mur de fondation, observable par des traces d'humidité et de suintement sur la face intérieure. Cette condition témoigne d'une défaillance de l'étanchéité ou du drainage périmétrique du bâtiment. Si elle n'est pas corrigée, l'infiltration chronique peut entraîner des dommages structuraux, de la moisissure et une dégradation accélérée des matériaux en contact. Des travaux de correction à l'imperméabilisation ou au drainage sont nécessaires.",
  },
  {
    id: 'pn-fond-nc-efflorescence',
    sectionIds: ['walk-fondations', 'bnq-w-fondations', 'bat-fondations'],
    status: 'non-conforme',
    title: 'Efflorescence importante — humidité chronique',
    text: "Des dépôts blanchâtres caractéristiques d'une migration d'humidité chronique à travers le mur de fondation ont été observés sur l'ensemble de la surface intérieure. L'efflorescence constitue un indicateur fiable de la présence prolongée d'humidité à travers le béton ou la maçonnerie. Sans intervention, cette situation favorise la détérioration des matériaux et peut conduire à l'apparition de moisissures. Une inspection du drainage périmétrique et une correction de l'imperméabilisation sont recommandées.",
  },
  {
    id: 'pn-fond-nc-affaissement',
    sectionIds: ['walk-fondations', 'bnq-w-fondations', 'bat-fondations'],
    status: 'non-conforme',
    title: 'Affaissement ou déplacement visible',
    text: "Un déplacement ou affaissement notable du mur de fondation a été constaté lors de l'inspection, se manifestant par un désalignement visible et des fissures en escalier à la jonction des blocs ou de la maçonnerie. Cette condition indique un mouvement structurel actif ou passé qui peut compromettre la stabilité de l'ensemble du bâtiment. Une expertise en génie civil ou en structure est requise de toute urgence afin d'évaluer l'étendue des travaux correctifs nécessaires.",
  },
  {
    id: 'pn-fond-ac-fissures-fines',
    sectionIds: ['walk-fondations', 'bnq-w-fondations', 'bat-fondations'],
    status: 'a-corriger',
    title: 'Fissures fines — cycle gel-dégel à surveiller',
    text: "De fines fissures sont présentes sur le mur de fondation, dont la morphologie est compatible avec les cycles de gel et de dégel répétés caractéristiques du climat québécois. Ces fissures ne présentent pas de signe de mouvement actif au moment de l'inspection, mais elles constituent un point de surveillance important. Leur évolution doit être documentée afin de détecter tout agrandissement pouvant indiquer un mouvement structurel. Un suivi annuel est recommandé.",
  },
  {
    id: 'pn-fond-ac-efflorescence-legere',
    sectionIds: ['walk-fondations', 'bnq-w-fondations', 'bat-fondations'],
    status: 'a-corriger',
    title: 'Efflorescence légère — drainage à améliorer',
    text: "De légers dépôts blanchâtres sont observés en portions localisées du mur de fondation, indiquant une migration d'humidité ponctuelle. Bien que d'ampleur limitée au moment de l'inspection, cette condition mérite d'être surveillée et peut requérir une amélioration du drainage de surface ou périmétrique. Un nettoyage et une vérification de l'état des membranes d'étanchéité sont suggérés.",
  },
  {
    id: 'pn-fond-ac-joints',
    sectionIds: ['walk-fondations', 'bnq-w-fondations', 'bat-fondations'],
    status: 'a-corriger',
    title: 'Joints de mortier dégradés — repointing requis',
    text: "Les joints de mortier présentent une dégradation avancée par endroits, se traduisant par un effritement ou un retrait visible entre les blocs de béton. Sans réparation, cette condition favorise la pénétration d'eau et accélère la détérioration des éléments de maçonnerie. Un rejointoiement des sections concernées est recommandé à court terme.",
  },
  {
    id: 'pn-fond-c-1',
    sectionIds: ['walk-fondations', 'bnq-w-fondations', 'bat-fondations'],
    status: 'conforme',
    title: 'Fondation intacte — aucune anomalie visible',
    text: "L'inspection visuelle du mur de fondation accessible ne révèle aucune fissure significative, aucun signe d'infiltration active et aucune déformation notable. La surface est sèche et les joints sont en bon état apparent. Aucune intervention n'est requise dans l'immédiat.",
  },

  /* ── TOITURE ──────────────────────────────────────────────────────── */
  {
    id: 'pn-toit-nc-bardeaux',
    sectionIds: ['walk-toiture', 'bnq-w-toiture', 'bat-toiture'],
    status: 'non-conforme',
    title: 'Bardeaux manquants ou granulats absents',
    text: "L'inspection visuelle de la toiture révèle la présence de bardeaux manquants, soulevés ou présentant une perte importante de granulats sur plusieurs zones. Cette condition compromet l'étanchéité du revêtement et expose la lisse sous-jacente aux infiltrations d'eau. Sans intervention rapide, des dommages aux structures sous-jacentes et aux finis intérieurs sont prévisibles. Le remplacement de la toiture ou la réparation des zones affectées est nécessaire.",
  },
  {
    id: 'pn-toit-nc-solin',
    sectionIds: ['walk-toiture', 'bnq-w-toiture', 'bat-toiture'],
    status: 'non-conforme',
    title: 'Solin décollé ou manquant — infiltration probable',
    text: "Des solins décollés ou absents ont été observés aux jonctions entre la toiture et les éléments verticaux tels que la cheminée, les murs ou les lucarnes. Cette défaillance constitue un point d'infiltration significatif susceptible d'entraîner des dommages à la structure de toiture et aux plafonds. La réfection des solins concernés est requise de façon prioritaire.",
  },
  {
    id: 'pn-toit-nc-membrane',
    sectionIds: ['walk-toiture', 'bnq-w-toiture', 'bat-toiture'],
    status: 'non-conforme',
    title: 'Membrane toit plat endommagée',
    text: "L'inspection de la membrane de toiture à pente nulle révèle la présence de déchirures, de cloques ou de zones de décollement importantes. Ces défauts représentent des risques élevés d'infiltration d'eau vers les structures du bâtiment. Une inspection détaillée par un couvreur qualifié et une réfection partielle ou complète de la membrane sont recommandées.",
  },
  {
    id: 'pn-toit-nc-structure',
    sectionIds: ['walk-toiture', 'bnq-w-toiture', 'bat-toiture'],
    status: 'non-conforme',
    title: 'Dommage structurel apparent à la toiture',
    text: "Un affaissement ou une déformation structurelle de la surface de toiture a été constaté lors de l'inspection, laissant suspecter une défaillance des éléments porteurs sous-jacents. Cette condition peut indiquer une surcharge, une pourriture des chevrons ou une défaillance des membrures de charpente. Une intervention urgente par un professionnel qualifié est nécessaire afin d'évaluer l'étendue des dommages et de procéder aux réparations requises.",
  },
  {
    id: 'pn-toit-nc-soffites',
    sectionIds: ['walk-toiture', 'bnq-w-toiture', 'bat-toiture'],
    status: 'non-conforme',
    title: 'Soffites obstrués — ventilation de comble compromise',
    text: "Les soffites présentent une obstruction importante qui nuit à la libre circulation de l'air dans le comble. Cette condition favorise l'accumulation d'humidité en comble, la formation de condensation et le développement de moisissures sur les structures. La libre circulation de l'air entre les soffites et les évents de faîtage est essentielle à la longévité du système de toiture. Un nettoyage et une correction de l'obstruction sont requis.",
  },
  {
    id: 'pn-toit-ac-fin-vie',
    sectionIds: ['walk-toiture', 'bnq-w-toiture', 'bat-toiture'],
    status: 'a-corriger',
    title: 'Toiture en fin de vie — remplacement à planifier',
    text: "Bien que le revêtement de toiture soit fonctionnel au moment de l'inspection, son état général indique une fin de vie utile approchant. Des signes de vieillissement tels que la perte de granulats, le gondolement des bardeaux et la fragilisation des matériaux sont observés. Un remplacement planifié de la toiture est recommandé afin d'éviter des infiltrations non anticipées. Une inspection annuelle est suggérée dans l'intervalle.",
  },
  {
    id: 'pn-toit-ac-gouttiere',
    sectionIds: ['walk-toiture', 'bnq-w-toiture', 'bat-toiture'],
    status: 'a-corriger',
    title: 'Gouttières obstruées ou mal fixées',
    text: "Les gouttières et les descentes pluviales présentent des obstructions partielles ou un défaut de fixation, ce qui compromet l'évacuation efficace des eaux de pluie. En cas de forte précipitation, le débordement des gouttières peut provoquer des infiltrations au niveau des fondations ou des murs. Un nettoyage et une resécurisation des sections mal ancrées sont recommandés.",
  },
  {
    id: 'pn-toit-ac-calfeutrage',
    sectionIds: ['walk-toiture', 'bnq-w-toiture', 'bat-toiture'],
    status: 'a-corriger',
    title: 'Calfeutrage des émergences à refaire',
    text: "Le calfeutrage autour des émergences de toiture telles que les conduits de ventilation et les cheminées présente des signes de détérioration, notamment des fissures ou un décollement du joint. Cette condition constitue un risque potentiel d'infiltration d'eau. Le remplacement du calfeutrage concerné est recommandé à court terme.",
  },
  {
    id: 'pn-toit-ac-glace',
    sectionIds: ['walk-toiture', 'bnq-w-toiture', 'bat-toiture'],
    status: 'a-corriger',
    title: 'Traces de glace en rive — isolation à améliorer',
    text: "Des traces caractéristiques de la formation de glace en rive ont été observées à la toiture. Ce phénomène résulte d'un apport de chaleur insuffisamment contrôlé depuis l'intérieur vers le comble, pouvant engendrer des infiltrations d'eau lors des redoux. Une amélioration de l'isolation et de la ventilation du comble est recommandée afin de réduire ce risque.",
  },
  {
    id: 'pn-toit-c-1',
    sectionIds: ['walk-toiture', 'bnq-w-toiture', 'bat-toiture'],
    status: 'conforme',
    title: 'Toiture en bon état — aucune anomalie',
    text: "L'inspection visuelle du revêtement de toiture ne révèle aucun signe de détérioration significative. Les bardeaux sont en bon état apparent, les solins sont en place et les gouttières fonctionnent correctement. Aucune intervention immédiate n'est requise.",
  },

  /* ── FAÇADES ──────────────────────────────────────────────────────── */
  {
    id: 'pn-facade-nc-pourriture',
    sectionIds: ['walk-facades', 'bnq-w-facades', 'bat-facades'],
    status: 'non-conforme',
    title: 'Pourriture visible au revêtement ou boiseries',
    text: "Des zones de pourriture ont été constatées sur le revêtement extérieur ou les éléments de boiseries, indiquant une infiltration d'eau prolongée et un manque d'entretien. Cette condition compromet l'intégrité de la barrière contre les intempéries et peut, si non corrigée, affecter la structure sous-jacente. Le remplacement des éléments détériorés et la correction de la source d'humidité sont nécessaires.",
  },
  {
    id: 'pn-facade-nc-fissure',
    sectionIds: ['walk-facades', 'bnq-w-facades', 'bat-facades'],
    status: 'non-conforme',
    title: 'Fissures ouvertes — infiltration probable',
    text: "Des fissures ouvertes sont présentes sur le revêtement extérieur, créant des voies potentielles d'infiltration d'eau vers les couches sous-jacentes. Sans intervention, ces fissures peuvent entraîner des dommages aux matériaux isolants et à la structure de l'enveloppe. Une réparation des zones fissurées et l'application d'un produit d'étanchéité compatible sont recommandées.",
  },
  {
    id: 'pn-facade-nc-lambris',
    sectionIds: ['walk-facades', 'bnq-w-facades', 'bat-facades'],
    status: 'non-conforme',
    title: 'Lambris bombé ou décollé',
    text: "Le revêtement extérieur présente des zones de décollement ou de voilement, ce qui compromet son ancrage à la structure et son rôle de protection contre les intempéries. Cette condition peut résulter d'une infiltration d'eau derrière le revêtement ou d'une fixation inadéquate. La resécurisation ou le remplacement des sections concernées est nécessaire.",
  },
  {
    id: 'pn-facade-ac-peinture',
    sectionIds: ['walk-facades', 'bnq-w-facades', 'bat-facades'],
    status: 'a-corriger',
    title: 'Peinture écaillée — entretien préventif',
    text: "Le revêtement extérieur présente des zones d'écaillage de peinture, exposant le matériau sous-jacent aux intempéries. Bien que sans conséquence structurelle immédiate, cette condition accélère la dégradation du revêtement si elle n'est pas traitée. Un entretien préventif comprenant le ponçage et la repeinture des surfaces concernées est recommandé.",
  },
  {
    id: 'pn-facade-ac-calfeutrage',
    sectionIds: ['walk-facades', 'bnq-w-facades', 'bat-facades'],
    status: 'a-corriger',
    title: 'Calfeutrage des ouvertures à refaire',
    text: "Le calfeutrage aux jonctions des fenêtres, portes et autres ouvertures du revêtement extérieur présente des signes de détérioration tels que des fissures, un décollement ou un manque de contact. Cette condition réduit l'efficacité de l'étanchéité à l'air et à l'eau de l'enveloppe. Le remplacement du calfeutrage dans les zones détériorées est recommandé.",
  },
  {
    id: 'pn-facade-ac-fascia',
    sectionIds: ['walk-facades', 'bnq-w-facades', 'bat-facades'],
    status: 'a-corriger',
    title: 'Fascia ou sous-face à repeindre',
    text: "Les fascias et sous-faces présentent des zones de décoloration ou de détérioration légère de la peinture. Bien que sans conséquence structurelle immédiate, un entretien préventif par application d'un nouveau fini protecteur est recommandé afin de prolonger la durée de vie de ces éléments.",
  },
  {
    id: 'pn-facade-c-1',
    sectionIds: ['walk-facades', 'bnq-w-facades', 'bat-facades'],
    status: 'conforme',
    title: 'Revêtement extérieur en bon état',
    text: "L'inspection visuelle du revêtement extérieur ne révèle aucune fissure significative, aucune zone de pourriture ou de décollement notable. Les boiseries et fascias sont en bon état apparent. L'état actuel est satisfaisant.",
  },

  /* ── OUVERTURES ───────────────────────────────────────────────────── */
  {
    id: 'pn-ouv-nc-garde-corps',
    sectionIds: ['walk-ouvertures', 'bnq-w-ouvertures', 'bat-ouvertures'],
    status: 'non-conforme',
    title: 'Garde-corps absent ou hauteur insuffisante',
    text: "Un garde-corps absent ou présentant une hauteur insuffisante a été constaté en bordure d'un palier, d'une galerie ou d'un escalier extérieur exposé à une dénivellation significative. Cette condition constitue un risque de chute grave pour les occupants et les visiteurs. L'installation d'un garde-corps conforme aux exigences réglementaires en vigueur est nécessaire de façon prioritaire.",
  },
  {
    id: 'pn-ouv-nc-marches',
    sectionIds: ['walk-ouvertures', 'bnq-w-ouvertures', 'bat-ouvertures'],
    status: 'non-conforme',
    title: 'Marches dangereuses — risque de trébucher',
    text: "Des marches présentant un désalignement, un affaissement ou une instabilité ont été observées, créant un risque de trébucher pour les personnes utilisant cet accès. La correction ou le remplacement des marches défectueuses est nécessaire afin de sécuriser l'accès au bâtiment.",
  },
  {
    id: 'pn-ouv-nc-garage',
    sectionIds: ['walk-ouvertures', 'bnq-w-ouvertures', 'bat-ouvertures'],
    status: 'non-conforme',
    title: 'Porte garage — arrêt sur obstacle non fonctionnel',
    text: "Le mécanisme d'arrêt automatique sur obstacle de la porte de garage n'est pas fonctionnel au moment de l'inspection. Cette fonction de sécurité est conçue pour prévenir les accidents lors du passage de personnes ou d'objets sous la porte en mouvement. La mise en service ou le remplacement du mécanisme est nécessaire.",
  },
  {
    id: 'pn-ouv-ac-condensation',
    sectionIds: ['walk-ouvertures', 'bnq-w-ouvertures', 'bat-ouvertures'],
    status: 'a-corriger',
    title: 'Condensation entre vitrages — scellant déficient',
    text: "La présence de condensation persistante entre les vitrages de certaines fenêtres indique une défaillance du scellant périmétrique de l'unité thermique. Bien que sans conséquence structurelle immédiate, cette condition réduit les propriétés isolantes de la fenêtre et peut s'aggraver avec le temps. Le remplacement des unités de vitrage défaillantes est recommandé.",
  },
  {
    id: 'pn-ouv-ac-operation',
    sectionIds: ['walk-ouvertures', 'bnq-w-ouvertures', 'bat-ouvertures'],
    status: 'a-corriger',
    title: 'Fenêtre difficile à opérer',
    text: "Certaines fenêtres sont difficiles à ouvrir ou à fermer en raison d'un désalignement du châssis ou d'une usure des mécanismes. Un ajustement ou une réparation des mécanismes d'opération est recommandé afin d'assurer le bon fonctionnement.",
  },
  {
    id: 'pn-ouv-ac-seuil',
    sectionIds: ['walk-ouvertures', 'bnq-w-ouvertures', 'bat-ouvertures'],
    status: 'a-corriger',
    title: 'Joint de seuil détérioré',
    text: "Le joint d'étanchéité au seuil de la porte extérieure est détérioré, réduisant l'efficacité de la barrière contre les infiltrations d'air et d'eau. Son remplacement est recommandé à court terme.",
  },
  {
    id: 'pn-ouv-c-1',
    sectionIds: ['walk-ouvertures', 'bnq-w-ouvertures', 'bat-ouvertures'],
    status: 'conforme',
    title: 'Portes et fenêtres en bon état',
    text: "L'inspection des portes et fenêtres extérieures ne révèle aucune défaillance significative. Les châssis sont en bon état, les joints sont intacts et les mécanismes d'opération fonctionnent correctement. Les garde-corps et marches sont stables. L'état actuel est satisfaisant.",
  },

  /* ── PLOMBERIE EXTÉRIEURE ─────────────────────────────────────────── */
  {
    id: 'pn-plomb-ext-nc-brise-vide',
    sectionIds: ['walk-plomb-ext', 'bnq-w-plomb-ext', 'bat-plomb-ext'],
    status: 'non-conforme',
    title: 'Brise-vide absent sur robinet extérieur',
    text: "Le robinet d'arrosage extérieur est dépourvu de brise-vide, une protection indispensable qui prévient la contamination du réseau d'eau potable par retour de siphonnage. Cette non-conformité constitue un risque sanitaire documenté. L'installation d'un brise-vide homologué est requise.",
  },
  {
    id: 'pn-plomb-ext-nc-fuite',
    sectionIds: ['walk-plomb-ext', 'bnq-w-plomb-ext', 'bat-plomb-ext'],
    status: 'non-conforme',
    title: 'Fuite visible à la tuyauterie extérieure',
    text: "Une fuite active a été constatée à la tuyauterie ou aux raccords de plomberie extérieure. Cette condition entraîne un gaspillage d'eau et peut, si non corrigée, endommager les matériaux environnants ou favoriser l'érosion du sol adjacent. La réparation immédiate est nécessaire.",
  },
  {
    id: 'pn-plomb-ext-ac-robinet',
    sectionIds: ['walk-plomb-ext', 'bnq-w-plomb-ext', 'bat-plomb-ext'],
    status: 'a-corriger',
    title: 'Robinet extérieur difficile à manœuvrer',
    text: "Le robinet d'arrosage extérieur présente une résistance excessive à la manœuvre, pouvant indiquer une usure du mécanisme interne ou une corrosion. Son remplacement ou sa réparation est recommandé afin de prévenir une défaillance complète.",
  },
  {
    id: 'pn-plomb-ext-ac-event',
    sectionIds: ['walk-plomb-ext', 'bnq-w-plomb-ext', 'bat-plomb-ext'],
    status: 'a-corriger',
    title: 'Évent de plomberie partiellement obstrué',
    text: "L'évent de plomberie présentait une obstruction partielle au moment de l'inspection, ce qui peut nuire à l'évacuation des gaz et au bon écoulement du réseau de drainage. Un nettoyage ou une vérification par un plombier est recommandé.",
  },
  {
    id: 'pn-plomb-ext-c-1',
    sectionIds: ['walk-plomb-ext', 'bnq-w-plomb-ext', 'bat-plomb-ext'],
    status: 'conforme',
    title: 'Plomberie extérieure conforme',
    text: "Le robinet d'arrosage extérieur est muni de son brise-vide, est fonctionnel et ne présente aucune fuite apparente. Les évents de plomberie sont dégagés. L'état actuel est satisfaisant.",
  },

  /* ── ÉLECTRICITÉ EXTÉRIEURE ───────────────────────────────────────── */
  {
    id: 'pn-elec-ext-nc-mat',
    sectionIds: ['walk-elec-ext', 'bnq-w-elec-ext', 'bat-elec-ext'],
    status: 'non-conforme',
    title: 'Mât d\'entrée électrique mal ancré',
    text: "Le mât d'entrée électrique présente un ancrage insuffisant au bâtiment, créant un risque de déplacement sous l'effet du vent ou d'un choc. Cette condition peut entraîner une tension mécanique sur les fils de service et compromettre la sécurité de l'installation. Une resécurisation par un électricien qualifié est requise.",
  },
  {
    id: 'pn-elec-ext-nc-cable',
    sectionIds: ['walk-elec-ext', 'bnq-w-elec-ext', 'bat-elec-ext'],
    status: 'non-conforme',
    title: 'Câblage dénudé ou mal protégé à l\'entrée',
    text: "Des portions de câblage exposées ou insuffisamment protégées ont été observées à l'entrée de service électrique du bâtiment. Cette condition représente un risque d'électrocution ou d'incendie. Une intervention par un électricien qualifié est nécessaire de façon urgente.",
  },
  {
    id: 'pn-elec-ext-nc-hauteur',
    sectionIds: ['walk-elec-ext', 'bnq-w-elec-ext', 'bat-elec-ext'],
    status: 'non-conforme',
    title: 'Hauteur des fils de service insuffisante',
    text: "Les fils de service électrique aérien ne respectent pas la hauteur minimale requise au-dessus du sol ou des zones de passage, ce qui crée un risque pour la sécurité des personnes. Une correction par la compagnie de distribution d'électricité concernée est nécessaire.",
  },
  {
    id: 'pn-elec-ext-ac-conduit',
    sectionIds: ['walk-elec-ext', 'bnq-w-elec-ext', 'bat-elec-ext'],
    status: 'a-corriger',
    title: 'Conduit d\'entrée à resécuriser',
    text: "Le conduit d'entrée de service électrique est partiellement décollé ou mal fixé au bâtiment. Un resserrement ou une resécurisation des fixations par un électricien qualifié est recommandé afin de maintenir l'intégrité de l'installation.",
  },
  {
    id: 'pn-elec-ext-ac-coffret',
    sectionIds: ['walk-elec-ext', 'bnq-w-elec-ext', 'bat-elec-ext'],
    status: 'a-corriger',
    title: 'Coffret extérieur à inspecter par électricien',
    text: "Le coffret électrique extérieur présente des signes d'usure ou de corrosion qui justifient une inspection approfondie par un électricien qualifié. Une vérification de l'étanchéité et de l'état des composants internes est recommandée.",
  },
  {
    id: 'pn-elec-ext-c-1',
    sectionIds: ['walk-elec-ext', 'bnq-w-elec-ext', 'bat-elec-ext'],
    status: 'conforme',
    title: 'Entrée de service électrique en bon état',
    text: "L'entrée de service électrique est bien ancrée, le câblage est correctement protégé et la mise à la terre est raccordée. Aucune anomalie n'a été observée lors de l'inspection visuelle. L'état actuel est satisfaisant.",
  },

  /* ── STRUCTURE INTÉRIEURE ─────────────────────────────────────────── */
  {
    id: 'pn-struct-nc-affaissement',
    sectionIds: ['aibq-v-i', 'aibq-v-i-17', 'bnq-12-2'],
    status: 'non-conforme',
    title: 'Affaissement de plancher — intervention structurale',
    text: "Un affaissement notable du plancher a été constaté dans une ou plusieurs zones du bâtiment, se manifestant par une déviation perceptible à la marche ou visuellement. Cette condition peut indiquer une défaillance des solives portantes, un pourrissement des appuis ou un tassement différentiel des fondations. Une investigation par un ingénieur en structure est requise afin de déterminer la cause et les travaux correctifs nécessaires.",
  },
  {
    id: 'pn-struct-nc-pourriture',
    sectionIds: ['aibq-v-i', 'aibq-v-i-17', 'bnq-12-2'],
    status: 'non-conforme',
    title: 'Pourriture ou dommage par eau à la structure',
    text: "Des signes de pourriture ont été relevés sur les éléments structuraux accessibles, notamment les solives ou les poutres, résultant d'une exposition prolongée à l'humidité. Cette condition compromet la capacité portante des éléments affectés et doit être traitée par le remplacement ou le renforcement des sections détériorées. Une investigation approfondie de la source d'humidité est également nécessaire.",
  },
  {
    id: 'pn-struct-nc-fissure',
    sectionIds: ['aibq-v-i', 'aibq-v-i-17', 'bnq-12-2'],
    status: 'non-conforme',
    title: 'Fissure structurelle active — expert requis',
    text: "Une fissure dont la morphologie et l'ampleur laissent suspecter un mouvement structurel actif a été observée. Ce type de fissuration peut indiquer une surcharge, un tassement différentiel ou une défaillance des éléments porteurs. Une évaluation par un ingénieur en structure est requise de façon urgente.",
  },
  {
    id: 'pn-struct-ac-craquement',
    sectionIds: ['aibq-v-i', 'aibq-v-i-17', 'bnq-12-2'],
    status: 'a-corriger',
    title: 'Craquement excessif au plancher',
    text: "Des craquements prononcés ont été notés au plancher lors de la marche, pouvant indiquer un relâchement des fixations entre les solives et le sous-plancher, ou une usure des éléments d'assemblage. Bien que généralement sans conséquence structurelle immédiate, un diagnostic par un spécialiste est recommandé afin de confirmer l'absence de problème structurel sous-jacent.",
  },
  {
    id: 'pn-struct-ac-humidite',
    sectionIds: ['aibq-v-i', 'aibq-v-i-17', 'bnq-12-2'],
    status: 'a-corriger',
    title: 'Humidité sur la structure — source à identifier',
    text: "Des traces d'humidité ont été relevées sur des éléments structuraux accessibles. La source de cette humidité n'est pas clairement identifiable lors de l'inspection visuelle seule. Une investigation afin d'en déterminer l'origine est recommandée, car une exposition prolongée à l'humidité peut conduire à la dégradation des éléments structuraux.",
  },
  {
    id: 'pn-struct-c-1',
    sectionIds: ['aibq-v-i', 'aibq-v-i-17', 'bnq-12-2'],
    status: 'conforme',
    title: 'Structure apparente en bon état',
    text: "L'inspection des éléments structuraux accessibles ne révèle aucun signe de déformation, de pourriture ou d'endommagement significatif. Les planchers sont de niveau et les poutres et solives visibles sont en bon état apparent. Aucune intervention n'est requise dans l'immédiat.",
  },

  /* ── PLOMBERIE INTÉRIEURE ─────────────────────────────────────────── */
  {
    id: 'pn-plomb-nc-fuite',
    sectionIds: ['aibq-v-iv', 'bnq-12-3'],
    status: 'non-conforme',
    title: 'Fuite active à la tuyauterie intérieure',
    text: "Une fuite active a été constatée à la tuyauterie intérieure ou aux raccords du bâtiment. Cette condition nécessite une intervention immédiate afin de prévenir des dommages aux matériaux environnants, au sous-plancher et aux structures. La réparation ou le remplacement du composant défaillant est requis de façon urgente.",
  },
  {
    id: 'pn-plomb-nc-tp',
    sectionIds: ['aibq-v-iv', 'bnq-12-3'],
    status: 'non-conforme',
    title: 'Soupape T&P absente ou obstruée',
    text: "La soupape de sécurité thermique et de pression du chauffe-eau est absente ou obstruée, ce qui représente un risque de surpression pouvant entraîner une défaillance grave de l'appareil. L'installation d'une soupape homologuée et fonctionnelle, avec tuyau de décharge conforme, est nécessaire de façon immédiate.",
  },
  {
    id: 'pn-plomb-nc-polyb',
    sectionIds: ['aibq-v-iv', 'bnq-12-3'],
    status: 'non-conforme',
    title: 'Tuyauterie en polybutylène (Poly-B)',
    text: "La tuyauterie d'alimentation en eau est en polybutylène, un matériau reconnu pour sa tendance à se fissurer et à causer des dégâts d'eau intérieurs importants, parfois sans avertissement. Ce type de tuyauterie est généralement considéré comme ayant atteint la fin de sa vie utile. Son remplacement complet par un matériau conforme est fortement recommandé et peut être requis par certains assureurs.",
  },
  {
    id: 'pn-plomb-nc-refoulement',
    sectionIds: ['aibq-v-iv', 'bnq-12-3'],
    status: 'non-conforme',
    title: 'Refoulement au drain — obstruction d\'égout',
    text: "Un refoulement ou un écoulement insuffisant a été constaté lors de l'inspection, indiquant une obstruction dans le réseau de drainage ou une défaillance du branchement d'égout. Cette condition peut entraîner des dégâts d'eau importants en cas de mise en charge du réseau. Une inspection et un nettoyage du réseau de drainage par un plombier qualifié sont nécessaires.",
  },
  {
    id: 'pn-plomb-nc-plomb',
    sectionIds: ['aibq-v-iv', 'bnq-12-3'],
    status: 'non-conforme',
    title: 'Tuyaux de plomb suspectés',
    text: "La présence de tuyaux dont le matériau est compatible avec du plomb a été relevée dans le système de plomberie du bâtiment. Le plomb dans les conduites d'eau représente un risque sanitaire reconnu, particulièrement pour les enfants en bas âge. Une analyse de l'eau potable et une confirmation du matériau par un plombier qualifié sont recommandées, suivies d'un plan de remplacement si confirmé.",
  },
  {
    id: 'pn-plomb-ac-chauffe-eau',
    sectionIds: ['aibq-v-iv', 'bnq-12-3'],
    status: 'a-corriger',
    title: 'Chauffe-eau en fin de vie estimée',
    text: "Le chauffe-eau présente des signes de vieillissement avancé, notamment la corrosion de l'enveloppe extérieure, des traces de fuite ou un âge estimé dépassant la durée de vie utile typique de l'appareil. Un remplacement planifié est recommandé afin d'éviter une défaillance soudaine pouvant entraîner des dégâts d'eau importants.",
  },
  {
    id: 'pn-plomb-ac-galvanise',
    sectionIds: ['aibq-v-iv', 'bnq-12-3'],
    status: 'a-corriger',
    title: 'Tuyauterie en acier galvanisé vieillissante',
    text: "La tuyauterie d'amenée d'eau est en acier galvanisé, un matériau dont la durée de vie est limitée en raison de la corrosion interne progressive. Cette corrosion peut réduire le débit d'eau, colorer l'eau et éventuellement mener à des fuites. Une planification du remplacement de la tuyauterie par un matériau moderne est recommandée.",
  },
  {
    id: 'pn-plomb-ac-pression',
    sectionIds: ['aibq-v-iv', 'bnq-12-3'],
    status: 'a-corriger',
    title: 'Pression d\'eau faible',
    text: "Une pression d'eau insuffisante a été notée lors de l'inspection des points de puisage. Cette condition peut résulter d'une tuyauterie obstruée, d'un régulateur de pression défaillant ou d'une pression d'alimentation insuffisante en entrée de service. Une vérification par un plombier qualifié est recommandée.",
  },
  {
    id: 'pn-plomb-ac-odeur',
    sectionIds: ['aibq-v-iv', 'bnq-12-3'],
    status: 'a-corriger',
    title: 'Odeur d\'égout — joint à inspecter',
    text: "Une odeur d'égout a été perçue lors de l'inspection. Cette condition peut indiquer un siphon asséché, un joint défaillant ou un problème de ventilation du réseau de drainage. Une inspection par un plombier qualifié est recommandée afin d'identifier et corriger la source de l'odeur.",
  },
  {
    id: 'pn-plomb-c-1',
    sectionIds: ['aibq-v-iv', 'bnq-12-3'],
    status: 'conforme',
    title: 'Plomberie intérieure en bon état',
    text: "L'inspection visuelle de la plomberie intérieure accessible ne révèle aucune fuite active, aucun refoulement et aucune dégradation significative des conduites. Le chauffe-eau est fonctionnel et muni de sa soupape de sécurité. Le robinet d'arrêt principal est repéré et opérationnel. L'état actuel est satisfaisant.",
  },

  /* ── ÉLECTRICITÉ INTÉRIEURE ───────────────────────────────────────── */
  {
    id: 'pn-elec-nc-surprotection',
    sectionIds: ['aibq-v-v', 'bnq-12-4'],
    status: 'non-conforme',
    title: 'Surprotection au panneau — risque d\'incendie',
    text: "Des fusibles ou des disjoncteurs surdimensionnés par rapport à la capacité des circuits qu'ils protègent ont été observés au panneau électrique. Cette condition présente un risque d'incendie car un courant excessif peut traverser les fils sans déclencher la protection. La correction par un électricien qualifié est nécessaire.",
  },
  {
    id: 'pn-elec-nc-aluminium',
    sectionIds: ['aibq-v-v', 'bnq-12-4'],
    status: 'non-conforme',
    title: 'Câblage aluminium — inspection CMEQ recommandée',
    text: "La présence de câblage en aluminium a été notée dans le bâtiment. Ce type de câblage, utilisé durant les années 1960-1970, nécessite une attention particulière car il est sujet à des phénomènes de détente et de corrosion aux connexions pouvant constituer un risque d'incendie. Une inspection complète du câblage et des connexions par un électricien qualifié est recommandée.",
  },
  {
    id: 'pn-elec-nc-panneau',
    sectionIds: ['aibq-v-v', 'bnq-12-4'],
    status: 'non-conforme',
    title: 'Panneau électrique problématique — remplacement',
    text: "Le panneau électrique présent dans ce bâtiment est d'un modèle reconnu pour présenter des défaillances documentées dans la littérature technique, notamment des disjoncteurs qui ne déclenchent pas correctement en cas de surcharge. Son remplacement par un panneau conforme aux exigences actuelles est fortement recommandé pour des raisons de sécurité.",
  },
  {
    id: 'pn-elec-nc-fil-denude',
    sectionIds: ['aibq-v-v', 'bnq-12-4'],
    status: 'non-conforme',
    title: 'Fil dénudé ou boîte de jonction ouverte',
    text: "Des fils dénudés ou une boîte de jonction laissée ouverte ont été constatés lors de l'inspection, exposant les connexions électriques sans protection adéquate. Cette condition représente un risque immédiat d'électrocution ou d'incendie. Une correction par un électricien qualifié est requise de façon urgente.",
  },
  {
    id: 'pn-elec-nc-doubletap',
    sectionIds: ['aibq-v-v', 'bnq-12-4'],
    status: 'non-conforme',
    title: 'Double-tap au panneau — correction requise',
    text: "Plusieurs circuits partagent un même disjoncteur au panneau électrique, une pratique communément désignée comme double-tap. Cette condition n'est généralement pas conforme aux règles de l'art et peut résulter en une protection inadéquate des circuits. Une correction par un électricien qualifié est recommandée.",
  },
  {
    id: 'pn-elec-ac-liste',
    sectionIds: ['aibq-v-v', 'bnq-12-4'],
    status: 'a-corriger',
    title: 'Liste des circuits absente ou incomplète',
    text: "La liste des circuits du panneau électrique est absente ou incomplète, rendant difficile l'identification des circuits et toute intervention d'urgence sur le système électrique. La préparation d'une liste complète des circuits avec leurs affectations est recommandée.",
  },
  {
    id: 'pn-elec-ac-ddft',
    sectionIds: ['aibq-v-v', 'bnq-12-4'],
    status: 'a-corriger',
    title: 'Prise non mise à la terre en zone humide',
    text: "Des prises électriques non mises à la terre ont été relevées dans des zones humides telles que la salle de bain ou la cuisine. Dans ces espaces, des dispositifs de protection contre les défauts à la terre sont requis pour assurer la sécurité des occupants. L'installation de dispositifs de protection appropriés par un électricien qualifié est recommandée.",
  },
  {
    id: 'pn-elec-ac-60a',
    sectionIds: ['aibq-v-v', 'bnq-12-4'],
    status: 'a-corriger',
    title: 'Panneau 60 A — mise à niveau recommandée',
    text: "Le panneau électrique principal est d'une capacité de 60 ampères, ce qui est généralement insuffisant pour répondre aux besoins en puissance d'une résidence moderne. Une mise à niveau à 100 ampères ou plus est recommandée, en particulier si des appareils énergivores sont utilisés ou prévus.",
  },
  {
    id: 'pn-elec-c-1',
    sectionIds: ['aibq-v-v', 'bnq-12-4'],
    status: 'conforme',
    title: 'Panneau électrique en bon état',
    text: "Le panneau électrique est en bon état apparent, les circuits sont identifiés, et aucune anomalie visuelle n'a été constatée. Le câblage apparent est conforme et les dispositifs de protection fonctionnent correctement. L'ampérage est adéquat pour l'usage résidentiel. L'état actuel est satisfaisant.",
  },

  /* ── CHAUFFAGE ────────────────────────────────────────────────────── */
  {
    id: 'pn-chauf-nc-non-fonctionnel',
    sectionIds: ['aibq-v-vi', 'bnq-12-5'],
    status: 'non-conforme',
    title: 'Système de chauffage non fonctionnel',
    text: "Le système de chauffage ne répond pas aux commandes de mise en marche lors de l'inspection. Une telle défaillance peut avoir de multiples origines, notamment une panne d'un composant électrique ou mécanique, un problème d'alimentation en combustible ou une défaillance du thermostat. Une inspection par un technicien qualifié est requise de façon urgente afin d'identifier et corriger la cause de la panne.",
  },
  {
    id: 'pn-chauf-nc-conduit',
    sectionIds: ['aibq-v-vi', 'bnq-12-5'],
    status: 'non-conforme',
    title: 'Conduit de fumée décollé — risque CO',
    text: "Un décollement du conduit de fumée ou de la tuyauterie d'évacuation des gaz de combustion a été constaté lors de l'inspection. Cette condition présente un risque sérieux d'intoxication au monoxyde de carbone, un gaz inodore et potentiellement mortel. Une intervention urgente par un technicien qualifié est nécessaire avant toute utilisation du système de chauffage.",
  },
  {
    id: 'pn-chauf-nc-gaz',
    sectionIds: ['aibq-v-vi', 'bnq-12-5'],
    status: 'non-conforme',
    title: 'Tuyauterie de gaz corrodée',
    text: "La tuyauterie d'alimentation en gaz naturel ou en propane présente des signes de corrosion avancée, ce qui peut compromettre son étanchéité et présenter un risque d'explosion ou d'incendie. Une inspection par la compagnie gazière ou un technicien certifié est requise de façon urgente.",
  },
  {
    id: 'pn-chauf-nc-echangeur',
    sectionIds: ['aibq-v-vi', 'bnq-12-5'],
    status: 'non-conforme',
    title: 'Échangeur thermique suspect — fissure ou odeur',
    text: "Des indices d'une fissure ou d'une défaillance de l'échangeur thermique ont été relevés lors de l'inspection, notamment une odeur de combustion ou des traces de suie inhabituelles. Une fissure à l'échangeur thermique peut permettre aux gaz de combustion de se mélanger à l'air circulé dans le bâtiment, créant un risque d'intoxication au monoxyde de carbone. Une inspection approfondie par un technicien qualifié est requise de façon urgente.",
  },
  {
    id: 'pn-chauf-nc-certification',
    sectionIds: ['aibq-v-vi', 'bnq-12-5'],
    status: 'non-conforme',
    title: 'Foyer ou poêle sans plaque de certification',
    text: "Le foyer ou l'appareil de chauffage au bois installé dans le bâtiment ne présente aucune plaque de certification d'un organisme reconnu. Un appareil non certifié ne garantit pas les exigences de sécurité minimales en matière d'émissions et de prévention des incendies. Une évaluation par un technicien qualifié et une mise en conformité sont nécessaires.",
  },
  {
    id: 'pn-chauf-ac-filtre',
    sectionIds: ['aibq-v-vi', 'bnq-12-5'],
    status: 'a-corriger',
    title: 'Filtre à remplacer',
    text: "Le filtre du système de chauffage à air forcé est encrassé et doit être remplacé. Un filtre obstrué réduit le débit d'air, diminue l'efficacité du système et peut entraîner une surchauffe des composants. Le remplacement du filtre est une intervention d'entretien courante qui doit être effectuée immédiatement.",
  },
  {
    id: 'pn-chauf-ac-fin-vie',
    sectionIds: ['aibq-v-vi', 'bnq-12-5'],
    status: 'a-corriger',
    title: 'Système de chauffage en fin de vie estimée',
    text: "Le système de chauffage présente des signes de vieillissement avancé. Bien que fonctionnel au moment de l'inspection, son âge estimé dépasse ou approche la durée de vie utile typique de ce type d'appareil. Un remplacement planifié est recommandé afin d'éviter une panne en période de grand froid.",
  },
  {
    id: 'pn-chauf-ac-bruit',
    sectionIds: ['aibq-v-vi', 'bnq-12-5'],
    status: 'a-corriger',
    title: 'Bruit anormal au démarrage',
    text: "Un bruit anormal a été constaté lors du démarrage du système de chauffage, pouvant indiquer une usure des composants mécaniques. Une inspection par un technicien qualifié est recommandée afin d'identifier la source du bruit et d'effectuer les ajustements ou remplacements nécessaires.",
  },
  {
    id: 'pn-chauf-ac-co',
    sectionIds: ['aibq-v-vi', 'bnq-12-5'],
    status: 'a-corriger',
    title: 'Détecteur CO absent — installation requise',
    text: "Aucun détecteur de monoxyde de carbone n'est présent dans le bâtiment, alors qu'un ou plusieurs appareils à combustion y sont installés. L'installation d'un ou de plusieurs détecteurs à des emplacements conformes est nécessaire afin de protéger les occupants contre ce risque invisible et potentiellement mortel.",
  },
  {
    id: 'pn-chauf-c-1',
    sectionIds: ['aibq-v-vi', 'bnq-12-5'],
    status: 'conforme',
    title: 'Système de chauffage fonctionnel',
    text: "Le système de chauffage a répondu correctement aux commandes lors de l'inspection. Les filtres sont en bon état, le conduit d'évacuation est bien raccordé et le thermostat fonctionne adéquatement. Aucune anomalie n'a été constatée lors de l'inspection visuelle.",
  },

  /* ── CLIMATISATION ────────────────────────────────────────────────── */
  {
    id: 'pn-clim-nc-non-fonctionnel',
    sectionIds: ['aibq-v-vii'],
    status: 'non-conforme',
    title: 'Système de climatisation non fonctionnel',
    text: "Le système de climatisation ou la thermopompe n'a pas répondu aux commandes lors de l'inspection. Cette défaillance peut avoir de multiples origines et nécessite une intervention par un technicien en réfrigération qualifié afin d'identifier et corriger la cause.",
  },
  {
    id: 'pn-clim-nc-condensat',
    sectionIds: ['aibq-v-vii'],
    status: 'non-conforme',
    title: 'Drainage des condensats absent ou obstrué',
    text: "Le système d'évacuation des condensats produits par le système de climatisation est absent ou obstrué, ce qui peut entraîner des débordements et des dommages aux matériaux adjacents. L'installation ou le dégagement du tuyau d'évacuation des condensats est nécessaire.",
  },
  {
    id: 'pn-clim-ac-fin-vie',
    sectionIds: ['aibq-v-vii'],
    status: 'a-corriger',
    title: 'Unité extérieure en fin de vie',
    text: "L'unité extérieure de la thermopompe ou du climatiseur présente des signes de vieillissement avancé. Bien que fonctionnelle au moment de l'inspection, son âge estimé suggère une planification du remplacement à moyen terme.",
  },
  {
    id: 'pn-clim-ac-entretien',
    sectionIds: ['aibq-v-vii'],
    status: 'a-corriger',
    title: 'Entretien annuel recommandé',
    text: "Aucune documentation d'entretien récent du système de climatisation ou de la thermopompe n'a été relevée lors de l'inspection. Un entretien annuel par un technicien qualifié, comprenant le nettoyage des filtres et des échangeurs, est recommandé afin de maintenir l'efficacité et prolonger la durée de vie de l'équipement.",
  },
  {
    id: 'pn-clim-c-1',
    sectionIds: ['aibq-v-vii'],
    status: 'conforme',
    title: 'Climatisation fonctionnelle',
    text: "Le système de climatisation ou la thermopompe a répondu correctement aux commandes lors de l'inspection. L'unité extérieure est en bon état apparent et le drainage des condensats est en place. L'état actuel est satisfaisant.",
  },

  /* ── INTÉRIEUR ARCHITECTURAL ──────────────────────────────────────── */
  {
    id: 'pn-int-nc-humidite-active',
    sectionIds: ['aibq-v-viii', 'bnq-12-6'],
    status: 'non-conforme',
    title: 'Taches d\'humidité actives — infiltration en cours',
    text: "Des taches d'humidité présentant des caractéristiques d'infiltration active ont été constatées aux surfaces intérieures, notamment sur les plafonds ou les murs. Cette condition indique une source d'humidité en cours, qu'il peut s'agir d'une fuite de plomberie, d'une infiltration par l'enveloppe ou d'une problématique de condensation. L'identification et la correction de la source sont prioritaires afin d'éviter des dommages structuraux et le développement de moisissures.",
  },
  {
    id: 'pn-int-nc-moisissure',
    sectionIds: ['aibq-v-viii', 'bnq-12-6'],
    status: 'non-conforme',
    title: 'Moisissure visible — investigation requise',
    text: "La présence de moisissures visibles a été constatée sur des surfaces intérieures du bâtiment. Les moisissures indiquent une problématique d'humidité persistante et peuvent présenter des risques pour la santé des occupants. Une investigation afin d'identifier et de corriger la source d'humidité est requise, suivie d'une décontamination adéquate par un professionnel qualifié.",
  },
  {
    id: 'pn-int-nc-garde-corps',
    sectionIds: ['aibq-v-viii', 'bnq-12-6'],
    status: 'non-conforme',
    title: 'Garde-corps intérieur déficient — risque de chute',
    text: "Le garde-corps d'un escalier ou d'une mezzanine intérieure est absent, instable ou d'une hauteur insuffisante, créant un risque de chute grave pour les occupants. L'installation ou la mise en conformité du garde-corps est nécessaire de façon urgente.",
  },
  {
    id: 'pn-int-nc-silicone',
    sectionIds: ['aibq-v-viii', 'bnq-12-6'],
    status: 'non-conforme',
    title: 'Joint silicone douche absent ou décollé',
    text: "Le joint d'étanchéité en silicone à la jonction de l'enceinte de douche ou du bain avec le mur ou le plancher est décollé, absent ou détérioré sur une portion significative de sa longueur. Cette défaillance permet l'infiltration d'eau vers les structures sous-jacentes, pouvant entraîner des dommages importants à moyen terme. La réfection complète du joint est nécessaire.",
  },
  {
    id: 'pn-int-ac-humidite-ancienne',
    sectionIds: ['aibq-v-viii', 'bnq-12-6'],
    status: 'a-corriger',
    title: 'Taches d\'humidité anciennes — surveillance',
    text: "Des taches d'humidité d'apparence ancienne ont été constatées aux surfaces intérieures. Bien que sans signe d'activité au moment de l'inspection, leur présence indique un épisode d'infiltration ou de fuite passé dont la source a peut-être été corrigée. Une surveillance est recommandée afin de détecter toute récurrence.",
  },
  {
    id: 'pn-int-ac-carrelage',
    sectionIds: ['aibq-v-viii', 'bnq-12-6'],
    status: 'a-corriger',
    title: 'Carrelage décollé ou joint fissuré',
    text: "Un ou plusieurs carreaux de céramique sont décollés ou présentent des joints fissurés. Bien que sans conséquence structurelle immédiate, cette condition peut permettre l'infiltration d'eau sous le revêtement et accélérer sa dégradation. Une réparation ciblée est recommandée.",
  },
  {
    id: 'pn-int-ac-silicone',
    sectionIds: ['aibq-v-viii', 'bnq-12-6'],
    status: 'a-corriger',
    title: 'Joints silicone salle de bain à refaire',
    text: "Les joints de silicone dans la salle de bain présentent des signes de vieillissement, notamment une coloration, un retrait ou un début de décollement. Leur remplacement préventif est recommandé afin de maintenir l'étanchéité de l'enceinte humide.",
  },
  {
    id: 'pn-int-ac-porte',
    sectionIds: ['aibq-v-viii', 'bnq-12-6'],
    status: 'a-corriger',
    title: 'Porte intérieure difficile à fermer',
    text: "Une ou plusieurs portes intérieures sont difficiles à fermer ou présentent un désalignement dans leur encadrement. Cette condition peut résulter d'un mouvement saisonnier des matériaux ou d'un tassement mineur. Un ajustement ou un rééquilibrage est recommandé.",
  },
  {
    id: 'pn-int-c-1',
    sectionIds: ['aibq-v-viii', 'bnq-12-6'],
    status: 'conforme',
    title: 'Intérieur en bon état général',
    text: "L'inspection visuelle des finis intérieurs ne révèle aucune tache d'humidité active, aucune moisissure visible et aucun défaut structurel apparent. Les portes, fenêtres intérieures, escaliers et garde-corps sont en bon état et fonctionnels. L'état actuel est satisfaisant.",
  },

  /* ── ISOLATION / COMBLES ──────────────────────────────────────────── */
  {
    id: 'pn-iso-nc-absente',
    sectionIds: ['aibq-v-ix', 'bnq-12-7'],
    status: 'non-conforme',
    title: 'Isolation absente dans zone accessible',
    text: "L'isolation est absente ou insuffisante dans des zones accessibles qui devraient être isolées selon les pratiques courantes de construction. Cette lacune engendre des pertes thermiques importantes et peut contribuer à la formation de condensation dans les zones non isolées. Un complément d'isolation par un entrepreneur qualifié est nécessaire.",
  },
  {
    id: 'pn-iso-nc-parevapeur',
    sectionIds: ['aibq-v-ix', 'bnq-12-7'],
    status: 'non-conforme',
    title: 'Pare-vapeur absent ou perforé',
    text: "Aucun pare-vapeur n'est présent ou celui-ci est perforé ou mal installé dans les zones vérifiées. L'absence de pare-vapeur favorise la migration de la vapeur d'eau vers les structures froides, pouvant entraîner de la condensation, des dommages aux matériaux et le développement de moisissures. Sa mise en place correcte est nécessaire.",
  },
  {
    id: 'pn-iso-nc-moisissure',
    sectionIds: ['aibq-v-ix', 'bnq-12-7'],
    status: 'non-conforme',
    title: 'Moisissure sur isolant ou structure du comble',
    text: "La présence de moisissures a été constatée sur l'isolant ou les éléments structuraux du comble ou de l'espace sous-plancher, indiquant une problématique d'humidité chronique. Une investigation afin d'identifier la source d'humidité, une décontamination et une correction de la ventilation ou de l'étanchéité sont nécessaires.",
  },
  {
    id: 'pn-iso-ac-completer',
    sectionIds: ['aibq-v-ix', 'bnq-12-7'],
    status: 'a-corriger',
    title: 'Isolation à compléter dans certaines zones',
    text: "L'épaisseur d'isolation est insuffisante ou inégalement répartie dans certaines zones du comble ou du vide sous-plancher. Un complément d'isolation est recommandé afin d'améliorer l'efficacité thermique du bâtiment et réduire les risques de condensation.",
  },
  {
    id: 'pn-iso-ac-pont',
    sectionIds: ['aibq-v-ix', 'bnq-12-7'],
    status: 'a-corriger',
    title: 'Pont thermique apparent',
    text: "Des ponts thermiques ont été identifiés dans l'enveloppe du bâtiment, notamment aux jonctions entre les éléments structuraux et l'isolant. Ces discontinuités thermiques réduisent l'efficacité globale de l'isolation et peuvent favoriser la condensation localisée. Des mesures correctives sont recommandées.",
  },
  {
    id: 'pn-iso-c-1',
    sectionIds: ['aibq-v-ix', 'bnq-12-7'],
    status: 'conforme',
    title: 'Isolation en bon état et quantité adéquate',
    text: "L'inspection des zones d'isolation accessibles indique une quantité adéquate d'isolant en bon état apparent, sans signe de moisissure, d'humidité excessive ou de dommage. L'état actuel est satisfaisant.",
  },

  /* ── VENTILATION ──────────────────────────────────────────────────── */
  {
    id: 'pn-vent-nc-secheuse',
    sectionIds: ['aibq-v-x'],
    status: 'non-conforme',
    title: 'Évent de sécheuse obstrué — risque d\'incendie',
    text: "Le conduit d'évacuation de la sécheuse est obstrué ou présente une accumulation importante de charpie, ce qui réduit son efficacité et constitue un risque d'incendie documenté. Un nettoyage complet du conduit d'évacuation est requis de façon urgente.",
  },
  {
    id: 'pn-vent-nc-sdb',
    sectionIds: ['aibq-v-x'],
    status: 'non-conforme',
    title: 'Ventilateur de salle de bain non fonctionnel',
    text: "Le ventilateur d'extraction de la salle de bain est non fonctionnel ou évacue dans le comble plutôt qu'à l'extérieur. Cette condition favorise l'accumulation d'humidité et le développement de moisissures dans la salle de bain ou le comble. Sa réparation ou son remplacement, avec une évacuation correctement dirigée vers l'extérieur, est nécessaire.",
  },
  {
    id: 'pn-vent-nc-comble',
    sectionIds: ['aibq-v-x'],
    status: 'non-conforme',
    title: 'Ventilation de comble insuffisante',
    text: "La ventilation du comble est insuffisante, que ce soit par obstruction des soffites, absence d'évents de faîtage ou superficie insuffisante d'évents. Cette condition favorise l'accumulation d'humidité, la formation de glace en rive et la détérioration prématurée des éléments de toiture. Des améliorations à la ventilation sont nécessaires.",
  },
  {
    id: 'pn-vent-ac-echangeur',
    sectionIds: ['aibq-v-x'],
    status: 'a-corriger',
    title: 'Filtres échangeur d\'air à changer',
    text: "Les filtres de l'échangeur d'air récupérateur de chaleur nécessitent un remplacement ou un nettoyage. Des filtres encrassés réduisent le débit d'air frais et l'efficacité de l'appareil. Le remplacement régulier des filtres est essentiel au bon fonctionnement de l'échangeur.",
  },
  {
    id: 'pn-vent-ac-cuisine',
    sectionIds: ['aibq-v-x'],
    status: 'a-corriger',
    title: 'Ventilateur de cuisine évacuant dans le comble',
    text: "Le ventilateur de cuisine évacue vers le comble plutôt que directement vers l'extérieur. Cette installation déficiente introduit de l'humidité et des odeurs de cuisson dans le comble, favorisant la condensation et la détérioration des structures. Un raccordement du conduit vers l'extérieur du bâtiment est nécessaire.",
  },
  {
    id: 'pn-vent-c-1',
    sectionIds: ['aibq-v-x'],
    status: 'conforme',
    title: 'Ventilation adéquate',
    text: "L'inspection visuelle de la ventilation accessible indique un fonctionnement adéquat des ventilateurs d'extraction et des évents de comble. Aucune obstruction significative n'a été observée. L'état actuel est satisfaisant.",
  },

  /* ── SÉCURITÉ DES PERSONNES ───────────────────────────────────────── */
  {
    id: 'pn-secu-nc-fumee',
    sectionIds: ['aibq-v-xi', 'bnq-12-8'],
    status: 'non-conforme',
    title: 'Détecteur de fumée absent',
    text: "L'absence de détecteur de fumée dans une zone où sa présence est requise a été constatée lors de l'inspection. Cette condition constitue un risque grave pour la sécurité des occupants en cas d'incendie. L'installation immédiate d'un ou de plusieurs détecteurs de fumée est nécessaire.",
  },
  {
    id: 'pn-secu-nc-co',
    sectionIds: ['aibq-v-xi', 'bnq-12-8'],
    status: 'non-conforme',
    title: 'Détecteur CO absent — installation obligatoire',
    text: "Aucun détecteur de monoxyde de carbone n'est présent dans le bâtiment, alors qu'au moins un appareil à combustion y est installé. Le monoxyde de carbone étant inodore et potentiellement mortel, la présence d'un détecteur est indispensable pour protéger les occupants. Son installation immédiate est requise.",
  },
  {
    id: 'pn-secu-nc-garde-corps',
    sectionIds: ['aibq-v-xi', 'bnq-12-8'],
    status: 'non-conforme',
    title: 'Garde-corps déficient — risque de chute grave',
    text: "Un garde-corps présente une hauteur insuffisante, une instabilité ou une absence là où sa présence est requise, exposant les occupants à un risque de chute grave. L'installation ou la mise en conformité du garde-corps est nécessaire de façon prioritaire.",
  },
  {
    id: 'pn-secu-nc-piscine',
    sectionIds: ['aibq-v-xi', 'bnq-12-8'],
    status: 'non-conforme',
    title: 'Clôture piscine non conforme',
    text: "La clôture entourant la piscine présente des lacunes par rapport aux exigences réglementaires en vigueur visant à prévenir la noyade accidentelle des jeunes enfants. Une mise en conformité de la clôture, notamment en ce qui concerne la hauteur, l'espacement des éléments et le mécanisme de fermeture, est nécessaire.",
  },
  {
    id: 'pn-secu-ac-detecteurs-vieux',
    sectionIds: ['aibq-v-xi', 'bnq-12-8'],
    status: 'a-corriger',
    title: 'Détecteurs de fumée vieillissants — remplacement',
    text: "Les détecteurs de fumée présents dans le bâtiment ont une ancienneté qui justifie leur remplacement préventif. La durée de vie recommandée des détecteurs de fumée est généralement de 10 ans. Leur remplacement par des appareils récents est recommandé afin de garantir leur fiabilité.",
  },
  {
    id: 'pn-secu-ac-rampe',
    sectionIds: ['aibq-v-xi', 'bnq-12-8'],
    status: 'a-corriger',
    title: 'Rampe d\'escalier à sécuriser',
    text: "La rampe d'un escalier est instable ou mal fixée à ses supports, ce qui peut créer un risque lors de son utilisation. Sa resécurisation par un entrepreneur qualifié est recommandée.",
  },
  {
    id: 'pn-secu-ac-puits',
    sectionIds: ['aibq-v-xi', 'bnq-12-8'],
    status: 'a-corriger',
    title: 'Puits anglais sans grille de protection',
    text: "Un ou plusieurs puits anglais sont dépourvus de grille de protection, ce qui présente un risque de chute pour les personnes circulant à proximité. L'installation d'une grille adéquate est recommandée.",
  },
  {
    id: 'pn-secu-c-1',
    sectionIds: ['aibq-v-xi', 'bnq-12-8'],
    status: 'conforme',
    title: 'Sécurité des personnes satisfaisante',
    text: "Les détecteurs de fumée et de monoxyde de carbone sont présents dans les zones visibles lors de l'inspection. Les garde-corps et rampes sont en place et stables. Les issues d'évacuation sont dégagées. L'état actuel est satisfaisant du point de vue de la sécurité des personnes.",
  },

  /* ── MATIÈRES DANGEREUSES ─────────────────────────────────────────── */
  {
    id: 'pn-md-nc-vermiculite',
    sectionIds: ['aibq-matieres-dan', 'bnq-matieres-dan'],
    status: 'non-conforme',
    title: 'Isolant vermiculite / Zonolite — test amiante',
    text: "La présence d'un isolant en vrac granuleux de couleur argentée compatible avec de la vermiculite a été observée dans le comble du bâtiment. Une proportion significative de la vermiculite commercialisée par le passé était contaminée à l'amiante. La manipulation de cet isolant doit être évitée jusqu'à confirmation par un test en laboratoire. Des précautions particulières sont nécessaires pour tout travail dans le comble.",
  },
  {
    id: 'pn-md-nc-plafond-popcorn',
    sectionIds: ['aibq-matieres-dan', 'bnq-matieres-dan'],
    status: 'non-conforme',
    title: 'Plafond texturé / tuiles acoustiques — analyse amiante',
    text: "La présence d'un enduit de plafond texturé ou de tuiles acoustiques caractéristiques de constructions d'avant 1980 a été notée. Ces matériaux peuvent contenir de l'amiante si leur installation remonte à cette période. Une analyse par un laboratoire accrédité est recommandée avant tout travail de rénovation ou de démolition susceptible de déranger ces matériaux.",
  },
  {
    id: 'pn-md-nc-pyrite',
    sectionIds: ['aibq-matieres-dan', 'bnq-matieres-dan'],
    status: 'non-conforme',
    title: 'Dalle soulevée — fissures en réseau, pyrite suspectée',
    text: "Le plancher de sous-sol présente des fissures en réseau caractéristiques d'un gonflement qui peut être associé à la pyrite ou à la pyrrhotite dans la pierre concassée utilisée comme remblai sous la dalle. Ce phénomène documenté au Québec peut entraîner des dommages structuraux importants à long terme. Une analyse des matériaux par un spécialiste est fortement recommandée.",
  },
  {
    id: 'pn-md-nc-plomb-tuyaux',
    sectionIds: ['aibq-matieres-dan', 'bnq-matieres-dan'],
    status: 'non-conforme',
    title: 'Tuyaux de plomb — risque sanitaire',
    text: "La présence de tuyaux dont le matériau est compatible avec du plomb a été relevée dans le système de plomberie. Le plomb constitue un risque sanitaire reconnu, particulièrement pour les enfants en bas âge. Une analyse de l'eau potable et une confirmation du matériau par un plombier qualifié sont recommandées, suivies d'un plan de remplacement si confirmé.",
  },
  {
    id: 'pn-md-nc-reservoir',
    sectionIds: ['aibq-matieres-dan', 'bnq-matieres-dan'],
    status: 'non-conforme',
    title: 'Réservoir d\'huile — risque de contamination',
    text: "Un réservoir de mazout est présent sur la propriété. Les réservoirs de mazout, particulièrement s'ils sont anciens ou enfouis, peuvent présenter des risques de fuite et de contamination du sol. Une vérification de l'état du réservoir et une évaluation du risque de contamination par un spécialiste en environnement sont recommandées.",
  },
  {
    id: 'pn-md-ac-radon',
    sectionIds: ['aibq-matieres-dan', 'bnq-matieres-dan'],
    status: 'a-corriger',
    title: 'Test de radon recommandé',
    text: "Bien qu'aucun indicateur visuel de présence de radon ne soit observable lors d'une inspection standard, la localisation géographique du bâtiment présente un niveau de risque modéré à élevé selon les données disponibles. Un test de radon dans les espaces de vie du sous-sol est recommandé afin d'évaluer la concentration en ce gaz radioactif naturel et de prendre les mesures correctives si nécessaire.",
  },
  {
    id: 'pn-md-ac-peinture-plomb',
    sectionIds: ['aibq-matieres-dan', 'bnq-matieres-dan'],
    status: 'a-corriger',
    title: 'Peinture au plomb possible (bâtiment pré-1975)',
    text: "Des couches de peinture sur les boiseries intérieures ou extérieures d'un bâtiment d'avant 1975 peuvent contenir du plomb. Bien que stable lorsque non perturbée, la peinture au plomb représente un risque lors de travaux de rénovation générant des poussières ou des éclats. Un test de dépistage avant tout travail de ponçage ou de décapage est recommandé.",
  },
  {
    id: 'pn-md-c-1',
    sectionIds: ['aibq-matieres-dan', 'bnq-matieres-dan'],
    status: 'conforme',
    title: 'Aucune matière dangereuse suspectée',
    text: "L'inspection visuelle n'a révélé aucun indicateur évident de présence de matières dangereuses dans les zones accessibles. Aucune intervention n'est requise dans l'immédiat, mais la prudence demeure de mise lors de tout travail de rénovation, en particulier dans les bâtiments d'avant 1985.",
  },
];

/**
 * Retourne les narratifs filtrés par statut, section et recherche texte.
 * @param {string} status - 'conforme' | 'non-conforme' | 'a-corriger' | null
 * @param {string} sectionId - identifiant de section (ex: 'walk-fondations')
 * @param {string} query - terme de recherche libre (optionnel)
 */
export function getNarratives(status, sectionId, query = '') {
  let results = PROFESSIONAL_NARRATIVES;

  if (status) {
    results = results.filter((n) => n.status === status);
  }

  if (sectionId) {
    results = results.filter((n) => n.sectionIds.includes(sectionId));
  }

  if (query && query.trim()) {
    const q = query.trim().toLowerCase();
    results = results.filter(
      (n) => n.title.toLowerCase().includes(q) || n.text.toLowerCase().includes(q),
    );
  }

  return results;
}
```

- [ ] **Step 2 : Vérifier manuellement le fichier**

Compter les exports : `grep -c "id: 'pn-" js/professional-narratives.js` — doit afficher ≥ 130.

- [ ] **Step 3 : Commit**

```bash
git add js/professional-narratives.js
git commit -m "feat: bibliothèque de narratifs professionnels (~136 entrées)"
```

---

## Task 2 : Ajouter le CSS de la modale dans `css/app.css`

**Files:**
- Modify: `css/app.css` (fin du fichier)

- [ ] **Step 1 : Ajouter les styles à la fin de `css/app.css`**

```css
/* ── Narratifs professionnels — modale ──────────────────────────── */
.narratives-trigger {
  margin-left: auto;
  font-size: 0.75rem;
  padding: 0.1rem 0.5rem;
  opacity: 0.8;
}
.narratives-trigger:hover { opacity: 1; }

dialog#narratives-modal {
  border: none;
  border-radius: var(--radius, 0.75rem);
  box-shadow: var(--shadow, 0 8px 32px rgba(0,0,0,.18));
  padding: 0;
  width: min(640px, 95vw);
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: var(--surface, #fff);
}
dialog#narratives-modal::backdrop {
  background: rgba(0,0,0,.45);
}
.nm-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem 0.75rem;
  border-bottom: 1px solid var(--border, #e2e8f0);
  flex-shrink: 0;
}
.nm-header__title { font-weight: 700; font-size: 1rem; flex: 1; }
.nm-header__ctx {
  font-size: 0.75rem;
  color: var(--text-muted, #64748b);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}
.nm-close {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  color: var(--text-muted, #64748b);
}
.nm-close:hover { background: var(--border, #e2e8f0); }
.nm-controls {
  padding: 0.75rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex-shrink: 0;
  border-bottom: 1px solid var(--border, #e2e8f0);
}
.nm-search {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border, #e2e8f0);
  border-radius: var(--radius, 0.5rem);
  font-size: 0.875rem;
  background: var(--surface, #fff);
  color: inherit;
}
.nm-tabs {
  display: flex;
  gap: 0.25rem;
}
.nm-tab {
  padding: 0.3rem 0.75rem;
  border: 1px solid var(--border, #e2e8f0);
  border-radius: 99px;
  background: none;
  font-size: 0.8rem;
  cursor: pointer;
  color: var(--text-muted, #64748b);
}
.nm-tab.is-active {
  background: var(--qc-blue, #1d4ed8);
  color: #fff;
  border-color: var(--qc-blue, #1d4ed8);
}
.nm-list {
  overflow-y: auto;
  flex: 1;
  padding: 0.75rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.nm-card {
  border: 1px solid var(--border, #e2e8f0);
  border-radius: var(--radius, 0.5rem);
  padding: 0.75rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.nm-card__title { font-weight: 600; font-size: 0.875rem; }
.nm-card__text {
  font-size: 0.8rem;
  color: var(--text-muted, #64748b);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.nm-card__text.is-expanded { -webkit-line-clamp: unset; overflow: visible; }
.nm-card__actions { display: flex; gap: 0.5rem; align-items: center; }
.nm-insert {
  margin-left: auto;
  padding: 0.3rem 0.85rem;
  background: var(--qc-blue, #1d4ed8);
  color: #fff;
  border: none;
  border-radius: var(--radius, 0.5rem);
  font-size: 0.8rem;
  cursor: pointer;
  white-space: nowrap;
}
.nm-insert:hover { opacity: 0.88; }
.nm-expand {
  background: none;
  border: 1px solid var(--border, #e2e8f0);
  border-radius: 4px;
  font-size: 0.75rem;
  padding: 0.2rem 0.5rem;
  cursor: pointer;
  color: var(--text-muted, #64748b);
}
.nm-empty {
  text-align: center;
  color: var(--text-muted, #64748b);
  font-size: 0.875rem;
  padding: 2rem 0;
}
```

- [ ] **Step 2 : Vérifier visuellement (pas de CSS cassé)**

Ouvrir l'app dans le navigateur. Aucune erreur de mise en page ne doit apparaître.

- [ ] **Step 3 : Commit**

```bash
git add css/app.css
git commit -m "feat: styles CSS modale narratifs professionnels"
```

---

## Task 3 : Modifier `js/checklist-views.js` — bouton déclencheur

**Files:**
- Modify: `js/checklist-views.js:224-230`

- [ ] **Step 1 : Remplacer le bloc `<label>` dans `renderQuickResponsesBlock`**

Trouver (lignes ~224-230) :

```js
      <label class="check-item__comment-label">Commentaire inspecteur</label>
      <textarea class="input check-item__inspector-comment" placeholder="Vos observations, mesures, références d'articles…" data-inspector-comment ${coords} rows="2">${escapeHtml(item.inspectorComment)}</textarea>
```

Remplacer par :

```js
      <label class="check-item__comment-label" style="display:flex;align-items:center;gap:0.5rem;">
        <span>Commentaire inspecteur</span>
        <button type="button" class="btn btn--ghost btn--sm narratives-trigger"
          data-open-narratives
          data-si="${si}" data-sub="${subIndex}" data-ii="${ii}"
          data-section-id="${escapeHtml(contextId || '')}"
          data-status="${escapeHtml(item.status || '')}">📋 Narratifs</button>
      </label>
      <textarea class="input check-item__inspector-comment" placeholder="Vos observations, mesures, références d'articles…" data-inspector-comment ${coords} rows="2">${escapeHtml(item.inspectorComment)}</textarea>
```

- [ ] **Step 2 : Vérifier que `escapeHtml` est bien disponible dans le scope**

La fonction `escapeHtml` est définie à la ligne 23 du fichier — elle est bien dans le même scope. Aucun import supplémentaire requis.

- [ ] **Step 3 : Commit**

```bash
git add js/checklist-views.js
git commit -m "feat: bouton déclencheur narratifs dans renderQuickResponsesBlock"
```

---

## Task 4 : Modifier `js/app.js` — init modale + handlers

**Files:**
- Modify: `js/app.js` (imports + fin du fichier + section handlers checklist)

- [ ] **Step 1 : Ajouter l'import en haut de `app.js`**

Après la ligne `import { openReport } from './report.js';` (ligne ~40), ajouter :

```js
import { PROFESSIONAL_NARRATIVES, getNarratives } from './professional-narratives.js';
```

- [ ] **Step 2 : Ajouter la fonction `initNarrativesModal` juste avant la ligne `route = parseHash();`**

```js
function initNarrativesModal() {
  const dlg = document.createElement('dialog');
  dlg.id = 'narratives-modal';
  dlg.innerHTML = `
    <div class="nm-header">
      <span class="nm-header__title">📋 Narratifs professionnels</span>
      <span class="nm-header__ctx" id="nm-ctx"></span>
      <button type="button" class="nm-close" id="nm-close" aria-label="Fermer">×</button>
    </div>
    <div class="nm-controls">
      <input type="search" class="nm-search" id="nm-search" placeholder="Rechercher un narratif…" autocomplete="off" />
      <div class="nm-tabs" id="nm-tabs">
        <button type="button" class="nm-tab is-active" data-nm-tab="non-conforme">Non-conforme</button>
        <button type="button" class="nm-tab" data-nm-tab="a-corriger">À corriger</button>
        <button type="button" class="nm-tab" data-nm-tab="conforme">Conforme</button>
        <button type="button" class="nm-tab" data-nm-tab="">Tous</button>
      </div>
    </div>
    <div class="nm-list" id="nm-list"></div>`;
  document.body.appendChild(dlg);

  let _nmSi, _nmSub, _nmIi, _nmSectionId, _nmStatus, _nmActiveTab, _nmQuery;

  function nmRender() {
    const list = document.getElementById('nm-list');
    const tab = _nmActiveTab !== undefined ? _nmActiveTab : _nmStatus;
    const results = getNarratives(tab || null, _nmSectionId || null, _nmQuery || '');
    if (!results.length) {
      list.innerHTML = '<p class="nm-empty">Aucun narratif pour ce contexte.<br>Utilisez le champ libre ci-dessous.</p>';
      return;
    }
    list.innerHTML = results.map((n) => `
      <div class="nm-card" data-nm-id="${n.id}">
        <div class="nm-card__title">${escapeHtmlNm(n.title)}</div>
        <div class="nm-card__text">${escapeHtmlNm(n.text)}</div>
        <div class="nm-card__actions">
          <button type="button" class="nm-expand">Voir tout</button>
          <button type="button" class="nm-insert" data-nm-insert="${n.id}">Insérer dans champ</button>
        </div>
      </div>`).join('');
  }

  function escapeHtmlNm(s) {
    return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  dlg.addEventListener('click', (e) => {
    const insertBtn = e.target.closest('[data-nm-insert]');
    if (insertBtn) {
      const id = insertBtn.dataset.nmInsert;
      const narrative = PROFESSIONAL_NARRATIVES.find((n) => n.id === id);
      if (!narrative) return;
      const inspection = getInspection(route.id);
      if (!inspection) return;
      const item = resolveItem(inspection, _nmSi, _nmSub, _nmIi);
      if (!item) return;
      const existing = (item.inspectorComment || '').trim();
      item.inspectorComment = existing ? existing + '\n\n' + narrative.text : narrative.text;
      const panel = document.getElementById('inspect-panel');
      const ta = panel?.querySelector(`[data-inspector-comment][data-si="${_nmSi}"][data-sub="${_nmSub}"][data-ii="${_nmIi}"]`);
      if (ta) ta.value = item.inspectorComment;
      scheduleAutosave(inspection, 'checklist', panel);
      dlg.close();
      return;
    }
    const expandBtn = e.target.closest('.nm-expand');
    if (expandBtn) {
      const textEl = expandBtn.closest('.nm-card')?.querySelector('.nm-card__text');
      if (textEl) {
        textEl.classList.toggle('is-expanded');
        expandBtn.textContent = textEl.classList.contains('is-expanded') ? 'Réduire' : 'Voir tout';
      }
      return;
    }
    const tabBtn = e.target.closest('[data-nm-tab]');
    if (tabBtn) {
      dlg.querySelectorAll('.nm-tab').forEach((b) => b.classList.remove('is-active'));
      tabBtn.classList.add('is-active');
      _nmActiveTab = tabBtn.dataset.nmTab;
      nmRender();
      return;
    }
  });

  document.getElementById('nm-close').addEventListener('click', () => dlg.close());

  document.getElementById('nm-search').addEventListener('input', (e) => {
    _nmQuery = e.target.value;
    nmRender();
  });

  window._openNarrativesModal = function(si, sub, ii, sectionId, status) {
    _nmSi = si; _nmSub = sub; _nmIi = ii;
    _nmSectionId = sectionId;
    _nmStatus = status;
    _nmActiveTab = status || 'non-conforme';
    _nmQuery = '';
    document.getElementById('nm-search').value = '';
    const activeTab = dlg.querySelector(`[data-nm-tab="${_nmActiveTab}"]`) || dlg.querySelector('[data-nm-tab="non-conforme"]');
    dlg.querySelectorAll('.nm-tab').forEach((b) => b.classList.remove('is-active'));
    if (activeTab) activeTab.classList.add('is-active');
    document.getElementById('nm-ctx').textContent = sectionId ? sectionId.replace(/^(walk-|bnq-w-|bnq-|aibq-v-|bat-)/, '') : '';
    nmRender();
    dlg.showModal();
  };
}
```

- [ ] **Step 3 : Ajouter l'appel `initNarrativesModal()` dans le bloc d'init**

Trouver (fin du fichier) :
```js
route = parseHash();
registerServiceWorker();
initAiAssistant();
render();
```

Remplacer par :
```js
route = parseHash();
registerServiceWorker();
initAiAssistant();
initNarrativesModal();
render();
```

- [ ] **Step 4 : Ajouter le handler `[data-open-narratives]` dans la fonction d'événements checklist**

Dans la fonction qui contient `panel.querySelectorAll('[data-preset]')`, ajouter AVANT ce bloc :

```js
  panel.querySelectorAll('[data-open-narratives]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const si = +btn.dataset.si;
      const sub = +btn.dataset.sub;
      const ii = +btn.dataset.ii;
      const sectionId = btn.dataset.sectionId || '';
      const status = btn.dataset.status || '';
      window._openNarrativesModal(si, sub, ii, sectionId, status);
    });
  });
```

- [ ] **Step 5 : Commit**

```bash
git add js/app.js
git commit -m "feat: initNarrativesModal + handler data-open-narratives dans app.js"
```

---

## Task 5 : Mettre à jour `js/bundle.js`

**Files:**
- Modify: `js/bundle.js`

Le bundle est un IIFE minifié. Toutes les modifications des sources doivent y être reflétées manuellement.

- [ ] **Step 1 : Ajouter les données narratifs et `getNarratives` dans le bundle**

Trouver dans bundle.js (autour de la ligne 3111, fin du bloc `renderChecklistToolbar`) :
```js
  }
  function renderQuickResponsesBlock(item, si, subIndex, ii, contextId) {
```

Insérer AVANT cette ligne le bloc suivant (copier-coller depuis `professional-narratives.js`, en supprimant les `export` keywords et en ajoutant `const` pour `PROFESSIONAL_NARRATIVES`) :

```js
  const PROFESSIONAL_NARRATIVES = [ /* ... contenu complet du tableau ... */ ];
  function getNarratives(status, sectionId, query) {
    query = query || '';
    var results = PROFESSIONAL_NARRATIVES;
    if (status) results = results.filter(function(n){ return n.status === status; });
    if (sectionId) results = results.filter(function(n){ return n.sectionIds.indexOf(sectionId) >= 0; });
    if (query.trim()) {
      var q = query.trim().toLowerCase();
      results = results.filter(function(n){ return n.title.toLowerCase().indexOf(q) >= 0 || n.text.toLowerCase().indexOf(q) >= 0; });
    }
    return results;
  }
```

**Note :** Le tableau `PROFESSIONAL_NARRATIVES` doit être copié intégralement depuis `js/professional-narratives.js` (même contenu, sans le mot-clé `export`).

- [ ] **Step 2 : Modifier `renderQuickResponsesBlock` dans le bundle**

Trouver (ligne ~3125) :
```js
      <label class="check-item__comment-label">Commentaire inspecteur</label>
      <textarea class="input check-item__inspector-comment" placeholder="Vos observations, mesures, r\xE9f\xE9rences d'articles…" data-inspector-comment ${coords} rows="2">${escapeHtml2(item.inspectorComment)}</textarea>
```

Remplacer par :
```js
      <label class="check-item__comment-label" style="display:flex;align-items:center;gap:0.5rem;"><span>Commentaire inspecteur</span><button type="button" class="btn btn--ghost btn--sm narratives-trigger" data-open-narratives data-si="${si}" data-sub="${subIndex}" data-ii="${ii}" data-section-id="${escapeHtml2(contextId || '')}" data-status="${escapeHtml2(item.status || '')}">&#x1F4CB; Narratifs</button></label>
      <textarea class="input check-item__inspector-comment" placeholder="Vos observations, mesures, r\xE9f\xE9rences d'articles…" data-inspector-comment ${coords} rows="2">${escapeHtml2(item.inspectorComment)}</textarea>
```

- [ ] **Step 3 : Ajouter `initNarrativesModal` dans le bundle**

Trouver dans bundle.js (autour de la ligne 6880+) :
```js
  route = parseHash();
  registerServiceWorker();
  initAiAssistant();
  render();
```

Insérer avant `render()` l'appel et la définition complète de `initNarrativesModal` — copier-coller depuis `app.js` en adaptant la syntaxe (remplacer `import` par accès direct aux fonctions déjà présentes dans le bundle : `getInspection`, `resolveItem`, `scheduleAutosave`).

La fonction `initNarrativesModal` dans le bundle :

```js
  function initNarrativesModal() {
    var dlg = document.createElement("dialog");
    dlg.id = "narratives-modal";
    dlg.innerHTML = '<div class="nm-header"><span class="nm-header__title">📋 Narratifs professionnels</span><span class="nm-header__ctx" id="nm-ctx"></span><button type="button" class="nm-close" id="nm-close" aria-label="Fermer">\xD7</button></div><div class="nm-controls"><input type="search" class="nm-search" id="nm-search" placeholder="Rechercher un narratif…" autocomplete="off" /><div class="nm-tabs" id="nm-tabs"><button type="button" class="nm-tab is-active" data-nm-tab="non-conforme">Non-conforme</button><button type="button" class="nm-tab" data-nm-tab="a-corriger">\xC0 corriger</button><button type="button" class="nm-tab" data-nm-tab="conforme">Conforme</button><button type="button" class="nm-tab" data-nm-tab="">Tous</button></div></div><div class="nm-list" id="nm-list"></div>';
    document.body.appendChild(dlg);
    var _nmSi, _nmSub, _nmIi, _nmSectionId, _nmStatus, _nmActiveTab, _nmQuery;
    function escHtml(s) { return String(s ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }
    function nmRender() {
      var list = document.getElementById("nm-list");
      var tab = _nmActiveTab !== undefined ? _nmActiveTab : _nmStatus;
      var results = getNarratives(tab || null, _nmSectionId || null, _nmQuery || "");
      if (!results.length) { list.innerHTML = '<p class="nm-empty">Aucun narratif pour ce contexte.<br>Utilisez le champ libre ci-dessous.</p>'; return; }
      list.innerHTML = results.map(function(n) { return '<div class="nm-card" data-nm-id="' + escHtml(n.id) + '"><div class="nm-card__title">' + escHtml(n.title) + '</div><div class="nm-card__text">' + escHtml(n.text) + '</div><div class="nm-card__actions"><button type="button" class="nm-expand">Voir tout</button><button type="button" class="nm-insert" data-nm-insert="' + escHtml(n.id) + '">Ins\xE9rer dans champ</button></div></div>'; }).join("");
    }
    dlg.addEventListener("click", function(e) {
      var insertBtn = e.target.closest("[data-nm-insert]");
      if (insertBtn) {
        var id = insertBtn.dataset.nmInsert;
        var narrative = PROFESSIONAL_NARRATIVES.find(function(n){ return n.id === id; });
        if (!narrative) return;
        var inspection = getInspection(route.id);
        if (!inspection) return;
        var item = resolveItem(inspection, _nmSi, _nmSub, _nmIi);
        if (!item) return;
        var existing = (item.inspectorComment || "").trim();
        item.inspectorComment = existing ? existing + "\n\n" + narrative.text : narrative.text;
        var panel = document.getElementById("inspect-panel");
        var ta = panel && panel.querySelector('[data-inspector-comment][data-si="' + _nmSi + '"][data-sub="' + _nmSub + '"][data-ii="' + _nmIi + '"]');
        if (ta) ta.value = item.inspectorComment;
        scheduleAutosave(inspection, "checklist", panel);
        dlg.close();
        return;
      }
      var expandBtn = e.target.closest(".nm-expand");
      if (expandBtn) {
        var textEl = expandBtn.closest(".nm-card") && expandBtn.closest(".nm-card").querySelector(".nm-card__text");
        if (textEl) { textEl.classList.toggle("is-expanded"); expandBtn.textContent = textEl.classList.contains("is-expanded") ? "R\xE9duire" : "Voir tout"; }
        return;
      }
      var tabBtn = e.target.closest("[data-nm-tab]");
      if (tabBtn) {
        dlg.querySelectorAll(".nm-tab").forEach(function(b){ b.classList.remove("is-active"); });
        tabBtn.classList.add("is-active");
        _nmActiveTab = tabBtn.dataset.nmTab;
        nmRender();
        return;
      }
    });
    document.getElementById("nm-close").addEventListener("click", function(){ dlg.close(); });
    document.getElementById("nm-search").addEventListener("input", function(e){ _nmQuery = e.target.value; nmRender(); });
    window._openNarrativesModal = function(si, sub, ii, sectionId, status) {
      _nmSi = si; _nmSub = sub; _nmIi = ii; _nmSectionId = sectionId; _nmStatus = status;
      _nmActiveTab = status || "non-conforme"; _nmQuery = "";
      document.getElementById("nm-search").value = "";
      var activeTab = dlg.querySelector('[data-nm-tab="' + (_nmActiveTab) + '"]') || dlg.querySelector('[data-nm-tab="non-conforme"]');
      dlg.querySelectorAll(".nm-tab").forEach(function(b){ b.classList.remove("is-active"); });
      if (activeTab) activeTab.classList.add("is-active");
      document.getElementById("nm-ctx").textContent = sectionId ? sectionId.replace(/^(walk-|bnq-w-|bnq-|aibq-v-|bat-)/, "") : "";
      nmRender();
      dlg.showModal();
    };
  }
  initNarrativesModal();
```

- [ ] **Step 4 : Ajouter le handler `[data-open-narratives]` dans le bundle**

Dans le bundle, trouver (ligne ~6245) :
```js
    panel.querySelectorAll("[data-preset]").forEach((btn) => {
```

Insérer AVANT cette ligne :

```js
    panel.querySelectorAll("[data-open-narratives]").forEach(function(btn) {
      btn.addEventListener("click", function() {
        var si = +btn.dataset.si;
        var sub = +btn.dataset.sub;
        var ii = +btn.dataset.ii;
        var sectionId = btn.dataset.sectionId || "";
        var status = btn.dataset.status || "";
        if (window._openNarrativesModal) window._openNarrativesModal(si, sub, ii, sectionId, status);
      });
    });
```

- [ ] **Step 5 : Commit**

```bash
git add js/bundle.js
git commit -m "feat: bundle.js — intégration narratifs, modale et handler"
```

---

## Task 6 : Vérification manuelle dans le navigateur

- [ ] **Step 1 : Lancer le serveur**

Double-cliquer sur `Lancer KZO Inspect.bat` (Windows) ou exécuter `bash "Lancer KZO Inspect.command"` (Mac). Ouvrir `http://127.0.0.1:8775`.

- [ ] **Step 2 : Ouvrir une inspection et aller dans la checklist**

Créer ou ouvrir une inspection → onglet Checklist → ouvrir une section.

- [ ] **Step 3 : Vérifier le bouton déclencheur**

Sur un item de checklist, le bouton "📋 Narratifs" doit apparaître à côté du label "Commentaire inspecteur".

- [ ] **Step 4 : Tester l'ouverture de la modale**

Cliquer sur "📋 Narratifs" → la modale `<dialog>` doit s'ouvrir. L'onglet actif doit correspondre au statut de l'item (ou "Non-conforme" par défaut).

- [ ] **Step 5 : Tester la recherche**

Taper "fondation" dans la barre de recherche → la liste doit se filtrer en temps réel.

- [ ] **Step 6 : Tester les onglets**

Cliquer sur "À corriger", "Conforme", "Tous" → la liste doit se mettre à jour.

- [ ] **Step 7 : Tester l'insertion**

Cliquer "Insérer dans champ" sur un narratif → la modale doit se fermer et le texte doit apparaître dans le textarea "Commentaire inspecteur". Cliquer à nouveau "Insérer dans champ" sur un deuxième narratif → le texte doit s'ajouter à la suite (append avec double saut de ligne).

- [ ] **Step 8 : Tester Escape**

Ouvrir la modale et appuyer sur `Escape` → la modale doit se fermer sans modifier le commentaire.

- [ ] **Step 9 : Vérifier la persistance**

Après insertion, naviguer vers une autre section et revenir → le commentaire doit être sauvegardé.

- [ ] **Step 10 : Commit final**

```bash
git add -A
git commit -m "feat: bibliothèque de narratifs professionnels — fonctionnalité complète"
```
