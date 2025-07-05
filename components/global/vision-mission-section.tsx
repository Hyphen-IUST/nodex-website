"use client";

import React from "react";
import { Target, Eye } from "lucide-react";

export function VisionMissionSection() {
  return (
    <section className="py-20 px-6 bg-muted/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Vision & Mission
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Our guiding principles that shape everything we do
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Vision */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <Eye className="w-8 h-8 mr-3 text-primary" />
              <h3 className="text-2xl md:text-3xl font-bold">Our Vision</h3>
            </div>
            <div className="bg-card p-8 rounded-lg border border-border">
              <p className="text-lg text-muted-foreground leading-relaxed">
                Fostering an environment for critical-thinking and
                problem-solving to strengthen society and inspire the future
                generations.
              </p>
            </div>
          </div>

          {/* Mission */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <Target className="w-8 h-8 mr-3 text-primary" />
              <h3 className="text-2xl md:text-3xl font-bold">Our Mission</h3>
            </div>
            <div className="bg-card p-8 rounded-lg border border-border">
              <h4 className="text-xl font-semibold mb-4 text-primary">
                NodeX – Think. Solve. Transform.
              </h4>
              <div className="space-y-4 text-left">
                <p className="text-muted-foreground">
                  Building technical expertise through hackathons, competitions,
                  and collaborative projects that develop industry-ready skills.
                </p>
                <p className="text-muted-foreground">
                  Fostering leadership development and self-motivation,
                  empowering individuals to drive innovation and create
                  meaningful technological solutions.
                </p>
                <p className="text-muted-foreground">
                  Championing responsible innovation with ethical awareness,
                  ensuring all projects prioritize community benefit and
                  positive societal impact.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
