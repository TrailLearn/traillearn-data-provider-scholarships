"use client"

import { Button } from "@/components/ui/button";
import { Check, X, Edit3 } from "lucide-react";

interface StickyActionBarProps {
  onApprove: () => void;
  onReject: () => void;
  onEdit: () => void;
  isProcessing?: boolean;
}

export function StickyActionBar({ onApprove, onReject, onEdit, isProcessing = false }: StickyActionBarProps) {
  return (
    <div className="sticky bottom-0 left-0 right-0 border-t bg-background/80 backdrop-blur-sm p-4 flex justify-between items-center shadow-lg">
      <div className="flex gap-2">
        <Button 
            variant="outline" 
            size="sm" 
            onClick={onEdit}
            disabled={isProcessing}
            className="gap-2"
        >
          <Edit3 className="h-4 w-4" /> Modifier
        </Button>
      </div>

      <div className="flex gap-3">
        <Button 
            variant="outline" 
            size="sm" 
            onClick={onReject}
            disabled={isProcessing}
            className="text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700 gap-2"
        >
          <X className="h-4 w-4" /> Rejeter
        </Button>
        <Button 
            variant="default" 
            size="sm" 
            onClick={onApprove}
            disabled={isProcessing}
            className="bg-emerald-600 hover:bg-emerald-700 gap-2"
        >
          <Check className="h-4 w-4" /> Valider le changement
        </Button>
      </div>
    </div>
  );
}
