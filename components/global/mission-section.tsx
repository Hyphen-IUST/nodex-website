"use client";

import React from "react";
import { Target } from "lucide-react";

export function MissionSection() {
  return (
    <section className="py-16 px-6 bg-muted/50">
      <div className="max-w-4xl mx-auto text-center">
        <div className="flex items-center justify-center mb-6">
          <Target className="w-6 h-6 mr-3" />
          <h2 className="text-2xl font-bold">Mission Statement</h2>
        </div>
        <p className="text-lg text-muted-foreground leading-relaxed">
          To cultivate a dynamic community where students grow as ethical
          technologists, problem-solvers, and future scholars—through
          collaborative learning, real-world projects, and peer-driven
          mentorship.
        </p>
      </div>
    </section>
  );
}
