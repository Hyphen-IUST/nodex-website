"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { Header } from "../global/header";
import { Footer } from "../global/footer";

interface PageLoadingProps {
  message?: string;
  showHeader?: boolean;
  showFooter?: boolean;
}

export function PageLoading({
  message = "Loading...",
  showHeader = true,
  showFooter = true,
}: PageLoadingProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {showHeader && <Header />}

      <div
        className={`flex items-center justify-center ${
          showHeader ? "pt-24 pb-20" : "min-h-screen"
        } px-6`}
      >
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg text-muted-foreground">{message}</p>
        </div>
      </div>

      {showFooter && <Footer />}
    </div>
  );
}
