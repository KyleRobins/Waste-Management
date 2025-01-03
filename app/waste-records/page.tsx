"use client";

import { DataTable } from "@/components/shared/data-table";
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
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const initialData = [
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
  supplier: z.string().min(1, "Supplier is required"),
  location: z.string().min(1, "Location is required"),
});

function AddWasteRecordForm({ onAddRecord }: { onAddRecord: (record: any) => void }) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      supplier: "",
      quantity: "",
      location: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const newRecord = {
      id: (Math.random() * 1000).toString(),
      ...values,
      status: "pending",
    };
    
    onAddRecord(newRecord);
    
    toast({
      title: "Success",
      description: "Waste record has been created successfully.",
      variant: "default",
    });
    
    form.reset();
  }

  return (
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
              <Select onValueChange={field.onChange} defaultValue={field.value}>
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
              <FormLabel>Quantity</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 250kg" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="supplier"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Supplier</FormLabel>
              <FormControl>
                <Input placeholder="Enter supplier name" {...field} />
              </FormControl>
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
                <Input placeholder="Enter location" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3 pt-4">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit">Submit</Button>
        </div>
      </form>
    </Form>
  );
}

export default function WasteRecordsPage() {
  const [records, setRecords] = useState(initialData);

  const handleAddRecord = (newRecord: any) => {
    setRecords((prev) => [...prev, newRecord]);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Waste Records</h1>
          <p className="text-muted-foreground">
            Manage and track waste collection records
          </p>
        </div>
        <Dialog>
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
            <AddWasteRecordForm onAddRecord={handleAddRecord} />
          </DialogContent>
        </Dialog>
      </div>
      <DataTable columns={columns} data={records} />
    </div>
  );
}
