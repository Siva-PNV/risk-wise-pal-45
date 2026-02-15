import { IncomeEntry, ExpenseEntry, PredictionEntry } from "./types";

const INCOME_KEY = "money_risk_income";
const EXPENSES_KEY = "money_risk_expenses";
const PREDICTIONS_KEY = "money_risk_predictions";

function getItems<T>(key: string): T[] {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function setItems<T>(key: string, items: T[]) {
  localStorage.setItem(key, JSON.stringify(items));
}

// Income
export const getIncomes = () => getItems<IncomeEntry>(INCOME_KEY);
export const saveIncome = (entry: IncomeEntry) => {
  const items = getIncomes();
  items.push(entry);
  setItems(INCOME_KEY, items);
};
export const updateIncome = (id: string, updates: Partial<IncomeEntry>) => {
  const items = getIncomes().map((i) => (i.id === id ? { ...i, ...updates } : i));
  setItems(INCOME_KEY, items);
};
export const deleteIncome = (id: string) => {
  setItems(INCOME_KEY, getIncomes().filter((i) => i.id !== id));
};

// Expenses
export const getExpenses = () => getItems<ExpenseEntry>(EXPENSES_KEY);
export const saveExpense = (entry: ExpenseEntry) => {
  const items = getExpenses();
  items.push(entry);
  setItems(EXPENSES_KEY, items);
};
export const updateExpense = (id: string, updates: Partial<ExpenseEntry>) => {
  const items = getExpenses().map((i) => (i.id === id ? { ...i, ...updates } : i));
  setItems(EXPENSES_KEY, items);
};
export const deleteExpense = (id: string) => {
  setItems(EXPENSES_KEY, getExpenses().filter((i) => i.id !== id));
};

// Predictions
export const getPredictions = () => getItems<PredictionEntry>(PREDICTIONS_KEY);
export const savePrediction = (entry: PredictionEntry) => {
  const items = getPredictions();
  items.push(entry);
  setItems(PREDICTIONS_KEY, items);
};
export const deletePrediction = (id: string) => {
  setItems(PREDICTIONS_KEY, getPredictions().filter((i) => i.id !== id));
};
