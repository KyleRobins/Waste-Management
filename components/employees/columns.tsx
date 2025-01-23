"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { MoreHorizontal, Pencil, Trash, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { resetPassword } from "@/lib/services/auth.service";
import { useToast } from "@/hooks/use-toast";

export type Employee = {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  status: "active" | "inactive";
  last_login: string;
};

export const columns: ColumnDef<Employee>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "phone",
    header: "Phone",
  },
  {
    accessorKey: "department",
    header: "Department",
  },
  {
    accessorKey: "position",
    header: "Position",
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
    accessorKey: "last_login",
    header: "Last Login",
    cell: ({ row }) => {
      const date = row.getValue("last_login") as string;
      return date ? format(new Date(date), "MMM d, yyyy HH:mm") : "Never";
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const employee = row.original;
      const { toast } = useToast();

      const handleResetPassword = async () => {
        try {
          await resetPassword(employee.email);
          toast({
            title: "Success",
            description: "Password reset email has been sent.",
          });
        } catch (error: any) {
          toast({
            title: "Error",
            description: error.message || "Failed to reset password",
            variant: "destructive",
          });
        }
      };

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
            <DropdownMenuItem onClick={handleResetPassword}>
              <Key className="mr-2 h-4 w-4" />
              Reset Password
            </DropdownMenuItem>
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