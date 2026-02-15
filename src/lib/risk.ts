import { IncomeEntry, ExpenseEntry, RiskLevel, PredictionEntry } from "./types";

export function calculateRisk(
  month: string,
  incomes: IncomeEntry[],
  expenses: ExpenseEntry[],
  allExpenses: ExpenseEntry[]
): Omit<PredictionEntry, "id" | "createdAt"> {
  const monthIncomes = incomes.filter((i) => i.month === month);
  const monthExpenses = expenses.filter((e) => e.month === month);

  const totalIncome = monthIncomes.reduce((sum, i) => sum + i.amount, 0);
  const totalSpending = monthExpenses.reduce((sum, e) => sum + e.amount, 0);

  const savingsRatio = totalIncome > 0 ? (totalIncome - totalSpending) / totalIncome : 0;

  const essentialSpending = monthExpenses
    .filter((e) => e.type === "essential")
    .reduce((sum, e) => sum + e.amount, 0);
  const nonEssentialSpending = monthExpenses
    .filter((e) => e.type === "non-essential")
    .reduce((sum, e) => sum + e.amount, 0);

  const essentialRatio = totalSpending > 0 ? essentialSpending / totalSpending : 0;
  const nonEssentialRatio = totalSpending > 0 ? nonEssentialSpending / totalSpending : 0;

  // Calculate expense growth rate (compared to previous month)
  const [year, mon] = month.split("-").map(Number);
  const prevMonth = `${mon === 1 ? year - 1 : year}-${String(mon === 1 ? 12 : mon - 1).padStart(2, "0")}`;
  const prevMonthExpenses = allExpenses.filter((e) => e.month === prevMonth);
  const prevTotal = prevMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const expenseGrowthRate = prevTotal > 0 ? (totalSpending - prevTotal) / prevTotal : 0;

  let riskLevel: RiskLevel;
  if (savingsRatio > 0.3) riskLevel = "Low";
  else if (savingsRatio >= 0.1) riskLevel = "Medium";
  else riskLevel = "High";

  return {
    month,
    totalIncome,
    totalSpending,
    savingsRatio,
    essentialRatio,
    nonEssentialRatio,
    expenseGrowthRate,
    riskLevel,
  };
}

export function getRiskColor(level: RiskLevel) {
  switch (level) {
    case "Low": return "text-emerald-600 bg-emerald-50 border-emerald-200";
    case "Medium": return "text-amber-600 bg-amber-50 border-amber-200";
    case "High": return "text-red-600 bg-red-50 border-red-200";
  }
}

export function getRiskChartColor(level: RiskLevel) {
  switch (level) {
    case "Low": return "#059669";
    case "Medium": return "#d97706";
    case "High": return "#dc2626";
  }
}

export function getSuggestions(
  riskLevel: RiskLevel,
  savingsRatio: number,
  expenses: ExpenseEntry[],
  month: string
): string[] {
  const monthExpenses = expenses.filter((e) => e.month === month);

  if (riskLevel === "High") {
    const suggestions = [
      `Your savings ratio is only ${(savingsRatio * 100).toFixed(1)}%. Aim for at least 10% to reduce risk.`,
      "Reduce non-essential spending immediately.",
    ];
    // Top 3 high-spend categories
    const catSpend: Record<string, number> = {};
    monthExpenses.forEach((e) => {
      catSpend[e.category] = (catSpend[e.category] || 0) + e.amount;
    });
    const topCats = Object.entries(catSpend)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
    if (topCats.length > 0) {
      suggestions.push(
        `Top spending categories: ${topCats.map(([c, a]) => `${c} (${a.toLocaleString()})`).join(", ")}. Consider cutting these.`
      );
    }
    return suggestions;
  }

  if (riskLevel === "Medium") {
    return [
      `Your savings ratio is ${(savingsRatio * 100).toFixed(1)}%. Try to improve it to 25%+.`,
      "Review non-essential expenses for areas to cut back.",
      "Set a monthly budget and track your progress weekly.",
    ];
  }

  return [
    `Great job! Your savings ratio is ${(savingsRatio * 100).toFixed(1)}%.`,
    "Consider investing your surplus in diversified funds.",
    "Build an emergency fund covering 6 months of expenses.",
    "Look into tax-advantaged investment accounts.",
  ];
}
