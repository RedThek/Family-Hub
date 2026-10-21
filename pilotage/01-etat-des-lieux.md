# 01 — État des lieux

> Instantané du projet pour tout agent qui arrive. Les blocs `AUTO` sont régénérés par `node pilotage/outils/pilotage.mjs sync` ; **ne pas les éditer à la main**. Les autres sections s'enrichissent par **ajouts datés** (jamais de réécriture silencieuse).

- dernière mise à jour (UTC): 2026-10-21T11:13:56Z
- mise à jour par: claude (architecte)
- jalon courant: M0
- sprint courant: M0.S2
- branche de référence: main

## 1. Avancement

<!-- AUTO:AVANCEMENT -->
| Jalon | Tâches | DONE | REVIEW | DOING | BLOCKED | TODO | % |
|---|--:|--:|--:|--:|--:|--:|--:|
| **M0** Fondations du dépôt | 26 | 3 | 9 | 1 | 0 | 13 | 12 % |
| **SP1** Spike : closure table | 6 | 0 | 0 | 0 | 0 | 6 | 0 % |
| **SP2** Spike : rendu de l'arbre | 6 | 0 | 0 | 0 | 0 | 6 | 0 % |
| **SP3** Spike : projecteur de visibilité | 4 | 0 | 0 | 0 | 0 | 4 | 0 % |
| **M1** Identité et accès | 29 | 0 | 0 | 0 | 0 | 29 | 0 % |
| **M2** Cœur généalogique | 23 | 0 | 0 | 0 | 0 | 23 | 0 % |
| **M3** Visibilité et page publique | 20 | 0 | 0 | 0 | 0 | 20 | 0 % |
| **M4** Modération et historique | 21 | 0 | 0 | 0 | 0 | 21 | 0 % |
| **M5** Branches, rôles scopés et succession | 19 | 0 | 0 | 0 | 0 | 19 | 0 % |
| **M6** Photos et documents | 14 | 0 | 0 | 0 | 0 | 14 | 0 % |
| **M7** Recherche, doublons et arbre personnalisé | 14 | 0 | 0 | 0 | 0 | 14 | 0 % |
| **M8** Durcissement, anonymisation et mise en production | 21 | 0 | 0 | 0 | 3 | 18 | 0 % |
| **Total** | 203 | 3 | 9 | 1 | 3 | 187 | 1 % |
<!-- /AUTO:AVANCEMENT -->

## 2. Claims et reprises

<!-- AUTO:CLAIMS -->
- `M0.S1.B1` — gemini (validation) depuis 2026-10-21T10:04:01Z, heartbeat 2026-10-21T10:04:01Z
<!-- /AUTO:CLAIMS -->

## 3. Dernières sessions

<!-- AUTO:SESSIONS -->
- `journal/20261021-1004-gemini-validation-m0-s1-b1.md`
- `journal/20261021-0928-gemini-validation-m0-s1-a3.md`
- `journal/20261019-2241-copilot-validation-m0-s1-a2.md`
- `journal/20261019-2117-copilot-validation-m0-a1.md`
- `journal/20261019-0000-claude-initialisation-pilotage.md`
<!-- /AUTO:SESSIONS -->

## 4. Prochaines tâches éligibles

<!-- AUTO:PROCHAINES -->
- **M0.S2.B1** — Traiter docs/06-api.md (fichier vide) : supprimer ou rediriger vers 06-api-v2.md (taille S)
- **M0.S2.B2** — Fixer la convention de version des documents (suffixe -vN vs numéro interne vN.N) et l'écrire dans README (taille S)
- **M0.S2.B3** — Marquer .agents/.copilot/08-recommandations-techniques.md comme non normatif (en-tête daté) (taille S)
- **M0.S2.C1** — Ajouter le script racine `pilotage` dans package.json et vérifier `pnpm pilotage check` (taille S)
- **SP1.S1.A1** — Générateur d'arbre synthétique (5 000 personnes, 8 générations, polygamie, adoptions, cousins, demi-fratries) (taille S)
<!-- /AUTO:PROCHAINES -->

## 5. Ce qui existe dans le dépôt

*Constat du 2026-10-19, par lecture des fichiers, sans exécution. Rien ici n'est prouvé tant que M0.S2.A n'est pas validé.*

- **Monorepo pnpm** : `apps/api` (NestJS 11, Prisma 6), `apps/web` (React 19, Vite 7, Vitest), `packages/shared` (`APP_NAME`, `API_PREFIX`, `HEALTH_PATH`). Node ≥ 22, pnpm 9.15.9.
- **API** : `AppModule` importe `PrismaModule` (global), `HealthModule` et 7 modules métier **vides** (`@Module({})`) dont chacun a ses couches `domain/application/infrastructure/http` réduites à `export {}`. `main.ts` : préfixe `api/v1`, CORS avec credentials, `ValidationPipe` strict (whitelist, forbidNonWhitelisted, transform). Seul endpoint : `GET /api/v1/health` (test unitaire présent).
- **Données** : `schema.prisma` et migration `20261019000000_init` couvrant les entités du doc 03 ; contraintes CHECK CHK-02, CHK-04, CHK-05 en SQL ; unicité parent→enfant (CHK-03) ; PK `(ancestor, descendant, path_type)` de la closure.
- **Qualité** : ESLint par workspace ; `dependency-cruiser` (5 règles dont 3 « jamais vers moderation », pas d'import infrastructure croisé, domaine sans Nest/Prisma) et `test/architecture.spec.ts` ; CI GitHub Actions (lint, lint:arch, prisma generate, test, build, migration sur base vierge).
- **Infra locale** : `docker-compose.yml` (postgres 16, minio, minio-init bucket privé, api) ; `apps/api/Dockerfile` (migrate deploy au démarrage). L'interface web se lance hors Compose.
- **Web** : SPA minimale qui interroge `/api/v1/health`, un test de fumée.
- **Docs** : versions courantes dans `README.md` (01-v2, 02-v5, 03-v3, 04-v2, 05-v2, 06-v2, 07). Anciennes versions conservées.
- **Absent (normal à ce stade)** : authentification, sessions, seed rôles/permissions, extensions PostgreSQL (`pg_trgm`…), rôles SQL distincts, worker, client S3, Swagger, OpenAPI versionnée, matrice de visibilité.

## 6. Écarts constatés (plan et docs ↔ dépôt)

| # | Date | Écart | Traité par | Statut |
|---|---|---|---|---|
| ECART-001 | 2026-10-19 | `docs/06-api.md` est un fichier **vide** ; la version courante est `06-api-v2.md` | M0.S2.B1 | ouvert |
| ECART-002 | 2026-10-19 | Numérotation des versions incohérente : le fichier `03-modele-domaine-v3.md` porte « v0.3 » alors que `05-…-v2` le cite en « v0.4 » et `02` en « v0.5 » ; `07` n'a pas de suffixe | M0.S2.B2 (Q-DOCV) | ouvert |
| ECART-003 | 2026-10-19 | `.agents/.copilot/08-recommandations-techniques.md` (en anglais) liste comme ouvertes des questions déjà tranchées : risque de contredire `docs/` | M0.S2.B3 | ouvert |
| ECART-004 | 2026-10-19 | Aucune table de **session** ni de **journal de sécurité** dans le schéma alors que ADR-007 et doc 05 §10 les exigent | M1.S1.A2, M1.S2.B1 | ouvert |
| ECART-005 | 2026-10-19 | Dépendances absentes : argon2, helmet, @nestjs/swagger, @nestjs/throttler (M1) ; fast-check (M2) ; pg-boss, SMTP (M4) ; client S3, sharp (M6) | tâches citées | ouvert |
| ECART-006 | 2026-10-19 | Pas de job CI pour `pilotage check` | M0.S2.C2 | ouvert |
| ECART-007 | 2026-10-19 | ADR-012 (historique en ajout seul) et doc 07 (historique en M4) laissent les premières saisies de M2 sans trace | Q-HIST (défaut-ok) → M2.S2.A4 | ouvert |

## 7. Risques actifs

| Risque | Mitigation |
|---|---|
| Agents en plans gratuits : quotas courts, coupures en cours de tâche | Tâches S/M, heartbeat, handoff, reprise après 4 h (protocole §3) |
| Agent sans terminal qui ne peut pas utiliser l'outil | Mode manuel (protocole §6), pas de `DONE` sans terminal |
| Dérive entre docs `docs/` et code | `check`, écarts consignés §6, versions de docs jamais écrasées |
| Hébergement visé (Vercel/Render) mal adapté à API + worker + stockage objet | Q-HEB ; recette locale d'abord |
| RL-1 à RL-7 de `docs/07-plan-livraison.md` §9 | Voir ce document |

## 8. Décisions et questions en cours

- Questions : `questions-ouvertes.md` (ouvertes : Q-HEB production, J-01).
- Décisions : `decisions/` (DEC-0001).

## 9. Journal des états des lieux (ajout seul)

- 2026-10-19 — création du système de pilotage et premier constat du dépôt (claude, `journal/20261019-0000-claude-initialisation-pilotage.md`).
