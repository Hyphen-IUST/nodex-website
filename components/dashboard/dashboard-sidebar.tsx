"use client";

import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/global/theme-toggle";
import {
  Menu,
  Home,
  Users,
  Calendar,
  FileText,
  UserPlus,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  Folder,
  UserCheck,
  Activity,
  BarChart3,
  GitBranch,
} from "lucide-react";

interface DashboardSidebarProps {
  recruiterName?: string;
  hasTeamMgmtPermissions?: boolean;
}

interface NavItem {
  label: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  children?: NavItem[];
  requiresTeamMgmt?: boolean;
}

export function DashboardSidebar({
  recruiterName,
  hasTeamMgmtPermissions = false,
}: DashboardSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  const navItems: NavItem[] = [
    {
      label: "Overview",
      href: "/exec-dashboard",
      icon: Home,
    },
    {
      label: "Recruitment",
      href: "/exec-dashboard/recruitment",
      icon: UserPlus,
    },
    {
      label: "Team Management",
      icon: Users,
      requiresTeamMgmt: true,
      children: [
        {
          label: "All Teams",
          href: "/exec-dashboard/teams",
          icon: Users,
        },
        {
          label: "Create Team",
          href: "/exec-dashboard/teams/create",
          icon: UserCheck,
        },
        {
          label: "Team Analytics",
          href: "/exec-dashboard/teams/analytics",
          icon: BarChart3,
        },
      ],
    },
    {
      label: "Club Members",
      icon: UserCheck,
      requiresTeamMgmt: true,
      children: [
        {
          label: "All Members",
          href: "/exec-dashboard/club-members",
          icon: Users,
        },
        {
          label: "Add Member",
          href: "/exec-dashboard/club-members/create",
          icon: UserPlus,
        },
        {
          label: "Member Analytics",
          href: "/exec-dashboard/club-members/analytics",
          icon: BarChart3,
        },
      ],
    },
    {
      label: "Content Management",
      icon: FileText,
      children: [
        {
          label: "Club Team",
          href: "/exec-dashboard/team",
          icon: Users,
        },
        {
          label: "Events",
          href: "/exec-dashboard/events",
          icon: Calendar,
        },
        {
          label: "Resources",
          href: "/exec-dashboard/resources",
          icon: Folder,
        },
        {
          label: "Resource Requests",
          href: "/exec-dashboard/resource-requests",
          icon: FileText,
        },
      ],
    },
    {
      label: "Board of Students",
      href: "/exec-dashboard/bos",
      icon: UserCheck,
    },
    {
      label: "Activity Log",
      href: "/exec-dashboard/activity",
      icon: Activity,
    },
    {
      label: "Settings",
      href: "/exec-dashboard/settings",
      icon: Settings,
    },
  ];

  const toggleSection = (label: string) => {
    setExpandedSections((prev) =>
      prev.includes(label) ? prev.filter((s) => s !== label) : [...prev, label]
    );
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
      router.push("/exec-dashboard/login");
    } catch (error) {
      console.error("Logout failed:", error);
      router.push("/exec-dashboard/login");
    }
  };

  const isActiveLink = (href: string) => {
    if (href === "/exec-dashboard") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const renderNavItem = (item: NavItem, depth = 0) => {
    // Skip items that require team management permissions if user doesn't have them
    if (item.requiresTeamMgmt && !hasTeamMgmtPermissions) {
      return null;
    }

    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedSections.includes(item.label);
    const isActive = item.href ? isActiveLink(item.href) : false;

    if (hasChildren) {
      return (
        <div key={item.label} className="space-y-1">
          <Button
            variant="ghost"
            className={`w-full justify-start gap-3 h-10 px-3 ${depth > 0 ? "pl-6" : ""
              } ${isActive ? "bg-accent text-accent-foreground" : ""}`}
            onClick={() => toggleSection(item.label)}
          >
            <item.icon className="h-4 w-4 flex-shrink-0" />
            <span className="flex-1 text-left">{item.label}</span>
            {item.badge && (
              <Badge variant="secondary" className="ml-auto">
                {item.badge}
              </Badge>
            )}
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 flex-shrink-0" />
            ) : (
              <ChevronRight className="h-4 w-4 flex-shrink-0" />
            )}
          </Button>
          {isExpanded && (
            <div className="space-y-1 pl-2">
              {item.children?.map((child) => renderNavItem(child, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link key={item.label} href={item.href!} onClick={() => setIsOpen(false)}>
        <Button
          variant="ghost"
          className={`w-full justify-start gap-3 h-10 px-3 ${depth > 0 ? "pl-6" : ""
            } ${isActive ? "bg-accent text-accent-foreground" : ""}`}
        >
          <item.icon className="h-4 w-4 flex-shrink-0" />
          <span className="flex-1 text-left">{item.label}</span>
          {item.badge && (
            <Badge variant="secondary" className="ml-auto">
              {item.badge}
            </Badge>
          )}
        </Button>
      </Link>
    );
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b p-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <GitBranch className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-lg">Hyphen Dashboard</h2>
            {recruiterName && (
              <p className="text-sm text-muted-foreground">{recruiterName}</p>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-4">
        <nav className="space-y-2">
          {navItems.map((item) => renderNavItem(item))}
        </nav>
      </div>

      {/* Footer */}
      <div className="border-t p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Theme</span>
          <ThemeToggle />
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 h-10 px-3 text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-16 bg-background border-b flex items-center px-4">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <SidebarContent />
          </SheetContent>
        </Sheet>
        <div className="flex-1 text-center">
          <h1 className="text-lg font-semibold">Dashboard</h1>
        </div>
        <ThemeToggle />
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-72 lg:flex-col lg:fixed lg:inset-y-0 lg:border-r lg:bg-background">
        <SidebarContent />
      </div>
    </>
  );
}
