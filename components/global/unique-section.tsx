"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function UniqueSection() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <div>
            <h2 className="text-4xl font-bold mb-8">What Makes NodeX Unique</h2>
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold mb-3">Hybrid Model</h3>
                <p className="text-muted-foreground">
                  Bridges practical software development with academic research
                  prep — a rare combination in college tech clubs.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3">
                  Meritocratic Structure
                </h3>
                <p className="text-muted-foreground">
                  Clear roles, growth paths, and recognition for all
                  contributors regardless of background.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3">
                  Open Source Culture
                </h3>
                <p className="text-muted-foreground">
                  All club knowledge bases, code, and tools are maintained
                  publicly for the community.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3">
                  Community-first Philosophy
                </h3>
                <p className="text-muted-foreground">
                  Peer-to-peer mentoring, doubt-solving pods, and a no-judgment
                  zone for beginners.
                </p>
              </div>
            </div>
          </div>
          <div>
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-xl">Our Philosophy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-6 bg-muted rounded-lg">
                  <p className="text-lg font-medium mb-2">
                    &quot;Code. Research. Rise.&quot;
                  </p>
                </div>
                <div className="p-6 bg-muted rounded-lg">
                  <p className="text-lg font-medium mb-2">
                    &quot;From Terminal to Thesis&quot;
                  </p>
                </div>
                <div className="p-6 bg-muted rounded-lg">
                  <p className="text-lg font-medium mb-2">
                    &quot;A Node in Every Network&quot;
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
