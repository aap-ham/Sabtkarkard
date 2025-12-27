import { useEffect, useState } from "react";
import { storage } from "@/lib/storage";
import { toFarsiNumber, formatNumberWithSeparator } from "@/lib/utils";
import { WorkDay, Employer, ContractWork } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, TrendingUp, Calendar, Users, User } from "lucide-react";

export default function Dashboard() {
  const [workDays, setWorkDays] = useState<WorkDay[]>([]);
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [contractWorks, setContractWorks] = useState<ContractWork[]>([]);
  const [hours, setHours] = useState("");
  const [amount, setAmount] = useState("");
  const [overtime, setOvertime] = useState("");
  const [description, setDescription] = useState("");
  const [endDate, setEndDate] =useState("")
  useEffect(() => {
    setWorkDays(storage.getWorkDays());
    setEmployers(storage.getEmployers());
    setContractWorks(storage.getContractWorks());
  }, []);

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

  const calculateOvertimePay = (dailyWage: number, overtimeHours: number) => {
    return (dailyWage / 8) * overtimeHours;
  };

  const calculateTotalPay = (day: WorkDay) => {
    const basePay = day.amount;
    const overtimePay = day.overtime ? calculateOvertimePay(day.amount, day.overtime) : 0;
    return basePay + overtimePay;
  };

  const totalDailyEarnings = workDays.reduce((sum, day) => sum + calculateTotalPay(day), 0);
  const totalContractEarnings = contractWorks.reduce((sum, c) => sum + c.totalAmount, 0);
  const totalEarnings = totalDailyEarnings + totalContractEarnings;

  const thisMonthDailyEarnings = workDays
    .filter((day) => {
      const date = new Date(day.date);
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    })
    .reduce((sum, day) => sum + calculateTotalPay(day), 0);

  const thisMonthContractEarnings = contractWorks
    .filter((c) => {
      const date = new Date(c.startDate);
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    })
    .reduce((sum, c) => sum + c.totalAmount, 0);

  const thisMonthEarnings = thisMonthDailyEarnings + thisMonthContractEarnings;

  const recentWorkDays = workDays
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const getEmployerName = (id: string) => {
    return employers.find((e) => e.id === id)?.name || "نامشخص";
  };

  const formatCurrency = (amount: number) => {
    return formatNumberWithSeparator(amount) + " تومان";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fa-IR");
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center justify-center gap-2">
              <Wallet className="h-4 w-4 text-primary" />
              کل درآمد
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(totalEarnings)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center justify-center gap-2">
              <TrendingUp className="h-4 w-4 text-accent" />
              درآمد این ماه
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-2xl font-bold text-accent">
              {formatCurrency(thisMonthEarnings)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center justify-center gap-2">
              <Calendar className="h-4 w-4 text-warning" />
              روزهای کاری
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-2xl font-bold">{toFarsiNumber(workDays.length)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center justify-center gap-2">
              <Users className="h-4 w-4 text-success" />
              کارفرمایان
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-2xl font-bold">{toFarsiNumber(employers.length)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>آخرین کارهای روزمزد ثبت شده</CardTitle>
        </CardHeader>
        <CardContent>
          {recentWorkDays.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              هنوز کاری ثبت نشده است
            </p>
          ) : (
            <div className="space-y-3">
              {recentWorkDays.map((day) => {
                const employer = employers.find((e) => e.id === day.employerId);
                return (
                  <div
                    key={day.id}
                    className="p-4 bg-secondary rounded-lg"
                  >
                    <div className="flex items-center justify-between gap-4">
                     <div className="flex items-center gap-4 flex-1 min-w-0"> 
                      <User 
                        className="w-5 h-5" 
                        style={{ color: employer?.color || "#ccc" }} 
                      />
                       <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{getEmployerName(day.employerId)}</span>
                       </div>
                       <div className="flex items-left">
                          <span className=" text-left font-bold text-sm text-success">
                             {formatCurrency(calculateTotalPay(day))}
                          </span>
                       </div>
    
                    </div>
                    </div>
                    
                       <div className="flex justify-between text-xs text-muted-foreground">
                         <span>{formatDate(day.date)} </span>
                          <span> 
                              {toFarsiNumber(day.hours)} ساعت
                              {day.overtime && ` - اضافه‌کاری: ${toFarsiNumber(day.overtime)} ساعت`}
                          </span>
                       </div>
             </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
