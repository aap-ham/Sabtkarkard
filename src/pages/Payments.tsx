import { useState, useEffect } from "react";
import { Plus, Trash2, Edit, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { storage } from "@/lib/storage";
import { toEnglishNumber, formatNumberWithSeparator } from "@/lib/utils";
import { paymentSchema } from "@/lib/validations";
import { Payment, Employer } from "@/types";
import { toast } from "sonner";
import { JalaliDatePicker } from "@/components/JalaliDatePicker";

const PAYMENT_METHODS = [
  { value: "cash", label: "نقدی" },
  { value: "card", label: "کارت به کارت" },
  { value: "check", label: "چک" },
  { value: "transfer", label: "انتقال بانکی" },
  { value: "other", label: "سایر" },
];

const Payments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterEmployer, setFilterEmployer] = useState<string>("all");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deletingPaymentId, setDeletingPaymentId] = useState<string | null>(null); 
  const [formData, setFormData] = useState({
    employerId: "",
    amount: "",
    paymentMethod: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
  });

  useEffect(() => {
    setPayments(storage.getPayments());
    setEmployers(storage.getEmployers());
  }, []);

  const resetForm = () => {
    setFormData({
      employerId: "",
      amount: "",
      paymentMethod: "",
      date: new Date().toISOString().split("T")[0],
      description: "",
    });
    setEditingId(null);
    setErrors({});
  };

  const validateForm = () => {
    const finalEmployerId = employers.length === 1 ? employers[0].id : formData.employerId;
    const result = paymentSchema.safeParse({ ...formData, employerId: finalEmployerId });
    
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

    if (editingId) {
      // Update existing payment
      const updatedPayments = payments.map((p) =>
        p.id === editingId
          ? {
              ...p,
              employerId: validData.employerId,
              amount: parseFloat(validData.amount),
              paymentMethod: validData.paymentMethod,
              date: validData.date,
              description: validData.description || "",
            }
          : p
      );
      setPayments(updatedPayments);
      storage.savePayments(updatedPayments);
      toast.success("دریافتی با موفقیت ویرایش شد");
    } else {
      // Create new payment
      const newPayment: Payment = {
        id: Date.now().toString(),
        employerId: validData.employerId,
        amount: parseFloat(validData.amount),
        paymentMethod: validData.paymentMethod,
        date: validData.date,
        description: validData.description || "",
        createdAt: new Date(),
      };

      const updatedPayments = [...payments, newPayment];
      setPayments(updatedPayments);
      storage.savePayments(updatedPayments);
      toast.success("دریافتی با موفقیت ثبت شد");
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const handleEdit = (payment: Payment) => {
    setEditingId(payment.id);
    setFormData({
      employerId: payment.employerId,
      amount: payment.amount.toString(),
      paymentMethod: payment.paymentMethod,
      date: payment.date,
      description: payment.description || "",
    });
    setIsDialogOpen(true);
  };

const handleConfirmDelete = (id: string) => {
  const updatedPayments = payments.filter((p) => p.id !== id);
  setPayments(updatedPayments);
  storage.savePayments(updatedPayments);
  setDeletingPaymentId(null); 
  toast.success("دریافتی حذف شد");
};
  const handleDeleteClick = (id: string) => {
  setDeletingPaymentId(id);
};

  const handleAmountChange = (value: string) => {
    const englishValue = toEnglishNumber(value);
    const numericValue = englishValue.replace(/[^0-9]/g, "");
    setFormData({ ...formData, amount: numericValue });
  };

  const filteredPayments = filterEmployer === "all" 
    ? payments 
    : payments.filter(p => p.employerId === filterEmployer);

  const getEmployerById = (id: string) => {
    return employers.find((e) => e.id === id);
  };

  const getPaymentMethodLabel = (value: string) => {
    return PAYMENT_METHODS.find(m => m.value === value)?.label || value;
  };

  return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">دریافتی‌ها</h2> 
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="ml-2 h-4 w-4" />
                دریافتی جدید
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingId ? "ویرایش دریافتی" : "ثبت دریافتی جدید"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                {employers.length > 1 && (
                  <div>
                    <Label htmlFor="employer" className="block mb-3 text-right">کارفرما</Label>
                    <Select
                      value={formData.employerId}
                      onValueChange={(value) =>
                        setFormData({ ...formData, employerId: value })
                      }
                    >
                      <SelectTrigger id="employer" dir="rtl" className={`text-right ${errors.employerId ? "border-destructive" : ""}`}>
                        <SelectValue placeholder="انتخاب کارفرما" />
                      </SelectTrigger>
                      <SelectContent dir="rtl">
                        {employers.map((employer) => (
                          <SelectItem key={employer.id} value={employer.id} className="text-right">
                            <div className="flex items-center gap-2 flex-row-reverse">
                              <User 
                                className="w-4 h-4" 
                                style={{ color: employer.color }} 
                              />
                              {employer.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.employerId && <p className="text-sm text-destructive mt-1">{errors.employerId}</p>}
                  </div>
                )}

                <div>
                  <Label htmlFor="amount" className="block mb-3">مبلغ (تومان)</Label>
                  <Input
                    id="amount"
                    value={formData.amount ? formatNumberWithSeparator(formData.amount) : ""}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    placeholder="مثلا: ۵,۰۰۰,۰۰۰"
                    dir="rtl"
                    className={errors.amount ? "border-destructive" : ""}
                  />
                  {errors.amount && <p className="text-sm text-destructive mt-1">{errors.amount}</p>}
                </div>

                <div>
                  <Label htmlFor="paymentMethod" className="block mb-3 text-right">نحوه پرداخت</Label>
                  <Select
                    value={formData.paymentMethod}
                    onValueChange={(value) =>
                      setFormData({ ...formData, paymentMethod: value })
                    }
                  >
                    <SelectTrigger id="paymentMethod" dir="rtl" className={`text-right ${errors.paymentMethod ? "border-destructive" : ""}`}>
                      <SelectValue placeholder="انتخاب نحوه پرداخت" />
                    </SelectTrigger>
                    <SelectContent dir="rtl">
                      {PAYMENT_METHODS.map((method) => (
                        <SelectItem key={method.value} value={method.value} className="text-right">
                          {method.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.paymentMethod && <p className="text-sm text-destructive mt-1">{errors.paymentMethod}</p>}
                </div>

                <div>
                  <Label htmlFor="date" className="block mb-3 text-right">تاریخ</Label>
                  <JalaliDatePicker
                    value={formData.date}
                    onChange={(date) =>
                      setFormData({ ...formData, date })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="description" className="block mb-3">توضیحات (اختیاری)</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="توضیحات"
                  />
                </div>

                <Button type="submit" className="w-full">
                  {editingId ? "ذخیره تغییرات" : "ثبت دریافتی"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {employers.length > 1 && (
          <Select value={filterEmployer} onValueChange={setFilterEmployer}>
            <SelectTrigger className="w-full text-right" dir="rtl">
              <SelectValue placeholder="فیلتر بر اساس کارفرما" />
            </SelectTrigger>
            <SelectContent dir="rtl">
              <SelectItem value="all">همه کارفرماها</SelectItem>
              {employers.map((employer) => (
                <SelectItem key={employer.id} value={employer.id}>
                  <div className="flex items-center gap-2 flex-row-reverse">
                    <User 
                      className="w-4 h-4" 
                      style={{ color: employer.color }} 
                    />
                    {employer.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <div className="space-y-3">
          {filteredPayments.map((payment) => {
            const employer = getEmployerById(payment.employerId);
            return (
              <Card key={payment.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <User 
                        className="w-5 h-5 shrink-0" 
                        style={{ color: employer?.color || "#ccc" }} 
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-lg">
                            {employer?.name || "نامشخص"}
                          </span>
                        </div>
                     </div>
                    </div>
                    <div className=" text-left flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(payment)}
                        className="shrink-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                       variant="ghost"
                       size="icon"
                       onClick={() => handleDeleteClick(payment.id)} 
                       className="shrink-0">
                       <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                   </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{new Date(payment.date).toLocaleDateString("fa-IR")} </span>
                        <span>
                          {getPaymentMethodLabel(payment.paymentMethod)}
                        </span>
                    </div>
                  {/* --- انتهای flex container بالایی --- */}
                  
                  {payment.description && ( // <-- فقط توضیحات داخل این شرط است
                    <div className="mt-3 pt-3">
                      <p className="text-sm text-muted-foreground">
                        {payment.description}
                      </p>
                    </div>
                  )}

                  {/* <-- مبلغ همیشه باید نمایش داده شود (خارج از شرط description) --> */}
                  <div className={`text-left ${payment.description ? '' : 'mt-3 pt-3'}`}>
                      <div className="font-bold text-lg text-success">
                        {formatNumberWithSeparator(payment.amount.toString())} تومان
                      </div>
                  </div>

                </CardContent>
               </Card>
            );
          })}
        </div>

        {filteredPayments.length === 0 && (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              هیچ دریافتی ثبت نشده است.
            </CardContent>
          </Card>
        )}
<AlertDialog 
  open={!!deletingPaymentId} 
  onOpenChange={(open) => !open && setDeletingPaymentId(null)}
>
  <AlertDialogContent className="max-w-[90vw] sm:max-w-md rounded-lg">
    <AlertDialogHeader>
      <AlertDialogTitle>تأیید حذف دریافتی</AlertDialogTitle>
      <AlertDialogDescription>
آیا از حذف این دریافتی اطمینان دارید؟ این عمل قابل بازگشت نیست.      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>لغو</AlertDialogCancel>
      {/* در صورت تأیید، تابع حذف نهایی را با ID موجود فراخوانی کن */}
      <AlertDialogAction 
        onClick={() => {
          if (deletingPaymentId) {
            handleConfirmDelete(deletingPaymentId);
          }
        }}
      >
        حذف کن
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>

      </div>
  );
};

export default Payments;
