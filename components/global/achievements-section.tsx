"use client";

import React from "react";
import { Trophy, Award, Star, TrendingUp, Users, Code } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function AchievementsSection() {
  const achievements = [
    {
      icon: <Trophy className="w-8 h-8 text-yellow-500" />,
      title: "National Recognition",
      description:
        "Winner of 3 National Hackathons including Smart India Hackathon",
      highlight: "Top 1% Performance",
      year: "2024-25",
    },
    {
      icon: <Award className="w-8 h-8 text-blue-500" />,
      title: "Industry Partnerships",
      description:
        "Official partnerships with leading tech companies and open-source foundations",
      highlight: "5+ Major Partners",
      year: "Ongoing",
    },
    {
      icon: <Star className="w-8 h-8 text-purple-500" />,
      title: "Student Impact",
      description:
        "95% placement rate for active members in top tech companies",
      highlight: "95% Success Rate",
      year: "2024",
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-green-500" />,
      title: "Project Excellence",
      description:
        "50+ open-source projects with 10K+ GitHub stars collectively",
      highlight: "10K+ Stars",
      year: "Cumulative",
    },
    {
      icon: <Users className="w-8 h-8 text-orange-500" />,
      title: "Community Growth",
      description: "Fastest growing tech club in J&K with 500+ active members",
      highlight: "500+ Members",
      year: "2024",
    },
    {
      icon: <Code className="w-8 h-8 text-red-500" />,
      title: "Technical Leadership",
      description:
        "Leading contributors to major open-source projects and research",
      highlight: "Elite Contributors",
      year: "Ongoing",
    },
  ];

  return (
    <section className="py-20 px-6 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 text-yellow-700 dark:text-yellow-300 border-yellow-500/30">
            🏆 Excellence & Recognition
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Why NodeX Leads
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Numbers don&apos;t lie. Here&apos;s what sets us apart from every
            other tech club in the region.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {achievements.map((achievement, index) => (
            <div
              key={index}
              className="saas-card hover:shadow-2xl transition-all duration-500 group hover:scale-105 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="pb-3 relative p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-muted/50 rounded-lg group-hover:bg-primary/10 transition-colors duration-300">
                    {achievement.icon}
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {achievement.year}
                  </Badge>
                </div>
                <h3 className="text-xl font-bold group-hover:text-primary transition-colors duration-300 text-green-100">
                  {achievement.title}
                </h3>
                <div className="text-2xl font-bold text-primary mb-2">
                  {achievement.highlight}
                </div>
                <p className="text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                  {achievement.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 p-8 rounded-2xl border border-primary/20">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Ready to be part of something extraordinary?
            </h3>
            <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
              Join the most innovative tech community in Kashmir and accelerate
              your journey to becoming an industry leader.
            </p>
            <Badge className="bg-gradient-to-r from-primary to-secondary text-white px-6 py-2 text-base font-semibold">
              Applications Open - Limited Seats
            </Badge>
          </div>
        </div>
      </div>
    </section>
  );
}
