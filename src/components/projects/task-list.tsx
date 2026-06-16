"use client";

import { useRef, useTransition } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createTask, deleteTask, setTaskStatus } from "@/app/dashboard/projects/actions";
import { initialActionState } from "@/lib/forms";
import { TASK_STATUSES, TASK_STATUS_LABELS, type TaskStatus } from "@/lib/validations/project";

export type TaskItem = {
  id: string;
  title: string;
  status: TaskStatus;
  dueDate: string | null;
  assigneeName: string | null;
};

export type MemberOption = { userId: string; name: string };

const selectClass = "border-input bg-background h-8 rounded-md border px-2 text-xs shadow-xs";

function AddTaskForm({ projectId, members }: { projectId: string; members: MemberOption[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await createTask(projectId, initialActionState, formData);
      if (result.ok) {
        toast.success("Task added");
        formRef.current?.reset();
      } else {
        toast.error(result.error ?? "Failed to add task");
      }
    });
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} className="flex flex-wrap items-center gap-2">
      <Input name="title" placeholder="Add a task…" required className="h-8 flex-1 text-sm" />
      <select name="status" defaultValue="TODO" className={selectClass} aria-label="Status">
        {TASK_STATUSES.map((s) => (
          <option key={s} value={s}>
            {TASK_STATUS_LABELS[s]}
          </option>
        ))}
      </select>
      <select name="assignedTo" defaultValue="" className={selectClass} aria-label="Assignee">
        <option value="">Unassigned</option>
        {members.map((m) => (
          <option key={m.userId} value={m.userId}>
            {m.name}
          </option>
        ))}
      </select>
      <Input name="dueDate" type="date" className="h-8 w-36 text-xs" aria-label="Due date" />
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Adding…" : "Add"}
      </Button>
    </form>
  );
}

function TaskRow({ projectId, task }: { projectId: string; task: TaskItem }) {
  const [pending, startTransition] = useTransition();

  function onStatusChange(status: string) {
    startTransition(async () => {
      const result = await setTaskStatus(projectId, task.id, status);
      if (!result.ok) toast.error(result.error ?? "Failed to update task");
    });
  }

  function onDelete() {
    startTransition(async () => {
      const result = await deleteTask(projectId, task.id);
      if (result.ok) toast.success("Task deleted");
      else toast.error(result.error ?? "Failed to delete task");
    });
  }

  return (
    <div className="border-border/60 flex items-center gap-3 border-b py-2 last:border-0">
      <select
        value={task.status}
        onChange={(e) => onStatusChange(e.target.value)}
        disabled={pending}
        className={selectClass}
        aria-label="Task status"
      >
        {TASK_STATUSES.map((s) => (
          <option key={s} value={s}>
            {TASK_STATUS_LABELS[s]}
          </option>
        ))}
      </select>
      <span
        className={`flex-1 text-sm ${task.status === "DONE" ? "text-muted-foreground line-through" : ""}`}
      >
        {task.title}
      </span>
      {task.assigneeName && (
        <span className="text-muted-foreground text-xs">{task.assigneeName}</span>
      )}
      {task.dueDate && <span className="text-muted-foreground text-xs">{task.dueDate}</span>}
      <Button
        variant="ghost"
        size="icon-xs"
        aria-label="Delete task"
        onClick={onDelete}
        disabled={pending}
      >
        <Trash2 className="text-muted-foreground size-3.5" />
      </Button>
    </div>
  );
}

export function TaskList({
  projectId,
  tasks,
  members,
}: {
  projectId: string;
  tasks: TaskItem[];
  members: MemberOption[];
}) {
  return (
    <div className="space-y-3">
      <AddTaskForm projectId={projectId} members={members} />
      {tasks.length === 0 ? (
        <p className="text-muted-foreground text-sm">No tasks yet.</p>
      ) : (
        <div>
          {tasks.map((task) => (
            <TaskRow key={task.id} projectId={projectId} task={task} />
          ))}
        </div>
      )}
    </div>
  );
}
