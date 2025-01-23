"use client";

import { DataTable } from "@/components/shared/data-table";
import { ImportExportButtons } from "@/components/shared/import-export-buttons";
import { PageSkeleton } from "@/components/shared/page-skeleton";
import { columns } from "@/components/waste-records/columns";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { createWasteRecord, getWasteRecords, deleteWasteRecord, updateWasteRecord } from "@/lib/services/waste-records.service";
import { getSuppliers } from "@/lib/services/suppliers.service";

const wasteTypes = [
  "Paper",
  "Plastic",
  "Metal",
  "Glass",
  "Organic",
  "Electronic",
  "Other",
] as const;

const formSchema = z.object({
  date: z.string().min(1, "Date is required"),
  type: z.enum(wasteTypes, {
    required_error: "Please select a waste type",
  }),
  quantity: z.string().min(1, "Quantity is required"),
  supplier_id: z.string().min(1, "Supplier is required"),
  location: z.string().min(1, "Location is required"),
});

export default function WasteRecordsPage() {
  const [records, setRecords] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      type: undefined,
      quantity: "",
      supplier_id: "",
      location: "",
    },
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [recordsData, suppliersData] = await Promise.all([
        getWasteRecords(),
        getSuppliers()
      ]);
      setRecords(recordsData);
      setSuppliers(suppliersData);
      setLoading(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load data",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await createWasteRecord({
        ...values,
        status: "pending",
      });

      toast({
        title: "Success",
        description: "Waste record has been created successfully.",
      });

      loadData();
      setOpen(false);
      form.reset({
        date: new Date().toISOString().split("T")[0],
        type: undefined,
        quantity: "",
        supplier_id: "",
        location: "",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create waste record",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteWasteRecord(id);
      toast({
        title: "Success",
        description: "Waste record has been deleted.",
      });
      loadData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete waste record",
        variant: "destructive",
      });
    }
  };

  const handleUpdate = async (id: string, updates: Partial<z.infer<typeof formSchema>>) => {
    try {
      await updateWasteRecord(id, updates);
      toast({
        title: "Success",
        description: "Waste record has been updated.",
      });
      loadData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update waste record",
        variant: "destructive",
      });
    }
  };

  const handleImport = async (data: any[]) => {
    try {
      await Promise.all(data.map(record => createWasteRecord(record)));
      loadData();
    } catch (error) {
      throw error;
    }
  };

  if (loading) {
    return <PageSkeleton />;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Waste Records</h1>
          <p className="text-muted-foreground">
            Manage and track waste collection records
          </p>
        </div>
        <div className="flex gap-2">
          <ImportExportButtons
            type="waste-records"
            data={records}
            onImport={handleImport}
          />
          <Dialog open={open} onOpenChange={(isOpen) => {
            setOpen(isOpen);
            if (!isOpen) {
              form.reset({
                date: new Date().toISOString().split("T")[0],
                type: undefined,
                quantity: "",
                supplier_id: "",
                location: "",
              });
            }
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Record
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Waste Record</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Waste Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select waste type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {wasteTypes.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity (kg)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="supplier_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Supplier</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select supplier" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {suppliers.map((supplier: any) => (
                              <SelectItem key={supplier.id} value={supplier.id}>
                                {supplier.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() => setOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Submit</Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <DataTable 
        columns={columns} 
        data={records}
        onDelete={handleDelete}
        onUpdate={handleUpdate}
      />
    </div>
  );
}