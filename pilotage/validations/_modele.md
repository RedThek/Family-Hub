# Validation {{ID}}

- tâche ou jalon: {{ID}}
- réalisateur: (agent, fichier journal de réalisation)
- validateur: {{AGENT}}
- date (UTC): {{DATE}}
- verdict: en cours

> `verdict` : `validé`, `refusé` ou `partiel`. Un verdict `validé` est exigé pour passer en `DONE`. Le validateur n'est pas la session qui a réalisé.

## Preuves de réalisation (remplies par le réalisateur)

- Commits / branche : …
- Commandes et sorties résumées : …

## Critères d'acceptation (copier depuis la tâche, un par ligne)

- [ ] …

## Preuves du validateur (commandes rejouées, résultats)

```
$ …
```

## Écarts constatés

- (aucun / liste ; si `refusé` ou `partiel`, ce qu'il reste à faire)

## Contrôles transverses

- [ ] Aucune donnée personnelle réelle dans le code, les tests, les journaux
- [ ] Visibilité : cas ajoutés à la matrice si une personne est exposée
- [ ] OpenAPI régénérée si l'API change
- [ ] Documentation versionnée si une règle ou un modèle change
- [ ] Journal de session présent et à jour
