"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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

// Define the form schema
const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  category: z.string().min(1, "Please select a category"),
  price: z.string().min(1, "Price is required"),
  stock: z.string().min(1, "Stock is required"),
  sourceType: z.string().min(1, "Source type is required"),
  processDate: z.string().min(1, "Process date is required"),
});

export default function ProductsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [products, setProducts] = useState(data);

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      category: "",
      price: "",
      stock: "",
      sourceType: "",
      processDate: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // Create a new product object with the form values
      const newProduct = {
        id: (products.length + 1).toString(),
        name: values.name,
        category: values.category,
        price: `$${values.price}/ton`,
        stock: `${values.stock} tons`,
        sourceType: values.sourceType,
        processDate: values.processDate,
        status:
          Number(values.stock) === 0
            ? "out_of_stock"
            : Number(values.stock) <= 30
            ? "low_stock"
            : "in_stock",
      };

      // Here you would typically make an API call to check if product exists
      // and then save to database if it doesn't

      // Update the products state with the new product
      setProducts([...products, newProduct]);

      // Close dialog and reset form
      setIsDialogOpen(false);
      form.reset();
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 md:p-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Products
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Manage your recycled products inventory
          </p>
        </div>
        <Button
          onClick={() => setIsDialogOpen(true)}
          className="w-full sm:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>
      <DataTable columns={columns} data={products} />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-[95%] max-w-[425px] sm:w-full p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-xl">Add New Product</DialogTitle>
            <DialogDescription className="text-sm">
              Fill in the details to add a new recycled product.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter product name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Paper Products">
                          Paper Products
                        </SelectItem>
                        <SelectItem value="Plastic Products">
                          Plastic Products
                        </SelectItem>
                        <SelectItem value="Metal Products">
                          Metal Products
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (per ton)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter price per ton" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock (tons)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter stock amount" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sourceType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Source Type</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter source type" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="processDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Process Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button type="submit" className="w-full sm:w-auto">
                  Add Product
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
