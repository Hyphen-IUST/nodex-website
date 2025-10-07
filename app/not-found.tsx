"use client";

import React from "react";
import Link from "next/link";
import { Header } from "../components/global/header";
import { Footer } from "../components/global/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Home,
  ArrowLeft,
  Search,
  Code,
  Zap,
  AlertTriangle,
  FileQuestion,
} from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <div className="pt-24 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Main 404 Section */}
          <div className="text-center mb-16">
            {/* Animated 404 Illustration */}
            <div className="relative mb-8">
              <div className="flex items-center justify-center space-x-4 mb-6">
                {/* Animated 404 Numbers */}
                <div className="text-8xl md:text-9xl font-bold text-primary/20 select-none">
                  4
                </div>
                <div className="relative">
                  {/* Spinning gear animation */}
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-8 border-primary/30 border-t-primary animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Code className="w-8 h-8 md:w-10 md:h-10 text-primary" />
                  </div>
                </div>
                <div className="text-8xl md:text-9xl font-bold text-primary/20 select-none">
                  4
                </div>
              </div>

              {/* Floating elements */}
              <div className="absolute top-0 left-1/4 animate-bounce">
                <AlertTriangle className="w-6 h-6 text-orange-500 opacity-60" />
              </div>
              <div className="absolute top-8 right-1/4 animate-pulse">
                <Zap className="w-5 h-5 text-yellow-500 opacity-60" />
              </div>
              <div className="absolute bottom-0 left-1/3 animate-bounce delay-300">
                <FileQuestion className="w-5 h-5 text-blue-500 opacity-60" />
              </div>
            </div>

            {/* Error Message */}
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Page Not Found
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Oops! It looks like this page got lost in the digital void. The
              page you&apos;re looking for might have been moved, deleted, or
              never existed.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button asChild size="lg" className="min-w-[160px]">
                <Link href="/">
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="min-w-[160px]"
                onClick={() => window.history.back()}
              >
                <button>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Go Back
                </button>
              </Button>
            </div>
          </div>

          {/* Helpful Links Section */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-border hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Home className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Home Page</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Return to our main page and explore what Hyphen has to offer
                </p>
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link href="/">Visit Home</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Search className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="font-semibold mb-2">Events</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Check out our upcoming workshops and hackathons
                </p>
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link href="/events">Browse Events</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Code className="w-6 h-6 text-green-500" />
                </div>
                <h3 className="font-semibold mb-2">Join Us</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Become a member of our tech community
                </p>
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link href="/join">Join Hyphen</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Fun Error Codes */}
          <div className="mt-16 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Error Code: 404 • Page Not Found
            </p>
            <div className="flex justify-center space-x-2 text-xs font-mono text-muted-foreground/60">
              <span className="px-2 py-1 bg-muted/50 rounded">HTTP_404</span>
              <span className="px-2 py-1 bg-muted/50 rounded">NOT_FOUND</span>
              <span className="px-2 py-1 bg-muted/50 rounded">ENOENT</span>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
