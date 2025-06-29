import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

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
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validatedData = joinFormSchema.parse(body);

    const pocketbaseUrl = process.env.POCKETBASE_URL;
    const pocketbaseResponse = await fetch(
      `${pocketbaseUrl}/api/collections/nodex_apps/records`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...validatedData,
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
