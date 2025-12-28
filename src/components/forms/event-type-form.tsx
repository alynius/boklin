"use client";

import { useState } from "react";
import { EventType, EventLocationType } from "@/types";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LabelMono } from "@/components/ui/label-mono";
import { cn, slugify } from "@/lib/utils";

interface EventTypeFormProps {
  eventType?: EventType; // If editing
  onSubmit: (formData: FormData) => Promise<{ error?: string }>;
  isLoading?: boolean;
}

const DURATION_OPTIONS = [15, 30, 45, 60, 90, 120];

const LOCATION_TYPES: Array<{ value: EventLocationType; label: string }> = [
  { value: "in_person", label: "Personligt möte" },
  { value: "phone", label: "Telefon" },
  { value: "video", label: "Video" },
  { value: "custom", label: "Anpassad" },
];

const PRESET_COLORS = [
  "#4A5D4E", // accent
  "#2A2A2A", // dark
  "#7C9885", // sage
  "#D4A574", // sand
  "#8B7355", // brown
  "#5D7C8B", // blue
];

export function EventTypeForm({
  eventType,
  onSubmit,
  isLoading = false,
}: EventTypeFormProps) {
  const [formData, setFormData] = useState({
    title: eventType?.title || "",
    slug: eventType?.slug || "",
    description: eventType?.description || "",
    duration: eventType?.duration || 30,
    price: eventType?.price ? (eventType.price / 100).toString() : "", // Convert from öre to SEK
    locationType: (eventType?.location?.type || "video") as EventLocationType,
    locationDetails: eventType?.location?.link || eventType?.location?.address || eventType?.location?.phone || eventType?.location?.instructions || "",
    color: eventType?.color || PRESET_COLORS[0],
    requiresConfirmation: eventType?.requiresConfirmation || false,
    bufferBefore: eventType?.bufferBefore || 0,
    bufferAfter: eventType?.bufferAfter || 0,
    minNotice: eventType?.minNotice || 24,
    maxFuture: eventType?.maxFuture || 60,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(!!eventType);

  // Auto-generate slug from title (derived state instead of effect)
  const autoSlug = !isSlugManuallyEdited && formData.title ? slugify(formData.title) : formData.slug;

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Titel är obligatorisk";
    }

    if (!formData.slug.trim()) {
      newErrors.slug = "URL-slug är obligatorisk";
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = "Endast gemener, siffror och bindestreck";
    }

    if (formData.price && isNaN(Number(formData.price))) {
      newErrors.price = "Priset måste vara ett nummer";
    }

    if (formData.bufferBefore < 0 || formData.bufferBefore > 60) {
      newErrors.bufferBefore = "Buffert måste vara mellan 0-60 minuter";
    }

    if (formData.bufferAfter < 0 || formData.bufferAfter > 60) {
      newErrors.bufferAfter = "Buffert måste vara mellan 0-60 minuter";
    }

    if (formData.minNotice < 1 || formData.minNotice > 168) {
      newErrors.minNotice = "Måste vara mellan 1-168 timmar";
    }

    if (formData.maxFuture < 7 || formData.maxFuture > 90) {
      newErrors.maxFuture = "Måste vara mellan 7-90 dagar";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const submitData = new FormData();
    submitData.append("title", formData.title);
    submitData.append("slug", formData.slug);
    submitData.append("description", formData.description);
    submitData.append("duration", formData.duration.toString());

    // Convert SEK to öre (cents)
    if (formData.price) {
      const priceInOre = Math.round(Number(formData.price) * 100);
      submitData.append("price", priceInOre.toString());
    }

    // Build location object
    const location: {
      type: EventLocationType;
      address?: string;
      phone?: string;
      link?: string;
      instructions?: string;
    } = { type: formData.locationType };
    if (formData.locationDetails) {
      switch (formData.locationType) {
        case "in_person":
          location.address = formData.locationDetails;
          break;
        case "phone":
          location.phone = formData.locationDetails;
          break;
        case "video":
          location.link = formData.locationDetails;
          break;
        case "custom":
          location.instructions = formData.locationDetails;
          break;
      }
    }
    submitData.append("location", JSON.stringify(location));

    submitData.append("color", formData.color);
    submitData.append("requiresConfirmation", formData.requiresConfirmation.toString());
    submitData.append("bufferBefore", formData.bufferBefore.toString());
    submitData.append("bufferAfter", formData.bufferAfter.toString());
    submitData.append("minNotice", formData.minNotice.toString());
    submitData.append("maxFuture", formData.maxFuture.toString());

    const result = await onSubmit(submitData);
    if (result.error) {
      setErrors({ general: result.error });
    }
  };

  const getLocationPlaceholder = () => {
    switch (formData.locationType) {
      case "in_person":
        return "T.ex. Kungsgatan 10, Stockholm";
      case "phone":
        return "T.ex. +46 70 123 45 67";
      case "video":
        return "T.ex. https://meet.google.com/abc-defg-hij";
      case "custom":
        return "Instruktioner för att ansluta...";
      default:
        return "";
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>
            {eventType ? "Redigera mötestyp" : "Skapa ny mötestyp"}
          </CardTitle>
          <CardDescription>
            Konfigurera dina mötesinställningar och tillgänglighet
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* Basic Info Section */}
          <div className="space-y-4">
            <LabelMono>Grundinformation</LabelMono>

            <Input
              label="Titel"
              name="title"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              error={errors.title}
              placeholder="T.ex. Konsultation 30 min"
              required
            />

            <Input
              label="URL-slug"
              name="slug"
              value={autoSlug}
              onChange={(e) => {
                setIsSlugManuallyEdited(true);
                setFormData((prev) => ({ ...prev, slug: e.target.value }));
              }}
              error={errors.slug}
              hint="Används i bokningslänken: boklin.se/dittnamn/slug"
              placeholder="konsultation-30"
              required
            />

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-text-dark mb-1.5"
              >
                Beskrivning
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={4}
                className={cn(
                  "w-full px-4 py-2.5 bg-panel-light border border-border-subtle rounded-md text-text-dark placeholder:text-text-dark/40",
                  "focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent",
                  "transition-smooth resize-vertical"
                )}
                placeholder="Beskriv vad mötet handlar om..."
              />
            </div>
          </div>

          {/* Duration & Pricing Section */}
          <div className="space-y-4">
            <LabelMono>Längd och pris</LabelMono>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="duration"
                  className="block text-sm font-medium text-text-dark mb-1.5"
                >
                  Längd (minuter)
                </label>
                <select
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      duration: Number(e.target.value),
                    }))
                  }
                  className={cn(
                    "w-full px-4 py-2.5 bg-panel-light border border-border-subtle rounded-md text-text-dark",
                    "focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent",
                    "transition-smooth"
                  )}
                >
                  {DURATION_OPTIONS.map((duration) => (
                    <option key={duration} value={duration}>
                      {duration} min
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Pris (SEK)"
                name="price"
                type="number"
                value={formData.price}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, price: e.target.value }))
                }
                error={errors.price}
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          {/* Location Section */}
          <div className="space-y-4">
            <LabelMono>Plats</LabelMono>

            <div>
              <label
                htmlFor="locationType"
                className="block text-sm font-medium text-text-dark mb-1.5"
              >
                Platstyp
              </label>
              <select
                id="locationType"
                name="locationType"
                value={formData.locationType}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    locationType: e.target.value as EventLocationType,
                    locationDetails: "",
                  }))
                }
                className={cn(
                  "w-full px-4 py-2.5 bg-panel-light border border-border-subtle rounded-md text-text-dark",
                  "focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent",
                  "transition-smooth"
                )}
              >
                {LOCATION_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Platsdetaljer"
              name="locationDetails"
              value={formData.locationDetails}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  locationDetails: e.target.value,
                }))
              }
              placeholder={getLocationPlaceholder()}
            />
          </div>

          {/* Appearance Section */}
          <div className="space-y-4">
            <LabelMono>Utseende</LabelMono>

            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">
                Färg
              </label>
              <div className="flex gap-3">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, color }))
                    }
                    className={cn(
                      "w-10 h-10 rounded-md transition-smooth",
                      "focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2",
                      formData.color === color && "ring-2 ring-accent ring-offset-2"
                    )}
                    style={{ backgroundColor: color }}
                    aria-label={`Välj färg ${color}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Settings Section */}
          <div className="space-y-4">
            <LabelMono>Inställningar</LabelMono>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.requiresConfirmation}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    requiresConfirmation: e.target.checked,
                  }))
                }
                className={cn(
                  "w-5 h-5 rounded border-border-subtle text-accent",
                  "focus:ring-2 focus:ring-accent focus:ring-offset-2",
                  "transition-smooth cursor-pointer"
                )}
              />
              <span className="text-sm text-text-dark">
                Kräver bekräftelse innan bokning
              </span>
            </label>
          </div>

          {/* Buffer Times Section */}
          <div className="space-y-4">
            <LabelMono>Bufferttider</LabelMono>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Buffert före (minuter)"
                name="bufferBefore"
                type="number"
                value={formData.bufferBefore}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    bufferBefore: Number(e.target.value),
                  }))
                }
                error={errors.bufferBefore}
                min="0"
                max="60"
              />

              <Input
                label="Buffert efter (minuter)"
                name="bufferAfter"
                type="number"
                value={formData.bufferAfter}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    bufferAfter: Number(e.target.value),
                  }))
                }
                error={errors.bufferAfter}
                min="0"
                max="60"
              />
            </div>
          </div>

          {/* Booking Window Section */}
          <div className="space-y-4">
            <LabelMono>Bokningsfönster</LabelMono>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Minsta framförhållning (timmar)"
                name="minNotice"
                type="number"
                value={formData.minNotice}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    minNotice: Number(e.target.value),
                  }))
                }
                error={errors.minNotice}
                hint="T.ex. 24 timmar i förväg"
                min="1"
                max="168"
              />

              <Input
                label="Max framtid (dagar)"
                name="maxFuture"
                type="number"
                value={formData.maxFuture}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    maxFuture: Number(e.target.value),
                  }))
                }
                error={errors.maxFuture}
                hint="Hur långt fram kan bokas"
                min="7"
                max="90"
              />
            </div>
          </div>

          {errors.general && (
            <p className="text-sm text-error">{errors.general}</p>
          )}
        </CardContent>

        <CardFooter className="gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => window.history.back()}
            disabled={isLoading}
          >
            Avbryt
          </Button>
          <Button type="submit" isLoading={isLoading} disabled={isLoading}>
            {eventType ? "Spara ändringar" : "Skapa mötestyp"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
