"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "../../../components/global/header";
import { Footer } from "../../../components/global/footer";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Shield, AlertCircle, Key } from "lucide-react";

export default function ExecutiveLoginPage() {
  const router = useRouter();
  const [authKey, setAuthKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const checkExistingAuth = async () => {
    try {
      const response = await fetch("/api/auth-check");
      const data = await response.json();

      if (data.authenticated) {
        // User is already authenticated, redirect to exec dashboard
        router.push("/exec-dashboard");
      }
    } catch (error) {
      console.error("Auth check failed:", error);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  useEffect(() => {
    // Check if user is already authenticated
    checkExistingAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clearCookies = () => {
    // Clear auth-key cookie by setting it to expire
    document.cookie =
      "auth-key=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!authKey.trim()) {
      setError("Please enter your auth key");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ authKey: authKey.trim() }),
      });

      const data = await response.json();

      if (data.success) {
        // Login successful, redirect to exec dashboard
        router.push("/exec-dashboard");
      } else {
        // Login failed
        setError(data.message || "Invalid auth key");
        clearCookies(); // Clear any existing invalid cookies
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("An error occurred during login. Please try again.");
      clearCookies();
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <div className="pt-24 pb-20 px-6">
        <div className="max-w-md mx-auto">
          {/* Page Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-full mx-auto mb-4 flex items-center justify-center">
              <Shield className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Executive Member Login</h1>
            <p className="text-muted-foreground">
              Enter your authentication key to access the executive dashboard
            </p>
          </div>

          {/* Login Card */}
          <Card className="border-border shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                Authentication Required
              </CardTitle>
              <CardDescription>
                Only authorized recruiters can access the application management
                system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="authKey">Authentication Key</Label>
                  <Input
                    id="authKey"
                    type="password"
                    placeholder="Enter your auth key"
                    value={authKey}
                    onChange={(e) => setAuthKey(e.target.value)}
                    disabled={isLoading}
                    className="w-full"
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                    <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                    <span className="text-sm text-destructive">{error}</span>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || !authKey.trim()}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Authenticating...
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4 mr-2" />
                      Sign In
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <Badge variant="secondary" className="text-xs">
                  Secure Authentication
                </Badge>
                <p className="text-xs text-muted-foreground mt-2">
                  Your session will be securely stored and automatically expire
                  after 7 days
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Help Text */}
          <div className="mt-8 text-center">
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-2">Need Access?</h3>
                <p className="text-sm text-muted-foreground">
                  Contact the NodeX executive team to obtain your recruiter
                  authentication key. Only authorized personnel are granted
                  access to the application management system.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
