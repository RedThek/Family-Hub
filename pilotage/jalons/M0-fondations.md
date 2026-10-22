# M0 — Fondations du dépôt

- taille: M
- dépend_jalons: —
- règles: ADR-002, ADR-004, ADR-005, ADR-014
- référence: docs/07-plan-livraison.md §4 M0

## Objectif

Monorepo, docker-compose, CI, schéma Prisma de base, linter d'architecture, page santé.

## Critère de sortie

`docker compose up` démarre tout ; la CI passe sur une branche vide ; le test d'architecture échoue si un module en importe un autre interdit.

## Notes d'architecte

Le sprint S1 documente ce qui existe déjà dans le dépôt : constaté **par lecture des fichiers, sans exécution**. Les tâches sont donc en `REVIEW` : un agent doit les valider (S2.A) avant `DONE`.

> Format des tâches : voir `pilotage/03-conventions.md`. Les lignes `- statut:` et `- règles:` sont lues par l'outil : ne pas en changer la forme. Changer un statut avec `pilotage.mjs set`.

## Sprint M0.S1 — Fondations constatées dans le dépôt (à valider)

### Mission M0.S1.A — Monorepo et outillage

#### M0.S1.A1 — Monorepo pnpm (apps/api, apps/web, packages/shared)
- statut: DONE · taille: S · assigné: — · validation: validations/M0.S1.A1.md
- règles: ADR-002,ADR-005 · dépend: —
- livrables: package.json, pnpm-workspace.yaml, .npmrc, .nvmrc, tsconfig.base.json
- acceptation: `pnpm install --frozen-lockfile` réussit ; 3 workspaces reconnus

#### M0.S1.A2 — Configuration TypeScript et ESLint par workspace
- statut: DONE · taille: S · assigné: — · validation: validations/M0.S1.A2.md
- règles: EA-08 · dépend: —
- livrables: apps/*/.eslintrc.cjs, tsconfig*.json
- acceptation: `pnpm lint` passe sur les 3 workspaces

#### M0.S1.A3 — Paquet partagé @family-hub/shared (APP_NAME, API_PREFIX, HEALTH_PATH)
- statut: DONE · taille: S · assigné: — · validation: validations/M0.S1.A3.md
- règles: ADR-002 · dépend: —
- livrables: packages/shared/
- acceptation: `pnpm --filter @family-hub/shared build` réussit

### Mission M0.S1.B — Infrastructure locale

#### M0.S1.B1 — docker-compose : postgres, minio, minio-init (bucket privé), api
- statut: DONE · taille: S · assigné: gemini · validation: validations/M0.S1.B1-r2.md
- règles: ADR-010,ADR-014 · dépend: —
- livrables: docker-compose.yml
- acceptation: `docker compose up --build` démarre ; bucket `family-hub` privé
- notes: Echec docker compose: images minio supprimees de Docker Hub

#### M0.S1.B2 — Dockerfile API multi-étapes avec `prisma migrate deploy` au démarrage
- statut: REVIEW · taille: S · assigné: — · validation: —
- règles: ADR-014 · dépend: —
- livrables: apps/api/Dockerfile, .dockerignore
- acceptation: image construite ; migration appliquée au démarrage

#### M0.S1.B3 — Variables d'environnement et exclusion des secrets
- statut: REVIEW · taille: S · assigné: — · validation: —
- règles: doc 05 §8 · dépend: —
- livrables: .env.example, .gitignore
- acceptation: aucun secret versionné ; .env.example complet

### Mission M0.S1.C — Données

#### M0.S1.C1 — Schéma Prisma initial aligné sur le doc 03 (v0.3)
- statut: REVIEW · taille: S · assigné: — · validation: —
- règles: ADR-004 · dépend: —
- livrables: apps/api/prisma/schema.prisma
- acceptation: `prisma validate` OK ; toutes les entités du doc 03 §2 présentes

#### M0.S1.C2 — Migration init et contraintes CHECK (CHK-02, CHK-04, CHK-05)
- statut: REVIEW · taille: S · assigné: — · validation: —
- règles: CHK-02,04,05 · dépend: —
- livrables: apps/api/prisma/migrations/20261019000000_init/
- acceptation: migration sur base vierge réussie ; les 3 CHECK refusent les cas invalides

### Mission M0.S1.D — Qualité et santé

#### M0.S1.D1 — CI GitHub Actions (lint, lint:arch, prisma generate, test, build, migration base vierge)
- statut: REVIEW · taille: S · assigné: — · validation: —
- règles: ADR-014 · dépend: —
- livrables: .github/workflows/ci.yml
- acceptation: CI verte sur une branche vide

#### M0.S1.D2 — Linter d'architecture dependency-cruiser et test architecture.spec.ts
- statut: REVIEW · taille: S · assigné: — · validation: —
- règles: doc 04 §3 · dépend: —
- livrables: apps/api/.dependency-cruiser.cjs, apps/api/test/architecture.spec.ts
- acceptation: un import genealogy→moderation fait échouer le test

#### M0.S1.D3 — Endpoint GET /api/v1/health et test unitaire
- statut: REVIEW · taille: S · assigné: — · validation: —
- règles: — · dépend: —
- livrables: apps/api/src/health/
- acceptation: ok si base joignable, 503 sinon (test)

#### M0.S1.D4 — SPA minimale et test de fumée
- statut: REVIEW · taille: S · assigné: — · validation: —
- règles: ADR-005 · dépend: —
- livrables: apps/web/src/App.tsx, App.test.tsx
- acceptation: `pnpm --filter @family-hub/web test` vert

#### M0.S1.D5 — Squelette des 7 modules NestJS et des couches domain/application/infrastructure/http
- statut: REVIEW · taille: S · assigné: — · validation: —
- règles: doc 04 §3, §5 · dépend: —
- livrables: apps/api/src/modules/*
- acceptation: AppModule importe les 7 modules ; couches présentes

## Sprint M0.S2 — Validation exécutée et assainissement

### Mission M0.S2.A — Exécution de la validation M0

#### M0.S2.A1 — Démarrage à froid : clone propre → `docker compose up --build` → /api/v1/health ok
- statut: TODO · taille: S · assigné: — · validation: —
- règles: critère de sortie M0 · dépend: M0.S1.B1, M0.S1.B2, M0.S1.B3
- livrables: validations/M0.S2.A1.md
- acceptation: commandes et sorties consignées ; health = ok/up

#### M0.S2.A2 — Exécuter `pnpm lint`, `pnpm lint:arch`, `pnpm test`, `pnpm build` et consigner les résultats
- statut: TODO · taille: S · assigné: — · validation: —
- règles: — · dépend: M0.S1.A1, M0.S1.A2, M0.S1.A3, M0.S1.D2, M0.S1.D3, M0.S1.D4, M0.S1.D5
- livrables: validations/M0.S2.A2.md
- acceptation: 4 commandes vertes ou écarts listés dans 01-etat-des-lieux.md

#### M0.S2.A3 — Migration sur base vierge et CI verte sur branche vide
- statut: TODO · taille: S · assigné: — · validation: —
- règles: CHK-02,04,05 · dépend: M0.S1.C1, M0.S1.C2, M0.S1.D1
- livrables: validations/M0.S2.A3.md
- acceptation: lien du run CI vert ; 3 CHECK éprouvés par SQL

#### M0.S2.A4 — Éprouver le linter d'architecture sur un import interdit
- statut: TODO · taille: S · assigné: — · validation: —
- règles: doc 04 §3 · dépend: M0.S1.D2
- livrables: validations/M0.S2.A4.md
- acceptation: échec constaté avec la règle genealogy-must-not-import-moderation, puis fixture supprimée

### Mission M0.S2.B — Assainissement documentaire

#### M0.S2.B1 — Traiter docs/06-api.md (fichier vide) : supprimer ou rediriger vers 06-api-v2.md
- statut: TODO · taille: S · assigné: — · validation: —
- règles: — · dépend: —
- livrables: docs/06-api.md
- acceptation: plus de fichier vide ambigu ; README docs cohérent

#### M0.S2.B2 — Fixer la convention de version des documents (suffixe -vN vs numéro interne vN.N) et l'écrire dans README
- statut: TODO · taille: S · assigné: — · validation: —
- règles: — · dépend: —
- livrables: README.md, docs/
- acceptation: règle d'une phrase ; table du README conforme

#### M0.S2.B3 — Marquer .agents/.copilot/08-recommandations-techniques.md comme non normatif (en-tête daté)
- statut: TODO · taille: S · assigné: — · validation: —
- règles: — · dépend: —
- livrables: .agents/.copilot/08-recommandations-techniques.md
- acceptation: en-tête précisant que docs/ prime ; mémo antérieur à plusieurs décisions

### Mission M0.S2.C — Intégration du système de pilotage

#### M0.S2.C1 — Ajouter le script racine `pilotage` dans package.json et vérifier `pnpm pilotage check`
- statut: TODO · taille: S · assigné: — · validation: —
- règles: — · dépend: —
- livrables: package.json
- acceptation: `pnpm pilotage reprise` et `pnpm pilotage check` fonctionnent

#### M0.S2.C2 — Ajouter `pilotage check` à la CI (job séparé)
- statut: TODO · taille: S · assigné: — · validation: —
- règles: ADR-014 · dépend: M0.S2.C1
- livrables: .github/workflows/ci.yml
- acceptation: un état incohérent (DONE sans validation) fait échouer le job

#### M0.S2.C3 — Test de reprise à froid : un agent vierge reprend le travail avec `reprise` seulement
- statut: TODO · taille: S · assigné: — · validation: —
- règles: — · dépend: M0.S2.C1
- livrables: validations/M0.S2.C3.md
- acceptation: l'agent identifie la prochaine tâche sans aide extérieure ; lacunes du protocole corrigées

### Mission M0.S2.Z — Clôture du jalon

#### M0.S2.Z1 — Mettre à jour la documentation, l'OpenAPI et l'état des lieux du jalon
- statut: TODO · taille: S · assigné: — · validation: —
- règles: doc 07 §2 · dépend: @jalon
- livrables: docs/, openapi.json, 01-etat-des-lieux.md
- acceptation: règle ou modèle changé → nouvelle version du doc (-vN) ; OpenAPI régénérée ; `sync` exécuté

#### M0.S2.Z2 — Déployer le jalon sur l'environnement de recette (données synthétiques)
- statut: TODO · taille: S · assigné: — · validation: —
- règles: doc 07 §8 · dépend: M0.S2.Z1
- livrables: —
- acceptation: recette = `docker compose` local acceptable tant que Q-HEB est ouverte ; aucune donnée réelle

#### M0.S2.Z3 — Valider le jalon contre son critère de sortie
- statut: TODO · taille: S · assigné: — · validation: —
- règles: doc 07 §4 · dépend: M0.S2.Z2
- livrables: validations/M0.md
- acceptation: `docker compose up` démarre tout ; la CI passe sur une branche vide ; le test d'architecture échoue si un module en importe un autre interdit.
