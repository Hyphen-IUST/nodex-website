import React from "react";
import { Header } from "../../components/global/header";
import { Footer } from "../../components/global/footer";
import { JoinForm } from "../../components/global/join-form";

export default function JoinPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <div className="pt-24 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Join NodeX</h1>
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
