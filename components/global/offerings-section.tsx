"use client";

import React from "react";
import { Wrench, Zap, Rocket } from "lucide-react";

export function OfferingsSection() {
  const offerings = [
    {
      icon: <Wrench className="w-8 h-8 text-primary" />,
      title: "Workshops",
      description:
        "Practical sessions covering diverse engineering disciplines - from software and electronics to mechanical design, automation, and emerging technologies.",
    },
    {
      icon: <Zap className="w-8 h-8 text-primary" />,
      title: "Hackathons",
      description:
        "Team-based problem-solving sprints that simulate real-world engineering challenges.",
    },
    {
      icon: <Rocket className="w-8 h-8 text-primary" />,
      title: "Project Incubation",
      description:
        "Students can form teams to build and showcase innovative tech solutions.",
    },
  ];

  return (
    <section id="offerings" className="py-20 px-6 relative">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="floating-element absolute top-10 right-10 w-16 h-16 rounded-full bg-gradient-to-r from-emerald-400/5 to-emerald-600/10 blur-xl"></div>
        <div className="floating-element absolute bottom-10 left-10 w-20 h-20 rounded-full bg-gradient-to-r from-green-400/5 to-green-600/10 blur-xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="gradient-text">What NodeX Offers</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            A broad spectrum of activities and opportunities, designed to
            encourage exploration, participation, and skill development
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {offerings.map((offering, index) => (
            <div key={index} className="saas-card p-8 group">
              <div className="mb-6 group-hover:scale-110 transition-transform duration-300">
                {offering.icon}
              </div>
              <h3 className="text-xl font-semibold mb-4 text-foreground">
                {offering.title}
              </h3>
              <p className="text-muted-foreground">{offering.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
