"use client";

import React from "react";
import { Code, BookOpen, Users, Zap, Github, Globe, Cpu } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function FeaturesSection() {
  const features = [
    {
      icon: <Code className="w-5 h-5" />,
      title: "Weekly Dev Sprints",
      description:
        "Hands-on sessions covering full-stack development, open-source contribution, and competitive programming",
    },
    {
      icon: <Zap className="w-5 h-5" />,
      title: "Hackathons & Code Jams",
      description:
        "Internal and inter-college events to push problem-solving and creativity to new heights",
    },
    {
      icon: <BookOpen className="w-5 h-5" />,
      title: "GATE Prep Circles",
      description:
        "Topic-wise study groups, mock tests, and comprehensive problem-solving sessions",
    },
    {
      icon: <Globe className="w-5 h-5" />,
      title: "GRE/TOEFL Support",
      description:
        "Study resources, strategy workshops, and speaking practice sessions for international studies",
    },
    {
      icon: <Github className="w-5 h-5" />,
      title: "Build-in-Public Projects",
      description:
        "Club-led repositories where students collaborate on real, deployable software solutions",
    },
    {
      icon: <Cpu className="w-5 h-5" />,
      title: "Hardware Innovation Lab",
      description:
        "Hands-on experience with Arduino, ESP32, Raspberry Pi, and IoT project development",
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: "Alumni Network",
      description:
        "Guidance from students who cracked IITs, NITs, and secured foreign MS admissions",
    },
  ];

  return (
    <section className="py-20 px-6 bg-muted/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-6">What We Offer</h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="border-border hover:shadow-lg transition-shadow duration-300"
            >
              <CardHeader className="pb-4">
                <div className="w-10 h-10 bg-foreground rounded-sm flex items-center justify-center mb-4">
                  {React.cloneElement(feature.icon, {
                    className: "w-5 h-5 text-background",
                  })}
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
