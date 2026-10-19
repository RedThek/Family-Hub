# 01 — Cadrage du projet Family-Hub

| | |
|---|---|
| **Statut** | Brouillon v0.1 |
| **Propriétaire** | Mola (admin / product owner) |
| **Dépend de** | — |
| **Alimente** | 02-regles-metier, 03-modele-domaine, 04-architecture |

> Légende : ✅ décision validée · 🟡 proposition à valider · ❓ question ouverte

---

## 1. Vision

Family-Hub est une plateforme web qui héberge **l'arbre généalogique général d'une seule famille** (jusqu'au clan ou à la tribu, si les données le permettent). L'arbre est **collaboratif** : les membres proposent des contributions, qui sont validées avant d'être visibles par tous. Chaque membre peut générer un **arbre personnalisé** à partir de l'arbre général.

La **confidentialité** est le facteur clé : la plateforme expose le minimum de données personnelles, surtout pour les personnes vivantes.

## 2. Objectifs

- O1. Représenter fidèlement des structures familiales complexes : demi-frères et sœurs, adoptions, familles recomposées, unions multiples (polygamie), cousins éloignés.
- O2. Permettre un travail collaboratif contrôlé (permissions par rôle et par branche, modération, historique).
- O3. Protéger les données personnelles par défaut (visibilité à 4 niveaux, règle automatique pour les personnes vivantes).
- O4. Permettre une croissance sans limite arbitraire de l'arbre, vers le haut et vers le bas.
- O5. Garantir la continuité du projet si l'admin est indisponible.

## 3. Non-objectifs

- Plateforme multi-familles ou SaaS : **un seul arbre général**, géré par un admin.
- Extraction automatique de données depuis les documents (OCR) : les métadonnées sont saisies à la main.
- Galerie de photos d'événements : **une seule photo par personne**.
- Réseau social (messagerie, fil d'actualité, commentaires).

## 4. Acteurs

| Acteur | Description | Compte requis |
|---|---|---|
| **Lecteur public** | Toute personne accédant à la plateforme sans compte (via un lien). Voit le strict minimum. | Non |
| **Membre connecté** | Personne avec un compte, avant approbation. | Oui |
| **Contributeur** | Membre connecté et approuvé. Propose des modifications soumises à modération. | Oui |
| **Modérateur** | Contributeur de confiance désigné par l'admin. Valide ou rejette les modifications en attente. | Oui |
| **Éditeur de branche** (chef de famille) | Responsable de sa lignée directe. Nommé par l'admin. | Oui |
| **Co-éditeur de « maison »** | Sous-répartition par épouse en contexte polygame. | Oui |
| **Admin** | Propriétaire du projet. Tranche les conflits, gère rôles, fusions et visibilité. | Oui |
| **Co-admin / successeur** | Désigné dès le départ pour assurer la continuité. | Oui |

> Une **personne** de l'arbre peut exister sans jamais avoir de compte (ex. ancêtre décédé). Personne et compte sont deux entités distinctes.

## 5. Périmètre MVP

### 5.1 Inclus ✅

| Domaine | Fonctionnalités |
|---|---|
| **Arbre** | Créer et modifier des personnes, unions (dyadiques, avec statut) et liens parent-enfant (biologique ou adoptif, distincts visuellement et structurellement). |
| **Contenu** | Dates de naissance et de décès, une photo par personne, documents joints (actes de mariage, de décès…). |
| **Comptes** | Invitation par email ou lien (admin ou éditeur), revendication de profil par l'admin. |
| **Rôles** | RBAC générique et extensible, attribution scopée (par branche). |
| **Visibilité** | 4 niveaux (public, members_only, approved, private) et règle automatique pour les vivants. |
| **Modération complète** | File d'attente de modifications, notifications à l'admin et aux modérateurs, approbation et rejet, conservation des rejets, arbitrage des conflits par l'admin. |
| **Historique** | Au niveau du champ, plus historique général (documents, unions…). Les deux sont alimentés uniquement par les changements approuvés. |
| **Doublons** | Suggestion avant création pour le contributeur, fusion par l'admin. |
| **Recherche** | Recherche par nom dans tout l'arbre, selon les permissions. |
| **Arbre personnalisé** | Affichage selon filtres : générations en amont et aval, branche, conjoints, demi-frères et sœurs. |
| **Continuité** | Au moins un co-admin désigné. |
| **Vue publique** | Noms, prénoms, lien de parenté, année de naissance ou de décès. Jamais de photos ni de documents. |

### 5.2 Différé après le MVP 🟡

À valider avec toi : seul le workflow de modération est confirmé dans le MVP.

| Fonctionnalité | Raison du report proposé |
|---|---|
| Export PDF, image, impression de l'arbre filtré | Indépendant du cœur métier, ajoutable sans toucher au modèle. |
| Notifications d'anniversaires et de dates commémoratives | Nécessite un planificateur de tâches, sans valeur critique au départ. |
| Élection du chef de famille par les membres de la branche (admin indisponible) | Cas rare, complexe à spécifier. En MVP, l'admin et les co-admins nomment. |
| Notifications « fiche modifiée / nouvelle personne dans ma branche » | À réévaluer : les notifications de modération, elles, sont dans le MVP. |

## 6. Contraintes

- **Confidentialité** : la visibilité est appliquée **côté serveur**, jamais uniquement côté interface.
- **Traçabilité** : aucun changement approuvé n'est perdu ; les rejets sont conservés.
- **Extensibilité** : les règles culturelles (chef de famille, succession) doivent être des **politiques configurables**, pas du code en dur.
- **Stack** ✅ non arrêtée, à fixer dans le doc 04. Orientation : un seul SGBD, PostgreSQL, avec modélisation de graphe (closure table ou ltree).

## 7. Critères de succès du MVP

- Un arbre réel d'au moins 5 générations avec unions multiples et adoptions est saisissable sans contournement.
- Aucune donnée détaillée d'une personne vivante n'est accessible sans compte approuvé (vérifié par des tests automatisés).
- Une modification proposée traverse le cycle complet : soumission → notification → décision → application → historique.
- Un co-admin peut reprendre l'administration sans intervention de l'admin d'origine.

## 8. Risques

| # | Risque | Mitigation |
|---|---|---|
| R1 | Complexité du graphe (unions multiples, adoptions) sur les requêtes de filtrage. | Prototyper tôt la closure table avec un jeu de données réaliste. |
| R2 | Historique immuable contre droit à l'effacement (RGPD). | Décision à prendre dans le doc 05. |
| R3 | Règles de succession ambiguës ou contradictoires. | Levée des points ouverts du doc 02 avant la conception du RBAC. |
| R4 | Fuite de données via l'historique ou la recherche. | Appliquer la visibilité aussi à l'historique, aux résultats de recherche et aux exports. |
| R5 | Charge de modération sur l'admin. | Modérateurs de confiance, notifications ciblées. |
