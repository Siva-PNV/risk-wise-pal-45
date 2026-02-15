import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { getIncomes, getExpenses, getPredictions } from "@/lib/storage";
import { getRiskColor } from "@/lib/risk";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  LineChart, Line, ResponsiveContainer, Legend, Cell,
} from "recharts";

export default function Analytics() {
  const incomes = getIncomes();
  const expenses = getExpenses();
  const predictions = getPredictions();

  const allMonths = useMemo(() => {
    const set = new Set<string>();
    incomes.forEach((i) => set.add(i.month));
    expenses.forEach((e) => set.add(e.month));
    return Array.from(set).sort();
  }, [incomes, expenses]);

  const [monthA, setMonthA] = useState(allMonths[allMonths.length - 2] || "");
  const [monthB, setMonthB] = useState(allMonths[allMonths.length - 1] || "");

  const getMonthStats = (m: string) => {
    const inc = incomes.filter((i) => i.month === m).reduce((s, i) => s + i.amount, 0);
    const exp = expenses.filter((e) => e.month === m).reduce((s, e) => s + e.amount, 0);
    const essential = expenses.filter((e) => e.month === m && e.type === "essential").reduce((s, e) => s + e.amount, 0);
    const nonEssential = expenses.filter((e) => e.month === m && e.type === "non-essential").reduce((s, e) => s + e.amount, 0);
    const savings = inc - exp;
    const savingsRatio = inc > 0 ? savings / inc : 0;
    const pred = predictions.filter((p) => p.month === m).slice(-1)[0];
    return { income: inc, spending: exp, essential, nonEssential, savings, savingsRatio, risk: pred?.riskLevel || "N/A" };
  };

  const statsA = monthA ? getMonthStats(monthA) : null;
  const statsB = monthB ? getMonthStats(monthB) : null;

  // Trend data
  const trendData = useMemo(() => {
    return allMonths.map((m) => {
      const inc = incomes.filter((i) => i.month === m).reduce((s, i) => s + i.amount, 0);
      const exp = expenses.filter((e) => e.month === m).reduce((s, e) => s + e.amount, 0);
      const savingsRatio = inc > 0 ? ((inc - exp) / inc) * 100 : 0;
      return { month: m, income: inc, spending: exp, savingsRatio: parseFloat(savingsRatio.toFixed(1)) };
    });
  }, [allMonths, incomes, expenses]);

  // Category breakdown over time
  const categoryTrend = useMemo(() => {
    const cats = new Set<string>();
    expenses.forEach((e) => cats.add(e.category));
    return allMonths.map((m) => {
      const row: Record<string, number | string> = { month: m };
      cats.forEach((c) => {
        row[c] = expenses.filter((e) => e.month === m && e.category === c).reduce((s, e) => s + e.amount, 0);
      });
      return row;
    });
  }, [allMonths, expenses]);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    expenses.forEach((e) => cats.add(e.category));
    return Array.from(cats);
  }, [expenses]);

  const COLORS = ["#059669", "#d97706", "#0ea5e9", "#8b5cf6", "#ec4899", "#f97316", "#14b8a6", "#6366f1", "#a3a3a3", "#84cc16"];

  if (allMonths.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Analytics & Comparison</h1>
        <Card className="border-dashed">
          <CardContent className="py-10 text-center text-muted-foreground">
            Add income and expenses to see analytics.
          </CardContent>
        </Card>
      </div>
    );
  }

  const renderStat = (label: string, a: string | number, b: string | number) => (
    <div className="flex items-center justify-between py-2 border-b last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex gap-6">
        <span className="text-sm font-medium w-28 text-right">{typeof a === "number" ? `$${a.toLocaleString()}` : a}</span>
        <span className="text-sm font-medium w-28 text-right">{typeof b === "number" ? `$${b.toLocaleString()}` : b}</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Analytics & Comparison</h1>

      {/* Month Comparison */}
      <Card>
        <CardHeader><CardTitle className="text-base">Month Comparison</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1 space-y-1.5">
              <Label className="text-xs">Month A</Label>
              <Select value={monthA} onValueChange={setMonthA}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{allMonths.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="flex-1 space-y-1.5">
              <Label className="text-xs">Month B</Label>
              <Select value={monthB} onValueChange={setMonthB}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{allMonths.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          {statsA && statsB && (
            <div>
              <div className="flex items-center justify-between pb-2 mb-2 border-b">
                <span></span>
                <div className="flex gap-6">
                  <span className="text-xs font-semibold w-28 text-right">{monthA}</span>
                  <span className="text-xs font-semibold w-28 text-right">{monthB}</span>
                </div>
              </div>
              {renderStat("Income", statsA.income, statsB.income)}
              {renderStat("Spending", statsA.spending, statsB.spending)}
              {renderStat("Essential", statsA.essential, statsB.essential)}
              {renderStat("Non-Essential", statsA.nonEssential, statsB.nonEssential)}
              {renderStat("Savings", statsA.savings, statsB.savings)}
              {renderStat("Savings Ratio", `${(statsA.savingsRatio * 100).toFixed(1)}%`, `${(statsB.savingsRatio * 100).toFixed(1)}%`)}
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">Risk Level</span>
                <div className="flex gap-6">
                  <span className="w-28 text-right">
                    {statsA.risk !== "N/A" ? <Badge className={getRiskColor(statsA.risk as any)}>{statsA.risk}</Badge> : "N/A"}
                  </span>
                  <span className="w-28 text-right">
                    {statsB.risk !== "N/A" ? <Badge className={getRiskColor(statsB.risk as any)}>{statsB.risk}</Badge> : "N/A"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending Trends */}
        <Card>
          <CardHeader><CardTitle className="text-base">Spending Trends</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
                <Legend />
                <Line type="monotone" dataKey="income" stroke="#059669" strokeWidth={2} />
                <Line type="monotone" dataKey="spending" stroke="#dc2626" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Savings Ratio Over Time */}
        <Card>
          <CardHeader><CardTitle className="text-base">Savings Ratio Trend (%)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => `${v}%`} />
                <Bar dataKey="savingsRatio" radius={[4, 4, 0, 0]}>
                  {trendData.map((entry, i) => (
                    <Cell key={i} fill={entry.savingsRatio > 30 ? "#059669" : entry.savingsRatio >= 10 ? "#d97706" : "#dc2626"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Breakdown Over Time */}
        {categories.length > 0 && (
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle className="text-base">Category Breakdown Over Time</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
                  <Legend />
                  {categories.map((cat, i) => (
                    <Bar key={cat} dataKey={cat} stackId="a" fill={COLORS[i % COLORS.length]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
