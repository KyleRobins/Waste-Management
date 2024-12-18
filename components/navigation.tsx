"use client";

import { CircleUser, Menu, Recycle } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useState } from "react";

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <Recycle className="h-6 w-6 text-primary" />
              <span className="text-lg font-semibold">WasteWise</span>
            </Link>
            
            <div className="hidden md:flex items-center gap-6">
              <Link href="/waste-records" className="text-muted-foreground hover:text-primary transition-colors">
                Waste Records
              </Link>
              <Link href="/suppliers" className="text-muted-foreground hover:text-primary transition-colors">
                Suppliers
              </Link>
              <Link href="/customers" className="text-muted-foreground hover:text-primary transition-colors">
                Customers
              </Link>
              <Link href="/employees" className="text-muted-foreground hover:text-primary transition-colors">
                Employees
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <CircleUser className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsOpen(!isOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden border-t p-4">
          <div className="flex flex-col gap-4">
            <Link
              href="/waste-records"
              className="text-muted-foreground hover:text-primary transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Waste Records
            </Link>
            <Link
              href="/suppliers"
              className="text-muted-foreground hover:text-primary transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Suppliers
            </Link>
            <Link
              href="/customers"
              className="text-muted-foreground hover:text-primary transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Customers
            </Link>
            <Link
              href="/employees"
              className="text-muted-foreground hover:text-primary transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Employees
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}