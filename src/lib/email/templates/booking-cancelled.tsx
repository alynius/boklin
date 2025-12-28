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

interface BookingCancelledEmailProps {
  guestName: string;
  eventTitle: string;
  startTime: Date;
  endTime: Date;
  duration: number; // minutes
  hostName: string;
  hostEmail: string;
  username: string;
  eventSlug: string;
  cancelReason?: string;
}

/**
 * Email sent to guest when booking is cancelled
 */
export function BookingCancelledEmail({
  guestName,
  eventTitle,
  startTime,
  endTime,
  duration,
  hostName,
  hostEmail,
  username,
  eventSlug,
  cancelReason,
}: BookingCancelledEmailProps) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://boklin.se";
  const rebookUrl = `${appUrl}/${username}/${eventSlug}`;

  const formattedDate = format(startTime, "EEEE d MMMM yyyy", { locale: svLocale });
  const formattedTime = format(startTime, "HH:mm", { locale: svLocale });
  const formattedEndTime = format(endTime, "HH:mm", { locale: svLocale });

  return (
    <BaseLayout
      preview={`Din bokning av ${eventTitle} med ${hostName} har avbokats`}
    >
      <Heading style={h1}>Bokning avbokad</Heading>

      <Text style={greeting}>Hej {guestName}!</Text>

      <Text style={paragraph}>
        Din bokning av <strong>{eventTitle}</strong> med {hostName} har
        avbokats.
      </Text>

      {/* Cancelled Booking Details */}
      <Section style={detailsCard}>
        <Heading style={h2}>Avbokad bokning</Heading>

        <Section style={detailRow}>
          <Text style={detailLabel}>MÖTESTYP</Text>
          <Text style={detailValue}>{eventTitle}</Text>
        </Section>

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
          <Text style={detailLabel}>MÖTESVÄRD</Text>
          <Text style={detailValue}>
            {hostName} (
            <Link href={`mailto:${hostEmail}`} style={detailLink}>
              {hostEmail}
            </Link>
            )
          </Text>
        </Section>

        {cancelReason && (
          <Section style={detailRow}>
            <Text style={detailLabel}>ANLEDNING</Text>
            <Text style={detailValue}>{cancelReason}</Text>
          </Section>
        )}
      </Section>

      {/* Rebook Option */}
      <Text style={paragraph}>
        Vill du boka ett nytt möte med {hostName}? Använd länken nedan för att
        hitta en ny tid som passar dig.
      </Text>

      <Section style={buttonContainer}>
        <Button href={rebookUrl} style={primaryButton}>
          Boka nytt möte
        </Button>
      </Section>

      <Text style={footNote}>
        Har du frågor? Kontakta{" "}
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

export default BookingCancelledEmail;
