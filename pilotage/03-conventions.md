# 03 — Conventions

## 1. Identifiants

| Objet | Format | Exemple |
|---|---|---|
| Jalon | `M0..M8`, `SP1..SP3` | `M2` |
| Sprint | `<jalon>.S<n>` | `M2.S1` |
| Mission | `<jalon>.S<n>.<lettre>` (Z = clôture) | `M2.S1.A` |
| Tâche | `<jalon>.S<n>.<lettre><n>` | `M2.S1.A3` |
| Décision | `DEC-NNNN` | `DEC-0007` |
| Handoff | `HO-<ID tâche>-<UTC>` | `HO-M2.S1.A3-20261101-1430` |
| Écart | `ECART-NNN` (état des lieux §6) | `ECART-004` |
| Question | `P..`, `J-..`, `Q-..` (questions-ouvertes.md) | `Q-HEB` |

Les identifiants sont **stables** : on ne renumérote jamais. Une tâche abandonnée passe en `SKIPPED`.

## 2. Statuts d'une tâche

`TODO` · `DOING` · `BLOCKED` · `REVIEW` · `DONE` · `SKIPPED`

Transitions autorisées (l'outil refuse les autres) :

| De | Vers |
|---|---|
| TODO | DOING, BLOCKED, SKIPPED |
| DOING | REVIEW, BLOCKED, TODO |
| REVIEW | DONE, DOING, BLOCKED |
| BLOCKED | TODO, DOING |
| DONE | REVIEW (réouverture) |
| SKIPPED | TODO |

Règles : `DOING` exige un claim ; `REVIEW` et `DONE` libèrent le claim ; `DONE` exige un fichier de validation avec `- verdict: validé` ; `BLOCKED` exige une ligne `- notes:`.

## 3. Format d'une tâche (lu par l'outil — ne pas modifier la forme)

```
#### M2.S1.A3 — Titre
- statut: TODO · taille: S · assigné: — · validation: —
- règles: RG-ENT-10 · dépend: M2.S1.A2, M1.S2.A2
- livrables: chemins attendus
- acceptation: critères vérifiables
- notes: (facultatif)
```

- `dépend:` liste d'identifiants séparés par des virgules ; `—` = aucune ; `@jalon` = toutes les tâches du jalon hors mission Z.
- `assigné:` `—` ou nom court de l'agent (`claude`, `copilot`, `gemini`, `codex`, `mistral`, `grok`, `mola`). Sur une tâche `TODO`, signifie « réservée pour » ; un autre agent ne la prend pas sans `--force`.
- `taille:` S (≈ une session), M (≈ deux à trois sessions). Jamais L : découper.
- `validation:` chemin relatif à `pilotage/` (ex. `validations/M2.S1.A3.md`).
- Le texte ne doit pas contenir la séquence ` · ` (séparateur de champs).

## 4. Fichiers

| Type | Nom | Écriture |
|---|---|---|
| Journal | `journal/AAAAMMJJ-HHMM-<agent>-<slug>.md` (UTC) | une session = un fichier ; ajout seul ; une fois `clôturée: oui`, correction par note ajoutée en bas |
| Claim | `claims/<ID tâche>.md` | créé par `claim`, supprimé par `set` |
| Validation | `validations/<ID tâche ou jalon>.md` | un fichier par validation ; verdict `validé`, `refusé` ou `partiel` |
| Handoff | `handoffs/HO-<ID>-<AAAAMMJJ-HHMM>.md` | `- statut: ouvert` → `repris` |
| Décision | `decisions/DEC-NNNN-<slug>.md` | ajout seul ; statut `proposée`, `acceptée`, `remplacée` |

Dates : **UTC**, ISO 8601 (`2026-10-19T14:32:05Z`).

## 5. Git

- Branches : `agent/<ID>-<slug>`.
- Commits : `<type>(<portée>): <résumé> [<ID>] (<RG-…>)` ; types `feat`, `fix`, `test`, `docs`, `chore`, `refactor`. Exemple : `feat(genealogy): détecter les cycles de filiation [M2.S1.B2] (RG-ENT-10)`.
- Commits de pilotage séparés : `chore(pilotage): claim M2.S1.B2`, `chore(pilotage): clôture session <fichier>`.
- Jamais de commit direct sur `main` pour du code ; le pilotage seul peut y aller si le propriétaire l'accepte.

## 6. Documents `docs/`

Versions courantes listées dans `README.md`. Une règle ou un modèle qui change crée `…-v(N+1).md`. Les versions antérieures ne se modifient pas.

## 7. Contrôles réalisés par `check`

- Statuts valides, identifiants uniques, dépendances existantes.
- `DOING` sans claim · claim orphelin · claim sur tâche ni DOING ni REVIEW.
- `DOING/REVIEW/DONE` avec dépendances non terminées.
- `DONE` sans validation « validé ».
- `REVIEW/DONE` sans trace de l'ID dans un journal (avertissement).
- Claim périmé · journal non clôturé > 4 h · handoff ouvert · état des lieux plus ancien que le dernier journal (avertissements).
- `BLOCKED` sans `notes` (avertissement).
