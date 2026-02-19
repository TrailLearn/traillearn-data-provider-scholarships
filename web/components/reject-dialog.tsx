"use client"

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface RejectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

const COMMON_REASONS = [
  "Lien source mort (404)",
  "Données incohérentes",
  "Scholarship expirée",
  "Informations insuffisantes",
  "Doublon"
];

export function RejectDialog({ isOpen, onClose, onConfirm }: RejectDialogProps) {
  const [reason, setReason] = useState("");

  const handleConfirm = () => {
    onConfirm(reason || "Autre motif");
    setReason("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rejeter ce changement</DialogTitle>
          <DialogDescription>
            Veuillez indiquer la raison du rejet pour informer le contributeur.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-2 py-4">
          <div className="flex flex-wrap gap-2 mb-2">
            {COMMON_REASONS.map((r) => (
              <Button 
                key={r} 
                variant="outline" 
                size="sm" 
                className="text-[10px] h-7 px-2"
                onClick={() => setReason(r)}
              >
                {r}
              </Button>
            ))}
          </div>
          <textarea
            className="w-full min-h-[100px] p-3 text-sm border rounded-md bg-background"
            placeholder="Détails supplémentaires..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Annuler</Button>
          <Button variant="destructive" onClick={handleConfirm}>Confirmer le rejet</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
