# M5 — Branches, rôles scopés et succession

- taille: L
- dépend_jalons: M2, M4
- règles: RG-FAM-01..07, RG-ROL-02/03/07, RG-MOD-09
- référence: docs/07-plan-livraison.md §4 M5

## Objectif

Branches et maisons, périmètre par chemin paternal, rôles scopés, politiques (chef = homme), succession automatique provisoire.

## Critère de sortie

La branche d'un éditeur borne ses droits d'édition directe, et une action hors scope devient une proposition modérée ; tests de succession couvrant polygamie et dates manquantes.

## Notes d'architecte

Valeurs par défaut P8 (scope du modérateur au choix de l'admin) et P14 (co-éditrice sans invitation ni nomination) : voir questions-ouvertes.md.

> Format des tâches : voir `pilotage/03-conventions.md`. Les lignes `- statut:` et `- règles:` sont lues par l'outil : ne pas en changer la forme. Changer un statut avec `pilotage.mjs set`.

## Sprint M5.S1 — Branches et périmètre

### Mission M5.S1.A — Branches

#### M5.S1.A1 — BranchService (admin) : création, emboîtement parent_branch_id
- statut: TODO · taille: S · assigné: — · validation: —
- règles: RG-FAM-01 · dépend: —
- livrables: modules/genealogy
- acceptation: pas de limite de profondeur

#### M5.S1.A2 — Périmètre « lignée directe » via closure paternal ; tests adoptions, polygamie, filles
- statut: TODO · taille: M · assigné: — · validation: —
- règles: RG-ENT-12 · dépend: M5.S1.A1
- livrables: modules/genealogy
- acceptation: épouse par alliance exclue ; enfants adoptés par un père de la branche inclus

#### M5.S1.A3 — Branche de naissance d'une personne
- statut: TODO · taille: S · assigné: — · validation: —
- règles: RG-FAM-05 · dépend: M5.S1.A2
- livrables: modules/genealogy
- acceptation: branche la plus proche sur la ligne paternelle

#### M5.S1.A4 — Enfant sans père renseigné : aucune branche (P13b)
- statut: TODO · taille: S · assigné: — · validation: —
- règles: P13b · dépend: M5.S1.A2
- livrables: modules/genealogy
- acceptation: test explicite

#### M5.S1.A5 — HOUSE : création et rattachement à une union polygame
- statut: TODO · taille: S · assigné: — · validation: —
- règles: RG-FAM-06 · dépend: M5.S1.A1
- livrables: modules/genealogy
- acceptation: unicité (branch, union)

### Mission M5.S1.B — Autorisation scopée

#### M5.S1.B1 — AuthorizationService : scopes branch et house
- statut: TODO · taille: M · assigné: — · validation: —
- règles: ADR-008 · dépend: M5.S1.A2, M5.S1.A5
- livrables: modules/identity-access/domain
- acceptation: permission() étendue et testée

#### M5.S1.B2 — Hors périmètre → proposition modérée (tests de bout en bout)
- statut: TODO · taille: S · assigné: — · validation: —
- règles: RG-MOD-09 · dépend: M5.S1.B1
- livrables: apps/api/test/
- acceptation: un éditeur hors lignée obtient 202

## Sprint M5.S2 — Rôles scopés et politiques

### Mission M5.S2.A — Rôles

#### M5.S2.A1 — Politique required_sex=M pour branch_editor (rule.role_requires_sex)
- statut: TODO · taille: S · assigné: — · validation: —
- règles: RG-FAM-03 ; RG-ROL-07 · dépend: M5.S1.B1
- livrables: modules/identity-access
- acceptation: refus 422 pour une femme

#### M5.S2.A2 — Rôles branch_editor, coeditor, moderator scopés
- statut: TODO · taille: M · assigné: — · validation: —
- règles: RG-ROL-03 ; P8 · dépend: M5.S2.A1
- livrables: modules/identity-access
- acceptation: scope du modérateur choisi à l'attribution

#### M5.S2.A3 — Droits d'invitation : branch_editor oui, coeditor non
- statut: TODO · taille: S · assigné: — · validation: —
- règles: P14 · dépend: M5.S2.A2
- livrables: modules/identity-access
- acceptation: tests d'escalade de droits

## Sprint M5.S3 — Succession

### Mission M5.S3.A — Service de succession

#### M5.S3.A1 — Domaine : SuccessionService pur (première épouse éligible, sinon fille aînée, sinon admin)
- statut: TODO · taille: M · assigné: — · validation: —
- règles: RG-FAM-04,05,07 · dépend: —
- livrables: modules/identity-access/domain
- acceptation: ordre RG-FAM-07 respecté ; dates absentes ou égales → admin départage

#### M5.S3.A2 — Attributions provisoires (is_provisional) : signalées, révocables, sans role.assign
- statut: TODO · taille: S · assigné: — · validation: —
- règles: doc 05 §4.5 · dépend: M5.S3.A1, M5.S2.A2
- livrables: modules/identity-access
- acceptation: jamais role.assign

#### M5.S3.A3 — Déclenchement et recalcul de la succession aux changements pertinents
- statut: TODO · taille: M · assigné: — · validation: —
- règles: RG-FAM-07 · dépend: M5.S3.A2
- livrables: modules/identity-access/application
- acceptation: un seul éditeur par défaut actif par branche

#### M5.S3.A4 — Tests : polygamie, dates d'union manquantes ou égales, emboîtement de branches
- statut: TODO · taille: M · assigné: — · validation: —
- règles: RL-3 · dépend: M5.S3.A1
- livrables: apps/api/src/**/*.spec.ts
- acceptation: tests nommés RG-FAM-xx

## Sprint M5.S4 — Interface

### Mission M5.S4.A — Attributions

#### M5.S4.A1 — Attribution des rôles et des branches (interface)
- statut: TODO · taille: M · assigné: — · validation: —
- règles: RG-ROL-02 · dépend: M5.S2.A2
- livrables: apps/web/src/
- acceptation: attribution scopée depuis l'interface

#### M5.S4.A2 — Affichage des attributions provisoires
- statut: TODO · taille: S · assigné: — · validation: —
- règles: RG-FAM-07 · dépend: M5.S3.A2
- livrables: apps/web/src/
- acceptation: badge « provisoire » visible

### Mission M5.S4.Z — Clôture du jalon

#### M5.S4.Z1 — Mettre à jour la documentation, l'OpenAPI et l'état des lieux du jalon
- statut: TODO · taille: S · assigné: — · validation: —
- règles: doc 07 §2 · dépend: @jalon
- livrables: docs/, openapi.json, 01-etat-des-lieux.md
- acceptation: règle ou modèle changé → nouvelle version du doc (-vN) ; OpenAPI régénérée ; `sync` exécuté

#### M5.S4.Z2 — Déployer le jalon sur l'environnement de recette (données synthétiques)
- statut: TODO · taille: S · assigné: — · validation: —
- règles: doc 07 §8 · dépend: M5.S4.Z1
- livrables: —
- acceptation: recette = `docker compose` local acceptable tant que Q-HEB est ouverte ; aucune donnée réelle

#### M5.S4.Z3 — Valider le jalon contre son critère de sortie
- statut: TODO · taille: S · assigné: — · validation: —
- règles: doc 07 §4 · dépend: M5.S4.Z2
- livrables: validations/M5.md
- acceptation: La branche d'un éditeur borne ses droits d'édition directe, et une action hors scope devient une proposition modérée ; tests de succession couvrant polygamie et dates manquantes.
