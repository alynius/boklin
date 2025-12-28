import { NextRequest, NextResponse } from "next/server";
import {
  exchangeCodeForTokens,
  getCalendarEmail,
} from "@/lib/calendar/google";
import { saveCalendarConnection } from "@/lib/db/queries/calendar";

/**
 * GET /api/calendar/google/callback
 * Handle Google Calendar OAuth callback
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    // Check if user denied access
    if (error === "access_denied") {
      return NextResponse.redirect(
        new URL(
          "/installningar?calendar_error=denied",
          process.env.NEXT_PUBLIC_APP_URL!
        )
      );
    }

    if (error) {
      console.error("Google OAuth error:", error);
      return NextResponse.redirect(
        new URL(
          "/installningar?calendar_error=oauth_failed",
          process.env.NEXT_PUBLIC_APP_URL!
        )
      );
    }

    // Validate required parameters
    if (!code || !state) {
      return NextResponse.redirect(
        new URL(
          "/installningar?calendar_error=invalid_callback",
          process.env.NEXT_PUBLIC_APP_URL!
        )
      );
    }

    // Decode and validate state parameter
    let userId: string;
    try {
      const decodedState = JSON.parse(
        Buffer.from(state, "base64").toString("utf-8")
      );
      userId = decodedState.userId;

      if (!userId) {
        throw new Error("Missing userId in state");
      }
    } catch (error) {
      console.error("Invalid state parameter:", error);
      return NextResponse.redirect(
        new URL(
          "/installningar?calendar_error=invalid_state",
          process.env.NEXT_PUBLIC_APP_URL!
        )
      );
    }

    // Exchange code for tokens
    const { accessToken, refreshToken, expiresAt } =
      await exchangeCodeForTokens(code);

    // Get user's calendar email
    const email = await getCalendarEmail(accessToken);

    // Save connection to database
    await saveCalendarConnection({
      userId,
      provider: "google",
      email,
      accessToken,
      refreshToken,
      expiresAt,
      isPrimary: true,
    });

    // Redirect to settings page with success message
    return NextResponse.redirect(
      new URL(
        "/installningar?calendar_success=true",
        process.env.NEXT_PUBLIC_APP_URL!
      )
    );
  } catch (error) {
    console.error("Failed to handle Google Calendar callback:", error);
    return NextResponse.redirect(
      new URL(
        "/installningar?calendar_error=connection_failed",
        process.env.NEXT_PUBLIC_APP_URL!
      )
    );
  }
}
