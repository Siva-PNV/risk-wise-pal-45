import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getIncomes, saveIncome, deleteIncome } from "@/lib/storage";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function Income() {
  const [incomes, setIncomes] = useState(getIncomes());
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [amount, setAmount] = useState("");

  const handleAdd = () => {
    const amt = parseFloat(amount);
    if (!month || isNaN(amt) || amt <= 0) {
      toast.error("Please enter a valid month and amount.");
      return;
    }
    const entry = { id: crypto.randomUUID(), month, amount: amt };
    saveIncome(entry);
    setIncomes(getIncomes());
    setAmount("");
    toast.success("Income added!");
  };

  const handleDelete = (id: string) => {
    deleteIncome(id);
    setIncomes(getIncomes());
    toast.success("Income deleted.");
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Add Income</h1>

      <Card>
        <CardHeader><CardTitle className="text-base">New Income Entry</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="month">Month</Label>
              <Input id="month" type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
            </div>
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="amount">Amount ($)</Label>
              <Input id="amount" type="number" placeholder="5000" value={amount} onChange={(e) => setAmount(e.target.value)} min="0" step="0.01" />
            </div>
            <div className="flex items-end">
              <Button onClick={handleAdd}>Add Income</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Income History</CardTitle></CardHeader>
        <CardContent>
          {incomes.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No income entries yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead className="w-16"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...incomes].reverse().map((inc) => (
                  <TableRow key={inc.id}>
                    <TableCell>{inc.month}</TableCell>
                    <TableCell>${inc.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(inc.id)}>
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
