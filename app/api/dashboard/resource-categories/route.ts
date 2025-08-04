import { NextRequest, NextResponse } from "next/server";
import PocketBase from "pocketbase";

const pb = new PocketBase(process.env.POCKETBASE_URL);

export async function GET() {
  try {
    // Authenticate with admin credentials
    await pb.admins.authWithPassword(
      process.env.POCKETBASE_ADMIN_EMAIL!,
      process.env.POCKETBASE_ADMIN_PASSWORD!
    );

    // Fetch all resource categories
    const categories = await pb.collection("resource_categories").getFullList({
      sort: "name",
    });

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
    // Authenticate with admin credentials
    await pb.admins.authWithPassword(
      process.env.POCKETBASE_ADMIN_EMAIL!,
      process.env.POCKETBASE_ADMIN_PASSWORD!
    );

    const data = await request.json();

    // Validate required fields
    if (!data.name || !data.description) {
      return NextResponse.json(
        { success: false, message: "Name and description are required" },
        { status: 400 }
      );
    }

    // Create new category
    const category = await pb.collection("resource_categories").create({
      name: data.name,
      description: data.description,
      slug: data.slug,
      icon: data.icon || "",
    });

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
