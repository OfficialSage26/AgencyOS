import "server-only";

/**
 * Thin wrapper over the Supabase Storage REST API. Uses the service-role key,
 * so this module must never be imported by client components — uploads and
 * deletes happen inside server actions that have already authorized the caller.
 */

const RAW_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const BASE_URL = RAW_URL.replace(/^["']|["']$/g, "").replace(/\/$/, "");
const SERVICE_KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? "").replace(/^["']|["']$/g, "");
const BUCKET = (process.env.SUPABASE_STORAGE_BUCKET ?? "files").replace(/^["']|["']$/g, "");

function assertConfigured() {
  if (!BASE_URL || !SERVICE_KEY) {
    throw new Error(
      "Storage is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    );
  }
}

function authHeaders() {
  return { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` };
}

/** Public URL for an object path (the bucket is public-read). */
export function publicUrl(path: string): string {
  return `${BASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;
}

/** Recover the object path from a stored public URL (for deletes). */
export function pathFromPublicUrl(url: string): string | null {
  const marker = `/object/public/${BUCKET}/`;
  const idx = url.indexOf(marker);
  return idx === -1 ? null : url.slice(idx + marker.length);
}

/** Upload bytes to `path`. Throws on failure. Returns the public URL. */
export async function uploadObject(
  path: string,
  contentType: string,
  body: Buffer,
): Promise<string> {
  assertConfigured();
  const res = await fetch(`${BASE_URL}/storage/v1/object/${BUCKET}/${path}`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": contentType, "x-upsert": "false" },
    body: new Uint8Array(body),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Upload failed (${res.status}): ${detail.slice(0, 200)}`);
  }
  return publicUrl(path);
}

/** Best-effort delete; resolves false rather than throwing on failure. */
export async function deleteObject(path: string): Promise<boolean> {
  assertConfigured();
  try {
    const res = await fetch(`${BASE_URL}/storage/v1/object/${BUCKET}/${path}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    return res.ok;
  } catch {
    return false;
  }
}
