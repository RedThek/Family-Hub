# DEC-0002 — Image S3 locale : Silo à la place de MinIO

- statut: proposée
- date (UTC): 2026-10-21T11:30:00Z
- auteur: claude (architecte)
- références: ADR-010, ADR-014, tâche M0.S1.B1, ECART-008, question Q-HEB (production, non concernée)

## Contexte

`docker-compose.yml` (M0.S1.B1) démarre le stockage objet local avec `minio/minio` et `minio/mc`. Ces images ne sont plus téléchargeables : MinIO est devenu une distribution source seule (octobre 2025) et ses dépôts d'images publics ont été retirés. La validation de M0.S1.B1 a été refusée pour cette raison (`validations/M0.S1.B1.md`). Le critère de sortie de M0 (« `docker compose up` démarre tout ») est bloqué.

## Décision

Pour le **développement local et la recette locale uniquement** :

- le serveur S3 devient `pgsty/silo` (fork communautaire de MinIO maintenu par Pigsty) et le client d'initialisation `pgsty/mc`, **avec un tag daté épinglé** (jamais `latest`) ;
- les noms de services (`minio`, `minio-init`), les variables `MINIO_*`, les ports (9000, 9001) et le bucket privé `family-hub` ne changent pas ;
- ADR-010 reste valable tel quel : « stockage compatible S3, bucket privé, URL signées ». Seule l'implémentation locale change, `docs/` n'est donc pas versionné pour cela.

## Alternatives écartées

- **Images MinIO d'origine (Docker Hub, Quay)** : retirées.
- **`bitnamilegacy/minio`** : encore téléchargeable mais figée, sans correctifs de sécurité.
- **Construire MinIO depuis les sources** : lourd pour un environnement de développement, charge de maintenance sur le projet.
- **Garage** : plus actif et léger, mais l'initialisation demande des commandes de layout, de clés et de bucket différentes : réécriture de `minio-init` et de la documentation. À reconsidérer si Silo cesse d'être maintenu.

## Conséquences

- Licence : Silo est sous AGPL-3.0, comme MinIO. L'image est seulement référencée en local ; aucun code n'est copié dans le dépôt (CC0).
- Dépendance à un projet communautaire de taille réduite : le tag épinglé protège d'une mise à jour imprévue, mais l'image peut disparaître un jour. Le code de l'API doit rester écrit contre l'**API S3 générique** (déjà prévu en M6, note d'architecte) pour pouvoir changer d'implémentation sans refonte.
- La production (S3 géré, Q-HEB) reste à décider séparément : cette décision n'engage rien pour M8.
- Mettre à jour `README.md` et le commentaire de `.env.example` ; ne pas modifier les versions antérieures de `docs/`.
- À faire passer à `acceptée` par Mola une fois la correction de M0.S1.B1 validée par un agent autre que son réalisateur.

## Vérification

- Tags retenus et validés sur Docker Hub : `pgsty/silo:RELEASE.2026-09-16T00-00-00Z` et `pgsty/mc:RELEASE.2026-09-16T00-00-00Z`.
- Binaires vérifiés dans les conteneurs : `/usr/bin/curl`, `/usr/bin/mc` et `/usr/bin/mcli` présents dans Silo ; `/usr/bin/mc` présent dans `pgsty/mc`.

