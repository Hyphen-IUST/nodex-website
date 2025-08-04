import { NextResponse } from "next/server";

interface ResourceCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  slug: string;
  resource_count?: number;
}

export async function GET() {
  try {
    const pocketbaseUrl = process.env.POCKETBASE_BACKEND_URL;

    if (!pocketbaseUrl) {
      return NextResponse.json(
        {
          success: false,
          error: "PocketBase configuration not found",
        },
        { status: 500 }
      );
    }

    // Fetch resource categories from PocketBase
    const categoriesResponse = await fetch(
      `${pocketbaseUrl}/api/collections/resource_categories/records?sort=name`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!categoriesResponse.ok) {
      console.error(
        "PocketBase categories fetch error:",
        categoriesResponse.status
      );
      return NextResponse.json(
        {
          success: false,
          error: "Failed to fetch resource categories",
        },
        { status: 500 }
      );
    }

    const categoriesData = await categoriesResponse.json();
    const categories: ResourceCategory[] = categoriesData.items || [];

    // For each category, count the resources
    const categoriesWithCounts = await Promise.all(
      categories.map(async (category: ResourceCategory) => {
        try {
          const resourceCountResponse = await fetch(
            `${pocketbaseUrl}/api/collections/nodex_resources/records?filter=category="${category.id}"&perPage=1`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          if (resourceCountResponse.ok) {
            const countData = await resourceCountResponse.json();
            return {
              ...category,
              resource_count: countData.totalItems || 0,
            };
          } else {
            return {
              ...category,
              resource_count: 0,
            };
          }
        } catch (error) {
          console.error(
            `Error counting resources for category ${category.name}:`,
            error
          );
          return {
            ...category,
            resource_count: 0,
          };
        }
      })
    );

    return NextResponse.json({
      success: true,
      categories: categoriesWithCounts,
    });
  } catch (error) {
    console.error("Error fetching resource categories:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch resource categories",
      },
      { status: 500 }
    );
  }
}
