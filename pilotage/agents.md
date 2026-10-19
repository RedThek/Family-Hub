# Registre des agents

Noms courts à utiliser dans `assigné:`, les claims, les journaux et les commits.

| Nom court | Outil | Rôle | Terminal | Remarques (à compléter par Mola) |
|---|---|---|:-:|---|
| `claude` | Claude | **Architecte** : orchestre, découpe, assigne, valide les jalons, tranche les écarts techniques | selon l'interface | |
| `copilot` | GitHub Copilot | Réalisation | à renseigner | |
| `gemini` | Gemini | Réalisation | à renseigner | |
| `codex` | Codex | Réalisation | à renseigner | |
| `mistral` | Mistral | Réalisation | à renseigner | |
| `grok` | Grok | Réalisation | à renseigner | |
| `mola` | Propriétaire | Tranche les questions, désigne les validateurs | oui | |

## Règles d'assignation (recommandées)

1. Plans gratuits = **quotas courts et interruptions fréquentes** : confier de préférence des tâches **S**, une par session.
2. L'architecte assigne en posant `assigné: <agent>` sur des tâches `TODO` (outil : `assign <ID> <agent>`).
3. **Réalisation et validation par des agents différents** autant que possible. Ex. réalise `copilot`, valide `gemini` ou `claude`.
4. Un agent **sans terminal** ne passe jamais une tâche en `DONE` (voir protocole §6).
5. Les tâches de sécurité (matrice de visibilité, autorisation, historique en ajout seul, anonymisation) sont validées par `claude` ou par un second agent, jamais par leur réalisateur.
6. Un agent indisponible → ses tâches `assigné:` restent réservées jusqu'à ce que son claim soit périmé ; l'architecte peut alors les ré-assigner (`assign`).
