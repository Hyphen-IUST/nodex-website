"use client";

import React from "react";
import Image from "next/image";
export function Footer() {
  return (
    <footer className="py-12 px-6 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent"></div>

      <div className="max-w-7xl mx-auto text-center relative z-10">
        <div className="hero-glassmorphism p-8 rounded-2xl">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-sm flex items-center justify-center">
              <Image
                src={"https://i.ibb.co/Rkysb24k/logo-Updated.png"}
                width={40}
                height={40}
                alt="Hyphen Logo"
                className="object-contain"
              />
            </div>
            <span className="text-2xl font-bold gradient-text">Hyphen</span>
          </div>
          <p className="text-muted-foreground mb-4">
            Empowering students to build, learn, and grow together
          </p>
          <p className="text-muted-foreground/60 text-sm">
            Built by the Hyphen community • Open Source • Student-Led
          </p>
        </div>
      </div>
    </footer>
  );
}
