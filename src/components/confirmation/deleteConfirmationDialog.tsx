import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogContent,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Trash2 } from "lucide-react";

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  itemName?: string;
  itemType?: string; // e.g., "user", "post", "comment", etc.
  isLoading?: boolean;
  confirmButtonText?: string;
  cancelButtonText?: string;
  variant?: "destructive" | "default";
}

function DeleteConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Delete Confirmation",
  description,
  itemName,
  itemType = "item",
  isLoading = false,
  confirmButtonText = "Delete",
  cancelButtonText = "Cancel",
  variant = "destructive",
}: DeleteConfirmationDialogProps) {
  // Generate description if not provided
  const defaultDescription =
    description ||
    `Are you sure you want to delete ${
      itemName ? `"${itemName}"` : `this ${itemType}`
    }? This action cannot be undone.`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center space-x-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <Trash2 className="h-5 w-5 text-red-600" />
            </div>
            <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
          </div>
          <DialogDescription className="text-sm text-muted-foreground pt-2">
            {defaultDescription}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {cancelButtonText}
          </Button>
          <Button
            variant={variant}
            onClick={onConfirm}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {isLoading ? "Deleting..." : confirmButtonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default DeleteConfirmationDialog;
