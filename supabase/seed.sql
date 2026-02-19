-- Seed Data for Scholarships
-- Generates 5 diverse profiles for testing

INSERT INTO scholarships (name, source_url, status, deadline_at, amount_min, amount_max, currency, health_score, data)
VALUES
-- 1. Merit Excellence (High GPA, USA)
(
    'Merit Excellence Scholarship 2026',
    'https://education.gov.us/scholarships/merit-2026',
    'VERIFIED',
    NOW() + INTERVAL '3 months',
    10000,
    25000,
    'USD',
    95,
    '{
        "eligibility": {
            "gpa_min": 3.8,
            "level": ["Undergraduate", "Master"],
            "residency": ["US Citizen", "Permanent Resident"]
        },
        "requirements": ["Transcript", "2 Essays", "SAT Score > 1400"],
        "tags": ["merit", "prestigious"]
    }'::jsonb
),

-- 2. Global Mobility Grant (Study in France)
(
    'Global Mobility Grant - France 2026',
    'https://campusfrance.org/mobility-grant',
    'VERIFIED',
    NOW() + INTERVAL '1 month',
    5000,
    5000,
    'EUR',
    88,
    '{
        "eligibility": {
            "destination_country": "France",
            "origin_region": "Global",
            "age_limit": 30
        },
        "benefits": ["Visa Support", "Housing Allowance"],
        "tags": ["mobility", "europe", "culture"]
    }'::jsonb
),

-- 3. Women in Tech Initiative (Gender specific)
(
    'Women in Tech Initiative',
    'https://womenintech.foundation/grants',
    'VERIFIED',
    NULL, -- Rolling deadline
    2000,
    8000,
    'EUR',
    92,
    '{
        "eligibility": {
            "gender": "Female",
            "fields": ["Computer Science", "Engineering", "Data Science"],
            "level": ["Bachelor", "Master", "Bootcamp"]
        },
        "requirements": ["GitHub Portfolio", "Coding Challenge"],
        "tags": ["diversity", "tech", "women-in-stem"]
    }'::jsonb
),

-- 4. Future Researchers (PhD)
(
    'Future Researchers Fellowship',
    'https://research-council.eu/fellowship',
    'VERIFIED',
    NOW() + INTERVAL '6 months',
    30000,
    45000,
    'EUR',
    98,
    '{
        "eligibility": {
            "level": "PhD",
            "domains": ["Physics", "Biology", "Mathematics"],
            "status": "Full-time"
        },
        "duration": "3 years",
        "tags": ["research", "science", "fellowship"]
    }'::jsonb
),

-- 5. Creative Arts Fund (Portfolio)
(
    'Creative Arts Fund',
    'https://arts-foundation.org/apply',
    'VERIFIED',
    NOW() + INTERVAL '45 days',
    1000,
    10000,
    'GBP',
    85,
    '{
        "eligibility": {
            "fields": ["Fine Arts", "Music", "Design"],
            "portfolio_required": true
        },
        "selection_process": "Jury Review",
        "tags": ["arts", "creative"]
    }'::jsonb
);
