# pilotage/ — système de pilotage pour agents de codage

Ce dossier est la **mémoire du projet** pour tout agent (Claude, Copilot, Gemini, Codex, Mistral, Grok…) : ce qu'il faut faire, ce qui est fait, ce qui est en cours, par qui, avec quelles preuves, et comment reprendre si un agent s'arrête.

## Où commencer

1. Lire `../AGENTS.md`.
2. Lancer `node pilotage/outils/pilotage.mjs reprise` (ou `pnpm pilotage reprise` une fois M0.S2.C1 faite).
   Pas de terminal ? Lire à la main `01-etat-des-lieux.md`, puis `00-protocole-agent.md` §6 (mode sans terminal).

## Contenu

| Chemin | Rôle | Mode d'écriture |
|---|---|---|
| `00-protocole-agent.md` | Procédure de session, reprise, blocages, conflits | lecture |
| `01-etat-des-lieux.md` | Instantané : avancement, claims, écarts, risques | blocs AUTO (`sync`) + ajouts datés |
| `02-feuille-de-route.md` | Structure du plan et dépendances | lecture |
| `03-conventions.md` | Identifiants, statuts, formats parsés, nommage, commits | lecture |
| `agents.md` | Registre des agents et règles d'assignation | ajouts |
| `questions-ouvertes.md` | Décisions attendues du propriétaire (Mola), valeurs par défaut | statut par Mola |
| `jalons/` | Jalons → sprints → missions → tâches (statut par tâche) | statut via l'outil |
| `claims/` | Un fichier par tâche en cours (réservation + heartbeat) | créé/supprimé par l'outil |
| `journal/` | Un fichier par session d'agent (traçabilité de toute action) | **ajout seul**, 1 fichier = 1 session |
| `validations/` | Preuves et verdict par tâche ou jalon | un fichier par validation |
| `handoffs/` | Notes de passage quand un agent s'arrête en cours de tâche | un fichier par passage |
| `decisions/` | Décisions structurantes (DEC-NNNN) | ajout seul |
| `outils/pilotage.mjs` | CLI : `reprise`, `next`, `claim`, `set`, `check`, `sync`… | — |

## Principes

- **Les fichiers sont la mémoire.** Une action non consignée n'a pas eu lieu.
- **Une tâche, un propriétaire** (claim), réservé avant de commencer.
- **Pas de DONE sans validation** écrite par une session différente de celle qui a réalisé.
- **Ajout seul** pour journaux, validations, handoffs, décisions : pas de conflit entre agents, historique intact.
- **Reconstructible** : l'état des lieux se régénère (`sync`) depuis les jalons, claims et journaux ; en cas de divergence, journaux et validations font foi.
- **Ne pas deviner** : question ouverte = on consigne et on prend une autre tâche.
