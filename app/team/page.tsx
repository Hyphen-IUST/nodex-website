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
        return "Board of Students (BoS)";
      case "exec":
        return "Core Committee";
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
      case "leads":
        return "Operations specialists overseeing key areas and day-to-day activities";
      default:
        return "";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "exec":
        return <Users className="w-6 h-6" />;
      case "direc":
        return <Award className="w-6 h-6" />;
      case "leads":
        return <Users className="w-6 h-6 text-yellow-500" />;
      default:
        return null;
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

    // Simple logic: only truncate if text is very long AND not expanded
    const shouldTruncate = (text: string, isExpanded: boolean) => {
      return text.length > 500 && !isExpanded;
    };

    const getDisplayText = (text: string, isExpanded: boolean) => {
      if (shouldTruncate(text, isExpanded)) {
        return text.substring(0, 300) + "...";
      }
      return text;
    };

    const showViewMoreButton = (text: string) => {
      return text.length > 500;
    };

    return (
      <Card className="border-border hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-background to-muted/20 flex flex-col h-full">
        <CardHeader className="text-center pb-3 p-4">
          <div className="relative w-16 h-16 mx-auto mb-3">
            <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/40 rounded-xl flex items-center justify-center text-primary text-lg font-bold overflow-hidden border-2 border-background shadow-md">
              {member.photo ? (
                <Image
                  src={member.photo}
                  alt={member.name}
                  width={64}
                  height={64}
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
          <CardTitle className="text-sm font-bold mb-2 leading-tight">
            {member.name}
          </CardTitle>
          <div className="flex justify-center mb-2">
            <Badge
              variant="default"
              className="px-2 py-0.5 text-xs font-medium"
            >
              {member.title}
            </Badge>
          </div>
          {member.qualification && (
            <div className="text-xs text-muted-foreground border-t border-border/50 pt-2 mt-2">
              <RichTextRenderer
                content={getDisplayText(
                  member.qualification,
                  qualificationExpanded
                )}
                className="text-xs leading-relaxed"
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
                  className="text-primary hover:text-primary/80 text-xs font-medium mt-1 block"
                >
                  {qualificationExpanded ? "View Less" : "View More"}
                </button>
              )}
            </div>
          )}
        </CardHeader>
        <CardContent className="pt-0 p-4 flex-1 flex flex-col">
          {member.description && (
            <div className="mb-3 p-2 bg-muted/30 rounded-md border border-border/30">
              <RichTextRenderer
                content={getDisplayText(
                  member.description,
                  descriptionExpanded
                )}
                className="text-xs text-muted-foreground leading-relaxed"
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
                  className="text-primary hover:text-primary/80 text-xs font-medium mt-1 block"
                >
                  {descriptionExpanded ? "View Less" : "View More"}
                </button>
              )}
            </div>
          )}

          {member.skills && (
            <div className="mb-3">
              <h4 className="font-semibold text-xs mb-2 flex items-center gap-1">
                <div className="w-0.5 h-3 bg-primary rounded-full"></div>
                Skills
              </h4>
              <div className="flex flex-wrap gap-1">
                {member.skills
                  .split(",")
                  .slice(0, 4)
                  .map((skill, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="text-xs py-0.5 px-1.5 font-medium"
                    >
                      {skill.trim()}
                    </Badge>
                  ))}
                {member.skills.split(",").length > 4 && (
                  <Badge
                    variant="secondary"
                    className="text-xs py-0.5 px-1.5 font-medium"
                  >
                    +{member.skills.split(",").length - 4}
                  </Badge>
                )}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-1 justify-center pt-2 border-t border-border/30 mt-auto">
            {member.email && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs"
                asChild
              >
                <a href={`mailto:${member.email}`}>
                  <Mail className="w-3 h-3 mr-1" />
                  Email
                </a>
              </Button>
            )}
            {member.phone != 0 && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs"
                asChild
              >
                <a href={`tel:${member.phone}`}>
                  <Phone className="w-3 h-3 mr-1" />
                  Call
                </a>
              </Button>
            )}
            {member.github && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs"
                asChild
              >
                <Link
                  href={member.github}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="w-3 h-3" />
                </Link>
              </Button>
            )}
            {member.linkedin && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs"
                asChild
              >
                <Link
                  href={member.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Linkedin className="w-3 h-3" />
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const getGridColumns = (memberCount: number) => {
    // Use 3 columns on large screens for much wider cards, center grid
    if (memberCount >= 3)
      return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 justify-center";
    if (memberCount === 2)
      return "grid-cols-1 sm:grid-cols-2 max-w-3xl mx-auto justify-center";
    return "grid-cols-1 max-w-lg mx-auto justify-center";
  };

  const TeamSection = ({
    category,
    members,
    onActivity,
  }: {
    category: keyof TeamData;
    members: TeamMember[];
    onActivity: (action: string, data?: Record<string, unknown>) => void;
  }) => (
    <section className="mb-16">
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="text-primary">{getCategoryIcon(category)}</div>
          <h2 className="text-3xl font-bold">{getCategoryTitle(category)}</h2>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {getCategoryDescription(category)}
        </p>
      </div>

      {members.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No team members found in this category.
          </p>
        </div>
      ) : (
        <div className={`grid gap-4 ${getGridColumns(members.length)}`}>
          {members.map((member) => (
            <TeamMemberCard
              key={member.id}
              member={member}
              onActivity={onActivity}
            />
          ))}
        </div>
      )}
    </section>
  );

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
            <>
              {/* Board of Students */}
              <TeamSection
                category="direc"
                members={teamData.direc}
                onActivity={logActivity}
              />

              {/* Operations Team */}
              <TeamSection
                category="leads"
                members={teamData.leads}
                onActivity={logActivity}
              />

              {/* Executive Board */}
              <TeamSection
                category="exec"
                members={teamData.exec}
                onActivity={logActivity}
              />
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
