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
        "All voices matter. Everyone, regardless of experience level, is welcome and supported.",
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
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <Info className="w-8 h-8 mr-3 text-primary" />
            <h2 className="text-4xl md:text-5xl font-bold">What is NodeX?</h2>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            More than a club, it&apos;s a movement driven by students, bridging
            the gap between academic theory and real-world application
          </p>
        </div>

        {/* Main Content */}
        <div className="mb-20">
          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            {/* Main Description */}
            <div className="lg:col-span-2 space-y-6">
              <div className="prose prose-lg max-w-none">
                <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                  NodeX is a vibrant, student-led technical club initiated in
                  the year 2025 at the Department of Computer Science and
                  Engineering, Islamic University of Science and Technology
                  (IUST), Kashmir.
                </p>

                <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                  At its heart, NodeX is more than a club, it&apos;s a movement
                  driven by students, aiming to bridge the gap between academic
                  theory and real-world application through a culture of
                  innovation, collaboration, and shared growth.
                </p>

                <p className="text-lg text-muted-foreground leading-relaxed">
                  NodeX was born out of the need for a platform where students
                  could take initiative, solve meaningful problems, and build
                  projects that have both technical depth and societal
                  relevance. It empowers students to become leaders, builders,
                  and thinkers equipped not just with coding skills, but with a
                  mindset that embraces complexity, thrives on teamwork, and
                  values ethical development.
                </p>
              </div>
            </div>

            {/* Identity Card */}
            <div className="lg:col-span-1">
              <div className="bg-card p-6 rounded-lg border border-border shadow-sm h-fit">
                <h3 className="text-xl font-semibold mb-4 text-foreground">
                  The NodeX Identity
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  The club&apos;s name itself, &quot;NodeX,&quot; symbolizes its
                  identity as a central &quot;node&quot; in the student network,
                  where connections spark ideas, challenges drive action, and
                  transformation becomes inevitable.
                </p>
                <div className="p-4 bg-primary/10 rounded-lg border-l-4 border-primary">
                  <p className="text-sm font-medium text-primary mb-1">
                    Founded
                  </p>
                  <p className="text-lg font-bold text-foreground">2025</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Core Values */}
        <div>
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold mb-4">
              Core Values of NodeX
            </h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The principles that guide our community and drive our mission
              forward
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {coreValues.map((value, index) => (
              <Card
                key={index}
                className="border-border hover:shadow-lg transition-all duration-300 group"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start space-x-4">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300 flex-shrink-0">
                      {value.icon}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-3 group-hover:text-primary transition-colors duration-300">
                        {value.title}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-muted-foreground leading-relaxed">
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
