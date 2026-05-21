---
name: debug-kzo
description: Diagnostiquer et corriger les bugs de KZO Inspect. Utilise ce skill pour tout crash JS, comportement inattendu, problème de Service Worker, de cache, d'affichage ou d'appel API.
type: rigid
---

# Débogage KZO Inspect

## Pièges fréquents — vérifier EN PREMIER

### 1. Modification source non répercutée dans bundle.js
Chaque fichier `js/*.js` source a son équivalent dans `js/bundle.js` (IIFE). Si une correction ne prend pas effet, chercher le même code dans `bundle.js` et le corriger aussi.

```bash
# Chercher dans bundle.js
grep -n "texte_à_chercher" js/bundle.js
```

### 2. Apostrophe française dans handler inline HTML
```js
// CRASH silencieux :
onclick="doSomething('l\'élément')"

// CORRECT — utiliser un ID + addEventListener :
element.id = 'my-btn';
document.getElementById('my-btn').addEventListener('click', () => doSomething(label));
```

### 3. Service Worker qui sert une version en cache
Symptôme : modification visible dans le source mais pas à l'écran.
- Ouvrir DevTools → Application → Service Workers → "Update on reload" ✓
- Ou incrémenter `CACHE` dans `sw.js` (`v6` → `v7`)
- Ou Ctrl+Shift+R (hard reload)

### 4. Clé API non transmise au bon provider
`analyzePhotoWithVision()` dans `ai-vision.js` route selon `profile.aiProvider`. Vérifier que le profil localStorage contient bien `aiProvider` + `aiApiKey` + `aiUseCloud: true`.

### 5. localStorage plein ou corrompu
```js
// Vérifier dans la console :
localStorage.getItem('inspectqc_inspections_v1')
localStorage.getItem('inspectqc_profile_v1')
```

## Processus de débogage

1. **Reproduire** — noter les étapes exactes, le navigateur, si c'est toujours/parfois
2. **Console DevTools** — lire l'erreur complète avec le stack trace
3. **Chercher dans les sources** — l'erreur pointe vers `bundle.js:ligne`. Chercher le texte autour dans les sources pour identifier le fichier d'origine
4. **Tester un fix minimal** — une seule modification à la fois
5. **Corriger dans source ET bundle** — ne jamais oublier le bundle

## Erreurs communes et causes

| Erreur console | Cause probable |
|----------------|----------------|
| `Cannot read properties of null` | `getElementById()` appelé avant le DOM (vérifier l'ordre des scripts) |
| `Unexpected token '` | Apostrophe française dans un handler HTML inline |
| `Failed to fetch` | API appelée sans clé, mauvais endpoint, ou CORS bloqué |
| `QuotaExceededError` | localStorage plein — suggérer un export/backup |
| `SyntaxError: JSON.parse` | localStorage corrompu — nettoyer la clé concernée |
| L'app s'affiche vide après 8s | `boot.js` a déclenché le timeout — vérifier `bundle.js` dans le cache SW |
