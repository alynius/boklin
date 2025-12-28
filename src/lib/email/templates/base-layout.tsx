import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface BaseLayoutProps {
  preview: string;
  children: React.ReactNode;
}

/**
 * Base email layout with Boklin branding and Nordic Linen styling
 */
export function BaseLayout({ preview, children }: BaseLayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={logo}>Boklin</Heading>
            <Text style={tagline}>Enkel bokningshantering</Text>
          </Section>

          {/* Main Content */}
          <Section style={content}>{children}</Section>

          {/* Footer */}
          <Hr style={hr} />
          <Section style={footer}>
            <Text style={footerText}>
              Detta mail skickades från Boklin, ett bokningssystem för svenska
              frilansare och småföretag.
            </Text>
            <Text style={footerText}>
              <Link href={process.env.NEXT_PUBLIC_APP_URL || "https://boklin.se"} style={footerLink}>
                Besök Boklin
              </Link>
              {" · "}
              <Link href={`${process.env.NEXT_PUBLIC_APP_URL || "https://boklin.se"}/om-oss`} style={footerLink}>
                Om oss
              </Link>
              {" · "}
              <Link href={`${process.env.NEXT_PUBLIC_APP_URL || "https://boklin.se"}/priser`} style={footerLink}>
                Priser
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles adapted from Nordic Linen design system
const main = {
  backgroundColor: "#E5E0D8", // canvas
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", "Inter", Roboto, "Helvetica Neue", Arial, sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "40px 20px",
  maxWidth: "600px",
};

const header = {
  textAlign: "center" as const,
  marginBottom: "32px",
};

const logo = {
  color: "#2A2A2A", // text-dark
  fontSize: "32px",
  fontWeight: "700",
  margin: "0 0 8px 0",
  letterSpacing: "-0.02em",
};

const tagline = {
  color: "#6B6B6B",
  fontSize: "14px",
  margin: "0",
  fontWeight: "400",
};

const content = {
  backgroundColor: "#FCFAF7", // panel-light
  borderRadius: "8px",
  padding: "32px",
};

const hr = {
  borderColor: "#D4CFC7",
  margin: "32px 0",
};

const footer = {
  textAlign: "center" as const,
};

const footerText = {
  color: "#6B6B6B",
  fontSize: "12px",
  lineHeight: "1.6",
  margin: "8px 0",
};

const footerLink = {
  color: "#4A5D4E", // accent
  textDecoration: "underline",
};
