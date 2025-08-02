"use client";

import React, { useState, useRef } from "react";
import { Header } from "../../components/global/header";
import { Footer } from "../../components/global/footer";
import ReCAPTCHA from "react-google-recaptcha";
import { Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export default function CollaboratePage() {
  const [formData, setFormData] = useState({
    organization: "",
    contactName: "",
    email: "",
    phone: "",
    requestTypes: [] as string[],
    details: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const requestTypes = [
    "Collaboration on an event",
    "Workshop by NodeX",
    "Technical talk or session",
    "Joint project",
    "Other",
  ];

  const handleCheckboxChange = (type: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      requestTypes: checked
        ? [...prev.requestTypes, type]
        : prev.requestTypes.filter((t) => t !== type),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Get reCAPTCHA token
      const token = recaptchaRef.current?.getValue();
      if (!token) {
        alert("Please complete the reCAPTCHA verification.");
        setIsSubmitting(false);
        return;
      }

      const response = await fetch("/api/collaborate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          recaptchaToken: token,
        }),
      });

      if (response.ok) {
        alert(
          "Request submitted successfully! We will get back to you within 3-5 working days."
        );
        setFormData({
          organization: "",
          contactName: "",
          email: "",
          phone: "",
          requestTypes: [],
          details: "",
        });
        recaptchaRef.current?.reset();
      } else {
        alert("Failed to submit request. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center mb-6">
            <h1 className="text-4xl md:text-6xl font-bold">
              Collaboration & Workshop Requests
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto">
            Are you a club, department, faculty member, or organization looking
            to collaborate with NodeX or have us host a workshop, seminar, or
            technical session?
          </p>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center">
                <Mail className="w-6 h-6 mr-3" />
                Request Form
              </CardTitle>
              <p className="text-muted-foreground">
                Please fill out the form below with all necessary details. Our
                Core Committee will review your request and get back to you
                within 3-5 working days.
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="organization">
                      Name of Club / Department / Organization *
                    </Label>
                    <Input
                      id="organization"
                      type="text"
                      required
                      value={formData.organization}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          organization: e.target.value,
                        })
                      }
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="contactName">
                      Point of Contact (Full Name) *
                    </Label>
                    <Input
                      id="contactName"
                      type="text"
                      required
                      value={formData.contactName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contactName: e.target.value,
                        })
                      }
                      className="mt-2"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number (Optional)</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="mt-2"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-base font-medium">
                    Type of Request *
                  </Label>
                  <div className="space-y-3 mt-3">
                    {requestTypes.map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox
                          id={type}
                          checked={formData.requestTypes.includes(type)}
                          onCheckedChange={(checked) =>
                            handleCheckboxChange(type, checked as boolean)
                          }
                        />
                        <Label htmlFor={type} className="text-sm font-normal">
                          {type}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="details">Additional Details</Label>
                  <Textarea
                    id="details"
                    rows={6}
                    value={formData.details}
                    onChange={(e) =>
                      setFormData({ ...formData, details: e.target.value })
                    }
                    placeholder="Provide details about venue, target audience, objectives, expectations, etc."
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label className="text-base font-medium">
                    reCAPTCHA Verification *
                  </Label>
                  <ReCAPTCHA
                    ref={recaptchaRef}
                    sitekey={
                      process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ||
                      "6LdKE04qAAAAAMDV8_dBc8TfU2shWh3Z_CyuF5V4"
                    }
                    onChange={() => {
                      // Token validation happens in handleSubmit
                    }}
                    className="mt-2"
                  />
                </div>

                <div className="text-center">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Request"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}
