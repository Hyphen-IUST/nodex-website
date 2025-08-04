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
  category: "founding" | "core" | "direc";
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
  founding: TeamMember[];
  core: TeamMember[];
  direc: TeamMember[];
}

export default function TeamPage() {
  const [teamData, setTeamData] = useState<TeamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("core");
  const [activeSubTab, setActiveSubTab] = useState("founding");
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

    // Skills helper functions
    const getDisplaySkills = (skillsText: string, isExpanded: boolean) => {
      const skills = skillsText.split(",").map((skill) => skill.trim());
      if (isExpanded) {
        return skills;
      }
      // When collapsed, we'll let CSS handle the line limiting
      return skills;
    };

    const getTotalSkillsCount = (skillsText: string) => {
      return skillsText.split(",").length;
    };

    const hasMoreSkills = (skillsText: string) => {
      const totalSkills = skillsText.split(",").length;
      return totalSkills > 2; // Show +more if more than 2 skills (likely to wrap)
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
          {/* Expandable content sections */}
          <div className="space-y-4 mb-4">
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

          {/* Spacer to push skills and contact to bottom */}
          <div className="flex-1"></div>

          {/* Skills section - always at same level */}
          {member.skills && (
            <div className="pt-4 border-t border-border/50 mb-4">
              <h4 className="text-sm font-semibold mb-2 text-foreground">
                Skills
              </h4>
              <div
                className={`flex flex-wrap gap-2 min-h-[2rem] ${
                  !skillsExpanded ? "overflow-hidden max-h-[3.5rem]" : ""
                }`}
              >
                {getDisplaySkills(member.skills, skillsExpanded).map(
                  (skill: string, index: number) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="text-xs whitespace-nowrap"
                    >
                      {skill}
                    </Badge>
                  )
                )}
              </div>
              {!skillsExpanded && hasMoreSkills(member.skills) && (
                <Badge
                  variant="outline"
                  className="text-xs cursor-pointer hover:bg-muted transition-colors mt-2"
                  onClick={() => {
                    setSkillsExpanded(true);
                    onActivity("team_member_skills_expand", {
                      member_name: member.name,
                      member_id: member.id,
                    });
                  }}
                >
                  +{getTotalSkillsCount(member.skills) - 2} skills
                </Badge>
              )}
              {skillsExpanded && hasMoreSkills(member.skills) && (
                <Badge
                  variant="outline"
                  className="text-xs cursor-pointer hover:bg-muted transition-colors mt-2"
                  onClick={() => {
                    setSkillsExpanded(false);
                    onActivity("team_member_skills_collapse", {
                      member_name: member.name,
                      member_id: member.id,
                    });
                  }}
                >
                  -show less
                </Badge>
              )}
            </div>
          )}

          {/* Contact buttons - fixed at bottom */}
          <div className="pt-4 border-t border-border/50">
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
              {member.phone != 0 && (
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
              diverse team of students work together to create an amazing tech
              community.
            </p>
          </div>

          {teamData && (
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="core" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span className="hidden sm:inline">Core Committee</span>
                  <span className="sm:hidden">Core</span>
                </TabsTrigger>
                <TabsTrigger value="direc" className="flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  <span className="hidden sm:inline">Board of Students</span>
                  <span className="sm:hidden">BoS</span>
                </TabsTrigger>
              </TabsList>

              {/* Core Committee Tab with Sub-tabs */}
              <TabsContent value="core" className="mt-0">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold mb-4">Core Committee</h2>
                </div>

                <Tabs
                  value={activeSubTab}
                  onValueChange={setActiveSubTab}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-2 mb-8 max-w-md mx-auto">
                    <TabsTrigger
                      value="founding"
                      className="flex items-center gap-2"
                    >
                      <Award className="w-4 h-4" />
                      <span>Founding Team</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="core"
                      className="flex items-center gap-2"
                    >
                      <Users className="w-4 h-4" />
                      <span>Core Members</span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="founding" className="mt-0">
                    <div className="text-center mb-8">
                      <h3 className="text-2xl font-bold mb-4">Founding Team</h3>
                      <p className="text-muted-foreground max-w-2xl mx-auto">
                        Leadership team responsible for strategic direction and
                        overall management of NodeX
                      </p>
                    </div>

                    {teamData?.founding && teamData.founding.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-w-6xl mx-auto justify-items-center">
                        {teamData.founding.map((member) => (
                          <div key={member.id} className="w-full max-w-[280px]">
                            <TeamMemberCard
                              member={member}
                              onActivity={logActivity}
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-muted-foreground text-lg">
                          No founding team members yet.
                        </p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="core" className="mt-0">
                    <div className="text-center mb-8">
                      <h3 className="text-2xl font-bold mb-4">Core Members</h3>
                      <p className="text-muted-foreground max-w-2xl mx-auto">
                        Operations team responsible for day-to-day activities
                        and project execution
                      </p>
                    </div>

                    {teamData?.core && teamData.core.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-w-6xl mx-auto justify-items-center">
                        {teamData.core.map((member) => (
                          <div key={member.id} className="w-full max-w-[280px]">
                            <TeamMemberCard
                              member={member}
                              onActivity={logActivity}
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-muted-foreground text-lg">
                          No core members yet.
                        </p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </TabsContent>

              {/* Board of Students Tab */}
              <TabsContent value="direc" className="mt-0">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold mb-4">Board of Students</h2>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Student representatives providing mentorship and fostering
                    community engagement
                  </p>
                </div>

                {teamData?.direc && teamData.direc.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-w-6xl mx-auto justify-items-center">
                    {teamData.direc.map((member) => (
                      <div key={member.id} className="w-full max-w-[280px]">
                        <TeamMemberCard
                          member={member}
                          onActivity={logActivity}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground text-lg">
                      No board members yet.
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
