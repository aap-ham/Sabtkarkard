import { Employer, WorkDay, Payment, ContractWork } from "@/types";

const EMPLOYERS_KEY = "work_tracker_employers";
const WORKDAYS_KEY = "work_tracker_workdays";
const PAYMENTS_KEY = "work_tracker_payments";
const CONTRACT_WORKS_KEY = "work_tracker_contract_works";
const DEFAULT_WAGE_KEY = "work_tracker_default_wage";
const ONBOARDING_KEY = "work_tracker_onboarding_completed";

export const storage = {
  // Employers
  getEmployers: (): Employer[] => {
    const data = localStorage.getItem(EMPLOYERS_KEY);
    if (!data) return [];
    return JSON.parse(data).map((e: any) => ({
      ...e,
      createdAt: new Date(e.createdAt),
    }));
  },

  saveEmployers: (employers: Employer[]) => {
    localStorage.setItem(EMPLOYERS_KEY, JSON.stringify(employers));
  },

  // Work Days
  getWorkDays: (): WorkDay[] => {
    const data = localStorage.getItem(WORKDAYS_KEY);
    if (!data) return [];
    return JSON.parse(data).map((w: any) => ({
      ...w,
      createdAt: new Date(w.createdAt),
    }));
  },

  saveWorkDays: (workDays: WorkDay[]) => {
    localStorage.setItem(WORKDAYS_KEY, JSON.stringify(workDays));
  },

  // Payments
  getPayments: (): Payment[] => {
    const data = localStorage.getItem(PAYMENTS_KEY);
    if (!data) return [];
    return JSON.parse(data).map((p: any) => ({
      ...p,
      createdAt: new Date(p.createdAt),
    }));
  },

  savePayments: (payments: Payment[]) => {
    localStorage.setItem(PAYMENTS_KEY, JSON.stringify(payments));
  },

  // Contract Works
  getContractWorks: (): ContractWork[] => {
    const data = localStorage.getItem(CONTRACT_WORKS_KEY);
    if (!data) return [];
    return JSON.parse(data).map((c: any) => ({
      ...c,
      createdAt: new Date(c.createdAt),
    }));
  },

  saveContractWorks: (contractWorks: ContractWork[]) => {
    localStorage.setItem(CONTRACT_WORKS_KEY, JSON.stringify(contractWorks));
  },

  // Default Wage
  getDefaultWage: (): number | null => {
    const data = localStorage.getItem(DEFAULT_WAGE_KEY);
    return data ? parseFloat(data) : null;
  },

  saveDefaultWage: (wage: number) => {
    localStorage.setItem(DEFAULT_WAGE_KEY, wage.toString());
  },

  // Onboarding
  isOnboardingCompleted: (): boolean => {
    return localStorage.getItem(ONBOARDING_KEY) === "true";
  },

  setOnboardingCompleted: () => {
    localStorage.setItem(ONBOARDING_KEY, "true");
  },
};
