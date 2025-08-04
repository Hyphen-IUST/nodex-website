"use client";

import React from "react";

interface BlurCardProps {
  children: React.ReactNode;
  className?: string;
  variant?:
    | "gradient1"
    | "gradient2"
    | "gradient3"
    | "minimal"
    | "minimal-gradient";
}

export function BlurCard({
  children,
  className = "",
  variant = "gradient1",
}: BlurCardProps) {
  const gradientClass = {
    gradient1: "blur-card-gradient1",
    gradient2: "blur-card-gradient2",
    gradient3: "blur-card-gradient3",
    minimal: "blur-card-minimal",
    "minimal-gradient": "blur-card-minimal-gradient",
  }[variant];

  return (
    <div className={`blur-card ${gradientClass} ${className}`}>
      {variant !== "minimal" && variant !== "minimal-gradient" && <span></span>}
      <div className="blur-card-content">{children}</div>
    </div>
  );
}
