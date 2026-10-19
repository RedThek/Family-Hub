# Agents : rôles, périmètres et quotas

| | |
|---|---|
| **Statut** | v0.1 — 19/10/2026 |
| **Lié à** | `AGENTS.md`, `docs/agents/workflow.md`, `docs/07-plan-livraison.md` |

> Les offres gratuites changent vite. Les quotas ci-dessous ont été relevés le 19/10/2026 et sont **à recontrôler** sur les pages officielles avant de planifier un jalon. Corrige ce fichier quand un plan change.

## 1. Principe de répartition

Le critère est le **risque**, pas l'agent préféré.

| Niveau | Ce que ça couvre | Qui exécute | Qui relit |
|---|---|---|---|
| `risk:high` | `AuthorizationService`, `PersonProjector` et visibilité, closure table, approbation atomique, migrations Prisma, sessions et invitations, anonymisation, fichiers (EXIF, URL signées) | **Un seul** agent, sur brief détaillé | Architecte (Claude) **puis** Mola ; CODEOWNERS bloque le merge |
| `risk:low` | CRUD sans droits, DTO, formulaires et composants React, tests unitaires, Dockerfile, documentation d'usage, refactors mécaniques | N'importe quel agent | CI + relecture rapide de Mola |

## 2. Effectif

| Agent | Où il tourne | Plan gratuit (à recontrôler) | Rôle | Niveau |
|---|---|---|---|---|
| **Claude (architecte)** | Conversation claude.ai | Selon ton plan | ADR, briefs, découpage des jalons, revue des PR sensibles, arbitrage des points ouverts | tous |
| **GitHub Copilot** | VS Code (complétion, chat) | Complétions et requêtes de chat limitées par mois ; revue automatique de PR non incluse | Complétion au fil de l'eau, questions courtes | `risk:low` |
| **Gemini CLI / Antigravity** | Terminal, Antigravity | Quota quotidien généreux sur Gemini CLI ; Antigravity CLI est son successeur | Gros volume : endpoints CRUD, DTO, tests, composants React | `risk:low` |
| **Mistral Vibe** | Terminal, VS Code | Offre gratuite | Tests unitaires, refactors mécaniques, boilerplate | `risk:low` |
| **Cursor** | Cursor | Plan gratuit limité | Éditions multi-fichiers guidées par toi | `risk:low` |
| **Codex** | Terminal | Pas d'offre gratuite relevée | Non utilisé tant qu'il n'est pas payé | — |
| **Grok / autres** | Variable | À évaluer | Second avis sur une PR, tâche isolée | `risk:low` |

> Un agent `risk:high` est désigné **ticket par ticket** par l'architecte, avec le meilleur modèle disponible dans les quotas du moment.

## 3. Comment chaque outil lit les règles

Tous lisent le même contrat via un fichier pointeur :

| Outil | Fichier lu | Emplacement |
|---|---|---|
| Tous (standard `AGENTS.md`) | `AGENTS.md` | racine |
| Claude | `CLAUDE.md` | racine |
| Gemini CLI / Antigravity | `GEMINI.md` | racine |
| Copilot (VS Code) | `copilot-instructions.md` | `.github/` |
| Cursor | `project.mdc` | `.cursor/rules/` |
| Mistral Vibe, Codex, Grok | `AGENTS.md` | racine |

À la première utilisation d'un outil, **vérifie qu'il charge bien le fichier** en lui demandant : « quelles sont les quatre commandes de qualité du projet ? ». S'il ne sait pas répondre, ajoute le pointeur manquant et note-le ici.

## 4. Confidentialité des offres gratuites

- Les plans gratuits peuvent autoriser l'entraînement sur tes données : vérifie les conditions de chaque outil.
- **Jamais** de donnée réelle de la famille dans un prompt, un fichier de test ou une capture. Données synthétiques uniquement (doc 07 §8).
- Ne colle jamais de secret (`.env`, jetons) à un agent.

## 5. Suivi des quotas

Quand un agent atteint sa limite, **ne bascule pas un `risk:high` sur un autre agent sans brief** : remets le ticket en file, ou réassigne uniquement les `risk:low`.

| Date | Agent | Limite atteinte | Décision |
|---|---|---|---|
| | | | |
