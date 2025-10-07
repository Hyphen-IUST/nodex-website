"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Wrench, Clock, Github, Mail, KeyRound, Loader2 } from "lucide-react";

export default function MaintenancePage() {
  const [authKey, setAuthKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [showStaffForm, setShowStaffForm] = useState(false);
  const { toast } = useToast();

  const handleStaffLogin = async () => {
    if (!authKey.trim()) {
      toast({
        variant: "destructive",
        title: "Auth Key Required",
        description: "Please enter your staff authentication key.",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/staff-auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ authKey }),
      });

      if (response.ok) {
        toast({
          title: "Authentication Successful",
          description: "Bypassing maintenance mode...",
        });
        // Refresh the page to reload the maintenance wrapper
        window.location.reload();
      } else {
        const data = await response.json();
        toast({
          variant: "destructive",
          title: "Authentication Failed",
          description: data.message || "Invalid authentication key.",
        });
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to authenticate. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-6">
      <div className="max-w-2xl mx-auto text-center">
        {/* Animated Icon Section */}
        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 bg-primary/10 rounded-full animate-pulse"></div>
          </div>
          <div className="relative flex items-center justify-center">
            <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center animate-bounce">
              <Wrench className="w-12 h-12 text-primary-foreground" />
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex justify-center mb-6">
          <Badge variant="default" className="px-4 py-2 text-sm font-medium">
            <Clock className="w-4 h-4 mr-2" />
            Under Maintenance
          </Badge>
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          We&apos;re Under Maintenance
        </h1>

        <p className="text-xl md:text-2xl text-muted-foreground mb-12 leading-relaxed">
          Hyphen is currently undergoing scheduled maintenance. We&apos;ll be
          back online shortly.
        </p>

        {/* Staff Access Section */}
        <Card className="border-border bg-gradient-to-br from-background via-background to-muted/10 mb-8">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold mb-4">Staff Access</h2>
            <p className="text-muted-foreground mb-6">
              Staff members can bypass maintenance mode using their
              authentication key.
            </p>

            {!showStaffForm ? (
              <Button onClick={() => setShowStaffForm(true)} className="gap-2">
                <KeyRound className="w-4 h-4" />
                Staff Login
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="auth-key">Authentication Key</Label>
                  <Input
                    id="auth-key"
                    type="password"
                    placeholder="Enter your staff authentication key"
                    value={authKey}
                    onChange={(e) => setAuthKey(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="flex gap-2 justify-center">
                  <Button
                    onClick={handleStaffLogin}
                    disabled={loading}
                    className="flex items-center gap-2"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <KeyRound className="w-4 h-4" />
                    )}
                    {loading ? "Authenticating..." : "Authenticate"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowStaffForm(false);
                      setAuthKey("");
                    }}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contact Section */}
        <Card className="border-border bg-gradient-to-br from-background via-background to-muted/10">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold mb-4">
              Need Immediate Assistance?
            </h2>
            <p className="text-muted-foreground mb-6">
              If you have urgent questions or need support, our team is still
              available to help you through alternative channels.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild className="flex items-center gap-2">
                <a href="mailto:Hyphen@iust.cc">
                  <Mail className="w-4 h-4" />
                  Email Support
                </a>
              </Button>

              <Button
                variant="outline"
                asChild
                className="flex items-center gap-2"
              >
                <a
                  href="https://github.com/Hyphen-iust"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="w-4 h-4" />
                  GitHub
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
