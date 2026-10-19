# M1 — Identité et accès

- taille: L
- dépend_jalons: M0
- règles: RG-ACC-01..03, RG-ROL-01..04, RG-CON-01..03 ; doc 05 §5, §6
- référence: docs/07-plan-livraison.md §4 M1

## Objectif

Comptes, sessions, invitations, approbation, AuthorizationService, rôles et permissions en base, journal de sécurité, amorçage admin/co-admin, interface minimale.

## Critère de sortie

Un invité devient un compte approuvé ; une route sans garde est refusée par défaut (S-03) ; impossible de retirer le dernier admin (CHK-06).

## Notes d'architecte

Le schéma Prisma de M0 n'a **pas** de table de session ni de journal de sécurité : ils sont créés ici (S1.A2, S2.B1). `package.json` de l'API n'a ni argon2, ni helmet, ni swagger, ni throttler : S1.A1. Q-HIST : la revendication de profil doit écrire dans CHANGE_LOG via le service du module `history` (port d'écriture minimal).

> Format des tâches : voir `pilotage/03-conventions.md`. Les lignes `- statut:` et `- règles:` sont lues par l'outil : ne pas en changer la forme. Changer un statut avec `pilotage.mjs set`.

## Sprint M1.S1 — Socle d'authentification

### Mission M1.S1.A — Dépendances et données

#### M1.S1.A1 — Ajouter les dépendances (argon2, helmet, @nestjs/swagger, @nestjs/throttler) et servir /api/v1/docs
- statut: TODO · taille: S · assigné: — · validation: —
- règles: ADR-006,ADR-007 · dépend: —
- livrables: apps/api/package.json, main.ts
- acceptation: `pnpm build` vert ; /api/v1/docs servi ; helmet actif

#### M1.S1.A2 — Modèle Session (+ migration) : sessions serveur en base
- statut: TODO · taille: S · assigné: — · validation: —
- règles: ADR-007 ; doc 05 §6.1 · dépend: M1.S1.A1
- livrables: prisma/schema.prisma, migration
- acceptation: expiration d'inactivité et maximale ; révocable

#### M1.S1.A3 — Seed idempotent des rôles, permissions et politiques (doc 03 §4.2)
- statut: TODO · taille: S · assigné: — · validation: —
- règles: RG-ROL-01,03 · dépend: —
- livrables: prisma/seed.ts, script prisma:seed
- acceptation: relancer le seed ne duplique rien ; matrice identique au doc 03 §4.2

### Mission M1.S1.B — Authentification

#### M1.S1.B1 — Argon2id et service de connexion (message identique compte inconnu/mot de passe incorrect)
- statut: TODO · taille: S · assigné: — · validation: —
- règles: S-05 ; doc 05 §6.1 · dépend: M1.S1.A1, M1.S1.A2
- livrables: modules/identity-access/application
- acceptation: test : message et temps de réponse indifférenciés

#### M1.S1.B2 — Cookie de session HttpOnly/Secure/SameSite=Lax et protection CSRF (X-CSRF-Token)
- statut: TODO · taille: S · assigné: — · validation: —
- règles: S-09 ; doc 06 §1 · dépend: M1.S1.B1
- livrables: modules/identity-access/http
- acceptation: POST sans jeton → 403 auth.csrf_missing

#### M1.S1.B3 — Endpoints /auth/login, /auth/logout, /auth/me
- statut: TODO · taille: S · assigné: — · validation: —
- règles: doc 06 §3.1 · dépend: M1.S1.B2
- livrables: modules/identity-access/http
- acceptation: session créée/détruite ; /auth/me donne rôles et niveau d'accès

#### M1.S1.B4 — Limitation des tentatives par compte et par adresse
- statut: TODO · taille: S · assigné: — · validation: —
- règles: doc 05 §6.1 · dépend: M1.S1.B1
- livrables: modules/identity-access
- acceptation: 429 + Retry-After après seuil ; test

#### M1.S1.B5 — Réinitialisation de mot de passe (jeton à usage unique ; transport email journalisé en attendant M4)
- statut: TODO · taille: M · assigné: — · validation: —
- règles: doc 05 §6.3 · dépend: M1.S1.B3
- livrables: modules/identity-access
- acceptation: jeton haché, expirant ; sessions révoquées au changement

## Sprint M1.S2 — Autorisation et journal de sécurité

### Mission M1.S2.A — AuthorizationService

#### M1.S2.A1 — Domaine : fonction permission() pure (scope global) + tests
- statut: TODO · taille: S · assigné: — · validation: —
- règles: ADR-008 ; RG-ROL-02 · dépend: M1.S1.A3
- livrables: modules/identity-access/domain
- acceptation: tests unitaires ; aucune dépendance Nest/Prisma

#### M1.S2.A2 — Garde globale refus par défaut et décorateur @Public (liste blanche)
- statut: TODO · taille: S · assigné: — · validation: —
- règles: S-03 · dépend: M1.S2.A1, M1.S1.B3
- livrables: modules/identity-access/http
- acceptation: toute route non listée renvoie 403 (test)

#### M1.S2.A3 — Attributions scopées : POST/DELETE /role-assignments, GET /roles
- statut: TODO · taille: M · assigné: — · validation: —
- règles: RG-ROL-02,06 ; CHK-06 · dépend: M1.S2.A2
- livrables: modules/identity-access
- acceptation: dernier admin non révocable (rule.last_admin) ; seuls admin/co-admin attribuent

#### M1.S2.A4 — Mécanisme de chargement des ROLE_POLICY (sans politique métier)
- statut: TODO · taille: S · assigné: — · validation: —
- règles: RG-ROL-07 · dépend: M1.S2.A1
- livrables: modules/identity-access
- acceptation: politique lue depuis la base et exposée au domaine

### Mission M1.S2.B — Journal de sécurité

#### M1.S2.B1 — Modèle SecurityLog (+ migration) et service d'écriture sans donnée personnelle
- statut: TODO · taille: S · assigné: — · validation: —
- règles: S-10 ; doc 05 §10 · dépend: M1.S1.A2
- livrables: prisma, modules/identity-access/infrastructure
- acceptation: colonnes limitées à des identifiants

#### M1.S2.B2 — Journaliser connexions, déconnexions, mots de passe, rôles, refus d'autorisation
- statut: TODO · taille: S · assigné: — · validation: —
- règles: doc 05 §10 · dépend: M1.S2.B1, M1.S2.A2
- livrables: modules/identity-access
- acceptation: aucun mot de passe, jeton ni nom dans les journaux (test)

#### M1.S2.B3 — GET /admin/security-log (admin)
- statut: TODO · taille: S · assigné: — · validation: —
- règles: doc 06 §3.7 · dépend: M1.S2.B1
- livrables: modules/identity-access/http
- acceptation: réservé à l'admin

## Sprint M1.S3 — Comptes, invitations, amorçage

### Mission M1.S3.A — Invitations

#### M1.S3.A1 — POST /invitations : jeton long haché, usage unique, expiration, lié à l'email
- statut: TODO · taille: S · assigné: — · validation: —
- règles: RG-ACC-01 ; S-06 · dépend: M1.S2.A2
- livrables: modules/identity-access
- acceptation: jeton jamais stocké en clair ; second usage refusé

#### M1.S3.A2 — POST /invitations/{token}/accept → compte pending_approval
- statut: TODO · taille: S · assigné: — · validation: —
- règles: RG-ACC-03 · dépend: M1.S3.A1
- livrables: modules/identity-access
- acceptation: compte créé sans accès approuvé

#### M1.S3.A3 — GET /invitations et DELETE /invitations/{id}
- statut: TODO · taille: S · assigné: — · validation: —
- règles: doc 06 §3.1 · dépend: M1.S3.A1
- livrables: modules/identity-access/http
- acceptation: révocation effective

### Mission M1.S3.B — Comptes et amorçage

#### M1.S3.B1 — POST /accounts/{id}/approve et /suspend (la suspension révoque les sessions)
- statut: TODO · taille: S · assigné: — · validation: —
- règles: RG-ACC-03 ; P9 · dépend: M1.S3.A2, M1.S2.A3
- livrables: modules/identity-access
- acceptation: sessions invalidées immédiatement

#### M1.S3.B2 — POST /accounts/{id}/claim : rattachement à une Person, tracé dans CHANGE_LOG
- statut: TODO · taille: S · assigné: — · validation: —
- règles: RG-ACC-02 · dépend: M1.S3.B1
- livrables: modules/identity-access
- acceptation: person_id unique ; événement dans CHANGE_LOG via le service du module history (port minimal)

#### M1.S3.B3 — Commande d'amorçage : premier admin et co-admin
- statut: TODO · taille: S · assigné: — · validation: —
- règles: RG-CON-01,03 · dépend: M1.S2.A3
- livrables: apps/api/src/cli/
- acceptation: idempotente ; refuse un secret faible

#### M1.S3.B4 — Bloquer l'approbation de comptes non-admin tant qu'aucun co-admin n'existe
- statut: TODO · taille: S · assigné: — · validation: —
- règles: RG-CON-03 ; S-11 · dépend: M1.S3.B3
- livrables: modules/identity-access
- acceptation: test CHK-06 et RG-CON-03

### Mission M1.S3.C — Interface minimale

#### M1.S3.C1 — Pages connexion, acceptation d'invitation, réinitialisation
- statut: TODO · taille: M · assigné: — · validation: —
- règles: — · dépend: M1.S1.B3, M1.S3.A2
- livrables: apps/web/src/
- acceptation: parcours manuel de bout en bout

#### M1.S3.C2 — Administration minimale : comptes, rôles, invitations
- statut: TODO · taille: M · assigné: — · validation: —
- règles: — · dépend: M1.S3.B1, M1.S2.A3
- livrables: apps/web/src/
- acceptation: approuver/suspendre/attribuer depuis l'interface

### Mission M1.S3.D — Qualité du jalon

#### M1.S3.D1 — Tests S-03, S-05, S-06, CHK-06, CSRF, expiration et révocation de session
- statut: TODO · taille: M · assigné: — · validation: —
- règles: S-03,05,06,11 · dépend: M1.S3.A2, M1.S3.B4
- livrables: apps/api/src/**/*.spec.ts
- acceptation: tests nommés d'après les règles ; verts en CI

#### M1.S3.D2 — Générer openapi.json versionné et test de contrat en CI
- statut: TODO · taille: S · assigné: — · validation: —
- règles: ADR-006 ; doc 06 §8 · dépend: M1.S1.A1
- livrables: apps/api/openapi.json, test
- acceptation: le test échoue si la spec générée diffère du fichier

### Mission M1.S3.Z — Clôture du jalon

#### M1.S3.Z1 — Mettre à jour la documentation, l'OpenAPI et l'état des lieux du jalon
- statut: TODO · taille: S · assigné: — · validation: —
- règles: doc 07 §2 · dépend: @jalon
- livrables: docs/, openapi.json, 01-etat-des-lieux.md
- acceptation: règle ou modèle changé → nouvelle version du doc (-vN) ; OpenAPI régénérée ; `sync` exécuté

#### M1.S3.Z2 — Déployer le jalon sur l'environnement de recette (données synthétiques)
- statut: TODO · taille: S · assigné: — · validation: —
- règles: doc 07 §8 · dépend: M1.S3.Z1
- livrables: —
- acceptation: recette = `docker compose` local acceptable tant que Q-HEB est ouverte ; aucune donnée réelle

#### M1.S3.Z3 — Valider le jalon contre son critère de sortie
- statut: TODO · taille: S · assigné: — · validation: —
- règles: doc 07 §4 · dépend: M1.S3.Z2
- livrables: validations/M1.md
- acceptation: Un invité devient un compte approuvé ; une route sans garde est refusée par défaut (S-03) ; impossible de retirer le dernier admin (CHK-06).
