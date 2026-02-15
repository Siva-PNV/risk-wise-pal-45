import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getIncomes, getExpenses, getPredictions } from "@/lib/storage";
import { getRiskColor } from "@/lib/risk";
import { Wallet, CreditCard, PiggyBank, ShieldAlert, Plus } from "lucide-react";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  LineChart, Line, ResponsiveContainer, Legend,
} from "recharts";

const CHART_COLORS = ["#059669", "#d97706", "#0ea5e9", "#8b5cf6", "#ec4899", "#f97316", "#14b8a6", "#6366f1"];

export default function Dashboard() {
  const incomes = getIncomes();
  const expenses = getExpenses();
  const predictions = getPredictions();

  const currentMonth = new Date().toISOString().slice(0, 7);

  const stats = useMemo(() => {
    const monthInc = incomes.filter((i) => i.month === currentMonth);
    const monthExp = expenses.filter((e) => e.month === currentMonth);
    const totalIncome = monthInc.reduce((s, i) => s + i.amount, 0);
    const totalSpending = monthExp.reduce((s, e) => s + e.amount, 0);
    const savingsRatio = totalIncome > 0 ? (totalIncome - totalSpending) / totalIncome : 0;
    const latestPrediction = predictions.filter((p) => p.month === currentMonth).slice(-1)[0];
    return { totalIncome, totalSpending, savingsRatio, latestPrediction };
  }, [incomes, expenses, predictions, currentMonth]);

  // Pie data: essential vs non-essential
  const pieData = useMemo(() => {
    const monthExp = expenses.filter((e) => e.month === currentMonth);
    const essential = monthExp.filter((e) => e.type === "essential").reduce((s, e) => s + e.amount, 0);
    const nonEssential = monthExp.filter((e) => e.type === "non-essential").reduce((s, e) => s + e.amount, 0);
    if (essential === 0 && nonEssential === 0) return [];
    return [
      { name: "Essential", value: essential },
      { name: "Non-Essential", value: nonEssential },
    ];
  }, [expenses, currentMonth]);

  // Bar data: category-wise
  const barData = useMemo(() => {
    const monthExp = expenses.filter((e) => e.month === currentMonth);
    const catMap: Record<string, number> = {};
    monthExp.forEach((e) => {
      catMap[e.category] = (catMap[e.category] || 0) + e.amount;
    });
    return Object.entries(catMap).map(([name, amount]) => ({ name, amount })).sort((a, b) => b.amount - a.amount);
  }, [expenses, currentMonth]);

  // Line data: monthly expense trend (last 6 months)
  const lineData = useMemo(() => {
    const months: string[] = [];
    const d = new Date();
    for (let i = 5; i >= 0; i--) {
      const md = new Date(d.getFullYear(), d.getMonth() - i, 1);
      months.push(`${md.getFullYear()}-${String(md.getMonth() + 1).padStart(2, "0")}`);
    }
    return months.map((m) => ({
      month: m,
      spending: expenses.filter((e) => e.month === m).reduce((s, e) => s + e.amount, 0),
      income: incomes.filter((i) => i.month === m).reduce((s, i) => s + i.amount, 0),
    }));
  }, [expenses, incomes]);

  // Risk history
  const riskHistory = useMemo(() => {
    const sorted = [...predictions].sort((a, b) => a.month.localeCompare(b.month));
    const unique = new Map<string, PredictionEntry>();
    sorted.forEach((p) => unique.set(p.month, p));
    return Array.from(unique.values()).map((p) => ({
      month: p.month,
      risk: p.riskLevel === "Low" ? 1 : p.riskLevel === "Medium" ? 2 : 3,
      label: p.riskLevel,
    }));
  }, [predictions]);

  const riskLevel = stats.latestPrediction?.riskLevel;
  const hasData = incomes.length > 0 || expenses.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Financial overview for {currentMonth}</p>
        </div>
        <div className="flex gap-2">
          <Button asChild size="sm">
            <Link to="/income"><Plus className="h-4 w-4 mr-1" />Add Income</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/expenses"><Plus className="h-4 w-4 mr-1" />Add Expense</Link>
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Income</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalIncome.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Spending</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalSpending.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Savings Ratio</CardTitle>
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(stats.savingsRatio * 100).toFixed(1)}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Risk Level</CardTitle>
            <ShieldAlert className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {riskLevel ? (
              <Badge className={getRiskColor(riskLevel)}>{riskLevel} Risk</Badge>
            ) : (
              <p className="text-sm text-muted-foreground">No prediction yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {!hasData && (
        <Card className="border-dashed">
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground mb-4">No data yet. Start by adding your income and expenses.</p>
            <div className="flex justify-center gap-2">
              <Button asChild><Link to="/income">Add Income</Link></Button>
              <Button asChild variant="outline"><Link to="/expenses">Add Expenses</Link></Button>
            </div>
          </CardContent>
        </Card>
      )}

      {hasData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <Card>
            <CardHeader><CardTitle className="text-base">Essential vs Non-Essential</CardTitle></CardHeader>
            <CardContent>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      <Cell fill="#059669" />
                      <Cell fill="#d97706" />
                    </Pie>
                    <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-10">No expense data for this month</p>
              )}
            </CardContent>
          </Card>

          {/* Bar Chart */}
          <Card>
            <CardHeader><CardTitle className="text-base">Category Spending</CardTitle></CardHeader>
            <CardContent>
              {barData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" height={60} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
                    <Bar dataKey="amount" fill="hsl(160, 84%, 28%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-10">No expense data for this month</p>
              )}
            </CardContent>
          </Card>

          {/* Line Chart */}
          <Card>
            <CardHeader><CardTitle className="text-base">Monthly Trend</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
                  <Legend />
                  <Line type="monotone" dataKey="income" stroke="#059669" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="spending" stroke="#dc2626" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Risk History */}
          <Card>
            <CardHeader><CardTitle className="text-base">Risk History</CardTitle></CardHeader>
            <CardContent>
              {riskHistory.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={riskHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 3]} ticks={[1, 2, 3]} tickFormatter={(v) => v === 1 ? "Low" : v === 2 ? "Medium" : "High"} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v: number) => v === 1 ? "Low" : v === 2 ? "Medium" : "High"} />
                    <Bar dataKey="risk" radius={[4, 4, 0, 0]}>
                      {riskHistory.map((entry, i) => (
                        <Cell key={i} fill={entry.risk === 1 ? "#059669" : entry.risk === 2 ? "#d97706" : "#dc2626"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-10">Run a prediction to see risk history</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// Need this import for the type used in riskHistory
import type { PredictionEntry } from "@/lib/types";
