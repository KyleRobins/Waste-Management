import { DataTable } from "@/components/shared/data-table";
import { columns } from "@/components/waste-records/columns";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const data = [
  {
    id: "1",
    date: "2024-03-10",
    type: "Paper",
    quantity: "250kg",
    supplier: "Supplier A",
    location: "North Region",
    status: "completed",
  },
  {
    id: "2",
    date: "2024-03-09",
    type: "Plastic",
    quantity: "180kg",
    supplier: "Supplier B",
    location: "South Region",
    status: "pending",
  },
  {
    id: "3",
    date: "2024-03-08",
    type: "Metal",
    quantity: "300kg",
    supplier: "Supplier C",
    location: "East Region",
    status: "requires_approval",
  },
];

export default function WasteRecordsPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Waste Records</h1>
          <p className="text-muted-foreground">
            Manage and track waste collection records
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Record
        </Button>
      </div>
      <DataTable columns={columns} data={data} />
    </div>
  );
}