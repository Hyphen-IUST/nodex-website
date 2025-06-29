"use client";

import React, { useState, useEffect } from "react";
import { Header } from "../../components/global/header";
import { Footer } from "../../components/global/footer";
import { RichTextRenderer } from "@/components/ui/rich-text-renderer";
import { Calendar, Users, Clock, Loader2, CalendarX } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Event {
  id: string;
  title: string;
  description: string;
  remSpots: number;
  from: string;
  to: string;
  active: boolean;
  archived: boolean;
  created: string;
  updated: string;
}

interface EventsData {
  active: Event[];
  archived: Event[];
}

export default function EventsPage() {
  const [eventsData, setEventsData] = useState<EventsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEventsData();
  }, []);

  const fetchEventsData = async () => {
    try {
      const response = await fetch("/api/events");
      if (!response.ok) {
        throw new Error("Failed to fetch events data");
      }
      const data = await response.json();
      setEventsData(data.events);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDateRange = (from: string, to: string) => {
    const fromDate = new Date(from);
    const toDate = new Date(to);

    // Check if it's the same day
    if (fromDate.toDateString() === toDate.toDateString()) {
      return {
        date: formatDate(from),
        time: `${formatTime(from)} - ${formatTime(to)}`,
      };
    } else {
      return {
        date: `${formatDate(from)} - ${formatDate(to)}`,
        time: `${formatTime(from)} - ${formatTime(to)}`,
      };
    }
  };

  const EventCard = ({
    event,
    isArchived = false,
  }: {
    event: Event;
    isArchived?: boolean;
  }) => {
    const { date, time } = formatDateRange(event.from, event.to);

    return (
      <Card className="border-border hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex justify-between items-start mb-2">
            <Badge
              variant={isArchived ? "secondary" : "default"}
              className="mb-2"
            >
              {isArchived ? "Archived" : "Active"}
            </Badge>
            {!isArchived && (
              <span className="text-sm text-muted-foreground">
                {event.remSpots > 0
                  ? `${event.remSpots} spots remaining`
                  : "Event Full"}
              </span>
            )}
          </div>
          <CardTitle className="text-xl">{event.title}</CardTitle>
          <CardDescription>
            <RichTextRenderer
              content={event.description}
              className="text-sm text-muted-foreground"
            />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center text-sm">
              <Calendar className="w-4 h-4 mr-2" />
              {date}
            </div>
            <div className="flex items-center text-sm">
              <Clock className="w-4 h-4 mr-2" />
              {time}
            </div>
            {!isArchived && (
              <Button className="w-full mt-4" disabled={event.remSpots === 0}>
                {event.remSpots > 0 ? "Register Now" : "Event Full"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <div className="pt-24 pb-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl font-bold mb-4">Error Loading Events</h1>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={fetchEventsData}>Try Again</Button>
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
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Events</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Join our workshops, hackathons, and study sessions. Build skills,
              make connections, and grow with the NodeX community.
            </p>
          </div>

          {/* Active Events */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8">Upcoming Events</h2>
            {eventsData && eventsData.active.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6">
                {eventsData.active.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <CalendarX className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  No Currently Planned Events
                </h3>
                <p className="text-muted-foreground">
                  Keep visiting! We're always planning exciting new events and
                  workshops.
                </p>
              </div>
            )}
          </section>

          {/* Archived Events */}
          {eventsData && eventsData.archived.length > 0 && (
            <section className="mb-16">
              <h2 className="text-3xl font-bold mb-8">Archived Events</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {eventsData.archived.map((event) => (
                  <EventCard key={event.id} event={event} isArchived={true} />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
