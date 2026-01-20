"use client"

import { useState, useEffect } from "react";
import { Scholarship } from "@/lib/types";
import { ReviewQueueItem } from "./review-queue-item";
import { ScrollArea } from "@/components/ui/scroll-area";

export function ReviewQueue() {
  const [items, setItems] = useState<Scholarship[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock Fetch
    async function fetchQueue() {
      // In real app: supabase.from('scholarships').select('*').in('status', ['SUBMITTED', 'ALERT'])
      
      // Mock Data
      const mockData: Scholarship[] = [
        {
            id: "1",
            name: "Merit Excellence 2026",
            source_url: "https://education.gov/merit",
            status: "SUBMITTED",
            health_score: 95,
            deadline_at: "2026-06-01",
            last_verified_at: new Date().toISOString(),
            data: {},
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        },
        {
            id: "2",
            name: "Broken Link Scholarship",
            source_url: "https://dead-domain.com",
            status: "SUBMITTED", // Should be ALERT but using SUBMITTED for mock
            health_score: 20,
            deadline_at: null,
            last_verified_at: new Date().toISOString(),
            data: {},
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }
      ];
      
      setItems(mockData);
      setLoading(false);
    }

    fetchQueue();
  }, []);

  if (loading) return <div className="p-4 text-sm text-muted-foreground">Loading queue...</div>;

  if (items.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <p className="text-lg font-semibold">Inbox Zero!</p>
            <p className="text-sm text-muted-foreground">No pending tasks.</p>
        </div>
    );
  }

  return (
    <div className="h-full border-r">
        <div className="p-4 border-b bg-background sticky top-0 z-10">
            <h2 className="font-semibold">Review Queue</h2>
            <p className="text-xs text-muted-foreground">{items.length} pending</p>
        </div>
        <ScrollArea className="h-[calc(100vh-4rem)]">
            <div className="flex flex-col">
                {items.map((item) => (
                    <ReviewQueueItem 
                        key={item.id} 
                        scholarship={item} 
                        isActive={activeId === item.id}
                        onClick={() => setActiveId(item.id)}
                    />
                ))}
            </div>
        </ScrollArea>
    </div>
  );
}
