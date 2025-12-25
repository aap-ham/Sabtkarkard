import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
// اصلاح شده: وارد کردن آیکون مورد نظر
import { ExternalLink } from "lucide-react";

interface AboutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AboutDialog({ open, onOpenChange }: AboutDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right">درباره برنامه</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 text-right">
            <p className="text-sm text-muted-foreground leading-relaxed">
            برنامه ثبت کارکرد 
            <span className="text-xs mx-1">"مدیریت کار و درآمد"</span>
            به شما کمک می‌کند تا کارهای خود را ثبت کنید،
            کارفرمایان خود و دریافتی از آنها را مدیریت کنید و گزارش‌های دقیقی از کار و درآمد خود دریافت نمایید.
          </p>         
          <div className="space-y-3">
            <p className="border-t pt-4 text-sm font-bold text-foreground">
              ارتباط با سازنده:
            </p>
            
            {/* ردیف تلگرام */}
            <div className="flex items-center gap-2">
              <span className="text-sm">تلگرام:</span>
              <a 
                href="https://t.me/mpa62"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                aria-label="باز کردن تلگرام"
              >
                {/* اصلاح شده: تغییر Link به ExternalLink */}
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
            
            {/* ردیف واتساپ */}
            <div className="flex items-center gap-2">
              <span className="text-sm">واتساپ:</span>
              <a 
                href="https://B2n.ir/gb1984"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                aria-label="باز کردن واتساپ"
              >
                {/* اصلاح شده: تغییر Link به ExternalLink */}
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
               
          <div className="border-t pt-4 text-center sm:text-right">
            <p className="text-xs text-muted-foreground">
              نسخه: 1.0.0
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              ساخته شده با ❤️ توسط محمد پروانه
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              تمامی حقوق مادی و معنوی برای سازنده محفوظ است.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
