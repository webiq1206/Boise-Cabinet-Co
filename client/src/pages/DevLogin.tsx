import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { apiRequest } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";

export default function DevLogin() {
  const [, setLocation] = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<null | "admin" | "sub" | "seed">(null);

  const doLogin = async (userId: string, redirectTo: string) => {
    setError(null);
    setBusy(userId === "admin-temp-id" ? "admin" : "sub");
    try {
      await apiRequest("POST", "/api/auth/test-login", { userId });
      setLocation(redirectTo);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Login failed");
    } finally {
      setBusy(null);
    }
  };

  const seed = async () => {
    setError(null);
    setBusy("seed");
    try {
      await apiRequest("POST", "/api/dev/seed", {});
    } catch (e) {
      setError(e instanceof Error ? e.message : "Seed failed");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="container py-10 max-w-3xl" data-testid="page-dev-login">
      <Card>
        <CardHeader>
          <CardTitle>Dev QA Login</CardTitle>
          <CardDescription>
            Development-only helpers for deterministic QA. Uses server endpoint `POST /api/auth/test-login`.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-3 md:grid-cols-2">
            <Button
              onClick={() => doLogin("admin-temp-id", "/admin/dashboard")}
              disabled={!!busy}
              data-testid="button-dev-login-admin"
            >
              {busy === "admin" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in…
                </>
              ) : (
                "Login as Admin"
              )}
            </Button>

            <Button
              variant="outline"
              onClick={() => doLogin("sub-temp-id", "/subcontractor/portal")}
              disabled={!!busy}
              data-testid="button-dev-login-sub"
            >
              {busy === "sub" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in…
                </>
              ) : (
                "Login as Subcontractor"
              )}
            </Button>
          </div>

          <div className="pt-2 border-t">
            <Button
              variant="secondary"
              onClick={seed}
              disabled={!!busy}
              data-testid="button-dev-seed"
            >
              {busy === "seed" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Seeding…
                </>
              ) : (
                "Seed sample leads (admin required)"
              )}
            </Button>
            <p className="text-sm text-muted-foreground mt-2">
              Seed creates 3 leads: pending admin, available, and purchased (owned by `sub-temp-id`).
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

