"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { PortalShell } from "@/components/portal/PortalShell";
import { SubcontractorHomeDashboard } from "@/components/subcontractor/SubcontractorHomeDashboard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, ArrowRight, CheckCircle } from "lucide-react";

export default function PartnerPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, isSubcontractor, isAdmin } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (isAuthenticated && isAdmin) {
      router.push("/admin/dashboard");
    }
  }, [isLoading, isAuthenticated, isAdmin, router]);

  const handleLogin = () => {
    window.location.href = "/api/login?returnTo=/partner";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (isAuthenticated && isSubcontractor) {
    return (
      <PortalShell variant="partner" title="Home">
        <SubcontractorHomeDashboard embedded />
      </PortalShell>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <section className="container px-4 py-16 md:py-24 max-w-3xl mx-auto text-center space-y-6">
        <Shield className="h-12 w-12 text-primary mx-auto" />
        <h1 className="text-4xl font-sans font-light tracking-tight">
          Partner <em className="brc-accent text-accent">Portal</em>
        </h1>
        <p className="text-lg text-muted-foreground">
          Access leads, manage projects, and stay compliant — all in one place.
        </p>
        <div className="space-y-3 text-left max-w-md mx-auto">
          {[
            "Browse and purchase verified remodeling leads",
            "Track active projects and contracts",
            "Upload compliance documents",
          ].map((item) => (
            <div key={item} className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-foreground/50 shrink-0" />
              <span className="text-sm">{item}</span>
            </div>
          ))}
        </div>
        <Button variant="brand" size="lg" onClick={handleLogin}>
          Sign In to Partner Portal
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </section>

      <section className="container px-4 pb-16">
        <Card className="bg-inverse border-0 text-inverse-foreground max-w-2xl mx-auto">
          <CardContent className="py-10 text-center">
            <p className="text-inverse-muted mb-6">
              Already a subcontractor? Your existing account works here too.
            </p>
            <Button variant="brandOutline" onClick={handleLogin}>
              Get Started
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
