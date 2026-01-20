import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Lock, ArrowRight, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface UserData {
  id: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
}

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const [checkingAuth, setCheckingAuth] = useState(true);

  const { data: user, isLoading, isError } = useQuery<UserData>({
    queryKey: ["/api/auth/user"],
    retry: false,
    staleTime: 0,
  });

  useEffect(() => {
    if (!isLoading) {
      // If user is already logged in as admin, redirect to dashboard
      if (user && user.role === "admin") {
        setLocation("/admin/dashboard");
      }
      setCheckingAuth(false);
    }
  }, [user, isLoading, setLocation]);

  const handleLogin = () => {
    // Pass returnTo parameter so server knows user came from admin login
    window.location.href = "/api/login?returnTo=/admin";
  };

  if (checkingAuth || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Shield className="w-12 h-12 text-primary animate-pulse" />
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // User is logged in but doesn't have admin role
  const isLoggedInButNotAdmin = user && user.role !== "admin";

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center p-4" data-testid="page-admin-login">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Admin Access</CardTitle>
          <CardDescription>
            Lawn Care Kuna administrative portal
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoggedInButNotAdmin ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Your account does not have admin access. Please contact the site administrator if you believe this is an error.
              </AlertDescription>
            </Alert>
          ) : null}

          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Lock className="w-4 h-4" />
              <span>Secure login via Google</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Only authorized administrators can access this portal. Login with your approved Google account to continue.
            </p>
          </div>

          <Button 
            onClick={handleLogin} 
            className="w-full" 
            size="lg"
            data-testid="button-admin-login"
          >
            Login with Google
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Need access? Contact the site administrator.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
