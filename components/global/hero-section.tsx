"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Github, ArrowRight } from "lucide-react";

export function HeroSection() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const orgLogos = [
    {
      name: "Raspberry Pi Foundation",
      url: "https://diversejobsmatter.co.uk/files/pictures/RPF_Logo_RGB.png",
      darkUrl:
        "https://diversejobsmatter.co.uk/files/pictures/RPF_Logo_RGB.png",
    },
    {
      name: "The Linux Foundation",
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Linux_Foundation_logo_2013.svg/375px-Linux_Foundation_logo_2013.svg.png",
      darkUrl:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Linux_Foundation_logo_2013.svg/375px-Linux_Foundation_logo_2013.svg.png",
    },
    {
      name: "JetBrains",
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/JetBrains_company_logo.svg/375px-JetBrains_company_logo.svg.png",
      darkUrl:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/JetBrains_company_logo.svg/375px-JetBrains_company_logo.svg.png",
    },
    {
      name: "GitHub",
      url: "https://i.ibb.co/GfDDryyv/pngimg-com-github-PNG23.png",
      darkUrl: "https://i.ibb.co/GfDDryyv/pngimg-com-github-PNG23.png",
    },
  ];

  return (
    <section className="pt-32 pb-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div
          className={`transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold mb-4 tracking-tight text-foreground">
            NodeX
          </h1>
          <Badge className="mb-8 bg-muted text-foreground border-border hover:bg-muted/80">
            Think. Solve. Transform.
          </Badge>
          <p className="text-lg sm:text-xl md:text-2xl mb-8 text-muted-foreground max-w-4xl leading-relaxed">
            A student-led technical club at IUST Kashmir, bridging the gap
            between academic theory and real-world application through
            innovation, collaboration, and shared growth.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-16">
            <Link href="/join">
              <Button
                size="lg"
                className="bg-foreground text-background hover:bg-foreground/90 px-8 py-3 w-full sm:w-auto"
              >
                Join NodeX Today
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Link href="https://github.com/nodeX-iust" target="_blank">
              <Button
                size="lg"
                variant="outline"
                className="border-border text-muted-foreground hover:bg-muted px-8 py-3 transition-colors"
              >
                <Github className="mr-2 w-4 h-4" />
                View Our Work
              </Button>
            </Link>
          </div>

          {/* Org Logos Section */}
          <div className="mb-16">
            <p className="text-center text-sm text-muted-foreground mb-8 uppercase tracking-wide">
              Aligned With
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
              {orgLogos.map((org, index) => (
                <div
                  key={index}
                  className="flex items-center justify-center p-4 md:p-6 bg-card border border-border rounded-lg hover:shadow-md transition-shadow duration-300"
                >
                  {/* Light mode image */}
                  <Image
                    src={org.url}
                    width={150}
                    height={50}
                    alt={org.name}
                    className="max-h-8 md:max-h-12 max-w-full object-contain transition-all duration-300 dark:hidden"
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      img.style.display = "none";
                    }}
                  />
                  {/* Dark mode image */}
                  <Image
                    src={org.darkUrl}
                    width={150}
                    height={50}
                    alt={org.name}
                    className="max-h-8 md:max-h-12 max-w-full object-contain transition-all duration-300 hidden dark:block dark:invert"
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      img.style.display = "none";
                    }}
                  />
                  <div className="text-sm font-medium text-muted-foreground hidden">
                    {org.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
