"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { updateMessage } from "@/lib/services/messages.service";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  subject: string;
  recipient: {
    name: string;
  };
  status: string;
  created_at: string;
}

interface MessageListProps {
  messages: Message[];
  onUpdate: () => void;
}

export function MessageList({ messages, onUpdate }: MessageListProps) {
  const { toast } = useToast();

  const handleMessageClick = async (message: Message) => {
    if (message.status === "unread") {
      try {
        await updateMessage(message.id, { status: "delivered" });
        onUpdate();
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to update message status",
          variant: "destructive",
        });
      }
    }
  };

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
              className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
              onClick={() => handleMessageClick(message)}
            >
              <div className="space-y-1">
                <p className="text-sm font-medium">{message.subject}</p>
                <p className="text-xs text-muted-foreground">
                  To: {message.recipient.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(message.created_at), "MMM d, yyyy HH:mm")}
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