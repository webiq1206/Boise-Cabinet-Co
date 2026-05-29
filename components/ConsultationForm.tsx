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
import { CheckCircle2, ArrowRight } from "lucide-react";

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

function formatCurrency(n: number) {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `$${Math.round(n / 1000)}k`;
  return `$${n.toLocaleString()}`;
}

interface EstimateData {
  project: string;
  finish: string;
  priceLow: number;
  priceHigh: number;
  roi: number;
}

export function ConsultationForm() {
  const [estimate, setEstimate] = useState<EstimateData | null>(null);
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
        const parsed: EstimateData = JSON.parse(raw);
        setEstimate(parsed);
        if (parsed.project) {
          form.setValue("projectType", parsed.project, { shouldValidate: false });
        }
      }
    } catch {}
  }, [form]);

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const payload = { ...data, estimate };
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
        <div
          className="w-10 h-10 rounded-sm flex items-center justify-center"
          style={{ background: "rgba(153,159,147,0.12)" }}
        >
          <CheckCircle2 className="h-5 w-5" style={{ color: "#999F93" }} />
        </div>
        <h3 className="font-serif font-light text-2xl" style={{ color: "#3A3E3D" }}>
          We&apos;ll be in touch shortly.
        </h3>
        <p className="text-sm leading-relaxed" style={{ color: "#6E736F" }}>
          Thank you for reaching out. We typically respond within one business day to
          schedule your free in-home visit.
        </p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
        className="space-y-5"
      >
        {/* Estimate summary */}
        {estimate && (
          <div
            className="rounded-sm p-4 text-sm"
            style={{
              background: "rgba(153,159,147,0.06)",
              border: "1px solid rgba(153,159,147,0.15)",
            }}
          >
            <p className="font-medium mb-1" style={{ color: "#3A3E3D" }}>
              Estimate from calculator:
            </p>
            <p style={{ color: "#6E736F" }}>
              {PROJECT_OPTIONS.find((p) => p.value === estimate.project)?.label} —{" "}
              {formatCurrency(estimate.priceLow)} – {formatCurrency(estimate.priceHigh)}
            </p>
          </div>
        )}

        {mutation.isError && (
          <div
            className="rounded-sm p-4 text-sm"
            style={{
              background: "rgba(180,60,50,0.06)",
              border: "1px solid rgba(180,60,50,0.20)",
              color: "#B43C32",
            }}
          >
            {(mutation.error as Error).message || "Something went wrong. Please try again."}
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs tracking-wide font-medium uppercase" style={{ color: "#6E736F" }}>
                  Full name
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Jane Smith"
                    data-testid="input-name"
                    style={{ background: "#E2DED2", border: "1px solid rgba(58,62,61,0.15)", borderRadius: "2px" }}
                    {...field}
                  />
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
                <FormLabel className="text-xs tracking-wide font-medium uppercase" style={{ color: "#6E736F" }}>
                  Phone
                </FormLabel>
                <FormControl>
                  <Input
                    type="tel"
                    placeholder="(208) 555-0000"
                    data-testid="input-phone"
                    style={{ background: "#E2DED2", border: "1px solid rgba(58,62,61,0.15)", borderRadius: "2px" }}
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
                <FormLabel className="text-xs tracking-wide font-medium uppercase" style={{ color: "#6E736F" }}>
                  Email
                </FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="jane@example.com"
                    data-testid="input-email"
                    style={{ background: "#E2DED2", border: "1px solid rgba(58,62,61,0.15)", borderRadius: "2px" }}
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
                <FormLabel className="text-xs tracking-wide font-medium uppercase" style={{ color: "#6E736F" }}>
                  ZIP code
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="83706"
                    maxLength={5}
                    data-testid="input-zip"
                    style={{ background: "#E2DED2", border: "1px solid rgba(58,62,61,0.15)", borderRadius: "2px" }}
                    {...field}
                  />
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
              <FormLabel className="text-xs tracking-wide font-medium uppercase" style={{ color: "#6E736F" }}>
                What are you planning to remodel?
              </FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger
                    data-testid="select-project-type"
                    style={{ background: "#E2DED2", border: "1px solid rgba(58,62,61,0.15)", borderRadius: "2px" }}
                  >
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
              <FormLabel className="text-xs tracking-wide font-medium uppercase" style={{ color: "#6E736F" }}>
                Anything else we should know?{" "}
                <span className="normal-case" style={{ color: "rgba(124,129,126,0.7)" }}>
                  (optional)
                </span>
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us a little about your home, your vision, or your timeline..."
                  rows={4}
                  data-testid="textarea-message"
                  style={{ background: "#E2DED2", border: "1px solid rgba(58,62,61,0.15)", borderRadius: "2px" }}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-medium rounded-sm"
            style={{
              background: "#3A3E3D",
              color: "#FFFFFF",
              opacity: mutation.isPending ? 0.65 : 1,
              cursor: mutation.isPending ? "not-allowed" : "pointer",
            }}
            data-testid="button-submit-consultation"
          >
            {mutation.isPending ? "Sending…" : "Send my request"}
            {!mutation.isPending && <ArrowRight className="h-4 w-4" />}
          </button>
          <p className="text-xs" style={{ color: "#6E736F" }}>
            No spam. Response within one business day.
          </p>
        </div>
      </form>
    </Form>
  );
}
