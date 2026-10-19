# AGENTS.md — point d'entrée des agents de codage

Projet **Family-Hub** : arbre généalogique familial collaboratif, confidentialité par construction. Cadrage, règles, modèle, architecture, sécurité, API et plan : `docs/` (versions courantes listées dans `README.md`).

Tout le pilotage (quoi faire, qui fait quoi, preuves, reprise) vit dans **`pilotage/`**.

## Avant toute action (obligatoire)

1. `node pilotage/outils/pilotage.mjs reprise` — contexte, claims, journaux, handoffs, prochaines tâches. *(Pas de terminal : `pilotage/00-protocole-agent.md` §6.)*
2. Lire `pilotage/01-etat-des-lieux.md`.
3. Première session : lire `pilotage/00-protocole-agent.md` et `pilotage/03-conventions.md`.
4. S'il y a un claim périmé, un journal non clôturé ou un handoff ouvert : **les traiter d'abord** (protocole §3).

## Règles non négociables

- **Réserver avant de coder** (`claim`), **consigner au fil de l'eau** (journal de session), **clôturer** (journal, `sync`, `check`).
- **Pas de `DONE` sans validation écrite** par une session différente de celle qui a réalisé.
- **Une tâche = une portée.** Hors périmètre → nouvelle tâche, pas de dérive.
- **Ne pas deviner** : règle ambiguë → `pilotage/questions-ouvertes.md` ; décision structurante → `pilotage/decisions/`.
- **Confidentialité** : visibilité calculée côté serveur par projection ; jamais d'entité sérialisée telle quelle ; aucune donnée personnelle réelle dans le code, les tests, les journaux ; aucun secret versionné.
- Documents `docs/` : ne jamais modifier une ancienne version ; créer `-v(N+1)`.
- Qualité avant `REVIEW` : `pnpm lint`, `pnpm lint:arch`, `pnpm test`, `pnpm build`.

## Commandes

`node pilotage/outils/pilotage.mjs help` — `reprise`, `status`, `next --agent <nom>`, `show`, `claim`, `heartbeat`, `set`, `assign`, `journal`, `validation`, `check`, `sync`.
