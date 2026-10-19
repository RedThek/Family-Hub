# 02 — Règles métier

| | |
|---|---|
| **Statut** | Brouillon v0.1 |
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
| **Branche** | Lignée familiale servant de périmètre aux rôles. |
| **Maison** | Sous-ensemble d'une branche polygame, rattaché à une épouse. |
| **PendingChange** | Modification proposée, en attente de décision. |
| **FieldHistory** | Historique définitif au niveau du champ, uniquement pour les changements approuvés. |
| **ChangeLog** | Historique général des événements approuvés (union créée, document ajouté…). |
| **Revendication** | Rattachement d'un Account à une Person existante, fait par l'admin. |
| **Vivant** | Personne sans date de décès renseignée. 🟡 |

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
- **RG-VIS-07** 🟡 La visibilité effective d'une donnée est **la plus restrictive** entre le niveau du profil et les règles automatiques (RG-VIS-04, RG-VIS-05). ❓ P1
- **RG-VIS-08** 🟡 Les catégories de données sont : *Généralités* (noms, parenté, années), *Détails* (dates complètes, lieux), *Médias et documents* (photo, pièces jointes). Le niveau de visibilité s'applique par catégorie à l'intérieur d'un profil. ❓ P1
- **RG-VIS-09** 🟡 La visibilité est appliquée à **toutes les surfaces** : arbre, recherche, historique, notifications, exports.

## 3. Rôles et permissions

- **RG-ROL-01** ✅ Le système de rôles est un **RBAC générique et extensible**, pas de rôles codés en dur.
- **RG-ROL-02** ✅ Une attribution de rôle est **scopée** (par branche, par exemple) plutôt que globale par défaut.
- **RG-ROL-03** ✅ Rôles initiaux, fournis comme données de départ (seed) :

| Rôle | Portée | Capacités principales |
|---|---|---|
| Lecteur | Public | Lecture du profil public |
| Contributeur | Global | Proposer des modifications, rechercher, consulter l'historique |
| Modérateur | Global ou par branche 🟡 | Valider ou rejeter des modifications |
| Éditeur de branche (chef de famille) | Sa lignée directe | Éditer sa branche, inviter |
| Co-éditeur de maison | Sa maison | Éditer les liens de sa maison |
| Admin | Global | Tout, y compris trancher, fusionner, modifier la visibilité |
| Co-admin | Global | Mêmes droits que l'admin (RG-CON-01) |

- **RG-ROL-04** ✅ Toute personne ayant un compte approuvé est contributeur.
- **RG-ROL-05** ✅ L'admin est aussi éditeur.
- **RG-ROL-06** ✅ Les modérateurs de confiance sont choisis par l'admin.
- **RG-ROL-07** 🟡 Les politiques propres à la culture familiale (genre du chef de famille, ordre de succession) sont des **règles de politique configurables** attachées au rôle, pas du code dans le contrôleur.

## 4. Chefs de famille et succession

- **RG-FAM-01** ✅ Le chef de famille est **nommé directement par l'admin**.
- **RG-FAM-02** ✅ Si l'admin est indisponible, la désignation passe par **élection ou validation des membres de la branche**. (Différé après le MVP, voir cadrage 5.2.)
- **RG-FAM-03** ✅ Le chef de famille doit être un homme et édite **uniquement sa lignée directe** (frères, sœurs, enfants, etc.).
- **RG-FAM-04** ✅ Si une branche n'a pas de descendant masculin direct, la **fille aînée devient éditrice automatiquement**, en attendant que l'admin désigne un chef définitif. ❓ P3
- **RG-FAM-05** ✅ L'épouse du chef de famille peut devenir **successeure** et éditer la branche dont elle est issue, **seulement** s'il n'y a pas déjà de chef nommé ou élu dans cette branche. ❓ P2, P3
- **RG-FAM-06** ✅ En polygamie, le chef de famille reste éditeur principal des liens de parenté directe. Un **co-éditeur par « maison »** (branche maternelle) existe en sous-répartition.

## 5. Modération (incluse dans le MVP)

### 5.1 Principe

- **RG-MOD-01** ✅ Toute modification d'un contributeur passe par une **file de modération** avant d'être visible par tous.
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
- **RG-MOD-09** 🟡 Un modérateur **ne peut pas approuver ses propres changements**. Principe des quatre yeux. ❓ P4
- **RG-MOD-10** 🟡 L'approbation applique le changement et écrit l'historique **dans une seule transaction** (tout ou rien).
- **RG-MOD-11** 🟡 Si la donnée cible a changé depuis la soumission (conflit de version), la décision est bloquée et le conflit est présenté à l'admin (RG-MOD-03).
- **RG-MOD-12** 🟡 Un rejet exige un **motif**, visible par l'auteur.
- **RG-MOD-13** ❓ P4 Les modifications des éditeurs et de l'admin sont-elles soumises à modération ?

## 6. Doublons et fusion

- **RG-DUP-01** ✅ Avant de créer une personne, le contributeur voit une **recherche et des suggestions** de personnes similaires.
- **RG-DUP-02** ✅ L'admin dispose d'un **mécanisme de fusion** si des similitudes sont détectées entre personnes existantes.
- **RG-DUP-03** 🟡 La fusion réattribue tous les liens (filiations, unions, documents) à la personne conservée et **trace l'opération** dans le ChangeLog. ❓ P5

## 7. Historique

- **RG-HIS-01** ✅ Historique **au niveau du champ** : « date de naissance modifiée de X à Y par untel le [date] ».
- **RG-HIS-02** ✅ Historique **général** pour les événements non scalaires (ajout de document, création d'union…).
- **RG-HIS-03** ✅ Consultable par les membres.
- **RG-HIS-04** 🟡 L'historique respecte la visibilité : un ancien ou nouveau contenu d'un champ n'est montré qu'à ceux qui ont le droit de voir ce champ. ❓ P1, P6

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
| **RG-NOT-02** ✅ | Nouvelle personne dans sa branche | Membres de la branche | 🟡 Non |
| **RG-NOT-03** ✅ | Fiche modifiée par quelqu'un d'autre | Personne concernée / éditeur | 🟡 Non |
| **RG-NOT-04** ✅ | Anniversaires des vivants | Membres | 🟡 Non |
| **RG-NOT-05** ✅ | Dates commémoratives de décès | Membres | 🟡 Non |

## 11. Continuité

- **RG-CON-01** ✅ Au moins **un co-admin ou successeur** est désigné dès le départ.
- **RG-CON-02** 🟡 Le co-admin a les mêmes droits que l'admin. Le système **empêche** de retirer le dernier admin ou co-admin.
- **RG-CON-03** 🟡 Le projet ne peut pas être configuré sans au moins un co-admin désigné avant l'ouverture aux contributeurs.

---

## 12. Points ouverts

Ces points relèvent de contradictions, d'ambiguïtés ou de cas non couverts, repérés en consolidant tes décisions. Les trancher avant la conception du RBAC (doc 03/05).

| # | Question | Pourquoi c'est important | Proposition par défaut |
|---|---|---|---|
| **P1** | La visibilité est « par profil » : s'applique-t-elle à tout le profil ou par catégorie de données (généralités, détails, médias) ? | Détermine le modèle de données de la visibilité. | Par catégorie, avec le niveau le plus restrictif qui l'emporte (RG-VIS-07/08). |
| **P2** | « Elle édite la branche **dont elle est issue** » (RG-FAM-05) : la branche de son mari ou sa propre branche de naissance ? | Change le périmètre de permissions de l'épouse. | À préciser par toi ; modéliser comme un scope configurable. |
| **P3** | Si une branche n'a pas de chef, l'épouse (RG-FAM-05) et la fille aînée (RG-FAM-04) sont toutes deux éligibles : laquelle prime ? Et RG-FAM-03 (chef = homme) vs RG-FAM-05 (épouse successeure) : l'épouse devient-elle « chef » ou « éditrice » avec les mêmes droits ? | Évite deux éditrices simultanées et un cas non défini. | Ordre de priorité explicite et un seul éditeur « par défaut » par branche. |
| **P4** | Les éditions de l'admin, des éditeurs de branche et des modérateurs passent-elles par la modération ? | Pilote la charge de modération et la simplicité du workflow. | Admin : direct. Éditeur dans son périmètre : direct. Modérateur : soumis à un autre modérateur ou à l'admin. À valider. |
| **P5** | La fusion de doublons est-elle réversible ? | Impacte l'historique et le stockage des données fusionnées. | Réversible pendant une période définie, via ChangeLog. |
| **P6** | Historique vs droit à l'effacement : que se passe-t-il à la demande de suppression d'une personne vivante ? | Conflit RGPD potentiel avec RG-MOD-04 et RG-HIS. | Anonymiser les valeurs de l'historique plutôt que supprimer les lignes. À valider (doc 05). |
| **P7** | Les filtres « générations » comptent-ils les liens adoptifs ? Comment afficher les demi-frères via un parent adoptif ? | Détermine les requêtes de graphe. | Option explicite « inclure les liens adoptifs », activée par défaut. |
| **P8** | Quand le modérateur est un contributeur de la branche concernée, son périmètre est-il limité à sa branche ? | Définit le scope des modérateurs. | Modérateurs globaux ou par branche, au choix de l'admin. |
| **P9** | Quel est l'état « approuvé » d'un compte ? Qui approuve (admin seul, ou aussi éditeurs) ? | Détermine le flux d'inscription. | Admin ou co-admin, sur invitation. |
