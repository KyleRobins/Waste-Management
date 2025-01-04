"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const messages = [
  {
    id: 1,
    subject: "Payment Reminder",
    recipient: "Eco Manufacturing Ltd",
    status: "delivered",
    timestamp: new Date(2024, 2, 15, 14, 30),
  },
  {
    id: 2,
    subject: "Collection Schedule Update",
    recipient: "Green Waste Solutions",
    status: "unread",
    timestamp: new Date(2024, 2, 15, 13, 45),
  },
  {
    id: 3,
    subject: "New Invoice",
    recipient: "Sustainable Packaging Co",
    status: "failed",
    timestamp: new Date(2024, 2, 15, 12, 15),
  },
];

export function MessageList() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Messages</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="space-y-1">
                <p className="text-sm font-medium">{message.subject}</p>
                <p className="text-xs text-muted-foreground">
                  To: {message.recipient}
                </p>
                <p className="text-xs text-muted-foreground">
                  {format(message.timestamp, "MMM d, yyyy HH:mm")}
                </p>
              </div>
              <Badge
                variant={
                  message.status === "delivered"
                    ? "default"
                    : message.status === "unread"
                    ? "secondary"
                    : "destructive"
                }
              >
                {message.status}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}