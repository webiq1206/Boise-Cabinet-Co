"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { PortalShell } from "@/components/portal/PortalShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ProjectSubNav } from "@/components/portal/ProjectSubNav";
import { PortalEmptyState } from "@/components/portal/PortalEmptyState";
import { ArrowLeft, CreditCard, FileText } from "lucide-react";
import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useToast } from "@/hooks/use-toast";

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

interface Invoice {
  id: string;
  number: string;
  description: string;
  amount: number;
  status: string;
  dueDate: string;
  paidDate: string | null;
}

function PayInvoiceForm({
  clientSecret,
  amount,
  onSuccess,
  onCancel,
}: {
  clientSecret: string;
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    if (!stripe || !elements) return;
    setLoading(true);
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.href },
      redirect: "if_required",
    });
    setLoading(false);
    if (error) {
      toast({ title: error.message ?? "Payment failed", variant: "destructive" });
    } else {
      toast({ title: "Payment successful" });
      onSuccess();
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
      <p className="font-medium">Pay ${amount.toLocaleString()}</p>
      <PaymentElement />
      <div className="flex gap-2">
        <Button variant="brand" onClick={handlePay} disabled={loading || !stripe}>
          {loading ? "Processing…" : "Confirm payment"}
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

const statusConfig: Record<string, { label: string; variant: "default" | "destructive" | "outline" | "secondary" }> = {
  paid: { label: "Paid", variant: "default" },
  due: { label: "Due now", variant: "destructive" },
  upcoming: { label: "Upcoming", variant: "outline" },
  sent: { label: "Due now", variant: "destructive" },
  overdue: { label: "Overdue", variant: "destructive" },
};

export default function ProjectPaymentsPage() {
  const params = useParams();
  const projectId = params.id as string;
  const { toast } = useToast();
  const [payingInvoice, setPayingInvoice] = useState<Invoice | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const { data, isLoading, refetch } = useQuery<{ invoices: Invoice[] }>({
    queryKey: [`/api/portal/projects/${projectId}`],
    queryFn: () => fetch(`/api/portal/projects/${projectId}`).then((r) => r.json()),
  });

  const invoices = data?.invoices ?? [];
  const total = invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const paid = invoices.filter((inv) => inv.status === "paid").reduce((sum, inv) => sum + inv.amount, 0);

  const startPayment = async (invoice: Invoice) => {
    if (!stripePromise) {
      toast({ title: "Payments not configured", variant: "destructive" });
      return;
    }
    try {
      const res = await fetch("/api/portal/invoices/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId: invoice.id, projectId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed");
      setPayingInvoice(invoice);
      setClientSecret(json.clientSecret);
    } catch {
      toast({ title: "Could not start payment", variant: "destructive" });
    }
  };

  return (
    <PortalShell variant="customer" title="Payments">
      <div className="max-w-3xl mx-auto space-y-6">
        <ProjectSubNav />

        <div>
          <h2 className="text-xl font-serif tracking-tight">
            Invoices & <em className="brc-accent text-accent">payments</em>
          </h2>
        </div>

        {isLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : (
          <div className="grid gap-4 sm:grid-cols-3">
            <Card><CardContent className="pt-6"><p className="text-xs text-muted-foreground uppercase">Contract total</p><p className="text-2xl font-light mt-1">${total.toLocaleString()}</p></CardContent></Card>
            <Card><CardContent className="pt-6"><p className="text-xs text-muted-foreground uppercase">Paid to date</p><p className="text-2xl font-light mt-1 text-primary">${paid.toLocaleString()}</p></CardContent></Card>
            <Card><CardContent className="pt-6"><p className="text-xs text-muted-foreground uppercase">Remaining</p><p className="text-2xl font-light mt-1">${(total - paid).toLocaleString()}</p></CardContent></Card>
          </div>
        )}

        {clientSecret && payingInvoice && stripePromise && (
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <PayInvoiceForm
              clientSecret={clientSecret}
              amount={payingInvoice.amount}
              onSuccess={() => {
                setClientSecret(null);
                setPayingInvoice(null);
                refetch();
              }}
              onCancel={() => {
                setClientSecret(null);
                setPayingInvoice(null);
              }}
            />
          </Elements>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Invoices</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isLoading && invoices.length === 0 ? (
              <PortalEmptyState
                icon={FileText}
                title="No invoices yet"
                description="Invoices will appear here when your project reaches the contract stage."
              />
            ) : (
              invoices.map((invoice) => {
              const config = statusConfig[invoice.status] ?? statusConfig.upcoming;
              const canPay = ["due", "sent", "overdue"].includes(invoice.status);
              return (
                <div key={invoice.id} className="flex flex-wrap items-center justify-between gap-3 py-4 border-b last:border-0">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <p className="font-medium text-sm">{invoice.number}</p>
                      <Badge variant={config.variant}>{config.label}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{invoice.description}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="font-semibold">${invoice.amount.toLocaleString()}</p>
                    {canPay && (
                      <Button variant="brand" size="sm" onClick={() => startPayment(invoice)}>
                        <CreditCard className="h-3.5 w-3.5" />
                        Pay now
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
            )}
          </CardContent>
        </Card>
      </div>
    </PortalShell>
  );
}
