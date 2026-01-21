"use client";

import { useState, useEffect, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ReviewQueue } from "@/components/review-queue";
import { SmartDiffViewer } from "@/components/smart-diff-viewer";
import { StickyActionBar } from "@/components/sticky-action-bar";
import { RejectDialog } from "@/components/reject-dialog";
import { Scholarship } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, LayoutDashboard } from "lucide-react";

export default function QueuePage() {
  const [items, setItems] = useState<Scholarship[]>([]);
  const [selectedItem, setSelectedItem] = useState<Scholarship | null>(null);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Initial load (simulated)
  useEffect(() => {
    const mockData: Scholarship[] = [
        {
            id: "1",
            name: "Merit Excellence 2026",
            source_url: "https://education.gov/merit",
            status: "SUBMITTED",
            health_score: 95,
            deadline_at: "2026-06-01",
            last_verified_at: new Date().toISOString(),
            data: { eligibility: { gpa_min: 3.8 }, amount: 15000 },
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
            data: { eligibility: { destination: "France" }, amount: 5000 },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        },
        {
            id: "3",
            name: "Tech Diversity Fund",
            source_url: "https://tech-diversity.org",
            status: "SUBMITTED",
            health_score: 82,
            deadline_at: "2026-04-20",
            last_verified_at: new Date().toISOString(),
            data: { eligibility: { gender: "Female" }, amount: 2500 },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }
    ];
    setItems(mockData);
  }, []);

  // Selection logic
  const selectNext = useCallback(() => {
    if (!selectedItem) {
        if (items.length > 0) setSelectedItem(items[0]);
        return;
    }
    const currentIndex = items.findIndex(i => i.id === selectedItem.id);
    if (currentIndex < items.length - 1) {
        setSelectedItem(items[currentIndex + 1]);
    }
  }, [items, selectedItem]);

  const selectPrev = useCallback(() => {
    if (!selectedItem) return;
    const currentIndex = items.findIndex(i => i.id === selectedItem.id);
    if (currentIndex > 0) {
        setSelectedItem(items[currentIndex - 1]);
    }
  }, [items, selectedItem]);

  // Actions
  const handleApprove = async () => {
    if (!selectedItem) return;
    const idToRemove = selectedItem.id;
    
    // Optimistic UI: remove from list immediately
    const nextItem = items[items.findIndex(i => i.id === idToRemove) + 1] || null;
    setItems(prev => prev.filter(i => i.id !== idToRemove));
    setSelectedItem(nextItem);
    setIsEditing(false);

    // Background API call
    console.log("API: Approving...", idToRemove);
  };

  const handleReject = (reason: string) => {
    if (!selectedItem) return;
    const idToRemove = selectedItem.id;
    
    setItems(prev => prev.filter(i => i.id !== idToRemove));
    setSelectedItem(null); // Simple fallback
    setIsEditing(false);
    console.log("API: Rejecting...", idToRemove, reason);
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Disable shortcuts if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key.toLowerCase()) {
        case 'j': selectNext(); break;
        case 'k': selectPrev(); break;
        case 'v': handleApprove(); break;
        case 'r': setIsRejectDialogOpen(true); break;
        case 'e': setIsEditing(prev => !prev); break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectNext, selectPrev, handleApprove]);

  // Mocking "Previous Data"
  const previousData = selectedItem ? {
    ...selectedItem,
    name: selectedItem.name + " (Old Version)",
    health_score: selectedItem.health_score + 10,
    deadline_at: "2025-12-31"
  } : null;

  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 md:grid-cols-12 h-full relative">
        <div className="md:col-span-4 lg:col-span-3 border-r h-full overflow-hidden">
            <ReviewQueue 
                activeId={selectedItem?.id ?? null} 
                onSelect={(item) => {
                    setSelectedItem(item);
                    setIsEditing(false);
                }}
                // Injecting items from state for optimistic updates
                itemsOverride={items} 
            />
        </div>
        
        <div className="md:col-span-8 lg:col-span-9 h-full bg-muted/10 flex flex-col overflow-hidden">
            {selectedItem ? (
                <>
                    <div className="p-8 flex-1 overflow-y-auto space-y-8">
                        <div className="flex justify-between items-start border-b pb-6">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <Badge variant="outline">{selectedItem.status}</Badge>
                                    <span className="text-xs text-muted-foreground font-mono">ID: {selectedItem.id}</span>
                                </div>
                                <h1 className="text-2xl font-bold">{selectedItem.name}</h1>
                                <a href={selectedItem.source_url} target="_blank" rel="noreferrer" className="text-sm text-primary flex items-center gap-1 hover:underline mt-1">
                                    {selectedItem.source_url} <ExternalLink className="h-3 w-3" />
                                </a>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-medium text-muted-foreground mb-1">Health Score</div>
                                <div className="text-3xl font-bold">{selectedItem.health_score}</div>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-semibold">Analyse des changements</h2>
                                {isEditing && <Badge variant="secondary" className="bg-amber-100 text-amber-700 border-amber-200 animate-pulse">Mode Édition [ESC to cancel]</Badge>}
                            </div>
                            <SmartDiffViewer 
                                oldData={previousData} 
                                newData={selectedItem} 
                                showAll={isEditing}
                                isEditing={isEditing}
                                onFieldChange={(k, v) => setSelectedItem({...selectedItem, [k]: v})}
                            />
                        </div>
                    </div>

                    <StickyActionBar 
                        onApprove={handleApprove}
                        onReject={() => setIsRejectDialogOpen(true)}
                        onEdit={() => setIsEditing(!isEditing)}
                        isProcessing={isProcessing}
                    />
                </>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-4">
                    <div className="bg-muted rounded-full p-6">
                        <LayoutDashboard className="h-12 w-12 opacity-10" />
                    </div>
                    <div className="text-center">
                        <p className="text-lg font-medium">Review Queue</p>
                        <p className="text-sm opacity-60">Utilisez <kbd className="px-1.5 py-0.5 rounded border bg-background mx-1">j</kbd> et <kbd className="px-1.5 py-0.5 rounded border bg-background mx-1">k</kbd> pour naviguer</p>
                    </div>
                </div>
            )}
        </div>

        <RejectDialog isOpen={isRejectDialogOpen} onClose={() => setIsRejectDialogOpen(false)} onConfirm={handleReject} />
      </div>
    </DashboardLayout>
  );
}
