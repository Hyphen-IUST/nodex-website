"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Header } from "../../components/global/header";
import { Footer } from "../../components/global/footer";
import { RichTextRenderer } from "@/components/ui/rich-text-renderer";
import { PageLoading } from "@/components/ui/page-loading";
import {
  Github,
  Linkedin,
  Mail,
  Award,
  Users,
  GraduationCap,
  Phone,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
      case "exec":
        return "Executive Board";
      case "direc":
        return "Board of Students";
      case "faculty":
        return "Board of Faculty";
      case "leads":
        return "Team Leads";
      default:
        return "";
    }
  };

  const getCategoryDescription = (category: string) => {
    switch (category) {
      case "exec":
        return "The core leadership team responsible for strategic direction and overall management of NodeX";
      case "direc":
        return "Student representatives managing specific departments, activities, and fostering community engagement";
      case "faculty":
        return "Faculty members providing guidance, academic oversight, and mentorship to the organization";
      case "leads":
        return "Team Leads oversee key initiatives, projects, and support the growth of their respective domains.";
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
      case "faculty":
        return <GraduationCap className="w-6 h-6" />;
      case "leads":
        return <Users className="w-6 h-6 text-yellow-500" />;
      default:
        return null;
    }
  };

  const TeamMemberCard = ({ member }: { member: TeamMember }) => (
    <Card className="border-border hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-background to-muted/20">
      <CardHeader className="text-center pb-4">
        <div className="relative w-28 h-28 mx-auto mb-6">
          <div className="w-28 h-28 bg-gradient-to-br from-primary/20 to-primary/40 rounded-2xl flex items-center justify-center text-primary text-3xl font-bold overflow-hidden border-4 border-background shadow-lg">
            {member.photo ? (
              <Image
                src={member.photo}
                alt={member.name}
                width={112}
                height={112}
                className="w-full h-full object-cover rounded-xl"
              />
            ) : (
              member.name
                .split(" ")
                .map((n) => n[0])
                .join("")
            )}
          </div>
        </div>
        <CardTitle className="text-xl font-bold mb-2">{member.name}</CardTitle>
        <div className="flex justify-center mb-3">
          <Badge variant="default" className="px-3 py-1 font-medium">
            {member.title}
          </Badge>
        </div>
        {member.qualification && (
          <div className="text-sm text-muted-foreground border-t border-border/50 pt-3 mt-2">
            <RichTextRenderer
              content={member.qualification}
              className="text-xs leading-relaxed"
            />
          </div>
        )}
      </CardHeader>
      <CardContent className="pt-2">
        {member.description && (
          <div className="mb-6 p-3 bg-muted/30 rounded-lg border border-border/30">
            <RichTextRenderer
              content={member.description}
              className="text-sm text-muted-foreground leading-relaxed"
            />
          </div>
        )}

        {member.skills && (
          <div className="mb-6">
            <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <div className="w-1 h-4 bg-primary rounded-full"></div>
              Expertise
            </h4>
            <div className="flex flex-wrap gap-2">
              {member.skills.split(",").map((skill, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="text-xs py-1 px-2 font-medium"
                >
                  {skill.trim()}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2 justify-center pt-4 border-t border-border/30">
          {member.email && (
            <Button variant="outline" size="sm" asChild>
              <a href={`mailto:${member.email}`}>
                <Mail className="w-4 h-4 mr-1" />
                Email
              </a>
            </Button>
          )}
          {member.phone != 0 && (
            <Button variant="outline" size="sm" asChild>
              <a href={`tel:${member.phone}`}>
                <Phone className="w-4 h-4 mr-1" />
                Phone
              </a>
            </Button>
          )}
          {member.github && (
            <Button variant="outline" size="sm" asChild>
              <a href={member.github} target="_blank" rel="noopener noreferrer">
                <Github className="w-4 h-4 mr-1" />
                GitHub
              </a>
            </Button>
          )}
          {member.linkedin && (
            <Button variant="outline" size="sm" asChild>
              <a
                href={member.linkedin}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Linkedin className="w-4 h-4 mr-1" />
                LinkedIn
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const TeamSection = ({
    category,
    members,
  }: {
    category: keyof TeamData;
    members: TeamMember[];
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
        <div
          className={`grid gap-8 ${
            members.length >= 3
              ? "md:grid-cols-3"
              : members.length === 2
              ? "md:grid-cols-2 max-w-4xl mx-auto"
              : "md:grid-cols-1 max-w-md mx-auto"
          }`}
        >
          {members.map((member) => (
            <TeamMemberCard key={member.id} member={member} />
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
              <TeamSection category="direc" members={teamData.direc} />

              {/* Team Leads */}
              <TeamSection category="leads" members={teamData.leads} />

              {/* Board of Faculty */}
              <TeamSection category="faculty" members={teamData.faculty} />

              {/* Executive Board */}
              <TeamSection category="exec" members={teamData.exec} />
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
