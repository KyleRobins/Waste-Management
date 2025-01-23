"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { updatePayment } from "@/lib/services/payments.service";
import { useToast } from "@/hooks/use-toast";

interface Payment {
  id: string;
  amount: number;
  type: string;
  status: string;
  customer: {
    name: string;
  };
  supplier: {
    name: string;
  };
  created_at: string;
}

interface PaymentHistoryProps {
  payments: Payment[];
  onUpdate: () => void;
}

export function PaymentHistory({ payments, onUpdate }: PaymentHistoryProps) {
  const { toast } = useToast();

  const handleStatusUpdate = async (payment: Payment, newStatus: string) => {
    try {
      await updatePayment(payment.id, { status: newStatus });
      onUpdate();
      toast({
        title: "Success",
        description: "Payment status updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update payment status",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {payments.map((payment) => (
            <div
              key={payment.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  {payment.type === "collected" 
                    ? payment.customer.name 
                    : payment.supplier.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(payment.created_at), "MMM d, yyyy")}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  ${payment.amount.toFixed(2)}
                </span>
                <Badge
                  variant={
                    payment.status === "completed"
                      ? "default"
                      : payment.status === "pending"
                      ? "secondary"
                      : "outline"
                  }
                  className="cursor-pointer"
                  onClick={() => 
                    handleStatusUpdate(
                      payment, 
                      payment.status === "pending" ? "completed" : "pending"
                    )
                  }
                >
                  {payment.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}