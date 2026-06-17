"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Check, Copy, ExternalLink, Globe, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  disableClientPortal,
  enableClientPortal,
} from "@/app/dashboard/clients/actions";

export function ClientPortalCard({
  clientId,
  initialToken,
  baseUrl,
}: {
  clientId: string;
  initialToken: string | null;
  baseUrl: string;
}) {
  const [token, setToken] = useState(initialToken);
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();

  const url = token ? `${baseUrl}/portal/${token}` : "";

  function onEnable(regenerate = false) {
    startTransition(async () => {
      const result = await enableClientPortal(clientId, regenerate);
      if (result.ok && result.token) {
        setToken(result.token);
        toast.success(regenerate ? "New link generated" : "Portal enabled");
      } else {
        toast.error(result.error ?? "Something went wrong");
      }
    });
  }

  function onDisable() {
    startTransition(async () => {
      const result = await disableClientPortal(clientId);
      if (result.ok) {
        setToken(null);
        toast.success("Portal disabled");
      } else {
        toast.error(result.error ?? "Something went wrong");
      }
    });
  }

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Couldn't copy — select and copy manually");
    }
  }

  if (!token) {
    return (
      <div className="space-y-3 text-sm">
        <p className="text-muted-foreground">
          Share a secure, read-only link so this client can track their projects, invoices, and
          appointments — no sign-in required.
        </p>
        <Button size="sm" onClick={() => onEnable(false)} disabled={pending}>
          <Globe className="size-4" />
          {pending ? "Enabling…" : "Enable portal"}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3 text-sm">
      <p className="text-muted-foreground">
        Anyone with this link can view the client&apos;s portal. Regenerate to revoke the old link.
      </p>
      <div className="flex items-center gap-2">
        <Input readOnly value={url} className="h-9 font-mono text-xs" aria-label="Portal link" />
        <Button size="icon" variant="outline" onClick={onCopy} aria-label="Copy link">
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="outline"
          render={url ? <a href={url} target="_blank" rel="noreferrer" /> : undefined}
        >
          <ExternalLink className="size-4" />
          Open
        </Button>
        <Button size="sm" variant="outline" onClick={() => onEnable(true)} disabled={pending}>
          <RefreshCw className="size-4" />
          Regenerate
        </Button>
        <Button size="sm" variant="ghost" onClick={onDisable} disabled={pending}>
          Disable
        </Button>
      </div>
    </div>
  );
}
