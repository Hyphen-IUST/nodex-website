"use client";

import React from "react";
import { Info, Target, Heart, BookOpen, Users, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
        "All voices matter. Everyone—regardless of experience—is welcome and supported.",
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Collaboration",
      description:
        "Growth comes from working together. We build projects and share success as a team.",
    },
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: "Lifelong Learning",
      description:
        "Embrace curiosity. Be open to learning, unlearning, and relearning.",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Responsible Innovation",
      description:
        "Build solutions that are ethical, meaningful, and driven by positive intent.",
    },
  ];

  return (
    <section id="about" className="py-20 px-6 bg-muted/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <Info className="w-8 h-8 mr-3" />
            <h2 className="text-4xl md:text-5xl font-bold">What is NodeX?</h2>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            More than a club&mdash;it&rsquo;s a movement driven by students,
            bridging the gap between academic theory and real-world application
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          <div className="space-y-6">
            <p className="text-lg text-muted-foreground leading-relaxed">
              NodeX is a vibrant, student-led technical club initiated in the
              year 2025 at the Department of Computer Science and Engineering,
              Islamic University of Science and Technology (IUST), Kashmir. At
              its heart, NodeX is more than a club&mdash;it&rsquo;s a movement
              driven by students, aiming to bridge the gap between academic
              theory and real-world application through a culture of innovation,
              collaboration, and shared growth.
            </p>

            <p className="text-lg text-muted-foreground leading-relaxed">
              NodeX was born out of the need for a platform where students could
              take initiative, solve meaningful problems, and build projects
              that have both technical depth and societal relevance. It empowers
              students to become leaders, builders, and thinkers—equipped not
              just with coding skills, but with a mindset that embraces
              complexity, thrives on teamwork, and values ethical development.
            </p>
          </div>

          <div className="bg-card p-6 rounded-lg border border-border">
            <h3 className="text-xl font-semibold mb-4 text-foreground">
              The NodeX Identity
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              The club&rsquo;s name
              itself&mdash;&ldquo;NodeX&rdquo;&mdash;symbolizes its identity as
              a central &ldquo;node&rdquo; in the student network, where
              connections spark ideas, challenges drive action, and
              transformation becomes inevitable.
            </p>
            <div className="mt-6 p-4 bg-primary/10 rounded-lg">
              <p className="text-sm font-medium text-primary">Founded: 2025</p>
            </div>
          </div>
        </div>

        {/* Core Values */}
        <div className="mb-16">
          <h3 className="text-2xl md:text-3xl font-bold text-center mb-12">
            Core Values of NodeX
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coreValues.map((value, index) => (
              <Card
                key={index}
                className="border-border hover:shadow-lg transition-shadow"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    <div className="text-primary">{value.icon}</div>
                    <CardTitle className="text-lg">{value.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
