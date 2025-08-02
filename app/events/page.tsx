"use client";

import React, { useState, useEffect } from "react";
import { Header } from "../../components/global/header";
import { Footer } from "../../components/global/footer";
import { GallerySection } from "../../components/global/gallery-section";
import { Calendar, Clock } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RichTextRenderer } from "@/components/ui/rich-text-renderer";
import { PageLoading } from "@/components/ui/page-loading";
import Link from "next/link";

interface Event {
  id: string;
  title: string;
  description: string;
  remSpots: number;
  from: string;
  to: string;
  regLink: string;
  active: boolean;
  archived: boolean;
  category: string;
  created: string;
  updated: string;
}

interface EventsData {
  active: Event[];
  archived: Event[];
}

export default function EventsPage() {
  const [events, setEvents] = useState<EventsData>({
    active: [],
    archived: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch("/api/events");
      const data = await response.json();

      if (data.success) {
        setEvents(data.events);
      } else {
        setError("Failed to fetch events");
      }
    } catch (err) {
      console.error("Error fetching events:", err);
      setError("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return dateString;
    }
  };

  const getEventDateTime = (from: string, to: string) => {
    try {
      const fromDate = new Date(from);
      const toDate = new Date(to);

      // Check if it's the same day
      const sameDay = fromDate.toDateString() === toDate.toDateString();

      if (sameDay) {
        // Same day event - show date once, then time range
        return `${fromDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })} • ${fromDate.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })} - ${toDate.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })}`;
      } else {
        // Multi-day event - show full date and time for both
        return `${formatDateTime(from)} - ${formatDateTime(to)}`;
      }
    } catch {
      return `${from} - ${to}`;
    }
  };

  if (loading) {
    return <PageLoading message="Loading events..." />;
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

          {error ? (
            <div className="text-center py-12">
              <p className="text-lg text-red-500">{error}</p>
            </div>
          ) : (
            <>
              {/* Active Events */}
              <section className="mb-16">
                <h2 className="text-3xl font-bold mb-8">Active Events</h2>
                {events.active.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-6">
                    {events.active.map((event) => (
                      <Card
                        key={event.id}
                        className="border-border hover:shadow-lg transition-shadow"
                      >
                        <CardHeader>
                          <div className="flex justify-between items-start mb-2">
                            <Badge variant="outline" className="mb-2">
                              {event.category}
                            </Badge>
                            {event.remSpots > 0 && (
                              <span className="text-sm text-muted-foreground">
                                {event.remSpots} spots remaining
                              </span>
                            )}
                          </div>
                          <CardTitle className="text-xl">
                            {event.title}
                          </CardTitle>
                          <CardDescription>
                            <RichTextRenderer content={event.description} />
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex items-center text-sm">
                              <Clock className="w-4 h-4 mr-2" />
                              {getEventDateTime(event.from, event.to)}
                            </div>
                            <Link href={event.regLink} passHref>
                              <Button className="w-full mt-4">
                                Register Now
                              </Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="border-border">
                    <CardContent className="text-center py-12">
                      <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-xl font-semibold mb-2">
                        No Active Events
                      </h3>
                      <p className="text-muted-foreground">
                        There are no active events at the moment. Check back
                        soon for new workshops and activities!
                      </p>
                    </CardContent>
                  </Card>
                )}
              </section>

              {/* Archived Events */}
              {events.archived.length > 0 && (
                <section>
                  <h2 className="text-3xl font-bold mb-8">Past Events</h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.archived.map((event) => (
                      <Card key={event.id} className="border-border">
                        <CardHeader>
                          <div className="flex justify-between items-start mb-2">
                            <Badge variant="secondary" className="mb-2">
                              {event.category}
                            </Badge>
                          </div>
                          <CardTitle className="text-lg">
                            {event.title}
                          </CardTitle>
                          <CardDescription>
                            <RichTextRenderer content={event.description} />
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex items-center text-sm">
                              <Clock className="w-4 h-4 mr-2" />
                              {getEventDateTime(event.from, event.to)}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </div>

      {/* Gallery Section */}
      <GallerySection />

      <Footer />
    </div>
  );
}
