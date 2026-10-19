# M7 — Recherche, doublons et arbre personnalisé

- taille: L
- dépend_jalons: M2, M3, SP2
- règles: RG-ARB-01/02, RG-DUP-01..03
- référence: docs/07-plan-livraison.md §4 M7

## Objectif

Recherche par nom sous visibilité, suggestions de doublons, fusion admin, interface d'arbre personnalisé avec tous les filtres.

## Critère de sortie

Un doublon probable est signalé avant création ; la fusion conserve tous les liens et est tracée ; la recherche respecte la matrice de visibilité.

## Notes d'architecte

P5 : fiches fusionnées archivées pendant une durée définie (réversible), puis purgées.

> Format des tâches : voir `pilotage/03-conventions.md`. Les lignes `- statut:` et `- règles:` sont lues par l'outil : ne pas en changer la forme. Changer un statut avec `pilotage.mjs set`.

## Sprint M7.S1 — Recherche

### Mission M7.S1.A — Recherche par nom

#### M7.S1.A1 — Migration : extensions pg_trgm, unaccent, fuzzystrmatch et index GIN sur noms normalisés
- statut: TODO · taille: S · assigné: — · validation: —
- règles: ADR-011 · dépend: —
- livrables: prisma/migrations
- acceptation: migration sur base vierge ; index utilisé (EXPLAIN)

#### M7.S1.A2 — GET /persons?q= avec filtre de visibilité
- statut: TODO · taille: M · assigné: — · validation: —
- règles: RG-ARB-01 · dépend: M7.S1.A1
- livrables: modules/genealogy/http
- acceptation: aucun profil masqué ne fuit

#### M7.S1.A3 — Étendre la matrice de visibilité à la recherche
- statut: TODO · taille: S · assigné: — · validation: —
- règles: S-02 · dépend: M7.S1.A2
- livrables: apps/api/test/visibility-matrix/
- acceptation: cas ajoutés et verts

## Sprint M7.S2 — Doublons et fusion

### Mission M7.S2.A — Doublons

#### M7.S2.A1 — Score composite (nom, année de naissance, parents) à seuil réglable
- statut: TODO · taille: M · assigné: — · validation: —
- règles: ADR-011 · dépend: M7.S1.A1
- livrables: modules/genealogy/application
- acceptation: jeu de cas de homonymes familiaux

#### M7.S2.A2 — POST /persons/duplicates/check via le projecteur
- statut: TODO · taille: S · assigné: — · validation: —
- règles: RG-DUP-01 · dépend: M7.S2.A1
- livrables: modules/genealogy/http
- acceptation: n'expose que ce que le demandeur peut voir

### Mission M7.S2.B — Fusion

#### M7.S2.B1 — Fusion admin : réattribution des filiations, unions, documents ; fiche perdante archivée
- statut: TODO · taille: M · assigné: — · validation: —
- règles: RG-DUP-02,03 ; P5 · dépend: M7.S2.A1
- livrables: modules/genealogy
- acceptation: tous les liens conservés

#### M7.S2.B2 — Invariants à la fusion (cycles, ≤ 2 parents biologiques, unions en double) et événement person_merged
- statut: TODO · taille: S · assigné: — · validation: —
- règles: RG-ENT-10,11 · dépend: M7.S2.B1
- livrables: modules/genealogy
- acceptation: fusion refusée si invariant violé

#### M7.S2.B3 — Purge des fiches archivées après la durée définie
- statut: TODO · taille: S · assigné: — · validation: —
- règles: doc 05 §9.3 · dépend: M7.S2.B1
- livrables: modules/genealogy
- acceptation: durée configurable ; testée

## Sprint M7.S3 — Arbre personnalisé

### Mission M7.S3.A — Interface

#### M7.S3.A1 — Interface avec tous les filtres (amont, aval, branche, conjoints, demi-fratries, adoptifs)
- statut: TODO · taille: M · assigné: — · validation: —
- règles: RG-ARB-02 · dépend: M2.S2.B2
- livrables: apps/web/src/
- acceptation: chaque filtre modifie la requête /tree

#### M7.S3.A2 — Intégration finale de la bibliothèque de rendu et chargement paresseux
- statut: TODO · taille: M · assigné: — · validation: —
- règles: ADR-005 ; EA-07 · dépend: M7.S3.A1, SP2.S1.B1
- livrables: apps/web/src/
- acceptation: bibliothèque chargée à la demande

#### M7.S3.A3 — Matrice de visibilité sur doublons et arbre filtré
- statut: TODO · taille: S · assigné: — · validation: —
- règles: S-02 · dépend: M7.S2.A2, M7.S3.A1
- livrables: apps/api/test/visibility-matrix/
- acceptation: cas ajoutés et verts

### Mission M7.S3.Z — Clôture du jalon

#### M7.S3.Z1 — Mettre à jour la documentation, l'OpenAPI et l'état des lieux du jalon
- statut: TODO · taille: S · assigné: — · validation: —
- règles: doc 07 §2 · dépend: @jalon
- livrables: docs/, openapi.json, 01-etat-des-lieux.md
- acceptation: règle ou modèle changé → nouvelle version du doc (-vN) ; OpenAPI régénérée ; `sync` exécuté

#### M7.S3.Z2 — Déployer le jalon sur l'environnement de recette (données synthétiques)
- statut: TODO · taille: S · assigné: — · validation: —
- règles: doc 07 §8 · dépend: M7.S3.Z1
- livrables: —
- acceptation: recette = `docker compose` local acceptable tant que Q-HEB est ouverte ; aucune donnée réelle

#### M7.S3.Z3 — Valider le jalon contre son critère de sortie
- statut: TODO · taille: S · assigné: — · validation: —
- règles: doc 07 §4 · dépend: M7.S3.Z2
- livrables: validations/M7.md
- acceptation: Un doublon probable est signalé avant création ; la fusion conserve tous les liens et est tracée ; la recherche respecte la matrice de visibilité.
