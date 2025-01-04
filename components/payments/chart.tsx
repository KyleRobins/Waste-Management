"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "Jan", collected: 38000, disbursed: 24000 },
  { name: "Feb", collected: 42000, disbursed: 28000 },
  { name: "Mar", collected: 45250, disbursed: 32450 },
];

export function PaymentChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="collected" 
                stroke="#10b981" 
                name="Collected"
              />
              <Line 
                type="monotone" 
                dataKey="disbursed" 
                stroke="#3b82f6" 
                name="Disbursed"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}