"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteEventTypeAction } from "@/lib/actions";
import { Button } from "@/components/ui";
import { Trash2 } from "lucide-react";

interface DeleteEventTypeButtonProps {
  eventTypeId: string;
}

export function DeleteEventTypeButton({ eventTypeId }: DeleteEventTypeButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteEventTypeAction(eventTypeId);
      if (result.success) {
        router.push("/motestyper");
        router.refresh();
      } else {
        alert(result.error || "Kunde inte radera mötestyp");
      }
    } catch {
      alert("Något gick fel");
    } finally {
      setIsDeleting(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="flex gap-2">
        <Button
          variant="danger"
          size="sm"
          onClick={handleDelete}
          isLoading={isDeleting}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Bekräfta radering
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowConfirm(false)}
          disabled={isDeleting}
        >
          Avbryt
        </Button>
      </div>
    );
  }

  return (
    <Button variant="ghost" size="sm" onClick={() => setShowConfirm(true)}>
      <Trash2 className="w-4 h-4 mr-2" />
      Radera
    </Button>
  );
}
