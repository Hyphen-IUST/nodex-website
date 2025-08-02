"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Header } from "../../components/global/header";
import { Footer } from "../../components/global/footer";
import { RichTextRenderer } from "@/components/ui/rich-text-renderer";
import { PageLoading } from "@/components/ui/page-loading";
import { useActivityLogger } from "@/hooks/useActivityLogger";
import { Github, Linkedin, Mail, Award, Users, Phone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

interface TeamMember {
  id: string;
  name: string;
  photo?: string;
  category: "exec" | "direc" | "faculty" | "leads";
  title: string;
  qualification?: string;
  description?: string;
  skills?: string;
  email?: string;
  phone?: number;
  github?: string;
  linkedin?: string;
}

interface TeamData {
  exec: TeamMember[];
  direc: TeamMember[];
  faculty: TeamMember[];
  leads: TeamMember[];
}

export default function TeamPage() {
  const [teamData, setTeamData] = useState<TeamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("direc");
  const { logActivity } = useActivityLogger({
    trackPageViews: true,
    trackClicks: true,
  });

  useEffect(() => {
    fetchTeamData();
  }, []);

  const fetchTeamData = async () => {
    try {
      const response = await fetch("/api/team");
      if (!response.ok) {
        throw new Error("Failed to fetch team data");
      }
      const data = await response.json();
      setTeamData(data.team);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case "direc":
        return "Board of Students";
      case "exec":
        return "Core Committee";
      case "faculty":
        return "Faculty Mentors";
      case "leads":
        return "Operations Team";
      default:
        return "";
    }
  };

  const getCategoryDescription = (category: string) => {
    switch (category) {
      case "exec":
        return "Leadership team responsible for strategic direction and overall management";
      case "direc":
        return "Student representatives providing mentorship and fostering community engagement";
      case "faculty":
        return "Faculty mentors providing guidance and academic support";
      case "leads":
        return "Operations specialists overseeing key areas and day-to-day activities";
      default:
        return "";
    }
  };

  const TeamMemberCard = ({
    member,
    onActivity,
  }: {
    member: TeamMember;
    onActivity: (action: string, data?: Record<string, unknown>) => void;
  }) => {
    const [qualificationExpanded, setQualificationExpanded] = useState(false);
    const [descriptionExpanded, setDescriptionExpanded] = useState(false);
    const [skillsExpanded, setSkillsExpanded] = useState(false);

    const shouldTruncate = (text: string, isExpanded: boolean) => {
      return text.length > 200 && !isExpanded;
    };

    const getDisplayText = (text: string, isExpanded: boolean) => {
      if (shouldTruncate(text, isExpanded)) {
        // Show first 200 characters but ensure we don't cut off mid-word if possible
        let truncateAt = 200;
        const spaceIndex = text.lastIndexOf(" ", truncateAt);
        if (spaceIndex > 150) {
          // Only use word boundary if it's not too short
          truncateAt = spaceIndex;
        }
        return text.substring(0, truncateAt) + "...";
      }
      return text;
    };

    const showViewMoreButton = (text: string) => {
      return text.length > 200;
    };

    const getDisplaySkills = (skillsText: string, isExpanded: boolean) => {
      const skills = skillsText.split(",").map((skill) => skill.trim());
      if (!isExpanded && skills.length > 4) {
        return skills.slice(0, 4);
      }
      return skills;
    };

    const shouldShowMoreSkills = (skillsText: string) => {
      return skillsText.split(",").length > 4;
    };

    return (
      <Card className="border-border hover:shadow-lg transition-shadow duration-300 flex flex-col h-full">
        <CardHeader className="text-center pb-3 p-4">
          <div className="relative w-20 h-20 mx-auto mb-4">
            <div className="w-20 h-20 bg-muted rounded-xl flex items-center justify-center text-foreground text-lg font-bold overflow-hidden border border-border shadow-sm">
              {member.photo ? (
                <Image
                  src={member.photo}
                  alt={member.name}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                member.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
              )}
            </div>
          </div>
          <CardTitle className="text-lg font-bold mb-2 leading-tight">
            {member.name}
          </CardTitle>
          <div className="flex justify-center mb-3">
            <Badge variant="default" className="px-3 py-1 text-sm font-medium">
              {member.title}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pt-0 p-4 flex-1 flex flex-col">
          {/* Expandable content sections - will grow to fill available space */}
          <div className="flex-1">
            <div className="space-y-4">
              {member.qualification && (
                <div className="p-3 bg-muted/50 rounded-md border border-border/50">
                  <h4 className="text-sm font-semibold mb-2 text-foreground">
                    Qualification
                  </h4>
                  <RichTextRenderer
                    content={getDisplayText(
                      member.qualification,
                      qualificationExpanded
                    )}
                    className="text-sm text-muted-foreground leading-relaxed"
                  />
                  {showViewMoreButton(member.qualification) && (
                    <button
                      onClick={() => {
                        setQualificationExpanded(!qualificationExpanded);
                        onActivity("team_member_qualification_toggle", {
                          member_name: member.name,
                          member_id: member.id,
                          expanded: !qualificationExpanded,
                        });
                      }}
                      className="text-primary hover:text-primary/80 text-sm font-medium mt-2 block"
                    >
                      {qualificationExpanded ? "Show Less" : "Read More"}
                    </button>
                  )}
                </div>
              )}

              {member.description && (
                <div className="p-3 bg-muted/50 rounded-md border border-border/50">
                  <h4 className="text-sm font-semibold mb-2 text-foreground">
                    About
                  </h4>
                  <RichTextRenderer
                    content={getDisplayText(
                      member.description,
                      descriptionExpanded
                    )}
                    className="text-sm text-muted-foreground leading-relaxed"
                  />
                  {showViewMoreButton(member.description) && (
                    <button
                      onClick={() => {
                        setDescriptionExpanded(!descriptionExpanded);
                        onActivity("team_member_description_toggle", {
                          member_name: member.name,
                          member_id: member.id,
                          expanded: !descriptionExpanded,
                        });
                      }}
                      className="text-primary hover:text-primary/80 text-sm font-medium mt-2 block"
                    >
                      {descriptionExpanded ? "Show Less" : "Read More"}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Skills section - consistent position across all cards */}
          {member.skills && (
            <div className="mt-4 pt-4 border-t border-border/50">
              <h4 className="text-sm font-semibold mb-2 text-foreground">
                Skills
              </h4>
              <div className="flex flex-wrap gap-2 min-h-[2rem]">
                {getDisplaySkills(member.skills, skillsExpanded).map(
                  (skill, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  )
                )}
                {!skillsExpanded && shouldShowMoreSkills(member.skills) && (
                  <Badge variant="outline" className="text-xs">
                    +{member.skills.split(",").length - 4} more
                  </Badge>
                )}
              </div>
              {shouldShowMoreSkills(member.skills) && (
                <button
                  onClick={() => {
                    setSkillsExpanded(!skillsExpanded);
                    onActivity("team_member_skills_toggle", {
                      member_name: member.name,
                      member_id: member.id,
                      expanded: !skillsExpanded,
                    });
                  }}
                  className="text-primary hover:text-primary/80 text-sm font-medium mt-2 block"
                >
                  {skillsExpanded ? "Show Less" : "Show All Skills"}
                </button>
              )}
            </div>
          )}

          {/* Contact buttons - fixed at bottom */}
          <div className="mt-4 pt-4 border-t border-border/50">
            <div className="flex justify-center space-x-3">
              {member.email && (
                <Link href={`mailto:${member.email}`}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-10 h-10 p-0"
                    onClick={() =>
                      onActivity("team_member_email_click", {
                        member_name: member.name,
                        member_id: member.id,
                      })
                    }
                  >
                    <Mail className="w-4 h-4" />
                  </Button>
                </Link>
              )}
              {member.github && (
                <Link href={member.github} target="_blank">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-10 h-10 p-0"
                    onClick={() =>
                      onActivity("team_member_github_click", {
                        member_name: member.name,
                        member_id: member.id,
                      })
                    }
                  >
                    <Github className="w-4 h-4" />
                  </Button>
                </Link>
              )}
              {member.linkedin && (
                <Link href={member.linkedin} target="_blank">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-10 h-10 p-0"
                    onClick={() =>
                      onActivity("team_member_linkedin_click", {
                        member_name: member.name,
                        member_id: member.id,
                      })
                    }
                  >
                    <Linkedin className="w-4 h-4" />
                  </Button>
                </Link>
              )}
              {member.phone && (
                <Link href={`tel:${member.phone}`}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-10 h-10 p-0"
                    onClick={() =>
                      onActivity("team_member_phone_click", {
                        member_name: member.name,
                        member_id: member.id,
                      })
                    }
                  >
                    <Phone className="w-4 h-4" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };
  const getGridColumns = (count: number) => {
    if (count === 1) return "grid-cols-1 max-w-md mx-auto";
    if (count === 2) return "grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto";
    if (count === 3)
      return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto";
    return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
  };

  if (loading) {
    return <PageLoading message="Loading team data..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <div className="pt-24 pb-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl font-bold mb-4">Error Loading Team Data</h1>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={fetchTeamData}>Try Again</Button>
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
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Our Team</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Meet the passionate individuals who drive NodeX forward. Our
              diverse team of students and faculty members work together to
              create an amazing tech community.
            </p>
          </div>

          {teamData && (
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-4 mb-8">
                <TabsTrigger value="direc" className="flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  <span className="hidden sm:inline">Board of Students</span>
                  <span className="sm:hidden">BoS</span>
                </TabsTrigger>
                <TabsTrigger value="exec" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span className="hidden sm:inline">Core Committee</span>
                  <span className="sm:hidden">Core</span>
                </TabsTrigger>
                <TabsTrigger value="leads" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span className="hidden sm:inline">Operations Team</span>
                  <span className="sm:hidden">Ops</span>
                </TabsTrigger>
                <TabsTrigger
                  value="faculty"
                  className="flex items-center gap-2"
                >
                  <Award className="w-4 h-4" />
                  <span className="hidden sm:inline">Faculty Mentors</span>
                  <span className="sm:hidden">Faculty</span>
                </TabsTrigger>
              </TabsList>

              {["direc", "exec", "leads", "faculty"].map((category) => (
                <TabsContent key={category} value={category} className="mt-0">
                  <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold mb-4">
                      {getCategoryTitle(category)}
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                      {getCategoryDescription(category)}
                    </p>
                  </div>

                  {teamData[category as keyof TeamData] &&
                  teamData[category as keyof TeamData].length > 0 ? (
                    <div
                      className={`grid gap-6 ${getGridColumns(
                        teamData[category as keyof TeamData].length
                      )}`}
                    >
                      {teamData[category as keyof TeamData].map((member) => (
                        <TeamMemberCard
                          key={member.id}
                          member={member}
                          onActivity={logActivity}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground text-lg">
                        No team members in this category yet.
                      </p>
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
