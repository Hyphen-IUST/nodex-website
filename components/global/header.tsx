"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LogIn } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname.startsWith(path)) return true;
    return false;
  };

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Team", path: "/team" },
    { name: "Events", path: "/events" },
    { name: "Collaborate", path: "/collaborate" },
    { name: "Join", path: "/join" },
  ];

  return (
    <nav className="fixed top-0 w-full bg-background/95 backdrop-blur-sm border-b border-border z-50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          {/* Left side - NodeX logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 dark:invert rounded-sm flex items-center justify-center">
              <Image
                src={"https://i.ibb.co/RpRrXLM8/node-Xblack.png"}
                width={32}
                height={32}
                alt="NodeX Logo"
              />
            </div>
            <span className="text-xl font-bold">NodeX</span>
          </Link>

          {/* Center - Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.path}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? "text-foreground border-b-2 border-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Right - Member Login, IUST Logo and Theme Toggle (Desktop only) */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/member-dashboard">
              <Button variant="outline" size="sm">
                <LogIn className="mr-2 w-4 h-4" />
                Member Portal
              </Button>
            </Link>
            <div className="w-10 h-10 flex items-center justify-center">
              <Image
                src="https://i.ibb.co/QFN6zx4T/iust-logo.png"
                width={40}
                height={40}
                alt="IUST Logo"
                className="object-contain"
              />
            </div>
            <ThemeToggle />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <div className="w-10 h-10 flex items-center justify-center">
              <Image
                src="https://i.ibb.co/QFN6zx4T/iust-logo.png"
                width={40}
                height={40}
                alt="IUST Logo"
                className="object-contain"
              />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-sm">
            <div className="py-4 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-6 py-3 text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? "text-foreground bg-muted"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              {/* Member Login */}
              <div className="px-6 py-3 border-t border-border">
                <Link
                  href="/member-dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Button variant="outline" size="sm">
                    <LogIn className="mr-2 w-4 h-4" />
                    Member Portal
                  </Button>
                </Link>
              </div>
              {/* Theme toggle in mobile menu */}
              <div className="px-6 py-3 flex items-center justify-between border-t border-border">
                <span className="text-sm font-medium text-muted-foreground">
                  Theme
                </span>
                <ThemeToggle />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
