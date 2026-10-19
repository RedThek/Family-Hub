# Workflow d'orchestration des agents

| | |
|---|---|
| **Statut** | v0.1 — 19/10/2026 |
| **Lié à** | `AGENTS.md`, `docs/agents/roster.md`, `docs/07-plan-livraison.md` |

Le dépôt GitHub est le **seul canal** entre l'architecte, Mola et les agents. Rien ne passe par la mémoire d'une conversation.

## 1. Cycle d'un ticket

1. **Brief (architecte).** À partir d'un jalon de `docs/07-plan-livraison.md`, Claude produit un brief selon `docs/agents/briefs/_template.md` (règles `RG-…`, fichiers autorisés, tests attendus, interdits, niveau de risque, agent proposé).
2. **Issue (Mola).** Il crée l'issue GitHub, y colle le brief, ajoute les labels `agent:<nom>`, `risk:low|high`, `milestone:Mx`.
3. **Branche isolée.** Une branche par ticket, dans un **worktree dédié** pour que deux agents ne se gênent pas :
   ```bash
   git fetch origin
   git worktree add ../family-hub-wt/gemini-M1-03 -b agent/gemini/M1-03 origin/main
   cd ../family-hub-wt/gemini-M1-03 && pnpm install
   ```
4. **Implémentation (agent).** Il lit `AGENTS.md`, le brief et les docs cités, puis code **dans le périmètre**.
5. **Barrière.** `pnpm verify` doit être vert avant le push.
6. **PR.** Titre `type(scope): résumé (RG-…)`, description remplie (voir §4). Une PR par ticket.
7. **Revue.**
   - `risk:low` : CI verte + relecture rapide de Mola.
   - `risk:high` : relecture de l'architecte (voir §3), puis validation de Mola.
8. **Merge.** Squash, branche supprimée. Retirer le worktree :
   ```bash
   git worktree remove ../family-hub-wt/gemini-M1-03
   ```

## 2. Nommage

| Élément | Format | Exemple |
|---|---|---|
| Branche | `agent/<agent>/<jalon>-<n°>` | `agent/gemini/M1-03` |
| Worktree | `../family-hub-wt/<agent>-<jalon>-<n°>` | `../family-hub-wt/gemini-M1-03` |
| Commit | `type(scope): résumé (RG-…)` | `feat(identity-access): invitations (RG-ACC-01)` |
| Labels | `agent:*`, `risk:*`, `milestone:M0..M8`, `needs-architect` | `agent:mistral` |

## 3. Revue par l'architecte (`risk:high`)

Dans la conversation avec Claude, colle :

```
Revue PR #<n> — ticket <jalon-n°> — risk:high
Brief : <colle le brief>
Diff : <colle le diff, ou les fichiers modifiés>
Résultat de `pnpm verify` : <vert / erreurs>
Demande : vérifie la conformité aux RG-…, à AGENTS.md §5–§6 et à la matrice de visibilité ;
liste les écarts bloquants puis les remarques mineures.
```

Claude répond par : **bloquant** (à corriger avant merge), **à surveiller**, **conforme**. Mola applique ou renvoie le ticket à l'agent avec cette liste.

## 4. Modèle de description de PR

```markdown
## Ticket
Closes #<n> — <jalon> — risk:<low|high> — agent:<nom>

## Règles couvertes
RG-…, RG-…

## Changements
- …

## Tests ajoutés (noms = règles)
- RG-…_…

## Vérifications
- [ ] `pnpm verify` vert
- [ ] Aucun fichier hors périmètre ni zone protégée touché
- [ ] Aucune donnée réelle, aucun secret
- [ ] Matrice de visibilité étendue si une donnée personne est exposée
- [ ] OpenAPI à jour si un endpoint change
- [ ] Migration testée sur base vierge si le schéma change

## Questions / écarts constatés
(Points ouverts rencontrés, contradictions avec docs/ : ne pas les trancher soi-même)
```

## 5. Règles de coordination

- **Un fichier, un agent à la fois.** Deux tickets qui touchent le même module se font **en série**, pas en parallèle.
- **Zones protégées** (`AGENTS.md` §8) : un agent qui y touche sans brief voit sa PR refusée.
- **Dépendances entre tickets** : le brief indique « dépend de #n » ; ne démarre pas avant le merge.
- **Conflit de merge** : c'est l'agent de la PR la plus récente qui rebase, jamais l'agent concurrent.
- **Blocage** : label `needs-architect` + question posée en commentaire. L'agent ne devine pas.
- **Quota épuisé** : voir `docs/agents/roster.md` §5.

## 6. Spikes et jalons

- Les spikes **SP-1 à SP-3** (doc 07 §3) sont confiés à un seul agent chacun, sous la supervision de l'architecte, **avant** M2, M3 et M7 respectivement.
- Un jalon est terminé quand ses critères de sortie (doc 07 §4) sont vérifiés par la CI, pas seulement par l'agent.
