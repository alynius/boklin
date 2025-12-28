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

interface BookingNotificationEmailProps {
  hostName: string;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  guestNotes?: string;
  eventTitle: string;
  startTime: Date;
  endTime: Date;
  duration: number; // minutes
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
 * Email sent to host when a new booking is created
 */
export function BookingNotificationEmail({
  hostName,
  guestName,
  guestEmail,
  guestPhone,
  guestNotes,
  eventTitle,
  startTime,
  endTime,
  duration,
  location,
  bookingId,
  requiresConfirmation,
}: BookingNotificationEmailProps) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://boklin.se";
  const viewUrl = `${appUrl}/bokningar`;
  const confirmUrl = `${appUrl}/api/bookings/${bookingId}/confirm`;
  const rejectUrl = `${appUrl}/api/bookings/${bookingId}/reject`;

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
      preview={`Ny bokning från ${guestName} för ${eventTitle}`}
    >
      <Heading style={h1}>
        {requiresConfirmation ? "Ny bokningsförfrågan" : "Ny bokning"}
      </Heading>

      <Text style={greeting}>Hej {hostName}!</Text>

      <Text style={paragraph}>
        {requiresConfirmation
          ? `${guestName} har skickat en bokningsförfrågan för ${eventTitle}.`
          : `${guestName} har bokat ${eventTitle}.`}
      </Text>

      {/* Alert Box */}
      {requiresConfirmation && (
        <Section style={alertBox}>
          <Text style={alertText}>
            Denna bokning kräver din bekräftelse. Granska detaljerna nedan och
            bekräfta eller avböj bokningen.
          </Text>
        </Section>
      )}

      {/* Booking Details Card */}
      <Section style={detailsCard}>
        <Heading style={h2}>{eventTitle}</Heading>

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
      </Section>

      {/* Guest Details Card */}
      <Section style={detailsCard}>
        <Heading style={h3}>Gästinformation</Heading>

        <Section style={detailRow}>
          <Text style={detailLabel}>NAMN</Text>
          <Text style={detailValue}>{guestName}</Text>
        </Section>

        <Section style={detailRow}>
          <Text style={detailLabel}>E-POST</Text>
          <Link href={`mailto:${guestEmail}`} style={detailLink}>
            {guestEmail}
          </Link>
        </Section>

        {guestPhone && (
          <Section style={detailRow}>
            <Text style={detailLabel}>TELEFON</Text>
            <Link href={`tel:${guestPhone}`} style={detailLink}>
              {guestPhone}
            </Link>
          </Section>
        )}

        {guestNotes && (
          <Section style={detailRow}>
            <Text style={detailLabel}>MEDDELANDE FRÅN GÄST</Text>
            <Text style={detailValue}>{guestNotes}</Text>
          </Section>
        )}
      </Section>

      {/* Action Buttons */}
      {requiresConfirmation ? (
        <>
          <Section style={buttonContainer}>
            <Button href={confirmUrl} style={primaryButton}>
              Bekräfta bokning
            </Button>
          </Section>

          <Section style={buttonContainer}>
            <Button href={rejectUrl} style={secondaryButton}>
              Avböj bokning
            </Button>
          </Section>
        </>
      ) : (
        <Section style={buttonContainer}>
          <Button href={viewUrl} style={primaryButton}>
            Visa i instrumentpanel
          </Button>
        </Section>
      )}

      <Text style={footNote}>
        Du kan hantera alla dina bokningar i{" "}
        <Link href={viewUrl} style={link}>
          instrumentpanelen
        </Link>
        .
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

const h3 = {
  color: "#2A2A2A",
  fontSize: "18px",
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

const alertBox = {
  backgroundColor: "#FFF8E1",
  border: "1px solid #FFD54F",
  borderRadius: "6px",
  padding: "16px",
  margin: "0 0 24px 0",
};

const alertText = {
  color: "#2A2A2A",
  fontSize: "14px",
  lineHeight: "1.6",
  margin: "0",
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

export default BookingNotificationEmail;
