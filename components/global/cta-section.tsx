"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section className="py-20 px-6 relative">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="floating-element absolute top-10 left-1/4 w-24 h-24 rounded-full bg-gradient-to-r from-emerald-400/10 to-emerald-600/20 blur-xl"></div>
        <div className="floating-element absolute bottom-10 right-1/4 w-20 h-20 rounded-full bg-gradient-to-r from-green-400/10 to-green-600/20 blur-xl"></div>
      </div>

      <div className="max-w-5xl mx-auto text-center relative z-10">
        <div className="hero-glassmorphism p-12 rounded-3xl">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="gradient-text">Ready to Begin Your Journey?</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join a community of passionate developers and ambitious scholars.
            Your future in tech and academia starts here.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              asChild
              className="saas-button-primary text-lg px-8 py-4"
            >
              <Link href="/join">Join NodeX Today</Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              asChild
              className="saas-button-secondary text-lg px-8 py-4"
            >
              <Link href="/events">View Events</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
