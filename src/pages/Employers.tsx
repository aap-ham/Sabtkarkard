import { useEffect, useState } from "react";
import { storage } from "@/lib/storage";
import { Employer } from "@/types";
import { toEnglishNumber, formatNumberWithSeparator } from "@/lib/utils";
import { employerSchema } from "@/lib/validations";
import { Card, CardContent } from "@/components/ui/card";
import { WorkDay, Payment } from "@/types"; // ⬅️ توجه: Payment به تایپ‌ها اضافه شد (اگرچه در خطوط بالاتر وجود داشت، اما برای اطمینان مجدد بررسی شد)
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Trash2, Edit, User } from "lucide-react";
import { toast } from "sonner";

const COLORS = [
  "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6",
  "#ec4899", "#f97316", "#84cc16"
];

export default function Employers() {
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [workDays, setWorkDays] = useState<WorkDay[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]); // ⬅️ از اینجا استفاده می‌شود
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [wage, setWage] = useState("");
  const [isWageFocused, setIsWageFocused] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadEmployers();
  }, []);

  const loadEmployers = () => {
    setEmployers(storage.getEmployers());
    setWorkDays(storage.getWorkDays());
    // ⬅️ بارگذاری payments نیز برای چک کردن قابلیت حذف لازم است
    setPayments(storage.getPayments()); 
  };

  const validateForm = () => {
    const result = employerSchema.safeParse({ name, wage, color: selectedColor });
    
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return null;
    }
    
    // Check for duplicate names
    const isDuplicate = employers.some(
      (emp) => emp.name.trim() === name.trim() && emp.id !== editingId
    );
    if (isDuplicate) {
      setErrors({ name: "کارفرما با این نام قبلاً ثبت شده است" });
      return null;
    }
    
    setErrors({});
    return result.data;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validData = validateForm();
    if (!validData) {
      toast.error("لطفا خطای فرم را برطرف کنید");
      return;
    }

    if (editingId) {
      const updated = employers.map((emp) =>
        emp.id === editingId ? { ...emp, name, color: selectedColor, wage: wage ? parseFloat(wage) : undefined } : emp
      );
      storage.saveEmployers(updated);
      toast.success("کارفرما ویرایش شد");
    } else {
      const newEmployer: Employer = {
        id: Date.now().toString(),
        name,
        color: selectedColor,
        wage: wage ? parseFloat(wage) : undefined,
        createdAt: new Date(),
      };
      storage.saveEmployers([...employers, newEmployer]);
      toast.success("کارفرما اضافه شد");
    }

    loadEmployers();
    resetForm();
    setIsOpen(false);
  };

  const handleEdit = (employer: Employer) => {
    setEditingId(employer.id);
    setName(employer.name);
    setSelectedColor(employer.color);
    setWage(employer.wage?.toString() || "");
    setIsOpen(true);
  };

  /**
   * بررسی می‌کند که آیا کارفرما قابل حذف است یا خیر. 
   * کارفرما تنها زمانی قابل حذف است که هیچ روز کاری یا دریافتی مرتبطی نداشته باشد.
   */
  const canDeleteEmployer = (id: string) => {
    const hasWorkDays = workDays.some(day => day.employerId === id);
    const hasPayments = payments.some(p => p.employerId === id);
    return !hasWorkDays && !hasPayments;
  };

  const handleDeleteClick = (id: string) => {
    if (!canDeleteEmployer(id)) {
      // پیام خطای جامع‌تر
      toast.error("امکان حذف کارفرما وجود ندارد. ابتدا روزهای کاری و/یا دریافتی‌های مرتبط را حذف کنید.");
      return;
    }
    setDeleteConfirmId(id);
  };
  
  // ⬅️ بخش تکراری قبلی حذف شد

  const handleDeleteConfirm = () => {
    if (deleteConfirmId) {
      const updated = employers.filter((emp) => emp.id !== deleteConfirmId);
      storage.saveEmployers(updated);
      // نیازی به حذف روزهای کاری/دریافتی نیست، چون توسط canDeleteEmployer چک شده‌اند
      loadEmployers();
      toast.success("کارفرما حذف شد");
      setDeleteConfirmId(null);
    }
  };

  const resetForm = () => {
    setName("");
    setSelectedColor(COLORS[0]);
    setWage("");
    setIsWageFocused(false);
    setEditingId(null);
    setErrors({});
  };

  const handleWageChange = (value: string) => {
    const englishValue = toEnglishNumber(value);
    const numericValue = englishValue.replace(/[^0-9]/g, '');
    setWage(numericValue);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">کارفرمایان</h2>
        <Dialog open={isOpen} onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="ml-2 h-4 w-4" />
              افزودن کارفرما
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[90vw] sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "ویرایش کارفرما" : "کارفرمای جدید"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
             <Label htmlFor="name">نام کارفرمای من</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: شرکت الف"
                  className={`text-sm ${errors.name ? "border-destructive" : ""}`}
                />
                {errors.name && <p className="text-sm mt-1">{errors.name}</p>}
              </div>
              <div>
                <Label htmlFor="wage" className="mb-3 inline-block"> دستمزد من</Label>
                <div className="relative text-sm">
                  <Input
                    id="wage"
                    type="text"
                    inputMode="numeric"
                    dir="rtl"
                    value={isWageFocused ? wage : (wage ? formatNumberWithSeparator(wage) : '')}
                    onChange={(e) => handleWageChange(e.target.value)}
                    onFocus={() => setIsWageFocused(true)}
                    onBlur={() => setIsWageFocused(false)}
                    placeholder="مثال: ۱,۰۰۰,۰۰۰"/>
                  {isWageFocused && (
                    <span className="absolute -top-2.5 right-3 text-xs text-muted-foreground bg-background px-1 animate-in fade-in slide-in-from-bottom-2 duration-200">
                      این دستمزد برای یک روز کاری است
                    </span>
                  )}
                </div>
                {errors.wage && <p className="text-sm text-destructive mt-1">{errors.wage}</p>}
              </div>

              <div>
                <Label>یک رنگ انتخاب کنید</Label>
                <div className="flex flex-wrap gap-3 mt-2">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`transition-all ${
                        selectedColor === color
                          ? "ring-2 ring-primary ring-offset-2 rounded-lg"
                          : "hover:scale-110"
                      }`}
                    >
                      <User className="w-6 h-6" style={{ color }} />
                    </button>
                  ))}
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={!name.trim() || !wage.trim()}>
                {editingId ? "ذخیره تغییرات" : "افزودن"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {employers.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            هنوز کارفرمایی اضافه نشده است
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {employers.map((employer) => (
            <Card key={employer.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center flex-1 min-w-0 gap-4">
                    <User 
                      className="w-5 h-5" 
                      style={{ color: employer.color }} 
                    />
                    <span className="font-medium">{employer.name}</span>
                  </div>
                  <div className="text-left flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(employer)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(employer.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                  </div>
                   <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">دستمزد من</span>
                      <span className=" text-left text-success">
                       {formatNumberWithSeparator(employer.wage)} تومان
                      </span>
                   </div>
                
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={deleteConfirmId !== null} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <AlertDialogContent className="max-w-[90vw] sm:max-w-md rounded-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>تأیید حذف</AlertDialogTitle>
            <AlertDialogDescription>
              آیا از حذف این کارفرما اطمینان دارید؟ این عمل قابل بازگشت نیست.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>لغو</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>حذف</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
