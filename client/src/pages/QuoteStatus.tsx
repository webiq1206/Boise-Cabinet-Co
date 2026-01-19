import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { queryClient, apiRequest } from "../lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, Mail, Phone, MapPin, Calendar, Loader2, AlertCircle } from "lucide-react";
import { formatQuoteRangeWholeFromValue } from "@/lib/utils";
import { PRIORITY_SERVICES } from "@shared/contentData";

interface QuoteStatusResponse {
  quoteId: string;
  status: 'received' | 'under_review' | 'contact_soon' | 'quote_ready';
  message: string;
  quote: {
    name: string;
    serviceType: string;
    city: string;
    finalQuote: string | null;
    createdAt: Date | string;
  };
  lead: {
    status: string;
    createdAt: Date | string;
  } | null;
}

function getServiceName(serviceSlug: string): string {
  const service = PRIORITY_SERVICES.find(s => s.slug === serviceSlug);
  return service ? service.name : serviceSlug.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
}

function formatDate(date: Date | string | null) {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getStatusIcon(status: QuoteStatusResponse['status']) {
  switch (status) {
    case 'received':
      return <CheckCircle2 className="h-6 w-6 text-green-600" />;
    case 'under_review':
      return <Clock className="h-6 w-6 text-blue-600 animate-spin" />;
    case 'contact_soon':
      return <Mail className="h-6 w-6 text-purple-600" />;
    case 'quote_ready':
      return <CheckCircle2 className="h-6 w-6 text-green-600" />;
  }
}

function getStatusBadgeVariant(status: QuoteStatusResponse['status']) {
  switch (status) {
    case 'received':
      return 'default';
    case 'under_review':
      return 'secondary';
    case 'contact_soon':
      return 'outline';
    case 'quote_ready':
      return 'default';
  }
}

function getStatusTitle(status: QuoteStatusResponse['status']) {
  switch (status) {
    case 'received':
      return 'Quote Request Received';
    case 'under_review':
      return 'Under Review';
    case 'contact_soon':
      return "We'll Contact You Soon";
    case 'quote_ready':
      return 'Quote Ready';
  }
}

export default function QuoteStatus() {
  const [, params] = useRoute("/quote-status/:quoteId");
  const quoteId = params?.quoteId;

  const { data, isLoading, error } = useQuery<QuoteStatusResponse>({
    queryKey: [`/api/quotes/${quoteId}/status`],
    enabled: !!quoteId,
    retry: 1,
  });

  if (!quoteId) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Invalid Quote ID</CardTitle>
              <CardDescription>Please check your quote tracking link and try again.</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                Quote Not Found
              </CardTitle>
              <CardDescription>
                We couldn't find a quote with that ID. Please check your tracking link and try again.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">Quote Status</CardTitle>
                <CardDescription className="mt-2">
                  Track the status of your quote request
                </CardDescription>
              </div>
              <Badge variant={getStatusBadgeVariant(data.status)} className="text-sm">
                {getStatusTitle(data.status)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Status Display */}
            <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="mt-1">
                {getStatusIcon(data.status)}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">{getStatusTitle(data.status)}</h3>
                <p className="text-muted-foreground">{data.message}</p>
              </div>
            </div>

            {/* Quote Details */}
            <div className="border-t pt-6">
              <h3 className="font-semibold text-lg mb-4">Quote Details</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Service Area</p>
                    <p className="font-medium">{data.quote.city}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Service Type</p>
                    <p className="font-medium">{getServiceName(data.quote.serviceType)}</p>
                  </div>
                </div>
                {data.quote.finalQuote && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Estimated Value</p>
                      <p className="font-medium text-lg text-green-600">
                        {formatQuoteRangeWholeFromValue(data.quote.finalQuote, 0.15)}
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Submitted</p>
                    <p className="font-medium">{formatDate(data.quote.createdAt)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="border-t pt-6">
              <h3 className="font-semibold text-lg mb-4">What's Next?</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                {data.status === 'received' && (
                  <p>• Your quote request has been received and is in our queue</p>
                )}
                {data.status === 'under_review' && (
                  <>
                    <p>• Our team is reviewing your property details</p>
                    <p>• We're preparing a customized estimate</p>
                    <p>• You'll hear from us within 24 hours</p>
                  </>
                )}
                {(data.status === 'contact_soon' || data.status === 'quote_ready') && (
                  <>
                    <p>• We'll be contacting you shortly to discuss your quote</p>
                    <p>• You can ask any questions you may have</p>
                    <p>• We'll help you schedule your service at a time that works for you</p>
                  </>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="border-t pt-6">
              <h3 className="font-semibold text-lg mb-4">Have Questions?</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a href="tel:+12083522011" className="text-primary hover:underline">
                    (208) 352-2011
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href="mailto:info@lawncarekuna.com" className="text-primary hover:underline">
                    info@lawncarekuna.com
                  </a>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
