"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MemberDashboardLayout } from "@/components/member-dashboard/member-dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageLoading } from "@/components/ui/page-loading";
import {
  User,
  ArrowLeft,
  Mail,
  Phone,
  GraduationCap,
  Calendar,
  Users,
  Linkedin,
  Github,
  ExternalLink,
  UserCheck,
} from "lucide-react";

interface MemberProfile {
  id: string;
  name: string;
  email: string;
  student_id?: string;
  phone?: string;
  member_type: string;
  position?: string;
  department?: string;
  year?: string;
  skills: string[];
  bio?: string;
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
  status: string;
  created: string;
  updated: string;
}

interface Team {
  id: string;
  name: string;
  category: string;
}

interface ProfileData {
  profile: MemberProfile;
  teams: Team[];
}

export default function MemberProfilePage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkAuthentication = async () => {
    try {
      const response = await fetch("/api/member-auth-check");
      const data = await response.json();

      if (data.authenticated) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        router.push("/member-dashboard/login");
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setIsAuthenticated(false);
      router.push("/member-dashboard/login");
    }
  };

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/member-dashboard/profile");
      if (response.ok) {
        const data = await response.json();
        setProfileData(data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to fetch profile");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setError("Failed to fetch profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuthentication();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
    }
  }, [isAuthenticated]);

  if (loading || isAuthenticated === null) {
    return <PageLoading />;
  }

  if (!isAuthenticated) {
    return null;
  }

  if (error) {
    return (
      <MemberDashboardLayout>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <Card>
            <CardContent className="text-center py-12">
              <h3 className="text-lg font-semibold mb-2">Error</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={() => router.push("/member-dashboard")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </main>
      </MemberDashboardLayout>
    );
  }

  if (!profileData) {
    return <PageLoading />;
  }

  const { profile, teams } = profileData;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <MemberDashboardLayout>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/member-dashboard")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">
                My Profile
              </h1>
              <p className="text-muted-foreground">
                Your membership information and details
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant={profile.status === "active" ? "default" : "secondary"}
                className="text-sm"
              >
                <UserCheck className="w-3 h-3 mr-1" />
                {profile.status.charAt(0).toUpperCase() +
                  profile.status.slice(1)}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Basic Information
                </CardTitle>
                <CardDescription>
                  Your primary contact and identification details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Full Name
                    </label>
                    <p className="text-sm mt-1">{profile.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Email Address
                    </label>
                    <div className="flex items-center gap-2 mt-1">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <p className="text-sm">{profile.email}</p>
                    </div>
                  </div>
                  {profile.student_id && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Student ID
                      </label>
                      <p className="text-sm mt-1">{profile.student_id}</p>
                    </div>
                  )}
                  {profile.phone && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Phone Number
                      </label>
                      <div className="flex items-center gap-2 mt-1">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <p className="text-sm">{profile.phone}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Academic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5" />
                  Academic Information
                </CardTitle>
                <CardDescription>
                  Your academic background and current status
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.department && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Department
                      </label>
                      <p className="text-sm mt-1">{profile.department}</p>
                    </div>
                  )}
                  {profile.year && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Year/Level
                      </label>
                      <p className="text-sm mt-1">{profile.year}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Member Type
                    </label>
                    <div className="mt-1">
                      <Badge variant="secondary">{profile.member_type}</Badge>
                    </div>
                  </div>
                  {profile.position && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Position
                      </label>
                      <p className="text-sm mt-1">{profile.position}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Bio and Skills */}
            <Card>
              <CardHeader>
                <CardTitle>About & Skills</CardTitle>
                <CardDescription>Your bio and technical skills</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile.bio && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Bio
                    </label>
                    <p className="text-sm mt-1 leading-relaxed">
                      {profile.bio}
                    </p>
                  </div>
                )}
                {profile.skills && profile.skills.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Skills
                    </label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {profile.skills.map((skill, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Social Links */}
            {(profile.linkedin_url ||
              profile.github_url ||
              profile.portfolio_url) && (
              <Card>
                <CardHeader>
                  <CardTitle>Social Links</CardTitle>
                  <CardDescription>
                    Your online presence and portfolios
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    {profile.linkedin_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          window.open(profile.linkedin_url, "_blank")
                        }
                      >
                        <Linkedin className="w-4 h-4 mr-2" />
                        LinkedIn
                      </Button>
                    )}
                    {profile.github_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          window.open(profile.github_url, "_blank")
                        }
                      >
                        <Github className="w-4 h-4 mr-2" />
                        GitHub
                      </Button>
                    )}
                    {profile.portfolio_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          window.open(profile.portfolio_url, "_blank")
                        }
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Portfolio
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* My Teams */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  My Teams
                </CardTitle>
                <CardDescription>
                  Teams you&apos;re currently a member of
                </CardDescription>
              </CardHeader>
              <CardContent>
                {teams.length === 0 ? (
                  <div className="text-center py-4">
                    <Users className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No teams yet
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {teams.map((team) => (
                      <div
                        key={team.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() =>
                          router.push(`/member-dashboard/teams/${team.id}`)
                        }
                      >
                        <div>
                          <p className="font-medium text-sm">{team.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {team.category}
                          </p>
                        </div>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => router.push("/member-dashboard/teams")}
                    >
                      View All Teams
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Account Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Account Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">
                    Member Since
                  </label>
                  <p className="text-sm">{formatDate(profile.created)}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">
                    Last Updated
                  </label>
                  <p className="text-sm">{formatDate(profile.updated)}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">
                    Account Status
                  </label>
                  <div className="mt-1">
                    <Badge
                      variant={
                        profile.status === "active" ? "default" : "secondary"
                      }
                      className="text-xs"
                    >
                      {profile.status.charAt(0).toUpperCase() +
                        profile.status.slice(1)}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </MemberDashboardLayout>
  );
}
