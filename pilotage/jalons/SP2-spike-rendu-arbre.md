# SP2 — Spike : rendu de l'arbre

- taille: S
- dépend_jalons: M0
- règles: RG-ENT-04..06, RG-ARB-02
- référence: docs/07-plan-livraison.md §3 SP-2, ADR-005, RL-1

## Objectif

Choisir la bibliothèque de rendu qui gère polygamie, demi-fratries et liens adoptifs de façon lisible, y compris sur mobile.

## Critère de sortie

Bibliothèque choisie (ADR-005 confirmé ou remplacé) avec captures et poids de bundle ; plan B (liste hiérarchique) évalué.

## Notes d'architecte

Aucune donnée réelle : jeu de données synthétique uniquement.

> Format des tâches : voir `pilotage/03-conventions.md`. Les lignes `- statut:` et `- règles:` sont lues par l'outil : ne pas en changer la forme. Changer un statut avec `pilotage.mjs set`.

## Sprint SP2.S1 — Prototypes de rendu

### Mission SP2.S1.A — Prototypes

#### SP2.S1.A1 — Jeu de données type (polygamie, demi-fratries, adoption) au format de GET /tree (doc 06 §4)
- statut: TODO · taille: S · assigné: — · validation: —
- règles: RG-ENT-04,05,06 · dépend: —
- livrables: apps/web/spikes/tree/fixtures.json
- acceptation: valide contre le schéma de réponse du doc 06 §4

#### SP2.S1.A2 — Prototype d3 + d3-dag
- statut: TODO · taille: S · assigné: — · validation: —
- règles: RG-ENT-06 · dépend: SP2.S1.A1
- livrables: apps/web/spikes/tree/d3-dag/
- acceptation: affiche les 3 cas ; trait distinct adoptif/biologique

#### SP2.S1.A3 — Prototype React Flow
- statut: TODO · taille: S · assigné: — · validation: —
- règles: RG-ENT-06 · dépend: SP2.S1.A1
- livrables: apps/web/spikes/tree/react-flow/
- acceptation: affiche les 3 cas ; trait distinct adoptif/biologique

#### SP2.S1.A4 — Prototype de repli : liste hiérarchique
- statut: TODO · taille: S · assigné: — · validation: —
- règles: RG-ENT-06 · dépend: SP2.S1.A1
- livrables: apps/web/spikes/tree/list/
- acceptation: lisible sur mobile ; sert de plan B (RL-1)

### Mission SP2.S1.B — Décision

#### SP2.S1.B1 — Comparer (lisibilité, mobile, poids de bundle, effort) et consigner le choix
- statut: TODO · taille: S · assigné: — · validation: —
- règles: ADR-005 · dépend: SP2.S1.A2, SP2.S1.A3, SP2.S1.A4
- livrables: decisions/DEC-xxxx-rendu-arbre.md
- acceptation: tableau comparatif avec captures ; choix et plan B écrits

### Mission SP2.S1.Z — Clôture du spike

#### SP2.S1.Z1 — Valider le spike (livrables et décision)
- statut: TODO · taille: S · assigné: — · validation: —
- règles: doc 07 §3 · dépend: @jalon
- livrables: validations/SP2.md
- acceptation: Bibliothèque choisie (ADR-005 confirmé ou remplacé) avec captures et poids de bundle ; plan B (liste hiérarchique) évalué.
