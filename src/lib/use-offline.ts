import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { createEntry } from "@/lib/books.functions";
import {
  browserQueueStorage,
  counts,
  discard as discardItem,
  enqueue,
  flush,
  pending,
  retryStuck,
  validateEntry,
  type NewEntryInput,
  type PendingEntry,
} from "@/lib/offline-queue";

/**
 * Whether the app can reach the network right now.
 *
 * `navigator.onLine` only tells you there's *a* network, not that it works, so
 * a failed save also flips this to offline until the browser says otherwise.
 */
export function useOnline() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    setOnline(navigator.onLine);
    const up = () => setOnline(true);
    const down = () => setOnline(false);
    window.addEventListener("online", up);
    window.addEventListener("offline", down);
    return () => {
      window.removeEventListener("online", up);
      window.removeEventListener("offline", down);
    };
  }, []);

  return online;
}

export type OfflineEntries = {
  online: boolean;
  waiting: number;
  stuck: number;
  items: PendingEntry[];
  syncing: boolean;
  /** Saves straight away when online, queues when not. Never throws for being offline. */
  save: (data: NewEntryInput) => Promise<{ queued: boolean }>;
  sync: () => Promise<void>;
  discard: (id: string) => void;
  retryAll: () => void;
};

/**
 * One place that decides whether an entry goes to the server now or waits on
 * the device. Every way of adding an entry goes through `save`, so none of them
 * can lose one.
 */
export function useOfflineEntries(userId: string | null | undefined): OfflineEntries {
  const online = useOnline();
  const queryClient = useQueryClient();
  const addEntry = useServerFn(createEntry);

  const storage = useMemo(() => browserQueueStorage(userId), [userId]);
  const [items, setItems] = useState<PendingEntry[]>([]);
  const [syncing, setSyncing] = useState(false);
  const syncingRef = useRef(false);

  const refresh = useCallback(() => setItems(pending(storage)), [storage]);

  useEffect(refresh, [refresh]);

  const sync = useCallback(async () => {
    // A second run while the first is mid-flight would send the same entry twice.
    if (syncingRef.current) return;
    if (pending(storage).length === 0) return;

    syncingRef.current = true;
    setSyncing(true);
    try {
      const result = await flush(storage, (data) => addEntry({ data }));
      if (result.sent > 0) {
        queryClient.invalidateQueries({ queryKey: ["entries"] });
        queryClient.invalidateQueries({ queryKey: ["insights"] });
      }
    } finally {
      syncingRef.current = false;
      setSyncing(false);
      refresh();
    }
  }, [addEntry, queryClient, refresh, storage]);

  // Try again whenever there's a reason to think it might work now.
  useEffect(() => {
    if (!online) return;
    void sync();
  }, [online, sync]);

  useEffect(() => {
    const onFocus = () => {
      if (navigator.onLine) void sync();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [sync]);

  const save = useCallback(
    async (data: NewEntryInput) => {
      // Bad input is rejected the same way whether online or not, so the owner
      // gets the same message either way.
      const problem = validateEntry(data);
      if (problem) throw new Error(problem);

      // Queue behind anything already waiting, so entries keep their order.
      if (!navigator.onLine || pending(storage).some((item) => !item.stuck)) {
        enqueue(storage, data);
        refresh();
        return { queued: true };
      }

      try {
        await addEntry({ data });
        queryClient.invalidateQueries({ queryKey: ["entries"] });
        queryClient.invalidateQueries({ queryKey: ["insights"] });
        return { queued: false };
      } catch (error) {
        // The connection dropped between the check and the send. Hold it rather
        // than making the owner retype it.
        if (isNetworkError(error)) {
          enqueue(storage, data);
          refresh();
          return { queued: true };
        }
        throw error;
      }
    },
    [addEntry, queryClient, refresh, storage],
  );

  const discard = useCallback(
    (id: string) => {
      discardItem(storage, id);
      refresh();
    },
    [refresh, storage],
  );

  const retryAll = useCallback(() => {
    retryStuck(storage);
    refresh();
    void sync();
  }, [refresh, storage, sync]);

  const { waiting, stuck } = counts(storage);

  return { online, waiting, stuck, items, syncing, save, sync, discard, retryAll };
}

/**
 * A refused save and a lost connection need different handling, and the only
 * signal we get is the error itself. Anything that looks like the request never
 * arrived is treated as a connection problem.
 */
export function isNetworkError(error: unknown): boolean {
  if (typeof navigator !== "undefined" && !navigator.onLine) return true;
  if (!(error instanceof Error)) return false;
  const text = `${error.name} ${error.message}`.toLowerCase();
  return (
    text.includes("failed to fetch") ||
    text.includes("networkerror") ||
    text.includes("network error") ||
    text.includes("load failed") ||
    text.includes("timeout") ||
    text.includes("connection")
  );
}
