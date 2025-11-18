import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { insertQuoteSchema, type InsertQuote } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface QuoteFormProps {
  className?: string;
  compact?: boolean;
  preselectedService?: string;
  preselectedCity?: string;
}

export function QuoteForm({ className, compact = false, preselectedService, preselectedCity }: QuoteFormProps) {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<InsertQuote>({
    resolver: zodResolver(insertQuoteSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      serviceType: preselectedService || "",
      propertyType: "",
      propertySize: "",
      city: preselectedCity || "",
      message: "",
    },
  });

  const submitQuoteMutation = useMutation({
    mutationFn: async (data: InsertQuote) => {
      const response = await apiRequest("POST", "/api/quotes", data);
      return response;
    },
    onSuccess: () => {
      setSubmitted(true);
      form.reset();
      toast({
        title: "Quote Requested!",
        description: "We'll contact you within 24 hours.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Please try again or call us at (208) 352-2011",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: InsertQuote) => {
    submitQuoteMutation.mutate(data);
  };

  if (submitted) {
    return (
      <Card className={className}>
        <CardContent className="p-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2">Thank You!</h3>
              <p className="text-muted-foreground">
                We've received your quote request and will contact you within 24 hours.
              </p>
            </div>
            <div className="pt-4">
              <p className="text-sm text-muted-foreground mb-2">Need immediate assistance?</p>
              <a href="tel:2083522011">
                <Button>Call (208) 352-2011</Button>
              </a>
            </div>
            <Button
              variant="outline"
              onClick={() => setSubmitted(false)}
              className="mt-4"
            >
              Submit Another Request
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-2xl">Get Your Free Quote</CardTitle>
        <CardDescription>
          No obligation. We'll get back to you within 24 hours.
        </CardDescription>
        <div className="flex items-center gap-2 pt-2">
          <Badge variant="outline" className="gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Free Quote
          </Badge>
          <Badge variant="outline" className="gap-1">
            <CheckCircle2 className="h-3 w-3" />
            No Hidden Fees
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Smith" {...field} data-testid="input-name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="john@example.com" {...field} data-testid="input-email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="(208) 555-1234" {...field} data-testid="input-phone" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="serviceType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-service">
                        <SelectValue placeholder="Select a service" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="lawn-mowing">Lawn Mowing</SelectItem>
                      <SelectItem value="lawn-maintenance">Lawn Maintenance</SelectItem>
                      <SelectItem value="aeration">Aeration & Overseeding</SelectItem>
                      <SelectItem value="fertilization">Fertilization</SelectItem>
                      <SelectItem value="weed-control">Weed Control</SelectItem>
                      <SelectItem value="landscaping">Landscaping</SelectItem>
                      <SelectItem value="patio">Patio Installation</SelectItem>
                      <SelectItem value="retaining-walls">Retaining Walls</SelectItem>
                      <SelectItem value="pond">Pond/Water Features</SelectItem>
                      <SelectItem value="fence">Fence Installation</SelectItem>
                      <SelectItem value="irrigation">Irrigation Systems</SelectItem>
                      <SelectItem value="christmas-lights">Christmas Lights</SelectItem>
                      <SelectItem value="hoa">HOA Services</SelectItem>
                      <SelectItem value="commercial">Commercial Services</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="propertyType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-property-type">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="residential">Residential</SelectItem>
                        <SelectItem value="commercial">Commercial</SelectItem>
                        <SelectItem value="hoa">HOA</SelectItem>
                        <SelectItem value="property-management">Property Management</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="propertySize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Size (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 5000 sq ft" {...field} data-testid="input-property-size" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-city">
                        <SelectValue placeholder="Select your city" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="kuna">Kuna</SelectItem>
                      <SelectItem value="boise">Boise</SelectItem>
                      <SelectItem value="meridian">Meridian</SelectItem>
                      <SelectItem value="nampa">Nampa</SelectItem>
                      <SelectItem value="caldwell">Caldwell</SelectItem>
                      <SelectItem value="eagle">Eagle</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!compact && (
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Details (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us about your project..."
                        className="resize-none"
                        rows={4}
                        {...field}
                        data-testid="textarea-message"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {submitQuoteMutation.isError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Failed to submit quote request. Please try again or call (208) 352-2011.
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={submitQuoteMutation.isPending}
              data-testid="button-submit-quote"
            >
              {submitQuoteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Request Free Quote"
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              By submitting this form, you agree to be contacted by Lawn Care Kuna
            </p>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
