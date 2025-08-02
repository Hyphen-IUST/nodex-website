"use client";

import React, { useState, useEffect } from "react";
import { Header } from "../../components/global/header";
import { Footer } from "../../components/global/footer";
import {
  BookOpen,
  Github,
  Map,
  Code,
  FileText,
  Database,
  Lightbulb,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface ResourceCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  slug: string;
  resource_count?: number;
}

export default function ResourcesPage() {
  const [categories, setCategories] = useState<ResourceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/resources");
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCategories(data.categories);
        } else {
          setError(data.error || "Failed to fetch categories");
        }
      } else {
        setError("Failed to fetch categories");
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      setError("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      BookOpen: <BookOpen className="w-6 h-6" />,
      FileText: <FileText className="w-6 h-6" />,
      Code: <Code className="w-6 h-6" />,
      Map: <Map className="w-6 h-6" />,
      Database: <Database className="w-6 h-6" />,
      Lightbulb: <Lightbulb className="w-6 h-6" />,
    };
    return iconMap[iconName] || <BookOpen className="w-6 h-6" />;
  };

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

  if (error) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <section className="pt-32 pb-20 px-6">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-3xl font-bold mb-4">Error Loading Resources</h1>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={fetchCategories}>Try Again</Button>
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
            learn, and grow in technology.
          </p>
        </div>
      </section>

      {/* Resource Categories Section */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Browse Resources
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Explore our curated collection of educational materials, guides,
              and tools organized by category to support your learning journey.
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => (
                <Card
                  key={category.id}
                  className="border-border hover:shadow-lg transition-shadow"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-3">
                      <div className="text-primary">
                        {getIconComponent(category.icon)}
                      </div>
                      <CardTitle className="text-xl">{category.name}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      {category.description}
                    </p>
                    {category.resource_count !== undefined && (
                      <p className="text-sm text-primary mb-4">
                        {category.resource_count} resources available
                      </p>
                    )}
                    <Button variant="outline" asChild className="w-full">
                      <Link href={`/resources/${category.slug}`}>
                        Explore {category.name} →
                      </Link>
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
              NodeX GitHub Organization
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Access our open-source projects, collaborative repositories, and
              community contributions on GitHub.
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
                collaborate with the NodeX community.
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

      <Footer />
    </div>
  );
}
