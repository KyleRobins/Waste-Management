"use client";

import { DataTable } from "@/components/shared/data-table";
import { columns } from "@/components/customers/columns";
import { Button } from "@/components/ui/button";
import { Plus, Mail } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import {
  MultiSelect,
  MultiSelectContent,
  MultiSelectItem,
  MultiSelectTrigger,
  MultiSelectValue,
} from "@/components/ui/multi-select";

const AVAILABLE_PRODUCTS = [
  "Recycled Paper",
  "Plastic Pellets",
  "Recycled Metal",
  "Construction Materials",
  "Recycled Plastic",
  "Paper Products",
  "Sustainable Packaging",
  "Eco-friendly Materials",
  "Organic Waste",
  "Electronic Waste",
  "Glass Materials",
  "Textile Waste",
  "Wood Products",
  "Chemical Waste",
  "Metal Scraps",
  "Biodegradable Materials",
];

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

// Update the form schema to include all fields
const customerFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  contactPerson: z
    .string()
    .min(2, "Contact person must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
  purchasedProducts: z.array(z.string()).min(1, "Select at least one product"),
  totalPurchases: z.string().optional(),
  status: z.enum(["active", "inactive"]),
  lastPurchase: z.string().optional(),
});

export default function CustomersPage() {
  const { toast } = useToast();
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof customerFormSchema>>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      name: "",
      contactPerson: "",
      email: "",
      phone: "",
      purchasedProducts: [],
      totalPurchases: "0",
      status: "active",
      lastPurchase: new Date().toISOString().split("T")[0],
    },
  });

  const onSubmit = (values: z.infer<typeof customerFormSchema>) => {
    // Handle form submission here
    toast({
      title: "Customer Added",
      description: `${values.name} has been added successfully.`,
    });
  };

  const handleBulkMessage = () => {
    setIsMessageDialogOpen(true);
  };

  return (
    <div className="flex flex-col gap-4 p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Customers
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your customer relationships and orders
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          {selectedCustomers.length > 0 && (
            <Button
              variant="outline"
              onClick={handleBulkMessage}
              className="w-full sm:w-auto"
            >
              <Mail className="mr-2 h-4 w-4" />
              Message Selected
            </Button>
          )}
          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Add Customer
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-[425px] h-[90vh] md:h-auto overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Customer</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter company name"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="contactPerson"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Person</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter contact person name"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter email address"
                              type="email"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter phone number"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="purchasedProducts"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Purchased Products</FormLabel>
                        <MultiSelect
                          value={field.value}
                          onValueChange={field.onChange}
                          placeholder="Select products"
                        >
                          {AVAILABLE_PRODUCTS.map((product) => (
                            <MultiSelectItem key={product} value={product}>
                              {product}
                            </MultiSelectItem>
                          ))}
                        </MultiSelect>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="totalPurchases"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Total Purchases</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter total purchases"
                              type="text"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <FormControl>
                            <select
                              className="w-full p-2 border rounded-md"
                              {...field}
                            >
                              <option value="active">Active</option>
                              <option value="inactive">Inactive</option>
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="lastPurchase"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Purchase Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full">
                    Add Customer
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="rounded-md border">
        <DataTable
          columns={columns}
          data={data}
          onRowSelection={(selectedRows) => setSelectedCustomers(selectedRows)}
        />
      </div>

      {/* Message Dialog */}
      <Dialog open={isMessageDialogOpen} onOpenChange={setIsMessageDialogOpen}>
        <DialogContent className="w-[95vw] max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Send Message</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <FormItem>
              <FormLabel>Message</FormLabel>
              <FormControl>
                <textarea
                  className="w-full min-h-[100px] p-2 border rounded-md"
                  placeholder="Type your message here..."
                />
              </FormControl>
            </FormItem>
            <Button
              onClick={() => {
                toast({
                  title: "Message Sent",
                  description: `Message sent to ${selectedCustomers.length} customers.`,
                });
                setIsMessageDialogOpen(false);
              }}
              className="w-full"
            >
              Send Message
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
