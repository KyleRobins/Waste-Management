"use client";

import { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/services/auth.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CustomerPortal() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCustomerData = async () => {
      try {
        const user = await getCurrentUser();
        // Load customer-specific data here
        setLoading(false);
      } catch (error) {
        console.error('Error loading customer data:', error);
      }
    };

    loadCustomerData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Customer Portal</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>My Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p>View your order history</p>
            {/* Add orders list UI */}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Schedule Pickup</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Schedule waste collection</p>
            {/* Add scheduling UI */}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <p>View your waste management reports</p>
            {/* Add reports UI */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 