---
stepsCompleted: ['step-01-init', 'step-02-discovery', 'step-03-success', 'step-04-journeys', 'step-05-domain', 'step-06-innovation', 'step-07-project-type', 'step-08-scoping', 'step-09-functional', 'step-10-nonfunctional', 'step-11-polish']
inputDocuments: ['BMAD_OUTPUT/analysis/brainstorming-session-2026-01-16.md', 'README.md']
workflowType: 'prd'
classification:
  projectType: api_backend
  domain: edtech
  complexity: medium-high
  projectContext: brownfield-ecosystem-greenfield-service
---

# Product Requirements Document - traillearn-data-provider-scholarships

**Author:** aubinaso
**Date:** 2026-01-16

## Success Criteria

### User Success

*   **DVP (Consommateur principal) :** Intégration transparente et confiance implicite. Le DVP consomme les données sans logique de "double vérification humaine". Sentiment de sécurité technique totale lors de l'usage des données.
*   **Admin / Data Manager :** Supervision passive et ciblée. Le succès est atteint lorsque l'Admin ne traite que des alertes qualifiées et n'a plus besoin de monitoring manuel quotidien.

### Business Success

*   **Référence Marché :** Devenir le "Data Provider de référence" pour les bourses étudiantes, reconnu pour sa qualité plutôt que sa simple volumétrie.
*   **Adoption Écosystème :** 100% des données financières utilisées par le Dossier de Viabilité du Parcours (DVP) de TrailLearn proviennent du Provider.

### Technical Success

*   **Contrat d'Interface :** Stabilité absolue du contrat d'API V1.
*   **Indicateur de Confiance :** Maintien d'un Data Health Score moyen > 80 sur le périmètre des bourses critiques.
*   **Robustesse :** Détection automatique des changements structurels de source (404, modifications de page) avec dégradation gracieuse immédiate.

### Measurable Outcomes

*   **Lancement MVP :** ~50 bourses à fort impact (États, fondations nationales) disponibles avec le statut `VERIFIED`.
*   **Efficacité Admin :** Temps de supervision humaine réduit à moins de 15 minutes par jour.

## Product Scope

### MVP - Minimum Viable Product

*   **Modèle de données :** Architecture hybride (Core structuré pour la recherche + JSONB pour la flexibilité).
*   **API :** Endpoints Read (Get) + API de soumission authentifiée (Submitted -> Verified).
*   **Intelligence :** Calcul du Data Health Score V1 (Fraîcheur, Fiabilité Source, Stabilité).
*   **Règles métiers :** Dégradation automatique des scores et passage en statut `DEPRECATED` en cas d'obsolescence.
*   **Sandbox UI :** Interface double-rôle servant de démonstrateur d'API et de console minimale de validation pour l'Admin.

### Growth Features (Post-MVP)

*   **Automatisation :** Scrapers automatiques pour les 10 sources institutionnelles majeures.
*   **Notifications :** Système de Webhooks pour alerter les consommateurs (DVP) en cas de mise à jour critique d'une bourse.
*   **Versioning :** Support de versions multiples de l'API pour faciliter les évolutions du schéma.

### Vision (Future)

*   **IA Ingestion :** Utilisation de l'IA pour l'extraction automatique de données à partir de documents PDF complexes et hétérogènes.
*   **Crowdsourcing :** Ouverture contrôlée à la communauté avec système de réputation et validation par les pairs.
*   **Couverture :** Expansion internationale complète couvrant tous les types d'aides à la mobilité.

## User Journeys

### 1. Marc, le "Développeur Core" (Consommateur API)
*   **Ouverture** : Marc consulte la doc de l'API Scholarship Provider pour intégrer les données dans le DVP de TrailLearn.
*   **Action** : Il effectue un appel test pour un profil spécifique souhaitant étudier au Canada.
*   **Climax** : L'API renvoie des scores de confiance contrastés, identifiant clairement une source 404 pour l'une des bourses potentielles.
*   **Résolution** : Marc peut afficher une information nuancée et fiable à l'étudiant ("Donnée en cours de re-validation"), renforçant sa confiance dans le système et la sécurité du plan de financement.

### 2. Sarah, la "Data Manager" (Admin)
*   **Ouverture** : Sarah doit maintenir des milliers de bourses sans se noyer dans un monitoring manuel impossible.
*   **Action** : Elle reçoit une alerte ciblée de la Sandbox sur un changement critique détecté par un worker nocturne.
*   **Climax** : Elle accède à la console et valide visuellement le changement de deadline (du 15 au 10 janvier) détecté via le Change Detection.
*   **Résolution** : La base est mise à jour en un clic, le Health Score remonte, et Sarah a assuré la fraîcheur de la donnée sans effort héroïque.

### 3. Thomas, l' "Étudiant Expert" (Contributeur)
*   **Ouverture** : Thomas connaît une bourse locale spécifique absente du système de référence.
*   **Action** : Il soumet la bourse via un formulaire authentifié dans TrailLearn, en fournissant l'URL source.
*   **Climax** : Le système accuse réception et place la donnée en statut `SUBMITTED`, la rendant visible mais marquée "Non vérifiée".
*   **Résolution** : Sa contribution est validée par Sarah après vérification, Thomas se sent utile et la base s'enrichit de façon contrôlée et sécurisée.

### 4. Le "Bot de Surveillance" (Acteur Système)
*   **Action** : Le worker tourne chaque nuit sur les 50 bourses critiques identifiées comme prioritaires.
*   **Obstacle** : Il détecte une indisponibilité persistante (erreur 500) d'une source institutionnelle majeure.
*   **Climax** : Il dégrade automatiquement le `health_score` de 95 à 45 et marque la donnée comme "Stale".
*   **Résolution** : Il crée immédiatement une tâche pour Sarah et informe les consommateurs API (Marc) de l'incertitude via les métadonnées de réponse.

### Journey Requirements Summary

*   **API Consommateurs** : Documentation OpenAPI exhaustive, typage fort des schémas, métadonnées de confiance obligatoires (`health_score`, `last_verified_at`, `source_type`), gestion explicite des erreurs.
*   **Console Admin (Sandbox)** : Dashboard de tâches priorisées, outil de visualisation des différences (Change Detection), validation/rejet rapide des soumissions.
*   **Système de Collecte & Intelligence** : Workers automatisés, détection de changements structurels, calcul de score de santé dynamique (Fraîcheur/Source/Stabilité), mécanismes de dégradation automatique.
*   **Portail de Soumission** : API de contribution authentifiée, workflow de gestion de statut (`DRAFT` -> `SUBMITTED` -> `VERIFIED`).

## Domain-Specific Requirements

### Compliance & Regulatory (Privacy & Data)
*   **Minimisation des Données Utilisateurs :** Le provider ne stocke aucune donnée étudiante sensible. Les soumissions conservent uniquement une trace technique minimale de l'auteur (ID, rôle, timestamp) pour audit, sans exposition.
*   **Absence de Standards :** Adoption d'un schéma propriétaire clair et documenté en l'absence de standards académiques/financiers universels pour les bourses.

### Technical Constraints (Integrity & Traceability)
*   **Audit Log Immuable :** Historisation obligatoire de tout changement de statut ou modification critique de donnée (Qui, Quand, Pourquoi) pour garantir la défendabilité.
*   **Calcul Déterministe du Health Score :** Le score est calculé par le système (algorithme) et n'est jamais modifiable manuellement.

### Integration Requirements (TrailLearn Ecosystem)
*   **Normalisation Financière & Temporelle :** Stockage des montants avec devise explicite (ISO 4217) et dates critiques en UTC strict.
*   **Contrat de Service :** Le provider garantit la structure mais pas la pérennité de la donnée externe (concept de "Meilleur effort vérifié").

### Risk Mitigations
*   **Principe de Prudence :** Les bourses à fort impact financier nécessitent une validation humaine explicite pour être `VERIFIED`.
*   **Dégradation par Défaut :** En cas d'ambiguïté de source ou d'erreur technique, le score est dégradé automatiquement (pas d'extrapolation ou d'hallucination).

## API Backend Specific Requirements

### Project-Type Overview
Développement d'une API REST robuste dédiée à la fourniture de données qualifiées sur les bourses d'études. Le focus est mis sur le contrat d'interface (OpenAPI), la qualité de la donnée (Health Score) et la facilité d'intégration pour le core TrailLearn.

### Endpoint Specification (V1)
*   `GET /api/v1/scholarships` : Recherche multicritère (statut `VERIFIED` par défaut).
*   `GET /api/v1/scholarships/{id}` : Détails complets d'une bourse (Core + JSONB).
*   `GET /api/v1/metadata` : Référentiels (enums, types de sources, pays).
*   `POST /api/v1/scholarships/submission` : Soumission d'une nouvelle opportunité (Status `SUBMITTED`).
*   `GET /api/v1/admin/tasks` : Liste des alertes et soumissions à valider (Admin only).

### Authentication Model
*   **Standard :** JWT (JSON Web Token) via header `Authorization: Bearer`.
*   **Politique :** Authentification obligatoire pour **tous** les appels (Read & Write) pour monitoring et rate limiting.
*   **Rôles :** `ADMIN`, `DATA_MANAGER`, `CONTRIBUTOR`, `SERVICE` (DVP).

### Data Schemas & Standards
*   **Documentation :** OpenAPI 3.0 obligatoire au lancement.
*   **Erreurs :** Standard RFC 7807 (Problem Details).
*   **Versioning :** Path versioning `/api/v1/`. Stabilité contractuelle absolue.

### Rate Limits & Protection
*   Quotas différenciés : Service-to-Service (Core TrailLearn) > Admin > User.
*   Protection contre le brute-force et le scraping non autorisé.

### SDK Strategy
*   **V1 :** Hors scope. Priorité à la qualité de la documentation et des exemples (cURL, JS).

## Project Scoping & Phased Development

### MVP Strategy & Philosophy
*   **MVP Approach:** Trust-First MVP (Qualité > Quantité). Focalisation sur la fiabilité de ~50 bourses critiques plutôt que sur l'exhaustivité.
*   **Resource Requirements:** 1 Backend Developer (API, Workers), 1 Data Manager (Validation, Supervision).

### MVP Feature Set (Phase 1)
*   **Core User Journeys Supported :** Marc (Consommation fiable), Sarah (Supervision ciblée), Thomas (Soumission authentifiée), Bot (Surveillance nocturne).
*   **Must-Have Capabilities :** Auth JWT, OpenAPI Spec, Modèle Hybride, Health Score V1, Workflow Submitted->Verified, Sandbox Admin/Demo minimale, Audit Log immuable.

### Post-MVP Features
*   **Phase 2 (Growth) :** Scrapers automatiques (Top 10 sources), Notifications Webhooks, SDK Node.js/TS, Versioning avancé.
*   **Phase 3 (Expansion) :** Extraction de données par IA (PDFs complexes), Crowdsourcing validé par la communauté, couverture internationale complète.

### Risk Mitigation Strategy
*   **Technical Risks :** Complexité du Change Detection. Mitigation : Approche progressive (404/Hash diff avant Diff sémantique).
*   **Market Risks :** Obsolescence rapide des données. Mitigation : Focus exclusif sur bourses institutionnelles stables en V1.
*   **Resource Risks :** Maintenance manuelle trop lourde. Mitigation : Alertes intelligentes et hiérarchisées pour Sarah.

## Functional Requirements

### 1. Recherche & Consultation (Discovery)
*   **FR1 :** L'API Consommatrice (DVP) peut rechercher des bourses par critères géographiques (pays destination/origine).
*   **FR2 :** L'API Consommatrice (DVP) peut filtrer les bourses par niveau d'études.
*   **FR3 :** L'API Consommatrice (DVP) peut filtrer les résultats par seuil de confiance minimal (Data Health Score).
*   **FR4 :** Le système renvoie par défaut uniquement les bourses au statut `VERIFIED`.
*   **FR5 :** Le Développeur Core peut consulter le détail complet d'une bourse, incluant les métadonnées de confiance, les avertissements (warnings) et les raisons de dégradation (ex: source stale ou inaccessible).
*   **FR6 :** L'utilisateur peut récupérer les référentiels (metadata) pour connaître les valeurs de filtres valides.

### 2. Soumission & Contribution (Ingestion)
*   **FR7 :** L'Utilisateur Authentifié peut soumettre une nouvelle opportunité de bourse via un formulaire/API.
*   **FR8 :** Le système crée automatiquement une entrée en statut `SUBMITTED` pour chaque nouvelle soumission.
*   **FR9 :** L'Administrateur peut soumettre directement une bourse en mode brouillon (`DRAFT`) ou vérifiée (`VERIFIED`).
*   **FR10 :** Le système valide la présence des champs obligatoires et l'accessibilité de la source (URL valide et autorisée) lors de la soumission, avec possibilité de rejet en cas de source inacceptable ou suspecte.

### 3. Gestion de la Confiance (Data Trust)
*   **FR11 :** Le système calcule automatiquement un `Data Health Score` pour chaque bourse selon l'algorithme défini (Fraîcheur, Source, Stabilité).
*   **FR12 :** Le système identifie et marque comme `DEPRECATED` les bourses dont la deadline officielle est dépassée.
*   **FR13 :** Le système dégrade automatiquement le score de santé en cas d'erreur d'accès à la source (ex: 404 persistante) et expose explicitement cet état aux consommateurs.
*   **FR14 :** Le système expose l'historique de vérification (`last_verified_at`) pour chaque donnée.

### 4. Administration & Validation (Ops)
*   **FR15 :** La Data Manager peut lister les tâches prioritaires (soumissions à valider, alertes de santé).
*   **FR16 :** La Data Manager peut valider (`VERIFIED`) ou rejeter une soumission de manière explicite.
*   **FR17 :** La Data Manager peut modifier manuellement les champs structurés d'une bourse pour correction.
*   **FR18 :** Le système enregistre un log d'audit immuable pour chaque changement de statut (Qui, Quand, Pourquoi).

### 5. Surveillance Automatique (Monitoring)
*   **FR19 :** Le Bot de Surveillance effectue des vérifications périodiques sur les sources des bourses critiques.
*   **FR20 :** Le système génère une alerte admin lorsqu'un changement structurel est détecté sur une page source.

## Non-Functional Requirements

### Security & Integrity
*   **Auditabilité :** 100% des modifications de données critiques sont tracées dans un log d'audit immuable (Qui, Quand, Payload avant/après).
*   **Protection API :** Authentification JWT obligatoire sur tous les endpoints. Rejet systématique des requêtes non authentifiées (401).
*   **Validation de Source :** Validation stricte des URLs pour prévenir les attaques SSRF et XSS.

### Reliability & Availability
*   **Stabilité Contractuelle :** Garantie de zéro changement cassant dans la version `/api/v1/`.
*   **Garantie de Fraîcheur :** 100% des bourses critiques vérifiées au moins tous les 30 jours pour maintenir un score > 80.
*   **Disponibilité :** Cible de 99.5% d'uptime pour l'API.

### Performance
*   **Latence :** 95% des requêtes de lecture doivent répondre en moins de 300ms.
*   **Pagination :** Pagination obligatoire sur tous les endpoints de liste pour garantir la stabilité des performances.

### Maintainability
*   **Observabilité :** Logs explicites des erreurs de workers pour faciliter le diagnostic admin.
*   **Documentation :** Spécification OpenAPI auto-générée depuis le code (Code-First) pour garantir la synchronisation.