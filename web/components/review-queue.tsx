"use client"

import { useState, useEffect } from "react";
import { Scholarship } from "@/lib/types";
import { ReviewQueueItem } from "./review-queue-item";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ReviewQueueProps {
  activeId: string | null;
  onSelect: (scholarship: Scholarship) => void;
  itemsOverride?: Scholarship[];
}

export function ReviewQueue({ activeId, onSelect, itemsOverride }: ReviewQueueProps) {
  const [items, setItems] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(!itemsOverride);

  // Sync internal items with override if provided
  useEffect(() => {
    if (itemsOverride) {
        setItems(itemsOverride);
        setLoading(false);
    }
  }, [itemsOverride]);

  useEffect(() => {
    if (itemsOverride) return; // Skip if controlled by parent
    
    // Mock Fetch
    async function fetchQueue() {
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
            data: {
                eligibility: { gpa_min: 3.8 },
                amount: 15000
            },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        },
        {
            id: "2",
            name: "Global Mobility Grant",
            source_url: "https://campusfrance.org/grant",
            status: "SUBMITTED",
            health_score: 45,
            deadline_at: "2026-03-15",
            last_verified_at: new Date().toISOString(),
            data: {
                eligibility: { destination: "France" },
                amount: 5000
            },
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
                        onClick={() => onSelect(item)}
                    />
                ))}
            </div>
        </ScrollArea>
    </div>
  );
}
