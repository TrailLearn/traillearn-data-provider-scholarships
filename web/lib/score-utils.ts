import { Scholarship } from "./types";

export interface ScoreBreakdown {
    freshness: number;
    reliability: number;
    stability: number;
    days: number;
}

export function calculateScoreBreakdown(scholarship: Scholarship): ScoreBreakdown {
    const now = new Date();
    const verified = new Date(scholarship.last_verified_at);
    const days = Math.max(0, Math.floor((now.getTime() - verified.getTime()) / (1000 * 60 * 60 * 24)));
    
    // Freshness: 40 * (1 - days/180)
    const freshness = days >= 180 ? 0 : Math.floor(40 * (1 - days/180));
    
    // Reliability
    const domain = scholarship.source_url.match(/https?:\/\/([^/]+)/)?.[1] || "";
    const isTrusted = /\.(edu|gov|mil|ac\.[a-z]{2}|gouv\.[a-z]{2})(\.|$)/i.test(domain);
    const reliability = isTrusted ? 40 : 32;
    
    // Stability: Deduced from total score remainder
    let stability = scholarship.health_score - freshness - reliability;
    
    if (stability < 0) stability = 0;
    if (stability > 20) stability = 20;

    return { freshness, reliability, stability, days };
}
