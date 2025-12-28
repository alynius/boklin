import {
  Button,
  Heading,
  Link,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";
import { BaseLayout } from "./base-layout";
import { format } from "date-fns";
import { sv as svLocale } from "date-fns/locale";

interface BookingConfirmationEmailProps {
  guestName: string;
  eventTitle: string;
  eventDescription?: string;
  startTime: Date;
  endTime: Date;
  duration: number; // minutes
  hostName: string;
  hostEmail: string;
  location?: {
    type: "in_person" | "phone" | "video" | "custom";
    address?: string;
    link?: string;
    phone?: string;
    instructions?: string;
  };
  bookingId: string;
  requiresConfirmation: boolean;
}

/**
 * Email sent to guest after booking is created
 */
export function BookingConfirmationEmail({
  guestName,
  eventTitle,
  eventDescription,
  startTime,
  endTime,
  duration,
  hostName,
  hostEmail,
  location,
  bookingId,
  requiresConfirmation,
}: BookingConfirmationEmailProps) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://boklin.se";
  const cancelUrl = `${appUrl}/avboka/${bookingId}`;
  const calendarUrl = `${appUrl}/api/calendar/${bookingId}.ics`;

  const formattedDate = format(startTime, "EEEE d MMMM yyyy", { locale: svLocale });
  const formattedTime = format(startTime, "HH:mm", { locale: svLocale });
  const formattedEndTime = format(endTime, "HH:mm", { locale: svLocale });

  const getLocationText = () => {
    if (!location) return "Plats ej angiven";

    switch (location.type) {
      case "in_person":
        return location.address || "Fysiskt möte";
      case "phone":
        return `Telefonsamtal: ${location.phone || "Nummer anges senare"}`;
      case "video":
        return location.link ? "Videomöte (länk nedan)" : "Videomöte";
      case "custom":
        return location.instructions || "Se detaljer nedan";
      default:
        return "Plats ej angiven";
    }
  };

  return (
    <BaseLayout
      preview={`Din bokning av ${eventTitle} med ${hostName} är ${requiresConfirmation ? "mottagen" : "bekräftad"}`}
    >
      <Heading style={h1}>
        {requiresConfirmation ? "Bokning mottagen" : "Bokning bekräftad"}
      </Heading>

      <Text style={greeting}>Hej {guestName}!</Text>

      {requiresConfirmation ? (
        <Text style={paragraph}>
          Din bokningsförfrågan har mottagits. {hostName} kommer att granska din
          bokning och återkommer med bekräftelse inom kort.
        </Text>
      ) : (
        <Text style={paragraph}>
          Din bokning är bekräftad! Vi ser fram emot att träffa dig.
        </Text>
      )}

      {/* Booking Details Card */}
      <Section style={detailsCard}>
        <Heading style={h2}>{eventTitle}</Heading>

        {eventDescription && (
          <Text style={description}>{eventDescription}</Text>
        )}

        <Section style={detailRow}>
          <Text style={detailLabel}>DATUM</Text>
          <Text style={detailValue}>{formattedDate}</Text>
        </Section>

        <Section style={detailRow}>
          <Text style={detailLabel}>TID</Text>
          <Text style={detailValue}>
            {formattedTime} - {formattedEndTime} ({duration} minuter)
          </Text>
        </Section>

        <Section style={detailRow}>
          <Text style={detailLabel}>PLATS</Text>
          <Text style={detailValue}>{getLocationText()}</Text>
        </Section>

        {location?.link && (
          <Section style={detailRow}>
            <Text style={detailLabel}>LÄNK</Text>
            <Link href={location.link} style={detailLink}>
              {location.link}
            </Link>
          </Section>
        )}

        {location?.instructions && (
          <Section style={detailRow}>
            <Text style={detailLabel}>INSTRUKTIONER</Text>
            <Text style={detailValue}>{location.instructions}</Text>
          </Section>
        )}

        <Section style={detailRow}>
          <Text style={detailLabel}>MÖTESVÄRD</Text>
          <Text style={detailValue}>
            {hostName} (
            <Link href={`mailto:${hostEmail}`} style={detailLink}>
              {hostEmail}
            </Link>
            )
          </Text>
        </Section>
      </Section>

      {/* Action Buttons */}
      <Section style={buttonContainer}>
        <Button href={calendarUrl} style={primaryButton}>
          Lägg till i kalender
        </Button>
      </Section>

      <Section style={buttonContainer}>
        <Button href={cancelUrl} style={secondaryButton}>
          Avboka möte
        </Button>
      </Section>

      <Text style={footNote}>
        Behöver du ändra något? Kontakta{" "}
        <Link href={`mailto:${hostEmail}`} style={link}>
          {hostName}
        </Link>{" "}
        direkt.
      </Text>
    </BaseLayout>
  );
}

// Styles
const h1 = {
  color: "#2A2A2A",
  fontSize: "24px",
  fontWeight: "700",
  margin: "0 0 24px 0",
  lineHeight: "1.3",
};

const h2 = {
  color: "#2A2A2A",
  fontSize: "20px",
  fontWeight: "600",
  margin: "0 0 16px 0",
  lineHeight: "1.3",
};

const greeting = {
  color: "#2A2A2A",
  fontSize: "16px",
  lineHeight: "1.6",
  margin: "0 0 16px 0",
};

const paragraph = {
  color: "#2A2A2A",
  fontSize: "16px",
  lineHeight: "1.6",
  margin: "0 0 24px 0",
};

const description = {
  color: "#6B6B6B",
  fontSize: "14px",
  lineHeight: "1.6",
  margin: "0 0 24px 0",
};

const detailsCard = {
  backgroundColor: "#EFECE6", // panel-slots
  borderRadius: "6px",
  padding: "24px",
  margin: "24px 0",
};

const detailRow = {
  marginBottom: "16px",
};

const detailLabel = {
  color: "#6B6B6B",
  fontSize: "11px",
  fontWeight: "600",
  letterSpacing: "0.05em",
  textTransform: "uppercase" as const,
  margin: "0 0 4px 0",
  fontFamily: '"JetBrains Mono", monospace',
};

const detailValue = {
  color: "#2A2A2A",
  fontSize: "15px",
  lineHeight: "1.5",
  margin: "0",
};

const detailLink = {
  color: "#4A5D4E",
  textDecoration: "underline",
};

const buttonContainer = {
  margin: "16px 0",
  textAlign: "center" as const,
};

const primaryButton = {
  backgroundColor: "#4A5D4E",
  borderRadius: "6px",
  color: "#FCFAF7",
  fontSize: "15px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 32px",
  transition: "all 0.4s cubic-bezier(0.23, 1, 0.32, 1)",
};

const secondaryButton = {
  backgroundColor: "transparent",
  border: "1px solid #D4CFC7",
  borderRadius: "6px",
  color: "#2A2A2A",
  fontSize: "15px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 32px",
  transition: "all 0.4s cubic-bezier(0.23, 1, 0.32, 1)",
};

const footNote = {
  color: "#6B6B6B",
  fontSize: "13px",
  lineHeight: "1.6",
  margin: "24px 0 0 0",
  textAlign: "center" as const,
};

const link = {
  color: "#4A5D4E",
  textDecoration: "underline",
};

export default BookingConfirmationEmail;
