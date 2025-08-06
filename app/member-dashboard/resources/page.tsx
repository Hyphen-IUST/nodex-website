"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MemberDashboardLayout } from "@/components/member-dashboard/member-dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PageLoading } from "@/components/ui/page-loading";
import {
  FolderOpen,
  ArrowLeft,
  Download,
  ExternalLink,
  Plus,
  Filter,
  Search,
} from "lucide-react";

interface Resource {
  id: string;
  title: string;
  description: string;
  type: string;
  link: string;
  category: string;
  created: string;
  updated: string;
}

interface Category {
  id: string;
  name: string;
  description?: string;
}

export default function MemberResourcesPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [requestForm, setRequestForm] = useState({
    title: "",
    description: "",
    category: "",
    type: "document",
    link: "",
    priority: "medium",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const checkAuthentication = async () => {
    try {
      const response = await fetch("/api/member-auth-check");
      const data = await response.json();

      if (data.authenticated) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        router.push("/member-dashboard/login");
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setIsAuthenticated(false);
      router.push("/member-dashboard/login");
    }
  };

  const fetchResources = async () => {
    try {
      const categoryParam =
        selectedCategory !== "all" ? `?category=${selectedCategory}` : "";
      const response = await fetch(
        `/api/member-dashboard/resources${categoryParam}`
      );
      if (response.ok) {
        const data = await response.json();
        setResources(data.resources || []);
        setCategories(data.categories || []);
      } else {
        console.error("Failed to fetch resources");
      }
    } catch (error) {
      console.error("Error fetching resources:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResourceAccess = async (resourceId: string) => {
    try {
      const response = await fetch(
        `/api/member-dashboard/resources/${resourceId}`
      );
      if (response.ok) {
        const data = await response.json();
        if (data.accessUrl) {
          window.open(data.accessUrl, "_blank");
        }
      } else {
        console.error("Failed to access resource");
      }
    } catch (error) {
      console.error("Error accessing resource:", error);
    }
  };

  const handleResourceRequest = async () => {
    if (
      !requestForm.title ||
      !requestForm.description ||
      !requestForm.category
    ) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/member-dashboard/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestForm),
      });

      if (response.ok) {
        setIsRequestDialogOpen(false);
        setRequestForm({
          title: "",
          description: "",
          category: "",
          type: "document",
          link: "",
          priority: "medium",
        });
        // Show success message or refetch resources
      } else {
        console.error("Failed to submit resource request");
      }
    } catch (error) {
      console.error("Error submitting resource request:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredResources = resources.filter((resource) => {
    const matchesSearch =
      resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  useEffect(() => {
    checkAuthentication();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchResources();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, selectedCategory]);

  if (loading || isAuthenticated === null) {
    return <PageLoading />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <MemberDashboardLayout>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/member-dashboard")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
                Resources
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                Access learning materials and request new resources
              </p>
            </div>
            <Dialog
              open={isRequestDialogOpen}
              onOpenChange={setIsRequestDialogOpen}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Request Resource
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Request New Resource</DialogTitle>
                  <DialogDescription>
                    Submit a request for a new learning resource
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={requestForm.title}
                      onChange={(e) =>
                        setRequestForm((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      placeholder="Resource title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={requestForm.description}
                      onChange={(e) =>
                        setRequestForm((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="Describe the resource you need"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={requestForm.category}
                      onValueChange={(value) =>
                        setRequestForm((prev) => ({ ...prev, category: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Select
                      value={requestForm.type}
                      onValueChange={(value) =>
                        setRequestForm((prev) => ({ ...prev, type: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="document">Document</SelectItem>
                        <SelectItem value="video">Video</SelectItem>
                        <SelectItem value="course">Course</SelectItem>
                        <SelectItem value="tool">Tool</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="link">Link (Optional)</Label>
                    <Input
                      id="link"
                      value={requestForm.link}
                      onChange={(e) =>
                        setRequestForm((prev) => ({
                          ...prev,
                          link: e.target.value,
                        }))
                      }
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={requestForm.priority}
                      onValueChange={(value) =>
                        setRequestForm((prev) => ({ ...prev, priority: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={handleResourceRequest}
                      disabled={isSubmitting}
                      className="flex-1"
                    >
                      {isSubmitting ? "Submitting..." : "Submit Request"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsRequestDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Resources Grid */}
        {filteredResources.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FolderOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Resources Found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || selectedCategory !== "all"
                  ? "No resources match your current filters."
                  : "No resources are available yet."}
              </p>
              <Button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                }}
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((resource) => (
              <Card key={resource.id} className="group">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <CardTitle className="text-lg line-clamp-2">
                        {resource.title}
                      </CardTitle>
                      <div className="flex gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {resource.category}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {resource.type}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="line-clamp-3 mb-4">
                    {resource.description}
                  </CardDescription>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleResourceAccess(resource.id)}
                      className="flex-1"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Access
                    </Button>
                    {resource.link && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(resource.link, "_blank")}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs text-muted-foreground">
                      Added {new Date(resource.created).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Stats */}
        {resources.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Resource Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{resources.length}</div>
                  <p className="text-sm text-muted-foreground">
                    Total Resources
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{categories.length}</div>
                  <p className="text-sm text-muted-foreground">Categories</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {[...new Set(resources.map((r) => r.type))].length}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Resource Types
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {filteredResources.length}
                  </div>
                  <p className="text-sm text-muted-foreground">Showing</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </MemberDashboardLayout>
  );
}
