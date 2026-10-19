# M4 — Modération et historique

- taille: XL
- dépend_jalons: M1, M2, M3
- règles: RG-MOD-00..13, RG-HIS-01..04, RG-NOT-01
- référence: docs/07-plan-livraison.md §4 M4

## Objectif

Décision direct/proposé, file de modération, approbation atomique, conflits, historique en ajout seul, notifications via outbox et pg-boss, interface de modération.

## Critère de sortie

Une modification traverse le cycle complet soumission → notification → décision → application → historique ; test end-to-end vert ; un UPDATE sur l'historique est refusé par la base (S-08).

## Notes d'architecte

Étend le `HistoryWriter` de M2 (ne pas le réécrire). Le transport email remplace le transport journalisé de M1.S1.B5.

> Format des tâches : voir `pilotage/03-conventions.md`. Les lignes `- statut:` et `- règles:` sont lues par l'outil : ne pas en changer la forme. Changer un statut avec `pilotage.mjs set`.

## Sprint M4.S1 — Moteur de décision direct/proposé

### Mission M4.S1.A — Soumission

#### M4.S1.A1 — Domaine : décision direct/proposé avec permission scopée (doc 03 §5.1)
- statut: TODO · taille: S · assigné: — · validation: —
- règles: RG-MOD-00,01,09,13 · dépend: —
- livrables: modules/moderation/domain
- acceptation: tableau de cas : contributeur, éditeur, hors périmètre, admin

#### M4.S1.A2 — ModerationService.soumettre : 200/201 appliqué ou 202 en attente ; base_row_version
- statut: TODO · taille: M · assigné: — · validation: —
- règles: doc 06 §1.2 · dépend: M4.S1.A1
- livrables: modules/moderation/application
- acceptation: le client ne choisit jamais le mode

#### M4.S1.A3 — Brancher persons/unions/parent-links sur la décision (remplace l'écriture admin seule de M2)
- statut: TODO · taille: M · assigné: — · validation: —
- règles: RG-MOD-06 · dépend: M4.S1.A2
- livrables: modules/*/http
- acceptation: un contributeur obtient 202 et une proposition

#### M4.S1.A4 — Visibilité des changements en attente (auteur, modérateurs, admin) et retrait par l'auteur
- statut: TODO · taille: S · assigné: — · validation: —
- règles: RG-MOD-08 · dépend: M4.S1.A2
- livrables: modules/moderation/http
- acceptation: withdrawn conservé, jamais supprimé

## Sprint M4.S2 — Approbation, rejet, conflits

### Mission M4.S2.A — Décision

#### M4.S2.A1 — Approbation atomique : vérifier rowVersion, appliquer, FIELD_HISTORY, CHANGE_LOG, statut approved
- statut: TODO · taille: M · assigné: — · validation: —
- règles: RG-MOD-10 · dépend: M4.S1.A3
- livrables: modules/moderation/application
- acceptation: tout ou rien (test d'échec au milieu)

#### M4.S2.A2 — Rejet avec motif obligatoire ; conservation des rejets
- statut: TODO · taille: S · assigné: — · validation: —
- règles: RG-MOD-04,12 · dépend: M4.S1.A2
- livrables: modules/moderation/http
- acceptation: 422 moderation.reason_required sans motif

#### M4.S2.A3 — Conflit de version et POST /pending-changes/{id}/resolve-conflict (admin)
- statut: TODO · taille: M · assigné: — · validation: —
- règles: RG-MOD-03,11 · dépend: M4.S2.A1
- livrables: modules/moderation
- acceptation: 409 moderation.conflict ; seul l'admin tranche

#### M4.S2.A4 — Adaptateurs d'application par target_type (person, union, parent_link ; crochets document/photo pour M6)
- statut: TODO · taille: S · assigné: — · validation: —
- règles: RG-MOD-06 · dépend: M4.S2.A1
- livrables: modules/moderation/application
- acceptation: ajout d'un type sans toucher au moteur

## Sprint M4.S3 — Historique en ajout seul

### Mission M4.S3.A — Historique

#### M4.S3.A1 — HistoryService complet : FIELD_HISTORY (data_category) et CHANGE_LOG
- statut: TODO · taille: S · assigné: — · validation: —
- règles: RG-HIS-01,02 · dépend: M2.S2.A4, M4.S2.A1
- livrables: modules/history
- acceptation: étend le HistoryWriter existant

#### M4.S3.A2 — Droits SQL : rôle applicatif sans UPDATE/DELETE sur l'historique (+ test de permission base)
- statut: TODO · taille: M · assigné: — · validation: —
- règles: ADR-012 ; S-08 · dépend: M4.S3.A1
- livrables: prisma/migrations, docker/
- acceptation: un UPDATE sur l'historique est refusé par la base

#### M4.S3.A3 — GET /persons/{id}/history et GET /history filtrés par le projecteur
- statut: TODO · taille: M · assigné: — · validation: —
- règles: RG-HIS-03,04 · dépend: M4.S3.A1, M3.S2.A3
- livrables: modules/history/http
- acceptation: ancien/nouveau contenu masqué si le champ est invisible

## Sprint M4.S4 — Notifications et interface

### Mission M4.S4.A — Notifications

#### M4.S4.A1 — Outbox et worker pg-boss : événement écrit dans la même transaction que le PENDING_CHANGE
- statut: TODO · taille: M · assigné: — · validation: —
- règles: ADR-009 · dépend: M4.S1.A2
- livrables: modules/notifications/infrastructure
- acceptation: aucune notification perdue si l'envoi échoue

#### M4.S4.A2 — Notifications in-app (RG-NOT-01) et endpoints /notifications
- statut: TODO · taille: S · assigné: — · validation: —
- règles: RG-NOT-01,02 · dépend: M4.S4.A1
- livrables: modules/notifications
- acceptation: admin, co-admins, modérateurs concernés notifiés

#### M4.S4.A3 — Transport email SMTP avec modèles et reprises automatiques
- statut: TODO · taille: S · assigné: — · validation: —
- règles: ADR-009 · dépend: M4.S4.A1
- livrables: modules/notifications/infrastructure
- acceptation: échec d'envoi → nouvelle tentative

### Mission M4.S4.B — Interface

#### M4.S4.B1 — File de modération (liste, filtres)
- statut: TODO · taille: M · assigné: — · validation: —
- règles: RG-MOD-02 · dépend: M4.S2.A1, M4.S2.A2
- livrables: apps/web/src/
- acceptation: filtre par statut, branche, auteur

#### M4.S4.B2 — Détail d'une proposition : valeurs courante et proposée, décision, conflit
- statut: TODO · taille: M · assigné: — · validation: —
- règles: RG-MOD-03,11,12 · dépend: M4.S4.B1
- livrables: apps/web/src/
- acceptation: approuver/rejeter/trancher depuis l'écran

#### M4.S4.B3 — Historique de fiche et cloche de notifications
- statut: TODO · taille: S · assigné: — · validation: —
- règles: RG-HIS-03 · dépend: M4.S3.A3, M4.S4.A2
- livrables: apps/web/src/
- acceptation: historique visible selon la visibilité

### Mission M4.S4.C — Parcours complet

#### M4.S4.C1 — Test end-to-end : invitation → proposition → notification → approbation → historique
- statut: TODO · taille: M · assigné: — · validation: —
- règles: ADR-013 · dépend: M4.S4.B2, M4.S3.A2
- livrables: apps/api/test/e2e/
- acceptation: parcours vert en CI

### Mission M4.S4.Z — Clôture du jalon

#### M4.S4.Z1 — Mettre à jour la documentation, l'OpenAPI et l'état des lieux du jalon
- statut: TODO · taille: S · assigné: — · validation: —
- règles: doc 07 §2 · dépend: @jalon
- livrables: docs/, openapi.json, 01-etat-des-lieux.md
- acceptation: règle ou modèle changé → nouvelle version du doc (-vN) ; OpenAPI régénérée ; `sync` exécuté

#### M4.S4.Z2 — Déployer le jalon sur l'environnement de recette (données synthétiques)
- statut: TODO · taille: S · assigné: — · validation: —
- règles: doc 07 §8 · dépend: M4.S4.Z1
- livrables: —
- acceptation: recette = `docker compose` local acceptable tant que Q-HEB est ouverte ; aucune donnée réelle

#### M4.S4.Z3 — Valider le jalon contre son critère de sortie
- statut: TODO · taille: S · assigné: — · validation: —
- règles: doc 07 §4 · dépend: M4.S4.Z2
- livrables: validations/M4.md
- acceptation: Une modification traverse le cycle complet soumission → notification → décision → application → historique ; test end-to-end vert ; un UPDATE sur l'historique est refusé par la base (S-08).
