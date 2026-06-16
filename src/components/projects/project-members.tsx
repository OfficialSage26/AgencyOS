"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { UserMinus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addProjectMember, removeProjectMember } from "@/app/dashboard/projects/actions";
import type { MemberOption } from "@/components/projects/task-list";

const selectClass =
  "border-input bg-background h-8 flex-1 rounded-md border px-2 text-sm shadow-xs";

export function ProjectMembers({
  projectId,
  members,
  available,
}: {
  projectId: string;
  members: MemberOption[];
  available: MemberOption[];
}) {
  const [selected, setSelected] = useState("");
  const [pending, startTransition] = useTransition();

  function onAdd() {
    if (!selected) return;
    startTransition(async () => {
      const result = await addProjectMember(projectId, selected);
      if (result.ok) {
        toast.success("Member added");
        setSelected("");
      } else {
        toast.error(result.error ?? "Failed to add member");
      }
    });
  }

  function onRemove(userId: string) {
    startTransition(async () => {
      const result = await removeProjectMember(projectId, userId);
      if (result.ok) toast.success("Member removed");
      else toast.error(result.error ?? "Failed to remove member");
    });
  }

  return (
    <div className="space-y-3">
      {available.length > 0 && (
        <div className="flex items-center gap-2">
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className={selectClass}
            aria-label="Add team member"
          >
            <option value="">Add a member…</option>
            {available.map((m) => (
              <option key={m.userId} value={m.userId}>
                {m.name}
              </option>
            ))}
          </select>
          <Button size="sm" onClick={onAdd} disabled={pending || !selected}>
            Add
          </Button>
        </div>
      )}

      {members.length === 0 ? (
        <p className="text-muted-foreground text-sm">No team members assigned.</p>
      ) : (
        <ul className="space-y-1">
          {members.map((m) => (
            <li
              key={m.userId}
              className="border-border/60 flex items-center justify-between border-b py-2 text-sm last:border-0"
            >
              <span>{m.name}</span>
              <Button
                variant="ghost"
                size="icon-xs"
                aria-label={`Remove ${m.name}`}
                onClick={() => onRemove(m.userId)}
                disabled={pending}
              >
                <UserMinus className="text-muted-foreground size-3.5" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
