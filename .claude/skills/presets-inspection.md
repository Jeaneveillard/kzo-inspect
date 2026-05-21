---
name: presets-inspection
description: Ajouter, modifier ou organiser les pré-réponses d'inspection (presets) dans KZO Inspect — globales ou spécifiques à une section/sous-section. Utilise ce skill quand tu dois ajouter des formulations de terrain, corriger un texte de preset, ou créer des presets pour une nouvelle section.
type: flexible
---

# Presets d'inspection KZO

## Architecture

### Presets globaux — `js/quick-responses.js`
```js
export const QUICK_RESPONSES = {
  conforme:       [ { id, label }, ... ],   // positifs
  'non-conforme': [ { id, label }, ... ],   // négatifs graves
  'a-corriger':   [ { id, label }, ... ],   // négatifs modérés
  na:             [ { id, label }, ... ],   // sans objet
};
```

### Presets contextuels (par section) — `SECTION_PRESETS`
```js
export const SECTION_PRESETS = {
  'walk-fondations': {
    conforme:       [ { id: 'fond-c-1', label: '...' }, ... ],
    'non-conforme': [ { id: 'fond-nc-1', label: '...' }, ... ],
    'a-corriger':   [ { id: 'fond-ac-1', label: '...' }, ... ],
  },
  // ...
};
```

## Règles de nommage des IDs

Format : `[prefix-section]-[statut]-[numéro]`

| Section | Prefix |
|---------|--------|
| walk-terrain | `terrain` |
| walk-fondations | `fond` |
| walk-toiture | `toit` |
| walk-facades | `facade` |
| walk-ouvertures | `ouv` |
| walk-plomb-ext | `plomb-ext` |
| walk-elec-ext | `elec-ext` |
| aibq-v-i (structure) | `struct` |
| aibq-v-iv (plomberie) | `plomb` |
| aibq-v-v (électricité) | `elec` |
| aibq-v-vi (chauffage) | `chauf` |
| aibq-v-viii (intérieur) | `int` |
| aibq-v-ix (isolation) | `iso` |
| aibq-v-x (ventilation) | `vent` |
| aibq-v-xi (sécurité) | `secu` |

Exemples : `fond-c-1`, `toit-nc-2`, `elec-ac-3`

## Style des labels de presets

- Formules courtes (5-10 mots max) — elles s'affichent comme des pastilles
- Langue : français québécois, registre professionnel
- Pas de ponctuation finale
- Les presets conforme commencent par un état positif
- Les presets NC commencent par le problème constaté

**Positifs (conforme) :**
> "Fondations sans fissure significative" / "Étanchéité apparente satisfaisante" / "Aucune anomalie visible"

**Négatifs NC :**
> "Fissure diagonale — mouvement structurel probable" / "Infiltration active au mur" / "Remplacement urgent recommandé"

**Négatifs AC :**
> "Usure à surveiller" / "Entretien préventif recommandé" / "À planifier à court terme"

## Ajouter un preset — checklist

1. Choisir l'ID unique selon le format ci-dessus
2. Écrire le label selon le style (court, professionnel)
3. L'ajouter dans `QUICK_RESPONSES` (si global) ou `SECTION_PRESETS[sectionId]` (si contextuel) dans `js/quick-responses.js`
4. L'ajouter dans le `PRESET_INDEX` (si la map existe) ou vérifier que `presetLabel(id)` le résout
5. Répercuter dans `js/bundle.js` (obligatoire)

## Correspondance IDs sections BNQ ↔ AIBQ

Les sous-sections BNQ ont leur propre prefix (`bnq-w-fondations` ≠ `walk-fondations`). Ajouter des presets pour les deux si les templates BNQ et AIBQ sont utilisés.
