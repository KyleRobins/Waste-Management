"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { MoreHorizontal, Pencil, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
    cell: ({ row }) => format(new Date(row.getValue("lastPurchase")), "MMM d, yyyy"),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const customer = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];