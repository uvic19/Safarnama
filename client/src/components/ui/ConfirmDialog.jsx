import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./dialog";
import { Button } from "./button";

export default function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Delete",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  variant = "destructive",
  submitting = false,
}) {
  const handleConfirm = async (e) => {
    e.stopPropagation();
    await onConfirm();
  };

  const handleCancel = (e) => {
    e.stopPropagation();
    if (onCancel) onCancel();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="bg-[#0C0C0E] border border-white/[0.08] text-foreground rounded-2xl max-w-sm p-5 gap-6">
        <DialogHeader className="gap-2">
          <DialogTitle className="text-lg font-semibold tracking-tight text-white">{title}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-row justify-end gap-2 p-0 bg-transparent border-t-0 -mx-0 -mb-0 rounded-b-none mt-2">
          <Button
            variant="ghost"
            onClick={handleCancel}
            disabled={submitting}
            className="flex-1 sm:flex-initial text-muted-foreground hover:text-foreground hover:bg-white/[0.05]"
          >
            {cancelText}
          </Button>
          <Button
            variant={variant === "destructive" ? "destructive" : "default"}
            onClick={handleConfirm}
            disabled={submitting}
            className={`flex-1 sm:flex-initial ${
              variant === "destructive"
                ? "bg-rose-600 hover:bg-rose-500 text-white"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            }`}
          >
            {submitting ? "Processing..." : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
