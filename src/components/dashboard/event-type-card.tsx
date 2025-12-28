"use client";

import { useState } from "react";
import { EventType } from "@/types";
import { Card, CardContent, Button } from "@/components/ui";
import { LabelMono } from "@/components/ui/label-mono";
import { Clock, MapPin, DollarSign, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface EventTypeCardProps {
  eventType: EventType;
  onToggleActive: (id: string) => Promise<{ success: boolean; error?: string }>;
  onDelete: (id: string) => Promise<{ success: boolean; error?: string }>;
}

export function EventTypeCard({
  eventType,
  onToggleActive,
  onDelete,
}: EventTypeCardProps) {
  const [isToggling, setIsToggling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const router = useRouter();

  const handleToggleActive = async () => {
    setIsToggling(true);
    try {
      const result = await onToggleActive(eventType.id);
      if (result.success) {
        router.refresh();
      } else {
        alert(result.error || "Kunde inte uppdatera status");
      }
    } catch {
      alert("Något gick fel");
    } finally {
      setIsToggling(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await onDelete(eventType.id);
      if (result.success) {
        router.refresh();
      } else {
        alert(result.error || "Kunde inte radera mötestyp");
      }
    } catch {
      alert("Något gick fel");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const getLocationLabel = () => {
    if (!eventType.location) return "Ingen plats angiven";
    switch (eventType.location.type) {
      case "in_person":
        return "Personligt möte";
      case "phone":
        return "Telefon";
      case "video":
        return "Videomöte";
      case "custom":
        return "Anpassad";
      default:
        return "Okänd";
    }
  };

  return (
    <Card
      className="relative overflow-hidden transition-all hover:shadow-lg"
      style={{
        borderLeftWidth: "4px",
        borderLeftColor: eventType.color || "#4A5D4E",
      }}
    >
      <CardContent className="space-y-4">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-lg font-bold text-text-dark line-clamp-2">
              {eventType.title}
            </h3>
            <button
              onClick={handleToggleActive}
              disabled={isToggling}
              className="flex-shrink-0 p-1 rounded hover:bg-panel-slots transition-smooth"
              title={eventType.isActive ? "Inaktivera" : "Aktivera"}
            >
              {eventType.isActive ? (
                <Eye className="w-5 h-5 text-accent" />
              ) : (
                <EyeOff className="w-5 h-5 text-text-dark/40" />
              )}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <LabelMono size="sm">
              {eventType.isActive ? "Aktiv" : "Inaktiv"}
            </LabelMono>
          </div>

          {eventType.description && (
            <p className="text-sm text-text-dark/60 line-clamp-2">
              {eventType.description}
            </p>
          )}
        </div>

        {/* Metadata */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-text-dark/70">
            <Clock className="w-4 h-4" />
            <span>{eventType.duration} minuter</span>
          </div>

          <div className="flex items-center gap-2 text-text-dark/70">
            <MapPin className="w-4 h-4" />
            <span>{getLocationLabel()}</span>
          </div>

          {eventType.price && (
            <div className="flex items-center gap-2 text-text-dark/70">
              <DollarSign className="w-4 h-4" />
              <span>{(eventType.price / 100).toFixed(0)} SEK</span>
            </div>
          )}
        </div>

        {/* Actions */}
        {!showDeleteConfirm ? (
          <div className="flex gap-2 pt-2">
            <Link href={`/motestyper/${eventType.id}`} className="flex-1">
              <Button variant="secondary" className="w-full" size="sm">
                <Edit className="w-4 h-4 mr-2" />
                Redigera
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
              className="text-error hover:bg-error/10"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div className="space-y-2 pt-2">
            <p className="text-sm text-error font-medium">
              Är du säker på att du vill radera denna mötestyp?
            </p>
            <div className="flex gap-2">
              <Button
                variant="danger"
                size="sm"
                onClick={handleDelete}
                isLoading={isDeleting}
                className="flex-1"
              >
                Radera
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
              >
                Avbryt
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
