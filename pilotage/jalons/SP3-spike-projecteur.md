# SP3 — Spike : projecteur de visibilité

- taille: S
- dépend_jalons: M0
- règles: RG-VIS-01..12
- référence: docs/07-plan-livraison.md §3 SP-3, ADR-008

## Objectif

Vérifier que le PersonProjector couvre toutes les surfaces sans duplication de la règle de visibilité.

## Critère de sortie

Architecture ADR-008 confirmée ou ajustée, 10 cas de matrice verts.

## Notes d'architecte

Code de spike dans `apps/api/test/spikes/projector/`. Réimplémentation propre en M3.

> Format des tâches : voir `pilotage/03-conventions.md`. Les lignes `- statut:` et `- règles:` sont lues par l'outil : ne pas en changer la forme. Changer un statut avec `pilotage.mjs set`.

## Sprint SP3.S1 — Spike projecteur

### Mission SP3.S1.A — Squelette et cas

#### SP3.S1.A1 — Squelette de PersonProjector pur (types, niveaux L0..L3)
- statut: TODO · taille: S · assigné: — · validation: —
- règles: RG-VIS-01,07,09 · dépend: —
- livrables: apps/api/test/spikes/projector/person-projector.ts
- acceptation: un seul point d'implémentation de visibilité_effective()

#### SP3.S1.A2 — 10 cas de la matrice (vivant/décédé/inconnu, mineur, masqué)
- statut: TODO · taille: S · assigné: — · validation: —
- règles: RG-VIS-04,05,10,11,12 · dépend: SP3.S1.A1
- livrables: apps/api/test/spikes/projector/matrix.spec.ts
- acceptation: 10 cas verts, noms RG-VIS-xx_…

### Mission SP3.S1.B — Décision

#### SP3.S1.B1 — Consigner la décision : confirmer l'ADR-008 ou l'ajuster
- statut: TODO · taille: S · assigné: — · validation: —
- règles: ADR-008 · dépend: SP3.S1.A2
- livrables: decisions/DEC-xxxx-projecteur.md
- acceptation: décision écrite ; points d'extension pour recherche, historique, notifications listés

### Mission SP3.S1.Z — Clôture du spike

#### SP3.S1.Z1 — Valider le spike (livrables et décision)
- statut: TODO · taille: S · assigné: — · validation: —
- règles: doc 07 §3 · dépend: @jalon
- livrables: validations/SP3.md
- acceptation: Architecture ADR-008 confirmée ou ajustée, 10 cas de matrice verts.
