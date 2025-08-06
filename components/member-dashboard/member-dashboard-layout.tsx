"use client";

import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/global/theme-toggle";
import {
  Users,
  FolderOpen,
  User,
  LogOut,
  Menu,
  GitBranch,
  Activity,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MemberDashboardLayoutProps {
  children: React.ReactNode;
}

const navigationItems = [
  {
    name: "Dashboard",
    href: "/member-dashboard",
    icon: Activity,
  },
  {
    name: "My Teams",
    href: "/member-dashboard/teams",
    icon: Users,
  },
  {
    name: "Resources",
    href: "/member-dashboard/resources",
    icon: FolderOpen,
  },
  {
    name: "Profile",
    href: "/member-dashboard/profile",
    icon: User,
  },
];

export function MemberDashboardLayout({
  children,
}: MemberDashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/member-logout", {
        method: "POST",
      });

      if (response.ok) {
        toast({
          title: "Logged Out",
          description: "You have been successfully logged out.",
        });
        router.push("/member-dashboard/login");
      } else {
        throw new Error("Logout failed");
      }
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to logout. Please try again.",
      });
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo/Header */}
      <div className="flex items-center flex-shrink-0 px-4 pt-5 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary rounded-lg">
            <GitBranch className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">
              Member Portal
            </h1>
            <p className="text-xs text-muted-foreground">NodeX Club Member</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 space-y-1">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Button
              key={item.name}
              variant={isActive ? "secondary" : "ghost"}
              className={`w-full justify-start ${
                isActive
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => {
                router.push(item.href);
                setIsOpen(false); // Close mobile menu
              }}
            >
              <Icon className="mr-3 h-5 w-5" />
              {item.name}
            </Button>
          );
        })}
      </nav>

      {/* Theme Toggle */}
      <div className="px-2 pb-2">
        <div className="flex items-center justify-between p-2">
          <span className="text-sm text-muted-foreground">Theme</span>
          <ThemeToggle />
        </div>
      </div>

      {/* Logout */}
      <div className="px-2 pb-4">
        <Button
          variant="outline"
          className="w-full justify-start border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground"
          onClick={handleLogout}
        >
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-72 lg:flex-col">
        <div className="flex flex-col flex-grow overflow-y-auto bg-card border-r border-border">
          <SidebarContent />
        </div>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden">
        <div className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72 p-0">
                  <SidebarContent />
                </SheetContent>
              </Sheet>

              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-primary rounded-md">
                  <GitBranch className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="font-semibold text-sm">Member Portal</span>
              </div>
            </div>

            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:pl-0">
        <main className="h-full overflow-y-auto pt-16 lg:pt-0">
          <div className="min-h-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
