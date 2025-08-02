"use client";

import React from "react";
import Image from "next/image";
export function Footer() {
  return (
    <footer className="py-12 px-6 bg-foreground text-background">
      <div className="max-w-6xl mx-auto text-center">
        <div className="flex items-center justify-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-sm flex items-center justify-center dark:invert">
            <Image
              src={"https://i.ibb.co/RpRrXLM8/node-Xblack.png"}
              width={32}
              height={32}
              alt="NodeX Logo"
              className="invert"
            />{" "}
          </div>
          <span className="text-2xl font-bold">NodeX</span>
        </div>
        <p className="text-muted mb-4">
          Empowering students to build, learn, and grow together
        </p>
        <p className="text-muted/60 text-sm">
          Built by the NodeX community • Open Source • Student-Led
        </p>
      </div>
    </footer>
  );
}
