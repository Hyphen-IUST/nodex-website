import { NextRequest, NextResponse } from "next/server";
import PocketBase from "pocketbase";

const pb = new PocketBase(process.env.POCKETBASE_URL);

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    // Authenticate with admin credentials
    await pb.admins.authWithPassword(
      process.env.POCKETBASE_ADMIN_EMAIL!,
      process.env.POCKETBASE_ADMIN_PASSWORD!
    );

    const data = await request.json();
    const { id } = params;

    // Validate required fields
    if (!data.name || !data.description) {
      return NextResponse.json(
        { success: false, message: "Name and description are required" },
        { status: 400 }
      );
    }

    // Update category
    const category = await pb.collection("resource_categories").update(id, {
      name: data.name,
      description: data.description,
      slug: data.slug,
      icon: data.icon || "",
    });

    return NextResponse.json({
      success: true,
      category,
      message: "Category updated successfully",
    });
  } catch (error) {
    console.error("Error updating resource category:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update resource category" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    // Authenticate with admin credentials
    await pb.admins.authWithPassword(
      process.env.POCKETBASE_ADMIN_EMAIL!,
      process.env.POCKETBASE_ADMIN_PASSWORD!
    );

    const { id } = params;

    // Check if category is being used by any resources
    const resourcesUsingCategory = await pb
      .collection("resources")
      .getList(1, 1, {
        filter: `category = "${id}"`,
      });

    if (resourcesUsingCategory.totalItems > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Cannot delete category. It is being used by ${resourcesUsingCategory.totalItems} resource(s).`,
        },
        { status: 400 }
      );
    }

    // Delete category
    await pb.collection("resource_categories").delete(id);

    return NextResponse.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting resource category:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete resource category" },
      { status: 500 }
    );
  }
}
