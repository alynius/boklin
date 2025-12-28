"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AvailabilityEditor } from "@/components/forms";
import { updateAvailabilityAction } from "@/lib/actions";
import type { Availability } from "@/types";

interface AvailabilityPageClientProps {
  availability: Availability[];
}

interface AvailabilityInput {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export function AvailabilityPageClient({
  availability,
}: AvailabilityPageClientProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async (
    slots: AvailabilityInput[]
  ): Promise<{ error?: string }> => {
    setIsLoading(true);

    try {
      // Create FormData to pass to server action
      const formData = new FormData();
      formData.append("slots", JSON.stringify(slots));

      const result = await updateAvailabilityAction(formData);

      if (!result.success) {
        return { error: result.error };
      }

      // Refresh the page data
      router.refresh();

      return {};
    } catch (error) {
      console.error("Failed to save availability:", error);
      return { error: "Kunde inte spara tillgänglighet" };
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AvailabilityEditor
      availability={availability}
      onSave={handleSave}
      isLoading={isLoading}
    />
  );
}
