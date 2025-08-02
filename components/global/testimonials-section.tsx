"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Quote, Star, Award, Building2, GraduationCap } from "lucide-react";

export function TestimonialsSection() {
  const testimonials = [
    {
      quote:
        "NodeX didn't just teach me to code, it transformed my entire approach to problem-solving. The mentorship and real-world projects prepared me for a direct placement at Google.",
      author: "Aryan Sharma",
      role: "Software Engineer",
      company: "Google",
      achievement: "Direct Placement",
      icon: <Building2 className="w-4 h-4" />,
      gradient: "from-blue-500 to-blue-600",
    },
    {
      quote:
        "The GATE preparation program at NodeX is unmatched. The strategic approach and peer learning environment helped me secure AIR 47 and admission to IIT Delhi.",
      author: "Priya Malik",
      role: "M.Tech Student",
      company: "IIT Delhi",
      achievement: "AIR 47 GATE",
      icon: <GraduationCap className="w-4 h-4" />,
      gradient: "from-emerald-500 to-emerald-600",
    },
    {
      quote:
        "NodeX's international program guidance was exceptional. From GRE prep to university applications, they made my journey to Stanford seamless and strategic.",
      author: "Rahul Gupta",
      role: "MS Computer Science",
      company: "Stanford University",
      achievement: "$50k Scholarship",
      icon: <Award className="w-4 h-4" />,
      gradient: "from-purple-500 to-purple-600",
    },
    {
      quote:
        "The hackathons and build-in-public projects at NodeX gave me real industry experience. My portfolio directly led to offers from Microsoft and Amazon.",
      author: "Sneha Verma",
      role: "Product Manager",
      company: "Microsoft",
      achievement: "Multiple Offers",
      icon: <Building2 className="w-4 h-4" />,
      gradient: "from-amber-500 to-amber-600",
    },
    {
      quote:
        "NodeX's alumni network is invaluable. The mentorship from seniors in FAANG companies provided insights that no textbook could offer.",
      author: "Vikash Kumar",
      role: "Backend Engineer",
      company: "Amazon",
      achievement: "L4 Direct Entry",
      icon: <Building2 className="w-4 h-4" />,
      gradient: "from-orange-500 to-orange-600",
    },
    {
      quote:
        "The hardware innovation lab at NodeX helped me develop IoT solutions that caught the attention of startup accelerators. Now I'm running my own tech company.",
      author: "Aisha Khan",
      role: "Tech Entrepreneur",
      company: "InnovateTech (Founder)",
      achievement: "$500k Funding",
      icon: <Award className="w-4 h-4" />,
      gradient: "from-pink-500 to-pink-600",
    },
  ];

  return (
    <section className="py-20 px-6 bg-gradient-to-br from-muted/30 via-background to-primary/5">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <Quote className="w-8 h-8 mr-3 text-primary" />
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Success Stories
            </h2>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Real achievements from NodeX alumni who transformed their careers
            and reached the pinnacle of tech excellence
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="group border-border hover:shadow-2xl transition-all duration-500 hover:scale-105 bg-gradient-to-br from-card to-card/50 overflow-hidden relative"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${testimonial.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
              ></div>

              <CardContent className="p-6 relative z-10">
                <div className="flex items-center mb-4">
                  <Quote className="w-5 h-5 text-primary mr-2 flex-shrink-0" />
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                </div>

                <blockquote className="text-muted-foreground leading-relaxed mb-6 group-hover:text-foreground/80 transition-colors duration-300">
                  &quot;{testimonial.quote}&quot;
                </blockquote>

                <div className="border-t border-border pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
                        {testimonial.author}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {testimonial.role}
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className={`text-xs bg-gradient-to-r ${testimonial.gradient} text-white border-none shadow-sm`}
                    >
                      {testimonial.icon}
                      <span className="ml-1">{testimonial.company}</span>
                    </Badge>
                  </div>

                  <div className="flex items-center mt-3">
                    <Award className="w-4 h-4 text-amber-500 mr-2" />
                    <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
                      {testimonial.achievement}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground italic">
            Join the next generation of tech leaders making their mark globally
          </p>
        </div>
      </div>
    </section>
  );
}
