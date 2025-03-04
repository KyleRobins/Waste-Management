"use client";

import { useEffect, useState } from "react";
import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardStats } from "@/components/dashboard/stats";
import { WasteCollection } from "@/components/dashboard/waste-collection";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          // For demo purposes, we'll just show a message instead of redirecting
          console.log("No authenticated session, but continuing for demo");
          setLoading(false);
          return;
        }
        
        // Get user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        setUser(profile);
        setLoading(false);
      } catch (error) {
        console.error("Error checking auth:", error);
        setLoading(false);
      }
    };
    
    checkAuth();
  }, [router, supabase]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Demo admin notice
  const showDemoNotice = !user;

  return (
    <div className="flex flex-col gap-6">
      {showDemoNotice && (
        <Card className="border-amber-500 bg-amber-50 dark:bg-amber-950/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              <p className="font-medium text-amber-800 dark:text-amber-300">
                Demo Mode: To create an admin user, run <code className="bg-amber-100 dark:bg-amber-900/30 px-1 py-0.5 rounded">npm run create-admin</code> in your terminal
              </p>
            </div>
            <div className="mt-2 text-sm text-amber-700 dark:text-amber-400">
              <p>Login credentials after running the command:</p>
              <p>Email: robinsmutuma44@gmail.com</p>
              <p>Password: Admin123!</p>
            </div>
          </CardContent>
        </Card>
      )}
      
      <DashboardHeader />
      <DashboardStats />
      <div className="grid gap-6 md:grid-cols-2">
        <WasteCollection />
        <RecentActivity />
      </div>
    </div>
  );
}