# DEC-0001 — Système de pilotage markdown pour agents de codage

- statut: acceptée
- date (UTC): 2026-10-19T00:00:00Z
- auteur: claude (architecte)
- références: docs/07-plan-livraison.md, questions P23, P25

## Contexte

Le projet est réalisé par plusieurs agents de codage en plans gratuits, aux quotas courts et aux interruptions fréquentes, orchestrés par un architecte. Aucun agent ne garde de mémoire d'une session à l'autre.

## Décision

Toute l'information de pilotage vit dans `pilotage/` en fichiers markdown versionnés avec le code : jalons → sprints → missions → tâches avec statuts, claims avec heartbeat, journal par session en ajout seul, validations, handoffs, décisions, état des lieux régénérable. Un outil sans dépendance (`pilotage.mjs`) lit, compare et contrôle ces fichiers ; chaque opération a un équivalent manuel.

## Alternatives écartées

- Outil de tickets externe : non lisible par tous les agents hors connexion, hors dépôt.
- Un seul fichier d'état : conflits de fusion constants entre agents.

## Conséquences

- Les tâches font au plus 2–3 sessions (taille S ou M).
- Le job CI `pilotage check` (M0.S2.C2) protège la cohérence.
- Les statuts ne sont jamais recopiés dans des documents narratifs (ils dériveraient) : la feuille de route est structurelle, l'état des lieux est généré.
