import { NextResponse } from "next/server";

interface GalleryItem {
  id: string;
  title: string;
  description: string;
  category: "workshops" | "events" | "achievements";
  image: string;
  date?: string;
}

export async function GET() {
  try {
    const pocketbaseUrl = process.env.POCKETBASE_BACKEND_URL;

    if (!pocketbaseUrl) {
      // Return fallback data when PocketBase is not configured
      return NextResponse.json(
        {
          success: true,
          gallery: {
            workshops: [
              {
                id: "1",
                title: "Web Development Workshop",
                description: "Students learning React and Node.js fundamentals",
                category: "workshops",
                image: "/images/gallery/workshop1.jpg",
                date: "2025-01-15",
              },
              {
                id: "2",
                title: "Git & GitHub Workshop",
                description:
                  "Introduction to version control and collaboration",
                category: "workshops",
                image: "/images/gallery/workshop2.jpg",
                date: "2025-01-20",
              },
            ],
            events: [
              {
                id: "3",
                title: "NodeX Inauguration",
                description: "Official launch of NodeX technical club",
                category: "events",
                image: "/images/gallery/event1.jpg",
                date: "2025-01-10",
              },
            ],
            achievements: [
              {
                id: "4",
                title: "Hackathon Winners",
                description: "Team NodeX winning inter-university hackathon",
                category: "achievements",
                image: "/images/gallery/achievement1.jpg",
                date: "2025-01-25",
              },
            ],
          },
          totalItems: 4,
        },
        { status: 200 }
      );
    }

    // Fetch gallery items from PocketBase
    const response = await fetch(
      `${pocketbaseUrl}/api/collections/nodex_gallery/records?sort=-date,title`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      console.error("PocketBase gallery fetch error:", response.status);
      return NextResponse.json(
        { message: "Failed to fetch gallery data" },
        { status: 500 }
      );
    }

    const data = await response.json();
    const galleryItems: GalleryItem[] = data.items || [];

    // Group by category
    const groupedGallery = {
      workshops: galleryItems.filter((item) => item.category === "workshops"),
      events: galleryItems.filter((item) => item.category === "events"),
      achievements: galleryItems.filter(
        (item) => item.category === "achievements"
      ),
    };

    return NextResponse.json(
      {
        success: true,
        gallery: groupedGallery,
        totalItems: galleryItems.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching gallery data:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
