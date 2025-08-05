"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useToast } from "@/hooks/use-toast";
import { useActivityLogger } from "@/hooks/useActivityLogger";
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
import { ArrowLeft, Loader2, Plus } from "lucide-react";

interface TeamForm {
  name: string;
  description: string;
  category: string;
  team_lead: string;
  repository_url: string;
  jira_link: string;
  status: string;
}

export default function CreateTeam() {
  const router = useRouter();
  const { toast } = useToast();
  const { logActivity } = useActivityLogger();

  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<TeamForm>({
    name: "",
    description: "",
    category: "",
    team_lead: "",
    repository_url: "",
    jira_link: "",
    status: "active",
  });

  const teamCategories = [
    "Development",
    "Design",
    "Research",
    "Marketing",
    "Content",
    "Events",
    "Finance",
    "Operations",
    "PG Prep",
    "Competitive Programming",
    "Web Development",
    "Mobile Development",
    "Data Science",
    "Machine Learning",
    "DevOps",
    "Other",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch("/api/dashboard/teams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();

        await logActivity("team_created", {
          team_id: data.team.id,
          team_name: formData.name,
          category: formData.category,
        });

        toast({
          title: "Team Created",
          description: `Team "${formData.name}" has been created successfully.`,
        });

        router.push(`/exec-dashboard/teams/${data.team.id}`);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create team");
      }
    } catch (error) {
      console.error("Error creating team:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create team",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof TeamForm, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <DashboardLayout>
      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/exec-dashboard/teams")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Teams
          </Button>

          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              Create New Team
            </h1>
            <p className="text-muted-foreground">
              Set up a new team with members and project details
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Team Information
            </CardTitle>
            <CardDescription>
              Fill in the basic information about your new team
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Team Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter team name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      handleInputChange("category", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {teamCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  placeholder="Describe the team's purpose, goals, and what they work on"
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="team_lead">Team Lead</Label>
                  <Input
                    id="team_lead"
                    value={formData.team_lead}
                    onChange={(e) =>
                      handleInputChange("team_lead", e.target.value)
                    }
                    placeholder="Enter team lead name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      handleInputChange("status", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="planning">Planning</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Project Links */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Project Links</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="repository_url">Repository URL</Label>
                    <Input
                      id="repository_url"
                      type="url"
                      value={formData.repository_url}
                      onChange={(e) =>
                        handleInputChange("repository_url", e.target.value)
                      }
                      placeholder="https://github.com/org/repo"
                    />
                    <p className="text-sm text-muted-foreground">
                      Link to the team&apos;s main code repository
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="jira_link">Jira Board URL</Label>
                    <Input
                      id="jira_link"
                      type="url"
                      value={formData.jira_link}
                      onChange={(e) =>
                        handleInputChange("jira_link", e.target.value)
                      }
                      placeholder="https://yourorg.atlassian.net/jira/software/projects/..."
                    />
                    <p className="text-sm text-muted-foreground">
                      Link to the team&apos;s Jira project board
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/exec-dashboard/teams")}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating Team...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Team
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Additional Info Card */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>What&apos;s Next?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                • After creating the team, you&apos;ll be able to add team
                members
              </p>
              <p>• Set up roles and assign skills to each member</p>
              <p>• Configure project links and external integrations</p>
              <p>• Track team progress and member contributions</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </DashboardLayout>
  );
}
