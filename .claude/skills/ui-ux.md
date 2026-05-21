---
name: ui-ux
description: Concevoir, améliorer ou corriger l'interface de KZO Inspect. Utilise ce skill pour tout ce qui touche au design visuel, aux composants, à la mise en page, aux couleurs, à l'ergonomie mobile/tablette ou à l'expérience utilisateur de l'app.
type: flexible
---

# UI/UX — KZO Inspect

## Design System

Variables CSS disponibles dans `css/app.css` :

```css
--qc-blue: #0d47a1        /* bleu principal */
--qc-blue-light: #1565c0  /* hover, focus */
--qc-blue-dark: #002171   /* en-têtes, titres */
--accent: #c62828          /* danger, NC */
--bg: #f0f4f8              /* fond page */
--surface: #ffffff         /* cartes, panels */
--text: #1a1a2e
--text-muted: #5c6b7a
--border: #d8e0ea
--radius: 12px
--shadow: 0 2px 12px rgba(13,71,161,0.08)
--safe-bottom: env(safe-area-inset-bottom, 0)
```

Police premium via `css/kzo-premium.css` : **Plus Jakarta Sans** — redéfinit `--font`.

## Composants existants (ne pas recréer)

| Classe | Usage |
|--------|-------|
| `.btn .btn--primary/ghost/danger/sm` | Boutons |
| `.card .card__head/.card__actions` | Cartes |
| `.input .input--sm/search` | Champs |
| `.badge .badge--draft/progress/done` | Badges de statut |
| `.tabs .tabs__btn.is-active` | Onglets |
| `.chip .chip.is-active` | Filtres pill |
| `.toast .toast--success/warn/error` | Notifications |
| `.modal .modal__inner/.modal__actions` | Dialogues |
| `.preset-chip .preset-chip.is-selected` | Pastilles de réponse |
| `.ai-panel .ai-fab .ai-msg--user/bot` | Panel assistant IA |

## Principes UX KZO

1. **Mobile-first tablet** — l'inspecteur utilise une tablette ou mobile sur le terrain. Zones de tap minimum 44px. Pas de hover-only.
2. **Statuts visuels immédiats** — C (vert) / NC (rouge) / AC (jaune) / N/A (gris) doivent être lisibles d'un coup d'œil sans lire le texte.
3. **Une main libre** — l'autre tient la tablette. Boutons importants en bas de l'écran, pas en haut.
4. **Hors-ligne d'abord** — toute interface qui dépend du réseau doit indiquer clairement l'état cloud.
5. **Densité d'information** — sur une checklist de 60+ points, la lisibilité prime sur la beauté.

## Workflow UI

1. Identifier le composant ou la section à modifier
2. Vérifier les variables CSS existantes avant d'en créer de nouvelles
3. Chercher un pattern similaire déjà utilisé dans `css/app.css`
4. Écrire d'abord dans le fichier source CSS (`css/app.css`)
5. Tester les media queries : 480px (mobile), 600px (tablette petite), 960px (desktop)
6. Ne PAS ajouter de styles inline dans le JS sauf pour les valeurs dynamiques

## Patterns courants

**Sticky toolbar** (toolbar qui reste en haut en scrollant) :
```css
position: sticky;
top: 56px; /* hauteur top-bar */
z-index: 20;
background: var(--bg);
```

**Action bar fixe en bas** :
```css
position: sticky;
bottom: 0;
padding-bottom: calc(12px + var(--safe-bottom));
background: linear-gradient(transparent, var(--bg) 20%);
```

**Safe area iPhone/iPad** : toujours utiliser `var(--safe-bottom)` pour les éléments en bas d'écran.
