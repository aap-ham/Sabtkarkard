import { useEffect, useState, useRef } from "react";
import { storage } from "@/lib/storage";
import { toFarsiNumber, formatNumberWithSeparator } from "@/lib/utils";
import { WorkDay, Employer, ContractWork, Payment } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Printer, FileText, CheckCircle, Clock, Wallet, TrendingUp, TrendingDown } from "lucide-react";

// Font loader for offline PDF printing
const loadFontAsBase64 = async (url: string): Promise<string> => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return '';
  }
};
const PAYMENT_METHODS: Record<string, string> = {
  cash: "نقدی",
  card: "کارت به کارت",
  check: "چک",
  transfer: "انتقال بانکی",
  other: "سایر",
};

const getPaymentMethodLabel = (value: string) => {
  return PAYMENT_METHODS[value] || value;
};

export default function Reports() {
  const [workDays, setWorkDays] = useState<WorkDay[]>([]);
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [contractWorks, setContractWorks] = useState<ContractWork[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selectedEmployerId, setSelectedEmployerId] = useState<string>("all");
  const [selectedWorkType, setSelectedWorkType] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<string>("works");
  const reportRef = useRef<HTMLDivElement>(null);
  const paymentsReportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setWorkDays(storage.getWorkDays());
    setEmployers(storage.getEmployers());
    setContractWorks(storage.getContractWorks());
    setPayments(storage.getPayments());
  }, []);

  const calculateOvertimePay = (dailyWage: number, overtimeHours: number) => {
    return (dailyWage / 8) * overtimeHours;
  };

  const calculateTotalPay = (day: WorkDay) => {
    const basePay = day.amount;
    const overtimePay = day.overtime ? calculateOvertimePay(day.amount, day.overtime) : 0;
    return basePay + overtimePay;
  };

  const formatCurrency = (amount: number) => {
    return formatNumberWithSeparator(amount) + " تومان";
  };

  const getEmployerName = (employerId: string) => {
    const employer = employers.find((e) => e.id === employerId);
    return employer?.name || "نامشخص";
  };

  // Daily wage employer stats
  const employerStats = employers
    .filter((employer) => selectedEmployerId === "all" || employer.id === selectedEmployerId)
    .map((employer) => {
      const employerDays = workDays.filter((day) => day.employerId === employer.id);
      const totalAmount = employerDays.reduce((sum, day) => sum + calculateTotalPay(day), 0);
      const totalHours = employerDays.reduce((sum, day) => sum + day.hours + (day.overtime || 0), 0);
      const averagePerHour = totalHours > 0 ? totalAmount / totalHours : 0;

      return {
        employer,
        totalAmount,
        totalHours,
        averagePerHour,
        daysCount: employerDays.length,
      };
    });

  // Contract work stats
  const contractStats = employers
    .filter((employer) => selectedEmployerId === "all" || employer.id === selectedEmployerId)
    .map((employer) => {
      const employerContracts = contractWorks.filter((c) => c.employerId === employer.id);
      const totalAmount = employerContracts.reduce((sum, c) => sum + c.totalAmount, 0);
      const completedCount = employerContracts.filter((c) => c.status === "completed").length;
      const inProgressCount = employerContracts.filter((c) => c.status === "in-progress").length;

      return {
        employer,
        totalAmount,
        contractsCount: employerContracts.length,
        completedCount,
        inProgressCount,
        contracts: employerContracts,
      };
    }).filter(stat => stat.contractsCount > 0);

  // Payment stats with remaining balance per employer
  const paymentStats = employers
    .filter((employer) => selectedEmployerId === "all" || employer.id === selectedEmployerId)
    .map((employer) => {
      const employerDays = workDays.filter((day) => day.employerId === employer.id);
      const totalDailyWageEarned = employerDays.reduce((sum, day) => sum + calculateTotalPay(day), 0);
      
      const employerContracts = contractWorks.filter((c) => c.employerId === employer.id);
      const totalContractEarned = employerContracts.reduce((sum, c) => sum + c.totalAmount, 0);
      
      const totalEarned = totalDailyWageEarned + totalContractEarned;
      
      const employerPayments = payments.filter((p) => p.employerId === employer.id);
      const totalPaid = employerPayments.reduce((sum, p) => sum + p.amount, 0);
      
      const remainingBalance = totalEarned - totalPaid;

      return {
        employer,
        totalEarned,
        totalDailyWageEarned,
        totalContractEarned,
        totalPaid,
        remainingBalance,
        paymentsCount: employerPayments.length,
        payments: employerPayments,
      };
    })
    .filter(stat => stat.totalEarned > 0 || stat.paymentsCount > 0);

  const filteredWorkDays = selectedEmployerId === "all" 
    ? workDays 
    : workDays.filter(day => day.employerId === selectedEmployerId);

  const monthlyStats = filteredWorkDays.reduce((acc, day) => {
    const date = new Date(day.date);
    const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    
    if (!acc[monthYear]) {
      acc[monthYear] = { amount: 0, hours: 0, days: 0 };
    }
    
    acc[monthYear].amount += calculateTotalPay(day);
    acc[monthYear].hours += day.hours + (day.overtime || 0);
    acc[monthYear].days += 1;
    
    return acc;
  }, {} as Record<string, { amount: number; hours: number; days: number }>);

  const sortedMonths = Object.entries(monthlyStats).sort(([a], [b]) => b.localeCompare(a));

  const formatMonth = (monthYear: string) => {
    const [year, month] = monthYear.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString("fa-IR", { year: "numeric", month: "long" });
  };

  const showDailyWage = selectedWorkType === "all" || selectedWorkType === "daily";
  const showContract = selectedWorkType === "all" || selectedWorkType === "contract";

  const handlePrint = async () => {
    const title = "گزارش کامل کارها و دریافتی‌ها";
// Load fonts as base64 for offline PDF printing
    const regularFont = await loadFontAsBase64('/src/assets/fonts/Vazirmatn-Regular.woff2');
    const boldFont = await loadFontAsBase64('/src/assets/fonts/Vazirmatn-Bold.woff2');

    // Build content for both tabs
    let htmlContent = "";
    
    // Works content
    if (showDailyWage) {
      htmlContent += `<div class="section"><div class="section-title">گزارش کارهای روزمزد به تفکیک کارفرما</div>`;
      employerStats.forEach(({ employer, totalAmount, totalHours, averagePerHour, daysCount }) => {
        htmlContent += `
          <div class="stat-card">
            <div class="stat-card-title">
              <span class="color-dot" style="background-color: ${employer.color}"></span>
              ${employer.name}
            </div>
            <div class="stat-grid">
              <div class="stat-item"><span class="stat-label">تعداد روزهای کاری: </span><span class="stat-value">${toFarsiNumber(daysCount)}</span></div>
              <div class="stat-item"><span class="stat-label">مجموع ساعات: </span><span class="stat-value">${toFarsiNumber(totalHours)}</span></div>
              <div class="stat-item"><span class="stat-label">کل درآمد: </span><span class="stat-value success">${formatCurrency(totalAmount)}</span></div>
              <div class="stat-item"><span class="stat-label">متوسط در ساعت: </span><span class="stat-value">${formatCurrency(averagePerHour)}</span></div>
            </div>
          </div>`;
      });
      htmlContent += `</div>`;
    }

    if (showContract && contractStats.length > 0) {
      htmlContent += `<div class="section"><div class="section-title">گزارش کارهای کنترات به تفکیک کارفرما</div>`;
      contractStats.forEach(({ employer, totalAmount, contractsCount, completedCount, inProgressCount, contracts }) => {
        htmlContent += `
          <div class="stat-card">
            <div class="stat-card-title">
              <span class="color-dot" style="background-color: ${employer.color}"></span>
              ${employer.name}
            </div>
            <div class="stat-grid">
              <div class="stat-item"><span class="stat-label">تعداد کنترات‌ها: </span><span class="stat-value">${toFarsiNumber(contractsCount)}</span></div>
              <div class="stat-item"><span class="stat-label">تکمیل شده: </span><span class="stat-value success">${toFarsiNumber(completedCount)}</span></div>
              <div class="stat-item"><span class="stat-label">در حال انجام: </span><span class="stat-value">${toFarsiNumber(inProgressCount)}</span></div>
              <div class="stat-item"><span class="stat-label">کل مبلغ: </span><span class="stat-value success">${formatCurrency(totalAmount)}</span></div>
            </div>
            <div style="margin-top: 12px; border-top: 1px solid #ddd; padding-top: 12px;">
              <div style="font-weight: bold; margin-bottom: 8px;">لیست کنترات‌ها:</div>`;
        contracts.forEach((contract) => {
          htmlContent += `
            <div style="display: flex; justify-content: space-between; padding: 6px; background: #f5f5f5; border-radius: 4px; margin-bottom: 4px; font-size: 13px;">
              <span>${contract.title}</span>
              <div>
                <span style="font-weight: bold;">${formatCurrency(contract.totalAmount)}</span>
                <span class="badge ${contract.status === 'completed' ? 'badge-completed' : 'badge-progress'}">${contract.status === 'completed' ? 'تکمیل شده' : 'در حال انجام'}</span>
              </div>
            </div>`;
        });
        htmlContent += `</div></div>`;
      });
      htmlContent += `</div>`;
    }

    if (showDailyWage && sortedMonths.length > 0) {
      htmlContent += `<div class="section"><div class="section-title">گزارش ماهانه کارهای روزمزد</div>`;
      sortedMonths.forEach(([monthYear, stats]) => {
        htmlContent += `
          <div class="stat-card">
            <div class="stat-card-title">${formatMonth(monthYear)}</div>
            <div class="stat-grid">
              <div class="stat-item"><span class="stat-label">تعداد روزها: </span><span class="stat-value">${toFarsiNumber(stats.days)}</span></div>
              <div class="stat-item"><span class="stat-label">مجموع ساعات: </span><span class="stat-value">${toFarsiNumber(stats.hours)}</span></div>
              <div class="stat-item" style="grid-column: span 2;"><span class="stat-label">درآمد ماه: </span><span class="stat-value success">${formatCurrency(stats.amount)}</span></div>
            </div>
          </div>`;
      });
      htmlContent += `</div>`;
    }

    // Payment stats content
    htmlContent += `<div class="section" style="page-break-before: always;"><div class="section-title">گزارش دریافتی‌ها و مانده طلب</div>`;
    
    if (paymentStats.length === 0) {
      htmlContent += `<div class="stat-card"><p style="text-align: center; color: #666;">هیچ داده‌ای برای نمایش وجود ندارد.</p></div>`;
    } else {
      paymentStats.forEach(({ employer, totalEarned, totalDailyWageEarned, totalContractEarned, totalPaid, remainingBalance, payments: empPayments }) => {
        htmlContent += `
          <div class="stat-card">
            <div class="stat-card-title">
              <span class="color-dot" style="background-color: ${employer.color}"></span>
              ${employer.name}
            </div>
            <div class="stat-grid">
              <div class="stat-item"><span class="stat-label">کل درآمد: </span><span class="stat-value success">${formatCurrency(totalEarned)}</span></div>
              <div class="stat-item"><span class="stat-label">کل دریافتی: </span><span class="stat-value">${formatCurrency(totalPaid)}</span></div>
              <div class="stat-item"><span class="stat-label">درآمد روزمزد: </span><span class="stat-value">${formatCurrency(totalDailyWageEarned)}</span></div>
              <div class="stat-item"><span class="stat-label">درآمد کنترات: </span><span class="stat-value">${formatCurrency(totalContractEarned)}</span></div>
              <div class="stat-item" style="grid-column: span 2; border-top: 1px solid #ddd; padding-top: 8px; margin-top: 8px;">
                <span class="stat-value ${remainingBalance > 0 ? 'success' : 'danger'}">
                ${remainingBalance > 0 ? 'مانده طلب' : remainingBalance < 0 ? 'مانده بدهی' : ''}:
                </span>       
                <span class="stat-value ${remainingBalance > 0 ? 'success' : 'danger'}">
                ${formatCurrency(Math.abs(remainingBalance))}
                </span>
              </div> 
              </div>`;
        
        if (empPayments.length > 0) {
          htmlContent += `<div style="margin-top: 12px; border-top: 1px solid #ddd; padding-top: 12px;">
            <div style="font-weight: bold; margin-bottom: 8px;">لیست دریافتی‌ها:</div>`;
          empPayments.forEach((payment) => {
            htmlContent += `
              <div style="display: flex; justify-content: space-between; padding: 6px; background: #f5f5f5; border-radius: 4px; margin-bottom: 4px; font-size: 13px;">
                <div>
                  <span>${new Date(payment.date).toLocaleDateString("fa-IR")}</span>
                  ${payment.description ? `<span style="color: #666; margin-right: 8px;">(${payment.description})</span>` : ''}
                </div>
                <div>
                  <span style="font-weight: bold;">${formatCurrency(payment.amount)}</span>
                  <span class="badge" style="background: #e0e7ff; color: #3730a3; margin-right: 8px;">${getPaymentMethodLabel(payment.paymentMethod)}</span>
                </div>
              </div>`;
          });
          htmlContent += `</div>`;
        }
        htmlContent += `</div>`;
      });
    }
    htmlContent += `</div>`;

    const fullHtml = `
      <!DOCTYPE html>
      <html dir="rtl" lang="fa">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
          @font-face {
            font-family: 'Vazirmatn';
            src: url('${regularFont}') format('woff2');
            font-weight: 400;
          }
          @font-face {
            font-family: 'Vazirmatn';
            src: url('${boldFont}') format('woff2');
            font-weight: 700;
          }
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { 
            font-family: 'Vazirmatn', Tahoma, Arial, sans-serif; 
            padding: 20px; 
            direction: rtl;
            line-height: 1.8;
            font-size: 14px;
            background: white;
          }
          .report-title { 
            text-align: center; 
            font-size: 22px; 
            font-weight: bold; 
            margin-bottom: 20px;
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
          }
          .section { 
            margin-bottom: 25px; 
          }
          .section-title { 
            font-size: 16px; 
            font-weight: bold; 
            margin-bottom: 12px;
            background: #f0f0f0;
            padding: 8px 12px;
            border-radius: 4px;
          }
          .stat-card { 
            border: 1px solid #ddd; 
            padding: 15px; 
            margin-bottom: 12px; 
            border-radius: 8px;
            background: #fafafa;
          }
          .stat-card-title { 
            font-weight: bold; 
            font-size: 15px;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .color-dot {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            display: inline-block;
          }
          .stat-grid { 
            display: grid; 
            grid-template-columns: repeat(2, 1fr); 
            gap: 8px;
          }
          .stat-item { 
            font-size: 13px;
          }
          .stat-label { 
            color: #666; 
          }
          .stat-value { 
            font-weight: bold; 
          }
          .stat-value.success { 
            color: #16a34a; 
          }
          .stat-value.danger { 
            color: #dc2626; 
          }
          .print-date { 
            text-align: left; 
            font-size: 12px; 
            color: #666;
            margin-bottom: 15px;
          }
          .badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 11px;
            margin-right: 6px;
          }
          .badge-completed {
            background: #dcfce7;
            color: #166534;
          }
          .badge-progress {
            background: #fef3c7;
            color: #92400e;
          }
          @media print {
            body { padding: 10px; }
          }
        </style>
      </head>
      <body>
        <div class="print-date">تاریخ چاپ: ${new Date().toLocaleDateString("fa-IR")}</div>
        <div class="report-title">${title}</div>
        ${htmlContent}
      </body>
      </html>
    `;

    // Create a hidden iframe for printing (works better on mobile)
    const existingFrame = document.getElementById('print-frame');
    if (existingFrame) {
      existingFrame.remove();
    }

    const iframe = document.createElement('iframe');
    iframe.id = 'print-frame';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentWindow?.document;
    if (!iframeDoc) return;

    iframeDoc.open();
    iframeDoc.write(fullHtml);
    iframeDoc.close();

    // Wait for fonts to load before printing
    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    }, 1000);
  };


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">گزارش‌ها</h2>
        <Button onClick={handlePrint} variant="outline" size="sm">
          <Printer className="ml-2 h-4 w-4" />
          چاپ PDF
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} dir="rtl">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="works">کارها</TabsTrigger>
          <TabsTrigger value="payments">دریافتی و مانده طلب</TabsTrigger>
        </TabsList>

        <TabsContent value="works" className="space-y-4 mt-4">
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
                          <User 
                            className="w-4 h-4" 
                            style={{ color: emp.color }} 
                          />
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

          <div ref={reportRef}>
            {showDailyWage && (
              <Card className="mb-6">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                    <FileText className="h-4 w-4" />
                    گزارش کارهای روزمزد به تفکیک کارفرما
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {employerStats.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      هنوز اطلاعاتی وجود ندارد
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {employerStats.map(({ employer, totalAmount, totalHours, averagePerHour, daysCount }) => (
                        <div key={employer.id} className="p-4 bg-secondary rounded-lg space-y-2">
                          <div className="flex items-center gap-2 font-bold">
                            <User
                              className="w-5 h-5"
                              style={{ color: employer.color }}
                            />
                            {employer.name}
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">تعداد روزهای کاری: </span>
                              <span className="font-medium">{toFarsiNumber(daysCount)}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">مجموع ساعات: </span>
                              <span className="font-medium">{toFarsiNumber(totalHours)}</span>
                            </div>
                            <div className="col-span-2">
                              <span className="text-sm font-medium text-muted-foreground">کل کارکرد: </span>
                              <span className="font-bold text-success">{formatCurrency(totalAmount)}</span>
                            </div>
                            <div className="col-span-2">
                              <span className="text-xs text-muted-foreground">متوسط در ساعت: </span>
                              <span className="text-xs text-muted-foreground">{formatCurrency(averagePerHour)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {showContract && (
              <Card className="mb-6">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                    <FileText className="h-4 w-4" />
                    گزارش کارهای کنترات به تفکیک کارفرما
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {contractStats.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      هنوز کار کنتراتی ثبت نشده است
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {contractStats.map(({ employer, totalAmount, contractsCount, completedCount, inProgressCount, contracts }) => (
                        <div key={employer.id} className="p-4 bg-secondary rounded-lg space-y-3">
                          <div className="flex items-center gap-2 font-bold">
                            <User
                              className="w-5 h-5"
                              style={{ color: employer.color }}
                            />
                            {employer.name}
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">تعداد کنترات‌ها: </span>
                              <span className="font-medium">{toFarsiNumber(contractsCount)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-success" />
                              <span className="text-muted-foreground">تکمیل شده: </span>
                              <span className="font-medium">{toFarsiNumber(completedCount)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-warning" />
                              <span className="text-muted-foreground">در حال انجام: </span>
                              <span className="font-medium">{toFarsiNumber(inProgressCount)}</span>
                            </div>
                            <div className="col-span-2">
                              <span className="text-muted-foreground">کل مبلغ کنترات‌ها: </span>
                              <span className="font-bold text-success">{formatCurrency(totalAmount)}</span>
                            </div>
                          </div>
                          <div className="border-t border-border pt-3 space-y-2">
                            <div className="text-sm font-medium text-muted-foreground">لیست کنترات‌ها:</div>
                            {contracts.map((contract) => (
                              <div key={contract.id} className="flex justify-between items-center text-sm bg-background/50 p-2 rounded">
                                <span>{contract.title}</span>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{formatCurrency(contract.totalAmount)}</span>
                                  {contract.status === "completed" ? (
                                    <span className="text-xs bg-success/20 text-success px-2 py-0.5 rounded-full">تکمیل شده</span>
                                  ) : (
                                    <span className="text-xs bg-warning/20 text-warning px-2 py-0.5 rounded-full">در حال انجام</span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {showDailyWage && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">گزارش ماهانه کارهای روزمزد</CardTitle>
                </CardHeader>
                <CardContent>
                  {sortedMonths.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      هنوز اطلاعاتی وجود ندارد
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {sortedMonths.map(([monthYear, stats]) => (
                        <div key={monthYear} className="p-4 bg-secondary rounded-lg space-y-2">
                          <div className="font-bold">{formatMonth(monthYear)}</div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">تعداد روزها: </span>
                              <span className="font-medium">{toFarsiNumber(stats.days)}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">مجموع ساعات: </span>
                              <span className="font-medium">{toFarsiNumber(stats.hours)}</span>
                            </div>
                            <div className="col-span-2">
                              <span className="text-muted-foreground">درآمد ماه: </span>
                              <span className="font-bold text-success">
                                {formatCurrency(stats.amount)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4 mt-4">
          {employers.length > 1 && (
            <div className="flex gap-3">
              <div className="w-full">
                <Select value={selectedEmployerId} onValueChange={setSelectedEmployerId}>
                  <SelectTrigger dir="rtl" className="text-right">
                    <SelectValue placeholder="همه کارفرماها" />
                  </SelectTrigger>
                  <SelectContent dir="rtl" className="text-right z-50">
                    <SelectItem value="all" className="text-right">همه کارفرماها</SelectItem>
                    {employers.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id} className="text-right">
                        <div className="flex items-center gap-2 flex-row-reverse">
                          <User 
                            className="w-4 h-4" 
                            style={{ color: emp.color }} 
                          />
                          {emp.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div ref={paymentsReportRef}>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                  <Wallet className="h-4 w-4" />
                  گزارش دریافتی‌ها و مانده طلب
                </CardTitle>
              </CardHeader>
              <CardContent>
                {paymentStats.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    هنوز اطلاعاتی وجود ندارد
                  </p>
                ) : (
                  <div className="space-y-4">
                    {paymentStats.map(({ employer, totalEarned, totalDailyWageEarned, totalContractEarned, totalPaid, remainingBalance, paymentsCount, payments: empPayments }) => (
                      <div key={employer.id} className="p-4 bg-secondary rounded-lg space-y-3">
                        <div className="flex items-center gap-2 font-bold">
                          <User
                            className="w-5 h-5"
                            style={{ color: employer.color }}
                          />
                          {employer.name}
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-4 w-4 text-success" />
                            <span className="text-muted-foreground">کل کارکرد: </span>
                            <span className="font-medium text-success">{formatCurrency(totalEarned)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <TrendingDown className="h-4 w-4 text-primary" />
                            <span className="text-muted-foreground">کل دریافتی: </span>
                            <span className="font-medium text-primary">{formatCurrency(totalPaid)}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">درآمد روزمزد: </span>
                            <span className="font-medium">{formatCurrency(totalDailyWageEarned)}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">درآمد کنترات: </span>
                            <span className="font-medium">{formatCurrency(totalContractEarned)}</span>
                          </div>
                          <div className="col-span-2 pt-2 border-t border-border">
                            
                            <span className={`font-bold ${remainingBalance > 0 ? 'text-success' : 'text-destructive'}`}>
                            {remainingBalance > 0 ? 'مانده طلب' : remainingBalance < 0 ? 'مانده بدهی' : ''}:
                            </span>                            
                            <span className={`font-bold ${remainingBalance > 0 ? 'text-success' : 'text-destructive'}`}> {formatCurrency(Math.abs(remainingBalance))}
                            </span>
                          </div>                        </div>
                        {empPayments.length > 0 && (
                          <div className="border-t border-border pt-3 space-y-2">
                            <div className="text-sm font-medium text-muted-foreground">
                              لیست دریافتی‌ها ({toFarsiNumber(paymentsCount)}):
                            </div>
                            {empPayments.map((payment) => (
                              <div key={payment.id} className="flex justify-between items-center text-sm bg-background/50 p-2 rounded">
                                <div className="flex flex-col">
                                  <span>{new Date(payment.date).toLocaleDateString("fa-IR")}</span>
                                  {payment.description && (
                                    <span className="text-xs text-muted-foreground">{payment.description}</span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{formatCurrency(payment.amount)}</span>
                                  <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                                    {getPaymentMethodLabel(payment.paymentMethod)}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
