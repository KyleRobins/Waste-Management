"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { MoreHorizontal, Pencil, Trash, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";

export type Customer = {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  purchasedProducts: string[];
  totalPurchases: string;
  status: "active" | "inactive";
  lastPurchase: string;
};

export const columns: ColumnDef<Customer>[] = [
  {
    accessorKey: "name",
    header: "Company Name",
  },
  {
    accessorKey: "contactPerson",
    header: "Contact Person",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  //phone numbers
  {
    accessorKey: "purchasedProducts",
    header: "Purchased Products",
    cell: ({ row }) => {
      const products = row.getValue("purchasedProducts") as string[];
      return (
        <div className="flex gap-1">
          {products.map((product) => (
            <Badge key={product} variant="outline">
              {product}
            </Badge>
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: "totalPurchases",
    header: "Total Purchases",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge variant={status === "active" ? "default" : "secondary"}>
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "lastPurchase",
    header: "Last Purchase",
    cell: ({ row }) =>
      format(new Date(row.getValue("lastPurchase")), "MMM d, yyyy"),
  },
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
      />
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          // Handle individual message
          toast({
            title: "Message Sent",
            description: `Message sent to ${row.original.name}`,
          });
        }}
      >
        <Mail className="h-4 w-4" />
      </Button>
    ),
  },
];
