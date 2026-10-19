# 05 — Sécurité et confidentialité

| | |
|---|---|
| **Statut** | Brouillon v0.1 |
| **Dépend de** | 02-regles-metier (v0.4), 03-modele-domaine (v0.3), 04-architecture (v0.2) |
| **Alimente** | 06-api, 07-plan-livraison, tests de sécurité |

> Légende : ✅ découle d'une règle ou décision validée · 🟡 proposition à valider.
> Ce document décrit des mesures techniques et organisationnelles. Les passages sur la conformité juridique donnent des repères, **pas un avis juridique** : le cadre applicable dépend du lieu de résidence des membres et doit être vérifié auprès d'un juriste.

---

## 1. Objectifs de sécurité

| # | Objectif | Origine |
|---|---|---|
| OS-01 | Aucune donnée n'est exposée à un demandeur qui n'y a pas droit, sur **aucune surface** (arbre, recherche, historique, notifications, exports, fichiers). | RG-VIS-09, EA-01 |
| OS-02 | Les personnes **vivantes** sont protégées par défaut, même si elles n'ont jamais eu de compte. | RG-VIS-05 |
| OS-03 | Toute modification est **attribuable** et **non répudiable** : qui, quoi, quand, avec quelle validation. | RG-HIS, RG-MOD |
| OS-04 | Un compte compromis ou un rôle abusif a un **rayon d'action limité** (permissions scopées, sessions révocables). | RG-ROL-02 |
| OS-05 | La plateforme **survit** à l'indisponibilité de l'admin et à la perte de données (sauvegardes testées). | RG-CON |
| OS-06 | Les données personnelles collectées sont **minimales**. | Cadrage, § confidentialité |

## 2. Actifs et classification des données

| Actif | Exemples | Sensibilité | Catégorie (doc 03) |
|---|---|---|---|
| Identité minimale | noms, prénoms, parenté, année de naissance ou de décès | Faible à moyenne | `general` |
| Détails d'état civil | date et lieu de naissance complets, lieu de décès | Moyenne à élevée (vivants) | `details` |
| Photo | portrait d'une personne | Élevée (vivants, mineurs) | `media` |
| Documents | actes de mariage, de décès, autres | **Élevée** | `media` |
| Comptes | email, mot de passe haché, sessions, invitations | Élevée | — |
| Historique | anciennes valeurs de champs, propositions rejetées | Même sensibilité que la donnée d'origine | selon `data_category` |
| Journaux de sécurité | connexions, accès aux documents | Moyenne | — |

> Aucune donnée de santé, de religion ou d'origine n'est prévue dans le modèle. Tout ajout de champ de ce type exige une revue de ce document.

## 3. Modèle de menaces

| # | Menace | Scénario | Mesures principales |
|---|---|---|---|
| M-01 | **Fuite par défaut de filtrage** | Un endpoint renvoie une entité brute avec des champs réservés. | Visibilité par **projection** (ADR-008) ; DTO par niveau d'accès ; matrice de tests (§4.4). |
| M-02 | **Fuite via l'historique** | Un ancien contenu d'un champ réservé apparaît dans l'historique consultable. | `data_category` sur `FIELD_HISTORY` ; l'historique passe par le même projecteur (RG-HIS-04). |
| M-03 | **Fuite via la recherche, les suggestions de doublons ou l'arbre filtré** | Les résultats révèlent l'existence ou des champs d'un profil masqué. | Mêmes règles de visibilité sur toutes les surfaces ; nœud anonyme pour un profil masqué (§4.3). |
| M-04 | **Moissonnage de l'arbre public** | Un robot parcourt les pages publiques et reconstitue l'arbre. | Identifiants opaques (UUID), limitation de débit, `noindex`, contenu public minimal (§4.2, §10). |
| M-05 | **Élévation de privilèges** | Un éditeur ou un modérateur agit hors de sa branche ou s'attribue des droits. | Autorisation centralisée avec **scope** ; `role.assign` réservé à l'admin ; gardes sur chaque route (§5). |
| M-06 | **Compte volé** | Mot de passe réutilisé, hameçonnage, session volée. | Argon2id, limitation des tentatives, cookies `HttpOnly` et `Secure`, révocation de session, double authentification pour l'admin (§6). |
| M-07 | **Invitation détournée** | Un lien d'invitation est intercepté ou transféré. | Jeton à usage unique, haché, durée limitée, rattaché à un email (§6.3). |
| M-08 | **Fichier malveillant ou piégé** | Un envoi contient un exécutable déguisé ou des métadonnées EXIF révélant une position. | Validation du type par le contenu, taille limitée, **suppression des métadonnées EXIF**, re-encodage des images, bucket privé (§7). |
| M-09 | **Falsification de l'historique** | Un insider modifie ou supprime des traces. | Rôle SQL de l'application sans `UPDATE` ni `DELETE` sur l'historique (ADR-012). |
| M-10 | **Perte de l'admin** | Maladie, décès, perte d'accès. | Co-admin obligatoire avant ouverture (RG-CON-03), procédure de reprise (§11). |
| M-11 | **Injection** | SQL, XSS, CSRF. | Requêtes paramétrées, échappement React, CSP, protection CSRF (§8). |
| M-12 | **Perte ou corruption de données** | Panne, erreur d'exploitation, ransomware. | Sauvegardes chiffrées et **testées** ; hors site (§11). |

---

## 4. Contrôle d'accès et visibilité

### 4.1 Niveaux d'accès et planchers d'ouverture ✅ RG-VIS-01/04/05

**Niveaux d'accès du demandeur**, du moins au plus privilégié :

| Niveau | Qui | Peut voir ce qui est réglé à… |
|---|---|---|
| L0 | Lecteur public (sans compte) | `public` |
| L1 | Connecté non approuvé | `public`, `members_only` |
| L2 | Connecté approuvé (tous rôles non-admin) | `public`, `members_only`, `approved` |
| L3 | Admin et co-admins | tout, y compris `private` |

**Plancher d'ouverture automatique** : niveau **le moins restrictif** qu'une catégorie peut atteindre, quel que soit le réglage du profil. Le niveau effectif est le **plus restrictif** entre le réglage du profil et ce plancher (RG-VIS-07).

| Catégorie | Contenu | Plancher : personne **décédée** | Plancher : personne **vivante ou inconnue** |
|---|---|---|---|
| `general` | noms, prénoms, parenté, année de naissance ou de décès | `public` | `public` (année de naissance seule ; mineurs : voir P15) |
| `details` | date complète, lieux de naissance et de décès | `members_only` | `approved` |
| `media` : photo | portrait | `members_only` | `approved` 🟡 P16 |
| `media` : documents | actes et pièces jointes | `members_only` | `approved` |

**Niveaux par défaut à la création** (réglables par l'admin, sous réserve des planchers) : `general` = `public`, `details` = `approved`, `media` = `approved`.

Les statuts `unknown` sont traités comme **vivants** (RG-VIS-05, doc 03 §3.1).

### 4.2 Résultat par défaut

Avec les niveaux par défaut, un profil apparaît ainsi :

| Contenu | L0 public | L1 connecté non approuvé | L2 connecté approuvé | L3 admin |
|---|:-:|:-:|:-:|:-:|
| Noms, prénoms, parenté, année de naissance/décès | ✓ | ✓ | ✓ | ✓ |
| Date et lieu complets | ✗ | ✗ | ✓ | ✓ |
| Photo | ✗ | ✗ | ✓ | ✓ |
| Documents | ✗ | ✗ | ✓ | ✓ |
| Profil réglé sur `private` | ✗ | ✗ | ✗ | ✓ |

**Page publique** 🟡 : identifiants opaques, en-tête `X-Robots-Tag: noindex` (aucune indexation par les moteurs de recherche), limitation de débit par adresse, aucune recherche accessible sans compte (RG-ARB-01). Un lien permanent est la conséquence directe de « public = visible sans compte » ✅ ; l'option d'un lien de partage **révocable** est proposée au §10 (P18).

### 4.3 Profil masqué dans l'arbre 🟡 P17
Un profil que le demandeur n'a pas le droit de voir est représenté par un **nœud anonyme** (« Membre masqué ») : il conserve la continuité du graphe, mais n'affiche **aucun champ**, ni nom, ni année, ni photo. Le nombre d'enfants ou de parents d'un nœud anonyme n'est pas détaillé au-delà de ce qui est visible par ailleurs.

### 4.4 Application et tests
- **Une seule implémentation** de la règle : `visibilité_effective()` (doc 03 §5.2), appelée par le `PersonProjector`. Aucune entité n'est sérialisée directement.
- **Matrice de tests automatisée** (ADR-013) : pour chaque combinaison (niveau d'accès L0..L3 × catégorie × statut de vie × réglage du profil), vérifier le **contenu exact** du DTO. Les tests sont nommés d'après les règles (`RG-VIS-05_vivant_non_approuve_...`). **Critère de succès du cadrage** : zéro régression sur cette matrice.
- **Tests transverses** : les mêmes cas sont exécutés sur la recherche, l'arbre filtré, l'historique, les suggestions de doublons et les notifications.

### 4.5 Permissions d'édition
La matrice rôles × permissions du doc 03 §4 est la référence. Contrôles de sécurité :
- `role.assign`, `account.approve`, `account.claim`, `visibility.manage`, `person.merge`, `conflict.resolve` : **admin et co-admins uniquement** (RG-MOD-07).
- Les attributions **provisoires** (épouse, fille aînée, RG-FAM-07) sont signalées, révocables, et ne donnent jamais `role.assign`.
- Le dernier admin ou co-admin ne peut pas être retiré (CHK-06).
- Chaque refus d'accès est journalisé (§9).

---

## 5. Autorisation côté serveur ✅ ADR-008

1. Les **guards** NestJS appellent `AuthorizationService.can(account, permission, cible)`. Aucune décision de droits dans un contrôleur ni dans le frontend (le frontend masque des boutons par confort, jamais par sécurité).
2. Le **scope** (branche, maison) est résolu par `PERSON_CLOSURE` (chemins `paternal`) : la requête de portée est testée contre un jeu de données contenant adoptions, polygamie et filles.
3. **Refus par défaut** : une route sans garde explicite est refusée (garde globale + liste blanche).
4. **Pas de référence directe d'objet non contrôlée** (IDOR) : toute lecture ou écriture par identifiant vérifie la permission et la visibilité sur **cet** objet.
5. La décision « direct ou modéré » (doc 03 §5.1) est prise **côté serveur** à partir des permissions, jamais d'un paramètre du client.

---

## 6. Comptes et authentification ✅ ADR-007

### 6.1 Mots de passe et sessions
- **Argon2id**, paramètres révisés à l'exploitation.
- Longueur minimale élevée (12 caractères) plutôt que règles de composition ; vérification contre une liste de mots de passe compromis 🟡.
- Sessions côté serveur en base ; cookie `HttpOnly`, `Secure`, `SameSite=Lax` ; **durée d'inactivité** et durée maximale définies ; **révocation immédiate** lors d'une suspension de compte, d'un changement de mot de passe ou d'un retrait de rôle.
- Limitation des tentatives par compte et par adresse ; message d'erreur identique pour « compte inconnu » et « mot de passe incorrect ».

### 6.2 Double authentification 🟡
Recommandée **dès le MVP pour l'admin et les co-admins** (comptes à fort impact), optionnelle pour les autres rôles ensuite (TOTP + codes de secours). Voir P19.

### 6.3 Invitations et revendication ✅ RG-ACC-01/02
- Jeton aléatoire long, **stocké haché**, usage unique, expiration courte, lié à l'email invité.
- L'invitation par un éditeur crée un compte `pending_approval` ; l'approbation reste à l'admin (P9).
- La **revendication** d'un profil par un compte est une action admin tracée (`CHANGE_LOG`), avec vérification hors ligne de l'identité (l'admin connaît la personne).
- Récupération de compte : lien à usage unique par email ; en cas de doute, l'admin peut réinitialiser, et l'action est journalisée.

---

## 7. Fichiers : photos et documents ✅ ADR-010

| Mesure | Détail |
|---|---|
| Stockage | Bucket **privé** ; aucune URL permanente publique. |
| Accès | URL **signée de courte durée**, émise **après** contrôle de visibilité (ADR-008). |
| Validation à l'envoi | Type MIME **vérifié par le contenu** (pas par l'extension) ; liste blanche (JPEG, PNG, WebP, PDF) ; taille maximale. |
| Métadonnées | **Suppression des métadonnées EXIF** des images (position GPS, appareil, date) ; **re-encodage** des images pour neutraliser les contenus piégés. |
| PDF | Pas d'exécution de contenu actif ; analyse antivirus recommandée avant mise à disposition 🟡. |
| Photo | Une seule par personne (RG-ENT-08) ; vignette optimisée (bande passante, EA-07). |
| Traçabilité | L'accès à un **document** est journalisé (qui, quand, quel document). |
| Suppression | Un fichier retiré est supprimé du stockage après le délai de conservation défini (§9). |

---

## 8. Sécurité applicative

| Domaine | Mesure |
|---|---|
| Entrées | Validation stricte de tous les DTO (liste blanche de champs) ; refus des champs inconnus. |
| Injection SQL | Prisma paramétré ; le **SQL brut** de la closure (ADR-004) n'utilise que des paramètres liés, jamais de concaténation. |
| XSS | Échappement par défaut de React ; **jamais** de HTML brut issu de la saisie ; en-tête **CSP** strict. |
| CSRF | Cookie `SameSite=Lax` + jeton anti-CSRF sur les requêtes qui modifient l'état. |
| CORS | Liste blanche d'origines (le frontend uniquement). |
| En-têtes | HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`/CSP `frame-ancestors`, via `helmet`. |
| Limitation de débit | Par adresse et par compte ; plus strict sur la connexion, l'invitation, la recherche et le public. |
| Dépendances | Mises à jour automatisées (Dependabot), `npm audit` en CI, verrouillage des versions. |
| Secrets | Variables d'environnement, jamais dans le dépôt (`.env*` déjà exclus) ; rotation en cas de fuite. |
| Transport | HTTPS partout, HSTS ; chiffrement des sauvegardes. |
| Droits SQL | Rôles distincts : application (sans `UPDATE`/`DELETE` sur l'historique), migrations, administration. |

---

## 9. Données personnelles et effacement

### 9.1 Principes ✅ OS-06
- **Minimisation** : seules les données utiles à l'arbre sont collectées ; pas de champ libre sensible dans le MVP.
- **Limitation de la finalité** : généalogie familiale ; aucune réutilisation commerciale ou publicitaire.
- **Information** : toute personne invitée est informée de ce qui est stocké sur elle et de ses droits (accès, rectification, opposition, effacement).
- **Personnes vivantes sans compte** : elles figurent dans l'arbre sans avoir consenti. Mesure d'équilibre : visibilité restreinte par défaut (§4.1), et possibilité de **demander la correction, la limitation ou le retrait** de leur fiche à l'admin. Une personne vivante ne peut pas rendre sa fiche *totalement* privée elle-même (RG-VIS-06) ✅ ; en revanche l'admin le peut, notamment pour raison de sécurité.
- **Personnes décédées** : les règles de protection varient selon les pays et peuvent prévoir des droits des proches ; le plancher `members_only` pour les détails (§4.1) est une mesure de prudence.
- **Repère juridique** : si des membres résident dans l'Union européenne, le RGPD s'applique aux données des personnes vivantes. D'autres pays ont leurs propres lois de protection des données. À faire valider avant ouverture à d'autres membres que le cercle initial.

### 9.2 Historique immuable et droit à l'effacement 🟡 P6
Le conflit : RG-MOD-04 et RG-HIS imposent de **conserver** les traces ; une demande légitime d'effacement impose de **retirer** des données personnelles.

**Proposition : l'anonymisation par procédure d'administration.**

| Étape | Action | Effet sur la structure |
|---|---|---|
| 1 | Réception et vérification de la demande par l'admin ; journalisation (sans valeurs). | — |
| 2 | **Anonymisation de la personne** : noms, prénoms, dates, lieux remplacés par des valeurs neutres (« Personne anonymisée »). `life_status` conservé. | Les **liens de parenté sont conservés** : le graphe reste cohérent. |
| 3 | **Suppression physique** de la photo et des documents du stockage objet. | — |
| 4 | **Purge des valeurs** dans `FIELD_HISTORY` (`old_value`, `new_value` remplacés par un marqueur) et dans le `payload` des `PENDING_CHANGE` de cette personne. Les **métadonnées** (qui, quand, quel champ) restent. | L'historique prouve qu'un changement a eu lieu, sans le contenu. |
| 5 | Événement `person_anonymized` dans `CHANGE_LOG`, **sans** valeur personnelle. | Traçabilité de l'opération elle-même. |
| 6 | Les **sauvegardes** contenant les anciennes valeurs expirent selon leur durée de rétention ; la durée est documentée et communiquée. | — |

- Cette procédure s'exécute avec un **rôle SQL d'administration distinct** du rôle de l'application (ADR-012) ; elle est **irréversible** et exige une confirmation explicite.
- **Suppression complète** d'un nœud (au lieu d'une anonymisation) n'est proposée que si la personne n'a **aucun lien** dans l'arbre.

### 9.3 Fusion de doublons et conservation 🟡 P5
La fusion (RG-DUP-03) conserve les deux fiches dans un état **archivé** pendant une durée définie (rendant la fusion réversible), puis les purge. Les données de la fiche archivée suivent la même visibilité que la fiche conservée.

---

## 10. Surveillance, journaux et audit

- **À journaliser** : connexions réussies et échouées, déconnexions, changements de mot de passe, attributions et révocations de rôles, approbations de comptes, changements de visibilité, fusions, anonymisations, **accès aux documents**, refus d'autorisation.
- **À ne pas journaliser** : mots de passe, jetons, contenu des champs personnels, cookies de session. Les journaux d'application ne contiennent que des **identifiants**, jamais des noms.
- **Séparation** : le journal de sécurité est distinct de `CHANGE_LOG` (historique métier).
- **Rétention** : durée limitée et documentée (par exemple 12 mois), accès réservé à l'admin.
- **Alertes** 🟡 : échecs de connexion répétés, pic d'accès au public, création de rôle admin, tentative de suppression du dernier admin.

---

## 11. Sauvegardes, continuité et incidents

### 11.1 Sauvegardes ✅ OS-05
- Base **et** stockage objet sauvegardés **quotidiennement**, chiffrés, copie **hors site** ; objectif initial 🟡 : perte maximale de données de **24 h**, reprise sous **48 h**.
- **Test de restauration planifié** (par exemple trimestriel) : une sauvegarde non testée n'est pas une sauvegarde.

### 11.2 Perte d'accès de l'admin ✅ RG-CON
- Au moins un **co-admin** désigné avant l'ouverture aux contributeurs (RG-CON-03), avec les mêmes droits (RG-CON-02).
- **Codes de secours** (double authentification) conservés hors ligne.
- **Procédure d'urgence** (« bris de glace ») documentée : accès au serveur par le responsable technique, réinitialisation d'un admin, traçabilité de l'opération.

### 11.3 Réponse à incident 🟡
1. Détecter et contenir (révoquer sessions, suspendre comptes, couper l'accès public si besoin).
2. Évaluer les données touchées (via les journaux, §10).
3. Informer les personnes concernées et, si la loi applicable l'exige, l'autorité compétente dans les délais légaux.
4. Corriger la cause, restaurer si nécessaire, documenter les enseignements.

---

## 12. Exigences de sécurité du MVP (checklist)

| # | Exigence | Vérification |
|---|---|---|
| S-01 | Visibilité par projection ; aucun DTO généré depuis une entité brute. | Revue de code + test d'architecture |
| S-02 | Matrice de visibilité L0..L3 × catégorie × statut de vie. | Tests automatisés en CI |
| S-03 | Garde d'autorisation globale, refus par défaut. | Test : toute route non listée renvoie 403 |
| S-04 | Contrôle d'objet (IDOR) sur toutes les lectures par identifiant. | Tests d'intégration |
| S-05 | Sessions serveur, Argon2id, limitation des tentatives. | Tests + revue |
| S-06 | Invitations à jeton haché, usage unique, expiration. | Tests |
| S-07 | Fichiers : validation par contenu, EXIF supprimé, bucket privé, URL signées. | Tests + revue |
| S-08 | Historique en ajout seul (droits SQL). | Test de permission base |
| S-09 | CSP, CSRF, CORS, en-têtes de sécurité, limitation de débit. | Tests + scan |
| S-10 | Journal de sécurité (accès documents inclus), sans donnée personnelle. | Revue |
| S-11 | Co-admin désigné avant ouverture ; impossibilité de retirer le dernier admin. | Test CHK-06 |
| S-12 | Sauvegardes chiffrées, restauration testée. | Procédure documentée |
| S-13 | Procédure d'anonymisation documentée et testée sur données de test. | Test |

## 13. Points ouverts

| # | Question | Pourquoi c'est important | Proposition par défaut |
|---|---|---|---|
| **P6** | Valides-tu la procédure d'**anonymisation** (§9.2) comme réponse à l'effacement ? | Conflit entre historique immuable et droit à l'effacement. | Oui : anonymisation avec liens de parenté conservés et purge des valeurs d'historique. |
| **P15** | Mineurs vivants : année de naissance masquée au public et photo réservée aux comptes approuvés ? | Protection renforcée des enfants. | Oui. |
| **P16** | Photo d'une personne vivante réservée aux comptes approuvés ? | RG-VIS-05 ne la cite pas explicitement. | Oui (plancher `approved`, §4.1). |
| **P17** | Un profil masqué apparaît comme **nœud anonyme** dans l'arbre ? | Éviter la fuite d'identité et la rupture du graphe. | Oui (§4.3). |
| **P18** | Lien public permanent, ou **lien de partage révocable** que l'admin peut désactiver ? | Maîtrise du moissonnage et possibilité de fermer l'accès public. | Public permanent au MVP avec `noindex` et limitation de débit ; lien révocable en évolution. |
| **P19** | Double authentification obligatoire pour l'admin et les co-admins dès le MVP ? | Comptes à fort impact. | Oui. |
| **J-01** | Quel cadre juridique s'applique (résidence des membres) ? | Détermine les obligations de déclaration, d'information et de notification. | À faire valider par un juriste avant ouverture hors du cercle initial. |
