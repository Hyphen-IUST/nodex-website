"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Save,
  Plus,
  X,
  Users,
  Mail,
  Phone,
  GraduationCap,
  Building,
  Link as LinkIcon,
  Github,
  Linkedin,
  Globe,
} from "lucide-react";
import Link from "next/link";

interface Team {
  id: string;
  name: string;
  category: string;
}

export default function CreateClubMemberPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    student_id: "",
    phone: "",
    member_type: "",
    position: "",
    department: "",
    year: "",
    teams: [] as string[],
    skills: [] as string[],
    bio: "",
    linkedin_url: "",
    github_url: "",
    portfolio_url: "",
    status: "active",
  });

  const [newSkill, setNewSkill] = useState("");

  // Fetch teams for selection
  const fetchTeams = useCallback(async () => {
    try {
      setLoadingTeams(true);
      const response = await fetch("/api/dashboard/teams");
      if (!response.ok) throw new Error("Failed to fetch teams");
      const data = await response.json();
      setTeams(data.teams || []);
    } catch (error) {
      console.error("Error fetching teams:", error);
      toast({
        title: "Error",
        description: "Failed to fetch teams",
        variant: "destructive",
      });
    } finally {
      setLoadingTeams(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleTeamToggle = (teamId: string) => {
    setFormData((prev) => ({
      ...prev,
      teams: prev.teams.includes(teamId)
        ? prev.teams.filter((id) => id !== teamId)
        : [...prev.teams, teamId],
    }));
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()],
      }));
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.member_type
    ) {
      toast({
        title: "Validation Error",
        description:
          "Please fill in all required fields (name, email, member type)",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const submitData = {
        ...formData,
        year: formData.year ? parseInt(formData.year) : null,
      };

      const response = await fetch("/api/dashboard/club-members", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create member");
      }

      toast({
        title: "Success",
        description: "Club member created successfully",
      });

      router.push("/exec-dashboard/club-members");
    } catch (error) {
      console.error("Error creating member:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create member",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const memberTypes = [
    { value: "core", label: "Core Member" },
    { value: "regular", label: "Regular Member" },
  ];

  const departments = [
    "Computer Science",
    "Software Engineering",
    "Information Technology",
    "Electrical Engineering",
    "Data Science",
    "Artificial Intelligence",
    "Cybersecurity",
    "Other",
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYear - i);

  return (
    <DashboardLayout>
      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/exec-dashboard/club-members">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Members
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Add New Member
            </h1>
            <p className="text-muted-foreground">
              Add a new member to the club with their details and team
              assignments
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Basic Information
              </CardTitle>
              <CardDescription>
                Essential member details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      placeholder="member@example.com"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="student_id">Student ID</Label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="student_id"
                      value={formData.student_id}
                      onChange={(e) =>
                        handleInputChange("student_id", e.target.value)
                      }
                      placeholder="Student ID number"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      placeholder="+1 (555) 123-4567"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Member Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Member Details
              </CardTitle>
              <CardDescription>
                Role, position, and academic information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="member_type">Member Type *</Label>
                  <Select
                    value={formData.member_type}
                    onValueChange={(value) =>
                      handleInputChange("member_type", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select member type" />
                    </SelectTrigger>
                    <SelectContent>
                      {memberTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position">Position/Title</Label>
                  <Input
                    id="position"
                    value={formData.position}
                    onChange={(e) =>
                      handleInputChange("position", e.target.value)
                    }
                    placeholder="e.g., President, Lead Developer"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select
                    value={formData.department}
                    onValueChange={(value) =>
                      handleInputChange("department", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="year">Academic Year</Label>
                  <Select
                    value={formData.year}
                    onValueChange={(value) => handleInputChange("year", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="alumni">Alumni</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Team Assignments */}
          <Card>
            <CardHeader>
              <CardTitle>Team Assignments</CardTitle>
              <CardDescription>
                Select teams this member belongs to
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingTeams ? (
                <div className="text-center py-4">Loading teams...</div>
              ) : teams.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  No teams available. Create teams first to assign members.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {teams.map((team) => (
                    <div key={team.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={team.id}
                        checked={formData.teams.includes(team.id)}
                        onCheckedChange={() => handleTeamToggle(team.id)}
                      />
                      <Label
                        htmlFor={team.id}
                        className="flex-1 cursor-pointer"
                      >
                        <div>
                          <div className="font-medium">{team.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {team.category}
                          </div>
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Skills */}
          <Card>
            <CardHeader>
              <CardTitle>Skills & Expertise</CardTitle>
              <CardDescription>
                Add relevant skills and technologies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add a skill (e.g., React, Python, UI/UX)"
                  onKeyPress={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addSkill())
                  }
                />
                <Button type="button" onClick={addSkill} variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {formData.skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.skills.map((skill) => (
                    <Badge
                      key={skill}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {skill}
                      <Button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Social Links */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LinkIcon className="h-5 w-5" />
                Social Links
              </CardTitle>
              <CardDescription>
                Professional and social media profiles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="linkedin_url">LinkedIn Profile</Label>
                <div className="relative">
                  <Linkedin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="linkedin_url"
                    value={formData.linkedin_url}
                    onChange={(e) =>
                      handleInputChange("linkedin_url", e.target.value)
                    }
                    placeholder="https://linkedin.com/in/username"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="github_url">GitHub Profile</Label>
                <div className="relative">
                  <Github className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="github_url"
                    value={formData.github_url}
                    onChange={(e) =>
                      handleInputChange("github_url", e.target.value)
                    }
                    placeholder="https://github.com/username"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="portfolio_url">Portfolio Website</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="portfolio_url"
                    value={formData.portfolio_url}
                    onChange={(e) =>
                      handleInputChange("portfolio_url", e.target.value)
                    }
                    placeholder="https://yourportfolio.com"
                    className="pl-10"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bio */}
          <Card>
            <CardHeader>
              <CardTitle>Bio & Description</CardTitle>
              <CardDescription>
                Brief description about the member
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.bio}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                placeholder="Tell us about this member, their interests, achievements, etc."
                rows={4}
              />
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Link href="/exec-dashboard/club-members">
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? "Creating..." : "Create Member"}
            </Button>
          </div>
        </form>
      </main>
    </DashboardLayout>
  );
}
