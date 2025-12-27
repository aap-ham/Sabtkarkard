import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface HelpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HelpDialog({ open, onOpenChange }: HelpDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] sm:max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>راهنمای برنامه</DialogTitle>
        </DialogHeader>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>چگونه کارفرما اضافه کنم؟</AccordionTrigger>
            <AccordionContent>
              در بخش «کارفرمایان» روی دکمه «افزودن کارفرما» کلیک کنید و اطلاعات کارفرمای خود را وارد نمایید.
              می‌توانید نام، رنگ و دستمزد روزانه را مشخص کنید.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>چگونه روز کاری ثبت کنم؟</AccordionTrigger>
            <AccordionContent>
              در بخش «ثبت کار»  پس 
از انتخاب کار روزمزد یا کنترات  تاریخ، کارفرما و تعداد ساعات کار خود یا مبلغ تعیین شده برای کار کنتراتی را وارد کنید.
              مبلغ به صورت خودکار بر اساس دستمزدی که برای کارفرما تعیین کرده‌اید محاسبه می‌شود.
            </AccordionContent>
          </AccordionItem>
           <AccordionItem value="item-3">
            <AccordionTrigger>چگونه دریافتی ثبت کنم؟</AccordionTrigger>
            <AccordionContent>
              در بخش «دریافتی ها» تاریخ، کارفرما و مبلغ دریافتی خود و روش پرداخت مبلغ را وارد کنید.

            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-4">
            <AccordionTrigger>گزارش‌ها چگونه کار می‌کنند؟</AccordionTrigger>
            <AccordionContent>
              در بخش «گزارش‌ها» می‌توانید درآمد خود را بر اساس بازه زمانی مختلف مشاهده کنید
              و گزارش‌های دقیقی از کارهای انجام شده دریافت نمایید.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-5">
            <AccordionTrigger>داده‌های من کجا ذخیره می‌شوند؟</AccordionTrigger>
            <AccordionContent>
              تمام اطلاعات به صورت محلی در دستگاه شما ذخیره می‌شود ، در صورت نیاز به پاک کردن داده  برنامه توصیه میشود ، از اطلاعاتتان در برنامه یک pdf ذخیره کنید. .
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </DialogContent>
    </Dialog>
  );
}
