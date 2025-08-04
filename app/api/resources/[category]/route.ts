import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ category: string }> }
) {
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

    const { category } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const perPage = parseInt(searchParams.get("perPage") || "20");
    const search = searchParams.get("search") || "";
    const type = searchParams.get("type") || "";

    // Build filter query
    let filter = `category.slug = "${category}"`;

    if (search) {
      filter += ` && (title ~ "${search}" || description ~ "${search}" || tags ~ "${search}")`;
    }

    if (type) {
      filter += ` && type = "${type}"`;
    }

    // Fetch resources from PocketBase
    const resourcesResponse = await fetch(
      `${pocketbaseUrl}/api/collections/nodex_resources/records?filter=${encodeURIComponent(
        filter
      )}&sort=-created&page=${page}&perPage=${perPage}&expand=category`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!resourcesResponse.ok) {
      console.error(
        "PocketBase resources fetch error:",
        resourcesResponse.status
      );
      return NextResponse.json(
        {
          success: false,
          error: "Failed to fetch resources",
        },
        { status: 500 }
      );
    }

    const resourcesData = await resourcesResponse.json();

    return NextResponse.json({
      success: true,
      resources: resourcesData.items || [],
      pagination: {
        page: resourcesData.page || 1,
        perPage: resourcesData.perPage || 20,
        totalItems: resourcesData.totalItems || 0,
        totalPages: resourcesData.totalPages || 0,
      },
    });
  } catch (error) {
    console.error("Error fetching resources:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch resources",
      },
      { status: 500 }
    );
  }
}
