# Facturation automatique + Gmail + Google Drive — Spec

## Objectif

Ajouter à KZO Inspect :
1. **Auto-facturation** — numérotation `KZO-2026-001`, pré-remplissage du reçu à la complétion, suivi du statut de paiement
2. **Envoi Gmail** — envoyer la facture HTML depuis `kzoinspectpro@gmail.com` via Gmail API
3. **Sync Google Drive** — sauvegarder et restaurer toutes les inspections (JSON) vers Drive

**Périmètre de cette spec : Sous-projet A (facturation + Gmail).** La sync Drive (Sous-projet B) partage les mêmes modules OAuth2 mais est un plan d'implémentation séparé.

---

## Contexte technique

- App PWA vanilla JS, offline-first, pas de serveur backend
- Tout se passe dans le navigateur
- Code source dans `js/*.js`, bundlé manuellement dans `js/bundle.js`
- **Client ID Google existant** (réutilisé tel quel) : `18973787304-0vm4pu6383jn2vni2h996i0ri62iu21s.apps.googleusercontent.com`
- Code de référence disponible dans `C:\Users\jeane\Desktop\Amboul\JEC\google_drive.js` — adapté pour KZO Inspect

---

## Architecture

### Nouveaux fichiers source

#### `js/google-auth.js`
Module OAuth2 partagé (Gmail + Drive). Adapté de `Amboul/JEC/google_drive.js`.

```
Responsabilités :
- Charger Google Identity Services (GIS) depuis CDN
- Initialiser le token client avec scopes : drive.file + gmail.send
- Exposer : googleAuth.authenticate(), googleAuth.isConnected(), googleAuth.getToken(), googleAuth.disconnect()
- Token stocké en sessionStorage (disparaît à la fermeture du navigateur)
- Clé : kzo_google_token + kzo_google_token_expiry
```

#### `js/gmail-send.js`
Envoi de la facture par courriel.

```
Responsabilités :
- buildInvoiceEmail(inspection, profile) → message base64 RFC 2822 avec corps HTML
- sendInvoiceEmail(token, message) → POST Gmail API /users/me/messages/send
- buildInvoiceHtml(inspection, profile) → HTML de la facture (sans mention de norme)
```

### Fichiers existants modifiés

#### `js/storage.js`
```
Ajouts dans le profil (profile localStorage) :
  profile.invoiceCounter      // number — prochain numéro séquentiel
  profile.invoiceYear         // number — reset counter si nouvelle année
  profile.googleClientId      // string — Client ID (pré-rempli avec la valeur JEC)
  profile.googleConnected     // boolean — statut connexion affiché dans Profil

Nouvelle fonction :
  nextInvoiceNumber(profile) → string "KZO-2026-001"
    - Si profile.invoiceYear !== année courante → remet counter à 1
    - Formate : KZO-YYYY-NNN (padStart 3 zéros)
    - Incrémente et sauvegarde le profil
```

#### `js/app.js`
```
Onglet Info (renderInspect) :
  - Ajouter champ "Courriel du client" (inspection.site.emailClient)
  - Positionné sous le champ Nom du client

Trigger auto-numérotation :
  - Quand inspection.status passe à 'terminee' ET inspection.invoiceNumber est null
  - Appeler nextInvoiceNumber(profile) → stocker dans inspection.invoiceNumber
  - Sauvegarder inspection
  - Une fois assigné, invoiceNumber n'est jamais effacé (même si statut repasse à brouillon)

Onglet Profil :
  - Bouton "Connecter Google" → googleAuth.authenticate()
  - Afficher email connecté + bouton "Déconnecter" si connecté
  - Champ "Google Client ID" (pré-rempli, modifiable)
```

#### `js/receipt-inspection.js`
```
Dans la vue Reçu (openReceipt) :
  - Badge "Facture auto-générée KZO-2026-001" si invoiceNumber existe
  - Select statut paiement : ⏳ En attente / ✅ Payé / ⚠️ En retard
  - Section "Envoyer par courriel" :
      Champ "À" : pré-rempli avec inspection.site.emailClient (modifiable)
      Champ "Sujet" : pré-rempli "Facture KZO-XXXX-NNN — Inspection préachat — [adresse]"
      Bouton "Aperçu" → ouvre le HTML de la facture dans un nouvel onglet
      Bouton "Envoyer depuis kzoinspectpro@gmail.com"
        → vérifie connexion Google (popup OAuth si besoin)
        → buildInvoiceEmail() + sendInvoiceEmail()
        → toast "✅ Facture envoyée" ou "❌ Erreur : [message]"
        → met à jour inspection.invoiceSentAt = new Date().toISOString()
```

#### `index.html`
```
Ajouter avant js/bundle.js :
  <script src="https://accounts.google.com/gsi/client" async defer></script>
```

---

## Modèle de données

### Ajouts dans `inspection`
```js
inspection.invoiceNumber   // string|null  — ex: "KZO-2026-001"
inspection.invoiceSentAt   // string|null  — ISO date du dernier envoi
inspection.paymentStatus   // string       — 'pending'|'paid'|'overdue' (défaut: 'pending')
inspection.site.emailClient // string      — courriel du client
```

### Ajouts dans `profile`
```js
profile.invoiceCounter     // number  — défaut: 1
profile.invoiceYear        // number  — défaut: année courante
profile.googleClientId     // string  — défaut: '18973787304-0vm4pu6383jn2vni2h996i0ri62iu21s.apps.googleusercontent.com'
// Note : l'état de connexion Google est dérivé de sessionStorage via googleAuth.isConnected() — pas stocké dans le profil
```

Aucune migration nécessaire — les champs manquants sont initialisés à leur défaut au premier accès.

---

## Template HTML de la facture

Corps du courriel (inline styles pour compatibilité clients mail) :

```
En-tête bleu #0c3d5c : logo KZO Inspect + numéro facture + date
Corps blanc :
  - Bloc "Facturé à" (client) + "Inspecteur" (Jean Eveillard Cazeau)
  - Tableau : Description du service (sans norme) + adresse + date visite + montant
  - Totaux : Sous-total / TPS 5% / TVQ 9,975% / TOTAL
  - Message de remerciement (texte du profil ou défaut)
  - Pied de page : KZO Inspect · Jean Eveillard Cazeau · kzoinspectpro@gmail.com
```

**Règle** : la description du service n'inclut jamais le nom de la norme (pas de "AIBQ", "BNQ", etc.).

---

## Flux Gmail API

```
1. Utilisateur clique "Envoyer depuis kzoinspectpro@gmail.com"
2. googleAuth.authenticate()
   → si token valide en sessionStorage → skip
   → sinon → popup GIS → utilisateur autorise → token stocké
3. buildInvoiceHtml(inspection, profile) → string HTML
4. buildInvoiceEmail(to, subject, htmlBody) → base64 RFC 2822
5. POST https://gmail.googleapis.com/gmail/v1/users/me/messages/send
   Authorization: Bearer <token>
   { raw: <base64> }
6. Succès → toast ✅ + inspection.invoiceSentAt = now
   Erreur → toast ❌ + message d'erreur
```

---

## Gestion des erreurs

| Cas | Comportement |
|---|---|
| GIS non chargé (hors ligne) | Bouton "Envoyer" désactivé + tooltip "Connexion requise" |
| Token expiré | Re-demande silencieuse via GIS (sans popup si déjà autorisé) |
| Erreur Gmail API 401 | Déconnexion + invite à reconnecter |
| Erreur Gmail API 4xx/5xx | Toast ❌ avec code d'erreur |
| Champ "À" vide | Validation inline avant envoi |

---

## URI de redirection à ajouter dans Google Cloud Console

```
http://127.0.0.1:8775
```

Le Client ID `18973787304-...` doit avoir cette URI dans ses origines JavaScript autorisées (pas de redirection — GIS utilise les origines, pas les redirections).

---

---

## Registre des reçus — Google Sheets

Après chaque envoi de facture réussi, envoyer les données au webhook Google Sheets existant (`SHEETS_WEBHOOK_URL` du dossier JEC : `https://script.google.com/macros/s/AKfycby6XAR9XXW...`).

### Feuille cible
Le script Apps Script dépose les données dans une **deuxième feuille** du tableur `kzoinspectpro@gmail.com`, nommée **"Reçus"** (à créer dans le script Apps Script existant si absente).

### Colonnes de la feuille "Reçus"
| Colonne | Source |
|---|---|
| Date envoi | `new Date().toLocaleDateString('fr-CA')` |
| N° facture | `inspection.invoiceNumber` |
| Client | `inspection.site.client` |
| Courriel client | `inspection.site.emailClient` |
| Adresse | `inspection.site.adresse` |
| Date inspection | `formatVisitDateTime(inspection)` |
| Montant HT | `receipt.montantHT` |
| TPS | calculé |
| TVQ | calculé |
| Total | calculé |
| Statut paiement | `inspection.paymentStatus` |

### Implémentation
- Fonction `sendReceiptToSheets(inspection, profile)` dans `js/gmail-send.js`
- Appelée après `sendInvoiceEmail()` réussit
- Utilise `fetch(SHEETS_WEBHOOK_URL, { method: 'POST', mode: 'no-cors', body: JSON.stringify(payload) })`
- Échec silencieux (ne bloque pas l'envoi du courriel) — avertissement en console seulement
- `SHEETS_WEBHOOK_URL` stocké dans `profile.sheetsWebhookUrl` (pré-rempli avec la valeur JEC dans Profil → Intégration Google)

---

## Ce qui n'est PAS dans cette spec

- Sync Google Drive (Sous-projet B — spec séparée)
- Intégration comptable (export vers un logiciel externe)
- Rappels automatiques de paiement
- Historique des envois (au-delà de `invoiceSentAt`)
