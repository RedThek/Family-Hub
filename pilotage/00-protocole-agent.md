# 00 — Protocole des agents

Procédure obligatoire pour toute session d'agent. Formats et noms : `03-conventions.md`.

## 1. Principes

1. **Les fichiers sont la mémoire.** Rien n'existe tant que ce n'est pas écrit dans `pilotage/` ou dans le dépôt.
2. **Écrire avant d'agir, vérifier après.** Réserver (claim) avant de coder ; consigner au fil de l'eau, pas à la fin.
3. **Un seul propriétaire par tâche.** Le claim fait foi.
4. **Pas de DONE sans preuve** : validation écrite, par une autre session.
5. **Ne pas deviner** : une règle manquante ou ambiguë devient une question (`questions-ouvertes.md`) ou une décision (`decisions/`).
6. **Les documents `docs/` (versions courantes) priment sur le code.** Écart constaté = entrée dans `01-etat-des-lieux.md` §6.
7. **Aucune donnée personnelle réelle** dans les journaux, validations, tests, captures (doc 07 §8). Identifiants et données synthétiques uniquement.

## 2. Cycle d'une session

**Étape 0 — Orientation**
- Lire `AGENTS.md`, lancer `reprise`, lire `01-etat-des-lieux.md`.
- Lire le dernier journal et les handoffs ouverts.
- S'il y a un claim périmé, un journal non clôturé ou un handoff ouvert : suivre §3 **avant** toute nouvelle tâche.

**Étape 1 — Choisir** (ordre de priorité)
1. Tâches qui m'ont été assignées (`assigné:` à mon nom).
2. Reprise d'un travail interrompu (§3).
3. Tâches `REVIEW` à valider **qui ne sont pas les miennes**.
4. Nouvelles tâches : `next --agent <moi>` (respecte dépendances de tâche et de jalon).

**Étape 2 — Ouvrir le journal** : `journal <agent> <slug>`. Remplir « Contexte de reprise » et « Objectif ».

**Étape 3 — Réserver** : `claim <ID> <agent>`. Commit isolé du claim, immédiatement : `chore(pilotage): claim <ID>`. Si ce commit entre en conflit, quelqu'un a réservé avant : abandonner et choisir une autre tâche.

**Étape 4 — Travailler**
- Branche `agent/<ID>-<slug>`, petits incréments, commits qui citent l'ID et les règles (`03-conventions.md`).
- Journal : une ligne par action (heure UTC, action, fichiers, résultat), **commandes lancées et leur résultat** (lint, tests).
- `heartbeat <ID>` à chaque étape significative et au moins toutes les 30 minutes.
- Hors périmètre de la tâche → ne pas le faire : créer une nouvelle tâche (ou une note) dans le journal.

**Étape 5 — Vérifier**
- Critères d'acceptation de la tâche, un par un.
- `pnpm lint`, `pnpm lint:arch`, `pnpm test`, `pnpm build` selon le périmètre.
- Si la tâche expose une personne : cas ajoutés à la matrice de visibilité. Si elle touche l'API : OpenAPI régénérée. Si elle change une règle ou le modèle : nouvelle version du document.

**Étape 6 — Passer en REVIEW** : `set <ID> REVIEW`, puis `validation <ID> <agent>` et remplir « Preuves de réalisation » (le réalisateur ne rend pas de verdict).

**Étape 7 — Valider** (autre session ou autre agent) : `claim <ID> <agent> --role validation`, refaire les commandes, cocher les critères, rendre le verdict ; si « validé » : `set <ID> DONE --validation validations/<ID>.md`. Refus : `set <ID> DOING` avec les écarts dans la validation. *Solo* : la validation se fait à froid, dans une **autre session**, jamais dans celle qui a réalisé.

**Étape 8 — Clôturer** : compléter le journal (états de fin, prochaine étape, `- clôturée: oui`), `sync`, `check` (doit rendre 0 erreur), commit `chore(pilotage): clôture session <fichier journal>`.

**Interrompu (quota, panne, fin de contexte)** : écrire un handoff (`handoffs/_modele.md`) **avant** de s'arrêter si c'est possible ; sinon, l'absence de heartbeat et de clôture signale l'interruption (§3).

## 3. Reprise après indisponibilité d'un agent

**Détection** (visible dans `reprise` et `check`) : claim sans heartbeat depuis plus de **4 h** (constante `BAIL_H`), journal non clôturé depuis plus de 4 h, ou handoff `ouvert`.

**Procédure**
1. Lire : le claim, le journal de l'agent absent (dernières lignes), le handoff, le fichier de jalon de la tâche.
2. Inspecter le dépôt : `git status`, `git log --oneline -10`, branches `agent/<ID>-*`, `git stash list`. Ne **jamais** supprimer le travail de l'autre : l'archiver (branche `archive/<ID>-<date>`) avant de repartir de zéro.
3. Décider : **continuer** (travail cohérent) ou **repartir** (travail incohérent ou non vérifiable).
4. Reprendre le claim : `claim <ID> <agent> --reprendre` (trace `repris_de`).
5. Ouvrir un journal dont la section « Contexte de reprise » contient le **constat** (ce qui est fait, vérifié, suspect) et la décision continuer/repartir.
6. Marquer le handoff `- statut: repris` et indiquer la session qui reprend.
7. Si le travail laissé est inexploitable et que la cause est floue : `set <ID> BLOCKED --notes "…"` et poser une question.

**Si l'agent absent revient** : il lit le claim (le sien a été repris), le journal du repreneur, et choisit une autre tâche.

## 4. Blocages, questions, décisions

- **Blocage** : `set <ID> BLOCKED --notes "raison"`, consigner dans le journal, passer à une autre tâche.
- **Question ouverte** (`questions-ouvertes.md`) : statut `ouverte` = ne pas avancer sur ce qui en dépend ; `défaut-ok` = appliquer la proposition par défaut **et** écrire une décision `DEC` « défaut appliqué » ; `tranchée` = suivre la décision. Seul le propriétaire (Mola) passe une question à `tranchée`.
- **Décision structurante** (dépendance ajoutée, changement de modèle, d'API, de règle, de convention) : fichier `decisions/DEC-NNNN-<slug>.md` avant ou avec le changement. Si une règle ou le modèle change : nouvelle version du document `docs/…-v(N+1).md` (l'ancienne reste), README mis à jour.

## 5. Concurrence et conflits git

- **Journal** : un fichier par session → aucun conflit.
- **Claims** : un fichier par tâche, créé en exclusivité ; premier push gagne ; le perdant abandonne.
- **Fichiers de jalon** : ne modifier que la ligne `- statut:` de **ses** tâches, via l'outil.
- **État des lieux** : blocs `AUTO` régénérés par `sync` (en cas de conflit : prendre n'importe quelle version, relancer `sync`) ; sections manuelles en **ajout daté** uniquement.
- **Source de vérité en cas de divergence** : journaux et validations > fichiers de jalon > état des lieux.

## 6. Mode sans terminal

Certains agents n'ont pas d'accès shell. Équivalents manuels (le résultat doit être identique) :

| Commande | Équivalent manuel |
|---|---|
| `reprise` | lire `01-etat-des-lieux.md`, `claims/`, derniers fichiers de `journal/`, `handoffs/` |
| `next` | première tâche `TODO` dont tous les `dépend:` sont `DONE` et dont les jalons prérequis sont terminés |
| `claim` | créer `claims/<ID>.md` (modèle dans `claims/README.md`) ; passer `statut: DOING` et `assigné:` |
| `heartbeat` | mettre à jour la ligne `- heartbeat:` du claim |
| `set` | modifier `statut:` (transitions de `03-conventions.md`) ; supprimer le claim sauf en `DOING` |
| `journal`, `validation` | copier `_modele.md` sous le bon nom |
| `sync` | laisser un agent avec terminal le lancer ; sinon ne pas toucher aux blocs AUTO |
| `check` | relire la liste de `03-conventions.md` §7 |

Un agent sans terminal ne **valide** pas (`DONE`) : il laisse en `REVIEW`.

## 7. Définition de prêt et de terminé (doc 07 §2)

**Prêt** : règles `RG-…` citées, critères d'acceptation écrits, aucune question ouverte bloquante, dépendances `DONE`.

**Terminé** :
- code relu à froid avec la checklist de sécurité ;
- tests unitaires et d'intégration verts, cas ajoutés à la matrice de visibilité si une donnée personne est exposée ;
- OpenAPI régénérée et à jour ;
- migration Prisma appliquée sur base vierge **et** sur base de test ;
- journal de sécurité alimenté pour les actions concernées ;
- documentation mise à jour si une règle ou un modèle change ;
- **journal de session écrit, validation écrite, statut `DONE` posé via l'outil.**

## 8. Garde-fous du projet (rappel)

- Visibilité **côté serveur, par projection** (ADR-008) : aucune entité n'est sérialisée telle quelle ; un champ non autorisé est absent.
- Autorisation centralisée (`AuthorizationService`), refus par défaut, jamais de droit décidé dans un contrôleur ou le frontend.
- Domaine (`domain/`) sans Nest ni Prisma ; modules qui ne lisent pas les tables des autres (`pnpm lint:arch`).
- SQL brut paramétré uniquement ; secrets jamais versionnés ; aucune donnée réelle hors production.
- Tests nommés d'après les règles (`RG-VIS-05_vivant_non_approuve_…`).
- Journaux applicatifs : identifiants seulement, jamais de noms.
- Ne pas modifier les anciennes versions de documents ; en créer une nouvelle.
