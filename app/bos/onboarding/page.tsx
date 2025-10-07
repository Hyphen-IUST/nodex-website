"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Image from "next/image";
import { Header } from "@/components/global/header";
import { Footer } from "@/components/global/footer";
import { BOSNotAcceptingPage } from "@/components/global/bos-not-accepting";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import {
  Users,
  Star,
  Trophy,
  Heart,
  CheckCircle,
  Loader2,
  UserPlus,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import { PageLoading } from "@/components/ui/page-loading";

const onboardingSchema = z.object({
  // Personal Information
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  rollNumber: z.string().min(1, "Roll number is required"),
  department: z.string().min(1, "Department is required"),
  year: z.string().min(1, "Year is required"),
  photo: z
    .instanceof(File)
    .refine((file) => file.size > 0, "Professional headshot is required")
    .refine(
      (file) => file.size <= 5 * 1024 * 1024,
      "File size must be less than 5MB"
    )
    .refine(
      (file) => ["image/jpeg", "image/jpg", "image/png"].includes(file.type),
      "Only JPEG and PNG images are allowed"
    ),

  // Profile Information
  bio: z.string().min(50, "Bio must be at least 50 characters"),
  skills: z.string().min(10, "Please list your skills"),
  achievements: z.string().optional(),
  interests: z.string().min(10, "Please describe your interests"),

  // Social Links (optional)
  github: z.string().url("Invalid GitHub URL").optional().or(z.literal("")),
  linkedin: z.string().url("Invalid LinkedIn URL").optional().or(z.literal("")),
  portfolio: z
    .string()
    .url("Invalid portfolio URL")
    .optional()
    .or(z.literal("")),

  // Additional Information
  experience: z.string().min(20, "Please describe your relevant experience"),
  goals: z.string().min(30, "Please describe your goals"),
  opportunities: z
    .string()
    .min(30, "Please describe opportunities you'd like to pursue"),
  availability: z.array(z.string()).min(1, "Please select your availability"),

  // Preferences
  communication_preference: z
    .string()
    .min(1, "Communication preference is required"),
  newsletter: z.boolean(),
  events_notification: z.boolean(),
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

export default function BOSOnboardingPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [acceptingStatus, setAcceptingStatus] = useState<
    "accepting" | "not-accepting"
  >("accepting");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      newsletter: true,
      events_notification: true,
      availability: [],
    },
  });

  const availabilityOptions = [
    "Monday Morning",
    "Monday Evening",
    "Tuesday Morning",
    "Tuesday Evening",
    "Wednesday Morning",
    "Wednesday Evening",
    "Thursday Morning",
    "Thursday Evening",
    "Friday Morning",
    "Friday Evening",
    "Saturday",
    "Sunday",
  ];

  const handleAvailabilityChange = (day: string, checked: boolean) => {
    const currentAvailability = watch("availability") || [];
    if (checked) {
      setValue("availability", [...currentAvailability, day]);
    } else {
      setValue(
        "availability",
        currentAvailability.filter((d) => d !== day)
      );
    }
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedPhoto(file);
      setValue("photo", file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setSelectedPhoto(null);
    setPhotoPreview(null);
    // Reset the input
    const photoInput = document.getElementById("photo") as HTMLInputElement;
    if (photoInput) {
      photoInput.value = "";
    }
  };

  const onSubmit = async (data: OnboardingFormData) => {
    setIsSubmitting(true);
    try {
      // Create FormData to handle file upload
      const formData = new FormData();

      // Add all form fields
      Object.entries(data).forEach(([key, value]) => {
        if (key === "photo") {
          formData.append("photo", value as File);
        } else if (key === "availability") {
          formData.append("availability", JSON.stringify(value));
        } else {
          formData.append(key, value as string);
        }
      });

      const response = await fetch("/api/bos-onboarding", {
        method: "POST",
        body: formData, // Send FormData instead of JSON
      });

      const result = await response.json();

      if (response.ok) {
        setIsSubmitted(true);
        toast({
          title: "🎉 Welcome to Board of Students!",
          description:
            "Your onboarding form has been submitted successfully. We're excited to have you on the team!",
        });
        reset();
        // Clear photo states
        setSelectedPhoto(null);
        setPhotoPreview(null);
      } else {
        toast({
          title: "Submission Failed",
          description: result.message || "Failed to submit onboarding form",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Network Error",
        description:
          "Failed to submit form. Please check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    // Check accepting status from web metadata
    const fetchAcceptingStatus = async () => {
      try {
        const response = await fetch("/api/web-metadata");
        const data = await response.json();
        if (data.accepting) {
          setAcceptingStatus("accepting");
        } else {
          setAcceptingStatus("not-accepting");
        }
      } catch (error) {
        console.error("Error fetching accepting status:", error);
        setAcceptingStatus("accepting"); // Default to accepting on error
      } finally {
        setIsCheckingStatus(false);
      }
    };

    fetchAcceptingStatus();
  }, []);

  // Show loading while checking status
  if (isCheckingStatus) {
    return (
      <PageLoading message="Loading..." showHeader={false} showFooter={false} />
    );
  }

  if (acceptingStatus === "not-accepting") {
    return <BOSNotAcceptingPage />;
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <div className="pt-24 pb-20 px-6">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>
              <h1 className="text-4xl font-bold mb-4">Welcome Aboard! 🎉</h1>
              <p className="text-xl text-muted-foreground mb-6">
                Thank you for completing your Board of Students onboarding.
                You&apos;re now officially part of our advisory team!
              </p>
              <div className="flex justify-center gap-2 mb-8">
                <Badge variant="secondary" className="px-4 py-2">
                  <Star className="w-4 h-4 mr-2" />
                  Advisory Member
                </Badge>
                <Badge variant="secondary" className="px-4 py-2">
                  <Trophy className="w-4 h-4 mr-2" />
                  Board of Students
                </Badge>
              </div>
              <p className="text-muted-foreground mb-8">
                You&apos;ll receive further instructions about dashboard access
                and strategic planning sessions via email within the next 24
                hours. Get ready to drive innovation and create opportunities
                with Hyphen!
              </p>
              <Button onClick={() => setIsSubmitted(false)} variant="outline">
                Submit Another Form
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <div className="pt-24 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/40 rounded-2xl flex items-center justify-center">
                <UserPlus className="w-8 h-8 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Board of Students Onboarding
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
              Congratulations on joining the Hyphen Board of Students! Please
              complete this onboarding form to help us get to know your
              background and set up your access.
            </p>
            <div className="flex justify-center gap-2 mb-8">
              <Badge variant="secondary" className="px-3 py-1">
                <Sparkles className="w-4 h-4 mr-1" />
                Leadership Role
              </Badge>
              <Badge variant="secondary" className="px-3 py-1">
                <Heart className="w-4 h-4 mr-1" />
                Strategic Impact
              </Badge>
            </div>
          </div>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Member Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* Personal Information */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">
                    Personal Information
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        {...register("name")}
                        placeholder="Enter your full name"
                      />
                      {errors.name && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.name.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        {...register("email")}
                        placeholder="your.email@example.com"
                      />
                      {errors.email && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.email.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        {...register("phone")}
                        placeholder="+1234567890"
                      />
                      {errors.phone && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.phone.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="rollNumber">Roll Number *</Label>
                      <Input
                        id="rollNumber"
                        {...register("rollNumber")}
                        placeholder="Enter your roll number"
                      />
                      {errors.rollNumber && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.rollNumber.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="department">Department *</Label>
                      <Select
                        onValueChange={(value) => setValue("department", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select your department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="computer-science">
                            Computer Science
                          </SelectItem>
                          <SelectItem value="electronics">
                            Electronics
                          </SelectItem>
                          <SelectItem value="mechanical">Mechanical</SelectItem>
                          <SelectItem value="civil">Civil</SelectItem>
                          <SelectItem value="electrical">Electrical</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.department && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.department.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="year">Academic Year *</Label>
                      <Select
                        onValueChange={(value) => setValue("year", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select your year" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1st">1st Year</SelectItem>
                          <SelectItem value="2nd">2nd Year</SelectItem>
                          <SelectItem value="3rd">3rd Year</SelectItem>
                          <SelectItem value="4th">4th Year</SelectItem>
                          <SelectItem value="postgrad">
                            Post Graduate
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.year && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.year.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Professional Photo */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Professional Photo</h3>
                  <div>
                    <Label htmlFor="photo">Professional Headshot *</Label>
                    <p className="text-sm text-muted-foreground mb-4">
                      Upload a professional headshot for your team profile.
                      Maximum file size: 5MB. Accepted formats: JPEG, PNG.
                    </p>

                    {!photoPreview ? (
                      <div className="relative border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                        <Input
                          id="photo"
                          type="file"
                          accept="image/jpeg,image/jpg,image/png"
                          onChange={handlePhotoChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="flex flex-col items-center gap-4 pointer-events-none">
                          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                            <Upload className="w-8 h-8 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="text-sm font-medium mb-1">
                              Click to upload or drag and drop
                            </p>
                            <p className="text-xs text-muted-foreground">
                              JPEG or PNG up to 5MB
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="relative">
                        <div className="border border-border rounded-lg p-4">
                          <div className="flex items-start gap-4">
                            <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-muted">
                              <Image
                                src={photoPreview}
                                alt="Photo preview"
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">
                                {selectedPhoto?.name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {selectedPhoto &&
                                  (selectedPhoto.size / 1024 / 1024).toFixed(
                                    2
                                  )}{" "}
                                MB
                              </p>
                              <div className="flex gap-2 mt-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const input = document.getElementById(
                                      "photo"
                                    ) as HTMLInputElement;
                                    input?.click();
                                  }}
                                >
                                  <Upload className="w-4 h-4 mr-2" />
                                  Replace
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={removePhoto}
                                >
                                  <X className="w-4 h-4 mr-2" />
                                  Remove
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                        <Input
                          id="photo"
                          type="file"
                          accept="image/jpeg,image/jpg,image/png"
                          onChange={handlePhotoChange}
                          className="hidden"
                        />
                      </div>
                    )}

                    {errors.photo && (
                      <p className="text-sm text-red-500 mt-2">
                        {errors.photo.message}
                      </p>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Profile Information */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Profile Information</h3>
                  <div>
                    <Label htmlFor="bio">Bio *</Label>
                    <Textarea
                      id="bio"
                      {...register("bio")}
                      placeholder="Tell us about yourself in a few sentences..."
                      rows={4}
                    />
                    {errors.bio && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.bio.message}
                      </p>
                    )}
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="skills">Skills *</Label>
                      <Textarea
                        id="skills"
                        {...register("skills")}
                        placeholder="e.g., JavaScript, Python, UI/UX Design, Project Management"
                        rows={3}
                      />
                      {errors.skills && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.skills.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="achievements">Achievements</Label>
                      <Textarea
                        id="achievements"
                        {...register("achievements")}
                        placeholder="Any notable achievements, awards, or recognitions"
                        rows={3}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="interests">Interests *</Label>
                    <Textarea
                      id="interests"
                      {...register("interests")}
                      placeholder="What areas of technology and activities interest you most?"
                      rows={3}
                    />
                    {errors.interests && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.interests.message}
                      </p>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Social Links */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">
                    Social Links (Optional)
                  </h3>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <Label htmlFor="github">GitHub Profile</Label>
                      <Input
                        id="github"
                        {...register("github")}
                        placeholder="https://github.com/username"
                      />
                      {errors.github && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.github.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="linkedin">LinkedIn Profile</Label>
                      <Input
                        id="linkedin"
                        {...register("linkedin")}
                        placeholder="https://linkedin.com/in/username"
                      />
                      {errors.linkedin && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.linkedin.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="portfolio">Portfolio Website</Label>
                      <Input
                        id="portfolio"
                        {...register("portfolio")}
                        placeholder="https://yourportfolio.com"
                      />
                      {errors.portfolio && (
                        <p className="text-sm text-red-500 mt-1">
                          {errors.portfolio.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Professional Background & Vision */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">
                    Professional Background & Vision
                  </h3>
                  <div>
                    <Label htmlFor="experience">
                      Professional & Technical Background *
                    </Label>
                    <Textarea
                      id="experience"
                      {...register("experience")}
                      placeholder="Tell us about your professional background, technical projects, leadership experience, and notable achievements..."
                      rows={4}
                    />
                    {errors.experience && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.experience.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="goals">Strategic Goals & Vision *</Label>
                    <Textarea
                      id="goals"
                      {...register("goals")}
                      placeholder="What strategic initiatives would you like to drive? How do you envision contributing to the club's growth and member opportunities?"
                      rows={4}
                    />
                    {errors.goals && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.goals.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="opportunities">
                      Opportunities & Industry Connections *
                    </Label>
                    <Textarea
                      id="opportunities"
                      {...register("opportunities")}
                      placeholder="What opportunities, internships, competitions, or industry connections would you like to source for club members?"
                      rows={4}
                    />
                    {errors.opportunities && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.opportunities.message}
                      </p>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Availability */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Availability *</h3>
                  <p className="text-sm text-muted-foreground">
                    Select times when you&apos;re generally available for
                    meetings and activities:
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {availabilityOptions.map((day) => (
                      <div key={day} className="flex items-center space-x-2">
                        <Checkbox
                          id={day}
                          checked={
                            watch("availability")?.includes(day) || false
                          }
                          onCheckedChange={(checked) =>
                            handleAvailabilityChange(day, checked as boolean)
                          }
                        />
                        <Label htmlFor={day} className="text-sm">
                          {day}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {errors.availability && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.availability.message}
                    </p>
                  )}
                </div>

                <Separator />

                {/* Preferences */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">
                    Communication Preferences
                  </h3>
                  <div>
                    <Label htmlFor="communication_preference">
                      Preferred Communication Method *
                    </Label>
                    <Select
                      onValueChange={(value) =>
                        setValue("communication_preference", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your preference" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="whatsapp">WhatsApp</SelectItem>
                        <SelectItem value="discord">Discord</SelectItem>
                        <SelectItem value="slack">Slack</SelectItem>
                        <SelectItem value="teams">Microsoft Teams</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.communication_preference && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.communication_preference.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="newsletter"
                        {...register("newsletter")}
                        defaultChecked={true}
                      />
                      <Label htmlFor="newsletter" className="text-sm">
                        Subscribe to Hyphen newsletter
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="events_notification"
                        {...register("events_notification")}
                        defaultChecked={true}
                      />
                      <Label htmlFor="events_notification" className="text-sm">
                        Receive notifications about events and activities
                      </Label>
                    </div>
                  </div>
                </div>

                <div className="pt-8">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Complete Onboarding
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
