"use client";

import { Button } from "@/components/ui/button";
import { Download, Upload, FileDown } from "lucide-react";
import { exportToExcel, exportToCSV, downloadTemplate } from "@/lib/utils/export";
import { parseCSV, validateData } from "@/lib/utils/import";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ImportExportButtonsProps {
  type: string;
  data?: any[];
  onImport: (data: any[]) => Promise<void>;
}

export function ImportExportButtons({ type, data = [], onImport }: ImportExportButtonsProps) {
  const { toast } = useToast();

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      const parsedData = await parseCSV(file);
      const validation = validateData(parsedData, type as any);

      if (!validation.isValid) {
        toast({
          title: "Validation Error",
          description: "The uploaded file contains invalid data. Please check the template and try again.",
          variant: "destructive",
        });
        return;
      }

      await onImport(parsedData);
      toast({
        title: "Success",
        description: "Data imported successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to import data",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Import Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Import Options</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <div className="relative w-full">
              <input
                type="file"
                accept=".csv"
                onChange={handleImport}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex items-center">
                <Upload className="mr-2 h-4 w-4" />
                Import Data
              </div>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => downloadTemplate(type)}>
            <Download className="mr-2 h-4 w-4" />
            Download Template
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Export Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <FileDown className="mr-2 h-4 w-4" />
            Export
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Export Options</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => exportToExcel(data, `${type}-export`)}>
            <Download className="mr-2 h-4 w-4" />
            .xls
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => exportToCSV(data, `${type}-export`)}>
            <Download className="mr-2 h-4 w-4" />
            .csv
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}