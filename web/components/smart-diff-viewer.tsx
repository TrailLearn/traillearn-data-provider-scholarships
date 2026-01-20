"use client"

import { useMemo } from "react";
import { getSmartDiff, humanizeValue } from "@/lib/diff-utils";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface SmartDiffViewerProps {
  oldData: any;
  newData: any;
  showAll?: boolean;
  isEditing?: boolean;
  onFieldChange?: (key: string, value: any) => void;
}

export function SmartDiffViewer({ 
  oldData, 
  newData, 
  showAll = false, 
  isEditing = false,
  onFieldChange
}: SmartDiffViewerProps) {
  const diffs = useMemo(() => getSmartDiff(oldData, newData), [oldData, newData]);
  
  const visibleDiffs = showAll ? diffs : diffs.filter(d => d.isChanged);

  if (visibleDiffs.length === 0 && !isEditing) {
    return (
      <div className="p-8 text-center border rounded-lg bg-muted/20">
        <p className="text-sm text-muted-foreground">Aucun changement détecté.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b">
        <div className="col-span-4">Champ</div>
        <div className="col-span-4">Ancienne Valeur</div>
        <div className="col-span-4">Nouvelle Valeur</div>
      </div>
      
      <div className="divide-y border rounded-lg overflow-hidden bg-card">
        {visibleDiffs.map((diff) => (
          <div key={diff.key} className="grid grid-cols-12 gap-4 p-4 text-sm items-center hover:bg-muted/30 transition-colors">
            {/* Key */}
            <div className="col-span-4 font-medium text-muted-foreground truncate" title={diff.key}>
              {diff.key}
            </div>

            {/* Old Value */}
            <div className="col-span-4">
              <span className={cn(
                "px-1.5 py-0.5 rounded truncate block",
                diff.isChanged ? "bg-rose-100 text-rose-700 line-through dark:bg-rose-900/30 dark:text-rose-400" : "text-muted-foreground"
              )}>
                {humanizeValue(diff.oldValue, diff.key)}
              </span>
            </div>

            {/* New Value */}
            <div className="col-span-4">
              {isEditing ? (
                <Input 
                  value={newData?.[diff.key] ?? ""} 
                  onChange={(e) => onFieldChange?.(diff.key, e.target.value)}
                  className="h-8 py-0 px-2"
                />
              ) : (
                <span className={cn(
                  "px-1.5 py-0.5 rounded truncate block",
                  diff.isChanged ? "bg-emerald-100 text-emerald-700 font-medium dark:bg-emerald-900/30 dark:text-emerald-400" : "text-foreground"
                )}>
                  {humanizeValue(diff.newValue, diff.key)}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
