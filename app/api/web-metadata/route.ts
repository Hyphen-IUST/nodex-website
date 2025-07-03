import { NextRequest, NextResponse } from "next/server";
import { getWebMetadata } from "@/lib/web-metadata";

export async function GET() {
  try {
    const metadata = await getWebMetadata();

    return NextResponse.json({
      maintenance: metadata?.maintenance ?? false,
      accepting: metadata?.accepting ?? true,
      updated: metadata?.updated ?? null,
    });
  } catch (error) {
    console.error("Error fetching web metadata:", error);
    return NextResponse.json(
      {
        maintenance: false,
        accepting: true,
        error: "Failed to fetch metadata",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { maintenance, accepting } = body;

    // Update metadata in PocketBase
    const response = await fetch(
      `${process.env.POCKETBASE_BACKEND_URL}/api/collections/web_metadata/records`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          maintenance: maintenance ?? false,
          accepting: accepting ?? true,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`PocketBase API error: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json({
      maintenance: data.maintenance ?? false,
      accepting: data.accepting ?? true,
      updated: data.updated,
    });
  } catch (error) {
    console.error("Error updating web metadata:", error);
    return NextResponse.json(
      { error: "Failed to update metadata" },
      { status: 500 }
    );
  }
}
