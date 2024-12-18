import { DataTable } from "@/components/shared/data-table";
import { columns } from "@/components/customers/columns";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const data = [
  {
    id: "1",
    name: "Eco Manufacturing Ltd",
    contactPerson: "Emma Wilson",
    email: "emma@ecomanufacturing.com",
    phone: "+1 (555) 987-6543",
    purchasedProducts: ["Recycled Paper", "Plastic Pellets"],
    totalPurchases: "$15,750",
    status: "active",
    lastPurchase: "2024-03-01",
  },
  {
    id: "2",
    name: "Green Build Construction",
    contactPerson: "David Chen",
    email: "david@greenbuild.com",
    phone: "+1 (555) 876-5432",
    purchasedProducts: ["Recycled Metal", "Construction Materials"],
    totalPurchases: "$28,900",
    status: "active",
    lastPurchase: "2024-02-28",
  },
  {
    id: "3",
    name: "Sustainable Packaging Co",
    contactPerson: "Lisa Rodriguez",
    email: "lisa@sustainpack.com",
    phone: "+1 (555) 765-4321",
    purchasedProducts: ["Recycled Plastic", "Paper Products"],
    totalPurchases: "$21,300",
    status: "inactive",
    lastPurchase: "2024-01-15",
  },
];

export default function CustomersPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground">
            Manage your customer relationships and orders
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Customer
        </Button>
      </div>
      <DataTable columns={columns} data={data} />
    </div>
  );
}