"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { PortalShell } from "@/components/portal/PortalShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Send, Loader2 } from "lucide-react";
import { format } from "date-fns";

interface Message {
  id: string;
  body: string;
  senderRole: string;
  createdAt: string;
  isOwn: boolean;
}

export default function ProjectMessagesPage() {
  const params = useParams();
  const projectId = params.id as string;
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  const { data, isLoading } = useQuery<{ messages: Message[] }>({
    queryKey: [`/api/portal/projects/${projectId}`],
    queryFn: () => fetch(`/api/portal/projects/${projectId}`).then((r) => r.json()),
  });

  const messages = data?.messages ?? [];

  const sendMessage = async () => {
    if (!draft.trim()) return;
    setSending(true);
    try {
      await fetch("/api/portal/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, body: draft.trim() }),
      });
      setDraft("");
      queryClient.invalidateQueries({ queryKey: [`/api/portal/projects/${projectId}`] });
    } finally {
      setSending(false);
    }
  };

  return (
    <PortalShell variant="customer" title="Messages">
      <div className="max-w-3xl mx-auto space-y-6">
        <Button variant="ghost" size="sm" asChild className="-ml-2">
          <Link href={`/portal/projects/${projectId}`}>
            <ArrowLeft className="h-4 w-4" />
            Back to project
          </Link>
        </Button>

        <div>
          <h2 className="text-xl font-sans font-light tracking-tight">
            Project <em className="brc-accent text-accent">messages</em>
          </h2>
        </div>

        <Card className="flex flex-col min-h-[420px]">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-base">Conversation</CardTitle>
            <CardDescription>Direct line to your Boise Cabinet Co project team</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto py-4 space-y-4">
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading messages…</p>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className={`flex gap-3 ${msg.isOwn ? "flex-row-reverse" : ""}`}>
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="text-xs">
                      {msg.isOwn ? "YO" : "BC"}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-3 text-sm ${
                      msg.isOwn ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}
                  >
                    <p className="font-medium text-xs mb-1 opacity-80">
                      {msg.isOwn ? "You" : "Boise Cabinet Co"}
                    </p>
                    <p>{msg.body}</p>
                    <p className="text-xs mt-2 opacity-60">
                      {format(new Date(msg.createdAt), "MMM d, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
          <div className="border-t p-4 flex gap-2">
            <Input
              placeholder="Type a message…"
              className="flex-1"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <Button variant="brand" size="icon" onClick={sendMessage} disabled={sending || !draft.trim()} aria-label="Send message">
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </Card>
      </div>
    </PortalShell>
  );
}
