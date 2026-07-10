"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ProjectTimeline } from "@/components/portal/ProjectTimeline";
import {
  PROJECT_STAGE_ORDER,
  STAGE_DEFINITIONS,
  type ProjectStage,
} from "@/shared/projectStages";

interface AdminInvoice {
  id: string;
  description: string | null;
  amount: string;
  status: string;
  dueDate: string | null;
  paidAt: string | null;
}

interface AdminMessage {
  id: string;
  body: string;
  senderRole: string;
  createdAt: string;
}

interface AdminProjectPortalPanelProps {
  projectId: string;
  currentStage: string | null;
  customerUserId: string | null;
  customerEmail: string;
  invoices: AdminInvoice[];
  messages: AdminMessage[];
  onAction: (body: Record<string, unknown>) => void;
  onPatch: (body: Record<string, unknown>) => void;
  isPending?: boolean;
}

export function AdminProjectPortalPanel({
  projectId,
  currentStage,
  customerUserId,
  customerEmail,
  invoices,
  messages,
  onAction,
  onPatch,
  isPending,
}: AdminProjectPortalPanelProps) {
  const stage = (currentStage as ProjectStage) ?? "consultation";
  const [invoiceDesc, setInvoiceDesc] = useState("");
  const [invoiceAmount, setInvoiceAmount] = useState("");
  const [invoiceDue, setInvoiceDue] = useState("");
  const [messageBody, setMessageBody] = useState("");

  return (
    <div className="space-y-6 mt-4">
      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Customer timeline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ProjectTimeline currentStage={stage} />
          <div className="flex flex-wrap items-end gap-3 pt-2 border-t">
            <div className="space-y-2 flex-1 min-w-[200px]">
              <Label>Current stage</Label>
              <Select
                value={stage}
                onValueChange={(v) => onPatch({ currentStage: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROJECT_STAGE_ORDER.map((s) => (
                    <SelectItem key={s} value={s}>
                      {STAGE_DEFINITIONS[s].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="outline"
              disabled={isPending}
              onClick={() => {
                const idx = PROJECT_STAGE_ORDER.indexOf(stage);
                if (idx < PROJECT_STAGE_ORDER.length - 1) {
                  onPatch({ currentStage: PROJECT_STAGE_ORDER[idx + 1] });
                }
              }}
            >
              Advance stage
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Customer portal access */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Client portal access</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-muted-foreground">Portal email:</span>
            <span>{customerEmail}</span>
            {customerUserId ? (
              <Badge variant="outline" className="text-[hsl(136_21%_53%)] border-[hsl(136_21%_53%)]/40">
                Linked
              </Badge>
            ) : (
              <Badge variant="outline">Not linked</Badge>
            )}
          </div>
          <p className="text-muted-foreground text-xs">
            Links the project when the customer signs in with the same email address.
          </p>
          <Button
            variant="outline"
            size="sm"
            disabled={isPending || !!customerUserId}
            onClick={() => onAction({ action: "link_customer" })}
          >
            Link customer account
          </Button>
        </CardContent>
      </Card>

      {/* Invoices */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Invoices</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {invoices.length === 0 ? (
            <p className="text-sm text-muted-foreground">No invoices yet.</p>
          ) : (
            <div className="space-y-2">
              {invoices.map((inv) => (
                <div
                  key={inv.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-3 text-sm"
                >
                  <div>
                    <p className="font-medium">{inv.description ?? "Invoice"}</p>
                    <p className="text-muted-foreground">
                      ${parseFloat(inv.amount).toLocaleString()}
                      {inv.dueDate && ` · Due ${new Date(inv.dueDate).toLocaleDateString()}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{inv.status}</Badge>
                    {inv.status !== "paid" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={isPending}
                        onClick={() =>
                          onAction({
                            action: "update_invoice",
                            invoiceId: inv.id,
                            status: "sent",
                          })
                        }
                      >
                        Mark sent
                      </Button>
                    )}
                    {inv.status !== "paid" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={isPending}
                        onClick={() =>
                          onAction({
                            action: "update_invoice",
                            invoiceId: inv.id,
                            status: "paid",
                          })
                        }
                      >
                        Mark paid
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-3 pt-2 border-t">
            <div className="space-y-2 sm:col-span-2">
              <Label>Description</Label>
              <Input
                value={invoiceDesc}
                onChange={(e) => setInvoiceDesc(e.target.value)}
                placeholder="Production deposit, 50%"
              />
            </div>
            <div className="space-y-2">
              <Label>Amount</Label>
              <Input
                type="number"
                value={invoiceAmount}
                onChange={(e) => setInvoiceAmount(e.target.value)}
                placeholder="8750"
              />
            </div>
            <div className="space-y-2">
              <Label>Due date</Label>
              <Input
                type="date"
                value={invoiceDue}
                onChange={(e) => setInvoiceDue(e.target.value)}
              />
            </div>
            <div className="sm:col-span-3">
              <Button
                disabled={isPending || !invoiceDesc || !invoiceAmount}
                onClick={() => {
                  onAction({
                    action: "create_invoice",
                    description: invoiceDesc,
                    amount: invoiceAmount,
                    dueDate: invoiceDue || undefined,
                  });
                  setInvoiceDesc("");
                  setInvoiceAmount("");
                  setInvoiceDue("");
                }}
              >
                Create invoice
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Messages */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Customer messages</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="max-h-64 overflow-y-auto space-y-3">
            {messages.length === 0 ? (
              <p className="text-sm text-muted-foreground">No messages yet.</p>
            ) : (
              messages.map((m) => (
                <div
                  key={m.id}
                  className={`rounded-md p-3 text-sm ${
                    m.senderRole === "admin" ? "bg-muted ml-8" : "bg-primary/5 mr-8"
                  }`}
                >
                  <div className="flex justify-between gap-2 text-xs text-muted-foreground mb-1">
                    <span className="capitalize">{m.senderRole}</span>
                    <span>{new Date(m.createdAt).toLocaleString()}</span>
                  </div>
                  <p>{m.body}</p>
                </div>
              ))
            )}
          </div>
          <div className="space-y-2 pt-2 border-t">
            <Label>Message to customer</Label>
            <Textarea
              value={messageBody}
              onChange={(e) => setMessageBody(e.target.value)}
              rows={3}
              placeholder="Your design is ready for review..."
            />
            <Button
              disabled={isPending || !messageBody.trim()}
              onClick={() => {
                onAction({
                  action: "send_message",
                  body: messageBody.trim(),
                });
                setMessageBody("");
              }}
            >
              Send message
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
