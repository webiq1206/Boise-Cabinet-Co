"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight } from "lucide-react";
import type { StoredEstimate } from "@/shared/estimateEngine";
import { FINISH_LABELS, PROJECT_LABELS } from "@/shared/estimateEngine";

const formSchema = z.object({
  name: z.string().min(2, "Please enter your full name"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  email: z.string().email("Please enter a valid email"),
  zip: z.string().min(5, "Please enter your ZIP code"),
  projectType: z.string().min(1, "Please select a project type"),
  message: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const PROJECT_OPTIONS = [
  { value: "kitchen", label: "Kitchen Remodel" },
  { value: "bathroom", label: "Bathroom Remodel" },
  { value: "whole-home", label: "Whole-Home Remodel" },
  { value: "addition", label: "Room Addition" },
  { value: "other", label: "Other / Not sure yet" },
];

const labelClass = "text-xs tracking-wide font-medium uppercase text-muted-foreground";

function formatCurrency(n: number) {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `$${Math.round(n / 1000)}k`;
  return `$${n.toLocaleString()}`;
}

export function ConsultationForm() {
  const [estimate, setEstimate] = useState<StoredEstimate | null>(null);
  const [success, setSuccess] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      zip: "",
      projectType: "",
      message: "",
    },
  });

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("brc_estimate");
      if (raw) {
        const parsed: StoredEstimate = JSON.parse(raw);
        setEstimate(parsed);
        if (parsed.project) {
          form.setValue("projectType", parsed.project, { shouldValidate: false });
        }
      }
    } catch {}
  }, [form]);

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const payload = {
        ...data,
        estimate: estimate
          ? {
              project: estimate.project,
              finish: estimate.finish,
              priceLow: estimate.priceLow,
              priceHigh: estimate.priceHigh,
              roi: estimate.roi,
              confidence: estimate.confidenceLabel,
              sqft: estimate.sqft,
            }
          : null,
      };
      const res = await fetch("/api/consultation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Something went wrong");
      }
      return res.json();
    },
    onSuccess: () => {
      setSuccess(true);
      sessionStorage.removeItem("brc_estimate");
    },
  });

  if (success) {
    return (
      <div className="flex flex-col items-start py-8 space-y-4">
        <div className="w-10 h-10 rounded-sm flex items-center justify-center bg-accent/10">
          <CheckCircle2 className="h-5 w-5 text-accent" />
        </div>
        <h3 className="font-serif font-light text-2xl text-foreground">
          We&apos;ll be in touch shortly.
        </h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Thank you for reaching out. We typically respond within one business day to
          schedule your free in-home visit.
        </p>
      </div>
    );
  }

  const projectLabel = estimate?.project
    ? PROJECT_LABELS[estimate.project]?.label
    : null;
  const finishLabel = estimate?.finish
    ? FINISH_LABELS[estimate.finish]?.label
    : null;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
        className="space-y-5"
      >
        {estimate && (
          <div className="rounded-sm p-4 text-sm bg-accent/5 border border-accent/20">
            <p className="font-medium mb-1 text-foreground">
              Planning range from estimator:
            </p>
            <p className="text-muted-foreground">
              {projectLabel}
              {finishLabel ? ` · ${finishLabel}` : ""}
              {estimate.sqft ? ` · ${estimate.sqft.toLocaleString()} sqft` : ""}
            </p>
            <p className="font-medium mt-1 text-foreground">
              {formatCurrency(estimate.priceLow)} to {formatCurrency(estimate.priceHigh)}
            </p>
            {estimate.confidenceLabel && (
              <p className="text-xs mt-1 text-muted-foreground">
                {estimate.confidenceLabel}
              </p>
            )}
          </div>
        )}

        {mutation.isError && (
          <div className="rounded-sm p-4 text-sm bg-destructive/5 border border-destructive/20 text-destructive">
            {(mutation.error as Error).message || "Something went wrong. Please try again."}
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={labelClass}>Full name</FormLabel>
                <FormControl>
                  <Input placeholder="Jane Smith" data-testid="input-name" {...field} />
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
                <FormLabel className={labelClass}>Phone</FormLabel>
                <FormControl>
                  <Input
                    type="tel"
                    placeholder="(208) 555-0000"
                    data-testid="input-phone"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={labelClass}>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="jane@example.com"
                    data-testid="input-email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="zip"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={labelClass}>ZIP code</FormLabel>
                <FormControl>
                  <Input placeholder="83706" maxLength={5} data-testid="input-zip" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="projectType"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={labelClass}>
                What are you planning to remodel?
              </FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger data-testid="select-project-type">
                    <SelectValue placeholder="Select a project type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {PROJECT_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={labelClass}>
                Anything else we should know?{" "}
                <span className="normal-case text-muted-foreground/70">(optional)</span>
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us a little about your home, your vision, or your timeline..."
                  rows={4}
                  data-testid="textarea-message"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <Button
            type="submit"
            variant="brand"
            disabled={mutation.isPending}
            data-testid="button-submit-consultation"
          >
            {mutation.isPending ? "Sending…" : "Send my request"}
            {!mutation.isPending && <ArrowRight className="h-4 w-4" />}
          </Button>
          <p className="text-xs text-muted-foreground">
            No spam. Response within one business day.
          </p>
        </div>
      </form>
    </Form>
  );
}
