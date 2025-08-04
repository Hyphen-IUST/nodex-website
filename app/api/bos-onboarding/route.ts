import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Extract form fields
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      rollNumber: formData.get("rollNumber") as string,
      department: formData.get("department") as string,
      year: formData.get("year") as string,
      photo: formData.get("photo") as File,
      bio: formData.get("bio") as string,
      skills: formData.get("skills") as string,
      achievements: formData.get("achievements") as string,
      interests: formData.get("interests") as string,
      github: formData.get("github") as string,
      linkedin: formData.get("linkedin") as string,
      portfolio: formData.get("portfolio") as string,
      experience: formData.get("experience") as string,
      goals: formData.get("goals") as string,
      opportunities: formData.get("opportunities") as string,
      availability: JSON.parse(
        formData.get("availability") as string
      ) as string[],
      communication_preference: formData.get(
        "communication_preference"
      ) as string,
      newsletter: formData.get("newsletter") === "true",
      events_notification: formData.get("events_notification") === "true",
    };

    // Validate required fields
    const requiredFields: (keyof typeof data)[] = [
      "name",
      "email",
      "phone",
      "rollNumber",
      "department",
      "year",
      "photo",
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

    // Validate photo file
    if (!data.photo || data.photo.size === 0) {
      return NextResponse.json(
        { message: "Professional headshot is required" },
        { status: 400 }
      );
    }

    // Validate file type and size
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!allowedTypes.includes(data.photo.type)) {
      return NextResponse.json(
        { message: "Only JPEG and PNG images are allowed" },
        { status: 400 }
      );
    }

    if (data.photo.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { message: "File size must be less than 5MB" },
        { status: 400 }
      );
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

    // Prepare FormData for PocketBase (to handle file upload)
    const pbFormData = new FormData();

    // Add all text fields
    pbFormData.append("name", data.name);
    pbFormData.append("email", data.email);
    pbFormData.append("phone", data.phone);
    pbFormData.append("roll_number", data.rollNumber);
    pbFormData.append("department", data.department);
    pbFormData.append("year", data.year);
    pbFormData.append("bio", data.bio);
    pbFormData.append("skills", data.skills);
    pbFormData.append("achievements", data.achievements || "");
    pbFormData.append("interests", data.interests);
    pbFormData.append("github", data.github || "");
    pbFormData.append("linkedin", data.linkedin || "");
    pbFormData.append("portfolio", data.portfolio || "");
    pbFormData.append("experience", data.experience);
    pbFormData.append("goals", data.goals);
    pbFormData.append("opportunities", data.opportunities);
    pbFormData.append("availability", data.availability.join(", "));
    pbFormData.append(
      "communication_preference",
      data.communication_preference
    );
    pbFormData.append("newsletter", data.newsletter.toString());
    pbFormData.append(
      "events_notification",
      data.events_notification.toString()
    );
    pbFormData.append("status", "pending");
    pbFormData.append("onboarded_date", new Date().toISOString());

    // Add the photo file
    pbFormData.append("photo", data.photo);
    // Submit to PocketBase
    const response = await fetch(
      `${pocketbaseUrl}/api/collections/nodex_bos/records`,
      {
        method: "POST",
        body: pbFormData, // Send FormData instead of JSON
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
