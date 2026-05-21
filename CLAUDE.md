# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Lancer l'application

```bat
# Windows — double-clic ou :
"Lancer KZO Inspect.bat"

# Mac
bash "Lancer KZO Inspect.command"
```

Cela démarre un serveur Python sur `http://127.0.0.1:8775`. Ne jamais ouvrir `index.html` directement (protocole `file://` bloque les modules).

Aucun `npm`, `node`, ni système de build externe requis.

## Architecture du bundle

Les fichiers source dans `js/*.js` utilisent la syntaxe ES modules (`import/export`). Ils sont compilés en un seul fichier IIFE `js/bundle.js` chargé par `index.html`.

**Règle critique** : toute modification dans un fichier source (`js/app.js`, `js/storage.js`, etc.) doit être **répercutée manuellement dans `js/bundle.js`**. Le bundle n'est pas généré automatiquement — il est édité directement.

`index.html` charge uniquement :
- `js/boot.js` — détection d'erreurs de démarrage (script plain, pas de module)
- `js/bundle.js` — tout le reste de l'application

`sw.js` cache uniquement `boot.js` et `bundle.js` (pas les sources individuelles).

## Persistance des données

Tout est stocké en `localStorage` / `sessionStorage` — aucune base de données, aucun serveur d'API propriétaire.

- Clé inspections : `inspectqc_inspections_v1`
- Clé profil : `inspectqc_profile_v1`
- Historique chat IA : `kzo_ai_chat_history` (sessionStorage)

## Providers IA

L'app supporte 4 providers configurables dans le profil utilisateur :

| Provider | Modèles recommandés | Endpoint |
|---|---|---|
| OpenAI | gpt-4o, gpt-4.1 | `api.openai.com` |
| Anthropic | claude-sonnet-4-6, claude-haiku-4-5-20251001 | `api.anthropic.com` + header `anthropic-dangerous-direct-browser-access: true` |
| Gemini | gemini-2.0-flash, gemini-2.5-pro | `generativelanguage.googleapis.com` |
| xAI | grok-vision-beta | `api.x.ai` |

La clé API est stockée dans le profil localStorage. Le mode cloud doit être activé (`profile.aiUseCloud = true`).

## Structure des templates d'inspection

Chaque inspection a un `template` (ex: `aibq-preachat`, `bnq-3009`) qui définit ses sections. Les sections contiennent des items avec :

```js
{
  id: 'walk-fondations-1',
  label: '17.1 Fondations — observation',
  status: null,          // 'conforme' | 'non-conforme' | 'a-corriger' | 'na'
  priority: 'mineur',    // 'critique' | 'majeur' | 'mineur'
  selectedPresets: [],   // IDs des réponses rapides choisies
  inspectorComment: '',  // commentaire libre
  photos: []             // data URLs compressées
}
```

Les sections peuvent avoir des sous-sections (`subsections[]`). Utiliser `getSectionItemGroups(section)` (dans `section-structure.js`) pour itérer correctement items + sous-sections.

## IDs de sections et sous-sections

**AIBQ visite extérieure** : `walk-terrain`, `walk-fondations`, `walk-toiture`, `walk-facades`, `walk-plomb-ext`, `walk-elec-ext`, `walk-ouvertures`

**AIBQ systèmes** : `aibq-v-i` (Structure), `aibq-v-iv` (Plomberie), `aibq-v-v` (Électricité), `aibq-v-vi` (Chauffage), `aibq-v-vii` (Climatisation), `aibq-v-viii` (Intérieur), `aibq-v-ix` (Isolation), `aibq-v-x` (Ventilation), `aibq-v-xi` (Sécurité)

**BNQ visite extérieure** : `bnq-w-terrain`, `bnq-w-fondations`, `bnq-w-toiture`, `bnq-w-facades`, `bnq-w-plomb-ext`, `bnq-w-elec-ext`, `bnq-w-ouvertures`

**BNQ systèmes** : `bnq-12-2` (Ext. architectural), `bnq-12-3` (Plomberie), `bnq-12-4` (Électricité), `bnq-12-5` (Chauffage/clim/vent), `bnq-12-6` (Intérieur), `bnq-12-7` (Combles/isolation), `bnq-12-8` (Sécurité)

**Sections d'information** (pas de statut, affichage texte seul) : identifiées par `isInfoSection(sectionId)` dans `section-structure.js`.

## Réponses rapides (presets)

Définis dans `js/quick-responses.js` → `QUICK_RESPONSES` (globaux) et `SECTION_PRESETS` (contextuels par section/sous-section).

`getPresetsForStatus(status, sectionId?)` retourne les presets applicables — fusionner globaux + contextuels. Les IDs de presets sont stockés dans `item.selectedPresets[]` et résolus via `presetLabel(id)`.

## Règle apostrophes dans le HTML inline

Ne jamais utiliser d'apostrophes françaises dans les attributs `onclick=""` ou handlers inline HTML. Toujours passer par des `id` + `addEventListener`. Voir `js/ai-assistant.js` comme référence de pattern correct.

## Normes québécoises actives

- REIBH 2024 (Règlement inspecteurs en bâtiment Québec)
- BNQ 3009-500 R1 2022
- Norme de pratique AIBQ (préachat résidentiel)
- CNB 2020 / Code de construction du Québec

## Inspecteur titulaire

`INSPECTOR_NAME = 'Jean Eveillard Cazeau'` — constante dans `js/storage.js`, injectée dans tous les nouveaux dossiers.

## CSS

- `css/app.css` — design system principal (variables, composants, layout, assistant IA)
- `css/kzo-premium.css` — surcharge typographique (Plus Jakarta Sans) + boot panels

Variables clés : `--qc-blue`, `--qc-blue-dark`, `--surface`, `--border`, `--radius`, `--shadow`, `--safe-bottom`.

Les styles de l'assistant IA (`ai-panel`, `ai-fab`, `ai-msg`, `ai-quick`, etc.) sont dans `app.css` en fin de fichier.

## Service Worker

Version actuelle : `kzo-inspect-v9`. Incrémenter la version (`v10`, `v11`…) à chaque modification de `sw.js` pour forcer le remplacement du cache.

Le SW adopte une stratégie **network-first** pour les assets app, avec repli cache si hors-ligne.

## Sauvegarde locale pré-rapport

Lors du clic sur **Rapport PDF**, l'application télécharge automatiquement un fichier JSON de sauvegarde locale du dossier d'inspection courant (`kzo-dossier-{numeroDossier}-{client}-{timestamp}.json`). Ce fichier contient le profil inspecteur et toutes les données du dossier. Il est compatible avec l'import standard (Profil → Sauvegarde). Cette sauvegarde protège contre toute perte de données avant l'envoi vers Google Drive.
