# Journal — initialisation du système de pilotage

- agent: claude (architecte)
- ouverte (UTC): 2026-10-19T00:00:00Z
- clôturée: oui
- objectif: créer le système de pilotage (jalons, sprints, missions, tâches, journal, handoffs, validations, état des lieux) et établir le premier état des lieux du dépôt

## Contexte de reprise (ce qui a été lu)

- docs/01-cadrage-v2.md, 02-regles-metier-v5.md, 03-modele-domaine-v3.md, 04-architecture-v2.md, 05-securite-confidentialite-v2.md, 06-api-v2.md, 07-plan-livraison.md
- README.md, package.json, apps/api (schéma Prisma, migration init, modules, CI, Dockerfile, dependency-cruiser), apps/web, packages/shared, docker-compose.yml

## Actions

| Heure (UTC) | Action | Fichiers | Résultat |
|---|---|---|---|
| 00:00 | Découpage de docs/07 en 12 jalons (M0..M8, SP1..SP3), sprints, missions et tâches | pilotage/jalons/* | 203 tâches créées |
| 00:00 | Protocole, conventions, modèles (journal, validation, handoff, décision) | pilotage/*.md | créés |
| 00:00 | Outil `pilotage.mjs` (reprise, next, claim, set, check, sync) | pilotage/outils/ | testé sur une copie |
| 00:00 | Constat du dépôt M0 par **lecture seule** (rien n'a été exécuté) | 01-etat-des-lieux.md | tâches M0.S1.* mises en REVIEW |

## Tâches dont l'état a changé

Constat par lecture, non exécuté : à valider par M0.S2.A (tâches passées de rien à REVIEW).

- M0.S1.A1: — → REVIEW
- M0.S1.A2: — → REVIEW
- M0.S1.A3: — → REVIEW
- M0.S1.B1: — → REVIEW
- M0.S1.B2: — → REVIEW
- M0.S1.B3: — → REVIEW
- M0.S1.C1: — → REVIEW
- M0.S1.C2: — → REVIEW
- M0.S1.D1: — → REVIEW
- M0.S1.D2: — → REVIEW
- M0.S1.D3: — → REVIEW
- M0.S1.D4: — → REVIEW
- M0.S1.D5: — → REVIEW

## Décisions prises

- DEC-0001 : adopter le système de pilotage markdown.

## Questions et blocages

- Voir `questions-ouvertes.md` (Q-HEB, J-01 ouvertes ; plusieurs `défaut-ok`).

## Écarts constatés

- Voir `01-etat-des-lieux.md` §6.

## Prochaine étape recommandée

- Exécuter M0.S2.A1 à A4 (validation à froid de M0), puis M0.S2.B (assainissement) et M0.S2.C (intégration du pilotage).
