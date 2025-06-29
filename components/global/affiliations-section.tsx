"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";

export function AffiliationsSection() {
  return (
    <section className="py-16 px-6 bg-muted/50">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-2xl font-bold mb-8">Additional Partners</h2>
        <div className="flex flex-wrap justify-center gap-3">
          <Badge
            variant="outline"
            className="border-border text-muted-foreground px-4 py-2"
          >
            CodeDay
          </Badge>
          <Badge
            variant="outline"
            className="border-border text-muted-foreground px-4 py-2"
          >
            Free Software Foundation
          </Badge>
          <Badge
            variant="outline"
            className="border-border text-muted-foreground px-4 py-2"
          >
            GSoC Communities
          </Badge>
        </div>
      </div>
    </section>
  );
}
