"use client";

import React from "react";
import { MessageCircle, Instagram, Linkedin, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function SocialsSection() {
  const socials = [
    {
      name: "Discord",
      icon: <MessageCircle className="w-8 h-8" />,
      description:
        "Join our Discord server for real-time discussions, project collaborations, and community support.",
      link: "https://nodex.iust.cc/discord",
    },
    {
      name: "Instagram",
      icon: <Instagram className="w-8 h-8" />,
      description:
        "Follow us on Instagram for updates, behind-the-scenes content, and event highlights.",
      link: "https://instagram.com/nodex.iust",
    },
    {
      name: "LinkedIn",
      icon: <Linkedin className="w-8 h-8" />,
      description:
        "Connect with us on LinkedIn for professional networking and career opportunities.",
      link: "https://linkedin.com/company/nodex-iust",
    },
  ];

  return (
    <section id="socials" className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Connect With Us
          </h2>
          <p className="text-xl text-muted-foreground mb-6">
            Join our community and stay updated with NodeX activities
          </p>
          <div className="inline-block px-6 py-3 bg-card border border-border rounded-lg">
            <p className="text-lg font-semibold text-primary">Founded: 2025</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {socials.map((social, index) => (
            <Card
              key={index}
              className="border-border hover:shadow-lg transition-shadow text-center flex flex-col h-full"
            >
              <CardHeader className="pb-3">
                <div className="flex justify-center mb-4 text-primary">
                  {social.icon}
                </div>
                <CardTitle className="text-2xl">{social.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <p className="text-muted-foreground mb-6 flex-1">
                  {social.description}
                </p>
                <Button
                  asChild
                  className="w-full bg-foreground text-background hover:bg-foreground/90 mt-auto"
                >
                  <a
                    href={social.link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Connect
                    <ExternalLink className="ml-2 w-4 h-4" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
