"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
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
import { PageLoading } from "@/components/ui/page-loading";
import { useToast } from "@/hooks/use-toast";
import { useActivityLogger } from "@/hooks/useExecActivityLogger";
import {
  Calendar,
  Plus,
  Edit3,
  Trash2,
  Loader2,
  MapPin,
  Clock,
  AlertTriangle,
} from "lucide-react";

interface Event {
  id: string;
  title: string;
  description: string;
  from: string;
  to: string;
  location: string;
  category: string;
  remSpots?: number;
  regLink?: string;
  active: boolean;
  archived: boolean;
  created: string;
  updated: string;
}

interface Recruiter {
  id: string;
  assignee: string;
}

interface ConfirmationDialog {
  open: boolean;
  title: string;
  description: string;
  action: () => void;
}

export default function EventsManagement() {
  const router = useRouter();
  const { toast } = useToast();
  const { logActivity } = useActivityLogger();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [recruiter, setRecruiter] = useState<Recruiter | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    event: Event | null;
  }>({ open: false, event: null });
  const [confirmationDialog, setConfirmationDialog] =
    useState<ConfirmationDialog>({
      open: false,
      title: "",
      description: "",
      action: () => {},
    });
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    from: "",
    to: "",
    location: "",
    category: "",
    remSpots: 0,
    regLink: "",
    active: true,
    archived: false,
  });

  const checkAuthentication = async () => {
    try {
      const response = await fetch("/api/auth-check");
      const data = await response.json();

      if (data.authenticated) {
        setIsAuthenticated(true);
        setRecruiter(data.recruiter);
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

  const fetchEvents = async () => {
    try {
      const response = await fetch("/api/dashboard/events");
      if (response.ok) {
        const data = await response.json();
        setEvents(data.events || []);
      }
    } catch (error) {
      console.error("Failed to fetch events:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuthentication();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchEvents();
    }
  }, [isAuthenticated]);

  const handleCreateEvent = () => {
    setEditingEvent(null);
    setFormData({
      title: "",
      description: "",
      from: "",
      to: "",
      location: "",
      category: "",
      remSpots: 0,
      regLink: "",
      active: true,
      archived: false,
    });
    setDialogOpen(true);
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);

    // Convert PocketBase date format to datetime-local input format
    const formatDateForInput = (dateString: string) => {
      if (!dateString) return "";
      try {
        // Handle different potential date formats from PocketBase
        const date = new Date(dateString);
        // Convert to YYYY-MM-DDTHH:MM format for datetime-local input
        return date.toISOString().slice(0, 16);
      } catch (error) {
        console.error("Date conversion error:", error);
        return "";
      }
    };

    setFormData({
      title: event.title,
      description: event.description,
      from: formatDateForInput(event.from),
      to: formatDateForInput(event.to),
      location: event.location,
      category: event.category,
      remSpots: event.remSpots || 0,
      regLink: event.regLink || "",
      active: event.active,
      archived: event.archived,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = editingEvent
        ? `/api/dashboard/events/${editingEvent.id}`
        : "/api/dashboard/events";
      const method = editingEvent ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const action = editingEvent ? "updated" : "created";

        await logActivity({
          action: editingEvent ? "Update Event" : "Create Event",
          resource_type: "event",
          resource_id: editingEvent?.id,
          details: `Event "${formData.title}" ${action}`,
        });

        toast({
          title: editingEvent ? "Event Updated" : "Event Created",
          description: `Event "${formData.title}" has been ${action} successfully.`,
        });
        setDialogOpen(false);
        fetchEvents();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save event");
      }
    } catch (error) {
      console.error("Error saving event:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to save event",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!deleteDialog.event) return;

    try {
      const response = await fetch(
        `/api/dashboard/events/${deleteDialog.event.id}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        await logActivity({
          action: "Delete Event",
          resource_type: "event",
          resource_id: deleteDialog.event.id,
          details: `Event "${deleteDialog.event.title}" deleted`,
        });

        toast({
          title: "Event Deleted",
          description: `Event "${deleteDialog.event.title}" has been deleted.`,
        });
        setDeleteDialog({ open: false, event: null });
        fetchEvents();
      } else {
        throw new Error("Failed to delete event");
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete event",
      });
    }
  };

  if (loading || isAuthenticated === null) {
    return <PageLoading />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader recruiterName={recruiter?.assignee} />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              Event Management
            </h1>
            <p className="text-muted-foreground">
              Create, edit, and manage NodeX events
            </p>
          </div>
          <Button onClick={handleCreateEvent}>
            <Plus className="w-4 h-4 mr-2" />
            Create Event
          </Button>
        </div>

        {/* Events List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Events ({events.length})
            </CardTitle>
            <CardDescription>
              Manage all NodeX events from this dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            {events.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No events found</p>
                <Button onClick={handleCreateEvent} className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Create your first event
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Date Range</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Spots</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{event.title}</p>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {event.description}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {event.category}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">
                            {new Date(event.from).toLocaleDateString()} -{" "}
                            {new Date(event.to).toLocaleDateString()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{event.location}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {event.remSpots
                            ? `${event.remSpots} left`
                            : "No limit"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              event.active
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {event.active ? "Active" : "Inactive"}
                          </span>
                          {event.archived && (
                            <span className="text-xs px-2 py-1 rounded bg-orange-100 text-orange-800">
                              Archived
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditEvent(event)}
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setConfirmationDialog({
                                open: true,
                                title: "Delete Event",
                                description: `Are you sure you want to delete "${event.title}"? This action cannot be undone.`,
                                action: () => {
                                  setDeleteDialog({ open: true, event });
                                  setConfirmationDialog({
                                    open: false,
                                    title: "",
                                    description: "",
                                    action: () => {},
                                  });
                                },
                              });
                            }}
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

      {/* Create/Edit Event Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingEvent ? "Edit Event" : "Create New Event"}
            </DialogTitle>
            <DialogDescription>
              {editingEvent
                ? "Update event details"
                : "Fill in the event information"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Event Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Enter event title"
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
                  placeholder="Event description"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="from">Start Date & Time</Label>
                  <Input
                    id="from"
                    type="datetime-local"
                    value={formData.from}
                    onChange={(e) =>
                      setFormData({ ...formData, from: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="to">End Date & Time</Label>
                  <Input
                    id="to"
                    type="datetime-local"
                    value={formData.to}
                    onChange={(e) =>
                      setFormData({ ...formData, to: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  placeholder="Event location"
                  required
                />
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  placeholder="Workshop, Seminar, etc."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="remSpots">Remaining Spots (Optional)</Label>
                  <Input
                    id="remSpots"
                    type="number"
                    min="0"
                    value={formData.remSpots}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        remSpots: parseInt(e.target.value) || 0,
                      })
                    }
                    placeholder="50"
                  />
                </div>
                <div>
                  <Label htmlFor="regLink">Registration Link (Optional)</Label>
                  <Input
                    id="regLink"
                    type="url"
                    value={formData.regLink}
                    onChange={(e) =>
                      setFormData({ ...formData, regLink: e.target.value })
                    }
                    placeholder="https://forms.google.com/..."
                  />
                </div>
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
                    {editingEvent ? "Updating..." : "Creating..."}
                  </>
                ) : editingEvent ? (
                  "Update Event"
                ) : (
                  "Create Event"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, event: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{deleteDialog.event?.title}
              &rdquo;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteEvent}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Event
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
    </div>
  );
}
