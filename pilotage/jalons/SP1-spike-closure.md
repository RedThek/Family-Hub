# SP1 — Spike : closure table

- taille: S
- dépend_jalons: —
- règles: RG-ENT-04..06, RG-ENT-11, RG-ENT-12, RG-ARB-02
- référence: docs/07-plan-livraison.md §3 SP-1

## Objectif

Vérifier que la closure table à 3 types de chemin tient les cas réels (polygamie, adoptions, mariages entre cousins, demi-fratries) et mesurer les temps de requête avant d'engager M2.

## Critère de sortie

Décision consignée (valider doc 03 §3.1 ou ajuster `path_type`) ; seuil de performance mesuré, utilisé par M2 et par P20.

## Notes d'architecte

Code de spike hors build de production (`apps/api/test/spikes/`). Ne rien fusionner dans `src/` : M2 réimplémente proprement.

> Format des tâches : voir `pilotage/03-conventions.md`. Les lignes `- statut:` et `- règles:` sont lues par l'outil : ne pas en changer la forme. Changer un statut avec `pilotage.mjs set`.

## Sprint SP1.S1 — Spike closure

### Mission SP1.S1.A — Générateur et mesures

#### SP1.S1.A1 — Générateur d'arbre synthétique (5 000 personnes, 8 générations, polygamie, adoptions, cousins, demi-fratries)
- statut: TODO · taille: S · assigné: — · validation: —
- règles: RG-ENT-04,05,06,11 · dépend: —
- livrables: apps/api/test/spikes/closure/generator.ts
- acceptation: reproductible par seed ; graphe acyclique ; répartition des cas documentée dans le journal

#### SP1.S1.A2 — Prototype SQL de maintenance de la closure (all, biological, paternal)
- statut: TODO · taille: S · assigné: — · validation: —
- règles: RG-ENT-12 · dépend: SP1.S1.A1
- livrables: apps/api/test/spikes/closure/closure.sql.ts
- acceptation: closure incrémentale égale à la closure recalculée sur le jeu synthétique

#### SP1.S1.A3 — Mesurer les requêtes amont/aval/lignée
- statut: TODO · taille: S · assigné: — · validation: —
- règles: RG-ARB-02 · dépend: SP1.S1.A2
- livrables: validations/SP1.S1.A3.md (mesures)
- acceptation: p50/p95 consignés ; seuil retenu écrit (alimente P20 et M2.S2.B3)

#### SP1.S1.A4 — Test par propriétés (fast-check) de la closure
- statut: TODO · taille: S · assigné: — · validation: —
- règles: RG-ENT-10 · dépend: SP1.S1.A2
- livrables: apps/api/test/spikes/closure/closure.property.spec.ts
- acceptation: ≥ 500 séquences aléatoires d'ajouts/suppressions ; aucun écart

### Mission SP1.S1.B — Décision

#### SP1.S1.B1 — Rédiger la décision DEC (valider doc 03 §3.1 ou ajuster path_type)
- statut: TODO · taille: S · assigné: — · validation: —
- règles: ADR-003 · dépend: SP1.S1.A3, SP1.S1.A4
- livrables: decisions/DEC-xxxx-closure.md
- acceptation: décision consignée ; si le modèle change : nouvelle version du doc 03 (-vN) et README docs mis à jour

### Mission SP1.S1.Z — Clôture du spike

#### SP1.S1.Z1 — Valider le spike (livrables et décision)
- statut: TODO · taille: S · assigné: — · validation: —
- règles: doc 07 §3 · dépend: @jalon
- livrables: validations/SP1.md
- acceptation: Décision consignée (valider doc 03 §3.1 ou ajuster `path_type`) ; seuil de performance mesuré, utilisé par M2 et par P20.
