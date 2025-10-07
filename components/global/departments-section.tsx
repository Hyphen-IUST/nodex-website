"use client";

import React from "react";
import { Code, GraduationCap, Cpu } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function DepartmentsSection() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Core Departments
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Three divisions working together to shape the future of technology
            and academia
          </p>
        </div>

        <Tabs defaultValue="coding" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-muted mb-8 h-auto p-1">
            <TabsTrigger
              value="coding"
              className="flex items-center justify-center space-x-1 sm:space-x-2 data-[state=active]:bg-card data-[state=active]:text-foreground p-2 sm:p-3 text-xs sm:text-sm"
            >
              <Code className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="hidden sm:inline">Coding & Development</span>
              <span className="sm:hidden">Coding</span>
            </TabsTrigger>
            <TabsTrigger
              value="academic"
              className="flex items-center justify-center space-x-1 sm:space-x-2 data-[state=active]:bg-card data-[state=active]:text-foreground p-2 sm:p-3 text-xs sm:text-sm"
            >
              <GraduationCap className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="hidden sm:inline">Postgraduate Prep</span>
              <span className="sm:hidden">Academic</span>
            </TabsTrigger>
            <TabsTrigger
              value="hardware"
              className="flex items-center justify-center space-x-1 sm:space-x-2 data-[state=active]:bg-card data-[state=active]:text-foreground p-2 sm:p-3 text-xs sm:text-sm"
            >
              <Cpu className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="hidden sm:inline">Hardware & IoT</span>
              <span className="sm:hidden">Hardware</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="coding" className="space-y-6">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl">
                  <Code className="w-6 h-6 mr-3" />
                  Coding & Development Division
                </CardTitle>
                <CardDescription className="text-muted-foreground text-lg">
                  The heartbeat of Hyphen, fueling students&apos; passion for
                  building, breaking, and bettering technology
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold mb-2">Weekly Dev Sprints</h4>
                      <p className="text-muted-foreground text-sm">
                        Full-stack development, open-source contribution,
                        competitive programming
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">
                        Hackathons & Code Jams
                      </h4>
                      <p className="text-muted-foreground text-sm">
                        Internal and inter-college events for problem-solving
                        and creativity
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">
                        Mentored Learning Tracks
                      </h4>
                      <p className="text-muted-foreground text-sm">
                        Web Dev, DSA, AI/ML, Cybersecurity, DevOps
                      </p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold mb-2">
                        Build-in-Public Projects
                      </h4>
                      <p className="text-muted-foreground text-sm">
                        Collaborative repositories for real, deployable software
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Tooling Workshops</h4>
                      <p className="text-muted-foreground text-sm">
                        Git, Docker, CI/CD, Linux, and modern development tools
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="academic" className="space-y-6">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl">
                  <GraduationCap className="w-6 h-6 mr-3" />
                  Postgraduate Prep Cell (PG Cell)
                </CardTitle>
                <CardDescription className="text-muted-foreground text-lg">
                  Supporting students aiming for academic excellence and
                  entrance into top postgraduate programs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold mb-2">GATE Prep Circles</h4>
                      <p className="text-muted-foreground text-sm">
                        Topic-wise study groups, mock tests, problem-solving
                        sessions
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">
                        GRE/TOEFL/IELTS Support
                      </h4>
                      <p className="text-muted-foreground text-sm">
                        Study resources, strategy workshops, speaking practice
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">
                        Research Track Guidance
                      </h4>
                      <p className="text-muted-foreground text-sm">
                        SoPs, research papers, RA/TA applications
                      </p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold mb-2">Alumni Network</h4>
                      <p className="text-muted-foreground text-sm">
                        Guidance from IIT/NIT qualifiers and MS admit holders
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">
                        NPTEL/Coursera Pathways
                      </h4>
                      <p className="text-muted-foreground text-sm">
                        Curated learning paths using online certifications
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="hardware" className="space-y-6">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl">
                  <Cpu className="w-6 h-6 mr-3" />
                  Hardware & IoT Division
                </CardTitle>
                <CardDescription className="text-muted-foreground text-lg">
                  Bridging the gap between software and physical computing
                  through hands-on hardware projects and IoT innovation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold mb-2">
                        Microcontroller Workshops
                      </h4>
                      <p className="text-muted-foreground text-sm">
                        Arduino, ESP32/ESP8266, Raspberry Pi programming and
                        project development
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">IoT Project Labs</h4>
                      <p className="text-muted-foreground text-sm">
                        Smart home automation, sensor networks, and cloud
                        integration projects
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">
                        PCB Design & Fabrication
                      </h4>
                      <p className="text-muted-foreground text-sm">
                        Learn KiCad, Altium Designer, and get hands-on with PCB
                        prototyping
                      </p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold mb-2">Embedded Systems</h4>
                      <p className="text-muted-foreground text-sm">
                        Real-time programming, RTOS, and low-level hardware
                        interfacing
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">
                        Hardware Hackathons
                      </h4>
                      <p className="text-muted-foreground text-sm">
                        Build innovative solutions with sensors, actuators, and
                        communication modules
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">
                        Industry Collaboration
                      </h4>
                      <p className="text-muted-foreground text-sm">
                        Partner with tech companies on real-world hardware
                        challenges
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
