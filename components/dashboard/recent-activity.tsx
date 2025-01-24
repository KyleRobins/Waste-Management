"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";

interface Activity {
  id: string;
  type: 'waste_record' | 'supplier' | 'customer' | 'product';
  action: string;
  details: string;
  created_at: string;
  user?: {
    name: string;
    avatar?: string;
    initials: string;
  };
}

export function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchRecentActivities = async () => {
      try {
        // Fetch recent waste records
        const { data: wasteRecords } = await supabase
          .from('waste_records')
          .select(`
            id,
            type,
            quantity,
            created_at,
            supplier:suppliers(name)
          `)
          .order('created_at', { ascending: false })
          .limit(3);

        // Fetch recent suppliers
        const { data: suppliers } = await supabase
          .from('suppliers')
          .select('id, name, created_at')
          .order('created_at', { ascending: false })
          .limit(3);

        // Fetch recent customers
        const { data: customers } = await supabase
          .from('customers')
          .select('id, name, created_at')
          .order('created_at', { ascending: false })
          .limit(3);

        // Fetch recent products
        const { data: products } = await supabase
          .from('products')
          .select('id, name, created_at')
          .order('created_at', { ascending: false })
          .limit(3);

        // Combine and sort all activities
        const allActivities: Activity[] = [
          ...(wasteRecords?.map(record => ({
            id: record.id,
            type: 'waste_record' as const,
            action: 'collected',
            details: `${record.quantity}kg of ${record.type} waste from ${record.supplier?.name}`,
            created_at: record.created_at,
            user: {
              name: 'System',
              initials: 'SY'
            }
          })) || []),
          ...(suppliers?.map(supplier => ({
            id: supplier.id,
            type: 'supplier' as const,
            action: 'registered',
            details: `new supplier: ${supplier.name}`,
            created_at: supplier.created_at,
            user: {
              name: 'System',
              initials: 'SY'
            }
          })) || []),
          ...(customers?.map(customer => ({
            id: customer.id,
            type: 'customer' as const,
            action: 'registered',
            details: `new customer: ${customer.name}`,
            created_at: customer.created_at,
            user: {
              name: 'System',
              initials: 'SY'
            }
          })) || []),
          ...(products?.map(product => ({
            id: product.id,
            type: 'product' as const,
            action: 'added',
            details: `new product: ${product.name}`,
            created_at: product.created_at,
            user: {
              name: 'System',
              initials: 'SY'
            }
          })) || [])
        ].sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ).slice(0, 3);

        setActivities(allActivities);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching recent activities:', error);
        setLoading(false);
      }
    };

    fetchRecentActivities();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center">
                <div className="w-9 h-9 bg-muted rounded-full" />
                <div className="ml-4 space-y-1 flex-1">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-center">
              <Avatar className="h-9 w-9">
                <AvatarImage src={activity.user?.avatar} alt={activity.user?.name} />
                <AvatarFallback>{activity.user?.initials}</AvatarFallback>
              </Avatar>
              <div className="ml-4 space-y-1">
                <p className="text-sm font-medium leading-none">
                  {activity.user?.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {activity.action} {activity.details}
                </p>
              </div>
              <div className="ml-auto font-medium text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}