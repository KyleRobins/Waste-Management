"use client";

import { MessageStats } from "@/components/messages/stats";
import { MessageList } from "@/components/messages/list";
import { MessageChart } from "@/components/messages/chart";
import { useState, useEffect } from "react";
import { getMessages, getUnreadCount } from "@/lib/services/messages.service";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";

export default function MessagesPage() {
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      const [messagesData, { data: { user } }] = await Promise.all([
        getMessages(),
        supabase.auth.getUser()
      ]);

      setMessages(messagesData);

      if (user?.id) {
        const count = await getUnreadCount(user.id);
        setUnreadCount(count || 0);
      }

      setLoading(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load messages",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
        <p className="text-muted-foreground">
          Track system messages and notifications
        </p>
      </div>
      <MessageStats unreadCount={unreadCount} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MessageChart messages={messages} />
        <MessageList messages={messages} onUpdate={loadMessages} />
      </div>
    </div>
  );
}