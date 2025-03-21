import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardStats } from "@/components/dashboard/stats";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { WasteCollection } from "@/components/dashboard/waste-collection";

export default function Home() {
  return (
    <div className="flex flex-col gap-8">
      <DashboardHeader />
      <DashboardStats />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <RecentActivity />
        <WasteCollection />
      </div>
    </div>
  );
}