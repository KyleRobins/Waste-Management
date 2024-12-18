import { DataTable } from "@/components/shared/data-table";
import { columns } from "@/components/products/columns";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const data = [
  {
    id: "1",
    name: "Recycled Paper Sheets",
    category: "Paper Products",
    price: "$120/ton",
    stock: "45 tons",
    sourceType: "Mixed Paper Waste",
    processDate: "2024-03-01",
    status: "in_stock",
  },
  {
    id: "2",
    name: "Plastic Pellets",
    category: "Plastic Products",
    price: "$800/ton",
    stock: "28 tons",
    sourceType: "PET Bottles",
    processDate: "2024-02-28",
    status: "low_stock",
  },
  {
    id: "3",
    name: "Metal Scrap",
    category: "Metal Products",
    price: "$250/ton",
    stock: "0 tons",
    sourceType: "Industrial Metal Waste",
    processDate: "2024-02-15",
    status: "out_of_stock",
  },
];

export default function ProductsPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">
            Manage your recycled products inventory
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>
      <DataTable columns={columns} data={data} />
    </div>
  );
}