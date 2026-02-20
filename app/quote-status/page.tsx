"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Search, 
  Clock, 
  CheckCircle2, 
  Phone, 
  Mail,
  ArrowRight
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface QuoteStatus {
  id: string;
  status: "pending" | "reviewed" | "approved" | "completed";
  name?: string;
  services?: string[];
  estimatedTotal?: number;
  createdAt?: string;
  message?: string;
}

function QuoteStatusContent() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get("id") || "";
  const [quoteId, setQuoteId] = useState(initialId);
  const [searchId, setSearchId] = useState(initialId);

  const { data: quote, isLoading, isError } = useQuery<QuoteStatus>({
    queryKey: ["/api/quotes", searchId],
    queryFn: async () => {
      if (!searchId) return null;
      const res = await fetch(`/api/quotes?id=${searchId}`);
      if (!res.ok) throw new Error("Quote not found");
      return res.json();
    },
    enabled: !!searchId,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchId(quoteId);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" /> Pending Review</Badge>;
      case "reviewed":
        return <Badge variant="default">Under Review</Badge>;
      case "approved":
        return <Badge className="bg-primary"><CheckCircle2 className="h-3 w-3 mr-1" /> Approved</Badge>;
      case "completed":
        return <Badge className="bg-primary"><CheckCircle2 className="h-3 w-3 mr-1" /> Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-12">
      <div className="container px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Check Quote Status</h1>
            <p className="text-muted-foreground">
              Enter your quote ID to see the current status of your request
            </p>
          </div>

          {/* Search Form */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <form onSubmit={handleSearch} className="flex gap-2">
                <Input
                  placeholder="Enter your quote ID (e.g., QT-123456789)"
                  value={quoteId}
                  onChange={(e) => setQuoteId(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" disabled={!quoteId}>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Results */}
          {isLoading && searchId && (
            <Card>
              <CardContent className="py-8 text-center">
                <div className="animate-pulse text-muted-foreground">
                  Searching for your quote...
                </div>
              </CardContent>
            </Card>
          )}

          {isError && searchId && (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-destructive mb-4">Quote not found</p>
                <p className="text-sm text-muted-foreground">
                  Please check your quote ID and try again. If you continue to have issues, 
                  please contact us.
                </p>
              </CardContent>
            </Card>
          )}

          {quote && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Quote {quote.id}</CardTitle>
                    <CardDescription>
                      {quote.createdAt && `Submitted on ${new Date(quote.createdAt).toLocaleDateString()}`}
                    </CardDescription>
                  </div>
                  {getStatusBadge(quote.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Status Message */}
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm">
                    {quote.message || "Your quote is being processed. We'll contact you within 24 hours."}
                  </p>
                </div>

                {/* Quote Details */}
                {(quote.services || quote.estimatedTotal) && (
                  <div className="space-y-4">
                    {quote.services && quote.services.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Requested Services</h4>
                        <div className="flex flex-wrap gap-2">
                          {quote.services.map((service) => (
                            <Badge key={service} variant="outline">
                              {service}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {quote.estimatedTotal && (
                      <div>
                        <h4 className="text-sm font-medium mb-1">Estimated Total</h4>
                        <p className="text-2xl font-bold">
                          ${quote.estimatedTotal.toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Contact Info */}
                <div className="border-t pt-6">
                  <h4 className="text-sm font-medium mb-3">Questions?</h4>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button variant="outline" asChild className="flex-1">
                      <a href="tel:2083522011">
                        <Phone className="h-4 w-4 mr-2" />
                        (208) 352-2011
                      </a>
                    </Button>
                    <Button variant="outline" asChild className="flex-1">
                      <a href="mailto:hello@lawncarekuna.com">
                        <Mail className="h-4 w-4 mr-2" />
                        Email Us
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* No Search Yet */}
          {!searchId && !isLoading && (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground mb-4">
                  Enter your quote ID above to check the status of your request.
                </p>
                <p className="text-sm text-muted-foreground">
                  Don't have a quote yet?{" "}
                  <Link href="/get-quote" className="text-primary hover:underline">
                    Get a free quote
                    <ArrowRight className="inline h-3 w-3 ml-1" />
                  </Link>
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default function QuoteStatusPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <FileText className="w-12 h-12 text-primary animate-pulse" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <QuoteStatusContent />
    </Suspense>
  );
}
