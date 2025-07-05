"use client";

import React from "react";
import { Wrench, Zap, Rocket, Mic, Users, Globe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function OfferingsSection() {
  const offerings = [
    {
      icon: <Wrench className="w-8 h-8 text-primary" />,
      title: "Workshops",
      description:
        "Practical sessions on Web Dev, Git, AI/ML, DSA, Linux, and more to build hands-on technical skills.",
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
    {
      icon: <Mic className="w-8 h-8 text-primary" />,
      title: "Speaker Sessions",
      description:
        "Talks and Q&As with industry professionals, alumni, and technologists.",
    },
    {
      icon: <Users className="w-8 h-8 text-primary" />,
      title: "Peer Mentoring",
      description:
        "Juniors get guidance from seniors on career planning, programming, and open-source.",
    },
    {
      icon: <Globe className="w-8 h-8 text-primary" />,
      title: "Collaborations",
      description:
        "Cross-club events, university outreach, and networking partnerships.",
    },
  ];

  return (
    <section id="offerings" className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            What NodeX Offers
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            A broad spectrum of activities and opportunities, designed to
            encourage exploration, participation, and skill development
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {offerings.map((offering, index) => (
            <Card
              key={index}
              className="border-border hover:shadow-lg transition-shadow"
            >
              <CardHeader className="pb-3">
                <div className="mb-4">{offering.icon}</div>
                <CardTitle className="text-xl">{offering.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{offering.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
