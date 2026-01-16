---
stepsCompleted: [1, 2, 3, 4]
inputDocuments: []
session_topic: 'Conception du Scholarship Provider (Service API indépendant)'
session_goals: 'Vision claire, features V1/V2, modélisation des données, stratégie de collecte, périmètre Sandbox, intégration API'
selected_approach: 'Progressive Technique Flow'
techniques_used: ['Anti-Solution', 'Role Playing', 'SCAMPER', 'Decision Tree Mapping']
ideas_generated: ['Data Nightmare', 'API Menteuse', 'Provider Oracle', 'Data Health Score', 'Minimum Viable Trust', 'Modèle Hybride', 'Sandbox Dual-Role', 'Auth Submission']
technique_execution_complete: true
facilitation_notes: 'User progressed from divergent anti-patterns to a highly structured V1 specification. Strong focus on data quality and trust.'
session_active: false
workflow_completed: true
---

# Brainstorming Session Results

**Facilitator:** aubinaso
**Date:** 2026-01-16

## Session Overview

**Topic:** Conception du Scholarship Provider (Service API indépendant)
**Goals:** Vision claire, features V1/V2, modélisation des données, stratégie de collecte, périmètre Sandbox, intégration API

### Session Setup

Le focus est sur l'architecture fonctionnelle et technique d'un composant critique "side-car" pour TrailLearn : le Scholarship Provider.
Les priorités sont la fiabilité, la maintenabilité et l'indépendance du service pour alimenter le Dossier de Viabilité du Parcours (DVP).

## Technique Selection

**Approach:** Progressive Technique Flow
**Journey Design:** Systematic development from exploration to action

**Progressive Techniques:**

- **Phase 1 - Exploration:** Anti-Solution pour maximum idea generation
- **Phase 2 - Pattern Recognition:** Role Playing pour organizing insights
- **Phase 3 - Development:** SCAMPER pour refining concepts
- **Phase 4 - Action Planning:** Decision Tree Mapping pour implementation planning

**Journey Rationale:** Pour une brique aussi structurante et critique que le Scholarship Provider, il est essentiel de commencer par diverger pour explorer toutes les implications (rôle, risques, données) avant de converger vers des spécifications techniques précises.

## Technique Execution Results

**Anti-Solution (The Nightmare Provider):**
- **Exploration:** Identification des pires pratiques (données périmées mélangées, API menteuse sur les status codes, aucun versioning).
- **Insight Clé:** Le "Data Nightmare" a révélé que la valeur du provider ne réside pas dans la donnée brute, mais dans les métadonnées de confiance (source, fraîcheur, contexte).
- **Principe:** "Transparence radicale sur l'incertitude".

**Role Playing (Provider vs DVP/Admin):**
- **Frontières:** Le Provider est un "Oracle Factuel" qui ne prend pas de décision financière (rôle du DVP).
- **Responsabilité:** Le Provider garantit la traçabilité et la santé de la donnée, pas le financement de l'étudiant.
- **Maintenance:** Le système aide l'Admin via une surveillance intelligente (Change Detection) et une dégradation gracieuse, plutôt que de demander une maintenance manuelle impossible.

**SCAMPER (Feature Sculpting V1):**
- **Eliminate:** Pas de crowdsourcing public complexe, pas d'UI Admin riche, pas de scraping temps réel destructif.
- **Modify (Health Score):** Un score simple et lisible (40% Fraîcheur + 40% Fiabilité Source + 20% Stabilité).
- **Concept:** "Minimum Viable Trust" - Mieux vaut moins de données, mais des données dont on connaît le niveau de fiabilité.

**Decision Tree Mapping (Roadmap V1):**
- **Modèle de Données:** Hybride. Noyau structuré pour la fiabilité (ID, Source, Status, HealthScore, Deadline) + JSONB pour la flexibilité des détails.
- **Règles Métier:**
    1. Consommation par défaut uniquement des données `VERIFIED`.
    2. `Health Score` faible = Dégradation automatique + Tâche Admin.
    3. Deadline passée = `DEPRECATED` (Soft delete).
- **Sandbox UI:** Rôle double (Demo API + Console de validation Admin légère).
- **Soumission:** Authentifiée uniquement (User/Admin) pour éviter le bruit. Workflow : Submitted -> Verified.

### Creative Facilitation Narrative
La session a suivi une courbe idéale de divergence/convergence. En commençant par imaginer le pire (Anti-Solution), l'utilisateur a pu poser des exigences de qualité très strictes (transparence, versioning). La phase de Role Playing a clarifié les Bounded Contexts. Enfin, SCAMPER et Decision Tree ont permis de trancher pour une V1 pragmatique ("Minimum Viable Trust"), éliminant la complexité inutile pour se concentrer sur l'architecture de la confiance.

### Session Highlights
**User Creative Strengths:** Capacité à projeter les risques architecturaux (Anti-Patterns) et à prendre des décisions de "Scope Cutting" drastiques pour sécuriser la qualité.
**Breakthrough Moments:** La définition du "Data Health Score" comme pivot central de la confiance, et le choix du modèle hybride (Structuré + JSONB) pour la V1.

## Synthèse Structurée : Architecture du Scholarship Provider (V1)

Cette synthèse sert de document de référence pour le développement du service.

### 1. Vision & Principes Architecturaux

*   **Philosophie Centrale :** "Minimum Viable Trust"
    *   La valeur du service n'est pas le volume de données, mais la **confiance** qu'on peut leur accorder.
    *   Mieux vaut "Pas de donnée" qu'une "Donnée fausse ou incertaine non signalée".

*   **Rôle du Provider : "L'Oracle Factuel"**
    *   **Responsabilité :** Fournir des faits qualifiés, sourcés et datés.
    *   **Limite :** Ne jamais interpréter la "viabilité financière" d'un étudiant (rôle exclusif du DVP).
    *   **Interaction :** Fournit des métadonnées de confiance (`health_score`, `last_verified`) pour permettre au DVP de pondérer ses décisions.

*   **Le Grand Interdit (Anti-Pattern Critique) :**
    *   Jamais de "Mensonge par omission". Toute incertitude doit être exposée explicitement dans le payload API.

### 2. Fonctionnalités Clés (Périmètre V1)

Ce qui est **IN** pour la V1 vs ce qui est repoussé.

| Fonctionnalité | Statut V1 | Justification V1 |
| :--- | :--- | :--- |
| **Data Health Score** | **CORE** | Algorithme simple (3 critères) pour quantifier la confiance. |
| **Soumission Bourse** | **CORE** | Authentifiée uniquement (User/Admin). Workflow : `DRAFT` -> `SUBMITTED` -> `VERIFIED`. |
| **Change Detection** | **CORE** | Surveillance périodique (Batch). Alerte si changement structurel ou 404. |
| **Dégradation Gracieuse** | **CORE** | Si doute : Health Score baisse + Status `UNVERIFIED`. Pas de suppression auto. |
| **API Publique (Read)** | **CORE** | Recherche par critères stricts (Pays, Niveau). |
| *Crowdsourcing Public* | *OUT* | Trop de bruit et de risque de spam pour la V1. |
| *Scraping Temps Réel* | *OUT* | Trop coûteux et fragile. Batch jobs privilégiés. |
| *Eligibilité Probabiliste* | *OUT* | Complexité algorithmique. V1 se limite aux critères booléens clairs. |

### 3. Modèle de Données V1 (Spécification)

Architecture hybride pour allier rigidité (recherche) et souplesse (détails).

**Structure Core (Champs obligatoires & typés) :**
*   `id` (UUID) : Identifiant unique immuable.
*   `name` (String) : Nom canonique de la bourse.
*   `source_url` (String) : URL de référence unique en V1.
*   `source_type` (Enum) : `OFFICIAL_API`, `INSTITUTION_SITE`, `OFFICIAL_PDF`, `OTHER`.
*   `status` (Enum) : `DRAFT`, `SUBMITTED`, `VERIFIED`, `DEPRECATED`, `ARCHIVED`.
*   `deadline_at` (Timestamp?) : Nullable si permanent.
*   `amount_min` / `amount_max` (Integer?) : Nullable si inconnu.
*   `currency` (String) : ISO code (USD, EUR, CAD...).
*   `health_score` (0-100) : Calculé automatiquement.
*   `last_verified_at` (Timestamp) : Date de la dernière validation (auto ou humaine).

**Structure Flex (JSONB) :**
*   `data` (JSONB) : Contient tout le reste (critères détaillés, liste de documents, descriptions riches, liens secondaires).

**Algorithme Health Score V1 :**
> `Score = (Freshness_Score * 0.4) + (Source_Reliability * 0.4) + (Stability_Score * 0.2)`

### 4. Contrat d'Interface API (Endpoints Critiques)

*   `GET /api/v1/scholarships`
    *   *Query Params :* `country`, `level`, `min_health_score` (default 80).
    *   *Comportement :* Ne renvoie que les statuts `VERIFIED` par défaut.

*   `POST /api/v1/scholarships/submission`
    *   *Auth :* Requis (User ou Admin).
    *   *Body :* Payload partiel accepté.
    *   *Comportement :* Crée une entrée en statut `SUBMITTED`.

*   `GET /api/v1/admin/tasks`
    *   *Auth :* Admin only.
    *   *Réponse :* Liste des bourses à vérifier (Health Score bas, submissions en attente, sources 404).

### 5. Roadmap Technique & Sandbox

**Rôle de la Sandbox UI (V1) :**
1.  **Démonstrateur :** Prouver que l'API fonctionne indépendamment de TrailLearn.
2.  **Console de Gestion (Admin Light) :** Interface minimale pour lister les tâches de vérification et valider les soumissions (boutons "Approve" / "Reject").

**Phasage Implémentation :**
1.  **Phase 1 - The Vault :** Database, Modèle Hybride, API Read (Get).
2.  **Phase 2 - The Gatekeeper :** Auth, Soumission API, Validation Workflow.
3.  **Phase 3 - The Watchdog :** Change Detection basique, Calcul Health Score, Batch Jobs.
4.  **Phase 4 - The Face :** Sandbox UI (Demo + Admin).

## Session Summary and Insights

**Key Achievements:**
- Définition d'une architecture résiliente ("Minimum Viable Trust") qui évite les pièges classiques de l'agrégation de données.
- Spécification claire d'un modèle de données hybride adapté à l'incertitude du domaine.
- Découplage complet réussi entre le Provider (Data) et le DVP (Decision).

**Session Reflections:**
L'utilisation de l'Anti-Solution a été déterminante pour identifier le risque majeur : la perte de confiance due à des données périmées. Cela a orienté toute la conception vers la transparence et la "santé" de la donnée plutôt que vers la quantité. Le Provider est prêt à être développé comme un service autonome robuste.
