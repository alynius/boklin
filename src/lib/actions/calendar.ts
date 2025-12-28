"use server";

import { auth } from "@/lib/auth";
import { removeCalendarConnection } from "@/lib/db/queries/calendar";
import { revalidatePath } from "next/cache";

type ActionResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Disconnect Google Calendar
 */
export async function disconnectCalendarAction(): Promise<ActionResult<void>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Du måste vara inloggad" };
    }

    await removeCalendarConnection(session.user.id, "google");

    revalidatePath("/installningar");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Failed to disconnect calendar:", error);
    return { success: false, error: "Kunde inte koppla bort kalendern" };
  }
}
