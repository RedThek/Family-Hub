# M2 — Cœur généalogique

- taille: XL
- dépend_jalons: M0, SP1
- règles: RG-ENT-01..12, RG-ARB-02
- référence: docs/07-plan-livraison.md §4 M2

## Objectif

Personnes, unions, filiations, closure table maintenue transactionnellement, contraintes CHK, écriture directe par l'admin, GET /tree filtré, interface de saisie et vue de l'arbre.

## Critère de sortie

Un arbre de 5 générations avec polygamie et adoptions est saisi sans contournement ; test par propriétés de la closure vert ; requêtes de graphe sous le seuil mesuré en SP1.

## Notes d'architecte

Q-HIST : l'historique est écrit dès M2 via un port `HistoryWriter` (écriture seule) pour ne pas saisir les premières données sans trace ; consultation et droits SQL restent en M4. Q-TEST : choisir base jetable (Testcontainers) ou service PostgreSQL de la CI. Les endpoints d'écriture dépendent de M1.S2.A2 (garde globale) : M2 peut démarrer en parallèle de M1 sur le domaine et la closure.

> Format des tâches : voir `pilotage/03-conventions.md`. Les lignes `- statut:` et `- règles:` sont lues par l'outil : ne pas en changer la forme. Changer un statut avec `pilotage.mjs set`.

## Sprint M2.S1 — Closure et invariants du graphe

### Mission M2.S1.A — Closure table

#### M2.S1.A1 — ClosureRepository : SQL brut paramétré, 3 path_type (all, biological, paternal)
- statut: TODO · taille: M · assigné: — · validation: —
- règles: ADR-004 ; RG-ENT-12 · dépend: —
- livrables: modules/genealogy/infrastructure/closure.repository.ts
- acceptation: ancêtres/descendants/lignée par jointure ; aucune concaténation SQL

#### M2.S1.A2 — Maintenance transactionnelle de la closure à la création/suppression d'un PARENT_LINK
- statut: TODO · taille: M · assigné: — · validation: —
- règles: RG-ENT-05,12 · dépend: M2.S1.A1
- livrables: modules/genealogy/application
- acceptation: closure à jour dans la même transaction que le lien

#### M2.S1.A3 — Recalcul des chemins paternal au changement de sex et commande d'administration de recalcul complet
- statut: TODO · taille: S · assigné: — · validation: —
- règles: RL-2 ; RG-ENT-12 · dépend: M2.S1.A2
- livrables: modules/genealogy, apps/api/src/cli/
- acceptation: recalcul complet = closure incrémentale

#### M2.S1.A4 — Tests d'intégration (PostgreSQL jetable) et test par propriétés de la closure
- statut: TODO · taille: M · assigné: — · validation: —
- règles: ADR-013 · dépend: M2.S1.A2
- livrables: apps/api/src/modules/genealogy/**/*.spec.ts
- acceptation: fast-check en devDependency explicite ; ≥ 500 séquences ; Q-TEST consignée en DEC

### Mission M2.S1.B — Invariants du domaine

#### M2.S1.B1 — Domaine pur : entités Person, Union, ParentLink et invariants
- statut: TODO · taille: S · assigné: — · validation: —
- règles: EA-08 · dépend: —
- livrables: modules/genealogy/domain
- acceptation: aucune dépendance Nest/Prisma (lint:arch vert)

#### M2.S1.B2 — CHK-01 acyclicité via la closure (rule.cycle_detected)
- statut: TODO · taille: S · assigné: — · validation: —
- règles: RG-ENT-10 · dépend: M2.S1.A2, M2.S1.B1
- livrables: modules/genealogy
- acceptation: un lien créant un cycle est refusé (422)

#### M2.S1.B3 — CHK-07 (max 2 parents biologiques) et erreurs métier CHK-02/03
- statut: TODO · taille: S · assigné: — · validation: —
- règles: RG-ENT-11 ; CHK-02,03,07 · dépend: M2.S1.B1
- livrables: modules/genealogy
- acceptation: codes rule.too_many_biological_parents, rule.union_same_person, rule.duplicate_link

## Sprint M2.S2 — API d'écriture (admin) et de lecture

### Mission M2.S2.A — Écriture directe par l'admin

#### M2.S2.A1 — POST/PATCH/DELETE /persons (admin ; If-Match/rowVersion ; suppression logique)
- statut: TODO · taille: M · assigné: — · validation: —
- règles: RG-ENT-01,02 ; doc 06 §3.2 · dépend: M2.S1.B1, M1.S2.A2
- livrables: modules/genealogy/http
- acceptation: 409 concurrency.stale_version si rowVersion périmée

#### M2.S2.A2 — CRUD /unions (deux partenaires, statut)
- statut: TODO · taille: S · assigné: — · validation: —
- règles: RG-ENT-03,04 · dépend: M2.S2.A1
- livrables: modules/genealogy/http
- acceptation: polygamie = plusieurs unions pour une personne

#### M2.S2.A3 — POST/DELETE /parent-links (kind, adoption_date)
- statut: TODO · taille: S · assigné: — · validation: —
- règles: RG-ENT-05,06 · dépend: M2.S2.A1, M2.S1.B2, M2.S1.B3
- livrables: modules/genealogy/http
- acceptation: adoption_date seulement si adoptive (CHK-04)

#### M2.S2.A4 — Port HistoryWriter : FIELD_HISTORY et CHANGE_LOG dans la transaction (ajout seul)
- statut: TODO · taille: M · assigné: — · validation: —
- règles: ADR-012 ; RG-MOD-00 · dépend: M2.S2.A1
- livrables: modules/history/application
- acceptation: chaque écriture directe produit source=direct ; Q-HIST consignée

### Mission M2.S2.B — Lecture

#### M2.S2.B1 — GET /persons/{id} (schéma provisoire admin, remplacé par le projecteur en M3)
- statut: TODO · taille: S · assigné: — · validation: —
- règles: doc 06 §3.2 · dépend: M2.S2.A1
- livrables: modules/genealogy/http
- acceptation: marqué TODO-M3 dans le code

#### M2.S2.B2 — GET /tree : up, down, includeSpouses, includeHalfSiblings, includeAdoptive ; plafond 10 ; truncated
- statut: TODO · taille: M · assigné: — · validation: —
- règles: RG-ARB-02 ; P7 ; P20 · dépend: M2.S1.A2
- livrables: modules/genealogy/http
- acceptation: réponse conforme doc 06 §4

#### M2.S2.B3 — Test de performance des requêtes de graphe contre le seuil de SP1
- statut: TODO · taille: S · assigné: — · validation: —
- règles: RL-2 · dépend: M2.S2.B2
- livrables: validations/M2.S2.B3.md
- acceptation: p95 sous le seuil mesuré en SP1

## Sprint M2.S3 — Interface de saisie et arbre

### Mission M2.S3.A — Saisie

#### M2.S3.A1 — Formulaire de fiche personne (saisie rapide)
- statut: TODO · taille: M · assigné: — · validation: —
- règles: RL-5 · dépend: M2.S2.A1
- livrables: apps/web/src/
- acceptation: création/édition sans quitter la page

#### M2.S3.A2 — Création d'unions et de liens de filiation (biologique/adoptif)
- statut: TODO · taille: M · assigné: — · validation: —
- règles: RG-ENT-05,06 · dépend: M2.S2.A2, M2.S2.A3
- livrables: apps/web/src/
- acceptation: distinction biologique/adoptif visible

### Mission M2.S3.B — Rendu de l'arbre

#### M2.S3.B1 — Vue arbre avec la bibliothèque choisie en SP2
- statut: TODO · taille: M · assigné: — · validation: —
- règles: RG-ENT-06 ; ADR-005 · dépend: M2.S2.B2, SP2.S1.B1
- livrables: apps/web/src/
- acceptation: polygamie, demi-fratries et liens adoptifs lisibles

#### M2.S3.B2 — Vue de repli : liste hiérarchique (plan B)
- statut: TODO · taille: S · assigné: — · validation: —
- règles: RL-1 · dépend: M2.S2.B2
- livrables: apps/web/src/
- acceptation: utilisable sur mobile

### Mission M2.S3.C — Données de test

#### M2.S3.C1 — Jeu synthétique de 5 générations avec polygamie et adoptions (seed de recette)
- statut: TODO · taille: S · assigné: — · validation: —
- règles: critère cadrage §7 · dépend: M2.S2.A3
- livrables: apps/api/prisma/seed-recette.ts
- acceptation: aucune donnée réelle ; rejouable

#### M2.S3.C2 — Scénario de saisie sans contournement (critère du cadrage §7)
- statut: TODO · taille: S · assigné: — · validation: —
- règles: critère cadrage §7 · dépend: M2.S3.A2, M2.S3.C1
- livrables: validations/M2.S3.C2.md
- acceptation: arbre saisi uniquement via l'interface

### Mission M2.S3.Z — Clôture du jalon

#### M2.S3.Z1 — Mettre à jour la documentation, l'OpenAPI et l'état des lieux du jalon
- statut: TODO · taille: S · assigné: — · validation: —
- règles: doc 07 §2 · dépend: @jalon
- livrables: docs/, openapi.json, 01-etat-des-lieux.md
- acceptation: règle ou modèle changé → nouvelle version du doc (-vN) ; OpenAPI régénérée ; `sync` exécuté

#### M2.S3.Z2 — Déployer le jalon sur l'environnement de recette (données synthétiques)
- statut: TODO · taille: S · assigné: — · validation: —
- règles: doc 07 §8 · dépend: M2.S3.Z1
- livrables: —
- acceptation: recette = `docker compose` local acceptable tant que Q-HEB est ouverte ; aucune donnée réelle

#### M2.S3.Z3 — Valider le jalon contre son critère de sortie
- statut: TODO · taille: S · assigné: — · validation: —
- règles: doc 07 §4 · dépend: M2.S3.Z2
- livrables: validations/M2.md
- acceptation: Un arbre de 5 générations avec polygamie et adoptions est saisi sans contournement ; test par propriétés de la closure vert ; requêtes de graphe sous le seuil mesuré en SP1.
