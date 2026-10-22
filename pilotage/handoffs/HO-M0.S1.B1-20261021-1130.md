# Handoff M0.S1.B1

- statut: repris
- tâche: M0.S1.B1
- agent sortant: claude (architecte)
- destinataire: gemini
- date (UTC): 2026-10-21T11:30:00Z
- repris par: gemini (journal/20261021-1220-gemini-fix-images-s3-m0-s1-b1.md)

> Consigne de correction pour **gemini** (réalisation). Gemini a refusé la validation de M0.S1.B1 le 2026-10-21 (`validations/M0.S1.B1.md`, verdict refusé) : `docker compose up --build` échoue car les images `minio/minio` et `minio/mc` ne sont plus téléchargeables. Cette note dit quoi changer, comment le vérifier et comment le consigner.
>
> **Limite importante** : l'architecte n'a pas pu exécuter Docker ni accéder au dépôt pour écrire ce handoff. Tout ce qui est marqué « à vérifier » doit être contrôlé par toi. Les extraits de code sont des propositions, pas du code testé.

## 1. Problème et faits établis

- MinIO est devenu une distribution **source seule** (annoncé le 2025-10-15) et n'a plus d'images publiques : `pull access denied for minio/minio` sur Docker Hub, et d'après des retours récents Quay ne sert plus non plus ces images. Le dépôt amont dit de construire soi-même les conteneurs.
- `bitnami/minio` est lui aussi retiré. `bitnamilegacy/minio` existe mais est figé (aucune mise à jour de sécurité) : à éviter.
- **Remplaçant retenu : Silo** (`pgsty/silo`), fork communautaire de MinIO maintenu par Pigsty, sous licence AGPL-3.0 comme MinIO. Il garde l'API S3, les variables `MINIO_ROOT_USER` / `MINIO_ROOT_PASSWORD`, le port 9000, la console 9001 et les routes `/minio/*`. Un client compatible est publié séparément : `pgsty/mc`. Les deux sont sur Docker Hub (`docker.io/pgsty/silo`, `docker.io/pgsty/mc`).
- Un test tiers (merge request GitLab Runner) a constaté avec `pgsty/silo:latest` : le conteneur démarre, `/minio/health/live` répond 200, une requête anonyme sur le bucket répond 403.
- Les notes de version de Silo annoncent un tag `RELEASE.2026-09-16T00-00-00Z`. **À vérifier** : existence réelle du tag pour `pgsty/silo` **et** pour `pgsty/mc`.
- Choix de remplaçant consigné dans `decisions/DEC-0002-image-s3-locale-silo.md` (statut `proposée`, fournie avec ce handoff). Elle est locale et réversible : tu peux avancer sans attendre qu'elle passe à `acceptée`.

## 2. État exact

- Tâche M0.S1.B1 : **DOING**, mais le claim `pilotage/claims/M0.S1.B1.md` est ton ancien claim de **validation** (`rôle: validation`) : l'outil `set … DOING` ne le libère pas. Il faut le remplacer par un claim de **réalisation**.
- Branche : aucune branche de correction n'existe. Ne pas supposer que `agent/M0.S1.B1-validation` est fusionnée dans `main` : vérifier (`git branch --merged main`).
- Dernier commit, état du dépôt : non vérifiés par l'architecte. Lancer `git status` et `git log --oneline -5`.

## 3. Consigne, étape par étape

### Étape 0 — Reprise et claim

```powershell
node pilotage/outils/pilotage.mjs reprise
git status
git branch --merged main            # agent/M0.S1.B1-validation y est-elle ?
git switch main; git pull
git switch -c agent/M0.S1.B1-images-s3   # partir de la branche de validation si elle n'est pas fusionnée

# libérer TON ancien claim de validation, puis réserver en réalisation
Remove-Item pilotage/claims/M0.S1.B1.md
git add -A
git commit -m "chore(pilotage): libère le claim de validation M0.S1.B1"
node pilotage/outils/pilotage.mjs claim M0.S1.B1 gemini
git add -A
git commit -m "chore(pilotage): claim M0.S1.B1"
node pilotage/outils/pilotage.mjs journal gemini fix-images-s3-m0-s1-b1
```

Dans le journal : « Contexte de reprise » = ce handoff, ton journal `20261021-1004-gemini-validation-m0-s1-b1.md` et le refus de validation. Reprise d'un travail interrompu : non (correction après refus).

### Étape 1 — Vérifier les images **avant** de modifier quoi que ce soit

```powershell
docker pull pgsty/silo:RELEASE.2026-09-16T00-00-00Z
docker pull pgsty/mc:RELEASE.2026-09-16T00-00-00Z
docker run --rm --entrypoint /bin/sh pgsty/silo:RELEASE.2026-09-16T00-00-00Z -c "command -v curl; command -v mc; command -v mcli"
docker run --rm --entrypoint /bin/sh pgsty/mc:RELEASE.2026-09-16T00-00-00Z -c "command -v mc; command -v mcli"
```

À consigner dans le journal :
- les deux tags existent-ils ? Sinon prendre le tag daté le plus récent listé sur Docker Hub, **jamais `latest`** (pas de version contractuelle) ;
- le binaire client s'appelle-t-il `mc` ou `mcli` dans `pgsty/mc` ? `curl` existe-t-il dans `pgsty/silo` (l'image est basée sur un UBI minimal, il est possible qu'il manque) ?

### Étape 2 — Modifier `docker-compose.yml` (services `minio` et `minio-init` seulement)

Règles : garder **les noms de services, les noms de variables `MINIO_*`, les ports, les volumes et le bucket `family-hub`**. Ainsi `.env.example`, l'API et le reste ne changent pas.

Proposition (non testée), à adapter selon l'étape 1 :

```yaml
  minio:
    image: pgsty/silo:RELEASE.2026-09-16T00-00-00Z   # fork communautaire de MinIO, voir DEC-0002
    command: server /data --console-address ":9001"
    # environment, ports, volumes : inchangés
    # healthcheck : conserver le `curl -f http://localhost:9000/minio/health/live`
    #               seulement si curl existe dans l'image ; sinon supprimer le bloc
    #               (rien ne dépend de la santé de minio : api utilise service_started)

  minio-init:
    image: pgsty/mc:RELEASE.2026-09-16T00-00-00Z
    depends_on:
      - minio
    # environment : inchangé
    entrypoint: >
      /bin/sh -c "
      until mc alias set local http://minio:9000 $$MINIO_ROOT_USER $$MINIO_ROOT_PASSWORD; do sleep 1; done &&
      mc mb --ignore-existing local/$$MINIO_BUCKET &&
      mc anonymous set none local/$$MINIO_BUCKET
      "
```

Remplacer `mc` par `mcli` si c'est le nom du binaire. La boucle `until` remplace le `sleep 5` fragile.

Si le client dans `pgsty/mc` pose problème, deuxième option : réutiliser l'image `pgsty/silo` elle-même pour `minio-init` (les notes de version indiquent que le client y est intégré sous le nom `mcli`), avec `entrypoint` surchargé. À vérifier, ne pas supposer.

### Étape 3 — Références à mettre à jour (périmètre autorisé)

- `README.md` : mentions de MinIO (stack, démarrage local, console) → « Silo, fork communautaire compatible MinIO ». Garder l'URL de la console si elle répond toujours sur 9001.
- `.env.example` : commentaire `# MinIO (stockage objet privé, ADR-010)` → préciser « image Silo, compatible MinIO ». **Aucun nom de variable ne change.**

**Ne pas toucher** : `docs/` (aucune version, ADR-010 reste valable : le principe est « stockage compatible S3, bucket privé »), le code de l'API, `apps/api/Dockerfile`, les autres fichiers de jalon (seul le statut de ta tâche bouge, via l'outil).

### Étape 4 — Vérifier les critères d'acceptation

Critères de la tâche : `docker compose up --build` démarre ; bucket `family-hub` privé.

```powershell
docker compose down -v          # données locales synthétiques uniquement
docker compose pull             # noter quelles images échouent éventuellement
docker compose up --build -d
docker compose ps               # tous les services attendus sont "running"
docker compose logs minio-init  # bucket créé, anonymous set none sans erreur
curl.exe -s http://localhost:3000/api/v1/health      # {"status":"ok","db":"up"}
curl.exe -s -o NUL -w "%{http_code}" http://localhost:9000/family-hub/   # attendu : 403 (pas 200)
```

Sous PowerShell, utiliser `curl.exe` (l'alias `curl` est `Invoke-WebRequest`). Pour `pnpm`, rester sur `corepack pnpm`.

Consigner dans le journal **les sorties réelles** (commande, résultat). Si le bucket répond 200 anonymement : c'est un échec du critère « privé », ne pas passer en REVIEW.

**Point à éclaircir** : ton rapport de refus liste `No such image: postgres:16-alpine`, alors que ton journal dit que `docker pull postgres:16-alpine` a réussi. Relance `docker compose pull` et note précisément quelle image échoue ou non. Ne recopie pas le doute : tranche-le.

### Étape 5 — Consigner

1. Copier `pilotage/decisions/DEC-0002-image-s3-locale-silo.md` (fourni) et le committer avec la correction. Y ajouter à la fin une ligne « Vérification » avec le tag réellement retenu.
2. Dans `pilotage/01-etat-des-lieux.md` §6, ajouter (ajout daté, ne pas réécrire les autres lignes) :

   | ECART-008 | 2026-10-21 | Images `minio/minio` et `minio/mc` retirées de Docker Hub (MinIO distribué en source seule) : `docker compose up --build` échoue | M0.S1.B1, DEC-0002 | ouvert |

3. Journal : une ligne par action, commandes et sorties, tâches dont l'état change, DEC-0002, questions.

### Étape 6 — Passer en REVIEW (et ne pas valider toi-même)

```powershell
node pilotage/outils/pilotage.mjs set M0.S1.B1 REVIEW
Copy-Item pilotage/validations/_modele.md pilotage/validations/M0.S1.B1-r2.md
```

- **Ne pas écraser** `validations/M0.S1.B1.md` : c'est le refus, il reste comme historique. La re-validation va dans `validations/M0.S1.B1-r2.md` (l'outil `validation` refuse de créer un fichier qui existe déjà, d'où la copie manuelle).
- Dans `-r2`, remplacer les marqueurs `{{ID}}` (M0.S1.B1), `{{AGENT}}` (laisser « à désigner ») et `{{DATE}}`, et remplir **« Preuves de réalisation »** uniquement. Laisser `verdict: en cours`.
- **Tu as réalisé la correction : tu ne peux pas la valider** (protocole §2 étape 7, `agents.md` règle 3). Validateur recommandé : `copilot` ; `claude` en second choix. Le validateur passera ensuite `set M0.S1.B1 DONE --validation validations/M0.S1.B1-r2.md`.

### Étape 7 — Clôture

- Mettre ce handoff à `- statut: repris` et `- repris par: gemini (journal/<ton fichier>)`.
- Journal : `- clôturée: oui`, état de fin, prochaine étape.
- `node pilotage/outils/pilotage.mjs sync` puis `node pilotage/outils/pilotage.mjs check` (0 erreur attendue).
- Commit : `chore(pilotage): clôture session <fichier journal>`. Les commits de code citent l'ID : `fix(infra): remplace les images MinIO retirées par Silo [M0.S1.B1] (ADR-010)`.

## 4. Si ça ne marche pas

- Tag ou image introuvable : essayer `latest` **uniquement pour diagnostiquer**, puis retenir un tag daté précis.
- Silo ne démarre pas, ou le critère « bucket privé » n'est pas démontrable : **ne pas improviser un autre moteur**. `set M0.S1.B1 BLOCKED --notes "raison"`, noter dans le journal, et laisser la décision à Mola.
- Pour mémoire, alternatives écartées sans DEC (voir DEC-0002) : Garage (commandes de layout, clés et bucket à réécrire), construction de MinIO depuis les sources (lourd), `bitnamilegacy/minio` (figé, sans correctifs).

## 5. Pièges

- Pas de donnée réelle, pas de `.env` réel dans le journal ni les captures.
- Les identifiants par défaut du compose (`familyhub`, `familyhub-minio`) sont des valeurs de développement local : ne pas les réutiliser ailleurs.
- AGPL-3.0 : l'image n'est que référencée en développement local, aucun code Silo n'est copié dans le dépôt.
- La production (S3 géré, Q-HEB) n'est **pas** dans le périmètre : ne rien décider à ce sujet.

## 6. Tests rouges connus

- `docker compose up --build` : échec actuel, `pull access denied for minio/mc` et `minio/minio`.

## 7. Sources consultées par l'architecte (2026-10-21)

- Disparition des images : <https://www.stablebuild.com/blog/minio-images-disappeared-from-docker-hub>, <https://github.com/ponack/crucible-iap/issues/387>
- Silo remplaçant direct, test constaté : <https://gitlab.com/gitlab-org/gitlab-runner/-/merge_requests/7649>
- Publications Silo et `pgsty/mc` : <https://github.com/PGSTY/silo/releases>, <https://hub.docker.com/r/pgsty/mc>
