"use client";

import { MessageStats } from "@/components/messages/stats";
import { MessageList } from "@/components/messages/list";
import { MessageChart } from "@/components/messages/chart";

export default function MessagesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
        <p className="text-muted-foreground">
          Track system messages and notifications
        </p>
      </div>
      <MessageStats />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MessageChart />
        <MessageList />
      </div>
    </div>
  );
}