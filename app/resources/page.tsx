"use client";

import React, { useState, useEffect } from "react";
import { Header } from "../../components/global/header";
import { Footer } from "../../components/global/footer";
import { BookOpen, Github, Map, Code, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Resource {
  id: string;
  title: string;
  description: string;
  category: string;
  link: string;
}

interface ResourceData {
  notes: Resource[];
  books: Resource[];
  cheatsheets: Resource[];
  roadmaps: Resource[];
}

export default function ResourcesPage() {
  const [resourceData, setResourceData] = useState<ResourceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResourceData();
  }, []);

  const fetchResourceData = async () => {
    try {
      const response = await fetch("/api/resources");
      if (response.ok) {
        const data = await response.json();
        setResourceData(data.resources);
      }
    } catch (error) {
      console.error("Error fetching resources:", error);
    } finally {
      setLoading(false);
    }
  };

  const studyMaterials = [
    {
      title: "Semester-wise Notes",
      description:
        "B.Tech CSE-focused notes, categorized by subjects and semesters.",
      icon: <BookOpen className="w-6 h-6" />,
      link: "/resources/notes",
      count: resourceData?.notes?.length || 0,
    },
    {
      title: "Reference Books & PDFs",
      description:
        "Essential textbooks and reference materials for CSE curriculum.",
      icon: <FileText className="w-6 h-6" />,
      link: "/resources/books",
      count: resourceData?.books?.length || 0,
    },
    {
      title: "Cheat Sheets",
      description: "Quick revision documents and subject-wise cheat sheets.",
      icon: <Code className="w-6 h-6" />,
      link: "/resources/cheatsheets",
      count: resourceData?.cheatsheets?.length || 0,
    },
  ];

  const roadmaps = [
    "Full Stack Web Development",
    "Android & iOS Development",
    "AI & Machine Learning",
    "Cybersecurity",
    "Competitive Programming",
    "UI/UX Design",
    "Open Source Journey",
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <section className="pt-32 pb-20 px-6">
          <div className="max-w-6xl mx-auto text-center">
            <p className="text-muted-foreground">Loading resources...</p>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Resources & Learning
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Empowering students with knowledge, tools, and mentorship to build,
            learn, and grow.
          </p>
        </div>
      </section>

      {/* Study Materials Section */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Study Material
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              A curated collection of academic and technical resources to
              support learning inside and outside the classroom.
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {studyMaterials.map((material, index) => (
                <Card
                  key={index}
                  className="border-border hover:shadow-lg transition-shadow"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-3">
                      <div className="text-primary">{material.icon}</div>
                      <CardTitle className="text-xl">
                        {material.title}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      {material.description}
                    </p>
                    {material.count > 0 && (
                      <p className="text-sm text-primary mb-4">
                        {material.count} resources available
                      </p>
                    )}
                    <Button variant="outline" asChild className="w-full">
                      <a href={material.link}>Explore →</a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* GitHub Section */}
      <section className="py-16 px-6 bg-muted/50">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              NodeX GitHub Repos
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              A centralized space for all NodeX codebases, collaborative
              projects, and open-source contributions.
            </p>

            <div className="bg-card p-8 rounded-lg border border-border text-center">
              <div className="text-6xl mb-4">
                <Github className="w-16 h-16 mx-auto text-primary" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">
                NodeX GitHub Organization
              </h3>
              <p className="text-muted-foreground mb-6">
                Explore our repositories, contribute to projects, and
                collaborate with the community.
              </p>
              <Button
                asChild
                className="bg-foreground text-background hover:bg-foreground/90"
              >
                <a
                  href="https://github.com/nodex-iust"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Visit GitHub →
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Roadmaps Section */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Roadmaps & Tutorials
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Visual learning guides and structured tutorials to help students
              pick and master a tech stack.
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {roadmaps.map((roadmap, index) => (
                <Card
                  key={index}
                  className="border-border hover:shadow-lg transition-shadow"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-3">
                      <div className="text-primary">
                        <Map className="w-6 h-6" />
                      </div>
                      <CardTitle className="text-lg">{roadmap}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      Complete learning path from beginner to advanced level.
                    </p>
                    <Button variant="outline" asChild className="w-full">
                      <a
                        href={`/resources/roadmaps/${roadmap
                          .toLowerCase()
                          .replace(/\s+/g, "-")}`}
                      >
                        View Roadmap →
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
