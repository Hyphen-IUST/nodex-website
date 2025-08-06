"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Key, Users, Shield } from "lucide-react";

export default function MemberLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [key, setKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if already authenticated
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/member-auth-check");
        const data = await response.json();
        if (data.authenticated) {
          router.push("/member-dashboard");
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      }
    };

    checkAuth();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!key.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter your authentication key",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/member-auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ key: key.trim() }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Login Successful",
          description: `Welcome, ${data.member.name}!`,
        });
        router.push("/member-dashboard");
      } else {
        toast({
          variant: "destructive",
          title: "Authentication Failed",
          description: data.error || "Invalid authentication key",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred during authentication",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-muted rounded-full">
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Member Dashboard
          </h1>
          <p className="text-muted-foreground">
            Sign in with your authentication key to access member resources
          </p>
        </div>

        {/* Login Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Member Authentication
            </CardTitle>
            <CardDescription>
              Enter your member authentication key to access your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="key" className="flex items-center gap-2">
                  <Key className="w-4 h-4" />
                  Authentication Key
                </Label>
                <div className="relative">
                  <Input
                    id="key"
                    type={showKey ? "text" : "password"}
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    placeholder="Enter your authentication key"
                    className="pr-10"
                    required
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowKey(!showKey)}
                    disabled={loading}
                  >
                    {showKey ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Authenticating..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Info */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-3">
              <h3 className="font-medium text-foreground">
                What can members access?
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• View your teams and team members</li>
                <li>• Access learning resources and materials</li>
                <li>• Request new resources from administrators</li>
                <li>• View your profile and member information</li>
                <li>• Track your activity and engagement</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            Don&apos;t have an authentication key?{" "}
            <span className="text-muted-foreground">
              Contact your team administrator
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
