import { auth } from "@/lib/auth";
import { getGoogleAuthUrl } from "@/lib/calendar/google";
import { NextResponse } from "next/server";

/**
 * GET /api/calendar/google
 * Initiate Google Calendar OAuth flow
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Du måste vara inloggad" },
        { status: 401 }
      );
    }

    // Generate OAuth URL with user ID in state
    const authUrl = getGoogleAuthUrl(session.user.id);

    // Redirect to Google OAuth consent screen
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error("Failed to initiate Google Calendar OAuth:", error);
    return NextResponse.json(
      { error: "Kunde inte starta anslutningsprocessen" },
      { status: 500 }
    );
  }
}
