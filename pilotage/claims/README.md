# claims/

Un fichier par tâche en cours : `<ID tâche>.md`. Créé par `pilotage.mjs claim`, supprimé quand la tâche quitte `DOING`/`REVIEW`.

Format (si créé à la main) :

```
# Claim M2.S1.A3

- agent: copilot
- rôle: réalisation
- début: 2026-10-19T14:00:00Z
- heartbeat: 2026-10-19T14:30:00Z
```

`rôle` : `réalisation` ou `validation`. Un claim sans heartbeat depuis plus de 4 h est **périmé** et peut être repris (`--reprendre`).
