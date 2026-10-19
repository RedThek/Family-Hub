# 02 — Règles métier

| | |
|---|---|
| **Statut** | Brouillon v0.3 (P1, P2, P3, P4, P10, P11, P12 tranchés) |
| **Dépend de** | 01-cadrage |
| **Alimente** | 03-modele-domaine, 05-securite-confidentialite, tests d'acceptation |

> Légende : ✅ règle validée · 🟡 interprétation ou complément proposé, à valider · ❓ voir « Points ouverts » (section 12)
>
> Chaque règle a un identifiant stable (`RG-XXX-nn`) à citer dans les tickets, tests et commits.

---

## 0. Glossaire

| Terme | Définition |
|---|---|
| **Person** | Individu représenté dans l'arbre. Peut exister sans compte. |
| **Account** | Compte utilisateur permettant de se connecter. Peut être lié à une Person. |
| **Union** | Relation entre exactement 2 personnes (mariage, etc.), avec un statut. |
| **Lien de filiation** | Lien parent → enfant, de type biologique ou adoptif. |
| **Branche** | Lignée **paternelle** à partir d'une personne fondatrice : le fondateur et ses descendants par les liens père → enfant (filles incluses ; les enfants d'une fille appartiennent à la branche de leur père). Sert de périmètre aux rôles. ✅ |
| **Maison** | Sous-ensemble d'une branche polygame, rattaché à une épouse. |
| **PendingChange** | Modification proposée, en attente de décision. |
| **FieldHistory** | Historique définitif au niveau du champ, uniquement pour les changements approuvés. |
| **ChangeLog** | Historique général des événements approuvés (union créée, document ajouté…). |
| **Revendication** | Rattachement d'un Account à une Person existante, fait par l'admin. |
| **Vivant** | Personne dont le statut de vie n'est pas « décédé ». Le statut de vie est **explicite** (`living`, `deceased`, `unknown`) ; `unknown` est traité comme vivant par prudence. ✅ |

---

## 1. Entités et structure

- **RG-ENT-01** ✅ Person et Account sont deux entités distinctes.
- **RG-ENT-02** ✅ Une Person peut exister sans Account.
- **RG-ENT-03** ✅ Une Union relie **exactement deux** personnes et possède un **statut**.
- **RG-ENT-04** ✅ La polygamie est représentée par **plusieurs Union distinctes** partageant une même personne.
- **RG-ENT-05** ✅ Les enfants sont rattachés **directement à chaque parent**, et non à l'union.
- **RG-ENT-06** ✅ Un lien de filiation est **biologique ou adoptif**. La distinction est structurelle (donnée) et visuelle (affichage).
- **RG-ENT-07** ✅ Aucune limite arbitraire de profondeur : l'arbre s'étend vers le haut et vers le bas.
- **RG-ENT-08** ✅ Une seule photo par personne.
- **RG-ENT-09** ✅ Les documents sont de simples pièces jointes. Leurs métadonnées structurées (date, lieu, témoins) viennent de la saisie de la personne, pas d'une extraction automatique.
- **RG-ENT-10** 🟡 Une Person ne peut pas être son propre ancêtre (le graphe de filiation reste acyclique). Contrôle à l'écriture.
- **RG-ENT-11** ✅ Un enfant a **au plus deux parents biologiques**. Le nombre de parents adoptifs n'est pas limité.
- **RG-ENT-12** ✅ L'appartenance à une branche suit la **ligne paternelle** : on appartient à la branche de son père. Une fille appartient à la branche de son père ; ses enfants appartiennent à celle de leur père.

## 2. Visibilité

- **RG-VIS-01** ✅ Quatre niveaux, du plus ouvert au plus fermé :

| Niveau | Qui voit |
|---|---|
| `public` | Tout le monde, sans compte |
| `members_only` | Compte connecté, même non approuvé |
| `approved` | Compte connecté **et** approuvé |
| `private` | Admin uniquement |

- **RG-VIS-02** ✅ La visibilité se gère **par profil**.
- **RG-VIS-03** ✅ « Public » signifie visible **sans compte**.
- **RG-VIS-04** ✅ Profil visible au public, au maximum : noms et prénoms, lien de parenté et/ou enfants, année de naissance et/ou de décès. **Jamais** de photo ni de document.
- **RG-VIS-05** ✅ Règle automatique pour les **vivants** : date de naissance complète et documents visibles uniquement par les membres connectés et approuvés, jamais par le public.
- **RG-VIS-06** ✅ Une personne vivante ne peut pas rendre sa fiche totalement privée. Seul l'admin peut le faire (ex. raison de sécurité).
- **RG-VIS-07** ✅ La visibilité effective d'une donnée est **la plus restrictive** entre le niveau du profil et les règles automatiques (RG-VIS-04, RG-VIS-05).
- **RG-VIS-08** ✅ Les catégories de données sont : *Généralités* (noms, parenté, années), *Détails* (dates complètes, lieux), *Médias et documents* (photo, pièces jointes). Le niveau de visibilité s'applique par catégorie à l'intérieur d'un profil.
- **RG-VIS-09** 🟡 La visibilité est appliquée à **toutes les surfaces** : arbre, recherche, historique, notifications, exports.

## 3. Rôles et permissions

- **RG-ROL-01** ✅ Le système de rôles est un **RBAC générique et extensible**, pas de rôles codés en dur.
- **RG-ROL-02** ✅ Une attribution de rôle est **scopée** (par branche, par exemple) plutôt que globale par défaut.
- **RG-ROL-03** ✅ Rôles initiaux, fournis comme données de départ (seed) :

| Rôle | Portée | Capacités principales |
|---|---|---|
| Lecteur | Public | Lecture du profil public |
| Contributeur | Global | Proposer des modifications, rechercher, consulter l'historique |
| Modérateur | Global ou par branche 🟡 | Valider ou rejeter des modifications ; édition directe dans son périmètre |
| Éditeur de branche (chef de famille) | Sa lignée directe | Édition directe de sa branche, invitations |
| Co-éditeur(trice) | Sa maison, ou la branche de naissance de l'épouse successeure | Édition directe dans son périmètre ; invitations non incluses par défaut ❓ P14 |
| Admin | Global | Tout, y compris trancher, fusionner, modifier la visibilité |
| Co-admin | Global | Mêmes droits que l'admin (RG-CON-01) |

- **RG-ROL-04** ✅ Toute personne ayant un compte approuvé est contributeur.
- **RG-ROL-05** ✅ L'admin est aussi éditeur.
- **RG-ROL-06** ✅ Les modérateurs de confiance sont choisis par l'admin.
- **RG-ROL-07** 🟡 Les politiques propres à la culture familiale (genre du chef de famille, ordre de succession) sont des **règles de politique configurables** attachées au rôle, pas du code dans le contrôleur.

## 4. Chefs de famille et succession

- **RG-FAM-01** ✅ Le chef de famille est **nommé directement par l'admin**.
- **RG-FAM-02** ✅ Si l'admin est indisponible, la désignation passe par **élection ou validation des membres de la branche**. (Différé après le MVP, voir cadrage 5.2.)
- **RG-FAM-03** ✅ Le chef de famille doit être un homme et édite **uniquement sa lignée directe** : sa branche paternelle (RG-ENT-12).
- **RG-FAM-04** ✅ Si une branche n'a pas de descendant masculin direct, la **fille aînée devient éditrice automatiquement**, en attendant que l'admin désigne un chef définitif. Elle n'intervient qu'à défaut d'une épouse éligible (RG-FAM-07).
- **RG-FAM-05** ✅ L'épouse du chef de famille peut devenir **successeure** avec le titre de **co-éditrice** et éditer **sa branche de naissance** (la branche paternelle dont elle est issue, et non celle de son mari), **seulement** s'il n'y a pas déjà de chef nommé ou élu dans cette branche. Si plusieurs branches la contiennent (emboîtement), la plus proche d'elle sur sa ligne paternelle s'applique. 🟡
- **RG-FAM-06** ✅ En polygamie, le chef de famille reste éditeur principal des liens de parenté directe. Un **co-éditeur par « maison »** (branche maternelle) existe en sous-répartition.
- **RG-FAM-07** ✅ **Ordre de priorité** quand une branche n'a pas de chef nommé ou élu :
  1. l'**épouse** éligible (RG-FAM-05) ; s'il y en a plusieurs, celle dont l'**union est la plus ancienne** (la première épouse mariée) ;
  2. à défaut, la **fille aînée**, si la branche n'a pas de descendant masculin direct (RG-FAM-04) ;
  3. à défaut, l'admin désigne.
  Dans tous les cas, l'attribution automatique est **provisoire** jusqu'à désignation d'un chef par l'admin. Un seul éditeur « par défaut » est actif par branche. Si les dates d'union manquent ou sont égales, l'admin départage.

## 5. Modération (incluse dans le MVP)

### 5.1 Principe

- **RG-MOD-01** ✅ Toute modification d'un **contributeur simple** passe par une **file de modération** avant d'être visible par tous.
- **RG-MOD-00** ✅ Les modifications de l'**admin** (et co-admins), des **éditeurs** (chef de famille, co-éditeur de maison) et des **modérateurs** ne passent **pas** par la modération : elles sont appliquées directement. Elles sont tracées dans l'historique avec la mention « sans modération ».
- **RG-MOD-02** ✅ Chaque modification en attente génère une **notification à l'admin et aux modérateurs**.
- **RG-MOD-03** ✅ En cas de conflit d'information, **l'admin tranche**.
- **RG-MOD-04** ✅ Les `PendingChange` **rejetés sont conservés** (traçabilité), jamais supprimés.
- **RG-MOD-05** ✅ La file de modération et l'historique définitif sont **deux structures séparées**. Seuls les changements approuvés entrent dans l'historique.

### 5.2 Cycle de vie 🟡

```
        soumission
            │
            ▼
        ┌─────────┐   retrait par l'auteur   ┌───────────┐
        │ PENDING │ ───────────────────────► │ WITHDRAWN │
        └─────────┘                          └───────────┘
         │       │
 approbation   rejet (motif obligatoire)
         │       │
         ▼       ▼
   ┌──────────┐ ┌──────────┐
   │ APPROVED │ │ REJECTED │
   └──────────┘ └──────────┘
         │
         ▼
  application + FieldHistory + ChangeLog (même transaction)
```

- **RG-MOD-06** 🟡 Types de changements soumis à modération : création de personne, modification de champ, ajout ou suppression de document, changement de photo, création ou modification d'union, création ou modification de lien de filiation, suppression logique de personne.
- **RG-MOD-07** 🟡 Réservé à l'admin (hors modération) : changement de visibilité d'un profil, fusion de doublons, attribution de rôles, revendication de profil.
- **RG-MOD-08** 🟡 Un changement en attente n'est visible que par son auteur et par les modérateurs et l'admin.
- **RG-MOD-09** 🟡 Un changement est **direct** si l'auteur détient la permission d'édition directe sur la cible (selon son rôle **et son périmètre**) ; sinon il est **proposé** et modéré. Un éditeur qui sort de sa lignée (ou un modérateur hors de son périmètre) retombe donc en contributeur simple pour cette cible. ❓ P8
- **RG-MOD-10** 🟡 L'approbation applique le changement et écrit l'historique **dans une seule transaction** (tout ou rien).
- **RG-MOD-11** 🟡 Si la donnée cible a changé depuis la soumission (conflit de version), la décision est bloquée et le conflit est présenté à l'admin (RG-MOD-03).
- **RG-MOD-12** 🟡 Un rejet exige un **motif**, visible par l'auteur.
- **RG-MOD-13** ✅ Conséquence de RG-MOD-00 : ni l'admin, ni les éditeurs, ni les modérateurs ne créent de `PendingChange` pour leurs propres modifications dans leur périmètre. La file de modération ne contient que les propositions des contributeurs simples (et celles des acteurs hors périmètre).

## 6. Doublons et fusion

- **RG-DUP-01** ✅ Avant de créer une personne, le contributeur voit une **recherche et des suggestions** de personnes similaires.
- **RG-DUP-02** ✅ L'admin dispose d'un **mécanisme de fusion** si des similitudes sont détectées entre personnes existantes.
- **RG-DUP-03** 🟡 La fusion réattribue tous les liens (filiations, unions, documents) à la personne conservée et **trace l'opération** dans le ChangeLog. ❓ P5

## 7. Historique

- **RG-HIS-01** ✅ Historique **au niveau du champ** : « date de naissance modifiée de X à Y par untel le [date] ».
- **RG-HIS-02** ✅ Historique **général** pour les événements non scalaires (ajout de document, création d'union…).
- **RG-HIS-03** ✅ Consultable par les membres.
- **RG-HIS-04** 🟡 L'historique respecte la visibilité : un ancien ou nouveau contenu d'un champ n'est montré qu'à ceux qui ont le droit de voir ce champ. ❓ P6

## 8. Comptes, invitations, revendication

- **RG-ACC-01** ✅ Rejoindre la plateforme se fait par **invitation (email ou lien)** envoyée par l'admin ou un éditeur.
- **RG-ACC-02** ✅ Quand une personne existante rejoint la plateforme, l'**admin** est responsable de la **revendication** de son profil.
- **RG-ACC-03** 🟡 Un nouveau compte est « connecté non approuvé » jusqu'à approbation par l'admin. Le niveau `members_only` correspond à cet état.

## 9. Recherche et arbre personnalisé

- **RG-ARB-01** ✅ Recherche par nom dans tout l'arbre général pour un membre connecté, **sous réserve des permissions de visibilité**.
- **RG-ARB-02** ✅ Tout membre peut générer un arbre personnalisé. Filtres : générations en amont, générations en aval, branche spécifique, inclusion ou exclusion des conjoints et unions, inclusion ou exclusion des demi-frères et sœurs.
- **RG-ARB-03** ✅ Le résultat est affichable et consultable. Export PDF, image et impression : voulus, **différés après le MVP** (cadrage 5.2). 🟡
- **RG-ARB-04** 🟡 Le filtrage tient compte du type de lien (biologique ou adoptif) ; une option d'inclusion des liens adoptifs est proposée. ❓ P7

## 10. Notifications

| Réf. | Événement | Destinataires | MVP |
|---|---|---|---|
| **RG-NOT-01** ✅ | Modification en attente | Admin et modérateurs | Oui |
| **RG-NOT-02** ✅ | Nouvelle personne dans sa branche | Membres de la branche | Non (hors MVP ✅) |
| **RG-NOT-03** ✅ | Fiche modifiée par quelqu'un d'autre | Personne concernée / éditeur | Non (hors MVP ✅) |
| **RG-NOT-04** ✅ | Anniversaires des vivants | Membres | Non (hors MVP ✅) |
| **RG-NOT-05** ✅ | Dates commémoratives de décès | Membres | Non (hors MVP ✅) |

## 11. Continuité

- **RG-CON-01** ✅ Au moins **un co-admin ou successeur** est désigné dès le départ.
- **RG-CON-02** 🟡 Le co-admin a les mêmes droits que l'admin. Le système **empêche** de retirer le dernier admin ou co-admin.
- **RG-CON-03** 🟡 Le projet ne peut pas être configuré sans au moins un co-admin désigné avant l'ouverture aux contributeurs.

---

## 12. Décisions prises

| # | Question | Décision |
|---|---|---|
| **P1** | Visibilité par profil entier ou par catégorie ? | **Par catégorie** : généralités, détails, médias (RG-VIS-08). |
| **P2** | « La branche dont elle est issue » ? | Sa **branche de naissance** (RG-FAM-05). |
| **P3** | Branche sans chef : qui prime ? | L'**épouse d'abord**, puis la fille aînée, puis désignation par l'admin (RG-FAM-07). |
| **P4** | Les modifications de l'admin, des éditeurs et des modérateurs passent-elles par la modération ? | **Non**, application directe et traçabilité (RG-MOD-00, RG-MOD-13). |
| **P10** | Définition de l'appartenance à une branche ? | **Ligne paternelle seule** (RG-ENT-12). |
| **P11** | Statut de vie ? | **Explicite** : `living`, `deceased`, `unknown`. |
| **P12** | Titre de l'épouse successeure ; plusieurs épouses éligibles ? | Titre de **co-éditrice** ; la **première épouse mariée** prime (RG-FAM-05, RG-FAM-07). |
| **CHK-07** | Limite de parents biologiques ? | **Deux au plus** (RG-ENT-11). |
| Notifications | Quelles notifications au MVP ? | Seulement celles de **modération** (RG-NOT-01). |

## 13. Points ouverts

| # | Question | Pourquoi c'est important | Proposition par défaut |
|---|---|---|---|
| **P5** | La fusion de doublons est-elle réversible ? | Impacte l'historique et le stockage. | Réversible pendant une période définie, via ChangeLog. |
| **P6** | Historique vs droit à l'effacement : que faire à la demande de suppression d'une personne vivante ? | Conflit RGPD potentiel avec RG-MOD-04 et RG-HIS. | Anonymiser les valeurs de l'historique plutôt que supprimer les lignes (doc 05). |
| **P7** | Les filtres « générations » comptent-ils les liens adoptifs ? | Détermine les requêtes de graphe. | Option explicite « inclure les liens adoptifs », activée par défaut. |
| **P8** | Le périmètre d'un modérateur est-il global ou limité à une branche ? Son édition directe suit-elle ce même périmètre ? | Définit le scope du rôle Modérateur et de l'édition directe. | Au choix de l'admin à l'attribution du rôle (scope global ou branche). |
| **P9** | Qui approuve un compte (admin seul, ou aussi les éditeurs qui invitent) ? | Détermine le flux d'inscription. | Admin ou co-admin ; l'invitation par un éditeur crée un compte « en attente ». |
| **P13** | Un enfant **adoptif** d'un homme de la branche appartient-il à sa branche (ligne paternelle) ? Et un enfant biologique dont le père n'est pas renseigné ? | Détermine le périmètre de la branche et donc les permissions. | Oui pour l'adoption (lien père → enfant, biologique ou adoptif). Père inconnu : l'enfant n'appartient à aucune branche tant que l'admin n'a pas rattaché. |
| **P14** | Droits exacts de la co-éditrice successeure : peut-elle inviter des personnes ? Peut-elle nommer un chef ? | Évite une escalade de droits involontaire. | Édition directe de sa branche, sans invitation ni nomination (admin seul nomme). |
