# Sommaire des Réparations — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajouter un bouton "🔧 Réparations" dans la nav supérieure qui ouvre une modale listant tous les défauts NC + AC avec cases à cocher et copie formatée vers le presse-papiers.

**Architecture:** Nouveau fichier `js/repairs-summary.js` (logique + modale), CSS dans `app.css`, bouton ajouté dans `renderNav()` de `app.js`, tout reflété dans `bundle.js`.

**Tech Stack:** Vanilla JS ES modules, HTML `<dialog>` natif, `navigator.clipboard`, CSS variables existantes. Aucune dépendance externe.

---

## Fichiers touchés

| Fichier | Action |
|---|---|
| `js/repairs-summary.js` | Créer |
| `css/app.css` | Modifier — ajouter styles modale réparations |
| `js/app.js` | Modifier — import + init + bouton nav + handler |
| `js/bundle.js` | Modifier — refléter tous les changements |

---

## Task 1 : Créer `js/repairs-summary.js`

**Files:**
- Create: `js/repairs-summary.js`

- [ ] **Step 1 : Écrire le fichier complet**

```js
import { iterSectionItems } from './section-structure.js';
import { presetLabel } from './quick-responses.js';

const PRIORITY_ORDER = { critique: 0, majeur: 1, mineur: 2 };
const PRIORITY_EMOJI  = { critique: '🔴', majeur: '🟠', mineur: '🟡' };

/**
 * Collecte tous les items NC + AC d'une inspection.
 * Exclut les items sans preset ET sans commentaire.
 * Retourne un tableau trié critique → majeur → mineur.
 */
export function getRepairItems(inspection) {
  if (!inspection?.sections) return [];
  const items = [];

  inspection.sections.forEach((sec) => {
    iterSectionItems(sec, (item) => {
      if (item.status !== 'non-conforme' && item.status !== 'a-corriger') return;
      const presets = (item.selectedPresets || []).map(presetLabel).filter(Boolean);
      const comment = (item.inspectorComment || '').trim();
      if (!presets.length && !comment) return;
      items.push({
        sectionTitle: sec.title || '',
        label: item.label || '',
        status: item.status,
        priority: item.priority || '',
        presets,
        comment,
      });
    });
  });

  items.sort((a, b) => (PRIORITY_ORDER[a.priority] ?? 3) - (PRIORITY_ORDER[b.priority] ?? 3));
  return items;
}

/**
 * Formate un item pour la copie presse-papiers.
 * Format :
 *   [NC - MAJEUR] Section IV — Plomberie
 *   Label nettoyé : preset1 · preset2
 *   Commentaire libre
 */
export function formatRepairItem(item) {
  const statusLabel = item.status === 'non-conforme' ? 'NC' : 'AC';
  const priorityLabel = item.priority ? item.priority.toUpperCase() : '—';
  const labelClean = item.label.replace(/^(?:Art\.\s*)?\d+(?:\.\d+)*[a-z]?\.?\s*[-—–:]*\s*/i, '');

  const lines = [`[${statusLabel} - ${priorityLabel}] ${item.sectionTitle}`];

  if (item.presets.length && item.comment) {
    lines.push(`${labelClean} : ${item.presets.join(' · ')}`);
    lines.push(item.comment);
  } else if (item.presets.length) {
    lines.push(`${labelClean} : ${item.presets.join(' · ')}`);
  } else {
    lines.push(`${labelClean} : ${item.comment}`);
  }

  return lines.join('\n');
}

/**
 * Injecte <dialog id="repairs-modal"> dans le body.
 * Expose window._openRepairsModal(inspection).
 * Accepte { toast } pour afficher les notifications.
 */
export function initRepairsModal({ toast } = {}) {
  const doToast = typeof toast === 'function' ? toast : () => {};

  const dlg = document.createElement('dialog');
  dlg.id = 'repairs-modal';
  dlg.innerHTML = `
    <div class="rm-header">
      <span class="rm-header__title">🔧 Sommaire des Réparations</span>
      <span class="rm-header__count" id="rm-count"></span>
      <button type="button" class="rm-close" id="rm-close" aria-label="Fermer">×</button>
    </div>
    <div class="rm-list" id="rm-list"></div>
    <div class="rm-footer">
      <button type="button" class="btn btn--ghost" id="rm-cancel">Fermer</button>
      <button type="button" class="btn btn--primary" id="rm-copy">📋 Copier le résumé</button>
    </div>`;
  document.body.appendChild(dlg);

  function rmEscHtml(s) {
    return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  document.getElementById('rm-close').addEventListener('click', () => dlg.close());
  document.getElementById('rm-cancel').addEventListener('click', () => dlg.close());

  document.getElementById('rm-copy').addEventListener('click', () => {
    const checked = dlg.querySelectorAll('.rm-item__check:checked');
    if (!checked.length) { doToast('Aucun item sélectionné.', 'warn'); return; }
    const text = Array.from(checked).map((cb) => cb.dataset.rmText).join('\n\n');
    navigator.clipboard.writeText(text)
      .then(() => { doToast('✓ Résumé copié !', 'success'); dlg.close(); })
      .catch(() => doToast('Erreur de copie — réessayez.', 'error'));
  });

  window._openRepairsModal = function(inspection) {
    const items = getRepairItems(inspection);
    const list  = document.getElementById('rm-list');
    const count = document.getElementById('rm-count');

    const nc = items.filter((i) => i.status === 'non-conforme').length;
    const ac = items.filter((i) => i.status === 'a-corriger').length;
    count.textContent = items.length
      ? `${items.length} défaut${items.length !== 1 ? 's' : ''} · ${nc} NC · ${ac} AC`
      : '';

    if (!items.length) {
      list.innerHTML = '<p class="rm-empty">Aucun défaut NC ou AC documenté dans cette inspection.</p>';
      dlg.showModal();
      return;
    }

    list.innerHTML = items.map((item) => {
      const statusLabel   = item.status === 'non-conforme' ? 'NC' : 'AC';
      const priorityLabel = item.priority ? item.priority.toUpperCase() : '—';
      const emoji         = PRIORITY_EMOJI[item.priority] || '⚪';
      const labelClean    = item.label.replace(/^(?:Art\.\s*)?\d+(?:\.\d+)*[a-z]?\.?\s*[-—–:]*\s*/i, '');
      const preview       = item.presets.length
        ? item.presets[0]
        : item.comment.substring(0, 70) + (item.comment.length > 70 ? '…' : '');
      const text = formatRepairItem(item);

      return `
        <label class="rm-item">
          <input type="checkbox" class="rm-item__check" checked data-rm-text="${rmEscHtml(text)}" />
          <div class="rm-item__body">
            <span class="rm-item__badge rm-item__badge--${item.priority || 'none'}">${emoji} ${statusLabel} - ${priorityLabel}</span>
            <span class="rm-item__section">${rmEscHtml(item.sectionTitle)}</span>
            <span class="rm-item__label">${rmEscHtml(labelClean)} : ${rmEscHtml(preview)}</span>
          </div>
        </label>`;
    }).join('');

    dlg.showModal();
  };
}
```

- [ ] **Step 2 : Vérifier les exports**

```bash
grep -n "^export" js/repairs-summary.js
```
Doit afficher : `getRepairItems`, `formatRepairItem`, `initRepairsModal`.

- [ ] **Step 3 : Commit**

```bash
git add js/repairs-summary.js
git commit -m "feat: repairs-summary — getRepairItems, formatRepairItem, initRepairsModal"
```

---

## Task 2 : CSS modale réparations dans `css/app.css`

**Files:**
- Modify: `css/app.css` (ajouter à la fin)

- [ ] **Step 1 : Ajouter le bloc CSS à la fin de `css/app.css`**

```css
/* ── Sommaire des Réparations — modale ─────────────────────────── */
dialog#repairs-modal {
  border: none;
  border-radius: var(--radius, 0.75rem);
  box-shadow: var(--shadow, 0 8px 32px rgba(0,0,0,.18));
  padding: 0;
  width: min(680px, 95vw);
  max-height: 82vh;
  overflow: hidden;
  background: var(--surface, #fff);
}
dialog#repairs-modal[open] {
  display: flex;
  flex-direction: column;
}
dialog#repairs-modal::backdrop {
  background: rgba(0,0,0,.45);
}
.rm-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem 0.75rem;
  border-bottom: 1px solid var(--border, #e2e8f0);
  flex-shrink: 0;
}
.rm-header__title { font-weight: 700; font-size: 1rem; flex: 1; }
.rm-header__count { font-size: 0.78rem; color: var(--text-muted, #64748b); }
.rm-close {
  background: none; border: none; font-size: 1.25rem;
  cursor: pointer; padding: 0.25rem 0.5rem;
  border-radius: 4px; color: var(--text-muted, #64748b);
}
.rm-close:hover { background: var(--border, #e2e8f0); }
.rm-list {
  overflow-y: auto;
  flex: 1;
  padding: 0.5rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.rm-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.6rem 0.75rem;
  border-radius: var(--radius, 0.5rem);
  cursor: pointer;
  border: 1px solid transparent;
}
.rm-item:hover { background: var(--border, #f1f5f9); }
.rm-item__check { flex-shrink: 0; margin-top: 0.15rem; accent-color: var(--qc-blue, #1d4ed8); }
.rm-item__body { display: flex; flex-direction: column; gap: 0.15rem; }
.rm-item__badge {
  font-size: 0.72rem; font-weight: 700;
  padding: 0.1rem 0.45rem;
  border-radius: 99px;
  width: fit-content;
}
.rm-item__badge--critique { background: #fee2e2; color: #991b1b; }
.rm-item__badge--majeur   { background: #ffedd5; color: #9a3412; }
.rm-item__badge--mineur   { background: #fef9c3; color: #854d0e; }
.rm-item__badge--none     { background: var(--border, #e2e8f0); color: var(--text-muted, #64748b); }
.rm-item__section { font-size: 0.75rem; color: var(--text-muted, #64748b); }
.rm-item__label   { font-size: 0.82rem; }
.rm-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 0.75rem 1.25rem;
  border-top: 1px solid var(--border, #e2e8f0);
  flex-shrink: 0;
}
.rm-empty {
  text-align: center;
  color: var(--text-muted, #64748b);
  font-size: 0.875rem;
  padding: 2rem 0;
}
```

- [ ] **Step 2 : Vérifier**

Ouvrir l'app dans le navigateur — aucune erreur de mise en page ne doit apparaître.

- [ ] **Step 3 : Commit**

```bash
git add css/app.css
git commit -m "feat: CSS modale Sommaire des Reparations"
```

---

## Task 3 : Modifier `js/app.js`

**Files:**
- Modify: `js/app.js`

Il y a 3 étapes.

### Étape A — Ajouter l'import

Après la ligne `import { PROFESSIONAL_NARRATIVES, getNarratives } from './professional-narratives.js';`, ajouter :

```js
import { initRepairsModal } from './repairs-summary.js';
```

### Étape B — Modifier `renderNav()` pour ajouter le bouton

Trouver dans `renderNav()` (ligne ~196) :
```js
nav.innerHTML = items
    .map(
      (i) =>
        `<a href="#${i.hash}" class="top-nav__link ${route.name === i.name || (route.name === 'inspect' && i.name === 'home') ? 'is-active' : ''}" data-nav="${i.name}">${i.label}</a>`,
    )
    .join('') + breadcrumb + `<a href="#" class="top-nav__link" id="nav-ai-btn">Assistant IA</a>`;
```

Remplacer par :
```js
  const repairsBtn = (route.name === 'inspect' && route.id)
    ? `<button type="button" class="btn btn--ghost btn--sm top-nav__repairs" id="nav-repairs-btn">🔧 Réparations</button>`
    : '';

  nav.innerHTML = items
    .map(
      (i) =>
        `<a href="#${i.hash}" class="top-nav__link ${route.name === i.name || (route.name === 'inspect' && i.name === 'home') ? 'is-active' : ''}" data-nav="${i.name}">${i.label}</a>`,
    )
    .join('') + breadcrumb + repairsBtn + `<a href="#" class="top-nav__link" id="nav-ai-btn">Assistant IA</a>`;
```

### Étape C — Ajouter le handler + l'appel init

Après `nav.querySelector('#nav-ai-btn')?.addEventListener(...)` dans `renderNav()`, ajouter :
```js
  nav.querySelector('#nav-repairs-btn')?.addEventListener('click', (e) => {
    e.preventDefault();
    const insp = getInspection(route.id);
    if (insp && window._openRepairsModal) window._openRepairsModal(insp);
  });
```

Dans le bloc d'init (fin du fichier), trouver :
```js
initNarrativesModal();
render();
```

Remplacer par :
```js
initNarrativesModal();
initRepairsModal({ toast });
render();
```

- [ ] **Step 1 : Appliquer l'import (Étape A)**

Ajouter après la ligne `import { PROFESSIONAL_NARRATIVES, getNarratives }` :
```js
import { initRepairsModal } from './repairs-summary.js';
```

- [ ] **Step 2 : Modifier renderNav (Étape B)**

Utiliser l'outil Edit pour remplacer le bloc `nav.innerHTML = items...` avec la version ci-dessus incluant `repairsBtn`.

- [ ] **Step 3 : Ajouter handler + init (Étape C)**

Ajouter le handler `#nav-repairs-btn` et l'appel `initRepairsModal({ toast })`.

- [ ] **Step 4 : Commit**

```bash
git add js/app.js
git commit -m "feat: app.js — bouton Reparations nav + initRepairsModal"
```

---

## Task 4 : Mettre à jour `js/bundle.js`

**Files:**
- Modify: `js/bundle.js`

Quatre insertions à faire dans le bundle IIFE.

### Insertion 1 — Fonctions `getRepairItems`, `formatRepairItem`

**Trouver** dans bundle.js :
```js
  function renderNav() {
```

**Insérer AVANT** le contenu complet de `js/repairs-summary.js` adapté pour le bundle (sans mots-clés `export`, sans `import`) :

```js
  const REPAIR_PRIORITY_ORDER = { critique: 0, majeur: 1, mineur: 2 };
  const REPAIR_PRIORITY_EMOJI = { critique: '🔴', majeur: '🟠', mineur: '🟡' };

  function getRepairItems(inspection) {
    if (!inspection?.sections) return [];
    const items = [];
    inspection.sections.forEach((sec) => {
      iterSectionItems(sec, (item) => {
        if (item.status !== 'non-conforme' && item.status !== 'a-corriger') return;
        const presets = (item.selectedPresets || []).map(presetLabel2).filter(Boolean);
        const comment = (item.inspectorComment || '').trim();
        if (!presets.length && !comment) return;
        items.push({
          sectionTitle: sec.title || '',
          label: item.label || '',
          status: item.status,
          priority: item.priority || '',
          presets,
          comment,
        });
      });
    });
    items.sort((a, b) => (REPAIR_PRIORITY_ORDER[a.priority] ?? 3) - (REPAIR_PRIORITY_ORDER[b.priority] ?? 3));
    return items;
  }

  function formatRepairItem(item) {
    const statusLabel = item.status === 'non-conforme' ? 'NC' : 'AC';
    const priorityLabel = item.priority ? item.priority.toUpperCase() : '—';
    const labelClean = item.label.replace(/^(?:Art\.\s*)?\d+(?:\.\d+)*[a-z]?\.?\s*[-—–:]*\s*/i, '');
    const lines = ['[' + statusLabel + ' - ' + priorityLabel + '] ' + item.sectionTitle];
    if (item.presets.length && item.comment) {
      lines.push(labelClean + ' : ' + item.presets.join(' \xB7 '));
      lines.push(item.comment);
    } else if (item.presets.length) {
      lines.push(labelClean + ' : ' + item.presets.join(' \xB7 '));
    } else {
      lines.push(labelClean + ' : ' + item.comment);
    }
    return lines.join('\n');
  }
```

**Note :** Dans le bundle, `presetLabel` est renommé `presetLabel2` (vérifier le nom exact avec `grep -n "function presetLabel" js/bundle.js`). Utiliser le nom correct trouvé.

### Insertion 2 — `initRepairsModal` et son appel

**Trouver** dans bundle.js :
```js
  initNarrativesModal();
  render();
```

**Remplacer par :**
```js
  initNarrativesModal();
  initRepairsModal();
  render();
```

**Et insérer AVANT `initNarrativesModal()`** la définition complète de `initRepairsModal()` (copier depuis `app.js`, adapter : supprimer le paramètre `{ toast }`, appeler directement `toast()` qui est dans le scope IIFE) :

```js
  function initRepairsModal() {
    const dlg = document.createElement('dialog');
    dlg.id = 'repairs-modal';
    dlg.innerHTML = '<div class="rm-header"><span class="rm-header__title">🔧 Sommaire des R\xE9parations</span><span class="rm-header__count" id="rm-count"></span><button type="button" class="rm-close" id="rm-close" aria-label="Fermer">\xD7</button></div><div class="rm-list" id="rm-list"></div><div class="rm-footer"><button type="button" class="btn btn--ghost" id="rm-cancel">Fermer</button><button type="button" class="btn btn--primary" id="rm-copy">📋 Copier le r\xE9sum\xE9</button></div>';
    document.body.appendChild(dlg);

    function rmEscHtml(s) {
      return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    document.getElementById('rm-close').addEventListener('click', () => dlg.close());
    document.getElementById('rm-cancel').addEventListener('click', () => dlg.close());

    document.getElementById('rm-copy').addEventListener('click', () => {
      const checked = dlg.querySelectorAll('.rm-item__check:checked');
      if (!checked.length) { toast('Aucun item s\xE9lectionn\xE9.', 'warn'); return; }
      const text = Array.from(checked).map((cb) => cb.dataset.rmText).join('\n\n');
      navigator.clipboard.writeText(text)
        .then(() => { toast('✓ R\xE9sum\xE9 copi\xE9 !', 'success'); dlg.close(); })
        .catch(() => toast('Erreur de copie — r\xE9essayez.', 'error'));
    });

    window._openRepairsModal = function(inspection) {
      const items = getRepairItems(inspection);
      const list  = document.getElementById('rm-list');
      const count = document.getElementById('rm-count');
      const nc = items.filter((i) => i.status === 'non-conforme').length;
      const ac = items.filter((i) => i.status === 'a-corriger').length;
      count.textContent = items.length ? (items.length + ' d\xE9faut' + (items.length !== 1 ? 's' : '') + ' \xB7 ' + nc + ' NC \xB7 ' + ac + ' AC') : '';
      if (!items.length) {
        list.innerHTML = '<p class="rm-empty">Aucun d\xE9faut NC ou AC document\xE9 dans cette inspection.</p>';
        dlg.showModal();
        return;
      }
      list.innerHTML = items.map((item) => {
        const statusLabel   = item.status === 'non-conforme' ? 'NC' : 'AC';
        const priorityLabel = item.priority ? item.priority.toUpperCase() : '—';
        const emoji         = REPAIR_PRIORITY_EMOJI[item.priority] || '⚪';
        const labelClean    = item.label.replace(/^(?:Art\.\s*)?\d+(?:\.\d+)*[a-z]?\.?\s*[-—–:]*\s*/i, '');
        const preview       = item.presets.length ? item.presets[0] : (item.comment.substring(0, 70) + (item.comment.length > 70 ? '…' : ''));
        const text = formatRepairItem(item);
        return '<label class="rm-item"><input type="checkbox" class="rm-item__check" checked data-rm-text="' + rmEscHtml(text) + '" /><div class="rm-item__body"><span class="rm-item__badge rm-item__badge--' + (item.priority || 'none') + '">' + emoji + ' ' + statusLabel + ' - ' + priorityLabel + '</span><span class="rm-item__section">' + rmEscHtml(item.sectionTitle) + '</span><span class="rm-item__label">' + rmEscHtml(labelClean) + ' : ' + rmEscHtml(preview) + '</span></div></label>';
      }).join('');
      dlg.showModal();
    };
  }
```

### Insertion 3 — Bouton dans renderNav

**Trouver** dans bundle.js la fonction `renderNav`. Localiser le bloc `nav.innerHTML = ...` et ajouter `repairsBtn` selon le même pattern que Task 3 Étape B.

Chercher :
```
const repairsBtn
```
→ S'il n'existe pas, le trouver via `grep -n "nav-ai-btn" js/bundle.js` et insérer avant la ligne correspondante.

**Trouver** dans `renderNav` du bundle :
```js
  nav.innerHTML = items.map(
```

**Insérer AVANT ce bloc :**
```js
  const repairsBtn = (route.name === "inspect" && route.id)
    ? '<button type="button" class="btn btn--ghost btn--sm top-nav__repairs" id="nav-repairs-btn">🔧 R\xE9parations</button>'
    : "";
```

**Et modifier la fin du `nav.innerHTML` pour inclure `repairsBtn`** — trouver :
```js
.join("") + breadcrumb + `<a href="#" class="top-nav__link" id="nav-ai-btn">Assistant IA</a>`
```

Remplacer par :
```js
.join("") + breadcrumb + repairsBtn + `<a href="#" class="top-nav__link" id="nav-ai-btn">Assistant IA</a>`
```

### Insertion 4 — Handler du bouton dans renderNav

**Après** le handler `#nav-ai-btn` dans `renderNav` du bundle, ajouter :
```js
  nav.querySelector("#nav-repairs-btn")?.addEventListener("click", (e) => {
    e.preventDefault();
    const insp = getInspection(route.id);
    if (insp && window._openRepairsModal) window._openRepairsModal(insp);
  });
```

- [ ] **Step 1 : Vérifier le nom de presetLabel dans le bundle**

```bash
grep -n "function presetLabel" js/bundle.js
```

Utiliser le nom exact trouvé dans les fonctions `getRepairItems` et `formatRepairItem`.

- [ ] **Step 2 : Insérer getRepairItems + formatRepairItem avant renderNav**

Utiliser l'outil Edit avec le bloc de l'Insertion 1.

- [ ] **Step 3 : Insérer initRepairsModal avant initNarrativesModal**

Utiliser l'outil Edit avec le bloc de l'Insertion 2.

- [ ] **Step 4 : Modifier renderNav dans le bundle**

Appliquer les Insertions 3 et 4.

- [ ] **Step 5 : Mettre à jour le cache-buster dans index.html**

Trouver `<script src="js/bundle.js?v=...">` et incrémenter la version (ex: `?v=7`).

- [ ] **Step 6 : Commit**

```bash
git add js/bundle.js index.html
git commit -m "feat: bundle.js — Sommaire des Reparations complet"
```

---

## Task 5 : Vérification manuelle dans le navigateur

- [ ] **Step 1 : Lancer le serveur** (si pas déjà actif)

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File "scripts\local-server.ps1" -Port 8775
```

- [ ] **Step 2 : Ouvrir `http://127.0.0.1:8775` et F5**

- [ ] **Step 3 : Vérifier le bouton dans la nav**

Ouvrir une inspection → le bouton **🔧 Réparations** doit apparaître dans la barre de navigation supérieure. Sur l'accueil, il ne doit pas apparaître.

- [ ] **Step 4 : Vérifier la modale**

Cliquer **🔧 Réparations** → la modale s'ouvre avec la liste des défauts NC + AC.

- [ ] **Step 5 : Vérifier le tri**

Les items CRITIQUE apparaissent en premier, puis MAJEUR, puis MINEUR.

- [ ] **Step 6 : Vérifier les cases à cocher**

Toutes cochées par défaut. Décocher quelques items.

- [ ] **Step 7 : Tester la copie**

Cliquer **📋 Copier le résumé** → toast "✓ Résumé copié !" → coller dans un éditeur de texte. Le format doit être :
```
[NC - MAJEUR] Section IV — Plomberie
29.1 Tuyauterie : Poly-B détecté — remplacement requis
Commentaire libre...

[AC - MINEUR] Section V — Électricité
37.2 Panneau : Liste circuits absente
```

- [ ] **Step 8 : Vérifier Escape**

Ouvrir la modale → appuyer `Échap` → modale fermée.

- [ ] **Step 9 : Vérifier cas vide**

Ouvrir une inspection sans défaut NC/AC → modale affiche "Aucun défaut NC ou AC documenté dans cette inspection."

- [ ] **Step 10 : Commit final**

```bash
git add -A
git commit -m "feat: Sommaire des Reparations — fonctionnalite complete"
```
