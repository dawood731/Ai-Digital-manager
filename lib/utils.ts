import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPKR(amount: number): string {
  return `Rs. ${Number(amount || 0).toLocaleString("en-PK")}`;
}

export function formatDate(date: string | Date | undefined): string {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-PK", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
