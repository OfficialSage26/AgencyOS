"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { addClientNote, initialActionState } from "@/app/dashboard/clients/actions";

export function AddNoteForm({ clientId }: { clientId: string }) {
  const action = addClientNote.bind(null, clientId);
  const [state, formAction, pending] = useActionState(action, initialActionState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) {
      toast.success("Note added");
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-2">
      <Textarea name="content" placeholder="Add a note about this client…" rows={3} required />
      {state.error && <p className="text-destructive text-sm">{state.error}</p>}
      <div className="flex justify-end">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Adding…" : "Add note"}
        </Button>
      </div>
    </form>
  );
}
