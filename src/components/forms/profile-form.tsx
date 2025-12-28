"use client";

import { useState } from "react";
import Image from "next/image";
import { User } from "@/types";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LabelMono } from "@/components/ui/label-mono";
import { cn, getInitials } from "@/lib/utils";

interface ProfileFormProps {
  user: User;
  onSubmit: (formData: FormData) => Promise<{ error?: string }>;
  isLoading?: boolean;
}

export function ProfileForm({
  user,
  onSubmit,
  isLoading = false,
}: ProfileFormProps) {
  const [formData, setFormData] = useState({
    name: user.name,
    username: user.username,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Namn är obligatoriskt";
    }

    if (!formData.username.trim()) {
      newErrors.username = "Användarnamn är obligatoriskt";
    } else if (!/^[a-z0-9-]+$/.test(formData.username)) {
      newErrors.username = "Endast gemener, siffror och bindestreck";
    } else if (formData.username.length < 3) {
      newErrors.username = "Minst 3 tecken";
    } else if (formData.username.length > 50) {
      newErrors.username = "Max 50 tecken";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const submitData = new FormData();
    submitData.append("name", formData.name);
    submitData.append("username", formData.username);

    const result = await onSubmit(submitData);
    if (result.error) {
      setErrors({ general: result.error });
    }
  };

  const profileUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://boklin.se"}/${formData.username}`;

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Profilinställningar</CardTitle>
          <CardDescription>
            Hantera din profil och bokningslänk
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Avatar Section */}
          <div className="space-y-3">
            <LabelMono>Profilbild</LabelMono>
            <div className="flex items-center gap-4">
              {user.image ? (
                <Image
                  src={user.image}
                  alt={user.name}
                  width={80}
                  height={80}
                  className="w-20 h-20 rounded-full object-cover border-2 border-border-subtle"
                />
              ) : (
                <div
                  className={cn(
                    "w-20 h-20 rounded-full flex items-center justify-center",
                    "bg-accent text-text-light font-bold text-2xl",
                    "border-2 border-border-subtle"
                  )}
                >
                  {getInitials(user.name)}
                </div>
              )}
              <div className="text-sm text-text-dark/60">
                <p>Din profilbild från Google</p>
                <p className="text-xs mt-1">
                  För att ändra, uppdatera din Google-profil
                </p>
              </div>
            </div>
          </div>

          {/* Basic Info Section */}
          <div className="space-y-4">
            <LabelMono>Grundinformation</LabelMono>

            <Input
              label="Namn"
              name="name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              error={errors.name}
              placeholder="Förnamn Efternamn"
              required
            />

            <Input
              label="E-post"
              name="email"
              type="email"
              value={user.email}
              disabled
              hint="E-post kan inte ändras"
              className="opacity-60 cursor-not-allowed"
            />
          </div>

          {/* Username Section */}
          <div className="space-y-4">
            <LabelMono>Bokningslänk</LabelMono>

            <Input
              label="Användarnamn"
              name="username"
              value={formData.username}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  username: e.target.value.toLowerCase(),
                }))
              }
              error={errors.username}
              placeholder="dittnamn"
              hint="Endast gemener, siffror och bindestreck"
              required
            />

            <div className="p-4 bg-panel-slots rounded-md border border-border-subtle">
              <LabelMono size="sm" className="block mb-2">
                Din bokningslänk
              </LabelMono>
              <a
                href={profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "text-accent hover:underline font-mono text-sm break-all",
                  "transition-smooth"
                )}
              >
                {profileUrl}
              </a>
            </div>
          </div>

          {/* Timezone Section */}
          <div className="space-y-4">
            <LabelMono>Tidszon</LabelMono>

            <div className="p-4 bg-panel-slots rounded-md border border-border-subtle">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text-dark">
                    {user.timezone || "Europe/Stockholm"}
                  </p>
                  <p className="text-xs text-text-dark/60 mt-1">
                    Tidszoner hanteras automatiskt för dina bokningar
                  </p>
                </div>
              </div>
            </div>
          </div>

          {errors.general && (
            <p className="text-sm text-error">{errors.general}</p>
          )}
        </CardContent>

        <CardFooter className="gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => window.history.back()}
            disabled={isLoading}
          >
            Avbryt
          </Button>
          <Button type="submit" isLoading={isLoading} disabled={isLoading}>
            Spara ändringar
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
