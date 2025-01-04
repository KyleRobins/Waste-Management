"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "Mon", sent: 24, delivered: 22, failed: 2 },
  { name: "Tue", sent: 18, delivered: 17, failed: 1 },
  { name: "Wed", sent: 32, delivered: 30, failed: 2 },
  { name: "Thu", sent: 15, delivered: 14, failed: 1 },
  { name: "Fri", sent: 28, delivered: 28, failed: 0 },
  { name: "Sat", sent: 12, delivered: 11, failed: 1 },
  { name: "Sun", sent: 8, delivered: 8, failed: 0 },
];

export function MessageChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Message Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="sent" fill="#64748b" name="Sent" />
              <Bar dataKey="delivered" fill="#10b981" name="Delivered" />
              <Bar dataKey="failed" fill="#ef4444" name="Failed" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}