import React from "react";
import { Header } from "../../components/global/header";
import { Footer } from "../../components/global/footer";
import { DepartmentsSection } from "../../components/global/departments-section";

export default function DepartmentsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <div className="pt-16">
        <DepartmentsSection />
      </div>
      <Footer />
    </div>
  );
}
