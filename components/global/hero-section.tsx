"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger } from "@/components/ui/tooltip";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils";

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
    <section className="pt-32 pb-20 px-6 relative overflow-hidden">
      {/* Background floating elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="floating-element absolute top-20 left-10 w-20 h-20 rounded-full bg-gradient-to-r from-emerald-400/10 to-emerald-600/20 blur-xl"></div>
        <div className="floating-element absolute top-40 right-20 w-32 h-32 rounded-full bg-gradient-to-r from-green-400/10 to-green-600/20 blur-xl"></div>
        <div className="floating-element absolute bottom-20 left-1/4 w-24 h-24 rounded-full bg-gradient-to-r from-emerald-500/10 to-green-500/20 blur-xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div
          className={`transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          {/* Main hero content */}
          <div className="text-center max-w-4xl mx-auto mb-16">
            <div className="hero-glassmorphism rounded-3xl p-12 mb-8">
              {/* NodeX Logo and Text Side by Side */}
              <div className="flex items-center justify-center gap-6 mb-6">
                <Image
                  src="https://i.ibb.co/Rkysb24k/logo-Updated.png"
                  width={100}
                  height={100}
                  alt="NodeX Logo"
                  className="object-contain"
                />
                <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight">
                  <span className="gradient-text">Hyphen</span>
                </h1>
              </div>
              <div className="mb-8">
                <span className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500/20 to-green-500/20 border border-emerald-500/30 text-emerald-300 text-sm font-medium">
                  Think. Solve. Transform.
                </span>
              </div>
              <p className="text-lg sm:text-xl md:text-2xl mb-8 text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                A student-led body at IUST Kashmir, bridging the gap
                between academic theory and real-world application through
                innovation, collaboration, and shared growth.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  asChild
                  className="saas-button-primary text-lg px-8 py-4"
                >
                  <Link href="/join">Join Hyphen Today</Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  asChild
                  className="saas-button-secondary text-lg px-8 py-4"
                >
                  <Link href="/collaborate">View Our Work</Link>
                </Button>
              </div>
            </div>
          </div>{" "}
          {/* Partner organizations section */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-8 font-medium tracking-wide uppercase">
              ALIGNED WITH LEADING ORGANIZATIONS
            </p>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
              {orgLogos.map((org) => (
                <Tooltip key={org.name}>
                  <TooltipTrigger asChild>
                    <div className="w-40 h-24 p-6 cursor-pointer group bg-gradient-to-br from-white/15 via-emerald-500/10 to-white/15 backdrop-blur-20 border border-emerald-500/25 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:from-white/20 hover:via-emerald-500/15 hover:to-white/20 hover:scale-105 hover:border-emerald-400/35">
                      <div className="w-full h-full flex items-center justify-center">
                        <Image
                          src={org.url}
                          alt={org.name}
                          width={140}
                          height={70}
                          className="max-w-full max-h-full object-contain opacity-85 hover:opacity-100 transition-opacity duration-300"
                        />
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="max-w-xs p-2">
                      <h3 className="font-semibold text-sm mb-1">{org.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {org.description}
                      </p>
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
