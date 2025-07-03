"use client";

import React from "react";
import Link from "next/link";
import { Header } from "@/components/global/header";
import { Footer } from "@/components/global/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, ArrowLeft, Clock, UserX, Bell } from "lucide-react";

export function BOSNotAcceptingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <div className="pt-24 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Main Content */}
          <div className="text-center mb-16">
            {/* Icon Section */}
            <div className="relative mb-8">
              <div className="w-24 h-24 bg-gradient-to-br from-amber-500/20 to-amber-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserX className="w-12 h-12 text-amber-600" />
              </div>
            </div>

            {/* Status Badge */}
            <div className="flex justify-center mb-6">
              <Badge
                variant="secondary"
                className="px-4 py-2 text-sm font-medium"
              >
                <Clock className="w-4 h-4 mr-2" />
                Applications Closed
              </Badge>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Board of Students Applications
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              We&apos;re currently{" "}
              <span className="text-amber-600 font-semibold">
                not accepting
              </span>{" "}
              any new members for the Board of Students program at this time.
            </p>
          </div>

          {/* Stay Updated Section */}
          <Card className="border-border mb-8">
            <CardContent className="p-8 text-center">
              <div className="max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold mb-4 flex items-center justify-center gap-2">
                  <Bell className="w-6 h-6 text-primary" />
                  Stay Updated
                </h2>
                <p className="text-muted-foreground mb-6">
                  Want to be notified when Board of Students applications open
                  again? Follow our social media channels or reach out to us
                  directly.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild className="flex items-center gap-2">
                    <a href="mailto:bos@nodex.com">
                      <Mail className="w-4 h-4" />
                      Contact BoS Team
                    </a>
                  </Button>

                  <Button
                    variant="outline"
                    asChild
                    className="flex items-center gap-2"
                  >
                    <Link href="/">
                      <ArrowLeft className="w-4 h-4" />
                      Back to Home
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Alternative Options */}
          <Card className="border-border">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-center">
                Other Ways to Get Involved
              </h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="p-4 bg-muted/30 rounded-lg">
                  <h4 className="font-medium mb-2">General Membership</h4>
                  <p className="text-muted-foreground">
                    Join NodeX as a regular member and participate in our
                    events, workshops, and projects.
                  </p>
                  <Button variant="link" className="p-0 h-auto mt-2" asChild>
                    <Link href="/join">Apply for Membership →</Link>
                  </Button>
                </div>

                <div className="p-4 bg-muted/30 rounded-lg">
                  <h4 className="font-medium mb-2">Events & Workshops</h4>
                  <p className="text-muted-foreground">
                    Attend our public events and workshops to learn and network
                    with the tech community.
                  </p>
                  <Button variant="link" className="p-0 h-auto mt-2" asChild>
                    <Link href="/events">View Events →</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
