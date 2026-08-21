"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Mail, Phone, MessageSquare, PlusCircle, PhoneCall, Voicemail, MessageCircle,
  CheckCircle2, FolderKanban, DollarSign, Send, ArrowLeftRight, Sparkles, ShoppingCart,
  History, FileText,
} from "lucide-react";

type ActivityType =
  | "created" | "note" | "contact_attempt" | "status_change" | "accepted"
  | "converted" | "price_change" | "email_sent" | "purchased";

interface TimelineEntry {
  id: string;
  type: ActivityType;
  message: string;
  detail: Record<string, unknown> | null;
  actorName: string | null;
  createdAt: string;
}

const ICONS: Record<ActivityType, React.ComponentType<{ className?: string }>> = {
  created: Sparkles,
  note: FileText,
  contact_attempt: PhoneCall,
  status_change: ArrowLeftRight,
  accepted: CheckCircle2,
  converted: FolderKanban,
  price_change: DollarSign,
  email_sent: Send,
  purchased: ShoppingCart,
};

function iconForEntry(entry: TimelineEntry): React.ComponentType<{ className?: string }> {
  if (entry.type === "contact_attempt") {
    const channel = (entry.detail?.channel as string) || "";
    if (channel === "texted") return MessageCircle;
    if (channel === "voicemail") return Voicemail;
    return PhoneCall;
  }
  return ICONS[entry.type] || History;
}

function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function LeadTimeline({
  leadId,
  email,
  phone,
}: {
  leadId: string;
  email: string;
  phone?: string | null;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteText, setNoteText] = useState("");

  const activityKey = ["/api/leads", leadId, "activity"];

  const { data: timeline = [], isLoading } = useQuery<TimelineEntry[]>({
    queryKey: activityKey,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: activityKey });
    queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
  };

  const addNote = useMutation({
    mutationFn: async (text: string) => {
      const res = await fetch(`/api/leads/${leadId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error("Failed to add note");
      return res.json();
    },
    onSuccess: () => {
      invalidate();
      setNoteText("");
      setNoteOpen(false);
      toast({ title: "Note added", description: "Saved to the lead timeline." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const logContact = useMutation({
    mutationFn: async (channel: "called" | "texted" | "voicemail") => {
      const res = await fetch(`/api/leads/${leadId}/activity`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel }),
      });
      if (!res.ok) throw new Error("Failed to log contact attempt");
      return res.json();
    },
    onSuccess: () => {
      invalidate();
      toast({ title: "Logged", description: "Contact attempt added to the timeline." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const hasPhone = !!phone && phone.trim().length > 0;

  return (
    <div className="border-t pt-2">
      <div className="flex items-center gap-1.5 mb-2">
        <History className="h-3.5 w-3.5 text-muted-foreground" />
        <p className="text-xs font-medium">Activity timeline</p>
      </div>

      {/* Contact actions */}
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <Button
          asChild
          variant="outline"
          size="sm"
          className="h-8"
          data-testid={`button-contact-email-${leadId}`}
        >
          <a href={`mailto:${email}`}>
            <Mail className="h-3.5 w-3.5 mr-1" />
            Email
          </a>
        </Button>
        <Button
          asChild
          variant="outline"
          size="sm"
          className="h-8"
          disabled={!hasPhone}
          data-testid={`button-contact-call-${leadId}`}
        >
          <a href={hasPhone ? `tel:${phone}` : undefined}>
            <Phone className="h-3.5 w-3.5 mr-1" />
            Call
          </a>
        </Button>
        <Button
          asChild
          variant="outline"
          size="sm"
          className="h-8"
          disabled={!hasPhone}
          data-testid={`button-contact-text-${leadId}`}
        >
          <a href={hasPhone ? `sms:${phone}` : undefined}>
            <MessageSquare className="h-3.5 w-3.5 mr-1" />
            Text
          </a>
        </Button>
      </div>

      {/* Quick log controls */}
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <Dialog open={noteOpen} onOpenChange={setNoteOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8" data-testid={`button-add-note-${leadId}`}>
              <PlusCircle className="h-3.5 w-3.5 mr-1" />
              Add note
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add note</DialogTitle>
              <DialogDescription>
                Add an internal note. It will appear in this lead's timeline.
              </DialogDescription>
            </DialogHeader>
            <Textarea
              placeholder="Enter your note here..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              rows={4}
              data-testid={`input-note-${leadId}`}
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setNoteOpen(false)} data-testid={`button-cancel-note-${leadId}`}>
                Cancel
              </Button>
              <Button
                onClick={() => addNote.mutate(noteText.trim())}
                disabled={!noteText.trim() || addNote.isPending}
                data-testid={`button-save-note-${leadId}`}
              >
                Save note
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Button
          variant="ghost"
          size="sm"
          className="h-8"
          onClick={() => logContact.mutate("called")}
          disabled={logContact.isPending}
          data-testid={`button-log-called-${leadId}`}
        >
          <PhoneCall className="h-3.5 w-3.5 mr-1" />
          Called
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8"
          onClick={() => logContact.mutate("texted")}
          disabled={logContact.isPending}
          data-testid={`button-log-texted-${leadId}`}
        >
          <MessageCircle className="h-3.5 w-3.5 mr-1" />
          Texted
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8"
          onClick={() => logContact.mutate("voicemail")}
          disabled={logContact.isPending}
          data-testid={`button-log-voicemail-${leadId}`}
        >
          <Voicemail className="h-3.5 w-3.5 mr-1" />
          Voicemail
        </Button>
      </div>

      {/* Timeline list */}
      {isLoading ? (
        <p className="text-xs text-muted-foreground italic" data-testid={`text-timeline-loading-${leadId}`}>
          Loading timeline...
        </p>
      ) : timeline.length === 0 ? (
        <p className="text-xs text-muted-foreground italic">No activity yet.</p>
      ) : (
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1" data-testid={`list-timeline-${leadId}`}>
          {timeline.map((entry) => {
            const Icon = iconForEntry(entry);
            return (
              <div key={entry.id} className="flex gap-2" data-testid={`row-timeline-${entry.id}`}>
                <div className="mt-0.5 flex-shrink-0">
                  <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs" data-testid={`text-timeline-message-${entry.id}`}>{entry.message}</p>
                  <p className="text-[12px] text-muted-foreground">
                    {formatTimestamp(entry.createdAt)}
                    {entry.actorName ? ` by ${entry.actorName}` : ""}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
