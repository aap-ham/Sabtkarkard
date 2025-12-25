import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function toFarsiNumber(num: number | string): string {
  const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(num).replace(/\d/g, (digit) => farsiDigits[parseInt(digit)]);
}

export function toEnglishNumber(str: string): string {
  const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  const englishDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  
  return str.replace(/[۰-۹]/g, (digit) => {
    const index = farsiDigits.indexOf(digit);
    return englishDigits[index];
  });
}

export function formatNumberWithSeparator(num: number | string): string {
  const numStr = String(num).replace(/,/g, '');
  const parts = numStr.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return toFarsiNumber(parts.join('.'));
}
