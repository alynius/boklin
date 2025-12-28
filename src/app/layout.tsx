import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Boklin - Enkel bokningshantering för dig",
    template: "%s | Boklin",
  },
  description:
    "Boklin gör det enkelt för frilansare och småföretag i Sverige att hantera bokningar. Dela din bokningslänk och låt kunderna boka tider som passar.",
  keywords: [
    "bokningssystem",
    "tidsbokning",
    "frilansare",
    "småföretag",
    "Sverige",
    "kalenderbokningar",
    "mötesbokning",
  ],
  authors: [{ name: "Boklin" }],
  creator: "Boklin",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://boklin.se"
  ),
  openGraph: {
    type: "website",
    locale: "sv_SE",
    siteName: "Boklin",
    title: "Boklin - Enkel bokningshantering för dig",
    description:
      "Boklin gör det enkelt för frilansare och småföretag i Sverige att hantera bokningar.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Boklin - Enkel bokningshantering för dig",
    description:
      "Boklin gör det enkelt för frilansare och småföretag i Sverige att hantera bokningar.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sv">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        {children}
        <div className="linen-overlay" aria-hidden="true" />
      </body>
    </html>
  );
}
