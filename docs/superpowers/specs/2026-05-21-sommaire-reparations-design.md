# Sommaire des Réparations — Design Spec
**Date :** 2026-05-21  
**Projet :** KZO Inspect — Application d'inspection pré-achat résidentielle  
**Fonctionnalité :** Bouton "Réparations" avec modale sommaire des défauts copiable  
**Statut :** Approuvé

---

## Contexte

L'inspecteur a besoin d'une vue consolidée de tous les défauts d'une inspection (NC + AC) pour préparer rapidement une demande de réparations au vendeur. La fonctionnalité référence est visible dans `KZO_Inspect.html` qui possède un bouton "Réparations" dans sa barre de navigation ouvrant une modale listant les défauts avec cases à cocher et bouton de copie.

---

## Décisions de design

| Décision | Choix retenu | Raison |
|---|---|---|
| Items inclus | NC + AC, toutes priorités | Tous les défauts actionnables |
| Contenu par item | Label + presets + commentaire inspecteur | Maximum d'information contextuelle |
| Format de copie | `[NC - MAJEUR] Section : texte...` | Structuré, utilisable dans un email ou Word |
| Emplacement bouton | Barre nav supérieure, visible quand `route.name === 'inspect'` | Accès rapide depuis n'importe quel onglet |
| Architecture | Fichier dédié `repairs-summary.js` + `<dialog>` pré-injectée | Cohérent avec modale narratifs, offline-first |
| CSS | `dialog#repairs-modal[open] { display: flex }` | Évite le bug display écrasant le UA display:none |

---

## Architecture

### Nouveau fichier : `js/repairs-summary.js`

```js
/**
 * Collecte tous les items NC + AC d'une inspection.
 * Retourne un tableau trié par priorité (critique > majeur > mineur).
 */
export function getRepairItems(inspection) { ... }

/**
 * Formate un item en texte copiable.
 * Format : "[NC - MAJEUR] Section\nLabel : presets\nCommentaire"
 */
export function formatRepairItem(item) { ... }

/**
 * Initialise la <dialog id="repairs-modal"> dans le <body>.
 * Expose window._openRepairsModal(inspection).
 */
export function initRepairsModal() { ... }
```

#### Structure d'un item collecté

```js
{
  sectionTitle: 'Section IV — Plomberie',
  label: '29.1 Tuyauterie — observation',
  status: 'non-conforme',    // ou 'a-corriger'
  priority: 'majeur',        // 'critique' | 'majeur' | 'mineur'
  presets: ['Poly-B détecté — remplacement requis'],
  comment: 'Tuyauterie grise visible au sous-sol...'
}
```

Items sans preset ET sans commentaire sont **exclus** (rien à afficher).

#### Tri par priorité

Ordre d'affichage : `critique` → `majeur` → `mineur`  
Dans chaque groupe, tri par ordre d'apparition dans la checklist.

#### Priorité affichée

| Code | Emoji | Libellé |
|---|---|---|
| critique | 🔴 | CRITIQUE |
| majeur | 🟠 | MAJEUR |
| mineur | 🟡 | MINEUR |
| (vide) | ⚪ | — |

#### Format de copie par item

```
[NC - MAJEUR] Section IV — Plomberie
29.1 Tuyauterie : Poly-B détecté — remplacement requis
Tuyauterie grise visible au sous-sol...
```

Les items séparés par une ligne vide. Si un item n'a que des presets (pas de commentaire), la troisième ligne est omise. Si un item n'a que le commentaire (pas de preset), la deuxième ligne est le commentaire directement.

---

## Interface utilisateur

### Bouton dans la nav

Ajouté dans `renderNav()` dans `app.js`, visible uniquement quand `route.name === 'inspect'` :

```html
<button type="button" class="btn btn--ghost btn--sm" id="repairs-nav-btn">
  🔧 Réparations
</button>
```

### Modale

```
┌──────────────────────────────────────────────────┐
│ 🔧 Sommaire des Réparations          [× Fermer]  │
│ 12 défauts · 3 NC · 9 AC                         │
│──────────────────────────────────────────────────│
│ [liste scrollable des items avec cases à cocher]  │
│                                                   │
│ ☑ 🔴 NC - CRITIQUE                               │
│   Section I — Structure                           │
│   17.1 Fondations : Fissure diagonale...          │
│                                                   │
│ ☑ 🟠 NC - MAJEUR                                 │
│   Section IV — Plomberie                          │
│   29.1 Tuyauterie : Poly-B détecté...             │
│──────────────────────────────────────────────────│
│         [Fermer]    [📋 Copier le résumé]         │
└──────────────────────────────────────────────────┘
```

**Comportements :**
- Toutes les cases cochées par défaut à l'ouverture
- "Copier le résumé" copie uniquement les items cochés via `navigator.clipboard.writeText()`
- Toast "✓ Résumé copié !" après copie réussie
- `Escape` ferme la modale (natif `<dialog>`)
- Si aucun défaut : message "Aucun défaut NC ou AC enregistré dans cette inspection."

---

## Flux technique

1. **Démarrage app** → `initRepairsModal()` crée et injecte `<dialog id="repairs-modal">` dans `<body>` (une seule fois)
2. **`renderNav()`** → ajoute le bouton `🔧 Réparations` si `route.name === 'inspect'`
3. **Clic bouton** → récupère l'inspection courante via `getInspection(route.id)`, appelle `window._openRepairsModal(inspection)`
4. **`_openRepairsModal`** → appelle `getRepairItems(inspection)`, injecte le HTML des items, `dialog.showModal()`
5. **Clic "Copier le résumé"** → collecte les items cochés, `formatRepairItem()` pour chacun, `navigator.clipboard.writeText()`, toast
6. **Clic × ou Escape** → `dialog.close()`

---

## Fichiers à créer / modifier

| Fichier | Action |
|---|---|
| `js/repairs-summary.js` | **Créer** — `getRepairItems`, `formatRepairItem`, `initRepairsModal` |
| `css/app.css` | Modifier — ajouter styles `dialog#repairs-modal` |
| `js/app.js` | Modifier — import + `initRepairsModal()` + bouton dans `renderNav()` + handler clic |
| `js/bundle.js` | Modifier — intégrer les 3 blocs ci-dessus |

---

## Ce qui ne change pas

- Aucune modification du schéma de données localStorage
- Aucune dépendance externe ajoutée
- Les onglets et la checklist existants sont inchangés
- Le bouton n'apparaît pas sur l'accueil, la création, ni le profil
