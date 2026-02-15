import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getExpenses, saveExpense, deleteExpense } from "@/lib/storage";
import { EXPENSE_CATEGORIES } from "@/lib/types";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function Expenses() {
  const [expenses, setExpenses] = useState(getExpenses());
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"essential" | "non-essential">("essential");
  const [filterMonth, setFilterMonth] = useState("");

  const handleAdd = () => {
    const amt = parseFloat(amount);
    if (!month || !category || isNaN(amt) || amt <= 0) {
      toast.error("Please fill in all fields.");
      return;
    }
    saveExpense({ id: crypto.randomUUID(), month, category, amount: amt, type });
    setExpenses(getExpenses());
    setAmount("");
    toast.success("Expense added!");
  };

  const handleDelete = (id: string) => {
    deleteExpense(id);
    setExpenses(getExpenses());
    toast.success("Expense deleted.");
  };

  const filtered = filterMonth ? expenses.filter((e) => e.month === filterMonth) : expenses;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Add Expenses</h1>

      <Card>
        <CardHeader><CardTitle className="text-base">New Expense Entry</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-1.5">
              <Label>Month</Label>
              <Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {EXPENSE_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Amount ($)</Label>
              <Input type="number" placeholder="100" value={amount} onChange={(e) => setAmount(e.target.value)} min="0" step="0.01" />
            </div>
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as "essential" | "non-essential")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="essential">Essential</SelectItem>
                  <SelectItem value="non-essential">Non-Essential</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={handleAdd} className="w-full">Add</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Expense History</CardTitle>
            <div className="flex items-center gap-2">
              <Label className="text-xs">Filter:</Label>
              <Input type="month" value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} className="w-40 h-8 text-xs" />
              {filterMonth && <Button variant="ghost" size="sm" onClick={() => setFilterMonth("")}>Clear</Button>}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No expenses found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="w-16"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...filtered].reverse().map((exp) => (
                  <TableRow key={exp.id}>
                    <TableCell>{exp.month}</TableCell>
                    <TableCell>{exp.category}</TableCell>
                    <TableCell>${exp.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={exp.type === "essential" ? "default" : "secondary"} className="text-xs">
                        {exp.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(exp.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
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
