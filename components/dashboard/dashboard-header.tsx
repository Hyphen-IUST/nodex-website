"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ThemeToggle } from "../global/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  Users,
  Calendar,
  FolderOpen,
  UserCog,
  Settings,
  LogOut,
  ChevronDown,
} from "lucide-react";
import Image from "next/image";

interface DashboardHeaderProps {
  recruiterName?: string;
}

export function DashboardHeader({
  recruiterName = "Admin",
}: DashboardHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (path: string) => {
    // For the main dashboard, only match exactly
    if (path === "/exec-dashboard") {
      return pathname === "/exec-dashboard";
    }
    // For other paths, check if pathname starts with the path
    return pathname === path || pathname.startsWith(path + "/");
  };

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/logout", {
        method: "POST",
      });

      if (response.ok) {
        router.push("/exec-dashboard/login");
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const navItems = [
    {
      name: "Dashboard",
      path: "/exec-dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Recruitment",
      path: "/exec-dashboard/recruitment",
      icon: Users,
    },
    {
      name: "Events",
      path: "/exec-dashboard/events",
      icon: Calendar,
    },
    {
      name: "Resources",
      path: "/exec-dashboard/resources",
      icon: FolderOpen,
    },
    {
      name: "Board of Students",
      path: "/exec-dashboard/bos",
      icon: UserCog,
    },
    {
      name: "Team",
      path: "/exec-dashboard/team",
      icon: Users,
    },
    {
      name: "Settings",
      path: "/exec-dashboard/settings",
      icon: Settings,
    },
  ];

  return (
    <nav className="sticky top-0 w-full bg-background/95 backdrop-blur-sm border-b border-border z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          {/* Left side - NodeX logo */}
          <Link href="/exec-dashboard" className="flex items-center space-x-2">
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
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${
                    isActive(item.path)
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Right side - Theme toggle and profile */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="text-xs">
                      {recruiterName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:block text-sm font-medium">
                    {recruiterName}
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center justify-start gap-2 p-2">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="text-xs">
                      {recruiterName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{recruiterName}</p>
                    <p className="text-xs text-muted-foreground">
                      Administrator
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden pb-3">
          <div className="flex flex-wrap gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center space-x-1 px-2 py-1 rounded text-xs font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${
                    isActive(item.path)
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
