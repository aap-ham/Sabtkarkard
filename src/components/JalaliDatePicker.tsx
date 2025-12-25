import { useState } from "react";
import { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toFarsiNumber } from "@/lib/utils";

interface JalaliDatePickerProps {
  value: string;
  onChange: (date: string) => void;
}

const persianMonths = [
  "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
  "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"
];

export function JalaliDatePicker({ value, onChange }: JalaliDatePickerProps) {
  const [open, setOpen] = useState(false);
  
  // Initialize with current date or provided value
  const initialDate = value && value.trim()
    ? new DateObject(new Date(value)).convert(persian, persian_fa)
    : new DateObject({ calendar: persian, locale: persian_fa });
  
  const [year, setYear] = useState(initialDate.year.toString());
  const [month, setMonth] = useState((initialDate.month.number).toString());
  const [day, setDay] = useState(initialDate.day.toString());

  const currentYear = new DateObject({ calendar: persian }).year;
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);
  
  // Calculate days in selected month
  const getDaysInMonth = () => {
    const monthNum = parseInt(month);
    if (monthNum <= 6) return 31;
    if (monthNum <= 11) return 30;
    // Check if leap year for Esfand
    const yearNum = parseInt(year);
    const isLeap = ((yearNum - 474) % 128) % 33 < 29 && ((yearNum - 474) % 128) % 33 % 4 === 0;
    return isLeap ? 30 : 29;
  };

  const daysInMonth = getDaysInMonth();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const handleConfirm = () => {
    const jalaliDate = new DateObject({
      year: parseInt(year),
      month: parseInt(month),
      day: parseInt(day),
      calendar: persian,
      locale: persian_fa,
    });
    const gregorianDate = jalaliDate.toDate();
    // Fix timezone offset issue by using local date components
    const localYear = gregorianDate.getFullYear();
    const localMonth = String(gregorianDate.getMonth() + 1).padStart(2, '0');
    const localDay = String(gregorianDate.getDate()).padStart(2, '0');
    onChange(`${localYear}-${localMonth}-${localDay}`);
    setOpen(false);
  };

  const displayDate = value
    ? new DateObject(new Date(value)).convert(persian, persian_fa).format("DD MMMM YYYY")
    : "انتخاب تاریخ";

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="w-full justify-start text-right"
        onClick={() => setOpen(true)}
      >
        <CalendarIcon className="ml-2 h-4 w-4" />
        {displayDate}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">انتخاب تاریخ</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-right block">سال</label>
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger dir="rtl" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent dir="rtl">
                  {years.map((y) => (
                    <SelectItem key={y} value={y.toString()}>
                      {toFarsiNumber(y)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-right block">ماه</label>
              <Select value={month} onValueChange={setMonth}>
                <SelectTrigger dir="rtl" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent dir="rtl">
                  {persianMonths.map((m, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-right block">روز</label>
              <Select value={day} onValueChange={setDay}>
                <SelectTrigger dir="rtl" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent dir="rtl" className="max-h-[200px]">
                  {days.map((d) => (
                    <SelectItem key={d} value={d.toString()}>
                      {toFarsiNumber(d)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              لغو
            </Button>
            <Button
              type="button"
              onClick={handleConfirm}
              className="flex-1"
            >
              تأیید
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
