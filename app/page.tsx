"use client";

import React from "react";
import { Header } from "../components/global/header";
import { HeroSection } from "../components/global/hero-section";
import { VisionMissionSection } from "../components/global/vision-mission-section";
import { AboutSection } from "../components/global/about-section";
import { OfferingsSection } from "../components/global/offerings-section";
import { SocialsSection } from "../components/global/socials-section";
import { CTASection } from "../components/global/cta-section";
import { Footer } from "../components/global/footer";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <HeroSection />
      <AboutSection />
      <VisionMissionSection />
      <OfferingsSection />
      <SocialsSection />
      <CTASection />
      <Footer />
    </div>
  );
}
