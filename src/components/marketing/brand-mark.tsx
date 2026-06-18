import { cn } from "@/lib/utils";

/**
 * The AgencyOS logo mark — an indigo→violet rounded tile with a white "A".
 * Brand colors are fixed (they shouldn't shift with theme); size and corner
 * radius come from the className so it can be reused at any scale.
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex shrink-0 overflow-hidden rounded-lg", className)}>
      <svg viewBox="0 0 52 52" width="100%" height="100%" fill="none" aria-hidden="true">
        <rect width="52" height="52" fill="#6d4aff" />
        <polygon points="0,52 52,0 52,52" fill="#a259ff" />
        <polygon points="26,14 38,38 14,38" fill="#fff" />
        <rect x="21" y="32" width="10" height="6" fill="#6d4aff" />
      </svg>
    </span>
  );
}
