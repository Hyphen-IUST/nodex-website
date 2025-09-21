import React from "react";
import { Header } from "../../components/global/header";
import { Footer } from "../../components/global/footer";
import { JoinForm } from "../../components/global/join-form";

export default function JoinPage() {
  return (
    <div className="min-h-screen">
      <Header />

      <div className="pt-24 pb-20 px-6 relative">
        {/* Background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="floating-element absolute top-10 right-10 w-16 h-16 rounded-full bg-gradient-to-r from-emerald-400/5 to-emerald-600/10 blur-xl"></div>
          <div className="floating-element absolute bottom-10 left-10 w-20 h-20 rounded-full bg-gradient-to-r from-green-400/5 to-green-600/10 blur-xl"></div>
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          {/* Page Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="gradient-text">Join NodeX</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Ready to become part of our thriving tech community? Fill out the
              application below and take the first step towards an amazing
              journey in technology and academia.
            </p>
          </div>

          {/* Join Form */}
          <JoinForm />
        </div>
      </div>

      <Footer />
    </div>
  );
}
