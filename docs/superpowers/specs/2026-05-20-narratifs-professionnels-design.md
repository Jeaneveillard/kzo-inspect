# Bibliothèque de narratifs professionnels — Design Spec
**Date :** 2026-05-20  
**Projet :** KZO Inspect — Application d'inspection pré-achat résidentielle  
**Fonctionnalité :** Narratifs professionnels longs pré-établis (à la manière d'Inspect Easy)  
**Statut :** Approuvé

---

## Contexte

L'application possède déjà un système de "réponses rapides" (puces courtes, 5-10 mots) organisées par statut et par section (`QUICK_RESPONSES` + `SECTION_PRESETS` dans `js/quick-responses.js`). Ces puces alimentent le tableau `item.selectedPresets[]` et s'affichent sous chaque item de checklist.

L'inspecteur souhaite disposer d'une **bibliothèque de narratifs longs** (3-5 phrases, style professionnel québécois) qu'il peut insérer en un clic dans le champ "Commentaire inspecteur". Objectif : gagner du temps sur le terrain et garantir une rédaction cohérente et professionnelle dans tous les rapports.

---

## Décisions de design

| Décision | Choix retenu | Raison |
|---|---|---|
| Déclencheur UI | Bouton "📋 Narratifs" près du label commentaire | Discret, accessible sans alourdir l'interface |
| Comportement à l'insertion | Append (ajout à la fin du commentaire existant) | Permet de combiner plusieurs narratifs ou d'ajouter des observations libres |
| UI de sélection | Modale `<dialog>` native | Accessible (Escape, focus trap), sans bibliothèque externe |
| Organisation dans la modale | Filtres combinés statut + section auto-détectés + recherche texte | Maximum de pertinence contextuelle |
| Couverture du contenu | Toutes les sections — environ 130 narratifs | Couverture complète terrain |
| Stockage des données | Fichier JS source dédié (`professional-narratives.js`) | Offline-first, cohérent avec l'architecture existante |
| Style de rédaction | Professionnel québécois — voix impersonnelle, factuel, structuré | **Sans mentionner de norme ou organisme dans le texte inséré** |

---

## Architecture

### Nouveau fichier : `js/professional-narratives.js`

```js
export const PROFESSIONAL_NARRATIVES = [
  {
    id: 'pn-<section>-<statut>-<slug>',  // ex: pn-fond-nc-fissure-diag
    sectionIds: ['walk-fondations', 'bnq-w-fondations'],  // sections concernées (alias inclus)
    status: 'non-conforme',              // 'conforme' | 'non-conforme' | 'a-corriger'
    title: 'Titre court (5-8 mots)',     // affiché en en-tête de la carte
    text: `Texte long 3-5 phrases...`    // inséré dans le commentaire
  },
  // ~130 entrées
];

export function getNarratives(status, sectionId, query = '') {
  // Filtre par statut, sectionId (avec résolution d'alias), et recherche texte
  // Retourne un tableau de narratifs ordonnés
}
```

**Sections couvertes (tous statuts) :**
- Terrain (`walk-terrain`, `bnq-w-terrain`)
- Fondations (`walk-fondations`, `bnq-w-fondations`)
- Toiture (`walk-toiture`, `bnq-w-toiture`)
- Façades (`walk-facades`, `bnq-w-facades`)
- Ouvertures (`walk-ouvertures`, `bnq-w-ouvertures`)
- Plomberie extérieure (`walk-plomb-ext`, `bnq-w-plomb-ext`)
- Électricité extérieure (`walk-elec-ext`, `bnq-w-elec-ext`)
- Structure intérieure (`aibq-v-i`, `aibq-v-i-17`)
- Plomberie intérieure (`aibq-v-iv`, `bnq-12-3`)
- Électricité intérieure (`aibq-v-v`, `bnq-12-4`)
- Chauffage (`aibq-v-vi`, `bnq-12-5`)
- Climatisation (`aibq-v-vii`)
- Intérieur architectural (`aibq-v-viii`, `bnq-12-6`)
- Isolation / Combles (`aibq-v-ix`, `bnq-12-7`)
- Ventilation (`aibq-v-x`)
- Sécurité (`aibq-v-xi`, `bnq-12-8`)
- Matières dangereuses (`aibq-matieres-dan`, `bnq-matieres-dan`)

### Modifications : `js/checklist-views.js`

Dans `renderQuickResponsesBlock()`, ajouter un bouton déclencheur à côté du label "Commentaire inspecteur" :

```html
<label class="check-item__comment-label">
  Commentaire inspecteur
  <button type="button" class="btn btn--ghost btn--sm narratives-trigger"
    data-open-narratives
    data-si="..." data-sub="..." data-ii="..."
    data-section-id="..."
    data-status="...">
    📋 Narratifs
  </button>
</label>
```

### Modifications : `js/app.js`

**Initialisation (une fois au démarrage) :**
- Injecter le markup `<dialog id="narratives-modal">` dans le `<body>`
- Structurer la modale : en-tête contextuel, onglets statut, barre de recherche, liste des cartes

**Gestionnaire d'événements `[data-open-narratives]` :**
1. Lire `si`, `sub`, `ii`, `sectionId`, `status` depuis les attributs `data-*`
2. Appeler `getNarratives(status, sectionId)` pour la liste initiale
3. Mettre à jour l'en-tête de la modale (section + statut courants)
4. Afficher la liste filtrée, ouvrir `dialog.showModal()`
5. Mémoriser les coords de l'item courant pour l'insertion

**Gestionnaire de recherche (input temps réel) :**
- Filtrer `PROFESSIONAL_NARRATIVES` par `query` sur `title` + `text`
- Mettre à jour le DOM de la liste directement (sans re-render complet)

**Gestionnaire "Insérer dans champ" :**
1. Récupérer `item` via `resolveItem(inspection, si, sub, ii)`
2. Construire le nouveau texte : `(existant ? existant + '\n\n' : '') + narratif.text`
3. Mettre à jour `item.inspectorComment`
4. Synchroniser le textarea visible dans le DOM
5. Appeler `scheduleAutosave(inspection, 'checklist', panel)`
6. Fermer la modale (`dialog.close()`)

**Gestionnaire onglets statut :**
- Re-filtrer la liste affichée selon le statut sélectionné

### Modifications : `js/bundle.js`

Intégrer les 3 blocs dans le bundle IIFE existant :
1. Données `PROFESSIONAL_NARRATIVES` + fonction `getNarratives`
2. Modifications de `renderQuickResponsesBlock`
3. Nouveaux gestionnaires dans la fonction de binding d'événements checklist

---

## Style de rédaction des narratifs

**Structure par défaut de chaque narratif** : localisation → observation → implication → recommandation d'action

**Règles :**
- Voix impersonnelle : "Il a été observé…", "L'inspection révèle…", "On note…"
- Jamais de "je", jamais de vouvoiement direct au client
- Ton neutre, factuel, sans dramatisation ni minimisation
- **Jamais de mention d'organisme ou de norme dans le texte inséré** (ex : pas de "selon la norme X", pas de "AIBQ recommande")
- Jamais d'estimation de coût dans le narratif
- Jamais de recommandation d'achat ou de négociation

**Exemple conforme :**
> Il a été observé lors de l'inspection visuelle que le mur de fondation présente des fissures diagonales significatives, caractéristiques d'un mouvement structurel différentiel. Ce type de fissuration indique généralement un tassement inégal du sol porteur ou une défaillance progressive des appuis. Une telle condition peut compromettre l'intégrité de la structure si elle n'est pas traitée. Une évaluation par un ingénieur en structure est recommandée.

---

## Comportement de la modale

| Action | Résultat |
|---|---|
| Ouverture | Statut et section de l'item pré-filtrés automatiquement |
| Frappe dans recherche | Filtre temps réel sur titre + texte de tous les narratifs de la section |
| Clic onglet statut | Re-filtre la liste affichée |
| Clic "Insérer dans champ" | Append dans `inspectorComment`, sauvegarde, ferme la modale |
| Touche Escape | Ferme la modale (natif `<dialog>`) |
| Aucun narratif trouvé | Message "Aucun narratif pour ce contexte — utilisez le champ libre" |

---

## Ce qui ne change pas

- Le système de puces courtes (`selectedPresets[]`) reste **inchangé**
- Les deux systèmes sont complémentaires : les puces vont dans `selectedPresets`, les narratifs vont dans `inspectorComment`
- Aucune modification au schéma de données localStorage
- Aucune dépendance externe ajoutée

---

## Fichiers à créer / modifier

| Fichier | Action |
|---|---|
| `js/professional-narratives.js` | Créer — données + `getNarratives()` |
| `js/checklist-views.js` | Modifier — bouton déclencheur dans `renderQuickResponsesBlock` |
| `js/app.js` | Modifier — init modale + 4 gestionnaires d'événements |
| `js/bundle.js` | Modifier — intégrer les 3 blocs ci-dessus |
