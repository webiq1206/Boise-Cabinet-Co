"use client";

import Link from "next/link";
import { useState } from "react";
import { useDesignStudio } from "../DesignStudioProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SITE_CONFIG } from "@/shared/siteConfig";
import { CheckCircle2, Copy, RotateCcw, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function SaveStep() {
  const { design, updateDesign, resetDesign, saveDesign, submitPricingRequest, isSaving } =
    useDesignStudio();
  const { toast } = useToast();
  const [name, setName] = useState(design.designName || `My ${design.roomType ?? "cabinet"} design`);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [saved, setSaved] = useState(!!design.savedDesignId);

  const handleSave = async () => {
    updateDesign({ designName: name });
    const result = await saveDesign();
    if (result) {
      setSaved(true);
      toast({ title: "Design saved", description: "Your design has been saved. Request pricing below." });
    } else {
      toast({ title: "Could not save", description: "Please try again.", variant: "destructive" });
    }
  };

  const handlePricing = async () => {
    if (!contactName || !contactEmail || !contactPhone) {
      toast({ title: "Contact info required", variant: "destructive" });
      return;
    }
    if (!saved && !design.savedDesignId) {
      await handleSave();
    }
    const ok = await submitPricingRequest({
      name: contactName,
      email: contactEmail,
      phone: contactPhone,
      message: contactMessage,
    });
    if (ok) {
      toast({
        title: "Pricing request sent",
        description: `${SITE_CONFIG.name} will contact you within one business day.`,
      });
    }
  };

  const shareUrl =
    design.shareToken && typeof window !== "undefined"
      ? `${window.location.origin}/design-studio?share=${design.shareToken}`
      : null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-sans font-light tracking-tight">
          Save & request <em className="brc-accent text-accent">pricing</em>
        </h2>
        <p className="text-muted-foreground mt-2">
          Save your design and our team will prepare a detailed quote.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            {saved ? (
              <CheckCircle2 className="h-5 w-5 text-primary" />
            ) : null}
            {saved ? "Design saved" : "Save your design"}
          </CardTitle>
          <CardDescription>Name your design and save it for reference.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="designName">Design name</Label>
            <Input
              id="designName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Kitchen v1 — White Oak"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="brand" onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Save design
            </Button>
            {shareUrl && (
              <Button
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(shareUrl);
                  toast({ title: "Link copied" });
                }}
              >
                <Copy className="h-4 w-4" />
                Copy share link
              </Button>
            )}
            <Button variant="ghost" onClick={resetDesign}>
              <RotateCcw className="h-4 w-4" />
              Start over
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Request pricing</CardTitle>
          <CardDescription>
            We&apos;ll review your design and schedule a free consultation.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contactName">Name</Label>
              <Input id="contactName" value={contactName} onChange={(e) => setContactName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactPhone">Phone</Label>
              <Input id="contactPhone" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactEmail">Email</Label>
            <Input id="contactEmail" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactMessage">Notes (optional)</Label>
            <Textarea id="contactMessage" value={contactMessage} onChange={(e) => setContactMessage(e.target.value)} rows={3} />
          </div>
          <Button variant="brand" onClick={handlePricing} disabled={isSaving || design.pricingSubmitted}>
            {design.pricingSubmitted ? "Request submitted" : "Request pricing"}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-dashed">
        <CardContent className="py-8 text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            Track your project in the client portal after we create your project file.
          </p>
          <Button variant="brandOutline" asChild>
            <Link href="/portal">Go to My Project</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
