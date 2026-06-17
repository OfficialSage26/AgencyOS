"use client";

import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { Download, FileArchive, FileText, ImageIcon, File as FileIcon, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteProjectFile, uploadProjectFile } from "@/app/dashboard/projects/actions";
import { initialActionState } from "@/lib/forms";
import { ALLOWED_MIME_TYPES, MAX_FILE_BYTES, formatBytes } from "@/lib/validations/file";

export type ProjectFileItem = {
  id: string;
  fileName: string;
  fileUrl: string;
  sizeBytes: number | null;
  uploaderName: string | null;
  createdAt: string;
  mimeHint: "image" | "pdf" | "zip" | "other";
};

function FileGlyph({ hint }: { hint: ProjectFileItem["mimeHint"] }) {
  const className = "size-4 text-muted-foreground";
  if (hint === "image") return <ImageIcon className={className} />;
  if (hint === "pdf") return <FileText className={className} />;
  if (hint === "zip") return <FileArchive className={className} />;
  return <FileIcon className={className} />;
}

function UploadForm({ projectId }: { projectId: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");
  const [pending, startTransition] = useTransition();

  function submit(file: File) {
    if (file.size > MAX_FILE_BYTES) {
      toast.error(`File is too large (max ${formatBytes(MAX_FILE_BYTES)}).`);
      return;
    }
    const formData = new FormData();
    formData.set("file", file);
    startTransition(async () => {
      const result = await uploadProjectFile(projectId, initialActionState, formData);
      if (result.ok) {
        toast.success("File uploaded");
        setFileName("");
        if (inputRef.current) inputRef.current.value = "";
      } else {
        toast.error(result.error ?? "Upload failed");
      }
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_MIME_TYPES.join(",")}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            setFileName(file.name);
            submit(file);
          }
        }}
      />
      <Button size="sm" onClick={() => inputRef.current?.click()} disabled={pending}>
        <Upload className="size-4" />
        {pending ? "Uploading…" : "Upload file"}
      </Button>
      <span className="text-muted-foreground truncate text-xs">
        {pending && fileName ? fileName : `Up to ${formatBytes(MAX_FILE_BYTES)} · images, PDF, Office, zip`}
      </span>
    </div>
  );
}

function FileRow({ projectId, file }: { projectId: string; file: ProjectFileItem }) {
  const [pending, startTransition] = useTransition();

  function onDelete() {
    startTransition(async () => {
      const result = await deleteProjectFile(projectId, file.id);
      if (result.ok) toast.success("File deleted");
      else toast.error(result.error ?? "Failed to delete file");
    });
  }

  return (
    <div className="border-border/60 flex items-center gap-3 border-b py-2 last:border-0">
      <FileGlyph hint={file.mimeHint} />
      <div className="min-w-0 flex-1">
        <a
          href={file.fileUrl}
          target="_blank"
          rel="noreferrer"
          className="block truncate text-sm font-medium hover:underline"
        >
          {file.fileName}
        </a>
        <p className="text-muted-foreground text-xs">
          {file.sizeBytes != null ? formatBytes(file.sizeBytes) : "—"}
          {file.uploaderName ? ` · ${file.uploaderName}` : ""} · {file.createdAt}
        </p>
      </div>
      <Button variant="ghost" size="icon-xs" aria-label="Download" render={<a href={file.fileUrl} target="_blank" rel="noreferrer" download />}>
        <Download className="text-muted-foreground size-3.5" />
      </Button>
      <Button
        variant="ghost"
        size="icon-xs"
        aria-label="Delete file"
        onClick={onDelete}
        disabled={pending}
      >
        <Trash2 className="text-muted-foreground size-3.5" />
      </Button>
    </div>
  );
}

export function ProjectFiles({
  projectId,
  files,
}: {
  projectId: string;
  files: ProjectFileItem[];
}) {
  return (
    <div className="space-y-3">
      <UploadForm projectId={projectId} />
      {files.length === 0 ? (
        <p className="text-muted-foreground text-sm">No files yet.</p>
      ) : (
        <div>
          {files.map((file) => (
            <FileRow key={file.id} projectId={projectId} file={file} />
          ))}
        </div>
      )}
    </div>
  );
}
