"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PageLoading } from "@/components/ui/page-loading";
import { useToast } from "@/hooks/use-toast";
import { useActivityLogger } from "@/hooks/useExecActivityLogger";
import {
  FolderOpen,
  Plus,
  Edit3,
  Trash2,
  Loader2,
  ExternalLink,
  BookOpen,
  FileText,
  Video,
  Code,
  Link as LinkIcon,
  AlertTriangle,
} from "lucide-react";

interface Resource {
  id: string;
  title: string;
  description: string;
  category: string;
  type: "document" | "video" | "code" | "link" | "other";
  link: string;
  created: string;
  updated: string;
}

interface ResourceCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  slug: string;
}

interface ConfirmationDialog {
  open: boolean;
  title: string;
  description: string;
  action: () => void;
}

const resourceTypes = [
  { value: "document", label: "Document", icon: FileText },
  { value: "video", label: "Video", icon: Video },
  { value: "code", label: "Code", icon: Code },
  { value: "link", label: "Link", icon: LinkIcon },
  { value: "other", label: "Other", icon: BookOpen },
];

export default function ResourcesManagement() {
  const router = useRouter();
  const { toast } = useToast();
  const { logActivity } = useActivityLogger();

  const truncateText = (text: string, maxLength: number = 80) => {
    if (!text || text.length <= maxLength) return text;
    const truncated = text.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(" ");
    const cutoff = lastSpace > maxLength * 0.8 ? lastSpace : maxLength;
    return text.substring(0, cutoff).trim() + "...";
  };
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [categories, setCategories] = useState<ResourceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    resource: Resource | null;
  }>({ open: false, resource: null });
  const [confirmationDialog, setConfirmationDialog] =
    useState<ConfirmationDialog>({
      open: false,
      title: "",
      description: "",
      action: () => {},
    });
  const [submitting, setSubmitting] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<ResourceCategory | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    type: "document" as Resource["type"],
    link: "",
  });

  // Category form state
  const [categoryFormData, setCategoryFormData] = useState({
    name: "",
    description: "",
    icon: "",
    slug: "",
  });

  const checkAuthentication = async () => {
    try {
      const response = await fetch("/api/auth-check");
      const data = await response.json();

      if (data.authenticated) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        router.push("/exec-dashboard/login");
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setIsAuthenticated(false);
      router.push("/exec-dashboard/login");
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/dashboard/resource-categories");
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.categories) {
          setCategories(data.categories);
        }
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const fetchResources = async () => {
    try {
      const response = await fetch("/api/dashboard/resources");
      if (response.ok) {
        const data = await response.json();
        setResources(data.resources || []);
      }
    } catch (error) {
      console.error("Failed to fetch resources:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuthentication();
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchResources();
    }
  }, [isAuthenticated]);

  const handleCreateResource = () => {
    setEditingResource(null);
    setFormData({
      title: "",
      description: "",
      category: "",
      type: "document",
      link: "",
    });
    setDialogOpen(true);
  };

  const handleEditResource = (resource: Resource) => {
    setEditingResource(resource);
    setFormData({
      title: resource.title,
      description: resource.description,
      category: resource.category,
      type: resource.type,
      link: resource.link,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = editingResource
        ? `/api/dashboard/resources/${editingResource.id}`
        : "/api/dashboard/resources";
      const method = editingResource ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const action = editingResource ? "updated" : "created";

        await logActivity({
          action: editingResource ? "Update Resource" : "Create Resource",
          resource_type: "resource",
          resource_id: editingResource?.id,
          details: `Resource "${formData.title}" ${action}`,
        });

        toast({
          title: editingResource ? "Resource Updated" : "Resource Created",
          description: `Resource "${formData.title}" has been ${action} successfully.`,
        });
        setDialogOpen(false);
        fetchResources();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save resource");
      }
    } catch (error) {
      console.error("Error saving resource:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to save resource",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteResource = async () => {
    if (!deleteDialog.resource) return;

    try {
      const response = await fetch(
        `/api/dashboard/resources/${deleteDialog.resource.id}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        await logActivity({
          action: "Delete Resource",
          resource_type: "resource",
          resource_id: deleteDialog.resource.id,
          details: `Resource "${deleteDialog.resource.title}" deleted`,
        });

        toast({
          title: "Resource Deleted",
          description: `Resource "${deleteDialog.resource.title}" has been deleted.`,
        });
        setDeleteDialog({ open: false, resource: null });
        fetchResources();
      } else {
        throw new Error("Failed to delete resource");
      }
    } catch (error) {
      console.error("Error deleting resource:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete resource",
      });
    }
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.name : categoryId;
  };

  const handleCreateCategory = () => {
    setEditingCategory(null);
    setCategoryFormData({
      name: "",
      description: "",
      icon: "",
      slug: "",
    });
    setCategoryDialogOpen(true);
  };

  const handleEditCategory = (category: ResourceCategory) => {
    setEditingCategory(category);
    setCategoryFormData({
      name: category.name,
      description: category.description,
      icon: category.icon,
      slug: category.slug,
    });
    setCategoryDialogOpen(true);
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Generate slug if not provided
      const slug =
        categoryFormData.slug ||
        categoryFormData.name
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "");

      const url = editingCategory
        ? `/api/dashboard/resource-categories/${editingCategory.id}`
        : "/api/dashboard/resource-categories";
      const method = editingCategory ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...categoryFormData,
          slug,
        }),
      });

      if (response.ok) {
        await logActivity({
          action: editingCategory ? "Update Category" : "Create Category",
          resource_type: "resource_category",
          resource_id: editingCategory?.id || "new",
          details: `Category "${categoryFormData.name}" ${
            editingCategory ? "updated" : "created"
          }`,
        });

        toast({
          title: editingCategory ? "Category Updated" : "Category Created",
          description: `Category "${categoryFormData.name}" has been ${
            editingCategory ? "updated" : "created"
          }.`,
        });
        setCategoryDialogOpen(false);
        fetchCategories();
      } else {
        throw new Error(
          editingCategory
            ? "Failed to update category"
            : "Failed to create category"
        );
      }
    } catch (error) {
      console.error("Error submitting category:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: editingCategory
          ? "Failed to update category"
          : "Failed to create category",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCategory = async (category: ResourceCategory) => {
    setConfirmationDialog({
      open: true,
      title: "Delete Category",
      description: `Are you sure you want to delete the category "${category.name}"? This action cannot be undone and may affect existing resources.`,
      action: async () => {
        try {
          const response = await fetch(
            `/api/dashboard/resource-categories/${category.id}`,
            {
              method: "DELETE",
            }
          );

          if (response.ok) {
            await logActivity({
              action: "Delete Category",
              resource_type: "resource_category",
              resource_id: category.id,
              details: `Category "${category.name}" deleted`,
            });

            toast({
              title: "Category Deleted",
              description: `Category "${category.name}" has been deleted.`,
            });
            fetchCategories();
          } else {
            throw new Error("Failed to delete category");
          }
        } catch (error) {
          console.error("Error deleting category:", error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to delete category",
          });
        }
      },
    });
  };

  const getTypeIcon = (type: Resource["type"]) => {
    const typeConfig = resourceTypes.find((t) => t.value === type);
    const Icon = typeConfig?.icon || BookOpen;
    return <Icon className="w-4 h-4" />;
  };

  const getTypeBadgeColor = (type: Resource["type"]) => {
    switch (type) {
      case "document":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "video":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "code":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "link":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  if (loading || isAuthenticated === null) {
    return <PageLoading />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <DashboardLayout>
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              Resource Management
            </h1>
            <p className="text-muted-foreground">
              Manage learning resources and educational materials
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCreateCategory}>
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
            <Button onClick={handleCreateResource}>
              <Plus className="w-4 h-4 mr-2" />
              Add Resource
            </Button>
          </div>
        </div>

        {/* Resources List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="w-5 h-5" />
              Resources ({resources.length})
            </CardTitle>
            <CardDescription>
              Manage all learning resources and materials
            </CardDescription>
          </CardHeader>
          <CardContent>
            {resources.length === 0 ? (
              <div className="text-center py-8">
                <FolderOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No resources found</p>
                <Button onClick={handleCreateResource} className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Add your first resource
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resources.map((resource) => (
                    <TableRow key={resource.id}>
                      <TableCell className="max-w-xs">
                        <div>
                          <p className="font-medium">{resource.title}</p>
                          <p className="text-sm text-muted-foreground overflow-hidden">
                            {truncateText(resource.description, 25)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getCategoryName(resource.category)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getTypeBadgeColor(resource.type)}>
                          <span className="flex items-center gap-1">
                            {getTypeIcon(resource.type)}
                            {
                              resourceTypes.find(
                                (t) => t.value === resource.type
                              )?.label
                            }
                          </span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <a
                          href={resource.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span className="text-sm truncate max-w-32">
                            {resource.link}
                          </span>
                        </a>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {new Date(resource.created).toLocaleDateString()}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditResource(resource)}
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setDeleteDialog({ open: true, resource })
                            }
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Categories Management */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="w-5 h-5" />
              Categories ({categories.length})
            </CardTitle>
            <CardDescription>Manage resource categories</CardDescription>
          </CardHeader>
          <CardContent>
            {categories.length === 0 ? (
              <div className="text-center py-8">
                <FolderOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No categories found</p>
                <Button onClick={handleCreateCategory} className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Add your first category
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Icon</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell>
                        <p className="font-medium">{category.name}</p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-muted-foreground">
                          {truncateText(category.description, 25)}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{category.slug}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-lg">{category.icon || "📁"}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditCategory(category)}
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteCategory(category)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Create/Edit Resource Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingResource ? "Edit Resource" : "Add New Resource"}
            </DialogTitle>
            <DialogDescription>
              {editingResource
                ? "Update resource details"
                : "Fill in the resource information"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Resource Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Enter resource title"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Resource description"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData({ ...formData, category: value })
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
                    value={formData.type}
                    onValueChange={(value: Resource["type"]) =>
                      setFormData({ ...formData, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {resourceTypes.map((type) => {
                        const Icon = type.icon;
                        return (
                          <SelectItem key={type.value} value={type.value}>
                            <span className="flex items-center gap-2">
                              <Icon className="w-4 h-4" />
                              {type.label}
                            </span>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="link">URL</Label>
                <Input
                  id="link"
                  type="url"
                  value={formData.link}
                  onChange={(e) =>
                    setFormData({ ...formData, link: e.target.value })
                  }
                  placeholder="https://example.com/resource"
                  required
                />
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {editingResource ? "Updating..." : "Adding..."}
                  </>
                ) : editingResource ? (
                  "Update Resource"
                ) : (
                  "Add Resource"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, resource: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Resource</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;
              {deleteDialog.resource?.title}&rdquo;? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteResource}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Resource
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirmation Dialog */}
      <AlertDialog
        open={confirmationDialog.open}
        onOpenChange={(open) =>
          setConfirmationDialog({
            open,
            title: "",
            description: "",
            action: () => {},
          })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              {confirmationDialog.title}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmationDialog.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                confirmationDialog.action();
                setConfirmationDialog({
                  open: false,
                  title: "",
                  description: "",
                  action: () => {},
                });
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Category Dialog */}
      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Edit Category" : "Add New Category"}
            </DialogTitle>
            <DialogDescription>
              {editingCategory
                ? "Update category details"
                : "Create a new resource category"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCategorySubmit}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="categoryName">Category Name</Label>
                <Input
                  id="categoryName"
                  value={categoryFormData.name}
                  onChange={(e) =>
                    setCategoryFormData({
                      ...categoryFormData,
                      name: e.target.value,
                    })
                  }
                  placeholder="Enter category name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="categoryDescription">Description</Label>
                <Textarea
                  id="categoryDescription"
                  value={categoryFormData.description}
                  onChange={(e) =>
                    setCategoryFormData({
                      ...categoryFormData,
                      description: e.target.value,
                    })
                  }
                  placeholder="Category description"
                  required
                />
              </div>

              <div>
                <Label htmlFor="categorySlug">Slug (optional)</Label>
                <Input
                  id="categorySlug"
                  value={categoryFormData.slug}
                  onChange={(e) =>
                    setCategoryFormData({
                      ...categoryFormData,
                      slug: e.target.value,
                    })
                  }
                  placeholder="category-slug (auto-generated if empty)"
                />
              </div>

              <div>
                <Label htmlFor="categoryIcon">Icon (optional)</Label>
                <Input
                  id="categoryIcon"
                  value={categoryFormData.icon}
                  onChange={(e) =>
                    setCategoryFormData({
                      ...categoryFormData,
                      icon: e.target.value,
                    })
                  }
                  placeholder="Icon name or emoji"
                />
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCategoryDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {editingCategory ? "Updating..." : "Creating..."}
                  </>
                ) : editingCategory ? (
                  "Update Category"
                ) : (
                  "Create Category"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
