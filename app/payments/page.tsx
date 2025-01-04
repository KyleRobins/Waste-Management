"use client";

import { PaymentStats } from "@/components/payments/stats";
import { PaymentHistory } from "@/components/payments/history";
import { PaymentChart } from "@/components/payments/chart";

export default function PaymentsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
        <p className="text-muted-foreground">
          Monitor payment collections and disbursements
        </p>
      </div>
      <PaymentStats />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PaymentChart />
        <PaymentHistory />
      </div>
    </div>
  );
}