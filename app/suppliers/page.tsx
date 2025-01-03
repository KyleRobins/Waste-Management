"use client";

import { DataTable } from "@/components/shared/data-table";
import { columns } from "@/components/suppliers/columns";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  MultiSelect,
  MultiSelectContent,
  MultiSelectItem,
  MultiSelectTrigger,
  MultiSelectValue,
} from "@/components/ui/multi-select";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  contactPerson: z
    .string()
    .min(2, "Contact person must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number"),
  location: z.string().min(2, "Location is required"),
  status: z.enum(["active", "inactive"]),
  wasteTypes: z.array(z.string()).min(1, "Select at least one waste type"),
});

type SupplierFormValues = z.infer<typeof formSchema>;

const defaultValues: Partial<SupplierFormValues> = {
  status: "active",
  wasteTypes: [],
};

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
  const [suppliers, setSuppliers] = useState(data);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const form = useForm<SupplierFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  function onSubmit(formData: SupplierFormValues) {
    console.log("Form submitted with data:", formData); // Debug log

    // Create new supplier with generated ID and join date
    const newSupplier = {
      id: (suppliers.length + 1).toString(),
      ...formData,
      joinDate: new Date().toISOString().split("T")[0],
    };

    console.log("New supplier object:", newSupplier); // Debug log

    // Update suppliers list
    setSuppliers((prev) => {
      console.log("Previous suppliers:", prev); // Debug log
      return [...prev, newSupplier];
    });

    // Show success toast
    toast({
      title: "Success",
      description: "Supplier has been successfully added.",
    });

    // Reset form and close dialog
    form.reset(defaultValues);
    setOpen(false);
  }

  // Add console log to check suppliers state changes
  console.log("Current suppliers:", suppliers); // Debug log

  return (
    <div className="flex flex-col gap-4 p-4 md:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Suppliers
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Manage your waste suppliers and their information
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Add Supplier
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] w-[95%] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle className="text-xl sm:text-2xl">
                Add Supplier
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={(e) => {
                  console.log("Form submission started");
                  form.handleSubmit(onSubmit)(e);
                }}
                className="space-y-6 mt-4"
              >
                <div className="grid gap-4 sm:gap-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm sm:text-base">
                            Company Name
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter company name"
                              {...field}
                              className="h-9 sm:h-10"
                            />
                          </FormControl>
                          <FormMessage className="text-xs sm:text-sm" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="contactPerson"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm sm:text-base">
                            Contact Person
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter contact person name"
                              {...field}
                              className="h-9 sm:h-10"
                            />
                          </FormControl>
                          <FormMessage className="text-xs sm:text-sm" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm sm:text-base">
                            Email
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter email address"
                              {...field}
                              className="h-9 sm:h-10"
                            />
                          </FormControl>
                          <FormMessage className="text-xs sm:text-sm" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm sm:text-base">
                            Phone Number
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="+1 (555) 123-4567"
                              {...field}
                              className="h-9 sm:h-10"
                            />
                          </FormControl>
                          <FormMessage className="text-xs sm:text-sm" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm sm:text-base">
                          Location
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter location"
                            {...field}
                            className="h-9 sm:h-10"
                          />
                        </FormControl>
                        <FormMessage className="text-xs sm:text-sm" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm sm:text-base">
                          Status
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-xs sm:text-sm" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="wasteTypes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm sm:text-base">
                          Waste Types
                        </FormLabel>
                        <MultiSelect
                          value={field.value}
                          onValueChange={field.onChange}
                          placeholder="Select waste types"
                        >
                          <MultiSelectItem value="Paper">Paper</MultiSelectItem>
                          <MultiSelectItem value="Plastic">
                            Plastic
                          </MultiSelectItem>
                          <MultiSelectItem value="Metal">Metal</MultiSelectItem>
                          <MultiSelectItem value="Glass">Glass</MultiSelectItem>
                          <MultiSelectItem value="Organic">
                            Organic
                          </MultiSelectItem>
                          <MultiSelectItem value="Electronics">
                            Electronics
                          </MultiSelectItem>
                          <MultiSelectItem value="Hazardous">
                            Hazardous
                          </MultiSelectItem>
                          <MultiSelectItem value="Construction">
                            Construction
                          </MultiSelectItem>
                          <MultiSelectItem value="Textile">
                            Textile
                          </MultiSelectItem>
                          <MultiSelectItem value="Wood">Wood</MultiSelectItem>
                        </MultiSelect>
                        <FormMessage className="text-xs sm:text-sm" />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => setOpen(false)}
                    className="h-9 sm:h-10 px-3 sm:px-4"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="h-9 sm:h-10 px-3 sm:px-4">
                    Submit
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      <DataTable columns={columns} data={suppliers} />
    </div>
  );
}
