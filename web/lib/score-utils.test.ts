import { calculateScoreBreakdown } from "./score-utils";
import { Scholarship } from "./types";

describe('Score Utilities', () => {
    const mockNow = new Date('2026-01-20T12:00:00Z');
    
    beforeAll(() => {
        jest.useFakeTimers();
        jest.setSystemTime(mockNow);
    });

    afterAll(() => {
        jest.useRealTimers();
    });

    const baseScholarship: Scholarship = {
        id: '1',
        name: 'Test',
        source_url: 'https://other.com',
        status: 'VERIFIED',
        health_score: 100,
        last_verified_at: '2026-01-20T12:00:00Z',
        created_at: '',
        updated_at: '',
        data: {}
    };

    it('calculates maximum freshness for today', () => {
        const breakdown = calculateScoreBreakdown(baseScholarship);
        expect(breakdown.freshness).toBe(40);
        expect(breakdown.days).toBe(0);
    });

    it('decays freshness over time', () => {
        const oldScholarship = {
            ...baseScholarship,
            last_verified_at: new Date(mockNow.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString()
        };
        const breakdown = calculateScoreBreakdown(oldScholarship);
        // 40 * (1 - 90/180) = 20
        expect(breakdown.freshness).toBe(20);
        expect(breakdown.days).toBe(90);
    });

    it('assigns higher reliability to .edu domains', () => {
        const eduScholarship = {
            ...baseScholarship,
            source_url: 'https://university.edu/grant'
        };
        const breakdown = calculateScoreBreakdown(eduScholarship);
        expect(breakdown.reliability).toBe(40);
    });

    it('assigns standard reliability to normal domains', () => {
        const breakdown = calculateScoreBreakdown(baseScholarship);
        expect(breakdown.reliability).toBe(32);
    });

    it('deduces stability from the total health score', () => {
        const scholarship = {
            ...baseScholarship,
            health_score: 80, // Freshness 40 + Reliability 32 + ? = 80 -> Stability 8
        };
        const breakdown = calculateScoreBreakdown(scholarship);
        expect(breakdown.stability).toBe(8);
    });
});
