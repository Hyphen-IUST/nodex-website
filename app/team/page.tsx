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
  Code,
  GraduationCap,
  Phone,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface TeamMember {
  id: string;
  name: string;
  photo?: string;
  category: "exec" | "direc" | "lead" | "faculty";
  title: string;
  qualification?: string;
  description?: string;
  skills?: string;
  email?: string;
  phone?: string;
  github?: string;
  linkedin?: string;
}

interface TeamData {
  exec: TeamMember[];
  direc: TeamMember[];
  lead: TeamMember[];
  faculty: TeamMember[];
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
        return "Board of Directors";
      case "lead":
        return "Team Leads";
      case "faculty":
        return "Faculty Board";
      default:
        return "";
    }
  };

  const getCategoryDescription = (category: string) => {
    switch (category) {
      case "exec":
        return "The core leadership team responsible for strategic direction and overall management";
      case "direc":
        return "Directors overseeing specific functional areas and department operations";
      case "lead":
        return "Team leads managing specialized tracks and student activities";
      case "faculty":
        return "Faculty members providing guidance, support, and academic oversight";
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
      case "lead":
        return <Code className="w-6 h-6" />;
      case "faculty":
        return <GraduationCap className="w-6 h-6" />;
      default:
        return null;
    }
  };

  const TeamMemberCard = ({ member }: { member: TeamMember }) => (
    <Card className="border-border hover:shadow-lg transition-shadow">
      <CardHeader className="text-center">
        <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
          {member.photo ? (
            <Image
              src={member.photo}
              alt={member.name}
              width={96}
              height={96}
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            member.name
              .split(" ")
              .map((n) => n[0])
              .join("")
          )}
        </div>
        <CardTitle className="text-xl">{member.name}</CardTitle>
        <CardDescription>
          <Badge variant="default" className="mb-2">
            {member.title}
          </Badge>
          {member.qualification && (
            <div className="text-sm text-muted-foreground mt-2">
              <RichTextRenderer
                content={member.qualification}
                className="text-xs"
              />
            </div>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {member.description && (
          <div className="mb-4">
            <RichTextRenderer
              content={member.description}
              className="text-sm text-muted-foreground"
            />
          </div>
        )}

        {member.skills && (
          <div className="mb-4">
            <h4 className="font-semibold text-sm mb-2">Skills:</h4>
            <div className="flex flex-wrap gap-1">
              {member.skills.split(",").map((skill, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {skill.trim()}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2 justify-center">
          {member.email && (
            <Button variant="outline" size="sm" asChild>
              <a href={`mailto:${member.email}`}>
                <Mail className="w-4 h-4 mr-1" />
                Email
              </a>
            </Button>
          )}
          {member.phone && (
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
              {/* Executive Board */}
              <TeamSection category="exec" members={teamData.exec} />

              {/* Board of Directors */}
              <TeamSection category="direc" members={teamData.direc} />

              {/* Team Leads */}
              <TeamSection category="lead" members={teamData.lead} />

              {/* Faculty Board */}
              <TeamSection category="faculty" members={teamData.faculty} />
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
