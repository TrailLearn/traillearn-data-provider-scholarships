-- ============================================================
-- Seed Data — TrailLearn Bourses
-- 10 bourses représentatives du marché français et international
-- ============================================================

TRUNCATE TABLE scholarships RESTART IDENTITY CASCADE;

INSERT INTO scholarships (
  name,
  source_url,
  status,
  provider,
  scholarship_type,
  level,
  domain,
  country,
  tags,
  description,
  deadline_at,
  amount_min,
  amount_max,
  currency,
  health_score,
  last_verified_at,
  data
)
VALUES

-- 1. Bourse Eiffel (Campus France)
(
  'Bourse d''Excellence Eiffel',
  'https://www.campusfrance.org/fr/eiffel',
  'VERIFIED',
  'Campus France / Ministère de l''Europe et des Affaires étrangères',
  'MERIT',
  'MASTER',
  ARRAY['Sciences', 'Droit', 'Économie', 'Sciences politiques'],
  'France',
  ARRAY['mobilité', 'excellence', 'international', 'master'],
  'La bourse Eiffel est destinée aux étudiants étrangers de haut niveau souhaitant poursuivre des études en master en France. Elle couvre les frais de vie, de transport et d''assurance maladie.',
  NOW() + INTERVAL '3 months',
  1181,
  1400,
  'EUR',
  95,
  NOW(),
  '{
    "eligibility": {
      "level": "Master",
      "age_limit": 30,
      "nationality": "Étrangers hors UE",
      "gpa": "Excellent dossier académique"
    },
    "benefits": ["Allocation mensuelle", "Billet d''avion", "Assurance maladie", "Activités culturelles"],
    "meta": {}
  }'::jsonb
),

-- 2. Bourses sur critères sociaux (CROUS)
(
  'Bourse sur Critères Sociaux (BCS) CROUS',
  'https://www.etudiant.gouv.fr/fr/bourse-et-logement/demande-de-bourse',
  'VERIFIED',
  'CROUS / Ministère de l''Enseignement Supérieur',
  'NEED_BASED',
  'BACHELOR',
  ARRAY['Toutes filières'],
  'France',
  ARRAY['social', 'aide financière', 'public', 'annuel'],
  'Les bourses sur critères sociaux sont attribuées aux étudiants français ou UE en formation initiale selon les ressources du foyer fiscal. Elles vont de l''échelon 0bis à l''échelon 7.',
  NOW() + INTERVAL '2 months',
  100,
  5914,
  'EUR',
  98,
  NOW(),
  '{
    "eligibility": {
      "nationality": "Française ou UE",
      "level": "Bac+1 à Bac+5",
      "conditions": "Ressources du foyer fiscal, âge < 28 ans"
    },
    "echelons": [0, 1, 2, 3, 4, 5, 6, 7],
    "meta": {}
  }'::jsonb
),

-- 3. Bourse Erasmus+
(
  'Bourse Erasmus+ Mobilité Étudiante',
  'https://erasmus-plus.ec.europa.eu/fr',
  'VERIFIED',
  'Commission Européenne / Agence Erasmus+ France',
  'MOBILITY',
  'BACHELOR',
  ARRAY['Toutes filières'],
  'Europe',
  ARRAY['mobilité', 'europe', 'échange', 'semestre'],
  'Erasmus+ finance des séjours d''études ou de stages à l''étranger en Europe. Le montant varie selon le pays de destination et les ressources de l''étudiant.',
  NOW() + INTERVAL '4 months',
  250,
  700,
  'EUR',
  99,
  NOW(),
  '{
    "eligibility": {
      "level": "Bac+1 minimum",
      "duration": "2 à 12 mois",
      "conditions": "Inscrit dans un établissement partenaire"
    },
    "benefits": ["Allocation mensuelle", "Couverture sociale", "Cours de langue"],
    "meta": {}
  }'::jsonb
),

-- 4. Bourse ANR jeunes chercheurs
(
  'Contrat Doctoral ANR — Programme Jeunes Chercheurs',
  'https://anr.fr/fr/financer-votre-projet/appels-ouverts/',
  'VERIFIED',
  'Agence Nationale de la Recherche (ANR)',
  'RESEARCH',
  'PHD',
  ARRAY['Sciences', 'Ingénierie', 'Numérique', 'Santé'],
  'France',
  ARRAY['recherche', 'doctorat', 'financement', 'public'],
  'L''ANR finance des contrats doctoraux sur appel à projets. Le financement couvre 3 ans de thèse avec un salaire mensuel brut conforme à la grille des personnels contractuels de l''État.',
  NOW() + INTERVAL '5 months',
  2000,
  2200,
  'EUR',
  92,
  NOW(),
  '{
    "eligibility": {
      "level": "Doctorat",
      "status": "Inscription en 1ère année de thèse",
      "domains": ["Toutes disciplines scientifiques"]
    },
    "duration": "36 mois",
    "meta": {}
  }'::jsonb
),

-- 5. Bourse Fondation L''Oréal – UNESCO Pour les Femmes et la Science
(
  'Bourse L''Oréal-UNESCO Pour les Femmes et la Science',
  'https://www.fondationloreal.com/fr/programme/pour-les-femmes-et-la-science',
  'VERIFIED',
  'Fondation L''Oréal & UNESCO',
  'DIVERSITY',
  'PHD',
  ARRAY['Sciences', 'Biologie', 'Chimie', 'Physique', 'Mathématiques'],
  'France',
  ARRAY['femmes', 'sciences', 'diversité', 'doctorat', 'recherche'],
  'Ce programme récompense des doctorantes et post-doctorantes en France exerçant dans les sciences de la vie, physiques, et mathématiques. 35 bourses nationales attribuées chaque année.',
  NOW() + INTERVAL '6 months',
  15000,
  15000,
  'EUR',
  96,
  NOW(),
  '{
    "eligibility": {
      "gender": "Femme",
      "level": "Doctorat ou post-doctorat",
      "nationality": "Toutes"
    },
    "selection_process": "Jury scientifique",
    "meta": {}
  }'::jsonb
),

-- 6. Aide à la mobilité internationale (AMI) – Ministère
(
  'Aide à la Mobilité Internationale (AMI)',
  'https://www.enseignementsup-recherche.gouv.fr/fr/aide-a-la-mobilite-internationale',
  'VERIFIED',
  'Ministère de l''Enseignement Supérieur',
  'MOBILITY',
  'MASTER',
  ARRAY['Toutes filières'],
  'International',
  ARRAY['mobilité', 'aide', 'stage', 'semestre', 'boursier CROUS'],
  'L''AMI est réservée aux boursiers sur critères sociaux partant en mobilité internationale (stage ou séjour d''études hors Europe). Forfait unique selon la destination.',
  NOW() + INTERVAL '2 months',
  400,
  700,
  'EUR',
  90,
  NOW(),
  '{
    "eligibility": {
      "conditions": "Être boursier CROUS",
      "destination": "Hors Europe"
    },
    "meta": {}
  }'::jsonb
),

-- 7. Bourse régionale Île-de-France
(
  'Bourse Régionale Île-de-France — DIM',
  'https://www.iledefrance.fr/aides-regionales-pour-les-lycees-les-etudiants-et-les-familles',
  'VERIFIED',
  'Région Île-de-France',
  'MERIT',
  'MASTER',
  ARRAY['Sciences', 'Technologie', 'Innovation', 'Numérique'],
  'France',
  ARRAY['régional', 'idf', 'innovation', 'master'],
  'La Région Île-de-France soutient les masters recherche via des Domaines d''Intérêt Majeur (DIM). Les bourses financent des projets de recherche interdisciplinaires portés par des étudiants en master.',
  NOW() + INTERVAL '3 months',
  500,
  1000,
  'EUR',
  85,
  NOW(),
  '{
    "eligibility": {
      "level": "Master Recherche",
      "region": "Île-de-France"
    },
    "meta": {}
  }'::jsonb
),

-- 8. Fulbright (USA)
(
  'Programme Fulbright France',
  'https://www.fulbright-france.org/programme-fulbright',
  'VERIFIED',
  'Commission Franco-Américaine Fulbright',
  'MERIT',
  'MASTER',
  ARRAY['Sciences humaines', 'Sciences sociales', 'Arts', 'Sciences'],
  'États-Unis',
  ARRAY['usa', 'mobilité', 'franco-américain', 'prestigieux'],
  'Le programme Fulbright permet à des étudiants français de poursuivre des études ou des recherches aux États-Unis pendant 9 à 12 mois. Couverture complète des frais de vie et de scolarité.',
  NOW() + INTERVAL '4 months',
  0,
  0,
  'USD',
  97,
  NOW(),
  '{
    "eligibility": {
      "nationality": "Française",
      "level": "Master ou Doctorat",
      "language": "Anglais courant requis"
    },
    "benefits": ["Scolarité intégrale", "Allocation mensuelle", "Billet avion A/R", "Assurance"],
    "meta": {}
  }'::jsonb
),

-- 9. Bourse AGEFIPh (handicap)
(
  'Bourse AGEFIPh — Étudiants en Situation de Handicap',
  'https://www.agefiph.fr/aides-handicap/aide-a-la-formation',
  'VERIFIED',
  'Association de Gestion du Fonds pour l''Insertion des Personnes Handicapées',
  'NEED_BASED',
  'ANY',
  ARRAY['Toutes filières'],
  'France',
  ARRAY['handicap', 'inclusion', 'aide', 'accessibilité'],
  'L''AGEFIPh apporte une aide financière complémentaire aux étudiants en situation de handicap pour couvrir des frais liés à leur formation (aménagements, matériel spécialisé).',
  NULL,
  500,
  5000,
  'EUR',
  88,
  NOW(),
  '{
    "eligibility": {
      "conditions": "RQTH ou bénéficiaire de l''obligation d''emploi",
      "level": "Toute formation professionnalisante"
    },
    "meta": {}
  }'::jsonb
),

-- 10. Bourse DAAD (Allemagne)
(
  'Bourse DAAD — Séjours de Recherche en Allemagne',
  'https://www.daad.de/fr/le-daad/',
  'VERIFIED',
  'Office Allemand d''Échanges Universitaires (DAAD)',
  'RESEARCH',
  'PHD',
  ARRAY['Sciences', 'Ingénierie', 'Sciences humaines', 'Arts'],
  'Allemagne',
  ARRAY['allemagne', 'recherche', 'europe', 'franco-allemand'],
  'Le DAAD offre des bourses de recherche pour des séjours courts (1 à 6 mois) en Allemagne, destinées aux chercheurs et doctorants français souhaitant collaborer avec des institutions allemandes.',
  NOW() + INTERVAL '5 months',
  1200,
  1500,
  'EUR',
  93,
  NOW(),
  '{
    "eligibility": {
      "nationality": "Française",
      "level": "Doctorat ou post-doctorat",
      "language": "Allemand ou anglais"
    },
    "duration": "1 à 6 mois",
    "meta": {}
  }'::jsonb
);
