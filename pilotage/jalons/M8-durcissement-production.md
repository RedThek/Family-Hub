# M8 — Durcissement, anonymisation et mise en production

- taille: L
- dépend_jalons: M1, M2, M3, M4, M5, M6, M7
- règles: RG-HIS-05 ; doc 05 §9 à §12
- référence: docs/07-plan-livraison.md §4 M8

## Objectif

Anonymisation, durcissement, revue de la checklist S-01..S-13, sauvegardes et restauration, procédure d'urgence, déploiement en production.

## Critère de sortie

Toutes les lignes de la checklist du doc 05 §12 sont vérifiées ; la restauration est démontrée ; l'anonymisation est testée sur données de test ; au moins un co-admin désigné.

## Notes d'architecte

Tâches BLOCKED au départ : Q-HEB (hébergement), P24 (import) et J-01 (cadre juridique). Voir questions-ouvertes.md.

> Format des tâches : voir `pilotage/03-conventions.md`. Les lignes `- statut:` et `- règles:` sont lues par l'outil : ne pas en changer la forme. Changer un statut avec `pilotage.mjs set`.

## Sprint M8.S1 — Anonymisation

### Mission M8.S1.A — Procédure d'effacement

#### M8.S1.A1 — Rôle SQL d'administration distinct du rôle applicatif
- statut: TODO · taille: M · assigné: — · validation: —
- règles: ADR-012 ; doc 05 §9.2 · dépend: —
- livrables: prisma/migrations, docs
- acceptation: le rôle applicatif ne peut pas exécuter la procédure

#### M8.S1.A2 — POST /admin/persons/{id}/anonymize : étapes 1 à 6, confirmation explicite, irréversible
- statut: TODO · taille: M · assigné: — · validation: —
- règles: RG-HIS-05 · dépend: M8.S1.A1
- livrables: modules/genealogy, modules/history
- acceptation: liens de parenté conservés ; événement person_anonymized sans valeur

#### M8.S1.A3 — Purge des valeurs de FIELD_HISTORY et du payload des PENDING_CHANGE
- statut: TODO · taille: M · assigné: — · validation: —
- règles: RG-HIS-05 · dépend: M8.S1.A1
- livrables: modules/history, modules/moderation
- acceptation: métadonnées (qui, quand, champ) conservées

#### M8.S1.A4 — Suppression physique de la photo et des documents
- statut: TODO · taille: S · assigné: — · validation: —
- règles: RG-HIS-05 · dépend: M8.S1.A2
- livrables: modules/documents
- acceptation: objets absents du stockage

#### M8.S1.A5 — Tests S-13 sur données de test
- statut: TODO · taille: S · assigné: — · validation: —
- règles: S-13 · dépend: M8.S1.A2, M8.S1.A3, M8.S1.A4
- livrables: apps/api/test/
- acceptation: aucune valeur personnelle après anonymisation

## Sprint M8.S2 — Durcissement

### Mission M8.S2.B — Sécurité applicative

#### M8.S2.B1 — En-têtes de sécurité, CSP strict, HSTS, CORS en liste blanche
- statut: TODO · taille: S · assigné: — · validation: —
- règles: S-09 · dépend: —
- livrables: apps/api/src/main.ts
- acceptation: scan des en-têtes OK

#### M8.S2.B2 — Limitation de débit stricte (connexion, invitation, recherche, public)
- statut: TODO · taille: S · assigné: — · validation: —
- règles: S-09 · dépend: —
- livrables: apps/api
- acceptation: seuils testés

#### M8.S2.B3 — Session admin plus courte et email de nouvel appareil
- statut: TODO · taille: S · assigné: — · validation: —
- règles: doc 05 §6.2 ; P19 · dépend: —
- livrables: modules/identity-access
- acceptation: email envoyé à la première connexion depuis un nouvel appareil

#### M8.S2.B4 — Dependabot, npm audit en CI, verrouillage des versions
- statut: TODO · taille: S · assigné: — · validation: —
- règles: doc 05 §8 · dépend: —
- livrables: .github/
- acceptation: alerte sur dépendance vulnérable

#### M8.S2.B5 — Alertes de base (échecs répétés, pics publics, création d'admin, tentative de retrait du dernier admin)
- statut: TODO · taille: S · assigné: — · validation: —
- règles: doc 05 §10 · dépend: —
- livrables: modules/identity-access
- acceptation: alerte reçue sur cas simulé

#### M8.S2.B6 — Revue de la checklist S-01..S-13 : une preuve par ligne
- statut: TODO · taille: M · assigné: — · validation: —
- règles: S-01..S-13 · dépend: M8.S2.B1, M8.S2.B2, M8.S2.B3, M8.S2.B4, M8.S2.B5, M8.S1.A5
- livrables: validations/M8.S2.B6.md
- acceptation: 13 lignes vérifiées avec preuve

## Sprint M8.S3 — Exploitation et production

### Mission M8.S3.C — Exploitation

#### M8.S3.C1 — Sauvegardes chiffrées quotidiennes (base et objets), copie hors site
- statut: TODO · taille: M · assigné: — · validation: —
- règles: S-12 ; doc 05 §11.1 · dépend: —
- livrables: docs/, scripts/
- acceptation: RPO 24 h documenté

#### M8.S3.C2 — Test de restauration démontré sur environnement vierge
- statut: TODO · taille: M · assigné: — · validation: —
- règles: S-12 · dépend: M8.S3.C1
- livrables: validations/M8.S3.C2.md
- acceptation: RTO 48 h tenu ; procédure rejouable

#### M8.S3.C3 — Procédure d'urgence « bris de glace » documentée
- statut: TODO · taille: S · assigné: — · validation: —
- règles: doc 05 §11.2 · dépend: —
- livrables: docs/
- acceptation: réinitialisation d'un admin testée

#### M8.S3.C4 — Déploiement en production (ADR-014)
- statut: BLOCKED · taille: M · assigné: — · validation: —
- règles: ADR-014 · dépend: M8.S2.B6, M8.S3.C2
- livrables: docs/, workflows
- acceptation: production accessible en HTTPS
- notes: Q-HEB : hébergement et service S3 non tranchés (Vercel/Render visés)

#### M8.S3.C5 — Saisie des données de départ (import seulement si P24 le décide)
- statut: BLOCKED · taille: M · assigné: — · validation: —
- règles: P24 · dépend: M8.S3.C4
- livrables: —
- acceptation: données saisies en production uniquement
- notes: dépend du déploiement S3.C4 ; aucun import au MVP (P24 tranchée : saisie manuelle)

#### M8.S3.C6 — Co-admin désigné et vérifié
- statut: TODO · taille: S · assigné: — · validation: —
- règles: RG-CON-01 ; S-11 · dépend: —
- livrables: validations/M8.S3.C6.md
- acceptation: le co-admin reprend l'administration sans l'admin d'origine

#### M8.S3.C7 — Revue juridique (J-01) avant ouverture hors du cercle initial
- statut: BLOCKED · taille: S · assigné: — · validation: —
- règles: J-01 ; doc 05 §9.1 · dépend: —
- livrables: decisions/
- acceptation: avis consigné
- notes: J-01 ouverte : cadre juridique dépend de la résidence des membres

### Mission M8.S3.Z — Clôture du jalon

#### M8.S3.Z1 — Mettre à jour la documentation, l'OpenAPI et l'état des lieux du jalon
- statut: TODO · taille: S · assigné: — · validation: —
- règles: doc 07 §2 · dépend: @jalon
- livrables: docs/, openapi.json, 01-etat-des-lieux.md
- acceptation: règle ou modèle changé → nouvelle version du doc (-vN) ; OpenAPI régénérée ; `sync` exécuté

#### M8.S3.Z2 — Déployer le jalon sur l'environnement de recette (données synthétiques)
- statut: TODO · taille: S · assigné: — · validation: —
- règles: doc 07 §8 · dépend: M8.S3.Z1
- livrables: —
- acceptation: recette = `docker compose` local acceptable tant que Q-HEB est ouverte ; aucune donnée réelle

#### M8.S3.Z3 — Valider le jalon contre son critère de sortie
- statut: TODO · taille: S · assigné: — · validation: —
- règles: doc 07 §4 · dépend: M8.S3.Z2
- livrables: validations/M8.md
- acceptation: Toutes les lignes de la checklist du doc 05 §12 sont vérifiées ; la restauration est démontrée ; l'anonymisation est testée sur données de test ; au moins un co-admin désigné.
