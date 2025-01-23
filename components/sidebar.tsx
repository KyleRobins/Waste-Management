"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  Recycle,
  Building2,
  PackageSearch,
  Users2,
  BarChart3,
  Settings,
  HelpCircle,
  Sun,
  Moon,
  CreditCard,
  LogOut,
  Wallet,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Factory,
  Handshake,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { useTheme } from "next-themes";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";

const routes = [
  {
    label: "Dashboard",
    icon: Home,
    href: "/",
  },
  {
    label: "Waste Records",
    icon: Recycle,
    href: "/waste-records",
  },
  {
    label: "Suppliers",
    icon: Factory,
    href: "/suppliers",
  },
  {
    label: "Customers",
    icon: Handshake,
    href: "/customers",
  },
  {
    label: "Products",
    icon: PackageSearch,
    href: "/products",
  },
  {
    label: "Employees",
    icon: Users2,
    href: "/employees",
  },
  {
    label: "Reports",
    icon: BarChart3,
    href: "/reports",
  },
];

const monitoringRoutes = [
  {
    label: "Payments",
    icon: Wallet,
    href: "/payments",
  },
  {
    label: "Messages",
    icon: MessageSquare,
    href: "/messages",
    badge: 8,
  },
];

const bottomRoutes = [
  {
    label: "Settings",
    icon: Settings,
    href: "/settings",
  },
  {
    label: "Help Center",
    icon: HelpCircle,
    href: "/help",
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { theme, setTheme } = useTheme();

  // Only render after component is mounted to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // Return null on server-side and first render
  }

  const handleSignOut = () => {
    // Implement sign out logic here
    console.log("Signing out...");
  };

  return (
    <aside 
      className={cn(
        "h-full bg-amazon-950 text-white relative flex flex-col",
        isCollapsed ? "w-[4rem]" : "w-[16rem]",
        "transition-all duration-300 ease-in-out"
      )}
    >
      <div className={cn(
        "flex items-center h-16 px-4",
        isCollapsed ? "justify-center" : "justify-between"
      )}>
        {!isCollapsed && <h1 className="text-xl font-bold">WasteWise</h1>}
      </div>

      <div className="flex-1 px-2">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "flex items-center w-full p-2 my-1 rounded-lg transition-colors",
              pathname === route.href 
                ? "bg-amazon-800 text-amazon-100" 
                : "text-amazon-300 hover:text-amazon-100 hover:bg-amazon-800",
              isCollapsed ? "justify-center" : "justify-start"
            )}
          >
            <route.icon className="h-5 w-5 min-w-[1.25rem]" />
            {!isCollapsed && (
              <span className="ml-3 text-sm">{route.label}</span>
            )}
          </Link>
        ))}

        <Separator className="my-4 bg-amazon-800" />

        {monitoringRoutes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "flex items-center w-full p-2 my-1 rounded-lg transition-colors relative",
              pathname === route.href 
                ? "bg-amazon-800 text-amazon-100" 
                : "text-amazon-300 hover:text-amazon-100 hover:bg-amazon-800",
              isCollapsed ? "justify-center" : "justify-start"
            )}
          >
            <route.icon className="h-5 w-5 min-w-[1.25rem]" />
            {!isCollapsed && (
              <span className="ml-3 text-sm">{route.label}</span>
            )}
            {route.badge && (
              <Badge 
                className={cn(
                  "bg-amazon-500 text-white",
                  isCollapsed ? "absolute -top-1 -right-1" : "ml-auto"
                )}
              >
                {route.badge}
              </Badge>
            )}
          </Link>
        ))}
      </div>

      <div className="px-2 py-4">
        <Separator className="my-4 bg-amazon-800" />
        
        {bottomRoutes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "flex items-center w-full p-2 my-1 rounded-lg transition-colors",
              pathname === route.href 
                ? "bg-amazon-800 text-amazon-100" 
                : "text-amazon-300 hover:text-amazon-100 hover:bg-amazon-800",
              isCollapsed ? "justify-center" : "justify-start"
            )}
          >
            <route.icon className="h-5 w-5 min-w-[1.25rem]" />
            {!isCollapsed && (
              <span className="ml-3 text-sm">{route.label}</span>
            )}
          </Link>
        ))}

        <Button
          variant="ghost"
          className={cn(
            "w-full p-2 my-1 flex items-center text-amazon-300 hover:text-amazon-100 hover:bg-amazon-800",
            isCollapsed ? "justify-center" : "justify-start"
          )}
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5 min-w-[1.25rem]" />
          ) : (
            <Moon className="h-5 w-5 min-w-[1.25rem]" />
          )}
          {!isCollapsed && (
            <span className="ml-3 text-sm">Toggle Theme</span>
          )}
        </Button>

        <Button
          variant="ghost"
          className={cn(
            "w-full p-2 my-1 flex items-center text-amazon-300 hover:text-amazon-100 hover:bg-amazon-800",
            isCollapsed ? "justify-center" : "justify-start"
          )}
          onClick={handleSignOut}
        >
          <LogOut className="h-5 w-5 min-w-[1.25rem]" />
          {!isCollapsed && (
            <span className="ml-3 text-sm">Sign Out</span>
          )}
        </Button>

        <div className={cn(
          "flex items-center p-2 mt-4",
          isCollapsed ? "justify-center" : "justify-start"
        )}>
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>KR</AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="ml-3">
              <p className="text-sm font-medium text-amazon-100">Kyle Robins</p>
              <p className="text-xs text-amazon-400">Admin</p>
            </div>
          )}
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-4 top-6 text-amazon-300 hover:text-amazon-100 bg-amazon-950 rounded-full"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </Button>
    </aside>
  );
}