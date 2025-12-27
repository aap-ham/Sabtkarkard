import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar, FileText } from "lucide-react";

interface WorkTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectDailyWage: () => void;
  onSelectContract: () => void;
}

export function WorkTypeDialog({
  open,
  onOpenChange,
  onSelectDailyWage,
  onSelectContract,
}: WorkTypeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center">نوع کار را انتخاب کنید</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          <Button
            variant="outline"
            className="flex flex-col items-center gap-3 h-auto py-6 hover:bg-primary/10 hover:border-primary"
            onClick={onSelectDailyWage}
          >
            <Calendar className="h-8 w-8 text-primary" />
            <span className="font-medium">روزمزد</span>
          </Button>
          <Button
            variant="outline"
            className="flex flex-col items-center gap-3 h-auto py-6 hover:bg-primary/10 hover:border-primary"
            onClick={onSelectContract}
          >
            <FileText className="h-8 w-8 text-primary" />
            <span className="font-medium">کنترات</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
