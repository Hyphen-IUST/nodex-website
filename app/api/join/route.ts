import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { logActivity } from "@/lib/activity-logger";

// Define the schema for form validation
const joinFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  batch: z.string().min(4, "Please enter your batch year"),
  rollNumber: z.string().min(1, "Roll number is required"),
  registrationNumber: z.string().min(1, "Registration number is required"),
  department: z.string().min(1, "Please select a department"),
  interestedTracks: z
    .array(z.string())
    .min(1, "Please select at least one track"),
  whyJoin: z
    .string()
    .min(
      50,
      "Please provide at least 50 characters explaining why you want to join"
    ),
  experience: z.string().optional(),
  projects: z.string().optional(),
  otherRemarks: z.string().optional(),
  recaptchaToken: z.string().min(1, "reCAPTCHA verification is required"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = joinFormSchema.parse(body);

    // Extract IP address from headers
    const ipAddress =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "0.0.0.0";

    // Verify reCAPTCHA token
    const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;
    const recaptchaResponse = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `secret=${recaptchaSecret}&response=${validatedData.recaptchaToken}`,
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

    // Check if IP is blocked
    const pocketbaseUrl = process.env.POCKETBASE_URL;
    const ipCheckResponse = await fetch(
      `${pocketbaseUrl}/api/collections/blocked_ips/records?filter=(ip='${ipAddress}')`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const ipCheckData = await ipCheckResponse.json();

    // If IP is blocked, redirect to rickroll, this is for you unemployed bitchless assholes.
    if (ipCheckData.items && ipCheckData.items.length > 0) {
      return NextResponse.json(
        {
          message: "Redirecting",
          redirect: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        },
        { status: 303 }
      );
    }

    // Continue with application submission
    const pocketbaseResponse = await fetch(
      `${pocketbaseUrl}/api/collections/nodex_apps/records`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...validatedData,
          ipAddress: ipAddress,
          interestedTracks: validatedData.interestedTracks.join(", "),
          submittedAt: new Date().toISOString(),
        }),
      }
    );

    if (!pocketbaseResponse.ok) {
      const errorData = await pocketbaseResponse.text();
      console.error("PocketBase API error:", errorData);
      throw new Error(`PocketBase API error: ${pocketbaseResponse.status}`);
    }

    const pocketbaseData = await pocketbaseResponse.json();
    console.log(
      "Application successfully submitted to PocketBase:",
      pocketbaseData
    );

    // Log the activity
    await logActivity(
      {
        action: "join_form_submission",
        page_url: "/join",
        additional_data: {
          applicationId: pocketbaseData.id,
          ipAddress: ipAddress,
          submittedAt: new Date().toISOString(),
          status: "success",
        },
      },
      request
    );

    // Return success response
    return NextResponse.json(
      {
        message:
          "Application submitted successfully! We'll get back to you soon.",
        applicationId: pocketbaseData.id || `APP_${Date.now()}`,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Return validation errors
      return NextResponse.json(
        {
          message: "Validation failed",
          errors: error.errors,
        },
        { status: 400 }
      );
    }

    // Handle other errors
    console.error("Error processing application:", error);
    return NextResponse.json(
      {
        message:
          "An error occurred while processing your application. Please try again.",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: "This endpoint only accepts POST requests" },
    { status: 405 }
  );
}
