import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const pocketbaseUrl = process.env.POCKETBASE_BACKEND_URL;

    const response = await fetch(
      `${pocketbaseUrl}/api/collections/resource_categories/records?sort=name`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch categories");
    }

    const data = await response.json();
    const categories = data.items;

    return NextResponse.json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error("Error fetching resource categories:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch resource categories" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const pocketbaseUrl = process.env.POCKETBASE_BACKEND_URL;
    const data = await request.json();

    // Validate required fields
    if (!data.name || !data.description) {
      return NextResponse.json(
        { success: false, message: "Name and description are required" },
        { status: 400 }
      );
    }

    // Create new category
    const response = await fetch(
      `${pocketbaseUrl}/api/collections/resource_categories/records`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          description: data.description,
          slug: data.slug,
          icon: data.icon || "",
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to create category");
    }

    const category = await response.json();

    return NextResponse.json({
      success: true,
      category,
      message: "Category created successfully",
    });
  } catch (error) {
    console.error("Error creating resource category:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create resource category" },
      { status: 500 }
    );
  }
}
