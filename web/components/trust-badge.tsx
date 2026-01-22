"use client";

import { Badge } from "@/components/ui/badge";
import { Scholarship } from "@/lib/types";
import { useMemo, useState } from "react";
import { calculateScoreBreakdown } from "@/lib/score-utils";

interface TrustBadgeProps {
    scholarship: Scholarship;
}

export function TrustBadge({ scholarship }: TrustBadgeProps) {
    const [isOpen, setIsOpen] = useState(false);

    const breakdown = useMemo(() => calculateScoreBreakdown(scholarship), [scholarship]);

    let colorClass = "bg-red-100 text-red-800 hover:bg-red-200 border-red-200";
    if (scholarship.health_score >= 80) colorClass = "bg-green-100 text-green-800 hover:bg-green-200 border-green-200";
    else if (scholarship.health_score >= 50) colorClass = "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200";

    return (
        <div className="relative inline-block" onMouseEnter={() => setIsOpen(true)} onMouseLeave={() => setIsOpen(false)}>
            <Badge variant="outline" className={`${colorClass} cursor-help`}>
                Health: {scholarship.health_score}
            </Badge>
            
            {isOpen && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 bg-white text-slate-900 text-xs rounded-md border shadow-xl p-3 z-50">
                    <div className="font-bold mb-2 border-b pb-1 text-slate-700">Health Score Breakdown</div>
                    
                    <div className="space-y-1">
                        <div className="flex justify-between items-center">
                            <span className="text-slate-500">Freshness</span>
                            <span className="font-mono font-medium">{breakdown.freshness}/40</span>
                        </div>
                        <div className="text-[10px] text-slate-400 pl-2 border-l-2 border-slate-100 mb-1">
                            Verified {breakdown.days} days ago
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-slate-500">Reliability</span>
                            <span className="font-mono font-medium">{breakdown.reliability}/40</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                            <span className="text-slate-500">Stability</span>
                            <span className="font-mono font-medium">{breakdown.stability}/20</span>
                        </div>
                    </div>
                    
                    <div className="mt-2 pt-1 border-t flex justify-between font-bold text-slate-700">
                        <span>Total</span>
                        <span>{scholarship.health_score}/100</span>
                    </div>
                </div>
            )}
        </div>
    );
}
