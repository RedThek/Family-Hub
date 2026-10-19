# Questions ouvertes et décisions attendues

Statuts : **ouverte** (ne pas avancer sur ce qui en dépend) · **défaut-ok** (appliquer la proposition par défaut et écrire une DEC « défaut appliqué ») · **tranchée** (décision prise, à suivre). Seul Mola passe une question à `tranchée`.

## À trancher

| # | Question | Impact | Proposition par défaut | Statut |
|---|---|---|---|---|
| **Q-HEB** | Hébergement et stockage de production. Visé : Vercel et Render « dans la mesure du possible ». Points à vérifier : une API NestJS durable avec worker pg-boss se prête mal à des fonctions serverless ; MinIO n'existe qu'en local, la production demande un stockage compatible S3 ; les conditions des offres gratuites (durée de la base, mise en veille) changent. | M6, M8.S3.C4, recettes | Recette = `docker compose` local. Piste à confirmer : web sur Vercel, API + worker + PostgreSQL sur Render, stockage S3 externe. | **ouverte** (production) · défaut-ok (recette) |
| **J-01** | Cadre juridique applicable (résidence des membres, RGPD si UE) | M8.S3.C7 avant ouverture hors du cercle initial | Faire valider par un juriste | **ouverte** |
| **P5** | Fusion de doublons réversible ? | M7.S2.B | Réversible pendant une durée définie (fiche archivée) | défaut-ok |
| **P8** | Périmètre du modérateur (global ou branche) | M5.S2.A2 | Au choix de l'admin à l'attribution | défaut-ok |
| **P9** | Qui approuve un compte ? | M1.S3.B1 | Admin ou co-admin ; invitation par un éditeur → compte en attente | défaut-ok |
| **P14** | Droits de la co-éditrice successeure | M5.S2.A3 | Édition directe de sa branche, sans invitation ni nomination | défaut-ok |
| **P18** | Lien public permanent ou révocable | M3.S2.B1 | Permanent au MVP, noindex + limitation de débit ; révocable ensuite | défaut-ok |
| **Q-HIST** | Écrire l'historique dès M2 (port `HistoryWriter`, écriture seule) plutôt qu'en M4 | M2.S2.A4, M4.S3.A1 | Oui : sinon les premières données saisies n'ont aucune trace | défaut-ok |
| **Q-TEST** | Base de test : Testcontainers (ADR-013) ou service PostgreSQL de la CI | M2.S1.A4 | Service PostgreSQL de la CI en priorité ; Testcontainers en local si Docker disponible | défaut-ok |
| **Q-DOCV** | Convention de version des documents (suffixe `-vN` vs numéro interne) | M0.S2.B2 | Le suffixe `-vN` du nom de fichier est la version ; le numéro interne `v0.N` est conservé à titre informatif | défaut-ok |

## Déjà tranchées (reprises de la mémoire du projet et des docs)

| # | Décision |
|---|---|
| P1, P2, P3, P4, P6, P10..P13, P15..P17 | Voir `docs/02-regles-metier-v5.md` §12 |
| P7 | Option « inclure les liens adoptifs » activée par défaut (doc 06 §4) |
| P13b | Enfant sans père renseigné : aucune branche tant que l'admin n'a pas rattaché |
| P19 | Double authentification non obligatoire au MVP |
| P20, P21, P22 | Plafond de 10 générations par requête d'arbre ; fichiers 5 Mo photo / 10 Mo document ; URL signées 60 s ; dates approximatives hors MVP |
| P23 | Disponibilité de 4 h par jour, sans échéance fixée |
| P24 | Aucune donnée existante à importer : saisie manuelle au MVP |
| P25 | Plusieurs agents de codage (voir `agents.md`), orchestrés par Claude |
| Stack | NestJS + Prisma + React/Vite (TypeScript) |
