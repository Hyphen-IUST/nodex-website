"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger } from "@/components/ui/tooltip";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils";
import { Github, ArrowRight } from "lucide-react";

export function HeroSection() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Custom TooltipContent without arrow
  const TooltipContent = ({
    className,
    sideOffset = 0,
    children,
    ...props
  }: React.ComponentProps<typeof TooltipPrimitive.Content>) => {
    return (
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          sideOffset={sideOffset}
          className={cn(
            "bg-popover text-popover-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-fit origin-(--radix-tooltip-content-transform-origin) rounded-md px-3 py-1.5 text-xs text-balance border border-border shadow-lg",
            className
          )}
          {...props}
        >
          {children}
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    );
  };

  const orgLogos = [
    {
      name: "Raspberry Pi Foundation",
      url: "https://diversejobsmatter.co.uk/files/pictures/RPF_Logo_RGB.png",
      darkUrl:
        "https://diversejobsmatter.co.uk/files/pictures/RPF_Logo_RGB.png",
      description:
        "A UK-based charity that promotes the study of computer science and makes computing accessible for all through low-cost, high-performance computers.",
      website: "https://www.raspberrypi.org",
    },
    {
      name: "The Linux Foundation",
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Linux_Foundation_logo_2013.svg/375px-Linux_Foundation_logo_2013.svg.png",
      darkUrl:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Linux_Foundation_logo_2013.svg/375px-Linux_Foundation_logo_2013.svg.png",
      description:
        "A non-profit technology consortium that promotes, protects, and standardizes Linux and open source software development worldwide.",
      website: "https://www.linuxfoundation.org",
    },
    {
      name: "JetBrains",
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/JetBrains_company_logo.svg/375px-JetBrains_company_logo.svg.png",
      darkUrl:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/JetBrains_company_logo.svg/375px-JetBrains_company_logo.svg.png",
      description:
        "A leading software development company that creates professional development tools for coding, testing, and productivity enhancement.",
      website: "https://www.jetbrains.com",
    },
    {
      name: "GitHub",
      url: "https://i.ibb.co/GfDDryyv/pngimg-com-github-PNG23.png",
      darkUrl: "https://i.ibb.co/GfDDryyv/pngimg-com-github-PNG23.png",
      description:
        "The world's largest code hosting platform that provides distributed version control and source code management functionality for software development.",
      website: "https://github.com",
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
                <Tooltip key={index}>
                  <TooltipTrigger asChild>
                    <div className="flex items-center justify-center p-4 md:p-6 bg-card border border-border rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer">
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
                    </div>
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    className="max-w-xs bg-popover text-popover-foreground border-border shadow-lg"
                  >
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">{org.name}</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {org.description}
                      </p>
                      <Link
                        href={org.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block text-xs text-blue-500 hover:text-blue-400 font-medium underline transition-colors"
                      >
                        {org.website}
                      </Link>
                    </div>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
