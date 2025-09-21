"use client";

import React from "react";
import { Target, Eye } from "lucide-react";

export function VisionMissionSection() {
  return (
    <section className="py-20 px-6 relative">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="floating-element absolute top-10 right-10 w-16 h-16 rounded-full bg-gradient-to-r from-emerald-400/5 to-emerald-600/10 blur-xl"></div>
        <div className="floating-element absolute bottom-10 left-10 w-20 h-20 rounded-full bg-gradient-to-r from-green-400/5 to-green-600/10 blur-xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="gradient-text">Vision & Mission</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Our guiding principles that shape everything we do
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Vision */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <Eye className="w-8 h-8 mr-3 text-primary" />
              <h3 className="text-2xl md:text-3xl font-bold">
                Vision Statement
              </h3>
            </div>
            <div className="saas-card p-8">
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
              <h3 className="text-2xl md:text-3xl font-bold">
                Mission Statement
              </h3>
            </div>
            <div className="saas-card p-8">
              <h4 className="text-xl font-semibold mb-4 text-primary">
                NodeX: Think. Solve. Transform.
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
