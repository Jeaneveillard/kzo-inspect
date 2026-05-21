---
name: bundle-sync
description: Synchroniser les fichiers source JS avec bundle.js après une modification. Utilise ce skill chaque fois qu'un fichier js/*.js est modifié — il faut toujours mettre à jour bundle.js en conséquence, car c'est lui que le navigateur charge réellement.
type: rigid
---

# Bundle Sync — Règle critique KZO Inspect

## Pourquoi ce skill existe

`index.html` charge uniquement `js/bundle.js` — un fichier IIFE qui contient TOUS les modules source concaténés. Les fichiers `js/*.js` sont les sources, mais le navigateur ne les charge jamais directement.

**Toute modification dans un fichier source doit être répercutée dans `bundle.js`.**

## Processus

### 1. Localiser le code dans bundle.js

Chaque section de bundle.js est précédée d'un commentaire indiquant le fichier source :

```js
// js/ai-models.js
var AI_PROVIDERS = [ ... ];
```

Utiliser grep pour trouver rapidement :

```bash
grep -n "texte_exact_à_modifier" js/bundle.js
```

### 2. Identifier les différences de format

Le bundle utilise :
- `var` au lieu de `let`/`const`/`export const`
- Pas de `import`/`export` (tout est dans le même scope)
- Les accents et caractères spéciaux sont encodés en `\xNN` ou `\uNNNN`
  - `é` → `\xE9`, `è` → `\xE8`, `à` → `\xE0`, `ê` → `\xEA`
  - `—` → `—`, `→` → `→`, `📷` → `\u{1F4F7}`

### 3. Appliquer la même modification

Faire exactement la même modification logique dans bundle.js, en respectant le format encodé.

### 4. Vérifier la cohérence

Après modification, vérifier que les deux versions sont équivalentes :
- Même logique
- Mêmes valeurs
- Même structure de données

## Ce qui N'est PAS dans bundle.js

Certains exports des sources ne sont pas inclus dans le bundle s'ils ne sont pas utilisés (tree-shaking). Avant de chercher une fonction dans bundle.js, vérifier si elle est réellement appelée depuis `app.js`.

## Rappel SW

Après toute modification de `sw.js`, incrémenter la version du cache (`kzo-inspect-v6` → `kzo-inspect-v7`) pour que les navigateurs téléchargent la nouvelle version.
