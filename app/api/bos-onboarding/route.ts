import { NextRequest, NextResponse } from "next/server";

interface BOSOnboardingData {
  // Personal Information
  name: string;
  email: string;
  phone: string;
  rollNumber: string;
  department: string;
  year: string;

  // Profile Information
  bio: string;
  skills: string;
  achievements?: string;
  interests: string;

  // Social Links
  github?: string;
  linkedin?: string;
  portfolio?: string;

  // Additional Information
  experience: string;
  goals: string;
  opportunities: string;
  availability: string[];

  // Preferences
  communication_preference: string;
  newsletter: boolean;
  events_notification: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const data: BOSOnboardingData = await request.json();

    // Validate required fields
    const requiredFields: (keyof BOSOnboardingData)[] = [
      "name",
      "email",
      "phone",
      "rollNumber",
      "department",
      "year",
      "bio",
      "skills",
      "interests",
      "experience",
      "goals",
      "opportunities",
      "availability",
      "communication_preference",
    ];

    for (const field of requiredFields) {
      const value = data[field];
      if (!value || (Array.isArray(value) && value.length === 0)) {
        return NextResponse.json(
          { message: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return NextResponse.json(
        { message: "Invalid email format" },
        { status: 400 }
      );
    }

    // Get PocketBase URL from environment
    const pocketbaseUrl = process.env.POCKETBASE_BACKEND_URL;
    if (!pocketbaseUrl) {
      console.error("PocketBase URL not configured");
      return NextResponse.json(
        { message: "Server configuration error" },
        { status: 500 }
      );
    }

    // Prepare data for PocketBase
    const pbData = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      roll_number: data.rollNumber,
      department: data.department,
      year: data.year,
      bio: data.bio,
      skills: data.skills,
      achievements: data.achievements || "",
      interests: data.interests,
      github: data.github || "",
      linkedin: data.linkedin || "",
      portfolio: data.portfolio || "",
      experience: data.experience,
      goals: data.goals,
      opportunities: data.opportunities,
      availability: data.availability.join(", "), // Convert array to comma-separated string
      communication_preference: data.communication_preference,
      newsletter: data.newsletter,
      events_notification: data.events_notification,
      status: "pending", // Default status for new onboarding submissions
      onboarded_date: new Date().toISOString(),
    };

    // Submit to PocketBase
    const response = await fetch(
      `${pocketbaseUrl}/api/collections/nodex_bos/records`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(pbData),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("PocketBase submission error:", errorData);

      // Handle specific PocketBase errors
      if (response.status === 400) {
        // Check for duplicate email
        if (errorData.data?.email) {
          return NextResponse.json(
            { message: "An onboarding form with this email already exists" },
            { status: 400 }
          );
        }
        return NextResponse.json(
          { message: "Invalid data provided" },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { message: "Failed to submit onboarding form" },
        { status: 500 }
      );
    }

    const result = await response.json();

    return NextResponse.json(
      {
        success: true,
        message: "Onboarding form submitted successfully",
        id: result.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error processing BOS onboarding:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
