import { NextResponse } from "next/server";

interface Resource {
  id: string;
  title: string;
  description: string;
  category: "notes" | "books" | "cheatsheets" | "roadmaps";
  link: string;
  semester?: string;
  subject?: string;
  type?: string;
}

export async function GET() {
  try {
    const pocketbaseUrl = process.env.POCKETBASE_BACKEND_URL;

    if (!pocketbaseUrl) {
      // Return fallback data when PocketBase is not configured
      return NextResponse.json(
        {
          success: true,
          resources: {
            notes: [
              {
                id: "1",
                title: "Data Structures and Algorithms",
                description: "Comprehensive notes for DSA",
                category: "notes",
                link: "/resources/notes/dsa",
                semester: "3",
                subject: "DSA",
              },
              {
                id: "2",
                title: "Database Management Systems",
                description: "DBMS notes with examples",
                category: "notes",
                link: "/resources/notes/dbms",
                semester: "4",
                subject: "DBMS",
              },
            ],
            books: [
              {
                id: "3",
                title: "Introduction to Algorithms - CLRS",
                description: "Classic algorithms textbook",
                category: "books",
                link: "/resources/books/clrs",
                type: "PDF",
              },
            ],
            cheatsheets: [
              {
                id: "4",
                title: "Git Commands Cheat Sheet",
                description: "Essential Git commands reference",
                category: "cheatsheets",
                link: "/resources/cheatsheets/git",
              },
            ],
            roadmaps: [
              {
                id: "5",
                title: "Full Stack Development",
                description: "Complete roadmap for full stack development",
                category: "roadmaps",
                link: "/resources/roadmaps/fullstack",
              },
            ],
          },
          totalResources: 5,
        },
        { status: 200 }
      );
    }

    // Fetch resources from PocketBase
    const response = await fetch(
      `${pocketbaseUrl}/api/collections/nodex_resources/records?sort=category,title`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      console.error("PocketBase resources fetch error:", response.status);
      return NextResponse.json(
        { message: "Failed to fetch resources data" },
        { status: 500 }
      );
    }

    const data = await response.json();
    const resources: Resource[] = data.items || [];

    // Group resources by category
    const groupedResources = {
      notes: resources.filter((r) => r.category === "notes"),
      books: resources.filter((r) => r.category === "books"),
      cheatsheets: resources.filter((r) => r.category === "cheatsheets"),
      roadmaps: resources.filter((r) => r.category === "roadmaps"),
    };

    return NextResponse.json(
      {
        success: true,
        resources: groupedResources,
        totalResources: resources.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching resources data:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
