# M3 — Visibilité et page publique

- taille: L
- dépend_jalons: M1, M2, SP3
- règles: RG-VIS-01..12 ; doc 05 §4
- référence: docs/07-plan-livraison.md §4 M3

## Objectif

Visibilité effective, PersonProjector et schémas par niveau, protection des mineurs, nœud anonyme, endpoints publics, matrice de tests sur toutes les surfaces.

## Critère de sortie

Aucune donnée détaillée d'une personne vivante n'est accessible sans compte approuvé, vérifié par la matrice en CI.

## Notes d'architecte

Mineur : personne vivante de moins de 18 ans ; si seule l'année est connue, traitée comme mineure dès qu'elle peut l'être (RG-VIS-10). P18 : lien public permanent avec noindex et limitation de débit au MVP.

> Format des tâches : voir `pilotage/03-conventions.md`. Les lignes `- statut:` et `- règles:` sont lues par l'outil : ne pas en changer la forme. Changer un statut avec `pilotage.mjs set`.

## Sprint M3.S1 — Domaine de visibilité et projection

### Mission M3.S1.A — Règles pures

#### M3.S1.A1 — visibilité_effective() pure : niveaux, planchers vivant/décédé/inconnu, catégories (doc 03 §5.2, doc 05 §4.1)
- statut: TODO · taille: M · assigné: — · validation: —
- règles: RG-VIS-01,04,05,07,08 · dépend: —
- livrables: modules/visibility/domain
- acceptation: le plus restrictif l'emporte ; `unknown` traité comme vivant

#### M3.S1.A2 — Règle du mineur vivant (RG-VIS-10)
- statut: TODO · taille: S · assigné: — · validation: —
- règles: RG-VIS-10 · dépend: M3.S1.A1
- livrables: modules/visibility/domain
- acceptation: année de naissance réservée aux approuvés ; mineur potentiel si année seule

#### M3.S1.A3 — Résolution du niveau d'accès demandeur L0..L3
- statut: TODO · taille: S · assigné: — · validation: —
- règles: doc 05 §4.1 · dépend: —
- livrables: modules/visibility/application
- acceptation: L0 sans session, L1 non approuvé, L2 approuvé, L3 admin/co-admin

### Mission M3.S1.B — Projection

#### M3.S1.B1 — PersonProjector et schémas PersonPublic/Member/Approved/Admin/Masked
- statut: TODO · taille: M · assigné: — · validation: —
- règles: ADR-008 ; doc 06 §2 ; RG-VIS-09,12 · dépend: M3.S1.A1, M3.S1.A2, M3.S1.A3
- livrables: modules/visibility/application
- acceptation: champ non autorisé absent (jamais null) ; aucune entité sérialisée telle quelle

#### M3.S1.B2 — Test d'architecture S-01 : aucun contrôleur ne retourne une entité Prisma
- statut: TODO · taille: S · assigné: — · validation: —
- règles: S-01 · dépend: M3.S1.B1
- livrables: apps/api/test/
- acceptation: le test échoue sur un contrôleur de démonstration

### Mission M3.S1.C — Données de visibilité

#### M3.S1.C1 — PERSON_VISIBILITY par défaut (general=public, details/media=approved) à la création et rattrapage
- statut: TODO · taille: S · assigné: — · validation: —
- règles: doc 05 §4.1 · dépend: —
- livrables: modules/visibility/infrastructure, migration
- acceptation: toute personne a 3 lignes de visibilité

#### M3.S1.C2 — PUT /persons/{id}/visibility (admin) ; rule.living_cannot_be_private, rule.visibility_below_floor
- statut: TODO · taille: S · assigné: — · validation: —
- règles: RG-VIS-02,06,07 · dépend: M3.S1.A1, M3.S1.C1
- livrables: modules/visibility/http
- acceptation: refus 422 sous le plancher

## Sprint M3.S2 — Surfaces et page publique

### Mission M3.S2.A — Surfaces existantes

#### M3.S2.A1 — Brancher le projecteur sur GET /persons/{id}
- statut: TODO · taille: S · assigné: — · validation: —
- règles: RG-VIS-09 · dépend: M3.S1.B1
- livrables: modules/genealogy/http
- acceptation: retire le schéma provisoire de M2

#### M3.S2.A2 — Brancher le projecteur sur GET /tree avec nœud anonyme sans fuite de degré
- statut: TODO · taille: M · assigné: — · validation: —
- règles: RG-VIS-12 · dépend: M3.S1.B1
- livrables: modules/genealogy/http
- acceptation: nœud masqué = { id, masked:true } uniquement

#### M3.S2.A3 — Points d'extension du projecteur pour recherche, historique, notifications, doublons
- statut: TODO · taille: S · assigné: — · validation: —
- règles: RG-VIS-09 · dépend: M3.S1.B1
- livrables: modules/visibility/application
- acceptation: interface testée ; documentée dans le journal

### Mission M3.S2.B — Page publique

#### M3.S2.B1 — GET /public/persons/{id} et /relatives : noindex, UUID opaques, limitation de débit
- statut: TODO · taille: M · assigné: — · validation: —
- règles: RG-VIS-03,04 ; P18 ; M-04 · dépend: M3.S2.A1
- livrables: modules/genealogy/http
- acceptation: en-tête X-Robots-Tag ; 429 au seuil

#### M3.S2.B2 — Interface publique minimale
- statut: TODO · taille: S · assigné: — · validation: —
- règles: RG-VIS-04 · dépend: M3.S2.B1
- livrables: apps/web/src/
- acceptation: aucune photo ni document visibles

## Sprint M3.S3 — Matrice de visibilité

### Mission M3.S3.A — Matrice

#### M3.S3.A1 — Générateur de la matrice L0..L3 × catégorie × statut de vie × réglage ; tests nommés RG-VIS-xx
- statut: TODO · taille: M · assigné: — · validation: —
- règles: ADR-013 ; S-02 · dépend: M3.S1.B1
- livrables: apps/api/test/visibility-matrix/
- acceptation: couvre tous les cas du doc 05 §4.1/4.2

#### M3.S3.A2 — Exécuter la matrice sur /persons/{id}
- statut: TODO · taille: S · assigné: — · validation: —
- règles: S-02 · dépend: M3.S3.A1, M3.S2.A1
- livrables: apps/api/test/visibility-matrix/
- acceptation: contenu exact du DTO vérifié

#### M3.S3.A3 — Exécuter la matrice sur /tree (nœuds masqués)
- statut: TODO · taille: S · assigné: — · validation: —
- règles: S-02 · dépend: M3.S3.A1, M3.S2.A2
- livrables: apps/api/test/visibility-matrix/
- acceptation: aucun champ sur un nœud masqué

#### M3.S3.A4 — Exécuter la matrice sur /public/*
- statut: TODO · taille: S · assigné: — · validation: —
- règles: S-02 · dépend: M3.S3.A1, M3.S2.B1
- livrables: apps/api/test/visibility-matrix/
- acceptation: jamais de photo ni document

#### M3.S3.A5 — Verrouiller la matrice en CI (job requis, zéro régression)
- statut: TODO · taille: S · assigné: — · validation: —
- règles: S-02 · dépend: M3.S3.A2, M3.S3.A3, M3.S3.A4
- livrables: .github/workflows/ci.yml
- acceptation: branche protégée sur ce job

### Mission M3.S3.Z — Clôture du jalon

#### M3.S3.Z1 — Mettre à jour la documentation, l'OpenAPI et l'état des lieux du jalon
- statut: TODO · taille: S · assigné: — · validation: —
- règles: doc 07 §2 · dépend: @jalon
- livrables: docs/, openapi.json, 01-etat-des-lieux.md
- acceptation: règle ou modèle changé → nouvelle version du doc (-vN) ; OpenAPI régénérée ; `sync` exécuté

#### M3.S3.Z2 — Déployer le jalon sur l'environnement de recette (données synthétiques)
- statut: TODO · taille: S · assigné: — · validation: —
- règles: doc 07 §8 · dépend: M3.S3.Z1
- livrables: —
- acceptation: recette = `docker compose` local acceptable tant que Q-HEB est ouverte ; aucune donnée réelle

#### M3.S3.Z3 — Valider le jalon contre son critère de sortie
- statut: TODO · taille: S · assigné: — · validation: —
- règles: doc 07 §4 · dépend: M3.S3.Z2
- livrables: validations/M3.md
- acceptation: Aucune donnée détaillée d'une personne vivante n'est accessible sans compte approuvé, vérifié par la matrice en CI.
