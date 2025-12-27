import { useState, useEffect } from "react";
import { storage } from "@/lib/storage";
import { toEnglishNumber, formatNumberWithSeparator } from "@/lib/utils";
import { contractWorkSchema } from "@/lib/validations";
import { ContractWork, Employer } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
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
import { User } from "lucide-react";
import { toast } from "sonner";
import { JalaliDatePicker } from "@/components/JalaliDatePicker";

interface ContractWorkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  editingContract?: ContractWork | null;
}

export function ContractWorkDialog({
  open,
  onOpenChange,
  onSuccess,
  editingContract,
}: ContractWorkDialogProps) {
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [employerId, setEmployerId] = useState("");
  const [title, setTitle] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setEmployers(storage.getEmployers());
  }, [open]);

  useEffect(() => {
    if (editingContract) {
      setEmployerId(editingContract.employerId);
      setTitle(editingContract.title);
      setTotalAmount(editingContract.totalAmount.toString());
      setStartDate(editingContract.startDate);
      setEndDate(editingContract.endDate || "");
      setDescription(editingContract.description || "");
    } else {
      resetForm();
    }
  }, [editingContract, open]);

  useEffect(() => {
    if (!editingContract && employers.length === 1) {
      setEmployerId(employers[0].id);
    }
  }, [employers, editingContract]);

  const resetForm = () => {
    setEmployerId("");
    setTitle("");
    setTotalAmount("");
    setStartDate(new Date().toISOString().split("T")[0]);
    setEndDate("");
    setDescription("");
    setErrors({});
  };

  const handleAmountChange = (value: string) => {
    const englishValue = toEnglishNumber(value);
    const numericValue = englishValue.replace(/[^0-9]/g, "");
    setTotalAmount(numericValue);
  };

  const validateForm = () => {
    // اطمینان از اینکه اگر فقط یک کارفرما وجود دارد، ID آن استفاده شود
    const finalEmployerId = employers.length === 1 ? employers[0].id : employerId;
    const result = contractWorkSchema.safeParse({
      employerId: finalEmployerId,
      title,
      totalAmount,
      startDate,
      endDate: endDate || undefined,
      description: description || undefined,
    });
    
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
    
    setErrors({});
    return result.data;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validData = validateForm();
    if (!validData) {
      toast.error("خطای فرم یا عدم وجود کارفرما در صفحه کارفرمایان");
      return;
    }

    const contracts = storage.getContractWorks();

    if (editingContract) {
      // FIX 3: استفاده از validData برای ذخیره‌سازی اطلاعات
      const updated = contracts.map((c) =>
        c.id === editingContract.id
          ? {
              ...c,
              employerId: validData.employerId, // استفاده از ID اعتبارسنجی شده
              title: validData.title,
              totalAmount: parseFloat(validData.totalAmount),
              startDate: validData.startDate,
              endDate: validData.endDate,
              description: validData.description,
            }
          : c
      );
      storage.saveContractWorks(updated);
      toast.success("کار کنترات ویرایش شد");
    } else {
      // FIX 3: استفاده از validData برای ثبت کار جدید
      const newContract: ContractWork = {
        id: Date.now().toString(),
        employerId: validData.employerId, // استفاده از ID اعتبارسنجی شده
        title: validData.title,
        totalAmount: parseFloat(validData.totalAmount),
        startDate: validData.startDate,
        endDate: validData.endDate,
        description: validData.description,
        status: "in-progress",
        createdAt: new Date(),
      };
      storage.saveContractWorks([...contracts, newContract]);
      toast.success("کار کنترات ثبت شد");
    }
    onSuccess();
    onOpenChange(false);
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editingContract ? "ویرایش کار کنترات" : "ثبت کار کنترات جدید"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {employers.length > 1 && (
            <div className="space-y-2">
              <Label htmlFor="employer">کارفرما</Label>
              <Select value={employerId} onValueChange={setEmployerId}>
                <SelectTrigger dir="rtl" className={`text-right text-sm ${errors.employerId ? "border-destructive" : ""}`}>
                  <SelectValue placeholder="انتخاب کارفرما" />
                </SelectTrigger>
                <SelectContent dir="rtl" className="text-right z-50">
                  {employers.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id} className="text-right">
                      <div className="flex items-center gap-2 flex-row-reverse">
                        <div
                          className="w-4 h-4 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: emp.color }}
                        >
                          <User className="w-3 h-3 text-white" />
                        </div>
                        {emp.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.employerId && <p className="text-sm text-destructive mt-1">{errors.employerId}</p>}
            </div>
          )}

          <div>
            <Label htmlFor="title">عنوان کار</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: تخلیه بار سنگ"
              className={`text-sm ${errors.title ? "border-destructive" : ""}`}
            />
            {errors.title && <p className="text-sm text-destructive mt-1">{errors.title}</p>}
          </div>

          <div>
            <Label htmlFor="totalAmount">مبلغ کل (تومان)</Label>
            <Input
              id="totalAmount"
              value={totalAmount ? formatNumberWithSeparator(totalAmount) : ""}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder="مثال: ۵,۰۰۰,۰۰۰"
              dir="rtl"
              className={`text-sm ${errors.totalAmount ? "border-destructive" : ""}`}
            />
            {errors.totalAmount && <p className="text-sm text-destructive mt-1">{errors.totalAmount}</p>}
          </div>

          <div>
            <Label htmlFor="startDate">تاریخ شروع</Label>
            <JalaliDatePicker value={startDate} onChange={setStartDate} />
          </div>

          <div>
            <Label htmlFor="endDate">تاریخ پایان (اختیاری)</Label>
            <JalaliDatePicker value={endDate} onChange={setEndDate} />
          </div>

          <div>
            <Label htmlFor="description">توضیحات (اختیاری)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="توضیحات اضافی..."
            />
          </div>

          <Button type="submit" className="w-full">
            {editingContract ? "ذخیره تغییرات" : "ثبت"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}