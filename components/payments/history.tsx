"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const transactions = [
  {
    id: 1,
    type: "collected",
    amount: "$2,400",
    from: "Eco Manufacturing Ltd",
    date: "2024-03-15",
  },
  {
    id: 2,
    type: "disbursed",
    amount: "$1,800",
    from: "Green Waste Solutions",
    date: "2024-03-14",
  },
  {
    id: 3,
    type: "pending",
    amount: "$3,200",
    from: "Sustainable Packaging Co",
    date: "2024-03-13",
  },
];

export function PaymentHistory() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="space-y-1">
                <p className="text-sm font-medium">{transaction.from}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(transaction.date).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{transaction.amount}</span>
                <Badge
                  variant={
                    transaction.type === "collected"
                      ? "default"
                      : transaction.type === "pending"
                      ? "secondary"
                      : "outline"
                  }
                >
                  {transaction.type}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}