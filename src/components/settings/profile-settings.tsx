"use client";

import { ProfileForm } from "@/components/forms";
import { User } from "@/types";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface ProfileSettingsProps {
  user: User;
  onSubmit: (formData: FormData) => Promise<{ success: boolean; error?: string }>;
}

export function ProfileSettings({ user, onSubmit }: ProfileSettingsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    const result = await onSubmit(formData);
    setIsLoading(false);

    if (result.success) {
      router.refresh();
    }

    return result;
  };

  return <ProfileForm user={user} onSubmit={handleSubmit} isLoading={isLoading} />;
}
