"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LabelMono } from "@/components/ui/label-mono";
import { Link as LinkIcon, Check, X } from "lucide-react";
import { disconnectCalendarAction } from "@/lib/actions/calendar";
import { useState, useTransition } from "react";

interface IntegrationsSectionProps {
  hasGoogleCalendar?: boolean;
  calendarEmail?: string;
}

export function IntegrationsSection({ hasGoogleCalendar = false, calendarEmail }: IntegrationsSectionProps) {
  const [isConnected, setIsConnected] = useState(hasGoogleCalendar);
  const [isPending, startTransition] = useTransition();

  const handleConnectGoogle = () => {
    // Redirect to Google OAuth flow
    window.location.href = "/api/calendar/google";
  };

  const handleDisconnectGoogle = () => {
    if (!confirm("Är du säker på att du vill koppla bort Google Kalender?")) {
      return;
    }

    startTransition(async () => {
      const result = await disconnectCalendarAction();
      if (result.success) {
        setIsConnected(false);
      } else {
        alert(result.error || "Kunde inte koppla bort kalendern");
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <LinkIcon className="w-5 h-5 text-accent" />
          <CardTitle>Integrationer</CardTitle>
        </div>
        <CardDescription>
          Koppla dina kalendrar för automatisk synkronisering
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Google Calendar */}
        <div className="p-4 bg-panel-slots rounded-md border border-border-subtle">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <LabelMono size="sm">Google Kalender</LabelMono>
                {isConnected && (
                  <span className="flex items-center gap-1 text-xs text-accent">
                    <Check className="w-3 h-3" />
                    Ansluten
                  </span>
                )}
              </div>
              <p className="text-sm text-text-dark/60 mt-1">
                {isConnected
                  ? calendarEmail
                    ? `Ansluten som ${calendarEmail}`
                    : "Din Google Kalender är ansluten"
                  : "Synkronisera dina bokningar med Google Kalender"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isConnected ? (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleDisconnectGoogle}
                  disabled={isPending}
                >
                  <X className="w-4 h-4 mr-1" />
                  Koppla bort
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleConnectGoogle}
                  disabled={isPending}
                >
                  Koppla
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Placeholder for future integrations */}
        <div className="p-4 bg-panel-slots rounded-md border border-border-subtle opacity-60">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <LabelMono size="sm">Outlook Kalender</LabelMono>
              <p className="text-sm text-text-dark/60 mt-1">
                Kommer snart
              </p>
            </div>
            <Button variant="secondary" size="sm" disabled>
              Koppla
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
