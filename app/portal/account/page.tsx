"use client";

import { PortalShell } from "@/components/portal/PortalShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";

export default function PortalAccountPage() {
  const { user, isLoading } = useAuth();

  return (
    <PortalShell variant="customer" title="Account">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h2 className="text-xl font-serif tracking-tight">
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
            {isLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First name</Label>
                    <Input id="firstName" defaultValue={user?.firstName ?? ""} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last name</Label>
                    <Input id="lastName" defaultValue={user?.lastName ?? ""} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue={user?.email ?? ""} readOnly />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" type="tel" defaultValue={user?.phone ?? ""} />
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="brand" disabled>
                    Save changes
                  </Button>
                  <Badge variant="outline">Profile editing coming soon</Badge>
                </div>
              </>
            )}
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
                  <Switch id={pref.id} defaultChecked={index < 3} disabled />
                </div>
              </div>
            ))}
            <p className="text-sm text-muted-foreground">Notification preferences will be saved in a future update.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Security</CardTitle>
            <CardDescription>Manage your login credentials</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              You sign in with a secure link sent to your email. Contact us if you need to
              update your login address.
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
