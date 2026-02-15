export interface IncomeEntry {
  id: string;
  month: string; // YYYY-MM format
  amount: number;
}

export interface ExpenseEntry {
  id: string;
  month: string; // YYYY-MM format
  category: string;
  amount: number;
  type: "essential" | "non-essential";
}

export interface PredictionEntry {
  id: string;
  month: string;
  totalIncome: number;
  totalSpending: number;
  savingsRatio: number;
  essentialRatio: number;
  nonEssentialRatio: number;
  expenseGrowthRate: number;
  riskLevel: "Low" | "Medium" | "High";
  createdAt: string;
}

export type RiskLevel = "Low" | "Medium" | "High";

export const EXPENSE_CATEGORIES = [
  "Housing",
  "Food & Groceries",
  "Transportation",
  "Utilities",
  "Healthcare",
  "Insurance",
  "Entertainment",
  "Shopping",
  "Education",
  "Subscriptions",
  "Dining Out",
  "Travel",
  "Personal Care",
  "Other",
] as const;
