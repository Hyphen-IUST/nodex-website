"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          Ready to Begin Your Journey?
        </h2>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Join a community of passionate developers and ambitious scholars. Your
          future in tech and academia starts here.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/join">
            <Button
              size="lg"
              className="bg-foreground text-background hover:bg-foreground/90 px-8 py-4 text-lg w-full sm:w-auto"
            >
              Join NodeX Today
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <Link href="/events">
            <Button
              size="lg"
              variant="outline"
              className="border-border text-muted-foreground hover:bg-muted px-8 py-4 text-lg w-full sm:w-auto"
            >
              <Calendar className="mr-2 w-5 h-5" />
              View Events
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
