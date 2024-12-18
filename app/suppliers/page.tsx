import { DataTable } from "@/components/shared/data-table";
import { columns } from "@/components/suppliers/columns";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const data = [
  {
    id: "1",
    name: "Green Waste Solutions",
    contactPerson: "John Smith",
    email: "john@greenwaste.com",
    phone: "+1 (555) 123-4567",
    wasteTypes: ["Paper", "Plastic"],
    location: "North Region",
    status: "active",
    joinDate: "2023-08-15",
  },
  {
    id: "2",
    name: "EcoRecycle Inc",
    contactPerson: "Sarah Johnson",
    email: "sarah@ecorecycle.com",
    phone: "+1 (555) 234-5678",
    wasteTypes: ["Metal", "Electronics"],
    location: "South Region",
    status: "active",
    joinDate: "2023-09-20",
  },
  {
    id: "3",
    name: "Urban Waste Management",
    contactPerson: "Michael Brown",
    email: "michael@urbanwaste.com",
    phone: "+1 (555) 345-6789",
    wasteTypes: ["Organic", "Glass"],
    location: "East Region",
    status: "inactive",
    joinDate: "2023-10-05",
  },
];

export default function SuppliersPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Suppliers</h1>
          <p className="text-muted-foreground">
            Manage your waste suppliers and their information
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Supplier
        </Button>
      </div>
      <DataTable columns={columns} data={data} />
    </div>
  );
}