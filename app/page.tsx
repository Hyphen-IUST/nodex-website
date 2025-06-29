"use client";

import React from "react";
import { Header } from "../components/global/header";
import { HeroSection } from "../components/global/hero-section";
import { MissionSection } from "../components/global/mission-section";
import { DepartmentsSection } from "../components/global/departments-section";
import { FeaturesSection } from "../components/global/features-section";
import { UniqueSection } from "../components/global/unique-section";
import { AffiliationsSection } from "../components/global/affiliations-section";
import { CTASection } from "../components/global/cta-section";
import { Footer } from "../components/global/footer";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <HeroSection />
      <MissionSection />
      <DepartmentsSection />
      <FeaturesSection />
      <UniqueSection />
      <AffiliationsSection />
      <CTASection />
      <Footer />
    </div>
  );
}
