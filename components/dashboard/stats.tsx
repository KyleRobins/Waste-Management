"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Scale, Users, Truck, Recycle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";
import { format } from "date-fns";

export function DashboardStats() {
  const [totalWaste, setTotalWaste] = useState(0);
  const [activeSuppliers, setActiveSuppliers] = useState(0);
  const [todayCollections, setTodayCollections] = useState(0);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get total waste collected
        const { data: wasteRecords } = await supabase
          .from('waste_records')
          .select('quantity');
        
        const total = wasteRecords?.reduce((sum, record) => {
          return sum + parseFloat(record.quantity || '0');
        }, 0) || 0;

        // Get active suppliers count
        const { count: suppliersCount } = await supabase
          .from('suppliers')
          .select('*', { count: 'exact' })
          .eq('status', 'active');

        // Get today's collections
        const today = new Date().toISOString().split('T')[0];
        const { count: todayCount } = await supabase
          .from('waste_records')
          .select('*', { count: 'exact' })
          .gte('created_at', today);

        setTotalWaste(total);
        setActiveSuppliers(suppliersCount || 0);
        setTodayCollections(todayCount || 0);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching stats:', error);
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">...</div>
              <p className="text-xs text-muted-foreground">Loading...</p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Waste Collected</CardTitle>
          <Scale className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalWaste.toFixed(2)} kg</div>
          <p className="text-xs text-muted-foreground">
            Total waste recorded in the system
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Suppliers</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeSuppliers}</div>
          <p className="text-xs text-muted-foreground">
            Total active suppliers
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Collections Today</CardTitle>
          <Truck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{todayCollections}</div>
          <p className="text-xs text-muted-foreground">
            Waste collections recorded today
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Recycling Rate</CardTitle>
          <Recycle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">78.3%</div>
          <p className="text-xs text-muted-foreground">
            Average recycling efficiency
          </p>
        </CardContent>
      </Card>
    </div>
  );
}