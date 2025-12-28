"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { sv } from "@/lib/i18n/sv";

interface CopyLinkButtonProps {
  url: string;
}

export function CopyLinkButton({ url }: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  return (
    <Button
      onClick={handleCopy}
      variant="primary"
      className="gap-2"
    >
      {copied ? (
        <>
          <Check className="h-4 w-4" />
          {sv.dashboard.linkCopied}
        </>
      ) : (
        <>
          <Copy className="h-4 w-4" />
          {sv.dashboard.copyLink}
        </>
      )}
    </Button>
  );
}
