"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wrench, Clock, Github, Mail } from "lucide-react";

export default function MaintenancePage() {
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
          NodeX is currently undergoing scheduled maintenance. We&apos;ll be
          back online shortly.
        </p>

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
                <a href="mailto:nodex@iust.cc">
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
                  href="https://github.com/nodeX-iust"
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
