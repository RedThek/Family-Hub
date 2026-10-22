# Family-Hub

Plateforme web d’arbre généalogique familial : un seul arbre général, collaboration modérée, confidentialité par construction.

Le cadrage, les règles métier, le modèle, l’architecture, la sécurité, l’API et le plan de livraison sont dans [`docs/`](./docs/). Ce README décrit uniquement comment lancer le dépôt (jalon **M0**).

## Documentation

Versions de travail actuelles :

| Document | Fichier |
|---|---|
| Cadrage | [docs/01-cadrage-v2.md](./docs/01-cadrage-v2.md) |
| Règles métier | [docs/02-regles-metier-v5.md](./docs/02-regles-metier-v5.md) |
| Modèle de domaine | [docs/03-modele-domaine-v3.md](./docs/03-modele-domaine-v3.md) |
| Architecture (ADR) | [docs/04-architecture-v2.md](./docs/04-architecture-v2.md) |
| Sécurité et confidentialité | [docs/05-securite-confidentialite-v2.md](./docs/05-securite-confidentialite-v2.md) |
| Conception de l’API | [docs/06-api-v2.md](./docs/06-api-v2.md) |
| Plan de livraison | [docs/07-plan-livraison.md](./docs/07-plan-livraison.md) |

Les fichiers sans suffixe `-vN` sont des versions antérieures conservées pour l’historique de rédaction.

## Stack (ADR-002, 004, 005)

- Monorepo pnpm : `apps/api` (NestJS + Prisma), `apps/web` (React + Vite), `packages/shared`
- PostgreSQL unique, stockage objet privé (Silo en local, fork communautaire compatible MinIO)
- CI GitHub Actions : lint, linter d’architecture, tests, build, migration sur base vierge

## Prérequis

- Node.js 22+
- pnpm 9 (`corepack enable`)
- Docker et Docker Compose

## Démarrage local

```bash
cp .env.example .env
docker compose up --build
```

Cela démarre PostgreSQL, Silo (compatible MinIO, bucket privé `family-hub`), applique les migrations Prisma et lance l’API.

- Santé de l’API : [http://localhost:3000/api/v1/health](http://localhost:3000/api/v1/health)
- Console Silo / MinIO : [http://localhost:9001](http://localhost:9001)

En parallèle, l’interface de développement :

```bash
pnpm install
pnpm --filter @family-hub/shared build
pnpm dev:web
```

Interface : [http://localhost:5173](http://localhost:5173) (proxy vers l’API).

Pour n’utiliser Compose que comme infrastructure (API lancée avec Nest en watch) :

```bash
docker compose up postgres minio minio-init
pnpm --filter @family-hub/shared build
pnpm prisma:generate
pnpm prisma:migrate
pnpm dev:api
```

## Qualité

```bash
pnpm lint
pnpm lint:arch
pnpm test
pnpm build
```

`pnpm lint:arch` (dependency-cruiser) refuse les imports interdits entre modules, notamment `genealogy` / `history` / `identity-access` vers `moderation` (doc 04 §3).

## Licence

[CC0 1.0](./LICENSE)
