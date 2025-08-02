import { NextResponse } from "next/server";

interface CollaborationRequest {
  organization: string;
  contactName: string;
  email: string;
  phone?: string;
  requestTypes: string[];
  details: string;
  recaptchaToken: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      organization,
      contactName,
      email,
      phone,
      requestTypes,
      details,
      recaptchaToken,
    }: CollaborationRequest = body;

    // Validate required fields
    if (
      !organization ||
      !contactName ||
      !email ||
      !requestTypes ||
      requestTypes.length === 0 ||
      !recaptchaToken
    ) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify reCAPTCHA token
    const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;
    const recaptchaResponse = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `secret=${recaptchaSecret}&response=${recaptchaToken}`,
      }
    );

    const recaptchaData = await recaptchaResponse.json();
    if (!recaptchaData.success) {
      return NextResponse.json(
        {
          message: "reCAPTCHA verification failed. Please try again.",
        },
        { status: 400 }
      );
    }

    const pocketbaseUrl = process.env.POCKETBASE_BACKEND_URL;

    if (!pocketbaseUrl) {
      // Log to console when PocketBase is not configured
      console.log("Collaboration request received:", {
        organization,
        contactName,
        email,
        phone,
        requestTypes,
        details,
        timestamp: new Date().toISOString(),
      });

      return NextResponse.json(
        {
          success: true,
          message:
            "Collaboration request received successfully. We will get back to you within 3-5 working days.",
          id: "local_" + Date.now(),
        },
        { status: 201 }
      );
    }

    // Submit collaboration request to PocketBase
    const response = await fetch(
      `${pocketbaseUrl}/api/collections/nodex_collaboration_requests/records`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          organization,
          contact_name: contactName,
          email,
          phone,
          request_types: requestTypes,
          details,
          status: "pending",
          created: new Date().toISOString(),
        }),
      }
    );

    if (!response.ok) {
      console.error(
        "PocketBase collaboration request submission error:",
        response.status
      );
      return NextResponse.json(
        { message: "Failed to submit collaboration request" },
        { status: 500 }
      );
    }

    const data = await response.json();

    return NextResponse.json(
      {
        success: true,
        message: "Collaboration request submitted successfully",
        id: data.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error submitting collaboration request:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const pocketbaseUrl = process.env.POCKETBASE_URL;

    if (!pocketbaseUrl) {
      return NextResponse.json(
        { message: "PocketBase URL not configured" },
        { status: 500 }
      );
    }

    // Fetch collaboration requests from PocketBase
    const response = await fetch(
      `${pocketbaseUrl}/api/collections/nodex_collaboration_requests/records?sort=-created`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      console.error(
        "PocketBase collaboration requests fetch error:",
        response.status
      );
      return NextResponse.json(
        { message: "Failed to fetch collaboration requests" },
        { status: 500 }
      );
    }

    const data = await response.json();

    return NextResponse.json(
      {
        success: true,
        requests: data.items || [],
        totalRequests: data.totalItems || 0,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching collaboration requests:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
