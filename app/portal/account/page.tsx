"use client";

import { PortalShell } from "@/components/portal/PortalShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { SITE_CONFIG } from "@/shared/siteConfig";

export default function PortalAccountPage() {
  return (
    <PortalShell variant="customer" title="Account">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h2 className="text-xl font-sans font-light tracking-tight">
            Account <em className="brc-accent text-accent">settings</em>
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your profile and notification preferences
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Profile</CardTitle>
            <CardDescription>Your contact information on file</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First name</Label>
                <Input id="firstName" defaultValue="Jamie" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input id="lastName" defaultValue="Anderson" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue="jamie.anderson@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" type="tel" defaultValue={SITE_CONFIG.phone} />
            </div>
            <Button variant="brand" disabled>
              Save changes
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notifications</CardTitle>
            <CardDescription>Choose how we keep you updated</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { id: "email-updates", label: "Project updates", description: "Stage changes, milestones, and timeline shifts" },
              { id: "email-messages", label: "New messages", description: "When your project team sends a message" },
              { id: "email-invoices", label: "Invoices & payments", description: "New invoices and payment confirmations" },
              { id: "sms-urgent", label: "SMS for urgent items", description: "Action-required alerts via text message" },
            ].map((pref, index) => (
              <div key={pref.id}>
                {index > 0 && <Separator className="mb-4" />}
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <Label htmlFor={pref.id} className="font-medium">
                      {pref.label}
                    </Label>
                    <p className="text-sm text-muted-foreground">{pref.description}</p>
                  </div>
                  <Switch id={pref.id} defaultChecked={index < 3} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Security</CardTitle>
            <CardDescription>Manage your login credentials</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              You sign in with a secure link sent to your email. Contact {SITE_CONFIG.email} if
              you need to update your login address.
            </p>
            <Button variant="outline" asChild>
              <a href="/api/logout">Sign out</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </PortalShell>
  );
}
