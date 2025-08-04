"use client";

import React, { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Header } from "../../../components/global/header";
import { Footer } from "../../../components/global/footer";
import {
  Search,
  Filter,
  Download,
  ExternalLink,
  ArrowLeft,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";

interface Resource {
  id: string;
  title: string;
  description: string;
  category: string;
  link?: string;
  file_url?: string;
  type: string;
  tags?: string[];
  semester?: string;
  subject?: string;
  author?: string;
  created: string;
  updated: string;
}

interface Pagination {
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
}

export default function CategoryPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const category = params.category as string;

  const [resources, setResources] = useState<Resource[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || ""
  );
  const [typeFilter, setTypeFilter] = useState(
    searchParams.get("type") || "all"
  );
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page") || "1")
  );

  useEffect(() => {
    fetchResources();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, currentPage, typeFilter]);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        perPage: "12",
      });

      if (searchQuery) params.append("search", searchQuery);
      if (typeFilter && typeFilter !== "all") params.append("type", typeFilter);

      const response = await fetch(`/api/resources/${category}?${params}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setResources(data.resources);
          setPagination(data.pagination);
        } else {
          setError(data.error || "Failed to fetch resources");
        }
      } else {
        setError("Failed to fetch resources");
      }
    } catch (error) {
      console.error("Error fetching resources:", error);
      setError("Failed to fetch resources");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchResources();
  };

  const handleResourceClick = (resource: Resource) => {
    if (resource.link) {
      window.open(resource.link, "_blank");
    } else if (resource.file_url) {
      window.open(resource.file_url, "_blank");
    }
  };

  const formatCategoryName = (slug: string) => {
    return slug
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  if (loading && resources.length === 0) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <section className="pt-32 pb-20 px-6">
          <div className="max-w-6xl mx-auto text-center">
            <p className="text-muted-foreground">Loading resources...</p>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <section className="pt-32 pb-20 px-6">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-3xl font-bold mb-4">Error Loading Resources</h1>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={fetchResources}>Try Again</Button>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <section className="pt-24 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Back Button and Header */}
          <div className="mb-8">
            <Link
              href="/resources"
              className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Resources
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              {formatCategoryName(category)}
            </h1>
            {pagination && (
              <p className="text-muted-foreground">
                {pagination.totalItems} resources found
              </p>
            )}
          </div>

          {/* Search and Filters */}
          <div className="mb-8 space-y-4 md:space-y-0 md:flex md:items-center md:space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="link">Link</SelectItem>
                <SelectItem value="article">Article</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSearch} className="w-full md:w-auto">
              <Filter className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>

          {/* Resources Grid */}
          {resources.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {resources.map((resource) => (
                <Card
                  key={resource.id}
                  className="border-border hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handleResourceClick(resource)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg line-clamp-2">
                        {resource.title}
                      </CardTitle>
                      <div className="ml-2 flex-shrink-0">
                        {resource.file_url ? (
                          <Download className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ExternalLink className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                      {resource.description}
                    </p>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="text-xs">
                          {resource.type}
                        </Badge>
                        {resource.semester && (
                          <Badge variant="outline" className="text-xs">
                            Sem {resource.semester}
                          </Badge>
                        )}
                      </div>

                      {resource.tags && resource.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {resource.tags.slice(0, 3).map((tag, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                          {resource.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{resource.tags.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}

                      {resource.author && (
                        <p className="text-xs text-muted-foreground">
                          By {resource.author}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                No resources found for this category.
              </p>
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center space-x-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>

              {Array.from(
                { length: Math.min(5, pagination.totalPages) },
                (_, i) => {
                  const page = i + 1;
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  );
                }
              )}

              <Button
                variant="outline"
                onClick={() =>
                  setCurrentPage(
                    Math.min(pagination.totalPages, currentPage + 1)
                  )
                }
                disabled={currentPage === pagination.totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
