# Corrections mineures KZO Inspect — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Corriger 9 problèmes de code et UX identifiés lors de la revue de KZO Inspect.

**Architecture:** Chaque fix modifie un fichier source JS (`js/*.js`) ET doit être répercuté manuellement dans `js/bundle.js`. Les changements CSS vont dans `css/app.css`. Aucun build system — édition directe.

**Tech Stack:** Vanilla JS ES modules, CSS custom properties, PWA (sw.js), localStorage.

---

## Fichiers modifiés

| Fichier | Modifications |
|---|---|
| `js/app.js` | Fix escapeHtml attr (#1), breadcrumb nav (#5), scroll memory (#7) |
| `js/checklist-views.js` | Variable morte (#2), inline styles (#3), hint text (#6), photo iOS (#8) |
| `js/image-editor.js` | onerror handler (#4) |
| `css/app.css` | Classes CSS pour remplacer les inline styles (#3) |
| `js/bundle.js` | Toutes les modifications ci-dessus (sync manuelle) |
| `scripts/check-bundle.sh` | Script de validation sync source↔bundle (#9) |

---

## Task 1 : Fix escapeHtml dans attribut alt (app.js:224)

**Problème :** `alt="${escapeHtml(branding.appName)}"` — `escapeHtml` n'échappe pas `"`, ce qui casse l'attribut si le nom contient un guillemet. La fonction `escapeAttr` existe déjà pour ça.

**Fichiers :**
- Modifier : `js/app.js:224` et `js/app.js:1690-1695`
- Sync : `js/bundle.js`

- [ ] **Étape 1 : Ajouter le guillemet à escapeHtml dans app.js**

Dans `js/app.js`, remplacer lignes 1690–1695 :

```js
// AVANT
function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
```

Par :

```js
// APRÈS
function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
```

- [ ] **Étape 2 : Changer l'attribut alt ligne 224**

Dans `js/app.js`, remplacer :

```js
<img class="hero__logo" src="${heroLogo}" alt="${escapeHtml(branding.appName)}" width="280" height="80" decoding="async" />
```

Par :

```js
<img class="hero__logo" src="${heroLogo}" alt="${escapeAttr(branding.appName)}" width="280" height="80" decoding="async" />
```

- [ ] **Étape 3 : Sync bundle.js — escapeHtml**

Dans `js/bundle.js`, chercher le texte exact :

```
function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
```

⚠️ Il y a plusieurs `escapeHtml` dans bundle.js (une par module). Identifier celle qui **n'a pas** le `.replace(/"/g, '&quot;')` et qui est **suivie** par `function escapeAttr`. C'est celle de l'ancien `app.js`. La remplacer par :

```js
function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
```

- [ ] **Étape 4 : Sync bundle.js — attribut alt**

Dans `js/bundle.js`, chercher :

```
alt="${escapeHtml(branding.appName)}"
```

Remplacer par :

```
alt="${escapeAttr(branding.appName)}"
```

---

## Task 2 : Supprimer la variable morte totalSections (checklist-views.js:197)

**Problème :** `const totalSections = i.sections.length` est déclaré dans `renderSectionListRail` mais jamais utilisé dans son corps.

**Fichiers :**
- Modifier : `js/checklist-views.js:197`
- Sync : `js/bundle.js`

- [ ] **Étape 1 : Supprimer la ligne dans checklist-views.js**

Dans `js/checklist-views.js`, dans la fonction `renderSectionListRail`, supprimer :

```js
  const totalSections = i.sections.length;
```

La fonction doit passer de :

```js
export function renderSectionListRail(i, route) {
  const totalSections = i.sections.length;
  const activeSi =
```

À :

```js
export function renderSectionListRail(i, route) {
  const activeSi =
```

- [ ] **Étape 2 : Sync bundle.js**

Dans `js/bundle.js`, chercher le bloc (unique — le nom `renderSectionListRail` ne se répète pas) :

```
function renderSectionListRail(i, route) {
  const totalSections = i.sections.length;
  const activeSi =
```

Remplacer par :

```
function renderSectionListRail(i, route) {
  const activeSi =
```

---

## Task 3 : Remplacer les inline styles par des classes CSS

**Problème :** Deux endroits dans `checklist-views.js` ont des `style="..."` hardcodés dans les templates JS. Impossible à maintenir ou thématiser.

**Fichiers :**
- Modifier : `js/checklist-views.js:84,86,184`
- Modifier : `css/app.css` (ajouter classes en fin de fichier)
- Sync : `js/bundle.js`

### 3a — check-item--info (lignes 84–89)

- [ ] **Étape 1 : Lire le bloc exact dans checklist-views.js**

Lignes 83–89 actuelles :

```js
    return `
      <article class="check-item check-item--info" ${coords} style="padding-bottom: 0.5rem; border-bottom: 1px dashed var(--border); margin-bottom: 0.5rem;">
        <p class="check-item__label" style="margin: 0; color: #475569; font-size: 0.95rem;">
          <svg style="width: 1.1rem; height: 1.1rem; vertical-align: middle; margin-right: 0.5rem; color: #94a3b8; display: inline-block; margin-top: -2px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          ${escapeHtml(stripNumbering(item.label))}
        </p>
      </article>`;
```

Remplacer par :

```js
    return `
      <article class="check-item check-item--info" ${coords}>
        <p class="check-item__label check-item__label--info">
          <svg class="check-item__info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          ${escapeHtml(stripNumbering(item.label))}
        </p>
      </article>`;
```

- [ ] **Étape 2 : Ajouter les classes CSS dans app.css**

En fin du fichier `css/app.css`, ajouter :

```css
/* check-item info */
.check-item--info {
  padding-bottom: 0.5rem;
  border-bottom: 1px dashed var(--border);
  margin-bottom: 0.5rem;
}
.check-item__label--info {
  margin: 0;
  color: #475569;
  font-size: 0.95rem;
}
.check-item__info-icon {
  width: 1.1rem;
  height: 1.1rem;
  vertical-align: middle;
  margin-right: 0.5rem;
  color: #94a3b8;
  display: inline-block;
  margin-top: -2px;
}
```

### 3b — section-list__btn (ligne 184)

- [ ] **Étape 3 : Retirer les inline styles du bouton de section**

Dans `js/checklist-views.js`, ligne 184, remplacer :

```js
          <button type="button" class="section-list__btn" data-open-section="${si}" aria-current="${activeSi === si ? 'true' : 'false'}" style="text-align: left; padding: 0.5rem; width: 100%; display: flex; gap: 0.5rem; border: none; background: transparent; cursor: pointer; border-radius: 4px; ${activeSi === si ? 'background: #e2e8f0; font-weight: bold;' : ''}">
```

Par :

```js
          <button type="button" class="section-list__btn ${activeSi === si ? 'section-list__btn--active' : ''}" data-open-section="${si}" aria-current="${activeSi === si ? 'true' : 'false'}">
```

- [ ] **Étape 4 : Ajouter les classes CSS dans app.css**

Ajouter à la suite dans `css/app.css` :

```css
/* section-list__btn */
.section-list__btn {
  text-align: left;
  padding: 0.5rem;
  width: 100%;
  display: flex;
  gap: 0.5rem;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 4px;
}
.section-list__btn--active {
  background: #e2e8f0;
  font-weight: bold;
}
```

- [ ] **Étape 5 : Sync bundle.js — check-item--info**

Dans `js/bundle.js`, chercher :

```
<article class="check-item check-item--info" ${coords} style="padding-bottom: 0.5rem; border-bottom: 1px dashed var(--border); margin-bottom: 0.5rem;">
```

Appliquer la même substitution qu'à l'étape 1.

- [ ] **Étape 6 : Sync bundle.js — section-list__btn**

Dans `js/bundle.js`, chercher :

```
style="text-align: left; padding: 0.5rem; width: 100%; display: flex; gap: 0.5rem; border: none; background: transparent; cursor: pointer; border-radius: 4px; ${activeSi === si ? 'background: #e2e8f0; font-weight: bold;' : ''}"
```

Appliquer la même substitution qu'à l'étape 3.

---

## Task 4 : Ajouter img.onerror dans image-editor.js

**Problème :** Si la photo est corrompue, `img.onload` ne se déclenche jamais → overlay vide bloqué, DOM non nettoyé.

**Fichiers :**
- Modifier : `js/image-editor.js:87-92`
- Sync : `js/bundle.js`

- [ ] **Étape 1 : Modifier image-editor.js**

Dans `js/image-editor.js`, remplacer :

```js
  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
  };
  img.src = originalDataUrl;
```

Par :

```js
  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
  };
  img.onerror = () => {
    overlay.remove();
    toast('Impossible de charger la photo pour annotation.');
  };
  img.src = originalDataUrl;
```

⚠️ La fonction `toast` n'est pas importée dans `image-editor.js`. Deux options :
- **Option A (recommandée)** : Passer `toast` en paramètre optionnel de `openImageEditor`.
- **Option B (simple)** : Remplacer `toast(...)` par `alert('Impossible de charger la photo pour annotation.')`.

Utiliser l'Option B pour éviter de modifier la signature et le bundle :

```js
  img.onerror = () => {
    overlay.remove();
    alert('Impossible de charger la photo pour annotation.');
  };
```

- [ ] **Étape 2 : Sync bundle.js**

Dans `js/bundle.js`, chercher :

```
  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
  };
  img.src = originalDataUrl;
```

Remplacer par :

```
  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
  };
  img.onerror = () => {
    overlay.remove();
    alert('Impossible de charger la photo pour annotation.');
  };
  img.src = originalDataUrl;
```

---

## Task 5 : Fil d'Ariane dans la nav (app.js)

**Problème :** Quand on est dans une inspection, la nav n'indique pas où on est. Sur tablette en plein soleil, l'utilisateur perd son contexte.

**Fichiers :**
- Modifier : `js/app.js` — fonction `renderNav` (lignes 123–145)
- Sync : `js/bundle.js`

- [ ] **Étape 1 : Modifier renderNav dans app.js**

Remplacer la fonction `renderNav` entière :

```js
function renderNav() {
  const items = [
    { name: 'home', label: 'Accueil', hash: '' },
    { name: 'new', label: 'Nouvelle', hash: 'new' },
    { name: 'profile', label: 'Profil', hash: 'profile' },
  ];
  nav.innerHTML = items
    .map(
      (i) =>
        `<a href="#${i.hash}" class="top-nav__link ${route.name === i.name || (route.name === 'inspect' && i.name === 'home') ? 'is-active' : ''}" data-nav="${i.name}">${i.label}</a>`,
    )
    .join('') + `<a href="#" class="top-nav__link" id="nav-ai-btn">Assistant IA</a>`;
  nav.querySelectorAll('[data-nav]').forEach((a) => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      navigate(a.dataset.nav);
    });
  });
  nav.querySelector('#nav-ai-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    openAiAssistant();
  });
}
```

Par :

```js
function renderNav() {
  const items = [
    { name: 'home', label: 'Accueil', hash: '' },
    { name: 'new', label: 'Nouvelle', hash: 'new' },
    { name: 'profile', label: 'Profil', hash: 'profile' },
  ];

  let breadcrumb = '';
  if (route.name === 'inspect' && route.id) {
    const insp = getInspection(route.id);
    if (insp) {
      const label = (insp.site.client || insp.site.adresse || insp.templateLabel || '').slice(0, 28);
      breadcrumb = `<span class="top-nav__breadcrumb">▸ ${escapeHtml(label)}</span>`;
    }
  }

  nav.innerHTML = items
    .map(
      (i) =>
        `<a href="#${i.hash}" class="top-nav__link ${route.name === i.name || (route.name === 'inspect' && i.name === 'home') ? 'is-active' : ''}" data-nav="${i.name}">${i.label}</a>`,
    )
    .join('') + breadcrumb + `<a href="#" class="top-nav__link" id="nav-ai-btn">Assistant IA</a>`;

  nav.querySelectorAll('[data-nav]').forEach((a) => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      navigate(a.dataset.nav);
    });
  });
  nav.querySelector('#nav-ai-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    openAiAssistant();
  });
}
```

- [ ] **Étape 2 : Ajouter le style CSS dans app.css**

Ajouter dans `css/app.css` :

```css
/* Fil d'Ariane nav */
.top-nav__breadcrumb {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.65);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 160px;
  align-self: center;
  pointer-events: none;
}
```

- [ ] **Étape 3 : Sync bundle.js**

Dans `js/bundle.js`, chercher le bloc `function renderNav()` (identique à l'AVANT ci-dessus) et remplacer par l'APRÈS.

---

## Task 6 : Améliorer le texte hint de la checklist (checklist-views.js:48)

**Problème :** `"C / NC / AC / N/A puis pastilles"` est cryptique pour un nouvel utilisateur.

**Fichiers :**
- Modifier : `js/checklist-views.js:48`
- Sync : `js/bundle.js`

- [ ] **Étape 1 : Modifier checklist-views.js**

Remplacer la ligne 48 dans `renderChecklistToolbar` :

```js
      <span class="checklist-toolbar__hint">${pending > 0 ? `${pending} point${pending > 1 ? 's' : ''} non répondu${pending > 1 ? 's' : ''}` : 'Checklist complète ✓'} · <strong>C / NC / AC / N/A</strong> puis pastilles</span>
```

Par :

```js
      <span class="checklist-toolbar__hint">${pending > 0 ? `${pending} point${pending > 1 ? 's' : ''} en attente` : 'Checklist complète ✓'} · Touchez <strong>C</strong> (conforme) <strong>NC</strong> (non-conforme) <strong>AC</strong> (à corriger) <strong>N/A</strong>, puis choisissez une pastille.</span>
```

- [ ] **Étape 2 : Sync bundle.js**

Dans `js/bundle.js`, chercher :

```
Checklist complète ✓'} · <strong>C / NC / AC / N/A</strong> puis pastilles
```

Remplacer par :

```
Checklist complète ✓'} · Touchez <strong>C</strong> (conforme) <strong>NC</strong> (non-conforme) <strong>AC</strong> (à corriger) <strong>N/A</strong>, puis choisissez une pastille.
```

Et chercher :

```
non répondu${pending > 1 ? 's' : ''}` : 'Checklist complète
```

Remplacer `non répondu${pending > 1 ? 's' : ''}` par `en attente`.

---

## Task 7 : Mémoriser la position de défilement (app.js)

**Problème :** En revenant à la liste des sections, le scroll repart au début — irritant sur des listes de 50+ items.

**Fichiers :**
- Modifier : `js/app.js` — zone de gestion du checklist
- Sync : `js/bundle.js`

- [ ] **Étape 1 : Chercher où le contenu de la vue checklist est monté**

Dans `js/app.js`, chercher la fonction qui gère le changement de section dans la checklist (probablement dans `renderInspect` ou un handler `data-open-section`). Repérer l'endroit où `main.scrollTop` pourrait être manipulé.

Chercher dans app.js avec : `data-open-section` ou `checklistSection` ou `checklistView`.

- [ ] **Étape 2 : Sauvegarder le scroll avant navigation de section**

Dans `js/app.js`, dans la fonction `renderInspect` ou son handler de navigation par section, trouver le `addEventListener` sur `data-open-section`. Avant l'appel à `navigate` ou au re-render, ajouter :

```js
sessionStorage.setItem('kzo_scroll_inspect_' + id, String(main.scrollTop));
```

- [ ] **Étape 3 : Restaurer le scroll après rendu**

Après que `main.innerHTML` est mis à jour dans `renderInspect`, ajouter :

```js
const savedScroll = sessionStorage.getItem('kzo_scroll_inspect_' + id);
if (savedScroll) {
  main.scrollTop = parseInt(savedScroll, 10);
}
```

- [ ] **Étape 4 : Effacer le scroll au retour à l'accueil**

Dans le handler de navigation vers `'home'`, ajouter :

```js
sessionStorage.removeItem('kzo_scroll_inspect_' + route.id);
```

- [ ] **Étape 5 : Sync bundle.js**

Appliquer les mêmes modifications dans `js/bundle.js` (chercher le contexte exact après l'étape 2 et 3).

---

## Task 8 : Bouton photo — accès galerie sur iOS

**Problème :** `capture="environment"` force l'appareil photo et bloque l'accès à la galerie sur iOS. L'inspecteur ne peut pas choisir une photo prise avant l'inspection.

**Fichiers :**
- Modifier : `js/checklist-views.js:126`
- Sync : `js/bundle.js`

- [ ] **Étape 1 : Modifier checklist-views.js ligne 126**

Remplacer :

```js
          <input type="file" accept="image/*" capture="environment" hidden data-photo ${coords} />
```

Par :

```js
          <input type="file" accept="image/*" hidden data-photo ${coords} />
```

Explication : Sans `capture`, iOS présente un choix : Prendre une photo, Bibliothèque de photos, Choisir un fichier. C'est préférable en contexte professionnel.

- [ ] **Étape 2 : Sync bundle.js**

Dans `js/bundle.js`, chercher :

```
<input type="file" accept="image/*" capture="environment" hidden data-photo
```

Remplacer par :

```
<input type="file" accept="image/*" hidden data-photo
```

---

## Task 9 : Script de validation sync bundle

**Problème :** Aucune détection si un changement source n'est pas répercuté dans bundle.js.

**Fichiers :**
- Créer : `scripts/check-bundle.sh`

- [ ] **Étape 1 : Créer le script**

Créer `scripts/check-bundle.sh` :

```bash
#!/usr/bin/env bash
# Vérifie que les fonctions clés des modules source sont bien dans bundle.js
set -e

BUNDLE="js/bundle.js"
ERRORS=0

check() {
  local fn="$1"
  if ! grep -q "$fn" "$BUNDLE"; then
    echo "❌ MANQUANT dans bundle.js : $fn"
    ERRORS=$((ERRORS + 1))
  else
    echo "✓ $fn"
  fi
}

echo "=== Validation bundle.js ==="
check "function openImageEditor"
check "function renderSectionListRail"
check "function renderChecklistToolbar"
check "function renderChecklistMainPane"
check "function openAiAssistant"
check "function analyzePhotoWithVision"
check "function openReport"
check "function openReceipt"
check "function escapeAttr"
check "function loadInspections"
check "function upsertInspection"

echo ""
if [ "$ERRORS" -gt 0 ]; then
  echo "⚠️  $ERRORS fonction(s) manquante(s) dans bundle.js"
  exit 1
else
  echo "✅ Toutes les fonctions clés sont présentes dans bundle.js"
fi
```

- [ ] **Étape 2 : Rendre exécutable**

```bash
chmod +x scripts/check-bundle.sh
```

- [ ] **Étape 3 : Tester**

```bash
bash scripts/check-bundle.sh
```

Résultat attendu : `✅ Toutes les fonctions clés sont présentes dans bundle.js`

---

## Revue finale

Après toutes les tâches :

- [ ] Lancer l'app : `bash "Lancer KZO Inspect.command"` ou double-clic sur `Lancer KZO Inspect.bat`
- [ ] Ouvrir `http://127.0.0.1:8775`
- [ ] Vérifier : nav affiche le nom du client quand on ouvre une inspection
- [ ] Vérifier : hint checklist lisible
- [ ] Vérifier : bouton photo sur iOS ouvre le choix galerie/caméra
- [ ] Vérifier : éditeur de photo avec une photo valide (annotations OK)
- [ ] Vérifier : console DevTools sans erreur JS
- [ ] Lancer `bash scripts/check-bundle.sh` → ✅
