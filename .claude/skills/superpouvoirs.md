---
name: superpouvoirs
description: Guide de référence des superpowers disponibles dans ce projet KZO Inspect. Utilise ce skill pour savoir quel skill invoquer selon la situation — brainstorming avant de créer, debugging systématique, vérification avant de terminer, etc.
type: flexible
---

# Superpouvoirs KZO Inspect

## Quand utiliser quel skill

### Avant de créer ou modifier une fonctionnalité
→ `superpowers:brainstorming` — explorer les besoins, les contraintes, les alternatives avant de coder

### Devant un bug ou comportement inattendu
→ `superpowers:systematic-debugging` — trouver la cause racine avant de proposer une correction
→ `debug-kzo` (skill projet) — patterns spécifiques aux bugs fréquents de KZO

### Avant de déclarer une tâche terminée
→ `superpowers:verification-before-completion` — vérifier que le code fonctionne réellement

### Pour modifier l'interface
→ `ui-ux` (skill projet) — design system KZO, composants existants, règles UX terrain
→ `superpowers:frontend-design` — si la création est plus ambitieuse (nouveau composant complet)

### Pour rédiger du texte de rapport
→ `rapport-aibq-bnq` (skill projet) — style AIBQ, terminologie, structure des constats

### Après avoir modifié un fichier source JS
→ `bundle-sync` (skill projet) — règle critique : toujours répercuter dans bundle.js

### Pour gérer des tâches parallèles indépendantes
→ `superpowers:dispatching-parallel-agents` — lancer plusieurs agents en même temps

### Pour un plan d'implémentation multi-étapes
→ `superpowers:writing-plans` — avant de toucher au code sur une tâche complexe

### Pour du code review
→ `superpowers:requesting-code-review` — vérification avant merge

## Skills projet disponibles

| Skill | Quand l'utiliser |
|-------|-----------------|
| `ui-ux` | Design, composants, CSS, ergonomie mobile |
| `debug-kzo` | Bugs JS, cache SW, apostrophes, localStorage |
| `rapport-aibq-bnq` | Rédaction narratifs, terminologie québécoise |
| `bundle-sync` | Après toute modif d'un fichier source JS |
| `presets-inspection` | Ajouter/modifier des pré-réponses de terrain |
| `superpouvoirs` | Ce fichier — guide de référence |

## Skills globaux importants pour ce projet

| Skill | Description |
|-------|-------------|
| `kzo-inspectpro-skill` | Skill principal KZO — contexte complet du projet |
| `frontend-design` | Créer des composants UI production-ready |
| `superpowers:systematic-debugging` | Trouver la cause racine des bugs |
| `superpowers:brainstorming` | Explorer avant d'implémenter |
| `superpowers:verification-before-completion` | Valider avant de terminer |
| `commit-commands:commit` | Créer un commit git propre |
