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
  ResponsiveContainer,
} from "recharts";
import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";
import { startOfWeek, addDays, format, parseISO } from "date-fns";
import { useTheme } from "next-themes";

interface DailyTotal {
  date: string;
  amount: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  const { theme } = useTheme();
  if (active && payload && payload.length) {
    return (
      <div className={`
        rounded-lg shadow-lg p-4 
        ${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}
      `}>
        <p className="font-medium">{label}</p>
        <p className="text-primary">
          {`${payload[0].value.toFixed(2)} kg`}
        </p>
      </div>
    );
  }
  return null;
};

export function WasteCollection() {
  const [weeklyData, setWeeklyData] = useState<DailyTotal[]>([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const supabase = createClient();

  useEffect(() => {
    const fetchWeeklyData = async () => {
      try {
        // Get start of current week
        const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 }); // Start from Monday
        
        // Get waste records for the current week
        const { data: records, error } = await supabase
          .from('waste_records')
          .select('date, quantity')
          .gte('date', weekStart.toISOString())
          .lte('date', new Date().toISOString())
          .order('date', { ascending: true });

        if (error) throw error;

        // Initialize data for all days of the week with zero values
        const weekData: DailyTotal[] = Array.from({ length: 7 }, (_, i) => ({
          date: format(addDays(weekStart, i), 'EEE'),
          amount: 0
        }));

        // Process the actual records
        records?.forEach(record => {
          const recordDate = parseISO(record.date);
          const dayIndex = Math.floor((recordDate.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24));
          if (dayIndex >= 0 && dayIndex < 7) {
            weekData[dayIndex].amount += parseFloat(record.quantity || '0');
          }
        });

        setWeeklyData(weekData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching weekly data:', error);
        setLoading(false);
      }
    };

    fetchWeeklyData();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Weekly Waste Collection</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-muted-foreground">Loading data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Waste Collection</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData}>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke={theme === 'dark' ? '#374151' : '#e5e7eb'}
              />
              <XAxis
                dataKey="date"
                stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value.toFixed(0)} kg`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="amount"
                fill="currentColor"
                radius={[4, 4, 0, 0]}
                className="fill-primary"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}