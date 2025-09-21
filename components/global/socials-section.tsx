"use client";

import React from "react";
import { MessageCircle, Instagram, Linkedin, ExternalLink } from "lucide-react";
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
    <section id="socials" className="py-20 px-6 relative">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="floating-element absolute top-10 right-10 w-16 h-16 rounded-full bg-gradient-to-r from-emerald-400/5 to-emerald-600/10 blur-xl"></div>
        <div className="floating-element absolute bottom-10 left-10 w-20 h-20 rounded-full bg-gradient-to-r from-green-400/5 to-green-600/10 blur-xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="gradient-text">Connect With Us</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-6">
            Join our community and stay updated with NodeX activities
          </p>
          <div className="inline-block px-6 py-3 saas-card">
            <p className="text-lg font-semibold text-primary">Founded: 2025</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {socials.map((social, index) => (
            <div
              key={index}
              className="saas-card p-8 text-center flex flex-col h-full group"
            >
              <div className="flex justify-center mb-4 text-primary group-hover:scale-110 transition-transform duration-300">
                {social.icon}
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-foreground">
                {social.name}
              </h3>
              <p className="text-muted-foreground mb-6 flex-1">
                {social.description}
              </p>
              <Button asChild className="w-full saas-button-primary mt-auto">
                <a href={social.link} target="_blank" rel="noopener noreferrer">
                  Connect
                  <ExternalLink className="ml-2 w-4 h-4" />
                </a>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
