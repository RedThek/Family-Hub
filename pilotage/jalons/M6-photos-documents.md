# M6 — Photos et documents

- taille: M
- dépend_jalons: M3
- règles: RG-ENT-08, RG-ENT-09 ; doc 05 §7
- référence: docs/07-plan-livraison.md §4 M6

## Objectif

Stockage objet privé, URL signées, validation par contenu, suppression EXIF, re-encodage, vignettes, documents de personne ou d'union.

## Critère de sortie

Un fichier hors liste blanche est refusé ; aucune URL de fichier n'est accessible sans contrôle de visibilité ; EXIF absent des fichiers servis (S-07).

## Notes d'architecte

Hébergement visé Vercel/Render : MinIO n'existe qu'en local, la production exigera un service compatible S3 (voir Q-HEB). Écrire le client contre l'API S3 pour rester portable.

> Format des tâches : voir `pilotage/03-conventions.md`. Les lignes `- statut:` et `- règles:` sont lues par l'outil : ne pas en changer la forme. Changer un statut avec `pilotage.mjs set`.

## Sprint M6.S1 — Stockage et traitement des fichiers

### Mission M6.S1.A — Stockage

#### M6.S1.A1 — Client S3/MinIO (infrastructure du module documents) et bucket privé
- statut: TODO · taille: S · assigné: — · validation: —
- règles: ADR-010 · dépend: —
- livrables: modules/documents/infrastructure
- acceptation: aucune URL publique ; configuration par variables d'environnement

#### M6.S1.A2 — Validation du type par contenu, liste blanche JPEG/PNG/WebP/PDF, tailles max (5 Mo photo, 10 Mo document)
- statut: TODO · taille: S · assigné: — · validation: —
- règles: S-07 ; P21 · dépend: M6.S1.A1
- livrables: modules/documents
- acceptation: 415 file.type_not_allowed, 413 file.too_large

#### M6.S1.A3 — Suppression EXIF, re-encodage des images, vignette optimisée
- statut: TODO · taille: M · assigné: — · validation: —
- règles: M-08 ; EA-07 · dépend: M6.S1.A2
- livrables: modules/documents
- acceptation: EXIF absent des fichiers servis (test)

#### M6.S1.A4 — URL signées de 60 s émises après contrôle de visibilité
- statut: TODO · taille: S · assigné: — · validation: —
- règles: ADR-010 ; P21 · dépend: M6.S1.A1, M3.S2.A1
- livrables: modules/documents/http
- acceptation: URL expirée refusée

## Sprint M6.S2 — API

### Mission M6.S2.A — Photos et documents

#### M6.S2.A1 — PUT/DELETE /persons/{id}/photo (direct ou proposé via la modération)
- statut: TODO · taille: M · assigné: — · validation: —
- règles: RG-ENT-08 · dépend: M6.S1.A3, M4.S2.A4
- livrables: modules/documents/http
- acceptation: une seule photo par personne

#### M6.S2.A2 — POST /persons/{id}/documents et /unions/{id}/documents (exclusivité)
- statut: TODO · taille: M · assigné: — · validation: —
- règles: RG-ENT-09 ; CHK-05 · dépend: M6.S1.A3
- livrables: modules/documents/http
- acceptation: exactement un propriétaire

#### M6.S2.A3 — GET /documents/{id}/download-url et journal d'accès aux documents
- statut: TODO · taille: S · assigné: — · validation: —
- règles: S-10 · dépend: M6.S1.A4
- livrables: modules/documents/http
- acceptation: chaque accès journalisé sans donnée personnelle

#### M6.S2.A4 — photoUrl et documents[] via le projecteur (jamais publics, plancher approved)
- statut: TODO · taille: S · assigné: — · validation: —
- règles: RG-VIS-04,11 · dépend: M6.S2.A1, M6.S2.A2
- livrables: modules/visibility
- acceptation: absents pour L0/L1

#### M6.S2.A5 — Suppression physique et délai de conservation des fichiers retirés
- statut: TODO · taille: S · assigné: — · validation: —
- règles: doc 05 §7 · dépend: M6.S2.A1
- livrables: modules/documents
- acceptation: purge planifiée testée

## Sprint M6.S3 — Interface

### Mission M6.S3.A — Interface fichiers

#### M6.S3.A1 — Envoi de photo et de pièces jointes (interface)
- statut: TODO · taille: M · assigné: — · validation: —
- règles: RG-ENT-08,09 · dépend: M6.S2.A1, M6.S2.A2
- livrables: apps/web/src/
- acceptation: limites de taille affichées

#### M6.S3.A2 — Matrice de visibilité étendue aux fichiers
- statut: TODO · taille: S · assigné: — · validation: —
- règles: S-02 · dépend: M6.S2.A4
- livrables: apps/api/test/visibility-matrix/
- acceptation: cas photo/document ajoutés

### Mission M6.S3.Z — Clôture du jalon

#### M6.S3.Z1 — Mettre à jour la documentation, l'OpenAPI et l'état des lieux du jalon
- statut: TODO · taille: S · assigné: — · validation: —
- règles: doc 07 §2 · dépend: @jalon
- livrables: docs/, openapi.json, 01-etat-des-lieux.md
- acceptation: règle ou modèle changé → nouvelle version du doc (-vN) ; OpenAPI régénérée ; `sync` exécuté

#### M6.S3.Z2 — Déployer le jalon sur l'environnement de recette (données synthétiques)
- statut: TODO · taille: S · assigné: — · validation: —
- règles: doc 07 §8 · dépend: M6.S3.Z1
- livrables: —
- acceptation: recette = `docker compose` local acceptable tant que Q-HEB est ouverte ; aucune donnée réelle

#### M6.S3.Z3 — Valider le jalon contre son critère de sortie
- statut: TODO · taille: S · assigné: — · validation: —
- règles: doc 07 §4 · dépend: M6.S3.Z2
- livrables: validations/M6.md
- acceptation: Un fichier hors liste blanche est refusé ; aucune URL de fichier n'est accessible sans contrôle de visibilité ; EXIF absent des fichiers servis (S-07).
