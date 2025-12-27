import { useEffect, useState } from "react";
import { storage } from "@/lib/storage";
import { toFarsiNumber, formatNumberWithSeparator, toEnglishNumber } from "@/lib/utils";
import { dailyWorkSchema } from "@/lib/validations";
import { WorkDay, Employer, ContractWork } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Edit, User } from "lucide-react";
import { toast } from "sonner";
import { JalaliDatePicker } from "@/components/JalaliDatePicker";
import { WorkTypeDialog } from "@/components/WorkTypeDialog";
import { ContractWorkDialog } from "@/components/ContractWorkDialog";

export default function WorkDays() {
  const [workDays, setWorkDays] = useState<WorkDay[]>([]);
  const [contractWorks, setContractWorks] = useState<ContractWork[]>([]);
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [selectedEmployerId, setSelectedEmployerId] = useState<string>("all");
  const [selectedWorkType, setSelectedWorkType] = useState<string>("all");
  const [isTypeDialogOpen, setIsTypeDialogOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isContractDialogOpen, setIsContractDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingContract, setEditingContract] = useState<ContractWork | null>(null);
  const [employerId, setEmployerId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [hours, setHours] = useState("");
  const [amount, setAmount] = useState("");
  const [overtime, setOvertime] = useState("");
  const [description, setDescription] = useState("");
  const [isAmountFocused, setIsAmountFocused] = useState(false);
  const [isHoursFocused, setIsHoursFocused] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteContractId, setDeleteContractId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [endDate, setEndDate] = useState("");
  useEffect(() => {
    loadData();
    if (!editingId && isOpen) {
      if (employers.length === 1 && !employerId) {
        setEmployerId(employers[0].id);
      }
      
      if (employerId) {
        const employer = employers.find(e => e.id === employerId);
        if (employer?.wage) {
          setAmount(employer.wage.toString());
        } else {
          const defaultWage = storage.getDefaultWage();
          if (defaultWage) {
            setAmount(defaultWage.toString());
          }
        }
      } else {
        const defaultWage = storage.getDefaultWage();
        if (defaultWage) {
          setAmount(defaultWage.toString());
        }
      }
      
      setIsAmountFocused(true);
    }
  }, [isOpen, editingId, employers, employerId]);

  const loadData = () => {
    setWorkDays(storage.getWorkDays());
    setContractWorks(storage.getContractWorks());
    setEmployers(storage.getEmployers());
  };

  const validateForm = () => {
    const finalEmployerId = employers.length === 1 ? employers[0].id : employerId;
    const result = dailyWorkSchema.safeParse({
      employerId: finalEmployerId,
      date,
      hours,
      amount,
      overtime: overtime || undefined,
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
    
    const hourlyRate = parseFloat(validData.amount) / 8;
    const calculatedAmount = Math.round(hourlyRate * parseFloat(validData.hours));

    if (editingId) {
      const updated = workDays.map((day) =>
        day.id === editingId
          ? {
              ...day,
              employerId: validData.employerId,
              date: validData.date,
              hours: parseFloat(validData.hours),
              amount: calculatedAmount,
              overtime: validData.overtime ? parseFloat(validData.overtime) : undefined,
              description: validData.description,
            }
          : day
      );
      storage.saveWorkDays(updated);
      toast.success("روز کاری ویرایش شد");
    } else {
      const newWorkDay: WorkDay = {
        id: Date.now().toString(),
        employerId: validData.employerId,
        date: validData.date,
        hours: parseFloat(validData.hours),
        amount: calculatedAmount,
        overtime: validData.overtime ? parseFloat(validData.overtime) : undefined,
        description: validData.description,
        createdAt: new Date(),
      };
      storage.saveWorkDays([...workDays, newWorkDay]);
      toast.success("روز کاری ثبت شد");
    }

    loadData();
    resetForm();
    setIsOpen(false);
  };

  const handleEdit = (day: WorkDay) => {
    setEditingId(day.id);
    setEmployerId(day.employerId);
    setDate(day.date);
    setHours(day.hours.toString());
    // Get wage from employer, not from the saved work day
    const employer = employers.find(e => e.id === day.employerId);
    const wageToUse = employer?.wage || storage.getDefaultWage() || 0;
    setAmount(wageToUse.toString());
    setOvertime(day.overtime?.toString() || "");
    setDescription(day.description || "");
    setIsOpen(true);
  };

  const handleDelete = () => {
    if (!deleteId) return;
    const updated = workDays.filter((day) => day.id !== deleteId);
    storage.saveWorkDays(updated);
    loadData();
    toast.success("روز کاری حذف شد");
    setDeleteId(null);
  };

  const resetForm = () => {
    setEmployerId("");
    setDate(new Date().toISOString().split("T")[0]);
    setHours("");
    const defaultWage = storage.getDefaultWage();
    setAmount(defaultWage ? defaultWage.toString() : "");
    setOvertime("");
    setDescription("");
    setEditingId(null);
    setIsAmountFocused(false);
    setErrors({});
  };

  const getEmployerName = (id: string) => {
    return employers.find((e) => e.id === id)?.name || "نامشخص";
  };

  const getEmployerColor = (id: string) => {
    return employers.find((e) => e.id === id)?.color || "#ccc";
  };

  const calculateOvertimePay = (dailyWage: number, overtimeHours: number) => {
    return Math.round((dailyWage / 8) * overtimeHours);
  };

  const calculateTotalPay = (day: WorkDay) => {
    const basePay = day.amount;
    const overtimePay = day.overtime ? calculateOvertimePay(day.amount, day.overtime) : 0;
    return Math.round(basePay + overtimePay);
  };

  const formatCurrency = (amount: number) => {
    return formatNumberWithSeparator(amount) + " تومان";
  };

  const handleAmountChange = (value: string) => {
    const englishValue = toEnglishNumber(value);
    const numericValue = englishValue.replace(/[^0-9]/g, '');
    setAmount(numericValue);
  };

  const handleOvertimeChange = (value: string) => {
    const englishValue = toEnglishNumber(value);
    const numericValue = englishValue.replace(/[^0-9]/g, '');
    setOvertime(numericValue);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fa-IR");
  };

  const filteredWorkDays = selectedEmployerId === "all" 
    ? workDays 
    : workDays.filter(day => day.employerId === selectedEmployerId);

  const filteredContractWorks = selectedEmployerId === "all"
    ? contractWorks
    : contractWorks.filter(c => c.employerId === selectedEmployerId);

  const sortedWorkDays = [...filteredWorkDays].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // FIX 1: اصلاح امضای تابع و ارسال شیء کامل قرارداد در فراخوانی
  const handleEditContract = (contract: ContractWork) => {
    setEditingContract(contract);
    setIsContractDialogOpen(true);
  };

  const handleDeleteContract = () => {
    if (!deleteContractId) return;
    const updated = contractWorks.filter((c) => c.id !== deleteContractId);
    storage.saveContractWorks(updated);
    loadData();
    toast.success("کار کنتراتی حذف شد");
    setDeleteContractId(null);
  };

  const handleToggleContractStatus = (contract: ContractWork) => {
    const newStatus = contract.status === 'in-progress' ? 'completed' : 'in-progress';
    const updated = contractWorks.map((c) =>
      c.id === contract.id ? { ...c, status: newStatus } : c
    ) as ContractWork[];
    storage.saveContractWorks(updated);
    loadData();
    toast.success(newStatus === 'completed' ? 'کار به تکمیل شده تغییر کرد' : 'کار به در حال انجام تغییر کرد');
  };

  return (
    <div className="space-y-4">
      {employers.length === 1 && employers[0].wage && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">دستمزد روزانه شما</p>
                <p className="text-2xl font-bold mt-1" dir="rtl">
                  {formatNumberWithSeparator(employers[0].wage.toString())} تومان
                </p>
              </div>
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: employers[0].color }}
              >
                <User className="w-7 h-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">کارها</h2>
          <Button onClick={() => setIsTypeDialogOpen(true)}>
            <Plus className="ml-2 h-4 w-4" />
            ثبت کار جدید
          </Button>
        </div>

        <div className="flex gap-3">
          {employers.length > 1 && (
            <div className="flex-1">
              <Select value={selectedEmployerId} onValueChange={setSelectedEmployerId}>
                <SelectTrigger dir="rtl" className="text-right">
                  <SelectValue placeholder="همه کارفرماها" />
                </SelectTrigger>
                <SelectContent dir="rtl" className="text-right z-50">
                  <SelectItem value="all" className="text-right">همه کارفرماها</SelectItem>
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
            </div>
          )}

          <div className={employers.length > 1 ? "flex-1" : "w-full"}>
            <Select value={selectedWorkType} onValueChange={setSelectedWorkType}>
              <SelectTrigger dir="rtl" className="text-right">
                <SelectValue placeholder="همه کارها" />
              </SelectTrigger>
              <SelectContent dir="rtl" className="text-right z-50">
                <SelectItem value="all" className="text-right">همه کارها</SelectItem>
                <SelectItem value="daily" className="text-right">کارهای روزمزد</SelectItem>
                <SelectItem value="contract" className="text-right">کارهای کنترات</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {employers.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            ابتدا باید کارفرما اضافه کنید
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Daily Wage Work List */}
          {(selectedWorkType === "all" || selectedWorkType === "daily") && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-muted-foreground">کارهای روزمزد</h3>
              {sortedWorkDays.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center text-muted-foreground">
                    هنوز کار روزمزدی ثبت نشده است
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {sortedWorkDays.map((day) => (
                    <Card key={day.id}>
                      <CardContent className="pt-6">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <User
                                className="w-5 h-5"
                                style={{ color: getEmployerColor(day.employerId) }}
                              />
                              <span className="font-bold">{getEmployerName(day.employerId)}</span>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEdit(day)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeleteId(day.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>{formatDate(day.date)}</span>
                            <span>
                              {toFarsiNumber(day.hours)} ساعت
                              {day.overtime && ` - اضافه‌کاری: ${toFarsiNumber(day.overtime)} ساعت`}
                            </span>
                          </div>
                          {day.description && (
                            <p className="text-sm text-muted-foreground">{day.description}</p>
                          )}
                          <div className="text-left">
                            <span className="text-lg font-bold text-success">
                              {formatCurrency(calculateTotalPay(day))}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Contract Work List */}
          {(selectedWorkType === "all" || selectedWorkType === "contract") && (
            <div className="space-y-3 mt-6">
              <h3 className="text-lg font-semibold text-muted-foreground">کارهای کنترات</h3>
              {filteredContractWorks.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center text-muted-foreground">
                    هنوز کار کنتراتی ثبت نشده است
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {filteredContractWorks.map((contract) => (
                    <Card key={contract.id} className="border-primary/30">
                      <CardContent className="pt-6">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <User
                                className="w-5 h-5"
                                style={{ color: getEmployerColor(contract.employerId) }}
                              />
                              <span className="font-bold">{getEmployerName(contract.employerId)}</span>
                              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">کنترات</span>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                // FIX 1: ارسال شیء کامل قرارداد
                                onClick={() => handleEditContract(contract)} 
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeleteContractId(contract.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>{contract.title}</span>
                            <span className= "text-xs">{`شروع: ${formatDate(contract.startDate)}`}</span>
                            <span className=" text-xs">{contract.endDate ? `پایان: ${formatDate(contract.endDate)}` : 'پایان: نامشخص'}</span>
                          </div>
                          {contract.description && (
                            <p className="text-sm text-muted-foreground">{contract.description}</p>
                          )}
                          <div className="flex justify-between items-center">
                            <button
                              onClick={() => handleToggleContractStatus(contract)}
                              className={`text-xs px-2 py-0.5 rounded-full cursor-pointer transition-colors hover:opacity-80 ${contract.status === 'completed' ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'}`}
                            >
                              {contract.status === 'completed' ? 'تکمیل شده' : 'در حال انجام'}
                            </button>
                            <span className="text-lg font-bold text-success">
                              {formatCurrency(contract.totalAmount)}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Work Type Selection Dialog */}
      <WorkTypeDialog
        open={isTypeDialogOpen}
        onOpenChange={setIsTypeDialogOpen}
        onSelectDailyWage={() => {
          setIsTypeDialogOpen(false);
          setIsOpen(true);
        }}
        onSelectContract={() => {
          setIsTypeDialogOpen(false);
          setIsContractDialogOpen(true);
        }}
      />

      {/* Daily Wage Dialog */}
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingId ? "ویرایش روز کاری" : "ثبت روز کاری جدید"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {employers.length > 1 && (
              <div className="space-y-2">
                <div>
                  <Label htmlFor="employer">کارفرما</Label>
                  <Select value={employerId} onValueChange={setEmployerId}>
                    <SelectTrigger dir="rtl" className={`text-right ${errors.employerId ? "border-destructive" : ""}`}>
                      <SelectValue placeholder="انتخاب کارفرما" className="text-right" />
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
                {employerId && amount && (
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p className="text-sm text-muted-foreground">دستمزد روزانه</p>
                    <p className="text-lg font-bold mt-1" dir="rtl">
                      {formatNumberWithSeparator(amount)} تومان
                    </p>
                  </div>
                )}
              </div>
            )}

            <div>
              <Label htmlFor="date">تاریخ</Label>
              <JalaliDatePicker value={date} onChange={setDate} />
            </div>

            <div>
              <Label htmlFor="hours" className="mb-2 inline-block">ساعات کار</Label>
              <div className="relative">
                <Input
                  id="hours"
                  type="number"
                  value={hours}
                  onChange={(e) => {
                    const value = e.target.value;
                    const numValue = parseFloat(value);
                    if (value === '' || (numValue >= 1 && numValue <= 8)) {
                      setHours(value);
                    }
                  }}
                  onFocus={() => setIsHoursFocused(true)}
                  onBlur={() => setIsHoursFocused(false)}
                  placeholder="از ۱ تا ۸ یک عدد وارد کنید"
                  className={`placeholder:text-xs ${errors.hours ? "border-destructive" : ""}`}
                  min="1"
                  max="8"
                />
                {isHoursFocused && (
                  <span className="absolute -top-2.5 right-3 bg-background px-2 text-[10px] text-muted-foreground transition-all">
                    یک روز کاری برابر است با ۸ ساعت
                  </span>
                )}
              </div>
              {errors.hours && <p className="text-sm text-destructive mt-1">{errors.hours}</p>}
            </div>

            {hours === "8" && (
              <div>
                <Label htmlFor="overtime">اضافه‌کاری (ساعت)</Label>
                <Input
                  id="overtime"
                  type="number"
                  value={overtime}
                  onChange={(e) => handleOvertimeChange(e.target.value)}
                  placeholder="مثال: ۲"
                  className={errors.wage ? " text-xs " : ""}

                />
              </div>
            )}

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
              {editingId ? "ذخیره تغییرات" : "ثبت"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Contract Work Dialog */}
      <ContractWorkDialog
        open={isContractDialogOpen}
        onOpenChange={(open) => {
          setIsContractDialogOpen(open);
          // FIX 2: ریست کردن حالت ویرایش هنگام بسته شدن دیالوگ
          if (!open) { 
            setEditingContract(null);
          }
        }}
        onSuccess={loadData}
        editingContract={editingContract}
      />

      {/* Delete Confirmation Dialog - Daily Wage */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="max-w-[90vw] sm:max-w-md rounded-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>تأیید حذف</AlertDialogTitle>
            <AlertDialogDescription>
              آیا از حذف این روز کاری اطمینان دارید؟ این عمل قابل بازگشت نیست.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>لغو</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>حذف</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog - Contract Work */}
      <AlertDialog open={!!deleteContractId} onOpenChange={(open) => !open && setDeleteContractId(null)}>
        <AlertDialogContent className="max-w-[90vw] sm:max-w-md rounded-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>تأیید حذف</AlertDialogTitle>
            <AlertDialogDescription>
              آیا از حذف این کار کنتراتی اطمینان دارید؟ این عمل قابل بازگشت نیست.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>لغو</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteContract}>حذف</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}