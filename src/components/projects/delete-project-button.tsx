"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { deleteProject } from "@/app/dashboard/projects/actions";

export function DeleteProjectButton({
  projectId,
  projectTitle,
}: {
  projectId: string;
  projectTitle: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function onConfirm() {
    startTransition(async () => {
      const result = await deleteProject(projectId);
      if (result.ok) {
        toast.success("Project deleted");
        router.push("/dashboard/projects");
      } else {
        toast.error(result.error ?? "Failed to delete project");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        aria-label="Delete project"
        className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
      >
        <Trash2 className="size-4" />
        Delete
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete project</DialogTitle>
          <DialogDescription>
            This permanently deletes “{projectTitle}”, its tasks, and team assignments. This cannot
            be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={pending}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={pending}>
            {pending ? "Deleting…" : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
