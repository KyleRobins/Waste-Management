"use client";

import { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/services/auth.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SupplierPortal() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSupplierData = async () => {
      try {
        const user = await getCurrentUser();
        // Load supplier-specific data here
        setLoading(false);
      } catch (error) {
        console.error('Error loading supplier data:', error);
      }
    };

    loadSupplierData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Supplier Portal</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Products</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Manage your products</p>
            {/* Add product management UI */}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p>View and manage orders</p>
            {/* Add orders management UI */}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <p>View your performance metrics</p>
            {/* Add analytics UI */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 