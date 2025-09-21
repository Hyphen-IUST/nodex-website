"use client";

import React from "react";
import { Target, Heart, Shield } from "lucide-react";

export function AboutSection() {
  const coreValues = [
    {
      icon: <Target className="w-6 h-6" />,
      title: "Critical Thinking",
      description:
        "Go beyond surface-level knowledge. Understand deeply and question constructively.",
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: "Inclusivity",
      description:
        "All voices matter. Everyone, regardless of experience level, is welcome and supported.",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Responsible Innovation",
      description:
        "Build solutions that are ethical, meaningful, and driven by positive intent.",
    },
  ];

  return (
    <section id="about" className="py-20 px-6 relative">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="floating-element absolute top-10 right-10 w-16 h-16 rounded-full bg-gradient-to-r from-emerald-400/5 to-emerald-600/10 blur-xl"></div>
        <div className="floating-element absolute bottom-10 left-10 w-20 h-20 rounded-full bg-gradient-to-r from-green-400/5 to-green-600/10 blur-xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="gradient-text">What is NodeX?</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            More than a club, it&apos;s a movement driven by students, bridging
            the gap between academic theory and real-world application.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {coreValues.map((value, index) => (
            <div key={index} className="saas-card p-8 text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-primary mb-6 group-hover:scale-110 transition-transform duration-300">
                {value.icon}
              </div>
              <h3 className="text-xl font-semibold mb-4 text-foreground">
                {value.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {value.description}
              </p>
            </div>
          ))}
        </div>

        {/* Additional content section with floating icon */}
        <div className="text-center hero-glassmorphism p-12 rounded-3xl relative">
          <div className="absolute top-8 left-8 w-12 h-12 rounded-xl bg-gradient-to-r from-emerald-400/20 to-green-500/20 flex items-center justify-center">
            <div className="w-6 h-6 bg-emerald-400 rounded-full"></div>
          </div>
          <h3 className="text-3xl md:text-4xl font-bold mb-6">
            <span className="gradient-text">The NodeX Identity</span>
          </h3>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-12">
            NodeX is a vibrant, student-led technical club initiated in 2025 at
            IUST Kashmir. The club&apos;s name symbolizes its identity as a
            central &quot;node&quot; in the student network, where connections
            spark ideas, challenges drive action, and transformation becomes
            inevitable.
          </p>

          {/* Vision and Mission Cards */}
          <div className="grid lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Vision */}
            <div className="saas-card p-8 text-center">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-emerald-500/20 to-green-500/20 flex items-center justify-center mx-auto mb-6">
                <Target className="w-8 h-8 text-primary" />
              </div>
              <h4 className="text-xl font-semibold mb-4 text-green-100">
                Vision Statement
              </h4>
              <p className="text-muted-foreground leading-relaxed">
                Fostering an environment for critical-thinking and
                problem-solving to strengthen society and inspire the future
                generations.
              </p>
            </div>

            {/* Mission */}
            <div className="saas-card p-8 text-center">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-emerald-500/20 to-green-500/20 flex items-center justify-center mx-auto mb-6">
                <Heart className="w-8 h-8 text-primary" />
              </div>
              <h4 className="text-xl font-semibold mb-4 text-green-100">
                Mission Statement
              </h4>
              <div className="text-left space-y-3">
                <p className="text-muted-foreground text-sm">
                  Building technical expertise through hackathons, competitions,
                  and collaborative projects that develop industry-ready skills.
                </p>
                <p className="text-muted-foreground text-sm">
                  Fostering leadership development and self-motivation,
                  empowering individuals to drive innovation.
                </p>
                <p className="text-muted-foreground text-sm">
                  Championing responsible innovation with ethical awareness for
                  community benefit.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
