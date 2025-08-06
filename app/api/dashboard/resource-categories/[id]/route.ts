import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const pocketbaseUrl = process.env.POCKETBASE_BACKEND_URL;

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
    const response = await fetch(
      `${pocketbaseUrl}/api/collections/resource_categories/records/${id}`,
      {
        method: "PATCH",
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
      throw new Error("Failed to update category");
    }

    const category = await response.json();

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
    const pocketbaseUrl = process.env.POCKETBASE_BACKEND_URL;
    const { id } = params;

    // Check if category is being used by any resources
    const resourcesResponse = await fetch(
      `${pocketbaseUrl}/api/collections/nodex_resources/records?filter=(category="${id}")&page=1&perPage=1`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (resourcesResponse.ok) {
      const resourcesData = await resourcesResponse.json();
      if (resourcesData.totalItems > 0) {
        return NextResponse.json(
          {
            success: false,
            message: `Cannot delete category. It is being used by ${resourcesData.totalItems} resource(s).`,
          },
          { status: 400 }
        );
      }
    }

    // Delete category
    const deleteResponse = await fetch(
      `${pocketbaseUrl}/api/collections/resource_categories/records/${id}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!deleteResponse.ok) {
      throw new Error("Failed to delete category");
    }

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
