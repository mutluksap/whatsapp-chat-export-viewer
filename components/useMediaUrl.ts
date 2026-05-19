"use client";

import { useEffect, useState } from "react";
import type { MediaResolverLike } from "@/lib/types";
import { useChat } from "./ChatProvider";

export type ResolvedMedia = {
  url: string;
  mimeType: string;
  width?: number;
  height?: number;
};

/**
 * Resolves a media filename against the active chat's MediaResolver on mount
 * and releases the ref on unmount. While in flight, returns null. Tolerates
 * StrictMode double-mounts: the resolver's refCount keeps blob URLs alive
 * across the synchronous cleanup → setup pair.
 */
export function useMediaUrl(
  filename: string | undefined,
): ResolvedMedia | null {
  const { activeChat } = useChat();
  const resolver: MediaResolverLike | null = activeChat?.mediaResolver ?? null;
  const [resolved, setResolved] = useState<ResolvedMedia | null>(null);

  useEffect(() => {
    if (!filename || !resolver) {
      setResolved(null);
      return;
    }
    let cancelled = false;
    let completed = false;
    setResolved(null);
    resolver.resolve(filename).then((r) => {
      completed = true;
      if (cancelled) {
        // Mounted-then-unmounted before the promise settled — the resolve
        // already bumped a refCount, so balance it with a release.
        if (r) resolver.release(filename);
      } else {
        setResolved(r);
      }
    });
    return () => {
      cancelled = true;
      // If resolve already completed, this hook owns a refCount → release it.
      // If it hasn't, the `cancelled` branch above will release once it does.
      if (completed) resolver.release(filename);
    };
  }, [filename, resolver]);

  return resolved;
}
