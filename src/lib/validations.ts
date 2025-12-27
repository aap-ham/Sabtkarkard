import { z } from "zod";

// Persian error messages
const required = "این فیلد الزامی است";
const minLength = (n: number) => `حداقل ${n} کاراکتر وارد کنید`;
const maxLength = (n: number) => `حداکثر ${n} کاراکتر مجاز است`;
const positiveNumber = "مقدار باید بزرگتر از صفر باشد";

// Payment form schema
export const paymentSchema = z.object({
  employerId: z.string().min(1, { message: required }),
  amount: z.string().min(1, { message: required }).refine(
    (val) => parseFloat(val) > 0,
    { message: positiveNumber }
  ),
  paymentMethod: z.string().min(1, { message: required }),
  date: z.string().min(1, { message: required }),
  description: z.string().max(500, { message: maxLength(500) }).optional(),
});

// Contract work schema
export const contractWorkSchema = z.object({
  employerId: z.string().min(1, { message: required }),
  title: z.string().min(1, { message: required }).max(100, { message: maxLength(100) }),
  totalAmount: z.string().min(1, { message: required }).refine(
    (val) => parseFloat(val) > 0,
    { message: positiveNumber }
  ),
  startDate: z.string().min(1, { message: required }),
  endDate: z.string().optional(),
  description: z.string().max(500, { message: maxLength(500) }).optional(),
});

// Daily work schema
export const dailyWorkSchema = z.object({
  employerId: z.string().min(1, { message: required }),
  date: z.string().min(1, { message: required }),
  hours: z.string().min(1, { message: required }).refine(
    (val) => parseFloat(val) > 0 && parseFloat(val) <= 24,
    { message: "ساعت کاری باید بین ۱ تا ۸ باشد" }
  ),
  amount: z.string().min(1, { message: required }).refine(
    (val) => parseFloat(val) > 0,
    { message: positiveNumber }
  ),
  overtime: z.string().optional().refine(
    (val) => !val || (parseFloat(val) >= 0 && parseFloat(val) <= 24),
    { message: "اضافه‌کاری باید بین ۰ تا ۸ ساعت باشد" }
  ),
  description: z.string().max(500, { message: maxLength(500) }).optional(),
});

// Employer schema
export const employerSchema = z.object({
  name: z.string().min(1, { message: required }).min(2, { message: minLength(2) }).max(50, { message: maxLength(50) }),
  wage: z.string().min(1, { message: required }).refine(
    (val) => parseFloat(val) > 0,
    { message: positiveNumber }
  ),
  color: z.string().min(1, { message: required }),
});

export type PaymentFormData = z.infer<typeof paymentSchema>;
export type ContractWorkFormData = z.infer<typeof contractWorkSchema>;
export type DailyWorkFormData = z.infer<typeof dailyWorkSchema>;
export type EmployerFormData = z.infer<typeof employerSchema>;
