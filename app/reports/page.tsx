"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Download, FileDown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, subDays, parseISO } from "date-fns";

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export default function ReportsPage() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reportType, setReportType] = useState("waste");
  const [loading, setLoading] = useState(false);
  const [wasteCollectionData, setWasteCollectionData] = useState([]);
  const [wasteDistributionData, setWasteDistributionData] = useState([]);
  const [supplierPerformanceData, setSupplierPerformanceData] = useState([]);
  const [environmentalData, setEnvironmentalData] = useState([]);
  const [financialData, setFinancialData] = useState([]);
  const { toast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    fetchChartData();
  }, []);

  const fetchChartData = async () => {
    try {
      // Set default date range to last 30 days
      const endDate = new Date();
      const startDate = subDays(endDate, 30);

      // Fetch waste collection trends
      const { data: wasteData } = await supabase
        .from('waste_records')
        .select('date, quantity, type')
        .gte('date', startDate.toISOString())
        .order('date', { ascending: true });

      if (wasteData) {
        // Process waste collection trends
        const collectionTrends = wasteData.map(record => ({
          date: format(parseISO(record.date), 'MMM d'),
          quantity: parseFloat(record.quantity)
        }));
        setWasteCollectionData(collectionTrends);

        // Process waste distribution
        const distribution = wasteData.reduce((acc, record) => {
          acc[record.type] = (acc[record.type] || 0) + parseFloat(record.quantity);
          return acc;
        }, {});
        
        const distributionData = Object.entries(distribution).map(([name, value]) => ({
          name,
          value
        }));
        setWasteDistributionData(distributionData);
      }

      // Fetch supplier performance
      const { data: supplierData } = await supabase
        .from('waste_records')
        .select(`
          supplier:suppliers(name),
          quantity
        `)
        .gte('date', startDate.toISOString());

      if (supplierData) {
        const supplierEfficiency = supplierData.reduce((acc, record) => {
          const supplierName = record.supplier?.name || 'Unknown';
          acc[supplierName] = (acc[supplierName] || 0) + parseFloat(record.quantity);
          return acc;
        }, {});

        const performanceData = Object.entries(supplierEfficiency).map(([name, efficiency]) => ({
          name,
          efficiency
        }));
        setSupplierPerformanceData(performanceData);
      }

      // Calculate environmental impact (simplified example)
      const environmentalImpact = wasteData?.map(record => ({
        date: format(parseISO(record.date), 'MMM d'),
        reduction: parseFloat(record.quantity) * 0.5 // Assuming 0.5 CO2 reduction per kg
      })) || [];
      setEnvironmentalData(environmentalImpact);

      // Fetch financial data
      const { data: productsData } = await supabase
        .from('products')
        .select('price, created_at')
        .gte('created_at', startDate.toISOString());

      if (productsData) {
        const financialByMonth = productsData.reduce((acc, product) => {
          const month = format(parseISO(product.created_at), 'MMM');
          acc[month] = acc[month] || { revenue: 0, expenses: 0 };
          acc[month].revenue += parseFloat(product.price);
          acc[month].expenses += parseFloat(product.price) * 0.4; // Assuming 40% expenses
          return acc;
        }, {});

        const financialTrends = Object.entries(financialByMonth).map(([month, data]) => ({
          month,
          ...data
        }));
        setFinancialData(financialTrends);
      }

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch chart data",
        variant: "destructive",
      });
    }
  };

  const generateReport = async () => {
    if (!startDate || !endDate) {
      toast({
        title: "Error",
        description: "Please select both start and end dates",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Fetch data based on report type and date range
      const { data, error } = await supabase
        .from(reportType === "waste" ? "waste_records" : "products")
        .select("*")
        .gte("created_at", new Date(startDate).toISOString())
        .lte("created_at", new Date(endDate).toISOString());

      if (error) throw error;

      // Process and download report
      const csvData = data.map(item => ({
        ...item,
        created_at: new Date(item.created_at).toLocaleDateString()
      }));

      const blob = new Blob([JSON.stringify(csvData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${reportType}-report-${new Date().toISOString()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Success",
        description: "Report generated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate report",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">
          Generate and analyze waste management reports
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Waste Collection Trends</CardTitle>
            <CardDescription>Daily collection amounts</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={wasteCollectionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="quantity" stroke="#10B981" name="Quantity (kg)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Waste Distribution</CardTitle>
            <CardDescription>By type</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={wasteDistributionData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {wasteDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Supplier Performance</CardTitle>
            <CardDescription>Collection efficiency</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={supplierPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="efficiency" fill="#3B82F6" name="Collection Amount (kg)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generate Reports</CardTitle>
          <CardDescription>
            Export detailed reports for analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Select
                value={reportType}
                onValueChange={setReportType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="waste">Waste Collection Report</SelectItem>
                  <SelectItem value="products">Recycled Products Report</SelectItem>
                  <SelectItem value="suppliers">Supplier Performance Report</SelectItem>
                  <SelectItem value="customers">Customer Activity Report</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex-1">
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full"
              />
            </div>
            <Button 
              onClick={generateReport}
              disabled={loading}
              className="w-full md:w-auto"
            >
              {loading ? (
                "Generating..."
              ) : (
                <>
                  <FileDown className="mr-2 h-4 w-4" />
                  Generate Report
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Environmental Impact</CardTitle>
            <CardDescription>Carbon footprint reduction</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={environmentalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="reduction" 
                  stroke="#10B981" 
                  name="CO2 Reduction (kg)" 
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Financial Overview</CardTitle>
            <CardDescription>Revenue from recycled products</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={financialData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="#10B981" name="Revenue" />
                <Bar dataKey="expenses" fill="#EF4444" name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}