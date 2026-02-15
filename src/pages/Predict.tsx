import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getIncomes, getExpenses, getPredictions, savePrediction } from "@/lib/storage";
import { calculateRisk, getRiskColor, getSuggestions } from "@/lib/risk";
import { ShieldAlert, TrendingUp, PiggyBank, AlertTriangle, Lightbulb } from "lucide-react";
import { toast } from "sonner";

export default function Predict() {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [result, setResult] = useState<ReturnType<typeof calculateRisk> | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [predictions, setPredictions] = useState(getPredictions());

  const handlePredict = () => {
    const incomes = getIncomes();
    const expenses = getExpenses();

    const monthIncomes = incomes.filter((i) => i.month === month);
    const monthExpenses = expenses.filter((e) => e.month === month);

    if (monthIncomes.length === 0 && monthExpenses.length === 0) {
      toast.error("No data found for this month. Add income/expenses first.");
      return;
    }

    const calc = calculateRisk(month, incomes, monthExpenses, expenses);
    setResult(calc);
    setSuggestions(getSuggestions(calc.riskLevel, calc.savingsRatio, expenses, month));

    const entry = { ...calc, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    savePrediction(entry);
    setPredictions(getPredictions());
    toast.success("Prediction complete!");
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Risk Prediction</h1>

      <Card>
        <CardHeader><CardTitle className="text-base">Analyze a Month</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 space-y-1.5">
              <Label>Select Month</Label>
              <Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
            </div>
            <div className="flex items-end">
              <Button onClick={handlePredict}>
                <ShieldAlert className="h-4 w-4 mr-1" />
                Run Prediction
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Prediction Result</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">Risk Level:</span>
                <Badge className={`text-sm px-3 py-1 ${getRiskColor(result.riskLevel)}`}>
                  {result.riskLevel} Risk
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <PiggyBank className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Savings Ratio</p>
                    <p className="font-semibold">{(result.savingsRatio * 100).toFixed(1)}%</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Expense Growth</p>
                    <p className="font-semibold">{(result.expenseGrowthRate * 100).toFixed(1)}%</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Income</p>
                  <p className="font-semibold">${result.totalIncome.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Spending</p>
                  <p className="font-semibold">${result.totalSpending.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Essential Ratio</p>
                  <p className="font-semibold">{(result.essentialRatio * 100).toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Non-Essential Ratio</p>
                  <p className="font-semibold">{(result.nonEssentialRatio * 100).toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Lightbulb className="h-4 w-4" /> Personalized Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {suggestions.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <AlertTriangle className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader><CardTitle className="text-base">Prediction History</CardTitle></CardHeader>
        <CardContent>
          {predictions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No predictions yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead>Risk</TableHead>
                  <TableHead>Savings Ratio</TableHead>
                  <TableHead>Income</TableHead>
                  <TableHead>Spending</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...predictions].reverse().map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{p.month}</TableCell>
                    <TableCell><Badge className={getRiskColor(p.riskLevel)}>{p.riskLevel}</Badge></TableCell>
                    <TableCell>{(p.savingsRatio * 100).toFixed(1)}%</TableCell>
                    <TableCell>${p.totalIncome.toLocaleString()}</TableCell>
                    <TableCell>${p.totalSpending.toLocaleString()}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{new Date(p.createdAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
