"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface GalleryItem {
  id: number;
  title: string;
  category: string;
  image: string;
  description: string;
}

export function GallerySection() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const categories = [
    { id: "all", name: "All" },
    { id: "workshops", name: "Workshops" },
    { id: "events", name: "Events" },
    { id: "achievements", name: "Achievements" },
  ];

  useEffect(() => {
    fetchGalleryData();
  }, []);

  const fetchGalleryData = async () => {
    try {
      const response = await fetch("/api/gallery");
      if (response.ok) {
        const data = await response.json();
        // Flatten the grouped gallery data
        const allItems = [
          ...(data.gallery?.workshops || []),
          ...(data.gallery?.events || []),
          ...(data.gallery?.achievements || []),
        ];
        setGalleryItems(allItems);
      }
    } catch (error) {
      console.error("Error fetching gallery data:", error);
      // Fallback to static data
      setGalleryItems([
        {
          id: 1,
          title: "Web Development Workshop",
          category: "workshops",
          image: "/images/gallery/workshop1.jpg",
          description: "Students learning React and Node.js fundamentals",
        },
        {
          id: 2,
          title: "Annual Tech Fest",
          category: "events",
          image: "/images/gallery/event1.jpg",
          description: "NodeX's first annual technology festival",
        },
        {
          id: 3,
          title: "Hackathon Winners",
          category: "achievements",
          image: "/images/gallery/achievement1.jpg",
          description: "Team NodeX winning inter-university hackathon",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems =
    activeCategory === "all"
      ? galleryItems
      : galleryItems.filter((item) => item.category === activeCategory);

  if (loading) {
    return (
      <section id="gallery" className="py-20 px-6 bg-muted/50">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-muted-foreground">Loading gallery...</p>
        </div>
      </section>
    );
  }

  return (
    <section id="gallery" className="py-20 px-6 bg-muted/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Gallery</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Capturing moments from our workshops, events, and achievements
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            <Button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              variant={activeCategory === category.id ? "default" : "outline"}
              className="transition-colors"
            >
              {category.name}
            </Button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="saas-card hover:shadow-lg transition-shadow overflow-hidden"
            >
              <div className="aspect-video bg-muted overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.title}
                  width={400}
                  height={300}
                  className="w-full h-full object-cover hover:scale-105 transition-transform"
                />
              </div>
              <div className="pb-3 p-6">
                <h3 className="text-lg font-bold text-green-100">
                  {item.title}
                </h3>
                <p className="text-muted-foreground text-sm mt-3">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              No items found in this category.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
